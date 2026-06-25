// Transport concerns shared by every chat provider: deadlines, cancellation, bounded retries, and
// mapping raw HTTP/network failures to the typed errors in `errors.mjs`. Providers stay thin because
// this cross-cutting robustness lives here, in one tested place. (Mirrors the proven shape of
// `@ai-swiss/base-ranker-semantic`'s transport, retyped for chat.)

import {
  LlmAbortError,
  LlmAuthError,
  LlmNetworkError,
  LlmRateLimitError,
  LlmResponseError,
  LlmTimeoutError,
} from "./errors.mjs";

// Run `fn(signal)` under a timeout and an optional caller signal, linked: whichever fires first
// aborts the work. A timeout surfaces as LlmTimeoutError, a caller abort as LlmAbortError. With
// neither a timeout nor a signal, `fn` runs untouched (zero overhead for simple setups).
/**
 * @param {(signal?: AbortSignal) => Promise<any>} fn
 * @param {{ timeoutMs?: number, signal?: AbortSignal }} [opts]
 */
export async function withDeadline(fn, { timeoutMs, signal } = {}) {
  if (signal?.aborted) throw new LlmAbortError("LLM request aborted before it started.");
  if (!timeoutMs && !signal) return fn(undefined);

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  let timer = null;
  let timedOut = false;

  if (signal) signal.addEventListener("abort", onAbort, { once: true });
  if (timeoutMs) {
    timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  }

  try {
    const result = await fn(controller.signal);
    // fn resolved — but if the deadline (or caller abort) already fired and fn ignored the signal,
    // honor the deadline rather than returning a result the caller has stopped waiting for.
    if (controller.signal.aborted) {
      if (timedOut) throw new LlmTimeoutError(`LLM request exceeded ${timeoutMs}ms.`);
      throw new LlmAbortError("LLM request was aborted.");
    }
    return result;
  } catch (error) {
    if (error instanceof LlmTimeoutError || error instanceof LlmAbortError) throw error;
    if (controller.signal.aborted) {
      if (timedOut) throw new LlmTimeoutError(`LLM request exceeded ${timeoutMs}ms.`, { cause: error });
      throw new LlmAbortError("LLM request was aborted.", { cause: error });
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

// Retry only transient failures (`error.retriable === true`: network, timeout, rate limit). Never
// retry config, auth, malformed-response or abort errors. Exponential backoff with full jitter; a
// numeric `retryAfterMs` hint (from a 429) sets a floor on the delay.
export async function withRetry(fn, options = {}) {
  const { retries = 2, baseDelayMs = 250, maxDelayMs = 8000, sleep = defaultSleep, random = Math.random } = options;
  let attempt = 0;
  for (;;) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (error?.retriable !== true || attempt >= retries) throw error;
      const hinted = typeof error.retryAfterMs === "number" ? error.retryAfterMs : 0;
      const ceiling = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      const delay = Math.max(hinted, Math.floor(ceiling * random())); // full jitter, hint as a floor
      await sleep(delay);
      attempt++;
    }
  }
}

// Map a non-ok Response to a typed error; returns null when the response is ok.
export async function httpError(response) {
  if (response.ok) return null;
  const status = response.status;
  const detail = await safeText(response);
  const opts = { status, retryAfterMs: retryAfterMs(response) };
  if (status === 401 || status === 403) return new LlmAuthError(`LLM auth failed (${status}). ${detail}`, opts);
  if (status === 429) return new LlmRateLimitError(`LLM rate limited (429). ${detail}`, opts);
  if (status >= 500) return new LlmNetworkError(`LLM provider error (${status}). ${detail}`, opts);
  return new LlmResponseError(`LLM request failed (${status}). ${detail}`, opts);
}

// Wrap a thrown fetch/network failure as a typed, retriable network error. An AbortError is passed
// through untouched so `withDeadline` can classify it as timeout vs. abort.
export function networkError(error) {
  if (error instanceof Error && error.name === "AbortError") return error;
  return new LlmNetworkError(`LLM request could not reach the provider: ${error?.message ?? error}`, { cause: error });
}

// One GET-and-parse for the adapters' discovery endpoints (`listModels`): deadline, typed network
// and HTTP errors, JSON parsing — so each adapter contributes only its URL, headers and mapping.
/**
 * @param {string} url
 * @param {{ fetchImpl?: typeof globalThis.fetch, headers?: Record<string, string>, timeoutMs?: number, signal?: AbortSignal }} [options]
 */
export async function getJson(url, { fetchImpl = globalThis.fetch, headers = {}, timeoutMs, signal } = {}) {
  return withDeadline(
    async (innerSignal) => {
      let response;
      try {
        response = await fetchImpl(url, { headers, signal: innerSignal });
      } catch (error) {
        throw networkError(error);
      }
      const err = await httpError(response);
      if (err) throw err;
      return readJson(response);
    },
    { timeoutMs, signal },
  );
}

export async function readJson(response) {
  try {
    return await response.json();
  } catch (error) {
    throw new LlmResponseError("LLM response was not valid JSON.", { cause: error });
  }
}

function retryAfterMs(response) {
  const header = response.headers?.get?.("retry-after");
  if (!header) return 0;
  const seconds = Number(header);
  return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : 0;
}

async function safeText(response) {
  try {
    return typeof response.text === "function" ? (await response.text()).slice(0, 500) : "";
  } catch {
    return "";
  }
}

function defaultSleep(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}
