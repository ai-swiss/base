// Spec coverage: FR-ROUTE-006 FR-ROUTE-008
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createBatchingEmbedder,
  createOllamaEmbedder,
  createOpenAICompatibleEmbedder,
  createSemanticRanker,
} from "../index.mjs";

const noRetryAfter = { get: () => null };

describe("OpenAI-compatible provider robustness", () => {
  it("retries a transient 5xx then succeeds", async () => {
    let calls = 0;
    const embed = createOpenAICompatibleEmbedder({
      model: "m",
      apiKey: "k",
      fetch: async () => {
        calls++;
        if (calls === 1) return { ok: false, status: 503, headers: noRetryAfter, text: async () => "busy" };
        return { ok: true, json: async () => ({ data: [{ index: 0, embedding: [1, 0] }] }) };
      },
    });
    const vector = await embed("hello");
    assert.deepEqual(vector, [1, 0]);
    assert.equal(calls, 2);
  });

  it("does not retry an auth failure and types it", async () => {
    let calls = 0;
    const embed = createOpenAICompatibleEmbedder({
      model: "m",
      fetch: async () => { calls++; return { ok: false, status: 401, headers: noRetryAfter, text: async () => "nope" }; },
    });
    const error = await embed("hi").catch((e) => e);
    assert.equal(error.code, "semantic.auth");
    assert.equal(calls, 1);
  });

  it("types a malformed payload as a response error", async () => {
    const embed = createOpenAICompatibleEmbedder({
      model: "m",
      fetch: async () => ({ ok: true, json: async () => ({ data: [] }) }),
    });
    const error = await embed("hi").catch((e) => e);
    assert.equal(error.code, "semantic.response");
  });

  it("fails fast on missing configuration", () => {
    assert.throws(() => createOpenAICompatibleEmbedder({}), /requires `model`/);
  });

  it("preserves input order by sorting on response index", async () => {
    const embed = createOpenAICompatibleEmbedder({
      model: "m",
      fetch: async () => ({ ok: true, json: async () => ({ data: [{ index: 1, embedding: [0, 1] }, { index: 0, embedding: [1, 0] }] }) }),
    });
    assert.deepEqual(await embed(["first", "second"]), [[1, 0], [0, 1]]);
  });

  it("retries a 429 rate limit and keeps its typed retry semantics", async () => {
    let calls = 0;
    const embed = createOpenAICompatibleEmbedder({
      model: "m",
      fetch: async () => {
        calls++;
        if (calls === 1) return { ok: false, status: 429, headers: { get: () => "0" }, text: async () => "slow down" };
        return { ok: true, json: async () => ({ data: [{ index: 0, embedding: [1, 0] }] }) };
      },
    });
    assert.deepEqual(await embed("hello"), [1, 0]);
    assert.equal(calls, 2);
  });

  it("types invalid provider JSON as a response error", async () => {
    const embed = createOpenAICompatibleEmbedder({
      model: "m",
      fetch: async () => ({ ok: true, json: async () => { throw new Error("not json"); } }),
    });
    const error = await embed("hello").catch((e) => e);
    assert.equal(error.code, "semantic.response");
  });

  it("maps provider timeout and caller abort through the real fetch signal", async () => {
    const timeoutEmbed = createOpenAICompatibleEmbedder({
      model: "m",
      timeoutMs: 5,
      retries: 0,
      fetch: async (_url, init) => new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(new Error("aborted")))),
    });
    assert.equal((await timeoutEmbed("hello").catch((e) => e)).code, "semantic.timeout");

    const controller = new AbortController();
    const abortEmbed = createOpenAICompatibleEmbedder({
      model: "m",
      timeoutMs: 1000,
      fetch: async (_url, init) => new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(new Error("aborted")))),
    });
    const pending = abortEmbed("hello", { signal: controller.signal }).catch((e) => e);
    controller.abort();
    assert.equal((await pending).code, "semantic.abort");
  });
});

describe("Ollama provider robustness", () => {
  it("types a provider 5xx as a network error", async () => {
    const embed = createOllamaEmbedder({
      retries: 0,
      fetch: async () => ({ ok: false, status: 500, headers: noRetryAfter, text: async () => "down" }),
    });
    const error = await embed("x").catch((e) => e);
    assert.equal(error.code, "semantic.network");
  });

  it("types an invalid payload as a response error", async () => {
    const embed = createOllamaEmbedder({
      fetch: async () => ({ ok: true, json: async () => ({ nope: true }) }),
    });
    const error = await embed("x").catch((e) => e);
    assert.equal(error.code, "semantic.response");
  });
});

