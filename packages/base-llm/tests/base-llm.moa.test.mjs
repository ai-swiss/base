// Spec coverage: UR-CORE-003
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createMoaModel,
  assistantMessage,
  userMessage,
  getText,
  LlmConfigError,
} from "../index.mjs";

// Minimal capturing model stub — records the request it received so we can assert
// what the MoA layer forwarded to proposers vs the aggregator.
function stub(text, { usage = { input: 1, output: 1 }, capture, fail } = {}) {
  return {
    id: "stub",
    async complete(request, ctx) {
      capture?.(request, ctx);
      if (fail) throw fail;
      return { message: assistantMessage(text), usage, finishReason: "stop" };
    },
  };
}

const baseRequest = () => ({ messages: [userMessage("What is 2+2?")] });

describe("createMoaModel", () => {
  it("synthesizes proposer drafts via the aggregator and returns the aggregator's answer", async () => {
    let aggReq;
    const moa = createMoaModel({
      proposers: [stub("draft A says four"), stub("draft B says 4")],
      aggregator: stub("The answer is 4.", { capture: (r) => (aggReq = r) }),
    });

    const out = await moa.complete(baseRequest());

    assert.equal(getText(out.message), "The answer is 4.");
    // Aggregator's first message is a system message carrying BOTH drafts.
    assert.equal(aggReq.messages[0].role, "system");
    const sys = getText(aggReq.messages[0]);
    assert.match(sys, /draft A says four/);
    assert.match(sys, /draft B says 4/);
    // The original user turn is preserved after the synthesis guidance.
    assert.equal(getText(aggReq.messages.at(-1)), "What is 2+2?");
  });

  it("strips tools from proposers but preserves them for the aggregator", async () => {
    const seen = { proposer: "unset", aggregator: "unset" };
    const tools = [{ name: "calc", parameters: { type: "object" } }];
    const moa = createMoaModel({
      proposers: [stub("p", { capture: (r) => (seen.proposer = r.tools) })],
      aggregator: stub("a", { capture: (r) => (seen.aggregator = r.tools) }),
    });

    await moa.complete({ ...baseRequest(), tools });

    assert.equal(seen.proposer, undefined, "proposer must not receive tools");
    assert.deepEqual(seen.aggregator, tools, "aggregator must keep original tools");
  });

  it("still synthesizes when some proposers fail, dropping the failures", async () => {
    let aggReq;
    const moa = createMoaModel({
      proposers: [
        stub("", { fail: new Error("boom") }),
        stub("the survivor draft"),
      ],
      aggregator: stub("final", { capture: (r) => (aggReq = r) }),
    });

    const out = await moa.complete(baseRequest());

    assert.equal(getText(out.message), "final");
    assert.match(getText(aggReq.messages[0]), /the survivor draft/);
  });

  it("throws when every proposer fails", async () => {
    const moa = createMoaModel({
      proposers: [stub("", { fail: new Error("a") }), stub("", { fail: new Error("b") })],
      aggregator: stub("never reached"),
    });
    await assert.rejects(() => moa.complete(baseRequest()), /a/);
  });

  it("sums usage across all proposers and the aggregator", async () => {
    const moa = createMoaModel({
      proposers: [
        stub("p1", { usage: { input: 10, output: 5 } }),
        stub("p2", { usage: { input: 20, output: 7 } }),
      ],
      aggregator: stub("agg", { usage: { input: 3, output: 9 } }),
    });

    const out = await moa.complete(baseRequest());

    assert.deepEqual(out.usage, { input: 33, output: 21 });
  });

  it("validates configuration", () => {
    assert.throws(() => createMoaModel({ proposers: [], aggregator: stub("x") }), LlmConfigError);
    assert.throws(() => createMoaModel({ proposers: [stub("x")] }), LlmConfigError);
    assert.throws(
      () => createMoaModel({ proposers: [{ notAModel: true }], aggregator: stub("x") }),
      LlmConfigError,
    );
  });

  it("exposes stream() only when the aggregator can stream, delegating to it", async () => {
    const noStream = createMoaModel({ proposers: [stub("p")], aggregator: stub("a") });
    assert.equal(typeof noStream.stream, "undefined");

    const streamingAggregator = {
      id: "agg",
      complete: stub("a").complete,
      async *stream() {
        yield { type: "text-delta", text: "hel" };
        yield { type: "text-delta", text: "lo" };
      },
    };
    const moa = createMoaModel({ proposers: [stub("draft")], aggregator: streamingAggregator });
    assert.equal(typeof moa.stream, "function");

    const chunks = [];
    for await (const c of moa.stream(baseRequest())) chunks.push(c.text);
    assert.deepEqual(chunks, ["hel", "lo"]);
  });
});
