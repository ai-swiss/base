// Spec coverage: UR-CORE-003
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertValidRequest,
  assistantMessage,
  createFauxModel,
  createOllamaModel,
  createOpenAICompatibleModel,
  getText,
  getToolCalls,
  LlmAbortError,
  LlmAuthError,
  LlmConfigError,
  LlmNetworkError,
  LlmRateLimitError,
  LlmResponseError,
  systemMessage,
  textPart,
  toolCallPart,
  toolMessage,
  userMessage,
} from "../index.mjs";

// --- fake fetch / Response helpers (no network) ----------------------------

function makeResponse(status, jsonBody, { retryAfter = null } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (h) => (h.toLowerCase() === "retry-after" ? retryAfter : null) },
    json: async () => jsonBody,
    text: async () => JSON.stringify(jsonBody ?? ""),
  };
}

const okText = (text) => makeResponse(200, {
  choices: [{ message: { content: text }, finish_reason: "stop" }],
  usage: { prompt_tokens: 5, completion_tokens: 3 },
});

// --- faux model ------------------------------------------------------------

describe("base-llm — faux model", () => {
  it("replies with a constant string and records calls", async () => {
    const m = createFauxModel("hello");
    const r = await m.complete({ messages: [userMessage("hi")] });
    assert.equal(getText(r.message), "hello");
    assert.equal(r.finishReason, "stop");
    assert.equal(m.calls.length, 1);
    assert.equal(m.calls[0].messages[0].content, "hi");
  });

  it("plays an array of scripted replies in order and throws when under-scripted", async () => {
    const m = createFauxModel(["one", "two"]);
    assert.equal(getText((await m.complete({ messages: [userMessage("a")] })).message), "one");
    assert.equal(getText((await m.complete({ messages: [userMessage("b")] })).message), "two");
    await assert.rejects(() => m.complete({ messages: [userMessage("c")] }), LlmConfigError);
  });

  it("computes replies from the request via a function", async () => {
    const m = createFauxModel((req) => `saw:${req.messages.at(-1).content}`);
    assert.equal(getText((await m.complete({ messages: [userMessage("x")] })).message), "saw:x");
  });

  it("supports tool-call sugar", async () => {
    const m = createFauxModel({ toolCalls: [{ id: "c1", name: "open_resource", arguments: { id: "devis" } }] });
    const r = await m.complete({ messages: [userMessage("go")] });
    assert.equal(r.finishReason, "tool_calls");
    const calls = getToolCalls(r.message);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], { type: "toolCall", id: "c1", name: "open_resource", arguments: { id: "devis" } });
  });

  it("respects an already-aborted signal", async () => {
    const m = createFauxModel("x");
    const ac = new AbortController();
    ac.abort();
    await assert.rejects(() => m.complete({ messages: [userMessage("x")] }, { signal: ac.signal }), LlmAbortError);
  });
});

// --- builders / accessors / validation -------------------------------------

describe("base-llm — message helpers & validation", () => {
  it("getText/getToolCalls read assistant content parts", () => {
    const msg = assistantMessage([textPart("a"), textPart("b"), toolCallPart("c1", "t", { k: 1 })]);
    assert.equal(getText(msg), "ab");
    assert.equal(getToolCalls(msg).length, 1);
  });

  it("assertValidRequest rejects empty messages, bad roles and bad tools", () => {
    assert.throws(() => assertValidRequest({ messages: [] }), LlmConfigError);
    assert.throws(() => assertValidRequest({ messages: [{ role: "wizard", content: "x" }] }), LlmConfigError);
    assert.throws(() => assertValidRequest({ messages: [userMessage("x")], tools: [{ description: "no name" }] }), LlmConfigError);
    assert.doesNotThrow(() => assertValidRequest({ messages: [userMessage("x")], tools: [{ name: "t", parameters: { type: "object" } }] }));
  });
});

// --- OpenAI-compatible adapter: mapping out --------------------------------

describe("base-llm — OpenAI-compatible adapter: normalized → wire", () => {
  it("maps system/user/assistant(+toolCall)/tool messages and tools into the wire payload", async () => {
    let captured;
    const fetchImpl = async (url, init) => {
      captured = { url, init, body: JSON.parse(init.body) };
      return okText("ok");
    };
    const model = createOpenAICompatibleModel({ model: "gpt-x", apiKey: "k", fetch: fetchImpl });
    await model.complete({
      messages: [
        systemMessage("be terse"),
        userMessage("do it"),
        assistantMessage([textPart("calling"), toolCallPart("c1", "open_resource", { id: "devis" })]),
        toolMessage("c1", "file contents"),
      ],
      tools: [{ name: "open_resource", description: "open", parameters: { type: "object", properties: { id: { type: "string" } } } }],
      temperature: 0.2,
      maxTokens: 256,
      toolChoice: "auto",
    });

    assert.equal(captured.url, "https://api.openai.com/v1/chat/completions");
    assert.equal(captured.init.headers.authorization, "Bearer k");
    const body = captured.body;
    assert.equal(body.model, "gpt-x");
    assert.equal(body.temperature, 0.2);
    assert.equal(body.max_tokens, 256);
    assert.equal(body.tool_choice, "auto");
    assert.deepEqual(body.messages[0], { role: "system", content: "be terse" });
    assert.deepEqual(body.messages[1], { role: "user", content: "do it" });
    assert.equal(body.messages[2].role, "assistant");
    assert.equal(body.messages[2].content, "calling");
    assert.deepEqual(body.messages[2].tool_calls, [
      { id: "c1", type: "function", function: { name: "open_resource", arguments: '{"id":"devis"}' } },
    ]);
    assert.deepEqual(body.messages[3], { role: "tool", tool_call_id: "c1", content: "file contents" });
    assert.equal(body.tools[0].type, "function");
    assert.equal(body.tools[0].function.name, "open_resource");
  });

  it("forwards responseFormat as response_format (JSON mode)", async () => {
    let body;
    const fetchImpl = async (_url, init) => {
      body = JSON.parse(init.body);
      return okText("ok");
    };
    const model = createOpenAICompatibleModel({ model: "m", apiKey: "k", fetch: fetchImpl });
    await model.complete({ messages: [userMessage("hi")], responseFormat: { type: "json_object" } });
    assert.deepEqual(body.response_format, { type: "json_object" });
  });
});

