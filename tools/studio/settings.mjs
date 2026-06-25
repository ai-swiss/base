// Studio settings — providers, aliases, eval defaults and the model catalog (the UI-facing layer).
//
// Contract (non négociable): `.ai/studio.settings.json` holds providers (type, baseUrl, the NAME of
// the key's environment variable), aliases, eval defaults and the last discovery cache. API keys live
// in the server's environment only: never persisted, never sent to the browser (the API exposes a
// `keyDetected` boolean per provider, nothing more), and a settings payload carrying a raw secret is
// refused at write time.
//
// Reading the file and resolving model/embedder refs are CORE concerns (the broker needs them), so
// they live in tools/core/model-settings.mjs and are RE-EXPORTED here unchanged. This module keeps the
// UI-only concerns: validated writes, the discovery catalog, the connection test, and the Ollama probe.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "../core/api-error.mjs";
import {
  DEFAULT_BASE_URLS,
  DEFAULT_KEY_ENV,
  EMBEDDING_PROVIDER_TYPES,
  buildProviderModel,
  readSettings,
  settingsPath,
} from "../core/model-settings.mjs";

// The core read/resolve seam, re-exported so existing importers (the broker, the eval runner, the
// Studio server) keep importing from one place. The canonical home is tools/core/model-settings.mjs.
export { readSettings, resolveModel, resolveEmbedder, settingsPath, providerLocality } from "../core/model-settings.mjs";

const PROVIDER_TYPES = new Set(["openai-compatible", "ollama", "anthropic", "google"]);
const ENV_NAME = /^[A-Z][A-Z0-9_]*$/; // an environment VARIABLE NAME, never a key value
const DISCOVERY_TIMEOUT_MS = 2_000;
const DISCOVERY_CACHE_MS = 5 * 60_000;
// The embedding strategy (embeddings → refiner) candidate count: how many the refiner sees, not a tuned threshold.
const DEFAULT_ROUTING_K = 10;

/**
 * Validate then write the settings. Refuses: unknown provider types, duplicate ids, default refs
 * pointing at unknown providers, a `routing` block with only one of the two models (or a model ref
 * naming an unknown provider, or a non-positive-integer `k`), and ANY value that looks like a raw
 * secret (`apiKey` field, or an `apiKeyEnv` that is not an environment variable name).
 * `keyDetected`/`locality` decorations from readSettings are stripped (locality is kept only when
 * explicitly "local"/"remote").
 */
