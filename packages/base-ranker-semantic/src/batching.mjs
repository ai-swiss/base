// Coalescing micro-batcher with bounded concurrency.
//
// This is where "batching" and "bounded concurrency" live. A host can fire `embed(text)` once per
// resource; this wrapper buffers concurrent single-text calls and flushes them as grouped requests of
// at most `maxBatchSize`, with at most `maxConcurrency` requests in flight. A burst of N calls becomes
// a few bounded requests instead of N, without the caller orchestrating any of it.
//
// Limitation, stated honestly: once single-text calls are coalesced they share one downstream request,
// so per-call cancellation is best-effort (the batch carries the first caller's signal). Callers that
// need strict per-request cancellation should embed arrays directly (passed straight through) or skip
// batching.

import { SemanticConfigError } from "./errors.mjs";

export function createBatchingEmbedder(embed, options = {}) {
  const { maxBatchSize = 32, maxWaitMs = 10, maxConcurrency = 4 } = options;
  if (typeof embed !== "function") throw new SemanticConfigError("createBatchingEmbedder requires an `embed` function.");
  if (!(maxBatchSize >= 1) || !(maxConcurrency >= 1)) {
    throw new SemanticConfigError("createBatchingEmbedder requires maxBatchSize >= 1 and maxConcurrency >= 1.");
  }

  let queue = []; // { text, resolve, reject, ctx }
  let timer = null;
  let inFlight = 0;

  function scheduleFlush() {
    if (timer || queue.length === 0 || inFlight >= maxConcurrency) return;
    // Not unref'd: queued callers stay pending until this fires, so it must keep the loop alive until
    // the batch is sent (it is cleared in `flush`). It only ever lives for `maxWaitMs`.
    timer = setTimeout(flush, maxWaitMs);
  }

  function flush() {
    if (timer) { clearTimeout(timer); timer = null; }
    while (queue.length > 0 && inFlight < maxConcurrency) {
      const batch = queue.splice(0, maxBatchSize);
      const ctx = batch.find((item) => item.ctx?.signal)?.ctx ?? {};
      inFlight++;
      Promise.resolve()
        .then(() => embed(batch.map((item) => item.text), ctx))
        .then((vectors) => {
          if (!Array.isArray(vectors) || vectors.length !== batch.length) {
            throw new SemanticConfigError(`Batched embedder returned ${vectors?.length} vectors for ${batch.length} inputs.`);
          }
          batch.forEach((item, index) => item.resolve(vectors[index]));
        })
        .catch((error) => batch.forEach((item) => item.reject(error)))
        .finally(() => {
          inFlight--;
          if (queue.length > 0) scheduleFlush();
        });
    }
  }

  return function embedBatched(input, ctx = {}) {
    if (Array.isArray(input)) return embed(input, ctx); // an explicit batch passes straight through
    return new Promise((resolve, reject) => {
      queue.push({ text: input, resolve, reject, ctx });
      if (queue.length >= maxBatchSize && inFlight < maxConcurrency) flush();
      else scheduleFlush();
    });
  };
}
