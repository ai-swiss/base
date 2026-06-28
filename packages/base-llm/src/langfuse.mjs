// Langfuse monitoring wrapper.
//
// Wraps any base-llm model and conforms to the same port ({ id, complete, stream? }),
// so it composes over a single adapter, a MoA, or a Triumvirat. On each call it emits
// a trace + generation to Langfuse's public ingestion API, capturing the input, output,
// token usage, latency, and errors.
//
// Zero new dependencies: no Langfuse SDK, just native fetch against
// `${baseUrl}/api/public/ingestion` with HTTP Basic auth. Ingestion is fire-and-forget
// so it never adds latency to the model call; await `flush()` (e.g. before a CLI exits)
// to drain in-flight sends. Telemetry failures never break the wrapped call.

import { randomUUID } from "node:crypto";
import { LlmConfigError } from "./errors.mjs";
import { getText } from "./types.mjs";

const DEFAULT_BASE_URL = "https://cloud.langfuse.com";

function iso(ms) {
  return new Date(ms).toISOString();
}

function mapUsage(usage) {
  if (!usage) return undefined;
  const input = typeof usage.input === "number" ? usage.input : undefined;
  const output = typeof usage.output === "number" ? usage.output : undefined;
  if (input === undefined && output === undefined) return undefined;
  return {
    ...(input !== undefined ? { input } : {}),
    ...(output !== undefined ? { output } : {}),
    ...(input !== undefined && output !== undefined ? { total: input + output } : {}),
    unit: "TOKENS",
  };
}

/**
 * Wrap a model so every call is traced to Langfuse.
 *
 * @param {object} [options]
 * @param {{ id?: string, complete: Function, stream?: Function }} [options.model] Inner model (required).
 * @param {string} [options.publicKey] Defaults to env LANGFUSE_PUBLIC_KEY.
 * @param {string} [options.secretKey] Defaults to env LANGFUSE_SECRET_KEY.
 * @param {string} [options.baseUrl] Langfuse host. Defaults to env LANGFUSE_HOST or cloud.langfuse.com.
 * @param {*} [options.fetch] fetch implementation (default globalThis.fetch).
 * @param {*} [options.env] Environment object (default process.env).
 * @param {(error: unknown) => void} [options.onError] Called on ingestion failure (default: swallow).
 * @returns {{ id: string, complete: Function, stream?: Function, flush: () => Promise<void> }}
 */
export function createLangfuseModel(options = {}) {
  const {
    model,
    baseUrl,
    fetch: fetchImpl,
    env = process.env,
    onError,
  } = options;

  if (!model || typeof model.complete !== "function") {
    throw new LlmConfigError("createLangfuseModel requires a `model` with complete()");
  }
  // Bind the validated model so it reads as defined inside the closures below.
  const innerModel = model;
  const publicKey = options.publicKey ?? env.LANGFUSE_PUBLIC_KEY;
  const secretKey = options.secretKey ?? env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) {
    throw new LlmConfigError(
      "createLangfuseModel requires publicKey/secretKey (or env LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY)",
    );
  }
  const host = baseUrl ?? env.LANGFUSE_HOST ?? DEFAULT_BASE_URL;
  const doFetch = fetchImpl ?? globalThis.fetch;
  if (typeof doFetch !== "function") {
    throw new LlmConfigError("createLangfuseModel: no fetch available; pass options.fetch");
  }
  const auth = `Basic ${btoa(`${publicKey}:${secretKey}`)}`;
  const name = innerModel.id ?? "base-llm";

  /** @type {Set<Promise<void>>} in-flight ingestion sends, drained by flush(). */
  const pending = new Set();

  /** @param {{ request: any, output?: any, usage?: any, start: number, end: number, error?: any }} args */
  function send({ request, output, usage, start, end, error }) {
    const traceId = randomUUID();
    const events = [
      {
        id: randomUUID(),
        type: "trace-create",
        timestamp: iso(start),
        body: {
          id: traceId,
          name,
          timestamp: iso(start),
          input: request.messages,
          ...(output !== undefined ? { output } : {}),
        },
      },
      {
        id: randomUUID(),
        type: "generation-create",
        timestamp: iso(end),
        body: {
          id: randomUUID(),
          traceId,
          name: "completion",
          model: innerModel.id,
          input: request.messages,
          ...(output !== undefined ? { output } : {}),
          ...(mapUsage(usage) ? { usage: mapUsage(usage) } : {}),
          startTime: iso(start),
          endTime: iso(end),
          ...(error ? { level: "ERROR", statusMessage: String(error?.message ?? error) } : {}),
        },
      },
    ];

    const promise = (async () => {
      try {
        const res = await doFetch(`${host}/api/public/ingestion`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: auth },
          body: JSON.stringify({ batch: events }),
        });
        if (res && res.ok === false) throw new Error(`langfuse ingestion failed: HTTP ${res.status}`);
      } catch (err) {
        if (onError) onError(err);
      }
    })();
    pending.add(promise);
    promise.finally(() => pending.delete(promise));
  }

  async function complete(request, ctx = {}) {
    const start = Date.now();
    let completion;
    try {
      completion = await innerModel.complete(request, ctx);
    } catch (error) {
      send({ request, output: undefined, usage: undefined, start, end: Date.now(), error });
      throw error;
    }
    send({
      request,
      output: getText(completion.message),
      usage: completion.usage,
      start,
      end: Date.now(),
    });
    return completion;
  }

  async function* stream(request, ctx = {}) {
    const innerStream = innerModel.stream;
    if (typeof innerStream !== "function") {
      throw new LlmConfigError("createLangfuseModel: wrapped model does not support streaming");
    }
    const start = Date.now();
    let text = "";
    let usage;
    try {
      for await (const chunk of innerStream.call(innerModel, request, ctx)) {
        if (chunk && typeof chunk.text === "string") text += chunk.text;
        if (chunk && chunk.usage) usage = chunk.usage;
        yield chunk;
      }
    } catch (error) {
      send({ request, output: text || undefined, usage, start, end: Date.now(), error });
      throw error;
    }
    send({ request, output: text, usage, start, end: Date.now() });
  }

  async function flush() {
    await Promise.all([...pending]);
  }

  /** @type {{ id: string, complete: Function, stream?: Function, flush: () => Promise<void> }} */
  const wrapped = { id: innerModel.id ?? "langfuse", complete, flush };
  if (typeof innerModel.stream === "function") wrapped.stream = stream;
  return wrapped;
}