describe("createBatchingEmbedder", () => {
  it("coalesces concurrent single calls into bounded batches and de-batches in order", async () => {
    const batchSizes = [];
    const embed = async (texts) => { batchSizes.push(texts.length); return texts.map((t) => [t.length]); };
    const batched = createBatchingEmbedder(embed, { maxBatchSize: 3, maxWaitMs: 5, maxConcurrency: 2 });

    const results = await Promise.all(["aa", "bbb", "c", "dddd", "e"].map((t) => batched(t)));

    assert.equal(batchSizes.reduce((a, b) => a + b, 0), 5);
    assert.ok(batchSizes.every((n) => n <= 3), `batches respected maxBatchSize: ${batchSizes}`);
    assert.deepEqual(results, [[2], [3], [1], [4], [1]]);
  });

  it("passes an explicit array straight through as one request", async () => {
    let calls = 0;
    const embed = async (texts) => { calls++; return texts.map(() => [1]); };
    const batched = createBatchingEmbedder(embed);
    assert.deepEqual(await batched(["a", "b"]), [[1], [1]]);
    assert.equal(calls, 1);
  });

  it("propagates a batch failure to every coalesced caller", async () => {
    const batched = createBatchingEmbedder(async () => { throw new Error("boom"); }, { maxWaitMs: 1 });
    const errors = await Promise.all([batched("a").catch((e) => e), batched("b").catch((e) => e)]);
    assert.ok(errors.every((e) => /boom/.test(e.message)));
  });

  it("keeps in-flight batch requests within maxConcurrency", async () => {
    let active = 0;
    let maxActive = 0;
    const embed = async (texts) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active--;
      return texts.map((text) => [text.length]);
    };
    const batched = createBatchingEmbedder(embed, { maxBatchSize: 1, maxWaitMs: 1, maxConcurrency: 2 });

    await Promise.all(["a", "bb", "ccc", "dddd", "eeeee"].map((text) => batched(text)));

    assert.ok(maxActive <= 2, `max concurrency was ${maxActive}`);
  });
});

describe("createSemanticRanker hardening", () => {
  it("throws a typed dimension error on a stale precomputed vector", async () => {
    const ranker = createSemanticRanker({ embed: async () => [1, 0, 0] });
    const error = await ranker({ id: "r", metadata: { routing_embedding: [1, 0] } }, ["x"], { query: "hello" }).catch((e) => e);
    assert.equal(error.code, "semantic.dimension");
  });

  it("can be configured to skip a dimension mismatch instead of throwing", async () => {
    const ranker = createSemanticRanker({ embed: async () => [1, 0, 0], onDimensionMismatch: "skip" });
    const result = await ranker({ id: "r", metadata: { routing_embedding: [1, 0] } }, ["x"], { query: "hello" });
    assert.equal(result.score, 0);
  });

  it("fails fast when neither embed nor getResourceEmbedding is given", () => {
    assert.throws(() => createSemanticRanker({}), /requires `embed`/);
  });

  it("caches the query and resource vectors (one provider call each)", async () => {
    let calls = 0;
    const ranker = createSemanticRanker({ embed: async () => { calls++; return [1, 0]; } });
    await ranker({ id: "a", route_text: "x" }, ["t"], { query: "same" });
    await ranker({ id: "a", route_text: "x" }, ["t"], { query: "same" });
    assert.equal(calls, 2); // query once + resource once, then both cache hits
  });

  it("does not cache a rejected embedding promise", async () => {
    let calls = 0;
    const ranker = createSemanticRanker({
      embed: async () => {
        calls++;
        if (calls === 1) throw new Error("temporary outage");
        return [1, 0];
      },
    });

    await ranker({ id: "a", route_text: "x" }, ["t"], { query: "same" }).catch((e) => e);
    const result = await ranker({ id: "a", route_text: "x" }, ["t"], { query: "same" });

    assert.ok(result.score > 0);
    assert.equal(calls, 3); // failed query, retried query, resource
  });

  it("supports a custom cache and reports query cache hits", async () => {
    const store = new Map();
    const metrics = [];
    const cache = {
      has: (key) => store.has(key),
      get: (key) => store.get(key),
      set: (key, value) => store.set(key, value),
    };
    const ranker = createSemanticRanker({
      cache,
      embed: async () => [1, 0],
      onMetric: (metric) => metrics.push(metric),
    });

    await ranker({ id: "a", route_text: "x" }, ["t"], { query: "same" });
    await ranker({ id: "a", route_text: "x" }, ["t"], { query: "same" });

    assert.equal(metrics[0].cacheHit, false);
    assert.equal(metrics[1].cacheHit, true);
  });

  it("emits a metric per scored resource", async () => {
    const metrics = [];
    const ranker = createSemanticRanker({ embed: async () => [1, 0], onMetric: (m) => metrics.push(m) });
    await ranker({ id: "a", route_text: "x" }, ["t"], { query: "q" });
    assert.equal(metrics.length, 1);
    assert.equal(metrics[0].provider, "semantic");
    assert.equal(metrics[0].dimension, 2);
  });
});
