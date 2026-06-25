// The labeled routing eval's PURE scorers (tools/eval/route-eval.mjs) — proven with no corpus and no
// model, the same way report.mjs's summarizeRuns is. These are the grading abstractions every
// measurement rides through, pinned here independent of any model:
//   • the per-case scorer (route = strict agent+process; abstention = honest non-route) + TP/TN aggregation
//   • recall@k (model-INDEPENDENT: the expected process surfaced in the top-k?)
//   • the refiner diagnostic (per-model SHAPE: over-routes vs over-asks — a count, never a target)
//
// Spec coverage: FR-ROUTE-014

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  scoreCase,
  summarizeEval,
  validateGoldenSet,
  runRouteEval,
  failuresOf,
  scoreRecall,
  summarizeRecall,
  runRecallEval,
  recallMissesOf,
  summarizeRefiner,
} from "../tools/eval/route-eval.mjs";

const routed = (agent, process) => ({ status: "routed", agent: { id: agent }, process: { id: process } });
const abstained = (status) => ({ status, agent: null, process: null });

describe("scoreCase — route expectations are graded strictly", () => {
  it("a route is correct only on an exact agent+process match", () => {
    const expected = { query: "q", category: "clear_hit", outcome: "route", agent: "commercial", process: "nouveau-devis" };
    assert.equal(scoreCase(expected, routed("commercial", "nouveau-devis")).correct, true);
    assert.equal(scoreCase(expected, routed("commercial", "relance-client")).correct, false, "wrong process is a miss");
    assert.equal(scoreCase(expected, routed("support", "nouveau-devis")).correct, false, "wrong agent is a miss");
    assert.equal(scoreCase(expected, abstained("out_of_scope")).correct, false, "an abstention on a route is a miss");
  });

  it("a route case is a true_positive (route recall)", () => {
    const expected = { query: "q", category: "clear_hit", outcome: "route", agent: "a", process: "p" };
    assert.equal(scoreCase(expected, routed("a", "p")).kind, "true_positive");
  });
});

describe("scoreCase — abstentions are graded on abstaining correctly", () => {
  it("abstain_ambiguous accepts any honest non-route (ambiguous or needs_clarification)", () => {
    const expected = { query: "q", category: "ambiguous", outcome: "abstain_ambiguous" };
    assert.equal(scoreCase(expected, abstained("ambiguous")).correct, true);
    assert.equal(scoreCase(expected, abstained("needs_clarification")).correct, true);
    assert.equal(scoreCase(expected, routed("commercial", "relance-client")).correct, false, "a confident route is over-routing");
    assert.equal(scoreCase(expected, abstained("ambiguous")).kind, "true_negative");
  });

  it("abstain_out_of_scope requires a real abstention (out_of_scope, or a route-less clarification)", () => {
    const expected = { query: "q", category: "out_of_scope", outcome: "abstain_out_of_scope" };
    assert.equal(scoreCase(expected, abstained("out_of_scope")).correct, true);
    assert.equal(scoreCase(expected, abstained("needs_clarification")).correct, true, "a route-less clarification still abstained");
    assert.equal(scoreCase(expected, routed("a", "p")).correct, false, "routing an out-of-scope query is wrong");
  });
});

describe("summarizeEval — TP/TN and per-category aggregation", () => {
  it("reports overall accuracy, separate TP/TN rates, and per-category breakdown", () => {
    const graded = [
      { category: "clear_hit", verdict: { correct: true, kind: "true_positive" } },
      { category: "clear_hit", verdict: { correct: false, kind: "true_positive" } },
      { category: "out_of_scope", verdict: { correct: true, kind: "true_negative" } },
      { category: "out_of_scope", verdict: { correct: true, kind: "true_negative" } },
    ];
    const r = summarizeEval(graded);
    assert.equal(r.total, 4);
    assert.equal(r.accuracy, 0.75, "3 of 4 correct");
    assert.equal(r.truePositiveRate, 0.5, "1 of 2 routes correct");
    assert.equal(r.trueNegativeRate, 1, "2 of 2 abstentions correct");
    assert.deepEqual(r.byCategory.clear_hit, { total: 2, correct: 1, accuracy: 0.5 });
    assert.deepEqual(r.byCategory.out_of_scope, { total: 2, correct: 2, accuracy: 1 });
  });

  it("an empty run is vacuously perfect (no false claims of failure)", () => {
    const r = summarizeEval([]);
    assert.equal(r.accuracy, 1);
    assert.equal(r.truePositiveRate, 1);
    assert.equal(r.trueNegativeRate, 1);
  });
});

describe("runRouteEval — drives an injected route function and is resilient", () => {
  it("grades every case and a thrown route is one wrong case, not a lost run", async () => {
    const golden = {
      cases: [
        { query: "ok", category: "clear_hit", outcome: "route", agent: "a", process: "p" },
        { query: "boom", category: "clear_hit", outcome: "route", agent: "a", process: "p" },
      ],
    };
    const route = async (q) => {
      if (q === "boom") throw new Error("model unreachable");
      return routed("a", "p");
    };
    const { graded, report } = await runRouteEval(golden, route);
    assert.equal(graded.length, 2, "both cases graded despite the throw");
    assert.equal(report.accuracy, 0.5, "the thrown case is a miss, the run survives");
    assert.equal(failuresOf(graded).length, 1);
  });
});

