// Anthropic adapter — translation tested on recorded wire fixtures (no network): normalized
// request → Messages API payload, recorded reply → normalized Completion, listModels, typed errors.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAnthropicModel } from "../index.mjs";
import { LlmAuthError, LlmConfigError } from "../src/errors.mjs";
import { systemMessage, toolMessage, userMessage } from "../src/types.mjs";

// Recorded response shapes from the Messages API (abridged but structurally faithful).
const TEXT_REPLY = {
  id: "msg_01", type: "message", role: "assistant", model: "claude-x",
  content: [{ type: "text", text: "Voici le devis." }],
  stop_reason: "end_turn",
  usage: { input_tokens: 42, output_tokens: 7 },
};

const TOOL_REPLY = {
  id: "msg_02", type: "message", role: "assistant", model: "claude-x",
  content: [
    { type: "text", text: "Je consulte le barème." },
    { type: "tool_use", id: "toolu_abc", name: "open_resource", input: { id: "bareme-2026" } },
  ],
  stop_reason: "tool_use",
  usage: { input_tokens: 50, output_tokens: 12 },
};

function stubFetch(handler) {
  const calls = [];
  const impl = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return handler(String(url), init);
  };
  return { impl, calls };
}

const ok = (json) => ({ ok: true, status: 200, json: async () => json, text: async () => JSON.stringify(json), headers: { get: () => null } });
const fail = (status, body = "") => ({ ok: false, status, json: async () => ({}), text: async () => body, headers: { get: () => null } });

describe("anthropic adapter — request translation", () => {
  it("hoists system, maps tools to input_schema, merges tool results into one user turn", async () => {
    const { impl, calls } = stubFetch(() => ok(TEXT_REPLY));
    const model = createAnthropicModel({ apiKey: "k", model: "claude-x", fetch: impl, retries: 0 });

    await model.complete({
      messages: [
        systemMessage("Tu es l'assistant."),
        userMessage("Utilise le barème."),
        { role: "assistant", content: [
          { type: "toolCall", id: "toolu_1", name: "open_resource", arguments: { id: "a" } },
          { type: "toolCall", id: "toolu_2", name: "open_resource", arguments: { id: "b" } },
        ] },
        toolMessage("toolu_1", "contenu A"),
        toolMessage("toolu_2", "contenu B"),
      ],
      tools: [{ name: "open_resource", description: "lit", parameters: { type: "object", properties: { id: { type: "string" } } } }],
      maxTokens: 512,
    });

    const payload = JSON.parse(calls[0].init.body);
    assert.equal(calls[0].url, "https://api.anthropic.com/v1/messages");
    assert.equal(calls[0].init.headers["x-api-key"], "k");
    assert.equal(payload.system, "Tu es l'assistant.");
    assert.equal(payload.max_tokens, 512);
    assert.equal(payload.tools[0].name, "open_resource");
    assert.ok(payload.tools[0].input_schema.properties.id);
    // messages: user, assistant(tool_use×2), ONE user turn holding both tool_results
    assert.deepEqual(payload.messages.map((m) => m.role), ["user", "assistant", "user"]);
    assert.deepEqual(payload.messages[2].content.map((c) => c.type), ["tool_result", "tool_result"]);
    assert.equal(payload.messages[2].content[0].tool_use_id, "toolu_1");
  });

  it("maps toolChoice: required → {type:any} and named → {type:tool}", async () => {
    const { impl, calls } = stubFetch(() => ok(TEXT_REPLY));
    const model = createAnthropicModel({ apiKey: "k", model: "claude-x", fetch: impl, retries: 0 });
    const tools = [{ name: "t", parameters: { type: "object", properties: {} } }];

    await model.complete({ messages: [userMessage("x")], tools, toolChoice: "required" });
    assert.deepEqual(JSON.parse(calls[0].init.body).tool_choice, { type: "any" });

    await model.complete({ messages: [userMessage("x")], tools, toolChoice: { type: "function", function: { name: "t" } } });
    assert.deepEqual(JSON.parse(calls[1].init.body).tool_choice, { type: "tool", name: "t" });
  });
});

describe("anthropic adapter — response translation", () => {
  it("normalizes a text completion", async () => {
    const { impl } = stubFetch(() => ok(TEXT_REPLY));
    const model = createAnthropicModel({ apiKey: "k", model: "claude-x", fetch: impl, retries: 0 });
    const completion = await model.complete({ messages: [userMessage("Devis ?")] });

    assert.deepEqual(completion.message.content, [{ type: "text", text: "Voici le devis." }]);
    assert.equal(completion.finishReason, "stop");
    assert.deepEqual(completion.usage, { input: 42, output: 7 });
  });

  it("normalizes tool_use blocks into toolCall parts", async () => {
    const { impl } = stubFetch(() => ok(TOOL_REPLY));
    const model = createAnthropicModel({ apiKey: "k", model: "claude-x", fetch: impl, retries: 0 });
    const completion = await model.complete({ messages: [userMessage("Va lire.")] });

    assert.equal(completion.finishReason, "tool_calls");
    const call = completion.message.content.find((p) => p.type === "toolCall");
    assert.deepEqual(call, { type: "toolCall", id: "toolu_abc", name: "open_resource", arguments: { id: "bareme-2026" } });
  });
});

describe("anthropic adapter — discovery and errors", () => {
  it("listModels GETs /v1/models and returns the ids", async () => {
    const { impl, calls } = stubFetch(() => ok({ data: [{ id: "claude-sonnet-4-5" }, { id: "claude-haiku-4-5" }] }));
    const model = createAnthropicModel({ apiKey: "k", model: "claude-x", fetch: impl });
    assert.deepEqual(await model.listModels(), ["claude-sonnet-4-5", "claude-haiku-4-5"]);
    assert.equal(calls[0].url, "https://api.anthropic.com/v1/models");
  });

  it("maps 401 to LlmAuthError (not retriable) and refuses to build without a key", async () => {
    const { impl } = stubFetch(() => fail(401, "invalid x-api-key"));
    const model = createAnthropicModel({ apiKey: "bad", model: "claude-x", fetch: impl, retries: 0 });
    await assert.rejects(() => model.complete({ messages: [userMessage("x")] }), LlmAuthError);
    assert.throws(() => createAnthropicModel({ apiKey: "", model: "claude-x", fetch: impl }), LlmConfigError);
  });
});
