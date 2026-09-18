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
import { normalizeExcludeList } from "./walk-policy.mjs";
import { keywordIntentRanker, semanticHybridRanker } from "./rankers.mjs";
import { requireFields, requireSchemaVersion, forbidSensitivity, piiScanner, routabilityWarnings } from "./validators.mjs";
import { strictPolicy } from "./policy.mjs";
import { TOOL_ENTRY_POINTS } from "./perimeter.mjs";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "./lang/index.mjs";

const TOOL_IDS = new Set(Object.keys(TOOL_ENTRY_POINTS));

// The tools the MCP server registers, and therefore the whole vocabulary of the `mcp.tools`
// allow-list. The list lives here because the allow-list is validated here: a name that matches no
// tool removes nothing, and «I mistyped it» and «the tool was renamed» are indistinguishable from the
// outside, so both must stop a deployment that claims a provable surface. Pinned against the server's
// own registrations by mcp/tests/exposure.test.ts, so the two cannot drift apart in silence.
export const MCP_TOOL_NAMES = [
  "load_agent",
  "discover_resources",
  "route_request",
  "get_routing_map",
  "open_resource",
  "get_context_pack",
  "access_resource",
  "list_pending_changes",
  "get_change_status",
  "report_friction",
  "invoke_tool",
  "propose_change",
  "commit_change",
  "promote_resource",
  "list_markers",
];
const MCP_TOOLS = new Set(MCP_TOOL_NAMES);

