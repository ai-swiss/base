// Google Gemini API adapter — implements the LanguageModel port over
// `POST /v1beta/models/{model}:generateContent`, in direct REST (zero dependencies, no SDK).
// Tool calling is translated between the port's toolCall parts and Gemini's
// functionDeclarations / functionCall / functionResponse. Gemini function calls carry no id, so
// this adapter mints `name#index` ids on the way in and recovers the name on the way out — that
// convention never leaves this file. Always `locality: remote` at the settings layer.

import { LlmConfigError, LlmResponseError } from "./errors.mjs";
import { getJson, httpError, networkError, readJson, withDeadline, withRetry } from "./transport.mjs";
import { assertValidRequest } from "./types.mjs";

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_RETRIES = 2;

export function createGoogleModel(options = {}) {
  const {
    apiKey = process.env.GEMINI_API_KEY,
    baseUrl = "https://generativelanguage.googleapis.com",
    model,
    fetch: fetchImpl = globalThis.fetch,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
  } = options;

  if (!model) throw new LlmConfigError("createGoogleModel requires a `model`");
  if (typeof fetchImpl !== "function") throw new LlmConfigError("no fetch implementation available (pass `fetch`)");
  if (!apiKey) throw new LlmConfigError("createGoogleModel requires an `apiKey` (env GEMINI_API_KEY)");

  const root = baseUrl.replace(/\/$/, "");
  const wireHeaders = { "content-type": "application/json", "x-goog-api-key": apiKey, ...headers };

  async function complete(request, ctx = {}) {
    assertValidRequest(request);
    const payload = toWirePayload(request);
    return withRetry(
      () =>
        withDeadline(
          async (signal) => {
            let response;
            try {
              response = await fetchImpl(`${root}/v1beta/models/${model}:generateContent`, {
                method: "POST",
                headers: wireHeaders,
                body: JSON.stringify(payload),
                signal,
              });
            } catch (error) {
              throw networkError(error);
            }
            const err = await httpError(response);
            if (err) throw err;
            return fromWireResponse(await readJson(response));
          },
          { timeoutMs, signal: ctx.signal },
        ),
      { retries },
    );
  }

  // Model discovery (`GET /v1beta/models`) — names arrive as "models/gemini-…"; strip the prefix.
  async function listModels(ctx = {}) {
    const json = await getJson(`${root}/v1beta/models`, { fetchImpl, headers: wireHeaders, timeoutMs, signal: ctx.signal });
    return (json?.models ?? []).map((m) => String(m.name ?? "").replace(/^models\//, "")).filter(Boolean);
  }

  return { id: `google:${model}`, complete, listModels };
}

// --- mapping: normalized → wire -------------------------------------------

function toWirePayload(request) {
  const system = request.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const payload = { contents: toWireContents(request.messages) };
  if (system) payload.systemInstruction = { parts: [{ text: system }] };
  if (request.tools?.length) {
    payload.tools = [{
      functionDeclarations: request.tools.map((t) => ({
        name: t.name,
        description: t.description ?? "",
        parameters: t.parameters ?? { type: "object", properties: {} },
      })),
    }];
    const mode = toWireToolMode(request.toolChoice);
    if (mode) payload.toolConfig = { functionCallingConfig: mode };
  }
  const generationConfig = {};
  if (typeof request.temperature === "number") generationConfig.temperature = request.temperature;
  if (typeof request.maxTokens === "number") generationConfig.maxOutputTokens = request.maxTokens;
  if (request.responseFormat?.type === "json_object") generationConfig.responseMimeType = "application/json";
  if (Object.keys(generationConfig).length) payload.generationConfig = generationConfig;
  return payload;
}

function toWireToolMode(toolChoice) {
  if (!toolChoice || toolChoice === "auto") return null;
  if (toolChoice === "required") return { mode: "ANY" };
  if (toolChoice === "none") return { mode: "NONE" };
  const name = toolChoice?.function?.name ?? toolChoice?.name;
  return name ? { mode: "ANY", allowedFunctionNames: [name] } : null;
}

function toWireContents(messages) {
  const contents = [];
  for (const m of messages) {
    if (m.role === "system") continue; // hoisted to systemInstruction
    if (m.role === "user") {
      contents.push({ role: "user", parts: [{ text: m.content }] });
    } else if (m.role === "assistant") {
      const parts = m.content.map((p) =>
        p.type === "text"
          ? { text: p.text }
          : { functionCall: { name: p.name, args: p.arguments ?? {} } });
      contents.push({ role: "model", parts });
    } else if (m.role === "tool") {
      // Function responses are `user` parts; the function name is recovered from our minted id.
      const name = String(m.toolCallId ?? "").split("#")[0];
      const part = { functionResponse: { name, response: { result: m.content } } };
      const last = contents[contents.length - 1];
      if (last?.role === "user" && last.parts.every((p) => p.functionResponse)) last.parts.push(part);
      else contents.push({ role: "user", parts: [part] });
    }
  }
  return contents;
}

// --- mapping: wire → normalized -------------------------------------------

function fromWireResponse(json) {
  const candidate = json?.candidates?.[0];
  if (!candidate) throw new LlmResponseError("Gemini response had no candidates");
  const content = [];
  let callIndex = 0;
  for (const part of candidate.content?.parts ?? []) {
    if (typeof part.text === "string" && part.text.length > 0) {
      content.push({ type: "text", text: part.text });
    } else if (part.functionCall) {
      content.push({
        type: "toolCall",
        id: `${part.functionCall.name}#${callIndex}`,
        name: part.functionCall.name ?? "",
        arguments: part.functionCall.args ?? {},
      });
      callIndex += 1;
    }
  }
  const hasCalls = content.some((p) => p.type === "toolCall");
  return {
    message: { role: "assistant", content },
    usage: {
      input: Number(json?.usageMetadata?.promptTokenCount ?? 0),
      output: Number(json?.usageMetadata?.candidatesTokenCount ?? 0),
    },
    finishReason: hasCalls ? "tool_calls" : mapFinishReason(candidate.finishReason),
    raw: json,
  };
}

function mapFinishReason(reason) {
  switch (reason) {
    case "STOP":
      return "stop";
    case "MAX_TOKENS":
      return "length";
    case "SAFETY":
    case "RECITATION":
    case "BLOCKLIST":
    case "PROHIBITED_CONTENT":
      return "content_filter";
    default:
      return "unknown";
  }
}
