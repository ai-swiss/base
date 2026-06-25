// tools/core/route-broker.mjs — route orchestration, extracted from the base-core facade.
//
// Two steps, both over an inventory base-core already owns:
//   1. prepareCorpus — inventory → apply precomputed vectors → DENY PRE-FILTER, applied ONCE upstream of
//      either strategy, so a denied target reaches neither the deterministic floor, nor the embedding recall,
//      nor the refiner's candidate list. Idempotent, so the lexical strategy's own internal deny stays
//      behaviour-preserving.
//   2. routeWithStrategy — choose the strategy (routingStrategy: BOTH models configured → "embedding",
//      else "lexical") and run it. The lexical strategy is the default and the fail-closed target. The
//      embedding strategy (refine ∘ retrieve) is opt-in and FAIL-CLOSED (MECHANISM): resolve, embed,
//      retrieve, refine are wrapped whole — ANY error (model unreachable, no vectors, malformed output)
//      drops to the lexical strategy, never throws, never silent.
//
// Pure over injected dependencies, so it is model-agnostic and testable with stubs — no network, no
// Studio import in core. base-core binds the real inventory, resolvers and trace recorder; router.mjs /
// route-service.mjs are untouched (the model resolution + try/catch live HERE, in the broker layer).

import { resolve as pathResolve } from "node:path";
import { denyFilterResources } from "./route-policy.mjs";
import { agentDirOf, ROUTABLE_KINDS, withRoutedAgent } from "./routing.mjs";
import { routingStrategy, embeddingRouter } from "./router.mjs";
// retrieve.mjs + refine.mjs (and the optional companion packages they import) load LAZILY, only when
// the embedding strategy actually runs (see routeWithStrategy) — so the core/lexical path, and any
// `base validate`, never pull a companion package. A missing companion fails closed to the lexical
// strategy, not a crash (the try/catch below).

/**
 * Build the route broker from its injected dependencies.
 * @param {{
 *   inventoryResources: (root: string, opts?: any) => Promise<any[]>,
 *   applyRoutingVectors: (resources: any[], vectors: any) => any[],
 *   loadRoutingVectors: (root: string) => Promise<any>,
 *   resolveConfig: (root: string) => Promise<any>,
 *   computeRoute: (root: string, request: string, resources: any[], cfg: any, opts?: any) => Promise<any>,
 *   resolveEmbedder: (root: string, ref: string) => Promise<(text: string) => Promise<number[]>>,
 *   resolveModel: (root: string, ref: string) => Promise<{ complete: Function }>,
 *   readRouting: (root: string) => Promise<{ embedding_model?: string, refiner_model?: string, k?: number } | null>,
 *   recordEvent: (root: string, event: any) => Promise<void>,
 *   hashArgs: (args: string[]) => string,
 * }} deps
 */
