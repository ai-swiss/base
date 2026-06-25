// tools/core/config.mjs — resolves an optional, project-local extension config into adapters.
// Zero dependencies (node:* only). This is the single injection point for the five ports.
//
// Safety (NFR-CORE-003 / NFR #8): config is loaded ONLY from the confined project root (or an
// explicit --config path, also confined), NEVER from resource data. The declarative `.json`
// form is the safe beginner path; the executable `.mjs` form is trusted project code.

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { confineToRoot, pathExists } from "./confine.mjs";
import { keywordIntentRanker, semanticHybridRanker } from "./rankers.mjs";
import { requireFields, requireSchemaVersion, forbidSensitivity, piiScanner, routabilityWarnings } from "./validators.mjs";
import { strictPolicy } from "./policy.mjs";

// Default adapters. An empty/null slot means "use the broker's built-in behaviour" (neutral ranking,
// advisory policy, no auth, default routing thresholds).
export const DEFAULTS = { rankers: [], validators: [], policy: null, auth: null, routing: null };

// Conventional basenames, in priority order. JSON (declarative, safe) is preferred over MJS.
const CONFIG_BASENAMES = ["base.config.json", "base.config.mjs"];

function fail(detail) {
  return new Error(`base.config.invalid: ${detail}`);
}

export async function resolveConfig(rootDir, { configPath } = /** @type {{ configPath?: string }} */ ({})) {
  const root = path.resolve(rootDir);

  // 1. Locate the config file (explicit path → confined; else the conventional basenames).
  let target = null;
  if (configPath) {
    target = await confineToRoot(root, configPath); // throws if it escapes the root
    if (!(await pathExists(target))) throw fail(`config file not found: ${configPath}`);
  } else {
    for (const name of CONFIG_BASENAMES) {
      const candidate = path.join(root, name);
      if (await pathExists(candidate)) {
        target = candidate;
        break;
      }
    }
  }

  // 2. Absent → defaults (the common, zero-config case).
  if (!target) return { ...DEFAULTS };

  // 3. Load: JSON = declarative; MJS = executable (dynamic import).
  let raw;
  try {
    if (target.endsWith(".json")) {
      raw = JSON.parse(await fs.readFile(target, "utf8"));
    } else {
      const mod = await import(pathToFileURL(target).href);
      raw = mod.default ?? mod;
    }
  } catch (error) {
    throw fail(`cannot load ${path.basename(target)}: ${String(error?.message ?? error)}`);
  }

  // 4. Validate the top-level shape and merge over defaults (always complete).
  return mergeConfig(raw);
}

export function mergeConfig(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw fail("config default export must be an object.");
  }
  const out = /** @type {{ rankers: any[], validators: any[], policy: any, auth: any, routing: any }} */ ({ ...DEFAULTS });
  if (raw.rankers !== undefined) {
    if (!Array.isArray(raw.rankers)) throw fail("`rankers` must be an array.");
    out.rankers = raw.rankers.map(instantiateRanker);
  }
  if (raw.validators !== undefined) {
    if (!Array.isArray(raw.validators)) throw fail("`validators` must be an array.");
    out.validators = raw.validators.map(instantiateValidator);
  }
  if (raw.policy !== undefined) out.policy = instantiatePolicy(raw.policy);
  if (raw.auth !== undefined) out.auth = raw.auth; // auth descriptors are interpreted by the MCP layer
  if (raw.routing !== undefined) {
    if (raw.routing !== null && (typeof raw.routing !== "object" || Array.isArray(raw.routing))) {
      throw fail("`routing` must be an object (floor_score, top2_margin, max_candidates).");
    }
    out.routing = raw.routing === null ? null : instantiateRouting(raw.routing);
  }
  return out;
}

// --- Declarative descriptor vocabulary --------------------------------------------------------
// A `.mjs` config provides functions directly (passed through). A `.json` config provides plain
// DESCRIPTORS, which we instantiate into the built-in adapters here. Complex options that need a
// function (e.g. forbidSensitivity's `unless`) are `.mjs`-only.

const repr = (v) => (v && typeof v === "object" ? JSON.stringify(v) : String(v));

function instantiateRanker(item) {
  if (typeof item === "function") return item;
  if (item && typeof item === "object" && item.type === "keywordIntent") return keywordIntentRanker(item.rules ?? {});
  if (item && typeof item === "object" && item.type === "semanticHybrid") return semanticHybridRanker(item);
  throw fail(`unknown ranker descriptor: ${repr(item)}`);
}

