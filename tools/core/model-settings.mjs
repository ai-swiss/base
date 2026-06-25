// tools/core/model-settings.mjs — reading the settings file and resolving model/embedder refs.
//
// These are CORE concerns: the embedding routing strategy (route-broker) needs to read the `routing`
// block and turn `<providerId>/<model>` refs into LanguageModel / embedder adapters. They live here,
// not in tools/studio/, so the core (and the published MCP bundle, which ships tools/core/ only) never
// depends on the Studio layer. The Studio settings module (tools/studio/settings.mjs) re-exports these
// and adds the UI-only concerns (write/validate, discovery catalog, connection test, Ollama probe).
//
// Companion packages (@ai-swiss/base-llm, @ai-swiss/base-ranker-semantic) are imported DYNAMICALLY so
// the core stays dependency-free on the `base validate` / lexical-routing path, where no model is built.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "./api-error.mjs";

const SETTINGS_SUBPATH = path.join(".ai", "studio.settings.json");

// The URL actually hit per provider type when no baseUrl is set.
export const DEFAULT_BASE_URLS = {
  "openai-compatible": "https://api.openai.com/v1",
  ollama: "http://localhost:11434/v1",
  anthropic: "https://api.anthropic.com",
  google: "https://generativelanguage.googleapis.com",
};
// The conventional key env var per provider type (`null` for ollama: no key needed).
export const DEFAULT_KEY_ENV = {
  "openai-compatible": "OPENAI_API_KEY",
  ollama: null,
  anthropic: "ANTHROPIC_API_KEY",
  google: "GEMINI_API_KEY",
};
// Types that ALWAYS need a key, so "clé: aucune requise" would be a lie even without an explicit apiKeyEnv.
const KEY_REQUIRED_TYPES = new Set(["anthropic", "google"]);
// The provider types that can embed (anthropic/google have no embeddings endpoint).
const EMBEDDING_PROVIDER_TYPES = new Set(["ollama", "openai-compatible"]);

const EMPTY = { providers: [], aliases: {}, defaults: {}, discovered: {} };
const LOOPBACK = /^(localhost|127\.0\.0\.1|\[?::1\]?)$/i;

/**
 * Deduce a provider's locality: Ollama and loopback baseUrls are local; anthropic and google are
 * remote by construction; anything else is remote. An explicit `locality` always wins.
 */
export function providerLocality(provider) {
  if (provider.locality === "local" || provider.locality === "remote") return provider.locality;
  if (provider.type === "ollama") return "local";
  if (provider.type === "anthropic" || provider.type === "google") return "remote";
  try {
    return LOOPBACK.test(new URL(provider.baseUrl ?? "").hostname) ? "local" : "remote";
  } catch {
    return "remote";
  }
}

export function settingsPath(contextDir) {
  return path.join(contextDir, SETTINGS_SUBPATH);
}

/**
 * Read the settings (missing file → empty settings). Each provider is decorated with `keyDetected`
 * (the env var is set; null when no key is needed) and its effective `locality` — never with the key
 * itself. The optional `routing` block (the embedding strategy's two models + `k`) passes through
 * verbatim: the broker reads it and resolves the models via `resolveModel` / `resolveEmbedder`.
 */
export async function readSettings(contextDir, { env = process.env } = {}) {
  let raw;
  try {
    raw = await readFile(settingsPath(contextDir), "utf8");
  } catch {
    return structuredClone(EMPTY);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new ApiError(`studio.settings.json is not valid JSON: ${error.message}`, "BAD_REQUEST");
  }
  const settings = { ...structuredClone(EMPTY), ...data };
  settings.providers = settings.providers.map((p) => {
    const keyEnv = p.apiKeyEnv ?? (KEY_REQUIRED_TYPES.has(p.type) ? DEFAULT_KEY_ENV[p.type] : null);
    return {
      ...p,
      locality: providerLocality(p),
      keyDetected: keyEnv ? Boolean(env[keyEnv]) : null,
    };
  });
  return settings;
}

/**
 * Build a LanguageModel from a `<providerId>/<model>` ref against the configured providers. The key is
 * read from the environment via the provider's apiKeyEnv. Unknown provider → BAD_REQUEST.
 */
export async function resolveModel(contextDir, ref, { env = process.env, fetch, timeoutMs } = /** @type {{ env?: NodeJS.ProcessEnv, fetch?: typeof globalThis.fetch, timeoutMs?: number }} */ ({})) {
  const { provider, model } = await resolveProviderModel(contextDir, ref, { env });
  return await buildProviderModel(provider, model, { env, fetch, timeoutMs });
}

/**
 * Resolve a `<providerId>/<model>` ref to its configured provider + model name — shared by resolveModel
 * and resolveEmbedder, so a chat model and an embedder of the same provider go through ONE registry and
 * one validation. Tolerant of a provider-only ref (single discovered model); ambiguous, empty or unknown
 * fails clearly.
 */
