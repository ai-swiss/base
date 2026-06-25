// tools/core/retrieve.mjs — the Retriever adapter (the embedding strategy, stage 1: broad recall by embeddings).
//
// A `Retriever` port implementation (tools/core/router.mjs): `(query, resources, k) => Candidate[]`.
// It embeds the query once, cosine-compares it to each routable resource's PRECOMPUTED vector (the
// `route_text` embedding from routing-vectors.mjs), and returns the top-`k` candidates BY RANK. `k`
// is a COUNT — how many the refiner sees — never a tuned similarity cutoff: a low-similarity match
// still rides through if it is in the top k, because the refiner (stage 2) is the one that decides.
//
// Ports & Adapters: the model is injected as `embed` `(text) => Promise<number[]>` (the real one is
// the configured embedding model, wired by the broker); the precomputed resource vector travels ON the
// resource (`resource.embedding`, placed by applyRoutingVectors). One vector source, not two. This
// module imports no model client and no I/O — it is pure over its one dependency, so it tests with a
// deterministic stub embedder and no network (see tests/retrieve.test.mjs).
//
// Graceful by construction: a resource with no precomputed vector never crashes the recall. It falls
// back to a lexical overlap score against the query (always below any real cosine match), so it ranks
// LAST rather than vanishing — the catalogue stays reachable even before `base build routing-embeddings`.

import { cosineSimilarity, vectorFrom } from "@ai-swiss/base-ranker-semantic";
import { compareByCodePoint } from "./ordering.mjs";
import { normalize } from "./rankers.mjs";
import { deriveRoutingSignals, ROUTABLE_KINDS } from "./routing.mjs";

/**
 * A retrieval Candidate: the resource, its derived `route_text` (the "Quand l'utiliser" signal the
 * refiner reads), the `avoid_text` ("Éviter si"), and the similarity that ranked it (for an
 * explainable trace). The refiner consumes `{ id, route_text, avoid_text }`; the rest travels so the
 * broker can map a chosen candidate back to its full resource.
 * @typedef {{ resource: object, route_text: string, avoid_text: string, similarity: number }} Candidate
 */

/**
 * Build a `Retriever` from an injected embedder. The resource's precomputed `route_text` vector
 * travels on the resource itself (`resource.embedding`, placed by applyRoutingVectors upstream) —
 * a single vector source, so there is no second map to keep in sync.
 * @param {{ embed: (text: string) => Promise<number[]> }} deps
 *   `embed` — the query embedder (the configured embedding model, injected by the broker).
 * @returns {(query: string, resources: Array<object>, k: number) => Promise<Candidate[]>}
 */
export function makeEmbeddingRetriever({ embed }) {
  if (typeof embed !== "function") throw new TypeError("makeEmbeddingRetriever requires an `embed` function");

  return async function retrieve(query, resources, k) {
    const routable = (resources ?? []).filter(isRoutable);
    if (routable.length === 0) return [];

    // Embed the query once. A failure here is the broker's to catch (fail-closed → the lexical strategy); the
    // retriever does not swallow it, so the broker can fall back honestly rather than silently.
    const queryVector = vectorFrom(await embed(String(query ?? "")));
    const queryTerms = lexicalTerms(query);

    const scored = routable.map((resource) => {
      const signals = deriveRoutingSignals(resource);
      const resourceVector = vectorFrom(resource.embedding);
      // A real cosine match (a vector on both sides) ranks above ANY lexical fallback: the lexical
      // score is mapped into [-1, 0), strictly below the [−1, 1] cosine range a vectored match earns
      // and below 0 (a no-vector resource never outranks a genuine, if weak, embedding hit).
      const cosine = queryVector && resourceVector ? cosineSimilarity(queryVector, resourceVector) : null;
      const similarity = cosine ?? lexicalFallbackScore(signals.route_text, queryTerms);
      return { resource, route_text: signals.route_text, avoid_text: signals.avoid_text, similarity };
    });

    // Top-k BY RANK: sort by similarity desc, ties broken by path (deterministic), then slice. No
    // cutoff — even the kth-best rides through; the refiner decides whether any of them actually fits.
    scored.sort((a, b) => b.similarity - a.similarity || compareByCodePoint(a.resource.path, b.resource.path));
    const count = Number.isInteger(k) && k > 0 ? k : scored.length;
    return scored.slice(0, count);
  };
}

/** A routing candidate: an agent or process, never a deprecated/archived one (mirrors the floor). */
function isRoutable(resource) {
  return ROUTABLE_KINDS.has(resource?.type) && resource.status !== "deprecated" && resource.status !== "archived";
}

function lexicalTerms(text) {
  return new Set(normalize(text).split(/[^a-z0-9]+/).filter((w) => w.length >= 2));
}

// Jaccard-ish overlap of the route_text against the query terms, mapped into [-1, 0) so a no-vector
// resource always sorts below a vectored match yet still orders sensibly among other no-vector ones.
// Never throws: an empty route_text or query simply scores the floor (-1).
function lexicalFallbackScore(routeText, queryTerms) {
  if (queryTerms.size === 0) return -1;
  const routeTerms = lexicalTerms(routeText);
  if (routeTerms.size === 0) return -1;
  let hits = 0;
  for (const term of queryTerms) if (routeTerms.has(term)) hits++;
  return hits / queryTerms.size - 1; // overlap 0 → -1, overlap 1 → 0 (still below any real cosine)
}