export async function writeSettings(contextDir, settings) {
  if (!settings || typeof settings !== "object") throw new ApiError("settings must be an object", "BAD_REQUEST");
  const providers = Array.isArray(settings.providers) ? settings.providers : [];
  const ids = new Set();
  /** @type {{ providers: any[], aliases: Record<string, string>, defaults: Record<string, string>, discovered: Record<string, { models: string[], at: string }>, routing?: { embedding_model: string, refiner_model: string, k: number } }} */
  const clean = { providers: [], aliases: {}, defaults: {}, discovered: {} };

  for (const p of providers) {
    if (!p || typeof p !== "object") throw new ApiError("each provider must be an object", "BAD_REQUEST");
    if ("apiKey" in p || "api_key" in p || "key" in p) {
      throw new ApiError("settings must not contain raw API keys — set the key in the server environment and name it via apiKeyEnv", "BAD_REQUEST");
    }
    const id = String(p.id ?? "").trim();
    if (!id) throw new ApiError("each provider needs an id", "BAD_REQUEST");
    if (ids.has(id)) throw new ApiError(`duplicate provider id: ${id}`, "BAD_REQUEST");
    ids.add(id);
    if (!PROVIDER_TYPES.has(p.type)) throw new ApiError(`unknown provider type: ${p.type}`, "BAD_REQUEST");
    if (p.baseUrl != null && !/^https?:\/\//.test(String(p.baseUrl))) {
      throw new ApiError(`provider ${id}: baseUrl must be http(s)`, "BAD_REQUEST");
    }
    if (p.apiKeyEnv != null && !ENV_NAME.test(String(p.apiKeyEnv))) {
      throw new ApiError(`provider ${id}: apiKeyEnv must be an environment variable NAME (got something that looks like a value)`, "BAD_REQUEST");
    }
    const entry = { id, type: p.type };
    if (p.baseUrl) entry.baseUrl = String(p.baseUrl);
    if (p.apiKeyEnv) entry.apiKeyEnv = String(p.apiKeyEnv);
    if (p.locality === "local" || p.locality === "remote") entry.locality = p.locality;
    clean.providers.push(entry);
  }

  if (settings.aliases && typeof settings.aliases === "object") {
    for (const [ref, name] of Object.entries(settings.aliases)) {
      if (typeof name === "string" && name.trim()) clean.aliases[ref] = name.trim();
    }
  }
  for (const role of ["runner", "judge"]) {
    const ref = settings.defaults?.[role];
    if (ref == null || ref === "") continue;
    requireKnownProvider(ref, ids, `defaults.${role}`);
    clean.defaults[role] = String(ref);
  }
  const routing = cleanRouting(settings.routing, clean.providers);
  if (routing) clean.routing = routing;
  if (settings.discovered && typeof settings.discovered === "object") {
    for (const [providerId, d] of Object.entries(settings.discovered)) {
      if (ids.has(providerId) && Array.isArray(d?.models)) {
        clean.discovered[providerId] = { models: d.models.map(String), at: String(d.at ?? "") };
      }
    }
  }

  const file = settingsPath(contextDir);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(clean, null, 2)}\n`);
  return clean;
}

// A `<providerId>/<model>` ref must name a configured provider — the SAME check the eval defaults use,
// so routing models and eval models share one registry and one validation.
function requireKnownProvider(ref, ids, label) {
  const providerId = String(ref).split("/")[0];
  if (!ids.has(providerId)) throw new ApiError(`${label} names unknown provider: ${providerId}`, "BAD_REQUEST");
}

/**
 * Validate the optional embedding-strategy `routing` block: `{ embedding_model, refiner_model, k }`.
 * Absent → undefined (the lexical strategy). The two models are all-or-nothing. Each ref names a known
 * provider, and the embedding ref's provider must be able to embed; `k`, if present, is a positive
 * integer (default 10). Returns the clean block or undefined.
 */
function cleanRouting(routing, providers) {
  if (routing == null) return undefined;
  if (typeof routing !== "object" || Array.isArray(routing)) throw new ApiError("routing must be an object", "BAD_REQUEST");
  const embedding = routing.embedding_model;
  const refiner = routing.refiner_model;
  const hasEmbedding = embedding != null && embedding !== "";
  const hasRefiner = refiner != null && refiner !== "";
  if (hasEmbedding !== hasRefiner) {
    throw new ApiError("routing needs both embedding_model and refiner_model, or neither", "BAD_REQUEST");
  }
  let k = DEFAULT_ROUTING_K;
  if (routing.k != null) {
    if (!Number.isInteger(routing.k) || routing.k < 1) throw new ApiError("routing.k must be a positive integer", "BAD_REQUEST");
    k = routing.k;
  }
  if (!hasEmbedding) return undefined; // no models → no embedding-strategy block (a lone k is dropped)
  const ids = new Set(providers.map((p) => p.id));
  requireKnownProvider(embedding, ids, "routing.embedding_model");
  requireKnownProvider(refiner, ids, "routing.refiner_model");
  const embeddingType = providers.find((p) => p.id === String(embedding).split("/")[0])?.type;
  if (!EMBEDDING_PROVIDER_TYPES.has(embeddingType)) {
    throw new ApiError(`routing.embedding_model provider type "${embeddingType}" cannot embed; use an ollama or openai-compatible provider`, "BAD_REQUEST");
  }
  return { embedding_model: String(embedding), refiner_model: String(refiner), k };
}

// In-memory discovery cache, keyed by contextDir (a few minutes; `refresh` bypasses it).
const catalogCache = new Map();

/**
 * The resolved model catalog for the pickers: one entry per (provider, model), with the alias and an
 * `online` flag. Discovery (`listModels`, 2 s deadline) per provider; a provider that cannot be reached
 * falls back to its last persisted discovery, marked offline. Successful discoveries are persisted back
 * into the settings file so the fallback stays fresh.
 */
export async function listCatalog(contextDir, { refresh = false, env = process.env, fetch, now = Date.now } = /** @type {{ refresh?: boolean, env?: NodeJS.ProcessEnv, fetch?: typeof globalThis.fetch, now?: () => number }} */ ({})) {
  const cached = catalogCache.get(contextDir);
  if (!refresh && cached && now() - cached.at < DISCOVERY_CACHE_MS) return cached.catalog;

  const settings = await readSettings(contextDir, { env });
  const discovered = { ...settings.discovered };
  const catalog = [];
  let discoveryChanged = false;

  for (const provider of settings.providers) {
    let models = null;
    let online = true;
    try {
      const probe = await buildProviderModel(provider, "probe", { env, fetch, timeoutMs: DISCOVERY_TIMEOUT_MS });
      models = (await probe.listModels?.()) ?? [];
    } catch {
      online = false;
      models = discovered[provider.id]?.models ?? [];
    }
    if (online) {
      discovered[provider.id] = { models, at: new Date(now()).toISOString() };
      discoveryChanged = true;
    }
    for (const model of models) {
      const ref = `${provider.id}/${model}`;
      catalog.push({
        ref,
        providerId: provider.id,
        model,
        alias: settings.aliases[ref] ?? null,
        locality: provider.locality,
        online,
      });
    }
  }

  if (discoveryChanged) {
    await writeSettings(contextDir, { ...settings, discovered });
  }
  catalogCache.set(contextDir, { at: now(), catalog });
  return catalog;
}

/** Drop the in-memory discovery cache (tests, and after settings writes). */
export function clearCatalogCache() {
  catalogCache.clear();
}

// First-model help: is an Ollama instance reachable on this machine? A DIRECT fetch of the default
// base URL (NOT testProvider, which needs a configured provider) with a short timeout. Cached briefly
// so several panels asking at once don't each pay the round-trip. Never throws.
const OLLAMA_PROBE_TTL_MS = 30_000;
let ollamaProbeCache = null; // { at, reachable }

export async function probeOllama({ fetch = globalThis.fetch, now = Date.now } = {}) {
  if (ollamaProbeCache && now() - ollamaProbeCache.at < OLLAMA_PROBE_TTL_MS) return ollamaProbeCache.reachable;
  let reachable = false;
  try {
    const res = await fetch(`${DEFAULT_BASE_URLS.ollama}/models`, { signal: AbortSignal.timeout(1_000) });
    reachable = res.ok;
  } catch {
    reachable = false;
  }
  ollamaProbeCache = { at: now(), reachable };
  return reachable;
}

/** Test-only: forget the probe cache so a test controls every call. */
export function resetOllamaProbeCache() {
  ollamaProbeCache = null;
}

/**
 * Connection test for one provider: discovery then a trivial completion. Returns
 * `{ ok, latencyMs, models }`, or `{ ok: false, error }` with the exact provider error.
 */
export async function testProvider(contextDir, providerId, { env = process.env, fetch } = /** @type {{ env?: NodeJS.ProcessEnv, fetch?: typeof globalThis.fetch }} */ ({})) {
  const settings = await readSettings(contextDir, { env });
  const provider = settings.providers.find((p) => p.id === providerId);
  if (!provider) throw new ApiError(`unknown provider: ${providerId}`, "BAD_REQUEST");
  const url = provider.baseUrl ?? DEFAULT_BASE_URLS[provider.type];
  const started = Date.now();
  try {
    const probe = await buildProviderModel(provider, "probe", { env, fetch, timeoutMs: DISCOVERY_TIMEOUT_MS });
    const models = (await probe.listModels?.()) ?? [];
    const first = models[0];
    if (first) {
      const model = await buildProviderModel(provider, first, { env, fetch });
      await model.complete({ messages: [{ role: "user", content: "ping" }], maxTokens: 1 });
    }
    return { ok: true, latencyMs: Date.now() - started, models, url };
  } catch (error) {
    const keyEnv = provider.apiKeyEnv ?? DEFAULT_KEY_ENV[provider.type];
    const result = { ok: false, latencyMs: Date.now() - started, url, error: String(error?.message ?? error) };
    if (typeof error?.code === "string") result.code = error.code;
    if (keyEnv) result.env = keyEnv;
    return result;
  }
}