function instantiateValidator(item) {
  if (typeof item === "function") return item;
  if (!item || typeof item !== "object") throw fail(`invalid validator entry: ${repr(item)}`);
  switch (item.type) {
    case "requireFields":
      return requireFields(item.fields ?? [], { whenScope: item.whenScope });
    case "requireSchemaVersion":
      return requireSchemaVersion({ whenScope: item.whenScope });
    case "forbidSensitivity":
      return forbidSensitivity(item.level, {});
    case "piiScanner":
      // TRUST-BOUNDARY POLICY: patterns from a JSON config are TRUSTED operator input, compiled as-is
      // with no ReDoS/complexity guard — by design. base.config.{json,mjs} is project-owned code on
      // the same trust footing as the repo (the .mjs path is literally arbitrary code execution); a
      // generic regex-complexity guard would be a heuristic with false positives/negatives, not a
      // real boundary. Revisit ONLY if configs ever become untrusted/shared at scale (then move to a
      // linear-time engine, not a heuristic). (Audit 2026-06-09.)
      return piiScanner({
        patterns: (item.patterns ?? []).map((p) => (p instanceof RegExp ? p : new RegExp(p))),
        severity: item.severity,
      });
    case "routability":
      return routabilityWarnings({ whenScope: item.whenScope });
    default:
      throw fail(`unknown validator descriptor: ${repr(item)}`);
  }
}

function instantiatePolicy(policy) {
  if (typeof policy === "function") return policy;
  if (policy == null || policy === "advisory") return null; // null → broker uses the advisory default
  if (policy === "strict") return strictPolicy({});
  if (typeof policy === "object" && policy.type === "advisory") return null;
  if (typeof policy === "object" && policy.type === "strict") return strictPolicy({ grants: new Set(policy.grants ?? []) });
  throw fail(`unknown policy descriptor: ${repr(policy)}`);
}

function instantiateRouting(routing) {
  const allowed = new Set(["floor_score", "top2_margin", "max_candidates", "fallback", "policy", "embedder"]);
  const out = {};
  for (const [key, value] of Object.entries(routing)) {
    if (!allowed.has(key)) throw fail(`unknown routing option: ${key}`);
    if (key === "fallback") {
      out.fallback = instantiateFallback(value);
      continue;
    }
    if (key === "policy") {
      out.policy = instantiateRoutingPolicy(value);
      continue;
    }
    if (key === "embedder") {
      out.embedder = instantiateRoutingEmbedder(value);
      continue;
    }
    if (key === "max_candidates") {
      if (!Number.isInteger(value) || value < 1) throw fail("`routing.max_candidates` must be a positive integer.");
      out[key] = value;
      continue;
    }
    if (typeof value !== "number" || !Number.isFinite(value)) throw fail(`\`routing.${key}\` must be a finite number.`);
    if (key === "floor_score" && value < 0) throw fail("`routing.floor_score` must be >= 0.");
    if (key === "top2_margin" && (value < 0 || value > 1)) throw fail("`routing.top2_margin` must be between 0 and 1.");
    out[key] = value;
  }
  return out;
}

// routing.policy: { deny: [ "<agent-or-process-id>", ... ] } — the project-level routing deny. A denied
// agent (and all its processes) is dropped from the routable corpus, in both strategies (route-broker's
// prepareCorpus → denyFilterResources). Validated by shape only; an id that matches nothing is a no-op.
function instantiateRoutingPolicy(value) {
  if (value == null) return null;
  if (typeof value !== "object" || Array.isArray(value)) throw fail("`routing.policy` must be an object.");
  const extra = Object.keys(value).filter((k) => k !== "deny");
  if (extra.length) throw fail(`unknown routing.policy option(s): ${extra.join(", ")}`);
  const out = {};
  if (value.deny != null) {
    if (!Array.isArray(value.deny) || !value.deny.every((d) => typeof d === "string" && d.trim().length > 0)) {
      throw fail("`routing.policy.deny` must be an array of non-empty strings (agent or process ids).");
    }
    out.deny = value.deny;
  }
  return out;
}

// routing.embedder: { provider: "ollama"|"openai", model, baseUrl, … } — the embedder for
// `base build routing-embeddings` (the shipped semantic package, dynamically imported). Provider-specific
// knobs pass through; the API key comes from the environment, never from here. Read by base.mjs at build.
function instantiateRoutingEmbedder(value) {
  if (value == null) return null;
  if (typeof value !== "object" || Array.isArray(value)) throw fail("`routing.embedder` must be an object.");
  if (value.provider !== "ollama" && value.provider !== "openai") {
    throw fail('`routing.embedder.provider` must be "ollama" or "openai".');
  }
  if (value.model != null && typeof value.model !== "string") throw fail("`routing.embedder.model` must be a string.");
  if (value.baseUrl != null && typeof value.baseUrl !== "string") throw fail("`routing.embedder.baseUrl` must be a string.");
  return { ...value };
}

// routing.fallback: { agent: "<agent-id>", process: "<process-id>" } — the help target the Router
// attaches to an honest abstention (it never makes the abstention a `routed` result). Validated by
// shape only; the ids are resolved against the live inventory at route time (a missing target simply
// yields no fallback, so a typo degrades gracefully rather than crashing).
function instantiateFallback(value) {
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw fail("`routing.fallback` must be an object { agent, process }.");
  }
  const { agent, process: proc, ...rest } = value;
  const extra = Object.keys(rest);
  if (extra.length) throw fail(`unknown routing.fallback keys: ${extra.join(", ")}`);
  if (typeof agent !== "string" || !agent.trim()) throw fail("`routing.fallback.agent` must be a non-empty agent id.");
  if (typeof proc !== "string" || !proc.trim()) throw fail("`routing.fallback.process` must be a non-empty process id.");
  return { agent: agent.trim(), process: proc.trim() };
}
