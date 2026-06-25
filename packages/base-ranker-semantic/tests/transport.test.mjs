// Spec coverage: FR-ROUTE-008
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { withDeadline, withRetry } from "../src/transport.mjs";

describe("withDeadline", () => {
  it("maps an expired timeout to a typed timeout error", async () => {
    const error = await withDeadline(
      (signal) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")))),
      { timeoutMs: 10 },
    ).catch((e) => e);
    assert.equal(error.code, "semantic.timeout");
    assert.equal(error.retriable, true);
  });

  it("maps a caller abort to a typed, non-retriable abort error", async () => {
    const controller = new AbortController();
    const pending = withDeadline(
      (signal) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")))),
      { signal: controller.signal, timeoutMs: 5000 },
    ).catch((e) => e);
    controller.abort();
    const error = await pending;
    assert.equal(error.code, "semantic.abort");
    assert.equal(error.retriable, false);
  });

  it("rejects immediately when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const error = await withDeadline(() => Promise.resolve("never"), { signal: controller.signal }).catch((e) => e);
    assert.equal(error.code, "semantic.abort");
  });

  it("runs untouched when neither timeout nor signal is given", async () => {
    assert.equal(await withDeadline(() => Promise.resolve("plain")), "plain");
  });

  it("honours the deadline even when fn ignores the abort signal and resolves late", async () => {
    // A misbehaving transport that never observes the signal and resolves AFTER the timeout fired
    // must still surface a timeout, not the stale value the caller stopped waiting for.
    const error = await withDeadline(
      () => new Promise((resolve) => { setTimeout(() => resolve("too late"), 30); }),
      { timeoutMs: 10 },
    ).catch((e) => e);
    assert.equal(error.code, "semantic.timeout");
    assert.equal(error.retriable, true);
  });
});

describe("withRetry", () => {
  it("retries only transient failures, with exponential backoff and full jitter", async () => {
    const delays = [];
    let attempts = 0;
    const result = await withRetry(
      (attempt) => {
        attempts++;
        if (attempt < 2) throw Object.assign(new Error("transient"), { retriable: true });
        return "ok";
      },
      { retries: 3, baseDelayMs: 100, sleep: (ms) => { delays.push(ms); return Promise.resolve(); }, random: () => 0.5 },
    );
    assert.equal(result, "ok");
    assert.equal(attempts, 3);
    assert.deepEqual(delays, [50, 100]); // floor(100·2^0·0.5), floor(100·2^1·0.5)
  });

  it("never retries a non-retriable error", async () => {
    let attempts = 0;
    const error = await withRetry(
      () => { attempts++; throw Object.assign(new Error("config"), { retriable: false }); },
      { retries: 5, sleep: () => Promise.resolve() },
    ).catch((e) => e);
    assert.equal(attempts, 1);
    assert.match(error.message, /config/);
  });

  it("honours a Retry-After hint as a floor on the delay", async () => {
    const delays = [];
    await withRetry(
      (attempt) => {
        if (attempt < 1) throw Object.assign(new Error("429"), { retriable: true, retryAfterMs: 1234 });
        return "ok";
      },
      { retries: 2, baseDelayMs: 100, sleep: (ms) => { delays.push(ms); return Promise.resolve(); }, random: () => 0 },
    );
    assert.deepEqual(delays, [1234]);
  });

  it("gives up after the retry budget and rethrows the last error", async () => {
    let attempts = 0;
    const error = await withRetry(
      () => { attempts++; throw Object.assign(new Error("still down"), { retriable: true }); },
      { retries: 2, baseDelayMs: 1, sleep: () => Promise.resolve(), random: () => 0 },
    ).catch((e) => e);
    assert.equal(attempts, 3); // initial + 2 retries
    assert.match(error.message, /still down/);
  });
});