describe("recall@k — the model-independent structural signal", () => {
  it("scoreRecall hits when the expected process is among the retrieved ids, with its rank", () => {
    const expected = { process: "nouveau-devis" };
    assert.deepEqual(scoreRecall(expected, ["contestation-facture", "nouveau-devis", "relance-client"]), { hit: true, rank: 2 });
    assert.deepEqual(scoreRecall(expected, ["nouveau-devis"]), { hit: true, rank: 1 });
    assert.deepEqual(scoreRecall(expected, ["relance-client", "ticket-incident"]), { hit: false, rank: null });
    assert.deepEqual(scoreRecall(expected, []), { hit: false, rank: null }, "an empty retrieval is a miss, not a throw");
  });

  it("summarizeRecall reports recall@1 AND recall@k, overall + per category", () => {
    const graded = [
      { category: "clear_hit", recall: { hit: true, rank: 1 } }, // ranked first — a recall@1 hit
      { category: "clear_hit", recall: { hit: true, rank: 3 } }, // surfaced, but NOT first — a recall@k hit only
      { category: "clear_hit", recall: { hit: false, rank: null } }, // not surfaced at all
      { category: "multilingual", recall: { hit: true, rank: 1 } },
    ];
    const r = summarizeRecall(graded);
    assert.equal(r.total, 4);
    assert.equal(r.recall, 3 / 4, "three of four surfaced anywhere in the top-k");
    assert.equal(r.recallAt1, 2 / 4, "two of four ranked first — the discriminating signal");
    assert.deepEqual(r.byCategory.clear_hit, { total: 3, hits: 2, top1: 1, recall: 2 / 3, recallAt1: 1 / 3 });
    assert.deepEqual(r.byCategory.multilingual, { total: 1, hits: 1, top1: 1, recall: 1, recallAt1: 1 });
  });

  it("runRecallEval grades only `route` cases and surfaces the misses", async () => {
    const golden = {
      cases: [
        { query: "devis", category: "clear_hit", outcome: "route", agent: "commercial", process: "nouveau-devis" },
        { query: "panne", category: "clear_hit", outcome: "route", agent: "support", process: "ticket-incident" },
        { query: "vente", category: "ambiguous", outcome: "abstain_ambiguous" },
      ],
    };
    // The probe surfaces nouveau-devis for the first query and nothing useful for the second.
    const retrieve = async (q) => (q === "devis" ? ["nouveau-devis", "relance-client"] : ["demande-evolution"]);
    const { graded, report } = await runRecallEval(golden, retrieve);
    assert.equal(graded.length, 2, "the abstention case is not a recall case");
    assert.equal(report.recall, 0.5);
    assert.deepEqual(recallMissesOf(graded).map((m) => m.query), ["panne"]);
  });
});

describe("summarizeRefiner — a per-model diagnostic, the over-routes vs over-asks shape", () => {
  it("counts forced routes (over-routing) and forced clarifications (over-asking) separately", () => {
    const graded = [
      // a route case the refiner asked to clarify instead — over-asking
      { category: "clear_hit", outcome: "route", verdict: { correct: false, kind: "true_positive" } },
      // an abstention case the refiner confidently routed — over-routing
      { category: "ambiguous", outcome: "abstain_ambiguous", verdict: { correct: false, kind: "true_negative" } },
      // a correct route
      { category: "clear_hit", outcome: "route", verdict: { correct: true, kind: "true_positive" } },
    ];
    const diag = summarizeRefiner(graded);
    assert.equal(diag.forcedClarifications, 1, "one route was wrongly asked to clarify");
    assert.equal(diag.forcedRoutes, 1, "one abstention was wrongly routed");
    assert.equal(diag.total, 3);
    assert.equal(diag.accuracy, 1 / 3, "the accuracy is reported, but as a model-dependent diagnostic");
  });
});

describe("validateGoldenSet — a malformed set is not silently run", () => {
  it("rejects a route case with no agent/process, and an invalid outcome", () => {
    assert.throws(() => validateGoldenSet({ cases: [{ query: "q", category: "c", outcome: "route" }] }), /names no agent\/process/);
    assert.throws(() => validateGoldenSet({ cases: [{ query: "q", category: "c", outcome: "nope" }] }), /invalid `outcome`/);
    assert.throws(() => validateGoldenSet({ cases: [] }), /`cases` is empty/);
    assert.throws(() => validateGoldenSet({}), /non-empty `cases`/);
  });

  it("accepts a well-formed set", () => {
    const ok = validateGoldenSet({ corpus: "x", cases: [{ query: "q", category: "c", outcome: "abstain_ambiguous" }] });
    assert.equal(ok.cases.length, 1);
    assert.equal(ok.corpus, "x");
  });
});
