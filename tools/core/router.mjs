// tools/core/router.mjs — the routing seam. One port, two strategies behind it.
//
// BASE routes one of two ways, chosen by configuration, never blended:
//   • the lexical strategy (the deterministic floor) — the harness reads the index (a consigne), with
//     the deterministic keyword router (computeRoute → decideRoute) as the offline floor. Default. No model.
//   • the embedding strategy — embeddings narrow the catalogue to a few candidates, a small LLM refines
//     (pick, or ask the user). Opt-in, on only when an embedding model AND a refiner model are both configured.
//
// The patterns are deliberately textbook — a reader should recognise them at a glance, with no cleverness:
//   • Strategy        — both strategies satisfy the same `Router` port; the caller depends on the port,
//                       never on which strategy ran.
//   • Pipeline        — the embedding strategy is `refine ∘ retrieve`, nothing more.
//   • Ports & Adapters— `Retriever` and `Refiner` are ports; the models are adapters plugged in
//                       (Ollama, OpenAI-compatible). This module imports no model client.
//   • One domain type — `RouteDecision`, produced by both strategies and consumed once.
//
// Pure and dependency-free: composition and selection only. The deterministic floor lives in
// routing.mjs (decideRoute); the adapters live behind the ports; the broker wires them in base-core.

/**
 * The honest routing outcomes — never a fabricated confidence. Identical across both strategies, so the
 * caller compares one type and never branches on which strategy produced it.
 * @typedef {"routed" | "ambiguous" | "needs_clarification" | "out_of_scope"} RouteStatus
 *
 * @typedef {{ id: string, type: string, title?: string | null, path: string }} TargetRef
 *
 * @typedef {object} RouteDecision
 * @property {RouteStatus} status
 * @property {string | null} reason_code
 * @property {TargetRef | null} agent
 * @property {TargetRef | null} process
 * @property {Array<object>} candidates
 * @property {string} explanation
 * @property {string | null} next_question  the disambiguation a strategy asks when it abstains
 */

/**
 * The Strategy port. Both strategies are a `Router`.
 * @callback Router
 * @param {string} request
 * @param {Array<object>} resources  the routable corpus (already deny-filtered upstream)
 * @param {object} [context]
 * @returns {Promise<RouteDecision>}
 *
 * The embedding strategy, stage 1 — broad recall. Narrows the corpus to the `k` best candidates by RANK,
 * never by a tuned similarity value. `k` is a count (how many the refiner sees), not a threshold.
 * @callback Retriever
 * @param {string} query
 * @param {Array<object>} resources
 * @param {number} k
 * @returns {Promise<Array<object>>}  the candidate subset (length ≤ k)
 *
 * The embedding strategy, stage 2 — precision. Reads the few candidates and the query, returns a decision: pick one,
 * or ask the user to disambiguate. The semantic judgement lives here, in a model — not in a number.
 * @callback Refiner
 * @param {string} query
 * @param {Array<object>} candidates
 * @returns {Promise<RouteDecision>}
 */

/**
 * The embedding strategy as a Pipeline: retrieve, then refine. The whole of it — `refine ∘ retrieve`.
 * Returns a `Router`. The empty-corpus and empty-candidate cases are the Refiner's to answer honestly
 * (it sees an empty list and abstains), so this composition stays a single, total expression.
 * @param {Retriever} retrieve
 * @param {Refiner} refine
 * @param {number} k
 * @returns {Router}
 */
export function embeddingRouter(retrieve, refine, k) {
  return async (request, resources) => refine(request, await retrieve(request, resources, k));
}

/**
 * Which routing strategy, from the routing config. The trigger is all-or-nothing: BOTH an embedding model
 * and a refiner model must be configured to reach the embedding strategy — one alone is a misconfiguration,
 * not a half-mode. Absent or partial → the deterministic lexical strategy. (The MECHANISM behind the
 * CONSIGNE: a project that never configures the pair never touches an embedding or an LLM call.)
 * @param {{ embedding_model?: unknown, refiner_model?: unknown } | null | undefined} routing
 * @returns {"lexical" | "embedding"}
 */
export function routingStrategy(routing) {
  return isModelRef(routing?.embedding_model) && isModelRef(routing?.refiner_model) ? "embedding" : "lexical";
}

/** A model reference is a non-empty string id resolved against the shared provider registry. */
function isModelRef(value) {
  return typeof value === "string" && value.trim().length > 0;
}
