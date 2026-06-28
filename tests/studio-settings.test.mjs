// Spec coverage: UR-CORE-001 FR-STUDIO-006
// Studio settings: schema validation, secret refusal, locality deduction, model resolution from
// refs, catalog discovery with offline fallback — all against temp dirs and stubbed fetch.

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, afterEach, before, describe, it } from "node:test";
import {
  clearCatalogCache,
  listCatalog,
  probeOllama,
  providerLocality,
  readSettings,
  resetOllamaProbeCache,
  resolveEmbedder,
  resolveModel,
  testProvider,
  writeSettings,
} from "../tools/studio/settings.mjs";
import { routingStrategy } from "../tools/core/router.mjs";

const PROVIDERS = [
  { id: "openai", type: "openai-compatible", baseUrl: "https://api.openai.com/v1", apiKeyEnv: "OPENAI_API_KEY" },
  { id: "local", type: "ollama", baseUrl: "http://localhost:11434/v1" },
  { id: "claude", type: "anthropic", apiKeyEnv: "ANTHROPIC_API_KEY" },
  { id: "gemini", type: "google", apiKeyEnv: "GEMINI_API_KEY" },
];

describe("studio settings — read/write", () => {
  let dir;

  before(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "base-settings-"));
  });
  after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  afterEach(() => clearCatalogCache());

  it("reads empty settings when no file exists", async () => {
    const s = await readSettings(dir);
    assert.deepEqual(s, { providers: [], aliases: {}, defaults: {}, discovered: {}, ensembles: {} });
  });

  it("writes valid settings and reads them back with keyDetected + locality, never the key", async () => {
    await writeSettings(dir, {
      providers: PROVIDERS,
      aliases: { "openai/gpt-4o-mini": "rapide" },
      defaults: { runner: "local/llama3.1", judge: "openai/gpt-4o-mini" },
    });
    const env = { OPENAI_API_KEY: "sk-test" };
    const s = await readSettings(dir, { env });

    assert.equal(s.providers.find((p) => p.id === "openai").keyDetected, true);
    assert.equal(s.providers.find((p) => p.id === "claude").keyDetected, false);
    assert.equal(s.providers.find((p) => p.id === "local").keyDetected, null); // no key needed
    assert.equal(s.providers.find((p) => p.id === "local").locality, "local");
    assert.equal(s.providers.find((p) => p.id === "claude").locality, "remote");
    assert.equal(s.aliases["openai/gpt-4o-mini"], "rapide");
    assert.equal(s.defaults.judge, "openai/gpt-4o-mini");

    // The file on disk never contains a key value.
    const raw = await readFile(path.join(dir, ".ai", "studio.settings.json"), "utf8");
    assert.ok(!raw.includes("sk-test"));
  });

  it("a key-required provider with no apiKeyEnv reflects the default env var, never «aucune requise»", async () => {
    const d = await mkdtemp(path.join(tmpdir(), "base-settings-key-"));
    try {
      await writeSettings(d, { providers: [{ id: "claude", type: "anthropic" }, { id: "local", type: "ollama" }] });
      // anthropic always needs a key → absent without ANTHROPIC_API_KEY (false, not null), present with it.
      assert.equal((await readSettings(d, { env: {} })).providers.find((p) => p.id === "claude").keyDetected, false);
      assert.equal((await readSettings(d, { env: { ANTHROPIC_API_KEY: "k" } })).providers.find((p) => p.id === "claude").keyDetected, true);
      // ollama needs none → null regardless.
      assert.equal((await readSettings(d, { env: {} })).providers.find((p) => p.id === "local").keyDetected, null);
    } finally {
      await rm(d, { recursive: true, force: true });
    }
  });

  it("refuses raw secrets: an apiKey field, or an apiKeyEnv that looks like a value", async () => {
    await assert.rejects(
      () => writeSettings(dir, { providers: [{ id: "x", type: "ollama", apiKey: "sk-secret" }] }),
      /must not contain raw API keys/,
    );
    await assert.rejects(
      () => writeSettings(dir, { providers: [{ id: "x", type: "openai-compatible", apiKeyEnv: "sk-proj-abc123" }] }),
      /environment variable NAME/,
    );
  });

  it("refuses unknown types, duplicate ids and defaults pointing at unknown providers", async () => {
    await assert.rejects(() => writeSettings(dir, { providers: [{ id: "x", type: "azure" }] }), /unknown provider type/);
    await assert.rejects(
      () => writeSettings(dir, { providers: [{ id: "x", type: "ollama" }, { id: "x", type: "ollama" }] }),
      /duplicate provider id/,
    );
    await assert.rejects(
      () => writeSettings(dir, { providers: [{ id: "x", type: "ollama" }], defaults: { judge: "nope/m" } }),
      /unknown provider: nope/,
    );
  });

  it("accepts a valid routing block (both models + k) and reads it back verbatim", async () => {
    await writeSettings(dir, {
      providers: PROVIDERS,
      routing: { embedding_model: "local/qwen3-embedding:0.6b", refiner_model: "local/qwen3:4b", k: 7 },
    });
    const s = await readSettings(dir);
    assert.deepEqual(s.routing, { embedding_model: "local/qwen3-embedding:0.6b", refiner_model: "local/qwen3:4b", k: 7 });
  });

  it("defaults routing.k to 10 when omitted", async () => {
    const clean = await writeSettings(dir, {
      providers: PROVIDERS,
      routing: { embedding_model: "local/embed", refiner_model: "local/refine" },
    });
    assert.equal(clean.routing.k, 10);
  });

  it("a routing block round-trips through routingStrategy to the embedding strategy", async () => {
    await writeSettings(dir, {
      providers: PROVIDERS,
      routing: { embedding_model: "local/embed", refiner_model: "local/refine" },
    });
    const { routing } = await readSettings(dir);
    assert.equal(routingStrategy(routing), "embedding");
    assert.equal(routingStrategy((await readSettings(dir, { env: {} })).routing ?? null), "embedding");
  });

  it("refuses routing with only one of the two models (a half-mode is a misconfiguration)", async () => {
    await assert.rejects(
      () => writeSettings(dir, { providers: PROVIDERS, routing: { embedding_model: "local/embed" } }),
      /both embedding_model and refiner_model, or neither/,
    );
    await assert.rejects(
      () => writeSettings(dir, { providers: PROVIDERS, routing: { refiner_model: "local/refine" } }),
      /both embedding_model and refiner_model, or neither/,
    );
  });

  it("refuses a routing model ref naming an unknown provider", async () => {
    await assert.rejects(
      () => writeSettings(dir, { providers: PROVIDERS, routing: { embedding_model: "nope/embed", refiner_model: "local/refine" } }),
      /routing.embedding_model names unknown provider: nope/,
    );
    await assert.rejects(
      () => writeSettings(dir, { providers: PROVIDERS, routing: { embedding_model: "local/embed", refiner_model: "nope/refine" } }),
      /routing.refiner_model names unknown provider: nope/,
    );
  });

  it("refuses an embedding_model whose provider cannot embed — at write time, not silently at route time", async () => {
    await assert.rejects(
      () => writeSettings(dir, { providers: PROVIDERS, routing: { embedding_model: "claude/sonnet", refiner_model: "claude/sonnet" } }),
      /provider type "anthropic" cannot embed/,
    );
  });

  it("refuses a non-positive-integer routing.k", async () => {
    for (const k of [0, -1, 2.5, "10"]) {
      await assert.rejects(
        () => writeSettings(dir, { providers: PROVIDERS, routing: { embedding_model: "local/embed", refiner_model: "local/refine", k } }),
        /routing.k must be a positive integer/,
      );
    }
  });

  it("drops an absent routing block (no embedding strategy persisted) and a lone k without models", async () => {
    const clean = await writeSettings(dir, { providers: PROVIDERS });
    assert.equal(clean.routing, undefined);
    const cleanK = await writeSettings(dir, { providers: PROVIDERS, routing: { k: 5 } });
    assert.equal(cleanK.routing, undefined, "k alone configures no strategy — both models are the trigger");
  });

  it("deduces locality: ollama/loopback local, anthropic/google remote, override wins", () => {
    assert.equal(providerLocality({ type: "ollama" }), "local");
    assert.equal(providerLocality({ type: "openai-compatible", baseUrl: "http://127.0.0.1:8000/v1" }), "local");
    assert.equal(providerLocality({ type: "openai-compatible", baseUrl: "https://api.mistral.ai/v1" }), "remote");
    assert.equal(providerLocality({ type: "anthropic" }), "remote");
    assert.equal(providerLocality({ type: "google" }), "remote");
    assert.equal(providerLocality({ type: "anthropic", locality: "local" }), "local"); // proxy case, explicit override
  });
});

