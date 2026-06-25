// OpenAI-compatible chat adapter — implements the LanguageModel port over the widely-spoken
// `/chat/completions` wire API. This is one *wire API*; many *providers* speak it (OpenAI, Azure-style
// gateways, vLLM, LM Studio, Ollama, …), so we implement it ONCE and let providers be config
// (baseUrl + auth + model). That is pi's API-vs-provider separation, in miniature.
//
// The translation here is the anti-corruption layer: normalized messages/tools go in, provider wire
// goes out, and the provider's reply is normalized back. Nothing provider-shaped escapes this file.

import { LlmConfigError, LlmResponseError } from "./errors.mjs";
import { createChunkAssembler, parseEventStream } from "./streaming.mjs";
import { getJson, httpError, networkError, readJson, withDeadline, withRetry } from "./transport.mjs";
import { assertValidRequest } from "./types.mjs";

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_RETRIES = 2;

export function createOpenAICompatibleModel(options = {}) {
  const {
    apiKey = process.env.OPENAI_API_KEY,
    baseUrl = "https://api.openai.com/v1",
    model,
    fetch: fetchImpl = globalThis.fetch,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    requireApiKey = true,
  } = options;

  if (!model) throw new LlmConfigError("createOpenAICompatibleModel requires a `model`");
  if (typeof fetchImpl !== "function") throw new LlmConfigError("no fetch implementation available (pass `fetch`)");
  if (requireApiKey && !apiKey) throw new LlmConfigError("createOpenAICompatibleModel requires an `apiKey` (or set requireApiKey:false)");

  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  async function complete(request, ctx = {}) {
    assertValidRequest(request);
    const payload = toWirePayload(model, request);

    return withRetry(
      () =>
        withDeadline(
          async (signal) => {
            let response;
            try {
              response = await fetchImpl(url, {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
                  ...headers,
                },
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

  // Streaming variant. Single attempt (no mid-stream retry): a stream that has begun emitting cannot
  // be safely replayed. Yields live text-delta events, then one consolidated tool-call event per call,
  // then a `done` event carrying the fully-assembled Completion.
  async function* stream(request, ctx = {}) {
    assertValidRequest(request);
    const payload = { ...toWirePayload(model, request), stream: true, stream_options: { include_usage: true } };

    const response = await withDeadline(
      async (signal) => {
        let res;
        try {
          res = await fetchImpl(url, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              accept: "text/event-stream",
              ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
              ...headers,
            },
            body: JSON.stringify(payload),
            signal,
          });
        } catch (error) {
          throw networkError(error);
        }
        const err = await httpError(res);
        if (err) throw err;
        return res;
      },
      { timeoutMs, signal: ctx.signal },
    );

    const assembler = createChunkAssembler();
    for await (const evt of parseEventStream(response.body)) {
      if (evt === "[DONE]") break;
      for (const out of assembler.addChunk(evt)) yield out;
    }
    for (const out of assembler.toolCallEvents()) yield out;
    yield { type: "done", completion: assembler.finalize() };
  }

  // Model discovery (`GET /v1/models`) — the optional port extension used by the catalog.
  async function listModels(ctx = {}) {
    const json = await getJson(`${baseUrl.replace(/\/$/, "")}/models`, {
      fetchImpl,
      headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}), ...headers },
      timeoutMs,
      signal: ctx.signal,
    });
    return (json?.data ?? []).map((m) => String(m.id)).filter(Boolean);
  }

  return { id: `openai-compatible:${model}`, complete, stream, listModels };
}

// Ollama ships an OpenAI-compatible `/v1/chat/completions` endpoint, so it is just a *provider* over
// the same wire API: local baseUrl, no API key required. Discovery uses Ollama's native
// `GET /api/tags` (its `/v1/models` is not always present), so listModels is overridden here.
export function createOllamaModel(options = {}) {
  const { baseUrl = "http://localhost:11434/v1", model = "qwen3.5:9b-q4_K_M", ...rest } = options;
  const inner = createOpenAICompatibleModel({ ...rest, baseUrl, model, requireApiKey: false });
  const opts = /** @type {{ fetch?: typeof globalThis.fetch, timeoutMs?: number }} */ (rest);
  const tagsUrl = `${baseUrl.replace(/\/$/, "").replace(/\/v1$/, "")}/api/tags`;

  async function listModels(ctx = {}) {
    const json = await getJson(tagsUrl, {
      fetchImpl: opts.fetch ?? globalThis.fetch,
      timeoutMs: opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      signal: ctx.signal,
    });
    return (json?.models ?? []).map((m) => String(m.name)).filter(Boolean);
  }

  return { ...inner, id: `ollama:${model}`, listModels };
}

// --- mapping: normalized → wire -------------------------------------------

function toWirePayload(model, request) {
  const payload = { model, messages: request.messages.map(toWireMessage) };
  if (request.tools?.length) {
    payload.tools = request.tools.map((t) => ({
      type: "function",
      function: { name: t.name, description: t.description ?? "", parameters: t.parameters ?? { type: "object", properties: {} } },
    }));
    if (request.toolChoice) payload.tool_choice = request.toolChoice;
  }
  if (typeof request.temperature === "number") payload.temperature = request.temperature;
  if (typeof request.maxTokens === "number") payload.max_tokens = request.maxTokens;
  // Structured-output hint, e.g. { type: "json_object" }. Supported by OpenAI and Ollama's
  // OpenAI-compatible endpoint; providers that ignore it simply return normal text.
  if (request.responseFormat) payload.response_format = request.responseFormat;
  return payload;
}

function toWireMessage(m) {
  if (m.role === "tool") return { role: "tool", tool_call_id: m.toolCallId, content: m.content };
  if (m.role !== "assistant") return { role: m.role, content: m.content };

  const text = m.content.filter((p) => p.type === "text").map((p) => p.text).join("");
  const toolCalls = m.content
    .filter((p) => p.type === "toolCall")
    .map((p) => ({ id: p.id, type: "function", function: { name: p.name, arguments: JSON.stringify(p.arguments ?? {}) } }));
  const wire = { role: "assistant", content: text || null };
  if (toolCalls.length) wire.tool_calls = toolCalls;
  return wire;
}

// --- mapping: wire → normalized -------------------------------------------

function fromWireResponse(json) {
  const choice = json?.choices?.[0];
  if (!choice) throw new LlmResponseError("response had no choices");
  const wireMsg = choice.message ?? {};

  const content = [];
  if (typeof wireMsg.content === "string" && wireMsg.content.length > 0) {
    content.push({ type: "text", text: wireMsg.content });
  }
  for (const tc of wireMsg.tool_calls ?? []) {
    content.push({
      type: "toolCall",
      id: tc.id ?? "",
      name: tc.function?.name ?? "",
      arguments: parseArguments(tc.function?.arguments),
    });
  }

  return {
    message: { role: "assistant", content },
    usage: {
      input: Number(json?.usage?.prompt_tokens ?? 0),
      output: Number(json?.usage?.completion_tokens ?? 0),
    },
    finishReason: mapFinishReason(choice.finish_reason),
    raw: json,
  };
}

function parseArguments(argsString) {
  if (argsString == null || argsString === "") return {};
  if (typeof argsString === "object") return argsString; // some gateways already return an object
  try {
    return JSON.parse(argsString);
  } catch (error) {
    throw new LlmResponseError(`tool-call arguments were not valid JSON: ${String(argsString).slice(0, 120)}`, { cause: error });
  }
}

function mapFinishReason(reason) {
  switch (reason) {
    case "stop":
      return "stop";
    case "tool_calls":
    case "function_call":
      return "tool_calls";
    case "length":
      return "length";
    case "content_filter":
      return "content_filter";
    default:
      return "unknown";
  }
}