export function createRouteBroker(deps) {
  const { inventoryResources, applyRoutingVectors, loadRoutingVectors, resolveConfig, computeRoute } = deps;
  const { resolveEmbedder, resolveModel, readRouting, recordEvent, hashArgs } = deps;

  /**
   * Inventory the routable, deny-filtered corpus both strategies route over. `egress` filters the inventory
   * (a confidential / local-only target is never surfaced to a remote model); `rootDeny` is the
   * project-level deny.
   * @param {string} root @param {any} cfg @param {{ egress?: any }} [opts]
   */
  async function prepareCorpus(root, cfg, { egress } = {}) {
    const inventory = applyRoutingVectors(await inventoryResources(root, { egress }), await loadRoutingVectors(root));
    const rootDeny = Array.isArray(cfg.routing?.policy?.deny) ? cfg.routing.policy.deny : [];
    return denyFilterResources(inventory, { rootDeny, routableKinds: ROUTABLE_KINDS, agentDirOf });
  }

  /**
   * @param {string} root @param {string} request @param {any[]} resources @param {any} cfg
   * @param {{ limit?: number, signal?: AbortSignal, embeddingStrategy?: { readRouting?: (root: string) => Promise<any>, resolveEmbedder?: (root: string, ref: string) => Promise<any>, resolveModel?: (root: string, ref: string) => Promise<any> } }} [options]
   */
  async function routeWithStrategy(root, request, resources, cfg, { limit, signal, embeddingStrategy = {} } = {}) {
    // Injectable seams (default to the bound resolvers), so a broker test drives the embedding strategy
    // with stub models and no network — the resolution stays in the broker, but is overridable for tests.
    const readRoutingFn = embeddingStrategy.readRouting ?? readRouting;
    const toEmbedder = embeddingStrategy.resolveEmbedder ?? resolveEmbedder;
    const toModel = embeddingStrategy.resolveModel ?? resolveModel;

    let routing = null;
    try {
      routing = await readRoutingFn(root);
    } catch {
      routing = null; // unreadable settings → the lexical strategy, the safe default
    }

    if (routingStrategy(routing) === "embedding" && routing) {
      try {
        const embed = await toEmbedder(root, routing.embedding_model);
        const model = await toModel(root, routing.refiner_model);
        // Lazy import: the embedding strategy is the ONLY caller, so the optional companion packages
        // these pull (base-ranker-semantic via retrieve, base-llm via refine) never load on the core path.
        const { makeEmbeddingRetriever } = await import("./retrieve.mjs");
        const { makeLlmRefiner } = await import("./refine.mjs");
        // The resource vectors travel ON the corpus (resource.embedding, via applyRoutingVectors in
        // prepareCorpus), so the retriever needs only the query embedder — one vector source, not two.
        const retrieve = makeEmbeddingRetriever({ embed });
        const refine = makeLlmRefiner({ complete: (req, ctx) => model.complete(req, ctx) });
        // The embedding strategy has NO score floor: retrieve hands the top-k UNFILTERED (a weak match
        // still rides through), and the refiner IS the floor — it abstains when no candidate fits. `routing.k`
        // (DEFAULT_ROUTING_K = 10) is intentionally larger than the lexical strategy's `max_candidates` (5):
        // it is the refiner's input count, not an agent shortlist, so recall is wide and the model decides.
        const decision = await embeddingRouter(retrieve, refine, routing.k)(request, resources);
        return { ...decision, strategy: "embedding" };
      } catch (error) {
        // Fail-closed to the lexical strategy. Recorded (not silenced): the owner can see it fell back.
        await recordEvent(root, {
          op: "route",
          action: "search",
          decision: "not_applicable",
          status: "ok",
          args_hash: hashArgs([request]),
          metadata: { strategy_fallback: "embedding->lexical", error: String(error?.message ?? error) },
        });
      }
    }

    return { ...(await computeRoute(root, request, resources, cfg, { limit, signal })), strategy: "lexical" };
  }

  /**
   * The traced public entry: prepare the deny-filtered corpus, route it, journal the outcome. The
   * facade re-exports this with an unchanged signature.
   * @param {string} rootDir @param {string} request
   * @param {{ limit?: number, config?: any, signal?: AbortSignal, egress?: any, embeddingStrategy?: any }} [options]
   */
  async function routeRequest(rootDir, request, { limit, config, signal, egress, embeddingStrategy } = {}) {
    const start = Date.now();
    const root = pathResolve(rootDir);
    try {
      const cfg = config ?? await resolveConfig(root);
      // Egress: route over the egress-filtered inventory (a confidential / local-only target is never
      // surfaced to a remote model). The deny veto is applied ONCE here, upstream of BOTH strategies.
      const resources = await prepareCorpus(root, cfg, { egress });
      // A routed result must always carry a real agent (routing.md, FR-ROUTE-003). The embedding
      // strategy can route a process whose agent was not in the retrieved shortlist; fill it from the
      // full corpus here, covering both strategies (a no-op for the lexical floor, which already does).
      const decision = withRoutedAgent(await routeWithStrategy(root, request, resources, cfg, { limit, signal, embeddingStrategy }), resources);
      await recordEvent(root, {
        op: "route", action: "search", decision: "not_applicable", status: "ok",
        duration_ms: Date.now() - start, args_hash: hashArgs([request]),
        metadata: { status: decision.status, reason_code: decision.reason_code, candidates: decision.candidates.length, strategy: decision.strategy },
      });
      return { request, ...decision };
    } catch (error) {
      await recordEvent(root, {
        op: "route", action: "search", decision: "not_applicable", status: "error",
        duration_ms: Date.now() - start, args_hash: hashArgs([request]), error: String(error?.message ?? error),
      });
      throw error;
    }
  }

  return { prepareCorpus, routeWithStrategy, routeRequest };
}