describe("studio settings — Ollama probe (first-model help)", () => {
  afterEach(() => resetOllamaProbeCache());

  it("reports reachable when the local endpoint answers ok", async () => {
    let calls = 0;
    const fetch = async () => { calls += 1; return { ok: true }; };
    assert.equal(await probeOllama({ fetch, now: () => 1000 }), true);
    assert.equal(calls, 1);
  });

  it("reports not reachable on a failing fetch, never throwing", async () => {
    const fetch = async () => { throw new Error("ECONNREFUSED"); };
    assert.equal(await probeOllama({ fetch, now: () => 1000 }), false);
  });

  it("caches within the TTL: a second call inside the window does not re-fetch", async () => {
    let calls = 0;
    const fetch = async () => { calls += 1; return { ok: true }; };
    await probeOllama({ fetch, now: () => 1000 });
    await probeOllama({ fetch, now: () => 1000 + 5_000 }); // inside 30s TTL
    assert.equal(calls, 1, "second call within TTL should hit the cache");
  });
});

describe("studio settings — resolveModel + catalog", () => {
  let dir;

  before(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "base-settings-cat-"));
    await writeSettings(dir, { providers: PROVIDERS, aliases: { "local/llama3.1": "local" } });
  });
  after(async () => {
    await rm(dir, { recursive: true, force: true });
    clearCatalogCache();
  });
  afterEach(() => clearCatalogCache());

  it("resolves a ref to the right adapter; unknown provider/ref are 400s", async () => {
    const env = { ANTHROPIC_API_KEY: "k", GEMINI_API_KEY: "k", OPENAI_API_KEY: "k" };
    assert.equal((await resolveModel(dir, "local/llama3.1", { env })).id, "ollama:llama3.1");
    assert.equal((await resolveModel(dir, "claude/claude-x", { env })).id, "anthropic:claude-x");
    assert.equal((await resolveModel(dir, "gemini/gemini-2.5-flash", { env })).id, "google:gemini-2.5-flash");
    assert.equal((await resolveModel(dir, "openai/gpt-4o-mini", { env })).id, "openai-compatible:gpt-4o-mini");
    await assert.rejects(() => resolveModel(dir, "nope/m", { env }), (e) => e.code === "BAD_REQUEST");
    await assert.rejects(() => resolveModel(dir, "no-slash", { env }), (e) => e.code === "BAD_REQUEST");
  });

  it("resolveEmbedder builds a working embedder over the SAME provider registry as resolveModel", async () => {
    const env = { OPENAI_API_KEY: "k" };
    // Ollama: the embedder must hit /api/embeddings on the BARE host (the stored chat baseUrl carries
    // /v1, which is stripped). A stub fetch returns a vector and records the URL.
    let ollamaUrl;
    const ollamaFetch = async (url) => {
      ollamaUrl = url;
      return { ok: true, status: 200, json: async () => ({ embedding: [0.1, 0.2, 0.3] }) };
    };
    const ollamaEmbed = await resolveEmbedder(dir, "local/qwen3-embedding:0.6b", { env, fetch: ollamaFetch });
    assert.deepEqual(await ollamaEmbed("bonjour"), [0.1, 0.2, 0.3]);
    assert.equal(ollamaUrl, "http://localhost:11434/api/embeddings", "the /v1 chat suffix is stripped for the embedder endpoint");

    // OpenAI-compatible: the embedder hits /embeddings and parses the OpenAI data shape.
    let openaiUrl;
    const openaiFetch = async (url) => {
      openaiUrl = url;
      return { ok: true, status: 200, json: async () => ({ data: [{ index: 0, embedding: [1, 2] }] }) };
    };
    const openaiEmbed = await resolveEmbedder(dir, "openai/text-embedding-3-small", { env, fetch: openaiFetch });
    assert.deepEqual(await openaiEmbed("hello"), [1, 2]);
    assert.equal(openaiUrl, "https://api.openai.com/v1/embeddings");

    // A provider with no embeddings endpoint (anthropic) fails clearly, not silently.
    await assert.rejects(() => resolveEmbedder(dir, "claude/whatever", { env }), (e) => e.code === "BAD_REQUEST");
    await assert.rejects(() => resolveEmbedder(dir, "nope/m", { env }), (e) => e.code === "BAD_REQUEST");
  });

  it("tolerates a provider-only ref when the provider has exactly one model, else fails clearly", async () => {
    const d = await mkdtemp(path.join(tmpdir(), "base-settings-tol-"));
    try {
      await writeSettings(d, {
        providers: [{ id: "ollama", type: "ollama" }],
        discovered: { ollama: { models: ["llama3.1:latest"], at: "2026-06-21T00:00:00Z" } },
      });
      assert.equal((await resolveModel(d, "ollama", { env: {} })).id, "ollama:llama3.1:latest");
      await writeSettings(d, {
        providers: [{ id: "ollama", type: "ollama" }],
        discovered: { ollama: { models: ["a", "b"], at: "2026-06-21T00:00:00Z" } },
      });
      await assert.rejects(() => resolveModel(d, "ollama", { env: {} }), (e) => e.code === "BAD_REQUEST");
    } finally {
      await rm(d, { recursive: true, force: true });
    }
  });

  it("discovers the catalog per provider, marks unreachable providers offline with their last models", async () => {
    const env = { OPENAI_API_KEY: "k", ANTHROPIC_API_KEY: "k", GEMINI_API_KEY: "k" };
    // First pass: every provider answers.
    const fetchOk = async (url) => {
      const u = String(url);
      const body = u.includes("/api/tags")
        ? { models: [{ name: "llama3.1" }] }
        : u.includes("/v1beta/models")
          ? { models: [{ name: "models/gemini-2.5-flash" }] }
          : { data: [{ id: u.includes("anthropic") ? "claude-sonnet" : "gpt-4o-mini" }] };
      return { ok: true, status: 200, json: async () => body, text: async () => "", headers: { get: () => null } };
    };
    const first = await listCatalog(dir, { env, fetch: fetchOk, refresh: true });
    const refs = first.map((m) => m.ref);
    assert.ok(refs.includes("local/llama3.1"));
    assert.ok(refs.includes("gemini/gemini-2.5-flash"));
    assert.equal(first.find((m) => m.ref === "local/llama3.1").alias, "local");
    assert.ok(first.every((m) => m.online));

    // Second pass: everything is unreachable → last discovery survives, flagged offline.
    const fetchDown = async () => {
      throw new Error("ECONNREFUSED");
    };
    const second = await listCatalog(dir, { env, fetch: fetchDown, refresh: true });
    assert.ok(second.length >= first.length - 1);
    assert.ok(second.every((m) => m.online === false));
    assert.ok(second.map((m) => m.ref).includes("local/llama3.1"));
  });

  it("testProvider reports ok+latency+models on success and the exact error on failure", async () => {
    const env = {};
    const fetchOk = async (url, init) => {
      const u = String(url);
      if (u.includes("/api/tags")) {
        return { ok: true, status: 200, json: async () => ({ models: [{ name: "llama3.1" }] }), text: async () => "", headers: { get: () => null } };
      }
      // the trivial completion
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: "pong" }, finish_reason: "stop" }], usage: {} }),
        text: async () => "",
        headers: { get: () => null },
      };
    };
    const ok = await testProvider(dir, "local", { env, fetch: fetchOk });
    assert.equal(ok.ok, true);
    assert.deepEqual(ok.models, ["llama3.1"]);
    assert.ok(ok.latencyMs >= 0);

    const down = await testProvider(dir, "local", { env, fetch: async () => { throw new Error("ECONNREFUSED"); } });
    assert.equal(down.ok, false);
    assert.match(down.error, /ECONNREFUSED|reach/);

    await assert.rejects(() => testProvider(dir, "nope", { env, fetch: fetchOk }), (e) => e.code === "BAD_REQUEST");
  });

  it("classifies a failed test by base-llm code and names the env var to export", async () => {
    // Anthropic with no key in the environment → LlmConfigError (llm.config) before any fetch; the
    // UI turns code + env into actionable French. The fetch is never reached.
    const r = await testProvider(dir, "claude", { env: {}, fetch: async () => { throw new Error("unused"); } });
    assert.equal(r.ok, false);
    assert.equal(r.code, "llm.config");
    assert.equal(r.env, "ANTHROPIC_API_KEY");
  });
});
