// Spec coverage: UR-CORE-003
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectStream,
  createFauxModel,
  createOpenAICompatibleModel,
  getText,
  getToolCalls,
  LlmAbortError,
  userMessage,
} from "../index.mjs";

// Build a fake SSE response body that yields the given event objects as `data:` lines, sliced into
// arbitrary byte chunks to exercise the parser's cross-chunk buffering.
function sseBody(events, sliceSize = 7) {
  const text = events.map((e) => `data: ${JSON.stringify(e)}\n`).join("") + "data: [DONE]\n";
  const bytes = new TextEncoder().encode(text);
  return (async function* () {
    for (let i = 0; i < bytes.length; i += sliceSize) yield bytes.subarray(i, i + sliceSize);
  })();
}

const streamResponse = (events) => ({ ok: true, status: 200, headers: { get: () => null }, body: sseBody(events) });

describe("base-llm — faux streaming", () => {
  it("emits text deltas that reconcile to the full text, then done", async () => {
    const m = createFauxModel("Bonjour tout le monde");
    const events = [];
    for await (const e of m.stream({ messages: [userMessage("hi")] })) events.push(e);
    const deltas = events.filter((e) => e.type === "text-delta");
    assert.ok(deltas.length >= 2, "should stream multiple deltas");
    assert.equal(deltas.map((d) => d.text).join(""), "Bonjour tout le monde");
    const done = events.at(-1);
    assert.equal(done.type, "done");
    assert.equal(getText(done.completion.message), "Bonjour tout le monde");
  });

  it("streams a tool-call event then done", async () => {
    const m = createFauxModel({ text: "calling", toolCalls: [{ id: "c1", name: "route", arguments: { q: "x" } }] });
    const { text, toolCalls, completion } = await collectStream(m.stream({ messages: [userMessage("hi")] }));
    assert.equal(text, "calling");
    assert.deepEqual(toolCalls[0], { type: "tool-call", id: "c1", name: "route", arguments: { q: "x" } });
    assert.equal(getToolCalls(completion.message).length, 1);
  });

  it("throws on an already-aborted signal", async () => {
    const m = createFauxModel("x");
    const ac = new AbortController();
    ac.abort();
    await assert.rejects(async () => {
      // eslint-disable-next-line no-unused-vars
      for await (const _ of m.stream({ messages: [userMessage("x")] }, { signal: ac.signal })) { /* drain */ }
    }, LlmAbortError);
  });
});

describe("base-llm — OpenAI-compatible streaming (SSE)", () => {
  it("parses text deltas across chunk boundaries and assembles the final completion", async () => {
    const fetchImpl = async () =>
      streamResponse([
        { choices: [{ delta: { content: "Hello" } }] },
        { choices: [{ delta: { content: " world" } }] },
        { choices: [{ delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 2, completion_tokens: 2 } },
      ]);
    const model = createOpenAICompatibleModel({ model: "m", apiKey: "k", fetch: fetchImpl });

    const { text, completion } = await collectStream(model.stream({ messages: [userMessage("hi")] }));
    assert.equal(text, "Hello world");
    assert.equal(getText(completion.message), "Hello world");
    assert.equal(completion.finishReason, "stop");
    assert.deepEqual(completion.usage, { input: 2, output: 2 });
  });

  it("accumulates streamed tool-call argument fragments and parses them", async () => {
    const fetchImpl = async () =>
      streamResponse([
        { choices: [{ delta: { tool_calls: [{ index: 0, id: "c1", function: { name: "route_request", arguments: '{"q":' } }] } }] },
        { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '"devis"}' } }] } }] },
        { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
      ]);
    const model = createOpenAICompatibleModel({ model: "m", apiKey: "k", fetch: fetchImpl });

    const events = [];
    for await (const e of model.stream({ messages: [userMessage("hi")] })) events.push(e);
    const toolEvent = events.find((e) => e.type === "tool-call");
    assert.deepEqual(toolEvent, { type: "tool-call", id: "c1", name: "route_request", arguments: { q: "devis" } });
    const done = events.at(-1);
    assert.equal(done.completion.finishReason, "tool_calls");
    assert.deepEqual(getToolCalls(done.completion.message)[0].arguments, { q: "devis" });
  });

  it("keeps parallel tool calls separate when a gateway omits the delta `index`", async () => {
    // A non-conformant OpenAI-compatible gateway streams two parallel calls with no `index`. Each
    // call's FIRST delta carries its own `id`; argument-only fragments continue the latest call.
    // Without per-id keying both would collapse into slot 0 and their JSON args would concatenate
    // into invalid JSON.
    const fetchImpl = async () =>
      streamResponse([
        { choices: [{ delta: { tool_calls: [{ id: "a", function: { name: "alpha", arguments: '{"x":' } }] } }] },
        { choices: [{ delta: { tool_calls: [{ function: { arguments: "1}" } }] } }] },
        { choices: [{ delta: { tool_calls: [{ id: "b", function: { name: "beta", arguments: '{"y":' } }] } }] },
        { choices: [{ delta: { tool_calls: [{ function: { arguments: "2}" } }] } }] },
        { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
      ]);
    const model = createOpenAICompatibleModel({ model: "m", apiKey: "k", fetch: fetchImpl });

    const { toolCalls } = await collectStream(model.stream({ messages: [userMessage("hi")] }));
    assert.deepEqual(toolCalls, [
      { type: "tool-call", id: "a", name: "alpha", arguments: { x: 1 } },
      { type: "tool-call", id: "b", name: "beta", arguments: { y: 2 } },
    ]);
  });
});
