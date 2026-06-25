// tools/core/routing-vectors.mjs — precompute routing embeddings, a cross-invocation cache (Phase 6b).
//
// The shipped semantic ranker (@ai-swiss/base-ranker-semantic) reads `resource.embedding` when present
// and otherwise embeds the resource text on the fly, caching it IN PROCESS. That cache does not survive
// a CLI invocation, so each `base route` re-embeds the corpus. Precomputing the vectors once (at build
// time) and applying them onto the resources makes routing fast without re-embedding, and keeps the
// vectors deny-aware by construction: only the same routable resources the Router scores are embedded.
//
// Pure over an INJECTED `embed` (a `(text) => Promise<number[]>`), so it is fully testable without a
// model; the CLI wires a real embedder (Ollama / OpenAI-compatible) from the semantic package.

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { deriveRoutingSignals, ROUTABLE_KINDS } from "./routing.mjs";

export const ROUTING_VECTORS_FILE = ".ai/routing/embeddings.json";

/**
 * Embed each routable resource's `route_text` (its "when to use" signal — exactly what the Router scores,
 * not the whole body). Deprecated/archived resources are skipped, as in routing. Keyed by `path` (stable
 * across runs, unique per resource). Order-independent and deterministic given a deterministic `embed`.
 *
 * `onProgress(done, total, label?)` is called after each embed: the per-resource `await embed` is the
 * worst silent wait in the toolkit (30–120 s on a fresh model), so `base build` feeds it a stderr reporter.
 * @param {Array<{ type: string, path: string, status?: string }>} resources
 * @param {(text: string) => Promise<number[]>} embed
 * @param {{ onProgress?: (done: number, total: number, label?: string) => void }} [opts]
 * @returns {Promise<Record<string, number[]>>} path → vector
 */
export async function precomputeRoutingVectors(resources, embed, { onProgress } = {}) {
  const embeddable = resources
    .filter((r) => ROUTABLE_KINDS.has(r.type) && r.status !== "deprecated" && r.status !== "archived")
    .map((r) => ({ path: r.path, route_text: deriveRoutingSignals(r).route_text }))
    .filter((r) => r.route_text);
  /** @type {Record<string, number[]>} */
  const vectors = {};
  let done = 0;
  for (const { path, route_text } of embeddable) {
    vectors[path] = await embed(route_text);
    onProgress?.(++done, embeddable.length, path);
  }
  return vectors;
}

/**
 * Apply precomputed vectors onto resources (by `path`), so the semantic ranker reads `resource.embedding`
 * instead of embedding on the fly. Non-mutating; resources without a precomputed vector pass through
 * unchanged (the ranker falls back to on-the-fly, then to no semantic score — never an error).
 * @param {Array<{ path: string }>} resources
 * @param {Record<string, number[]> | null | undefined} vectors
 */
export function applyRoutingVectors(resources, vectors) {
  if (!vectors) return resources;
  return resources.map((resource) => (vectors[resource.path] ? { ...resource, embedding: vectors[resource.path] } : resource));
}

/**
 * Load precomputed vectors written by `base build routing-embeddings`. The I/O adapter for the pure
 * functions above. Tolerant by design: an absent file, parse error, or non-object is just a cache miss
 * (returns null → the ranker embeds on the fly), never a routing failure.
 * @param {string} root @returns {Promise<Record<string, number[]> | null>}
 */
export async function loadRoutingVectors(root) {
  try {
    const parsed = JSON.parse(await fs.readFile(path.join(root, ROUTING_VECTORS_FILE), "utf8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Write precomputed vectors to the routing embeddings file (the write side of the cache).
 * @param {string} root @param {Record<string, number[]>} vectors @returns {Promise<string>} the path written
 */
export async function writeRoutingVectors(root, vectors) {
  const file = path.join(root, ROUTING_VECTORS_FILE);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(vectors)}\n`, "utf8");
  return file;
}
