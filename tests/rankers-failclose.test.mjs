// Spec coverage: FR-RANK-001
// composeRankers is fail-closed: a ranker that throws (synchronously or via a rejected promise)
// degrades to a zero contribution, so the deterministic lexical floor survives a broken optional
// ranker and routing never propagates the error to the caller. Before this, a throwing ranker was not
// caught (rankers.mjs) and the broker re-threw it (base-core.mjs), so the "byte-identical to the floor"
// guarantee held nowhere.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composeRankers, lexicalRanker } from "../tools/core/rankers.mjs";

const resource = { id: "x", route_text: "préparer un devis client", title: "", description: "", keywords: [], path: "p", body: "" };
const terms = ["devis"];
const floorScore = async () => (await composeRankers([lexicalRanker])(resource, terms, {})).score;

describe("composeRankers — fail-closed (a broken ranker degrades to the floor)", () => {
  it("a synchronously-throwing ranker contributes 0, never propagates", async () => {
    const out = await composeRankers([lexicalRanker, () => { throw new Error("boom"); }])(resource, terms, {});
    assert.equal(out.score, await floorScore());
    assert.ok(out.reasons.some((r) => r.startsWith("ranker:error")));
  });

  it("an async-rejecting ranker contributes 0, never rejects the composition", async () => {
    const out = await composeRankers([lexicalRanker, async () => { throw new Error("boom-async"); }])(resource, terms, {});
    assert.equal(out.score, await floorScore());
  });

  it("the floor survives a broken ranker placed before the lexical one too", async () => {
    const out = await composeRankers([() => { throw new Error("boom"); }, lexicalRanker])(resource, terms, {});
    assert.equal(out.score, await floorScore());
  });
});