// Default adapters. An empty/null slot means "use the broker's built-in behaviour" (neutral ranking,
// advisory policy, no auth, default routing thresholds).
export const DEFAULTS = { rankers: [], validators: [], policy: null, auth: null, routing: null, inventory: { exclude: [] }, language: DEFAULT_LANGUAGE };

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
  const out = /** @type {{ rankers: any[], validators: any[], policy: any, auth: any, routing: any, contextPack?: { budget: number } | null, inventory: { exclude: string[] }, language: string, framework_dir?: string, tools?: string[], views?: Record<string, any>, mcp?: { tools?: string[], agents?: string[], attribution_prefix?: boolean } | null }} */ ({ ...DEFAULTS });
  if (raw.rankers !== undefined) {
    if (!Array.isArray(raw.rankers)) throw fail("`rankers` must be an array.");
    out.rankers = raw.rankers.map(instantiateRanker);
  }
  if (raw.validators !== undefined) {
    if (!Array.isArray(raw.validators)) throw fail("`validators` must be an array.");
    out.validators = raw.validators.map(instantiateValidator);
  }
  // `framework_dir` (written by `base init`) is the root's statement of which BASE framework it
  // belongs to. The launcher reads it from disk to find the engine; the router reads it here to
  // resolve a help target the root does not own (routing.fallback → framework-root.mjs).
  if (raw.framework_dir !== undefined) {
    if (typeof raw.framework_dir !== "string" || !raw.framework_dir.trim()) throw fail("`framework_dir` must be a non-empty path.");
    out.framework_dir = raw.framework_dir.trim();
  }
  // `tools`: which AI tools read this root, answered at `base init --tool`. Its reader is the build:
  // a root gets the entry point of ITS tools and no other, so a `base build --write` cannot put back
  // a CLAUDE.md that a Cursor-only folder never wanted. Absent, the build keeps whatever is already
  // on disk (an older root changes nothing by upgrading).
  if (raw.tools !== undefined) {
    if (!Array.isArray(raw.tools)) throw fail("`tools` must be an array of tool ids (claude-code, cursor, agents-md, autre).");
    const ids = raw.tools.map((id) => String(id).trim().toLowerCase()).filter(Boolean);
    const unknown = ids.filter((id) => !TOOL_IDS.has(id));
    if (unknown.length) throw fail(`unknown tool id(s): ${unknown.join(", ")} (expected: ${[...TOOL_IDS].join(", ")}).`);
    out.tools = ids;
  }
  // `language`: which language BASE writes this root's own files in, answered at `base init
  // --language` and read by every renderer through `stringsFor`. Normalised to the primary subtag
  // (`de-CH` → `de`), because a table is written per language and not per region.
  //
  // An UNKNOWN language is recorded, not refused — deliberately unlike `tools` just above. A tool id
  // decides which FILE is written, so a wrong one leaves a folder no tool can open and must stop the
  // load; a language decides only which words are inside the files, so a wrong one degrades to
  // French (stringsFor's fallback) and the CLI says so. A root written against a newer BASE that
  // knows more languages than this build must stay loadable by this build.
  if (raw.language !== undefined) {
    if (typeof raw.language !== "string" || !raw.language.trim()) throw fail("`language` must be a language tag (e.g. \"fr\", \"en\", \"de-CH\").");
    out.language = normalizeLanguage(raw.language);
  }
  // `views`: named doors onto a subset of this root (`base view <nom>`). A view is a lens, never a
  // boundary: it changes what the router proposes first, not what anyone may read.
  if (raw.views !== undefined) {
    if (!raw.views || typeof raw.views !== "object" || Array.isArray(raw.views)) throw fail("`views` must be an object of named views.");
    out.views = Object.fromEntries(Object.entries(raw.views).map(([name, view]) => [name, instantiateView(name, view)]));
  }
  // `mcp`: what a deployment exposes over MCP. Validated here like every other key, rather than read
  // raw by the server: a config that fails open would answer «expose everything» to exactly the file
  // an operator wrote to expose less.
  if (raw.mcp !== undefined) out.mcp = instantiateMcp(raw.mcp);
  if (raw.policy !== undefined) out.policy = instantiatePolicy(raw.policy);
  if (raw.auth !== undefined) out.auth = raw.auth; // auth descriptors are interpreted by the MCP layer
  if (raw.routing !== undefined) {
    if (raw.routing !== null && (typeof raw.routing !== "object" || Array.isArray(raw.routing))) {
      throw fail("`routing` must be an object (floor_score, top2_margin, max_candidates).");
    }
    out.routing = raw.routing === null ? null : instantiateRouting(raw.routing);
  }
  if (raw.contextPack !== undefined) {
    // ONE knob, mirroring how routing thresholds are validated: the token budget of the context
    // pack (what a process's declared references may inject). The estimator ratio and the rescue
    // floor stay internal mechanics, deliberately not exposed.
    if (raw.contextPack === null) {
      out.contextPack = null;
    } else if (typeof raw.contextPack !== "object" || Array.isArray(raw.contextPack)) {
      throw fail("`contextPack` must be an object ({ budget: positive integer }).");
    } else {
      const extra = Object.keys(raw.contextPack).filter((k) => k !== "budget");
      if (extra.length) throw fail(`unknown contextPack option(s): ${extra.join(", ")}`);
      if (raw.contextPack.budget !== undefined) {
        if (!Number.isInteger(raw.contextPack.budget) || raw.contextPack.budget < 1) {
          throw fail("`contextPack.budget` must be a positive integer (tokens).");
        }
        out.contextPack = { budget: raw.contextPack.budget };
      }
    }
  }
  if (raw.inventory !== undefined) {
    // The project's own inventory exclusions (root-relative path prefixes). The engine carries no
    // repository layout of its own: THIS repo excludes its engineering trees via its base.config.json,
    // and a user's root excludes nothing unless it says so.
    if (raw.inventory === null) {
      out.inventory = { exclude: [] };
    } else if (typeof raw.inventory !== "object" || Array.isArray(raw.inventory)) {
      throw fail("`inventory` must be an object ({ exclude: string[] }).");
    } else {
      if (raw.inventory.exclude !== undefined && !Array.isArray(raw.inventory.exclude)) {
        throw fail("`inventory.exclude` must be an array of root-relative path prefixes.");
      }
      if (Array.isArray(raw.inventory.exclude) && raw.inventory.exclude.some((e) => typeof e !== "string")) {
        throw fail("`inventory.exclude` entries must be strings.");
      }
      out.inventory = { exclude: normalizeExcludeList(raw.inventory.exclude) };
    }
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
      // `routing.embedder` is not a configuration key. Name `routing.embedding_model` explicitly
      // so a stale file is corrected rather than silently ignored.
      throw fail("`routing.embedder` n'est pas une clé de configuration: la Voie 2 lit une seule référence de modèle, `routing.embedding_model` dans .ai/studio.settings.json (Studio → Routage). Retirez la clé de base.config.json.");
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

// mcp: { tools?: [<tool-name>…], agents?: [<agent-name>…], attribution_prefix?: boolean } — what a
// deployment exposes over MCP. The two lists are ALLOW-lists: absent, the whole surface; present, only
// what they name. `attribution_prefix` makes every read of a resource return the `attribution` line of
// the nearest folder card, so a rule of use travels with the content into any client. Tool names are
// checked against the server's vocabulary, because an unknown one would silently narrow nothing; agent
// names are not, since an agent exists only in the root's live inventory and a view of fewer agents
// than expected is visible at once in `load_agent`.
function instantiateMcp(value) {
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) throw fail("`mcp` must be an object ({ tools, agents, attribution_prefix }).");
  const { tools, agents, attribution_prefix: attributionPrefix, ...rest } = value;
  const extra = Object.keys(rest);
  if (extra.length) throw fail(`unknown mcp option(s): ${extra.join(", ")}`);
  const out = {};
  if (tools !== undefined) {
    const names = nameList(tools, "mcp.tools");
    const unknown = names.filter((name) => !MCP_TOOLS.has(name));
    if (unknown.length) throw fail(`unknown mcp tool name(s): ${unknown.join(", ")} (expected: ${MCP_TOOL_NAMES.join(", ")}).`);
    out.tools = names;
  }
  if (agents !== undefined) out.agents = nameList(agents, "mcp.agents");
  if (attributionPrefix !== undefined) {
    if (typeof attributionPrefix !== "boolean") throw fail("`mcp.attribution_prefix` must be a boolean (true attaches the folder card's attribution line to every read).");
    out.attribution_prefix = attributionPrefix;
  }
  return out;
}

