// Embedding providers. Each is a function `embed(textOrTexts, ctx?) => vector | vectors`, where
// `ctx.signal` is an optional AbortSignal. Providers add no npm dependency: they use the platform
// `fetch` and delegate timeouts, retries and error typing to `transport.mjs`.
//
// There is deliberately no "default" or "best" provider helper — choosing where business text is
// embedded is an explicit decision (see SECURITY.md / the provider-choice guide).

import { EmbeddingResponseError, SemanticConfigError } from "./errors.mjs";
import { httpError, networkError, nowMs, readJson, withDeadline, withRetry } from "./transport.mjs";
import { vectorFrom } from "./vectors.mjs";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;

// OpenAI-compatible `/embeddings` endpoint. Works against OpenAI, Azure OpenAI-style gateways, and
// any internal service that speaks the same JSON shape. Batches natively: an array input becomes one
// request, and results are re-sorted by `index` so order is guaranteed.
export function createOpenAICompatibleEmbedder(options = {}) {
  const {
    apiKey = process.env.OPENAI_API_KEY,
    baseUrl = "https://api.openai.com/v1",
    model,
    fetch: fetchImpl = globalThis.fetch,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    onMetric,
  } = options;

  if (!model) throw new SemanticConfigError("createOpenAICompatibleEmbedder requires `model`.");
  if (typeof fetchImpl !== "function") {
    throw new SemanticConfigError("A fetch implementation is required (Node 18+ provides a global `fetch`, or pass `fetch`).");
  }
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/embeddings`;

  return async function embed(input, ctx = {}) {
    const texts = Array.isArray(input) ? input : [input];
    if (texts.length === 0) return [];

    const started = nowMs();
    const vectors = await withRetry(
      (attempt) =>
        withDeadline(async (signal) => {
          let response;
          try {
            response = await fetchImpl(endpoint, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
                ...headers,
              },
              body: JSON.stringify({ model, input: texts }),
              signal,
            });
          } catch (error) {
            throw networkError(error);
          }
          const failure = await httpError(response);
          if (failure) throw failure;
          const parsed = parseOpenAiPayload(await readJson(response), texts.length);
          onMetric?.({ provider: "openai", batchSize: texts.length, attempt, latencyMs: nowMs() - started });
          return parsed;
        }, { timeoutMs, signal: ctx.signal }),
      { retries },
    );

    return Array.isArray(input) ? vectors : vectors[0];
  };
}

// Optional Ollama helper for a simple local path (`http://localhost:11434`, model `nomic-embed-text`
// by default). Ollama has no batch endpoint, so an array input is embedded sequentially — honest, and
// still robust (each request gets its own timeout/retry/abort).
export function createOllamaEmbedder(options = {}) {
  const {
    baseUrl = "http://localhost:11434",
    model = "nomic-embed-text",
    fetch: fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    onMetric,
  } = options;

  if (typeof fetchImpl !== "function") {
    throw new SemanticConfigError("A fetch implementation is required (Node 18+ provides a global `fetch`, or pass `fetch`).");
  }
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/api/embeddings`;

  async function embedOne(text, ctx) {
    const started = nowMs();
    return withRetry(
      (attempt) =>
        withDeadline(async (signal) => {
          let response;
          try {
            response = await fetchImpl(endpoint, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ model, prompt: text }),
              signal,
            });
          } catch (error) {
            throw networkError(error);
          }
          const failure = await httpError(response);
          if (failure) throw failure;
          const payload = await readJson(response);
          const vector = vectorFrom(payload?.embedding);
          if (!vector) throw new EmbeddingResponseError("Ollama response did not contain a numeric vector.");
          onMetric?.({ provider: "ollama", batchSize: 1, attempt, latencyMs: nowMs() - started });
          return vector;
        }, { timeoutMs, signal: ctx?.signal }),
      { retries },
    );
  }

  return async function embed(input, ctx = {}) {
    if (!Array.isArray(input)) return embedOne(input, ctx);
    const vectors = [];
    for (const text of input) vectors.push(await embedOne(text, ctx));
    return vectors;
  };
}

function parseOpenAiPayload(payload, expected) {
  const data = Array.isArray(payload?.data) ? payload.data.slice() : null;
  if (!data || data.length !== expected) {
    throw new EmbeddingResponseError(`Expected ${expected} embeddings, received ${data?.length ?? 0}.`);
  }
  data.sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0));
  const vectors = data.map((item) => vectorFrom(item?.embedding));
  if (vectors.some((vector) => !vector)) {
    throw new EmbeddingResponseError("Embedding response contained a non-numeric or empty vector.");
  }
  const dimension = vectors[0].length;
  if (vectors.some((vector) => vector.length !== dimension)) {
    throw new EmbeddingResponseError("Embedding response mixed vector dimensions.");
  }
  return vectors;
}
