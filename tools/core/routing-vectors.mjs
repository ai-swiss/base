// tools/core/routing-vectors.mjs — precompute routing embeddings, a cross-invocation cache (Voie 2 precompute).
//
// The shipped semantic ranker (@ai-swiss/base-ranker-semantic) reads `resource.embedding` when present
// and otherwise embeds the resource text on the fly, caching it IN PROCESS. That cache does not survive
// a CLI invocation, so each `base route` re-embeds the corpus. Precomputing the vectors once (at build
// time) and applying them onto the resources makes routing fast without re-embedding, and keeps the
// vectors deny-aware by construction: only the same routable resources the Router scores are embedded.
//
// The cache is STAMPED (base.routing_vectors.v1): the file names the embedder it was built with and
// each entry carries the hash of the route_text it embedded. A cache that cannot say what it holds
// degrades retrieval silently — an edited use_when or a swapped model would keep serving vectors from
// another world. verifyRoutingVectors turns both drifts into visible facts (stale entries dropped and
// counted, model mismatch surfaced), never a routing failure.
//
// Confidential resources are NEVER embedded at build time: `base build routing-embeddings` may be
// configured with a remote embedder, and the egress promise (a `confidential` resource does not reach
// a remote model) holds on the build path exactly as it holds at query time.
//
// Pure over an INJECTED `embed` (a `(text) => Promise<number[]>`), so it is fully testable without a
// model; the CLI wires a real embedder (Ollama / OpenAI-compatible) from the semantic package.

import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { deriveRoutingSignals, ROUTABLE_KINDS } from "./routing.mjs";

export const ROUTING_VECTORS_FILE = ".ai/routing/embeddings.json";
export const ROUTING_VECTORS_SCHEMA = "base.routing_vectors.v1";

/** Content fingerprint of one route_text — what decides whether a cached vector still applies. */
export function hashRouteText(text) {
  return createHash("sha256").update(String(text ?? ""), "utf8").digest("hex").slice(0, 16);
}

/**
 * Embed each routable resource's `route_text` (its "when to use" signal — exactly what the Router scores,
 * not the whole body). Deprecated/archived resources are skipped, as in routing; `confidential` resources
 * are skipped too (see the header) and counted, so the CLI can say so out loud. Keyed by `path` (stable
 * across runs, unique per resource); each entry carries the route_text hash it was embedded from.
 * Order-independent and deterministic given a deterministic `embed`.
 *
 * `onProgress(done, total, label?)` is called after each embed: the per-resource `await embed` is the
 * worst silent wait in the toolkit (30–120 s on a fresh model), so `base build` feeds it a stderr reporter.
 * @param {Array<{ type: string, path: string, status?: string, confidential?: boolean }>} resources
 * @param {(text: string) => Promise<number[]>} embed
 * @param {{ onProgress?: (done: number, total: number, label?: string) => void }} [opts]
 * @returns {Promise<{ vectors: Record<string, { h: string, v: number[] }>, skippedConfidential: number }>}
 */
export async function precomputeRoutingVectors(resources, embed, { onProgress } = {}) {
  const live = resources.filter((r) => ROUTABLE_KINDS.has(r.type) && r.status !== "deprecated" && r.status !== "archived");
  const skippedConfidential = live.filter((r) => r.confidential === true).length;
  const embeddable = live
    .filter((r) => r.confidential !== true)
    .map((r) => ({ path: r.path, route_text: deriveRoutingSignals(r).route_text }))
    .filter((r) => r.route_text);
  /** @type {Record<string, { h: string, v: number[] }>} */
  const vectors = {};
  let done = 0;
  for (const { path, route_text } of embeddable) {
    vectors[path] = { h: hashRouteText(route_text), v: await embed(route_text) };
    onProgress?.(++done, embeddable.length, path);
  }
  return { vectors, skippedConfidential };
}

/**
 * Apply precomputed vectors onto resources (by `path`), so the semantic ranker reads `resource.embedding`
 * instead of embedding on the fly. Non-mutating; resources without a precomputed vector pass through
 * unchanged (the ranker falls back to on-the-fly, then to no semantic score — never an error).
 * Consumes the VERIFIED bare map (path → vector) that verifyRoutingVectors returns.
 * @param {Array<{ path: string }>} resources
 * @param {Record<string, number[]> | null | undefined} vectors
 */
export function applyRoutingVectors(resources, vectors) {
  if (!vectors) return resources;
  return resources.map((resource) => (vectors[resource.path] ? { ...resource, embedding: vectors[resource.path] } : resource));
}

/**
 * Check a loaded cache against the CURRENT corpus: which vectors still speak for their resource?
 * → { byPath, stale, legacy, embedder }:
 * - `byPath`: the verified bare map applyRoutingVectors consumes (null when nothing usable);
 * - `stale`: paths whose route_text changed since the precompute — dropped, and REPORTED by the
 *   caller (a trace event, a doctor finding), never silently served;
 * - `legacy`: a pre-v1 bare map (no hashes) — trusted as before, but flagged so doctor can suggest
 *   a rebuild (staleness is undetectable in that format);
 * - `embedder`: the `<provider>/<model>` the cache was built with (v1), for the model-mismatch check.
 * @param {Array<{ type: string, path: string, status?: string, [k: string]: any }>} resources
 * @param {any} loaded
 */
export function verifyRoutingVectors(resources, loaded) {
  if (!loaded || typeof loaded !== "object") return { byPath: null, stale: [], legacy: false, embedder: null };
  if (loaded.schema_version !== ROUTING_VECTORS_SCHEMA) {
    // Legacy bare map (path → vector): keep working, flag it.
    return { byPath: loaded, stale: [], legacy: true, embedder: null };
  }
  const entries = loaded.vectors && typeof loaded.vectors === "object" ? loaded.vectors : {};
  /** @type {Record<string, number[]>} */
  const byPath = {};
  const stale = [];
  for (const resource of resources) {
    const entry = entries[resource.path];
    if (!entry || !Array.isArray(entry.v)) continue;
    const current = deriveRoutingSignals(resource).route_text;
    if (entry.h === hashRouteText(current)) byPath[resource.path] = entry.v;
    else stale.push(resource.path);
  }
  return { byPath: Object.keys(byPath).length ? byPath : null, stale, legacy: false, embedder: loaded.embedder ?? null };
}

/**
 * Load the raw embeddings file (v1 envelope or legacy bare map). The I/O adapter for the pure
 * functions above. Tolerant by design: an absent file, parse error, or non-object is just a cache
 * miss (returns null → the ranker embeds on the fly), never a routing failure.
 * @param {string} root @returns {Promise<any | null>}
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
 * Write precomputed vectors as a v1 envelope: the embedder they were built with, their dimension,
 * and the hashed entries. No timestamp — the file is reproducible for one (corpus, embedder) pair.
 * @param {string} root
 * @param {Record<string, { h: string, v: number[] }>} vectors
 * @param {{ embedder?: string | null }} [opts]
 * @returns {Promise<string>} the path written
 */
export async function writeRoutingVectors(root, vectors, { embedder = null } = {}) {
  const file = path.join(root, ROUTING_VECTORS_FILE);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const first = Object.values(vectors)[0];
  const envelope = {
    schema_version: ROUTING_VECTORS_SCHEMA,
    embedder,
    dimension: Array.isArray(first?.v) ? first.v.length : null,
    vectors,
  };
  await fs.writeFile(file, `${JSON.stringify(envelope)}\n`, "utf8");
  return file;
}