async function resolveProviderModel(contextDir, ref, { env = process.env } = {}) {
  const settings = await readSettings(contextDir, { env });
  const s = String(ref ?? "").trim();
  const slash = s.indexOf("/");
  let providerId;
  let model;
  if (slash > 0) {
    providerId = s.slice(0, slash);
    model = s.slice(slash + 1);
  } else if (s && slash < 0) {
    providerId = s;
    const models = settings.discovered?.[providerId]?.models ?? [];
    if (models.length === 1) model = String(models[0]);
    else if (models.length === 0) throw new ApiError(`model ref "${s}" names a provider but no model; choose a <provider>/<model> ref`, "BAD_REQUEST");
    else throw new ApiError(`model ref "${s}" is ambiguous (${models.length} models); choose a <provider>/<model> ref`, "BAD_REQUEST");
  } else {
    throw new ApiError(`invalid model ref: ${ref} (expected <providerId>/<model>)`, "BAD_REQUEST");
  }
  const provider = settings.providers.find((p) => p.id === providerId);
  if (!provider) throw new ApiError(`unknown provider: ${providerId}`, "BAD_REQUEST");
  return { provider, model };
}

/**
 * Build an EMBEDDER from a `<providerId>/<model>` ref — the embedding analogue of resolveModel, against
 * the SAME provider registry. Returns `(text) => Promise<number[]>` from the shipped semantic package
 * (Ollama / OpenAI-compatible). The embedding strategy's retriever (tools/core/retrieve.mjs) consumes it.
 * anthropic/google have no embeddings endpoint here and fail clearly. The package is imported dynamically.
 */
export async function resolveEmbedder(contextDir, ref, { env = process.env, fetch, timeoutMs } = /** @type {{ env?: NodeJS.ProcessEnv, fetch?: typeof globalThis.fetch, timeoutMs?: number }} */ ({})) {
  const { provider, model } = await resolveProviderModel(contextDir, ref, { env });
  const semantic = await import("@ai-swiss/base-ranker-semantic");
  const common = { model, ...(fetch ? { fetch } : {}), ...(timeoutMs ? { timeoutMs } : {}) };
  if (provider.type === "ollama") {
    const baseUrl = (provider.baseUrl ?? DEFAULT_BASE_URLS.ollama).replace(/\/v1\/?$/, "");
    return semantic.createOllamaEmbedder({ ...common, baseUrl });
  }
  if (provider.type === "openai-compatible") {
    const apiKey = provider.apiKeyEnv ? env[provider.apiKeyEnv] : env.OPENAI_API_KEY;
    return semantic.createOpenAICompatibleEmbedder({ ...common, ...(provider.baseUrl ? { baseUrl: provider.baseUrl } : {}), ...(apiKey ? { apiKey } : {}) });
  }
  throw new ApiError(`provider type "${provider.type}" has no embedding endpoint; use an ollama or openai-compatible provider for routing.embedding_model`, "BAD_REQUEST");
}

/**
 * Build a LanguageModel for one provider + model. Lazy import of the OPTIONAL @ai-swiss/base-llm
 * companion, so the lexical-routing / validate path never pulls it in. Used by resolveModel and by the
 * Studio discovery/test (re-exported via tools/studio/settings.mjs).
 */
export async function buildProviderModel(provider, model, { env = process.env, fetch, timeoutMs } = /** @type {{ env?: NodeJS.ProcessEnv, fetch?: typeof globalThis.fetch, timeoutMs?: number }} */ ({})) {
  const { createAnthropicModel, createGoogleModel, createOllamaModel, createOpenAICompatibleModel } = await import("@ai-swiss/base-llm");
  const apiKey = provider.apiKeyEnv ? env[provider.apiKeyEnv] : undefined;
  const common = { model, ...(fetch ? { fetch } : {}), ...(timeoutMs ? { timeoutMs } : {}) };
  switch (provider.type) {
    case "ollama":
      return createOllamaModel({ ...common, ...(provider.baseUrl ? { baseUrl: provider.baseUrl } : {}) });
    case "anthropic":
      return createAnthropicModel({ ...common, ...(provider.baseUrl ? { baseUrl: provider.baseUrl } : {}), apiKey: apiKey ?? env.ANTHROPIC_API_KEY });
    case "google":
      return createGoogleModel({ ...common, ...(provider.baseUrl ? { baseUrl: provider.baseUrl } : {}), apiKey: apiKey ?? env.GEMINI_API_KEY });
    case "openai-compatible":
      return createOpenAICompatibleModel({
        ...common,
        ...(provider.baseUrl ? { baseUrl: provider.baseUrl } : {}),
        apiKey: apiKey ?? env.OPENAI_API_KEY,
        requireApiKey: false,
      });
    default:
      throw new ApiError(`unknown provider type: ${provider.type}`, "BAD_REQUEST");
  }
}

// The provider types that can embed, exported for the Studio write-time validation (cleanRouting).
export { EMBEDDING_PROVIDER_TYPES };