/** @param {any} value @param {string} key */
function nameList(value, key) {
  if (!Array.isArray(value) || !value.every((name) => typeof name === "string" && name.trim().length > 0)) {
    throw fail(`\`${key}\` must be an array of non-empty names.`);
  }
  return value.map((name) => name.trim());
}

// views.<name>: { entry?: <agent-id>, agents: [<agent-id>…], include?: [<folder>…] }. Shape only;
// ids resolve against the live inventory when the view is generated, so a typo degrades to a view
// that lists less, and `base view` says which id it could not find.
function instantiateView(name, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw fail(`\`views.${name}\` must be an object.`);
  const { entry, agents, include, ...rest } = value;
  const extra = Object.keys(rest);
  if (extra.length) throw fail(`unknown views.${name} keys: ${extra.join(", ")}`);
  if (entry !== undefined && (typeof entry !== "string" || !entry.trim())) throw fail(`\`views.${name}.entry\` must be an agent id.`);
  if (!Array.isArray(agents) || agents.length === 0) throw fail(`\`views.${name}.agents\` must be a non-empty array of agent ids.`);
  if (include !== undefined && !Array.isArray(include)) throw fail(`\`views.${name}.include\` must be an array of folders.`);
  return {
    ...(entry ? { entry: entry.trim() } : {}),
    agents: agents.map((id) => String(id).trim()).filter(Boolean),
    ...(include ? { include: include.map((folder) => String(folder).trim()).filter(Boolean) } : {}),
  };
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
