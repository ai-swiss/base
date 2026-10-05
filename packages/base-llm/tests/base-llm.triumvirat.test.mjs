// Spec coverage: UR-CORE-003
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createTriumviratModel,
  assistantMessage,
  userMessage,
  getText,
  LlmConfigError,
} from "../index.mjs";

// --- model stubs (no network) -----------------------------------------------

function textModel(text, usage = { input: 1, output: 1 }, capture) {
  return {
    id: "stub",
    async complete(request) {
      capture?.(request);
      return { message: assistantMessage(text), usage, finishReason: "stop" };
    },
  };
}

// Returns the next canned text per call (clamps on the last entry).
function queueModel(texts, usage = { input: 1, output: 1 }) {
  let i = 0;
  return {
    id: "stub",
    async complete() {
      const text = texts[Math.min(i, texts.length - 1)];
      i += 1;
      return { message: assistantMessage(text), usage, finishReason: "stop" };
    },
  };
}

function failModel(error) {
  return { id: "stub", async complete() { throw error; } };
}

// A coordinator that replays a fixed script of decisions (clamps on the last).
function scripted(steps) {
  let i = 0;
  return { decide() { const s = steps[Math.min(i, steps.length - 1)]; i += 1; return s; } };
}

const ask = (extra = {}) => ({ messages: [userMessage("solve it")], ...extra });

describe("createTriumviratModel", () => {
  it("runs thinker -> worker -> verifier(accept) and returns the worker draft", async () => {
    const pool = {
      t: textModel("plan: do the thing"),
      w: textModel("the answer is 42"),
      v: textModel('{"accepted":true,"feedback":""}'),
    };
    const triumvirat = createTriumviratModel({
      pool,
      coordinator: scripted([
        { model: "t", role: "thinker" },
        { model: "w", role: "worker" },
        { model: "v", role: "verifier" },
      ]),
    });

    const out = await triumvirat.complete(ask());

    assert.equal(getText(out.message), "the answer is 42");
    assert.equal(out.finishReason, "stop");
    assert.equal(out.raw.accepted, true);
  });

  it("feeds verifier feedback into the next worker turn (reject then fix)", async () => {
    let workerCalls = 0;
    const workerSystems = [];
    const pool = {
      w: {
        id: "w",
        async complete(request) {
          workerCalls += 1;
          workerSystems.push(getText(request.messages[0]));
          return { message: assistantMessage(`draft ${workerCalls}`), usage: { input: 1, output: 1 } };
        },
      },
      v: queueModel(['{"accepted":false,"feedback":"handle the empty case"}', '{"accepted":true}']),
    };
    const triumvirat = createTriumviratModel({
      pool,
      coordinator: scripted([
        { model: "w", role: "worker" },
        { model: "v", role: "verifier" },
        { model: "w", role: "worker" },
        { model: "v", role: "verifier" },
      ]),
    });

    const out = await triumvirat.complete(ask());

    assert.equal(out.raw.accepted, true);
    assert.equal(workerCalls, 2);
    assert.equal(getText(out.message), "draft 2");
    assert.match(workerSystems[1], /handle the empty case/);
  });

  it("stops at the turn budget and returns the best draft when never accepted", async () => {
    const pool = {
      w: textModel("partial answer"),
      v: textModel('{"accepted":false,"feedback":"not yet"}'),
    };
    const triumvirat = createTriumviratModel({
      pool,
      coordinator: scripted([{ model: "w", role: "worker" }, { model: "v", role: "verifier" }]),
      maxTurns: 4,
    });

    const out = await triumvirat.complete(ask());

    assert.equal(out.finishReason, "incomplete");
    assert.equal(out.raw.accepted, false);
    assert.equal(getText(out.message), "partial answer");
    assert.ok(out.raw.turns <= 4);
  });

  it("gives tools only to the worker role", async () => {
    const seen = {};
    const pool = {
      t: textModel("plan", undefined, (r) => (seen.thinker = r.tools)),
      w: textModel("answer", undefined, (r) => (seen.worker = r.tools)),
      v: textModel('{"accepted":true}', undefined, (r) => (seen.verifier = r.tools)),
    };
    const tools = [{ name: "calc", parameters: { type: "object" } }];
    const triumvirat = createTriumviratModel({
      pool,
      coordinator: scripted([
        { model: "t", role: "thinker" },
        { model: "w", role: "worker" },
        { model: "v", role: "verifier" },
      ]),
    });

    await triumvirat.complete(ask({ tools }));

    assert.equal(seen.thinker, undefined);
    assert.deepEqual(seen.worker, tools);
    assert.equal(seen.verifier, undefined);
  });

  it("sums usage across every role call", async () => {
    const pool = {
      w: textModel("a", { input: 10, output: 5 }),
      v: textModel('{"accepted":true}', { input: 2, output: 3 }),
    };
    const triumvirat = createTriumviratModel({
      pool,
      coordinator: scripted([{ model: "w", role: "worker" }, { model: "v", role: "verifier" }]),
    });

    const out = await triumvirat.complete(ask());

    assert.deepEqual(out.usage, { input: 12, output: 8 });
  });

  it("drives to acceptance through a prompted (LLM) coordinator", async () => {
    const coordinator = queueModel(['{"model":"w","role":"worker"}', '{"model":"v","role":"verifier"}']);
    const pool = { w: textModel("done"), v: textModel('{"accepted":true}') };
    const triumvirat = createTriumviratModel({ pool, coordinator, maxTurns: 5 });

    const out = await triumvirat.complete(ask());

    assert.equal(out.raw.accepted, true);
    assert.equal(getText(out.message), "done");
  });

  it("falls back to the deterministic policy when the coordinator emits junk", async () => {
    // Coordinator returns non-JSON every turn -> deterministic thinker/worker/verifier.
    const pool = { a: textModel("the answer") };
    const triumvirat = createTriumviratModel({ pool, coordinator: textModel("not json"), maxTurns: 3 });

    const out = await triumvirat.complete(ask());

    assert.equal(getText(out.message), "the answer"); // worker turn still produced a draft
  });

  it("recovers from a failing role turn instead of crashing", async () => {
    let n = 0;
    const pool = {
      w: {
        id: "w",
        async complete() {
          n += 1;
          if (n === 1) throw new Error("flaky");
          return { message: assistantMessage("recovered"), usage: { input: 1, output: 1 } };
        },
      },
      v: textModel('{"accepted":true}'),
    };
    const triumvirat = createTriumviratModel({
      pool,
      coordinator: scripted([
        { model: "w", role: "worker" },
        { model: "w", role: "worker" },
        { model: "v", role: "verifier" },
      ]),
    });

    const out = await triumvirat.complete(ask());

    assert.equal(getText(out.message), "recovered");
    assert.equal(out.raw.accepted, true);
  });

  it("honors an aborted signal", async () => {
    const pool = { w: textModel("x") };
    const controller = new AbortController();
    controller.abort();
    const triumvirat = createTriumviratModel({ pool, coordinator: scripted([{ model: "w", role: "worker" }]) });

    await assert.rejects(
      () => triumvirat.complete(ask(), { signal: controller.signal }),
      /aborted/,
    );
  });

  it("validates configuration", () => {
    assert.throws(() => createTriumviratModel({}), LlmConfigError);
    assert.throws(() => createTriumviratModel({ pool: {} }), LlmConfigError);
    assert.throws(() => createTriumviratModel({ pool: { a: { nope: 1 } } }), LlmConfigError);
    assert.throws(() => createTriumviratModel({ pool: { a: textModel("x") }, maxTurns: 0 }), LlmConfigError);
  });
});
