// Anthropic Messages API adapter — implements the LanguageModel port over `POST /v1/messages`,
// in direct REST (zero dependencies, no SDK). The translation is the anti-corruption layer:
// normalized messages/tools in, Anthropic wire out, Anthropic reply normalized back. Nothing
// provider-shaped escapes this file. Always `locality: remote` at the settings layer.

import { LlmConfigError, LlmResponseError } from "./errors.mjs";
import { getJson, httpError, networkError, readJson, withDeadline, withRetry } from "./transport.mjs";
import { assertValidRequest } from "./types.mjs";

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_RETRIES = 2;
const ANTHROPIC_VERSION = "2023-06-01";
// The Messages API requires max_tokens; this is only the ceiling when the caller does not set one.
const DEFAULT_MAX_TOKENS = 4096;

export function createAnthropicModel(options = {}) {
  const {
    apiKey = process.env.ANTHROPIC_API_KEY,
    baseUrl = "https://api.anthropic.com",
    model,
    fetch: fetchImpl = globalThis.fetch,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
  } = options;

  if (!model) throw new LlmConfigError("createAnthropicModel requires a `model`");
  if (typeof fetchImpl !== "function") throw new LlmConfigError("no fetch implementation available (pass `fetch`)");
  if (!apiKey) throw new LlmConfigError("createAnthropicModel requires an `apiKey` (env ANTHROPIC_API_KEY)");

  const root = baseUrl.replace(/\/$/, "");
  const wireHeaders = {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    ...headers,
  };

  async function complete(request, ctx = {}) {
    assertValidRequest(request);
    const payload = toWirePayload(model, request);
    return withRetry(
      () =>
        withDeadline(
          async (signal) => {
            let response;
            try {
              response = await fetchImpl(`${root}/v1/messages`, {
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

  // Model discovery (`GET /v1/models`) — the optional port extension used by the catalog.
  async function listModels(ctx = {}) {
    const json = await getJson(`${root}/v1/models`, { fetchImpl, headers: wireHeaders, timeoutMs, signal: ctx.signal });
    return (json?.data ?? []).map((m) => String(m.id)).filter(Boolean);
  }

  return { id: `anthropic:${model}`, complete, listModels };
}

// --- mapping: normalized → wire -------------------------------------------

function toWirePayload(model, request) {
  const system = request.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const payload = {
    model,
    max_tokens: typeof request.maxTokens === "number" ? request.maxTokens : DEFAULT_MAX_TOKENS,
    messages: toWireMessages(request.messages),
  };
  if (system) payload.system = system;
  if (typeof request.temperature === "number") payload.temperature = request.temperature;
  if (request.tools?.length) {
    payload.tools = request.tools.map((t) => ({
      name: t.name,
      description: t.description ?? "",
      input_schema: t.parameters ?? { type: "object", properties: {} },
    }));
    const choice = toWireToolChoice(request.toolChoice);
    if (choice) payload.tool_choice = choice;
  }
  return payload;
}

function toWireToolChoice(toolChoice) {
  if (!toolChoice || toolChoice === "auto") return null;
  if (toolChoice === "required") return { type: "any" };
  if (toolChoice === "none") return { type: "none" };
  // OpenAI-style named choice: { type: "function", function: { name } }
  const name = toolChoice?.function?.name ?? toolChoice?.name;
  return name ? { type: "tool", name } : null;
}

function toWireMessages(messages) {
  const wire = [];
  for (const m of messages) {
    if (m.role === "system") continue; // hoisted to `system`
    if (m.role === "user") {
      wire.push({ role: "user", content: m.content });
    } else if (m.role === "assistant") {
      const content = m.content.map((p) =>
        p.type === "text"
          ? { type: "text", text: p.text }
          : { type: "tool_use", id: p.id, name: p.name, input: p.arguments ?? {} });
      wire.push({ role: "assistant", content });
    } else if (m.role === "tool") {
      // Tool results live in a `user` turn; consecutive results merge into one (API contract).
      const result = { type: "tool_result", tool_use_id: m.toolCallId, content: m.content };
      const last = wire[wire.length - 1];
      if (last?.role === "user" && Array.isArray(last.content) && last.content.every((c) => c.type === "tool_result")) {
        last.content.push(result);
      } else {
        wire.push({ role: "user", content: [result] });
      }
    }
  }
  return wire;
}

// --- mapping: wire → normalized -------------------------------------------

function fromWireResponse(json) {
  if (!Array.isArray(json?.content)) throw new LlmResponseError("Anthropic response had no content");
  const content = [];
  for (const part of json.content) {
    if (part.type === "text" && part.text) content.push({ type: "text", text: part.text });
    else if (part.type === "tool_use") {
      content.push({ type: "toolCall", id: part.id ?? "", name: part.name ?? "", arguments: part.input ?? {} });
    }
  }
  return {
    message: { role: "assistant", content },
    usage: {
      input: Number(json?.usage?.input_tokens ?? 0),
      output: Number(json?.usage?.output_tokens ?? 0),
    },
    finishReason: mapStopReason(json?.stop_reason),
    raw: json,
  };
}

function mapStopReason(reason) {
  switch (reason) {
    case "end_turn":
    case "stop_sequence":
      return "stop";
    case "tool_use":
      return "tool_calls";
    case "max_tokens":
      return "length";
    default:
      return "unknown";
  }
}
