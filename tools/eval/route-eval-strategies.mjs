// tools/eval/route-eval-strategies.mjs — wire the eval's measurements onto the real corpus + models, as
// `(query) => …` functions route-eval.mjs can score. Kept apart from the pure scorer so route-eval.mjs
// imports no base-core, no model client; this is the adapter layer that binds the real corpus and models.
//
// Three builders, in order of trust:
//   • makeRecallProbe — the model-INDEPENDENT signal: embed the query, RETRIEVE over the deny-filtered
//     corpus, return the candidate process ids (no refiner). recall@k rides on this.
//   • makeEmbeddingRoute — the full retrieve∘refine for the per-model refiner diagnostic, with a real
//     embedder + refiner, surfacing errors instead of swallowing them (an eval must see a failure).
//   • makeAgentRouteForCorpus — the AGENT-IN-THE-LOOP route: render the SAME index the harness reads over
//     the deny-filtered corpus, bind a real model, and let it navigate the index exactly as Claude Code
//     would. The lived-route diagnostic rides on this.

import { inventoryResources, resolveConfig } from "../base-core.mjs";
import { applyRoutingVectors } from "../core/routing-vectors.mjs";
import { denyFilterResources } from "../core/route-policy.mjs";
import { agentDirOf, ROUTABLE_KINDS, buildRoutingRegistry } from "../core/routing.mjs";
import { renderRoutingIndex } from "../core/index-md.mjs";
import { embeddingRouter } from "../core/router.mjs";
import { makeEmbeddingRetriever } from "../core/retrieve.mjs";
import { makeLlmRefiner } from "../core/refine.mjs";
import { makeAgentRoute, navigableCorpus } from "./route-eval-agent.mjs";

// The deny-filtered routable corpus the eval routes over — prepared ONCE for the whole run (the corpus
// is constant across queries), mirroring the broker's prepareCorpus so the eval routes over the exact
// corpus production does. Vectors are not loaded from disk: the eval precomputes its own in memory with
// the configured embedder (so it works before `base build routing-embeddings`).
async function prepareCorpus(root) {
  const cfg = await resolveConfig(root);
  const inventory = /** @type {any[]} */ (await inventoryResources(root));
  const rootDeny = Array.isArray(cfg.routing?.policy?.deny) ? cfg.routing.policy.deny : [];
  const resources = denyFilterResources(inventory, { rootDeny, routableKinds: ROUTABLE_KINDS, agentDirOf });
  return { cfg, resources, rootDeny };
}

/**
 * The embedding models the eval's refiner leg drives: a query embedder, a refiner `complete` (a
 * LanguageModel's `.complete`), and the candidate count `k`.
 * @typedef {{ embed: (text: string) => Promise<number[]>, complete: (request: object, ctx?: object) => Promise<{ message: object }>, k?: number }} EmbeddingModels
 */

/**
 * Build a recall@k probe: embed the query, run the embedding RETRIEVER over the deny-filtered corpus,
 * and return the candidate PROCESS ids in rank order. No refiner — this is the model-INDEPENDENT
 * structural signal (does retrieval surface the right candidate?), so it takes only an embedder. The
 * corpus vectors are precomputed in memory with that same embedder, exactly as the embedding strategy does.
 * @param {string} root @param {{ embed: (text: string) => Promise<number[]>, k?: number }} models
 * @returns {Promise<(query: string) => Promise<string[]>>}
 */
export async function makeRecallProbe(root, { embed, k = 10 }) {
  const { precomputeRoutingVectors } = await import("../core/routing-vectors.mjs");
  const { resources } = await prepareCorpus(root);
  const vectors = await precomputeRoutingVectors(resources, embed);
  const withVectors = applyRoutingVectors(resources, vectors);
  const retrieve = makeEmbeddingRetriever({ embed });
  return async (query) => {
    const candidates = await retrieve(query, withVectors, k);
    return candidates.filter((c) => c.resource.type === "process").map((c) => c.resource.id);
  };
}

/**
 * Build the full retrieve∘refine route function from a real embedder + refiner — the per-model refiner
 * diagnostic rides on this. The routing vectors are precomputed IN MEMORY with the embedder (so the
 * eval works before `base build routing-embeddings` has been run), reusing the same `route_text` the
 * Router scores, so the eval embeds exactly what production embeds. Errors are NOT swallowed.
 * @param {string} root @param {EmbeddingModels} models
 * @returns {Promise<(query: string) => Promise<object>>}
 */
export async function makeEmbeddingRoute(root, { embed, complete, k = 10 }) {
  const { precomputeRoutingVectors } = await import("../core/routing-vectors.mjs");
  const { resources } = await prepareCorpus(root);
  const vectors = await precomputeRoutingVectors(resources, embed);
  const withVectors = applyRoutingVectors(resources, vectors);
  const retrieve = makeEmbeddingRetriever({ embed });
  const refine = makeLlmRefiner({ complete });
  const router = embeddingRouter(retrieve, refine, k);
  return (query) => router(query, withVectors);
}

/**
 * Build the AGENT-IN-THE-LOOP route function: render the routing index over the SAME deny-filtered corpus
 * the harness reads (root index → each agent index, with «Quand l'utiliser» / «Éviter si»), concatenate
 * it as the harness sees the `.ai/routing` tree, and bind a real model that navigates it. The index and
 * the navigable corpus come from the SAME `buildRoutingRegistry` the production index build uses, so the
 * ids the model reads in the index are exactly the ids a route is accepted against. Errors are NOT
 * swallowed. No embedder — this path is the LLM reading the index, not retrieval.
 * @param {string} root @param {{ complete: (request: object, ctx?: object) => Promise<{ message: object }>, jsonMode?: boolean }} models
 * @returns {Promise<(query: string) => Promise<object>>}
 */
export async function makeAgentRouteForCorpus(root, { complete, jsonMode = false }) {
  const { resources, rootDeny } = await prepareCorpus(root);
  const registry = buildRoutingRegistry(resources);
  const files = renderRoutingIndex(registry, { rootDeny });
  const indexContent = concatIndex(files);
  const corpus = navigableCorpus(registry);
  return makeAgentRoute({ complete, indexContent, corpus, jsonMode });
}

// Concatenate the rendered index tree into the single document the harness reads as it descends root →
// agent: the root index first, then each agent index in path order. The map is { relPath → markdown };
// the root index (`.ai/routing/index.md`) leads, the agent indexes follow sorted by path (deterministic,
// matching the registry's agent order).
function concatIndex(files) {
  const ROOT = ".ai/routing/index.md";
  const order = Object.keys(files).sort((a, b) => (a === ROOT ? -1 : b === ROOT ? 1 : a < b ? -1 : a > b ? 1 : 0));
  return order.map((rel) => files[rel]).join("\n");
}
