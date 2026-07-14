// The routing seam (tools/core/router.mjs): the embedding-strategy trigger and the refine ∘ retrieve pipeline.
// Pure composition — proven with stubs, no model.
//
// Spec coverage: FR-ROUTE-010

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { embeddingRouter, routingStrategy, DEFAULT_ROUTING_K } from "../tools/core/router.mjs";

describe("routingStrategy — the all-or-nothing embedding-strategy trigger", () => {
  it("reaches the embedding strategy only when BOTH models are configured", () => {
    assert.equal(
      routingStrategy({ embedding_model: "ollama/qwen3-embedding:0.6b", refiner_model: "ollama/qwen3:4b" }),
      "embedding",
    );
  });

  it("stays on the lexical strategy when only one model is set — one alone is a misconfiguration, not a half-mode", () => {
    assert.equal(routingStrategy({ embedding_model: "ollama/embed" }), "lexical");
    assert.equal(routingStrategy({ refiner_model: "ollama/llm" }), "lexical");
  });

  it("stays on the lexical strategy when neither, empty, or absent", () => {
    assert.equal(routingStrategy({}), "lexical");
    assert.equal(routingStrategy(null), "lexical");
    assert.equal(routingStrategy(undefined), "lexical");
    assert.equal(routingStrategy({ embedding_model: "  ", refiner_model: "x" }), "lexical");
  });
});

describe("embeddingRouter — the embedding strategy as refine ∘ retrieve", () => {
  const decision = (status) => ({
    status, reason_code: null, agent: null, process: null, candidates: [], explanation: "", next_question: null,
  });

  it("retrieves k candidates, then refines them into the decision", async () => {
    const seen = {};
    const retrieve = async (query, resources, k) => { seen.query = query; seen.k = k; return resources.slice(0, k); };
    const refine = async (_query, candidates) => { seen.refined = candidates; return decision("routed"); };

    const out = await embeddingRouter(retrieve, refine, 10)("préparer un devis", [{ id: "a" }, { id: "b" }, { id: "c" }]);

    assert.equal(out.status, "routed");
    assert.equal(seen.k, 10, "k flows to the retriever as the candidate count");
    assert.equal(seen.query, "préparer un devis");
    assert.deepEqual(seen.refined.map((c) => c.id), ["a", "b", "c"]);
  });

  it("defaults k to DEFAULT_ROUTING_K when omitted — a hand-written config that lacks `k` never leaks undefined to the retriever", async () => {
    const seen = {};
    const retrieve = async (_query, resources, k) => { seen.k = k; return resources; };
    const refine = async () => decision("routed");

    // The broker calls embeddingRouter(retrieve, refine, routing.k); when routing.k is undefined
    // (config written by hand, not by the Studio writer), it must coalesce to the default, NOT undefined
    // (which retrieve.mjs turns into scored.length — the whole corpus sent to the refiner).
    await embeddingRouter(retrieve, refine)("préparer un devis", [{ id: "a" }, { id: "b" }]);
    assert.equal(seen.k, DEFAULT_ROUTING_K, "omitted k coalesces to DEFAULT_ROUTING_K, not undefined");

    await embeddingRouter(retrieve, refine, undefined)("préparer un devis", [{ id: "a" }]);
    assert.equal(seen.k, DEFAULT_ROUTING_K, "explicit undefined k coalesces to DEFAULT_ROUTING_K too");
  });

  it("hands an empty candidate set to the refiner, which abstains honestly", async () => {
    const retrieve = async () => [];
    const refine = async (_query, candidates) => decision(candidates.length ? "routed" : "out_of_scope");

    const out = await embeddingRouter(retrieve, refine, 10)("rien de pertinent", []);
    assert.equal(out.status, "out_of_scope");
  });
});
