// Transport concerns shared by every provider: deadlines, cancellation, bounded retries, and
// mapping raw HTTP/network failures to the typed errors in `errors.mjs`. Providers stay small
// because the cross-cutting robustness lives here, in one tested place.

import {
  EmbeddingAbortError,
  EmbeddingAuthError,
  EmbeddingNetworkError,
  EmbeddingRateLimitError,
  EmbeddingResponseError,
  EmbeddingTimeoutError,
} from "./errors.mjs";

// Run `fn(signal)` under a timeout and an optional caller signal, linked: whichever fires first
// aborts the work. A timeout surfaces as EmbeddingTimeoutError, a caller abort as EmbeddingAbortError.
// When neither a timeout nor a signal is given, `fn` runs untouched (zero overhead for simple setups).
/**
 * @param {(signal?: AbortSignal) => Promise<any>} fn
 * @param {{ timeoutMs?: number, signal?: AbortSignal }} [opts]
 */
export async function withDeadline(fn, { timeoutMs, signal } = {}) {
  if (signal?.aborted) throw new EmbeddingAbortError("Embedding request aborted before it started.");
  if (!timeoutMs && !signal) return fn(undefined);

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  let timer = null;
  let timedOut = false;

  if (signal) signal.addEventListener("abort", onAbort, { once: true });
  if (timeoutMs) {
    // Not unref'd on purpose: the deadline must fire even when the awaited operation is the only
    // pending work, so a timeout is reliable. It is always cleared in `finally`, so it never outlives
    // the operation. (An unref'd timer also makes node:test report a hung promise on Node 20.)
    timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  }

  try {
    const result = await fn(controller.signal);
    // fn resolved — but if the deadline (or caller abort) already fired and fn ignored the signal,
    // honor the deadline rather than returning a result the caller has stopped waiting for.
    if (controller.signal.aborted) {
      if (timedOut) throw new EmbeddingTimeoutError(`Embedding request exceeded ${timeoutMs}ms.`);
      throw new EmbeddingAbortError("Embedding request was aborted.");
    }
    return result;
  } catch (error) {
    if (error instanceof EmbeddingTimeoutError || error instanceof EmbeddingAbortError) throw error;
    if (controller.signal.aborted) {
      if (timedOut) throw new EmbeddingTimeoutError(`Embedding request exceeded ${timeoutMs}ms.`, { cause: error });
      throw new EmbeddingAbortError("Embedding request was aborted.", { cause: error });
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

// Retry only transient failures (`error.retriable === true`: network, timeout, rate limit). Never
// retry configuration, auth, malformed-response, dimension, or abort errors. Exponential backoff
// with full jitter; a numeric `retryAfterMs` hint (from a 429) sets a floor on the delay.
export async function withRetry(fn, options = {}) {
  const { retries = 2, baseDelayMs = 200, maxDelayMs = 4000, sleep = defaultSleep, random = Math.random } = options;
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
  if (status === 401 || status === 403) return new EmbeddingAuthError(`Embedding auth failed (${status}). ${detail}`, opts);
  if (status === 429) return new EmbeddingRateLimitError(`Embedding rate limited (429). ${detail}`, opts);
  if (status >= 500) return new EmbeddingNetworkError(`Embedding provider error (${status}). ${detail}`, opts);
  return new EmbeddingResponseError(`Embedding request failed (${status}). ${detail}`, opts);
}

// Wrap a thrown fetch/network failure as a typed, retriable network error. An AbortError is passed
// through untouched so `withDeadline` can classify it as timeout vs. abort.
export function networkError(error) {
  if (error instanceof Error && error.name === "AbortError") return error;
  return new EmbeddingNetworkError(`Embedding request could not reach the provider: ${error?.message ?? error}`, { cause: error });
}

export async function readJson(response) {
  try {
    return await response.json();
  } catch (error) {
    throw new EmbeddingResponseError("Embedding response was not valid JSON.", { cause: error });
  }
}

export function nowMs() {
  return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
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
  // Not unref'd: the backoff delay must elapse before the retry proceeds; the promise resolves when it
  // fires, so it cannot outlive the wait.
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}
