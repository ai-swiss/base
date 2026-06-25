// Google Gemini adapter — translation tested on recorded wire fixtures (no network): normalized
// request → generateContent payload, recorded reply → normalized Completion, listModels, errors.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createGoogleModel } from "../index.mjs";
import { LlmConfigError, LlmNetworkError } from "../src/errors.mjs";
import { systemMessage, toolMessage, userMessage } from "../src/types.mjs";

const TEXT_REPLY = {
  candidates: [{ content: { role: "model", parts: [{ text: "Voici le devis." }] }, finishReason: "STOP" }],
  usageMetadata: { promptTokenCount: 42, candidatesTokenCount: 7 },
};

const TOOL_REPLY = {
  candidates: [{
    content: { role: "model", parts: [{ functionCall: { name: "open_resource", args: { id: "bareme-2026" } } }] },
    finishReason: "STOP",
  }],
  usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 12 },
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

describe("google adapter — request translation", () => {
  it("hoists system, maps tools to functionDeclarations and tool results to functionResponse", async () => {
    const { impl, calls } = stubFetch(() => ok(TEXT_REPLY));
    const model = createGoogleModel({ apiKey: "k", model: "gemini-2.5-flash", fetch: impl, retries: 0 });

    await model.complete({
      messages: [
        systemMessage("Tu es l'assistant."),
        userMessage("Utilise le barème."),
        { role: "assistant", content: [{ type: "toolCall", id: "open_resource#0", name: "open_resource", arguments: { id: "a" } }] },
        toolMessage("open_resource#0", "contenu A"),
      ],
      tools: [{ name: "open_resource", description: "lit", parameters: { type: "object", properties: { id: { type: "string" } } } }],
      responseFormat: { type: "json_object" },
      maxTokens: 256,
    });

    const payload = JSON.parse(calls[0].init.body);
    assert.match(calls[0].url, /\/v1beta\/models\/gemini-2.5-flash:generateContent$/);
    assert.equal(calls[0].init.headers["x-goog-api-key"], "k");
    assert.equal(payload.systemInstruction.parts[0].text, "Tu es l'assistant.");
    assert.equal(payload.tools[0].functionDeclarations[0].name, "open_resource");
    assert.equal(payload.generationConfig.responseMimeType, "application/json");
    assert.equal(payload.generationConfig.maxOutputTokens, 256);
    // contents: user, model(functionCall), user(functionResponse with the recovered name)
    assert.deepEqual(payload.contents.map((c) => c.role), ["user", "model", "user"]);
    assert.equal(payload.contents[1].parts[0].functionCall.name, "open_resource");
    assert.deepEqual(payload.contents[2].parts[0].functionResponse, {
      name: "open_resource",
      response: { result: "contenu A" },
    });
  });

  it("maps toolChoice: required → mode ANY", async () => {
    const { impl, calls } = stubFetch(() => ok(TEXT_REPLY));
    const model = createGoogleModel({ apiKey: "k", model: "g", fetch: impl, retries: 0 });
    await model.complete({
      messages: [userMessage("x")],
      tools: [{ name: "t", parameters: { type: "object", properties: {} } }],
      toolChoice: "required",
    });
    assert.deepEqual(JSON.parse(calls[0].init.body).toolConfig, { functionCallingConfig: { mode: "ANY" } });
  });
});

describe("google adapter — response translation", () => {
  it("normalizes a text completion", async () => {
    const { impl } = stubFetch(() => ok(TEXT_REPLY));
    const model = createGoogleModel({ apiKey: "k", model: "g", fetch: impl, retries: 0 });
    const completion = await model.complete({ messages: [userMessage("Devis ?")] });
    assert.deepEqual(completion.message.content, [{ type: "text", text: "Voici le devis." }]);
    assert.equal(completion.finishReason, "stop");
    assert.deepEqual(completion.usage, { input: 42, output: 7 });
  });

  it("normalizes functionCall parts with minted ids and finishReason tool_calls", async () => {
    const { impl } = stubFetch(() => ok(TOOL_REPLY));
    const model = createGoogleModel({ apiKey: "k", model: "g", fetch: impl, retries: 0 });
    const completion = await model.complete({ messages: [userMessage("Va lire.")] });
    assert.equal(completion.finishReason, "tool_calls");
    assert.deepEqual(completion.message.content[0], {
      type: "toolCall", id: "open_resource#0", name: "open_resource", arguments: { id: "bareme-2026" },
    });
  });
});

describe("google adapter — discovery and errors", () => {
  it("listModels GETs /v1beta/models and strips the models/ prefix", async () => {
    const { impl, calls } = stubFetch(() => ok({ models: [{ name: "models/gemini-2.5-pro" }, { name: "models/gemini-2.5-flash" }] }));
    const model = createGoogleModel({ apiKey: "k", model: "g", fetch: impl });
    assert.deepEqual(await model.listModels(), ["gemini-2.5-pro", "gemini-2.5-flash"]);
    assert.match(calls[0].url, /\/v1beta\/models$/);
  });

  it("maps a network failure to a retriable LlmNetworkError; refuses to build without a key", async () => {
    const model = createGoogleModel({
      apiKey: "k", model: "g", retries: 0,
      fetch: async () => { throw new Error("ECONNREFUSED"); },
    });
    await assert.rejects(() => model.complete({ messages: [userMessage("x")] }), LlmNetworkError);
    assert.throws(() => createGoogleModel({ apiKey: "", model: "g", fetch: async () => ok({}) }), LlmConfigError);
  });
});