// --- OpenAI-compatible adapter: mapping in ---------------------------------

describe("base-llm — OpenAI-compatible adapter: wire → normalized", () => {
  it("normalizes a text completion with usage and finishReason", async () => {
    const model = createOpenAICompatibleModel({ model: "m", apiKey: "k", fetch: async () => okText("Hello there") });
    const r = await model.complete({ messages: [userMessage("hi")] });
    assert.equal(getText(r.message), "Hello there");
    assert.deepEqual(r.usage, { input: 5, output: 3 });
    assert.equal(r.finishReason, "stop");
  });

  it("normalizes tool_calls and parses their JSON arguments", async () => {
    const body = makeResponse(200, {
      choices: [{
        message: { content: null, tool_calls: [{ id: "call_1", type: "function", function: { name: "route_request", arguments: '{"q":"devis"}' } }] },
        finish_reason: "tool_calls",
      }],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    });
    const model = createOpenAICompatibleModel({ model: "m", apiKey: "k", fetch: async () => body });
    const r = await model.complete({ messages: [userMessage("hi")] });
    assert.equal(r.finishReason, "tool_calls");
    assert.deepEqual(getToolCalls(r.message)[0], { type: "toolCall", id: "call_1", name: "route_request", arguments: { q: "devis" } });
  });

  it("throws LlmResponseError on non-JSON tool arguments and on missing choices", async () => {
    const badArgs = makeResponse(200, {
      choices: [{ message: { tool_calls: [{ id: "c", function: { name: "t", arguments: "{not json" } }] }, finish_reason: "tool_calls" }],
    });
    const m1 = createOpenAICompatibleModel({ model: "m", apiKey: "k", fetch: async () => badArgs });
    await assert.rejects(() => m1.complete({ messages: [userMessage("x")] }), LlmResponseError);

    const m2 = createOpenAICompatibleModel({ model: "m", apiKey: "k", fetch: async () => makeResponse(200, { choices: [] }) });
    await assert.rejects(() => m2.complete({ messages: [userMessage("x")] }), LlmResponseError);
  });
});

// --- error typing, abort, retry --------------------------------------------

describe("base-llm — transport: typed errors, abort, retry", () => {
  it("maps 401 → LlmAuthError (non-retriable) and 429 → LlmRateLimitError", async () => {
    const m401 = createOpenAICompatibleModel({ model: "m", apiKey: "k", retries: 0, fetch: async () => makeResponse(401, { error: "no" }) });
    await assert.rejects(() => m401.complete({ messages: [userMessage("x")] }), (e) => e instanceof LlmAuthError && e.retriable === false);

    const m429 = createOpenAICompatibleModel({ model: "m", apiKey: "k", retries: 0, fetch: async () => makeResponse(429, { error: "slow" }) });
    await assert.rejects(() => m429.complete({ messages: [userMessage("x")] }), (e) => e instanceof LlmRateLimitError && e.retriable === true);
  });

  it("retries a transient 500 then succeeds", async () => {
    let n = 0;
    const fetchImpl = async () => (++n === 1 ? makeResponse(500, { error: "oops" }) : okText("recovered"));
    const model = createOpenAICompatibleModel({ model: "m", apiKey: "k", retries: 2, fetch: fetchImpl });
    const r = await model.complete({ messages: [userMessage("x")] });
    assert.equal(getText(r.message), "recovered");
    assert.equal(n, 2);
  });

  it("wraps a thrown network failure as a retriable LlmNetworkError (no retries left)", async () => {
    const model = createOpenAICompatibleModel({ model: "m", apiKey: "k", retries: 0, fetch: async () => { throw new Error("ECONNREFUSED"); } });
    await assert.rejects(() => model.complete({ messages: [userMessage("x")] }), (e) => e instanceof LlmNetworkError && e.retriable === true);
  });

  it("surfaces a caller abort as LlmAbortError", async () => {
    const ac = new AbortController();
    const fetchImpl = (url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })), { once: true });
      });
    const model = createOpenAICompatibleModel({ model: "m", apiKey: "k", retries: 0, fetch: fetchImpl });
    const p = model.complete({ messages: [userMessage("x")] }, { signal: ac.signal });
    ac.abort();
    await assert.rejects(() => p, LlmAbortError);
  });
});

// --- Ollama provider over the same wire API --------------------------------

describe("base-llm — Ollama is a provider over the OpenAI-compatible wire API", () => {
  it("targets the local endpoint and needs no API key", async () => {
    let url;
    let auth;
    const fetchImpl = async (u, init) => {
      url = u;
      auth = init.headers.authorization;
      return okText("local");
    };
    const model = createOllamaModel({ model: "llama3.1", fetch: fetchImpl });
    const r = await model.complete({ messages: [userMessage("hi")] });
    assert.equal(getText(r.message), "local");
    assert.equal(url, "http://localhost:11434/v1/chat/completions");
    assert.equal(auth, undefined);
  });
});
