// Dense facade, by design: the pure logic lives in tools/core/*, this module orchestrates.
// Growth discipline (triggered, not speculative): before adding a new broker feature, first
// extract the affected domain into tools/core/ (candidates: writes, route orchestration,
// projections). The public surface of this facade never changes during an extraction.
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { confineToRoot, pathExists } from "./core/confine.mjs";
import { isGeneratedProjection, isRuntimeArtifact } from "./core/runtime-artifacts.mjs";
import { composeMarkdown, FrontmatterSerializeError, parseFrontmatter, serializeFrontmatter } from "./core/frontmatter.mjs";
import { resolveConfig } from "./core/config.mjs";
import { compareByCodePoint } from "./core/ordering.mjs";
import { scanMarkers, isMarkerReferencePath } from "./core/markers.mjs";
import { SCHEMA_VERSION } from "./core/schema.mjs";
import { coreSchemaValidator, runValidators } from "./core/validators.mjs";
import { normalize, lexicalRanker, composeRankers } from "./core/rankers.mjs";
import { advisoryPolicy, resolvePolicy } from "./core/policy.mjs";
import { createRouteBroker } from "./core/route-broker.mjs";
import { readSettings, resolveEmbedder, resolveModel, routingLocality } from "./core/model-settings.mjs";
import { applyRoutingVectors, loadRoutingVectors, verifyRoutingVectors } from "./core/routing-vectors.mjs";
import { routingStrategy } from "./core/router.mjs";
import { WORKSPACE_FILENAME } from "./core/roots.mjs";
import { computeRoute, compareRoute, summarizeRoute, STOPWORDS, routeTerms, casesFromExamples, fallbackResolvesIn, selfVetoedPhrasings, scaffoldRouteCases } from "./core/route-service.mjs";
import { resolveFrameworkRoot } from "./core/framework-root.mjs";
import { hashArgs } from "./core/hashing.mjs";
import { createBrokerWrites } from "./core/writes.mjs";
import { createManifest } from "./core/manifest.mjs";
import { createProjections } from "./core/projections.mjs";
import { egressNotice, egressWithheld, rootEgressPolicy } from "./core/egress.mjs";
import { searchSectionsIn } from "./core/sections-search.mjs";
import { applySectionProjection } from "./core/sections.mjs";
import { editionReport, pickEdition, sourceProjection } from "./core/editions.mjs";
import { packSummary } from "./core/context-pack.mjs";
import { reportProgress } from "./core/progress.mjs";
import { recordEvent } from "./core/trace.mjs";
export { rootEgressPolicy };

export { SCHEMA_VERSION };
export const MANIFEST_FILENAME = "base.manifest.json";
export const CHANGES_DIR = path.join(".ai", "changes");
export const ROUTE_TESTS_FILENAME = path.join(".ai", "routing", "route-tests.json");

// The walk policy (universal skip names, runtime prefixes, comparator) lives in ONE module shared
// by every walker: tools/core/walk-policy.mjs. Project-specific exclusions come from
// `inventory.exclude` in base.config — the engine hard-codes no repository layout of its own.
const RESOURCE_EXTENSIONS = new Set([".md", ".json"]);
// Validate announces a single stage line always; a per-resource [i/N] counter only above this size,
// below which (today's corpus is ~147) a counter would be noise, not reassurance.
const VALIDATE_COUNTER_THRESHOLD = 300;
// The base.resource.v1 controlled vocabulary lives in core/schema.mjs (used by core/validators.mjs).
const execFileAsync = promisify(execFile);

/** @typedef {{ projection?: string, purpose?: string, confirmed?: boolean, grantToken?: string, resources?: any[], config?: any, signal?: AbortSignal, limit?: number, grain?: "resource" | "section", scope?: string, section?: string, lang?: string, dryRun?: boolean, fixturesPath?: string, strategy?: "lexical" | "production", examples?: boolean, egress?: { modelLocality: "local" | "remote", rootPolicy?: "local-only" | "any" }, embeddingStrategy?: { readRouting?: () => Promise<any>, resolveEmbedder?: (root: string, ref: string) => Promise<any>, resolveModel?: (root: string, ref: string) => Promise<any> } }} BrokerOptions */

import { skipsDirName, skipsPath } from "./core/walk-policy.mjs";

// Inventory must never fail because a config is malformed: validate/doctor must still be able to
// LOOK at such a project. A broken config degrades to the defaults here; `resolveConfig` (the
// strict door) keeps throwing for the callers that must refuse.
async function resolveConfigSafe(root) {
  try {
    return await resolveConfig(root);
  } catch {
    return { ...DEFAULTS };
  }
}

// confineToRoot + pathExists live in core/confine.mjs; re-exported for the façade.
export { confineToRoot, pathExists };

// Extension foundation: config resolver + stable error-code registry (façade re-exports).
import { DEFAULTS } from "./core/config.mjs";
export { resolveConfig, DEFAULTS, mergeConfig } from "./core/config.mjs";
export { appendAbstention, isAbstention, normalizeQuery, reportFriction } from "./core/feedback.mjs";
export { CODES, codeMessage } from "./core/codes.mjs";
// The operational journal (record, read back, retention) lives in core/trace.mjs.
export { recordEvent, summarizeTrace, pruneTrace, withTraceActor, TRACE_DIR } from "./core/trace.mjs";
export { compareByCodePoint } from "./core/ordering.mjs";
export {
  formatMarkers,
  formatRouteResult,
  formatRouteTestResult,
  formatSearchResults,
  formatTraceSummary,
  formatTracePrune,
  formatValidationResult,
} from "./core/formatters.mjs";
// FrontmatterParser: strict-subset parser lives in core/frontmatter.mjs.
export { composeMarkdown, FrontmatterSerializeError, parseFrontmatter, serializeFrontmatter };
export { WORKSPACE_FILENAME, resolveBaseContext, contextScope, formatContextHeader, findNearestBaseRoot, findNearestWorkspace, readWorkspace, selectWorkspaceRoot } from "./core/roots.mjs";
// Validator port: pipeline + core schema validator + reference adapters.
export { coreSchemaValidator, runValidators };
export { createNotification, requireFields, requireSchemaVersion, forbidSensitivity, hasField, piiScanner, routabilityWarnings } from "./core/validators.mjs";
// Ranker port: neutral lexical default + declarative intent helper.
export { lexicalRanker, keywordIntentRanker, semanticHybridRanker, composeRankers, mergeScore } from "./core/rankers.mjs";
// PolicyEnforcer port: advisory default (also exported as canAccessResource) + strict reference.
export { advisoryPolicy, resolvePolicy };
export { advisoryPolicy as canAccessResource };
export { strictPolicy } from "./core/policy.mjs";
// Router: derives a route (agent → process) from the files, scores via the Ranker contract, and
// abstains by inspectable rules. The base.routing.v1 registry is a generated, deterministic projection.
export { deriveRoutingSignals, decideRoute, buildRoutingRegistry, ROUTING_DEFAULTS, ROUTABLE_KINDS } from "./core/routing.mjs";
export { routeTerms, routeAvoidReasons } from "./core/route-service.mjs";
export { ROUTER_BODY, ROUTER_INTRO, renderClaudeMd, renderBootstrapMd, renderCursorRule, renderMcpInstructions, MCP_ROUTE_DISCIPLINE, MCP_READ_DISCIPLINE, MCP_CONTINUITY } from "./core/bootstrap.mjs";

export async function walkResourceFiles(rootDir, { exclude } = /** @type {{ exclude?: string[] }} */ ({})) {
  const root = path.resolve(rootDir);
  // The project's own exclusions: passed by inventoryResources (which resolved the config), or
  // resolved here for direct callers. Root-relative prefixes, normalized by the config layer.
  const excludeList = exclude ?? (await resolveConfigSafe(root)).inventory.exclude;
  const results = [];

  async function visit(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    // A subdirectory that carries its own base.config.json / manifest / workspace is a SEPARATE root
    // — an example, or a copied/generated BASE such as the Studio E2E run (`tools/studio/ui/e2e/.run/`,
    // and the workspace copy `e2e/.run-ws/` keyed by base.workspace.json). It is discovered and
    // validated in isolation, never merged into this root's inventory. Detected from the entries already
    // read (no extra I/O), so a nested root can never pollute discovery, the closed routing set, or
    // `validate` — and inventory correctness never depends on .gitignore.
    if (dir !== root && entries.some((e) => e.name === "base.config.json" || e.name === MANIFEST_FILENAME || e.name === WORKSPACE_FILENAME)) return;
    entries.sort((a, b) => compareByCodePoint(a.name, b.name));

    for (const entry of entries) {
      if (skipsDirName(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const relativeFromRoot = path.relative(root, fullPath).split(path.sep).join("/");
      // Runtime areas (.ai/trace, .ai/changes, .ai/experiments, the generated .ai/routing, the
      // _template scaffolding) plus the PROJECT'S OWN exclusions. This repository's base.config.json
      // excludes its engineering trees (specs/, exemples/, packages/, tests/) and its translation
      // mirrors (docs/en|de|it): developer docs, standalone sample projects, separately-publishable
      // units, and pages that shadow a French source are not business resources HERE — while a user's
      // folder that happens to contain a `specs/` directory keeps it, because the engine no longer
      // hard-codes this repository's layout into every root's walk.
      if (skipsPath(relativeFromRoot, excludeList)) continue;
      if (entry.isDirectory()) {
        await visit(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!RESOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;

      // POSIX-normalized (reuse relativeFromRoot): resource.path is the identity every downstream
      // surface keys on — manifest, routing cache, maintenance report — so it must read `a/b.md` on
      // every OS, never `a\b.md` on Windows (see FR-CORE path-identity; the Windows smoke job guards it).
      const relativePath = relativeFromRoot;
      if (relativePath === MANIFEST_FILENAME) continue;
      // Project config is code/data loaded only by the resolver — never a discoverable/routable resource.
      if (entry.name === "base.config.json" || entry.name === "base.config.mjs" || entry.name === WORKSPACE_FILENAME) continue;
      // Build/tooling manifests (npm, TypeScript) are not BASE resources — keep them out of the
      // inventory, discovery and manifest, at any depth (root, mcp/, packages/*, the Studio UI).
      if (entry.name === "package.json" || entry.name === "package-lock.json") continue;
      if (entry.name === "tsconfig.json" || (entry.name.startsWith("tsconfig.") && entry.name.endsWith(".json"))) continue;
      results.push(relativePath);
    }
  }

  await visit(root);
  return results;
}

// parseFrontmatter (strict subset) now lives in core/frontmatter.mjs — imported + re-exported above.

export async function inventoryResources(rootDir, { egress } = /** @type {BrokerOptions} */ ({})) {
  const start = Date.now();
  const root = path.resolve(rootDir);
  try {
    const cfg = await resolveConfigSafe(root);
    const files = (await walkResourceFiles(root, { exclude: cfg.inventory.exclude })).filter((f) => !isRuntimeArtifact(f));
    const resources = [];

    for (const relativePath of files) {
      const absolutePath = await confineToRoot(root, relativePath);
      const content = await fs.readFile(absolutePath, "utf8");
      const frontmatter = parseFrontmatter(content);
      const metadata = frontmatter.data;
      const title = metadata.title || extractMarkdownTitle(frontmatter.body) || deriveTitle(relativePath);
      const type = metadata.type || deriveType(relativePath);
      const id = metadata.id || slugify(relativePath);
      const description = metadata.description || deriveDescription(type, frontmatter.body);

      resources.push({
        id,
        type,
        title,
        description,
        path: relativePath,
        schema_version: metadata.schema_version || null,
        scope: metadata.scope || "personal",
        status: metadata.status || "active",
        sensitivity: metadata.sensitivity || "internal",
        keywords: deriveKeywords(metadata, { id, type, title, description, path: relativePath }),
        requires: Array.isArray(metadata.requires) ? metadata.requires : [],
        may_use: Array.isArray(metadata.may_use) ? metadata.may_use : [],
        use_when: typeof metadata.use_when === "string" ? metadata.use_when : null,
        source: typeof metadata.source === "object" && !Array.isArray(metadata.source) ? metadata.source : null,
        execution: typeof metadata.execution === "object" ? metadata.execution : null,
        license: typeof metadata.license === "string" ? metadata.license : null,
        compatibility: Array.isArray(metadata.compatibility) ? metadata.compatibility : [],
        metadata,
        frontmatter_errors: frontmatter.errors,
        content,
        body: frontmatter.body,
      });
    }

    resources.sort((a, b) => compareByCodePoint(a.path, b.path));
    // Egress (opt-in): when a caller supplies a context (the MCP read surface), confidential /
    // local-only resources are dropped from the inventory itself, so even paths that list the
    // inventory directly (the MCP agent bootstrap catalog) cannot reveal their existence to a
    // remote model. Internal callers (open/search) pass no egress and gate per-resource instead.
    const visible = egress ? resources.filter((resource) => !egressWithheld(resource, egress)) : resources;
    await recordEvent(root, {
      op: "inventory",
      action: "read",
      decision: "not_applicable",
      status: "ok",
      duration_ms: Date.now() - start,
      metadata: { resources: visible.length },
    });
    return visible;
  } catch (error) {
    await recordEvent(root, {
      op: "inventory",
      action: "read",
      decision: "not_applicable",
      status: "error",
      duration_ms: Date.now() - start,
      error: String(error.message ?? error),
    });
    throw error;
  }
}

export function projectResourceMetadata(resource) {
  const { content, body, ...metadata } = resource;
  return metadata;
}

// The manifest concern (build, freshness check, write) lives in core/manifest.mjs over injected deps
// (inventoryResources, recordEvent). Bound here and re-exported with byte-identical signatures, so the
// CLI keeps importing buildManifest/checkManifestFresh/writeManifest unchanged.
const { buildManifest, checkManifestFresh, writeManifest } = createManifest({
  inventoryResources,
  recordEvent,
  manifestFilename: MANIFEST_FILENAME,
});
export { buildManifest, checkManifestFresh, writeManifest };

// The build projections (which entry points, and never overwriting a hand-owned file) live in
// core/projections.mjs; the facade binds them to the real inventory, config and recorder.
export const { buildArtifacts, writeArtifacts } = createProjections({ inventoryResources, resolveConfig, recordEvent });

function findResource(resources, idOrPath) {
  return resources.find((item) => item.id === idOrPath || item.path === idOrPath);
}

// Retrieval planner (CLI `context`, MCP `get_context_pack`): paths+notes, never bodies. With egress a confidential target is not even revealed (the MCP read posture); without (local CLI), reads unchanged.
/** @param {string} rootDir @param {string} idOrPath @param {{ budget?: number, egress?: { modelLocality: "local" | "remote", rootPolicy?: "local-only" | "any" } }} [options] */
export async function contextPack(rootDir, idOrPath, { budget, egress } = {}) {
  const root = path.resolve(rootDir);
  const visible = (await inventoryResources(root)).filter((r) => !egressWithheld(r, egress));
  const summary = await packSummary(visible, async (rel) => fs.readFile(await confineToRoot(root, rel), "utf8"), idOrPath, { budget: budget ?? (await resolveConfig(root)).contextPack?.budget, egress });
  if (!summary) throw new Error(`Resource not found: ${idOrPath}`);
  return summary;
}

/**
 * @param {string} rootDir
 * @param {string} idOrPath
 * @param {BrokerOptions} [options]
 */
export async function openResource(rootDir, idOrPath, { projection = "full", section, lang, purpose = "", confirmed = false, grantToken, resources, config, egress } = {}) {
  const start = Date.now();
  // `id#anchor` is ONE citable reference, so it opens as one: a ref copied out of a section hit works
  // wherever an id works, with no caller left to take it apart. An explicit `section` option wins.
  const hash = String(idOrPath).indexOf("#");
  const target = hash === -1 ? idOrPath : String(idOrPath).slice(0, hash);
  const anchor = section ?? (hash === -1 ? undefined : String(idOrPath).slice(hash + 1) || undefined);
  const resourceList = resources ?? await inventoryResources(rootDir);
  const asked = findResource(resourceList, target);
  if (!asked) throw new Error(`Resource not found: ${target}`);
  const edition = pickEdition(resourceList, asked, lang); // the edition in `lang` if it exists, else the canonical, said so
  const resource = edition.resource;

  const decision = await decide(rootDir, resource, "read", { projection, purpose, confirmed, grantToken }, config);
  if (decision.decision === "deny") {
    await recordEvent(rootDir, {
      op: "open",
      action: "read",
      resource_id: resource.id,
      path: resource.path,
      decision: decision.decision,
      status: "error",
      duration_ms: Date.now() - start,
      error: decision.reason,
    });
    throw new Error(`Access denied: ${decision.reason}`);
  }

  try {
    const fullPath = await confineToRoot(rootDir, resource.path);
    const raw = await fs.readFile(fullPath, "utf8");
    const parsed = parseFrontmatter(raw);
    // The verdict comes FIRST, because everything derived from the body below is computed only on the
    // branch where the resource may travel. An outline IS the table of contents of the document it
    // describes: computing it and deleting it afterwards would leave the leak one early return away.
    const withheld = egressWithheld(resource, egress);
    const result = {
      // The sibling is identification, never a second content channel: strip content/body — consumers
      // (the MCP handler) serialize the whole result; the body travels ONLY in `content`.
      resource: projectResourceMetadata(resource),
      policy: decision,
      content: projectResourceContent(resource, raw, parsed.body, projection),
    };
    if (withheld) {
      result.content = egressNotice(withheld);
      result.withheld = true;
      result.egress_reason = withheld[0].reason;
      // The resource sibling carries .content/.body/.description/.title/.metadata of the confidential
      // file, and consumers (the MCP handler) serialize the whole result object. Reduce it to the
      // identifiers the caller already supplied so no confidential field leaves on this path either.
      result.resource = { id: resource.id, type: resource.type, path: resource.path, withheld: true };
      for (const key of ["outline", "section", "images", "source", "edition"]) delete result[key]; // the guard, should one ever be computed above
    } else {
      // Section grain: one passage, or the table of contents, instead of the whole body.
      applySectionProjection(result, parsed.body, { section: anchor, projection, resourceId: resource.id, superseded: resource.metadata?.superseded_anchors });
      if (lang) result.edition = editionReport(edition, asked.id);
      // Originals: the source record, the citation, and the printed pages, read only on this branch.
      if (projection === "source") Object.assign(result, await sourceProjection(resource.metadata, async (rel) => fs.readFile(await confineToRoot(rootDir, rel))));
    }
    await recordEvent(rootDir, {
      op: "open",
      action: "read",
      resource_id: resource.id,
      path: resource.path,
      decision: decision.decision,
      status: "ok",
      duration_ms: Date.now() - start,
      ...(withheld ? { metadata: { egress_withheld: withheld[0].reason } } : {}),
    });
    return result;
  } catch (error) {
    await recordEvent(rootDir, {
      op: "open",
      action: "read",
      resource_id: resource.id,
      path: resource.path,
      decision: decision.decision,
      status: "error",
      duration_ms: Date.now() - start,
      error: String(error.message ?? error),
    });
    throw error;
  }
}

function pathResource(relativePath) {
  return {
    id: relativePath,
    type: "document",
    title: path.basename(relativePath),
    description: "Confined non-inventoried project file.",
    path: relativePath,
    schema_version: null,
    scope: "personal",
    status: "active",
    sensitivity: "internal",
    keywords: [],
    requires: [],
    may_use: [],
    source: null,
    execution: null,
    metadata: {},
  };
}

/**
 * @param {string} rootDir
 * @param {string} idOrPath
 * @param {BrokerOptions} [options]
 */
export async function accessResource(rootDir, idOrPath, { projection = "full", purpose = "", confirmed = false, grantToken, config, egress } = {}) {
  const start = Date.now();
  const resources = await inventoryResources(rootDir);
  const resource = findResource(resources, idOrPath);
  if (resource) return openResource(rootDir, idOrPath, { projection, purpose, confirmed, grantToken, resources, config, egress });

  try {
    const root = path.resolve(rootDir);
    const fullPath = await confineToRoot(root, idOrPath);
    const relativePath = path.relative(root, fullPath).split(path.sep).join("/");
    const syntheticResource = pathResource(relativePath);
    const decision = await decide(root, syntheticResource, "read", { projection, purpose, confirmed, grantToken }, config);
    if (decision.decision === "deny") {
      await recordEvent(rootDir, {
        op: "access",
        action: "read",
        path: relativePath,
        decision: decision.decision,
        status: "error",
        duration_ms: Date.now() - start,
        error: decision.reason,
      });
      const error = /** @type {Error & { alreadyTraced?: boolean }} */ (new Error(`Access denied: ${decision.reason}`));
      error.alreadyTraced = true;
      throw error;
    }
    const content = projection === "metadata"
      ? JSON.stringify({ path: syntheticResource.path, type: syntheticResource.type, sensitivity: syntheticResource.sensitivity }, null, 2)
      : await fs.readFile(fullPath, "utf8");
    const result = { resource: syntheticResource, policy: decision, content };
    const withheld = egressWithheld(syntheticResource, egress);
    if (withheld) {
      result.content = egressNotice(withheld);
      result.withheld = true;
      result.egress_reason = withheld[0].reason;
      result.resource = /** @type {any} */ ({ type: syntheticResource.type, path: syntheticResource.path, withheld: true });
    }
    await recordEvent(rootDir, {
      op: "access",
      action: "read",
      path: relativePath,
      decision: decision.decision,
      status: "ok",
      duration_ms: Date.now() - start,
      ...(withheld ? { metadata: { egress_withheld: withheld[0].reason } } : {}),
    });
    return result;
  } catch (error) {
    if (error.alreadyTraced) throw error;
    await recordEvent(rootDir, {
      op: "access",
      action: "read",
      path: idOrPath,
      decision: "deny",
      status: "error",
      duration_ms: Date.now() - start,
      error: String(error.message ?? error),
    });
    throw error;
  }
}

/**
 * @param {string} rootDir
 * @param {string} idOrPath
 * @param {any[]} [args]
 * @param {BrokerOptions} [options]
 */
export async function invokeTool(rootDir, idOrPath, args = [], { dryRun = true, confirmed = false, grantToken, egress } = {}) {
  const start = Date.now();
  // Resolve config once and reuse it for both the read (open) and the execute decision, instead of
  // re-reading base.config (and re-importing a .mjs config) for each mediated check.
  const cfg = await resolveConfig(path.resolve(rootDir));
  const opened = await openResource(rootDir, idOrPath, { projection: "metadata", grantToken, config: cfg, egress });
  const { resource } = opened;
  // Egress: a confidential / local-only tool is not invocable by a remote model — even a
  // dry-run would resolve and return its on-disk entrypoint path (revealing existence + location).
  if (opened.withheld) {
    throw new Error(`Tool execution denied: ${opened.egress_reason === "root_local_only" ? "resource belongs to a local-only root" : "resource is confidential"} and the model is remote.`);
  }
  if (resource.type !== "tool") {
    throw new Error(`Resource is not a tool: ${idOrPath}`);
  }
  if (!resource.execution?.entrypoint) {
    throw new Error(`Tool has no execution.entrypoint: ${idOrPath}`);
  }

  const decision = await decide(rootDir, resource, "execute", { dryRun, confirmed, grantToken }, cfg);
  if (decision.decision === "deny") {
    await recordEvent(rootDir, {
      op: "invoke",
      action: "execute",
      resource_id: resource.id,
      path: resource.path,
      decision: decision.decision,
      status: "error",
      duration_ms: Date.now() - start,
      args_hash: hashArgs(args),
      error: decision.reason,
    });
    throw new Error(`Tool execution denied: ${decision.reason}`);
  }

  // Resolve the on-disk entrypoint only AFTER the policy has NOT denied: a denied tool is never
  // touched on disk, and its refusal is always traced above (instead of surfacing as an untraced
  // "entrypoint missing" throw). Confirmation is the policy's call — advisoryPolicy denies an
  // unconfirmed execute (see policy.mjs) — so the broker no longer re-checks requires_confirmation
  // here; doing so would silently override a custom PolicyEnforcer that chose to allow.
  const entrypoint = await resolveToolEntrypoint(rootDir, resource.path, resource.execution.entrypoint);
  const command = commandForRuntime(resource.execution.runtime, entrypoint, args);

  if (dryRun) {
    await recordEvent(rootDir, {
      op: "invoke",
      action: "execute",
      resource_id: resource.id,
      path: resource.path,
      decision: decision.decision,
      status: "ok",
      duration_ms: Date.now() - start,
      args_hash: hashArgs(args),
    });
    return { dry_run: true, policy: decision, command };
  }

  try {
    const result = await execFileAsync(command[0], command.slice(1), { cwd: path.resolve(rootDir), timeout: 30_000 });
    await recordEvent(rootDir, {
      op: "invoke",
      action: "execute",
      resource_id: resource.id,
      path: resource.path,
      decision: decision.decision,
      status: "ok",
      duration_ms: Date.now() - start,
      args_hash: hashArgs(args),
    });
    return { dry_run: false, policy: decision, command, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    await recordEvent(rootDir, {
      op: "invoke",
      action: "execute",
      resource_id: resource.id,
      path: resource.path,
      decision: decision.decision,
      status: "error",
      duration_ms: Date.now() - start,
      args_hash: hashArgs(args),
      error: String(error.message ?? error),
    });
    throw error;
  }
}

// The mediated-write flow (propose/commit/promote) lives in core/writes.mjs as a small module over
// injected orchestration deps. Bound here and re-exported with byte-identical signatures, so the
// MCP broker bundle and CLI keep importing proposeChange/commitChange/promoteResource unchanged.
const { proposeChange, commitChange, promoteResource, listPendingChanges, getChangeStatus } = createBrokerWrites({
  decide,
  recordEvent,
  inventoryResources,
  changesDir: CHANGES_DIR,
});
export { proposeChange, commitChange, promoteResource, listPendingChanges, getChangeStatus };

/**
 * @param {string} rootDir
 * @param {BrokerOptions} [options]
 */
export async function validateBase(rootDir, { config } = {}) {
  const start = Date.now();
  const root = path.resolve(rootDir);
  const cfg = config ?? await resolveConfig(root);
  const validators = [coreSchemaValidator, ...(cfg.validators ?? [])];
  const resources = await inventoryResources(root);
  const errors = [];
  const warnings = [];
  const ids = new Map();

  // One announce line always (which work, how big); the per-resource [i/N] counter only above the
  // threshold — below it (today's corpus is ~147) a counter is noise, not reassurance. To stderr; the
  // result stays on stdout. The announce ticks 1/1 so it stands as a finished, newline-terminated line;
  // the counter is a distinct reporter that rewrites in place below it.
  reportProgress("validating")(1, 1, `${resources.length} resources`);
  const counter = resources.length > VALIDATE_COUNTER_THRESHOLD ? reportProgress("validating") : null;
  let validated = 0;

  for (const resource of resources) {
    counter?.(++validated, resources.length);
    for (const error of resource.frontmatter_errors) {
      errors.push({ path: resource.path, message: error.message, code: error.code });
    }

    if (ids.has(resource.id)) {
      errors.push({
        path: resource.path,
        code: "base.id.duplicate",
        message: `ID duplique "${resource.id}" deja utilise par ${ids.get(resource.id)}.`,
      });
    } else {
      ids.set(resource.id, resource.path);
    }

    // A card that vetoes its own declared phrasings is caught here, at writing time, rather than by
    // the user whose request it refuses: the check replays those phrasings through the router's own
    // veto (selfVetoedPhrasings), so the warning states what will happen.
    for (const { phrasing, terms } of selfVetoedPhrasings(resource)) {
      warnings.push({
        path: resource.path,
        code: "base.route.self_veto",
        message: `«${phrasing}», votre propre exemple, est écartée par votre «éviter si» (mots partagés: ${terms.join(", ")}). Écrivez «éviter si» avec les mots du cas à exclure, pas avec ceux de ce process.`,
      });
    }

    const notification = runValidators(resource, validators, { root, config: cfg });
    for (const e of notification.errors) errors.push({ path: e.path, message: e.message, code: e.code });
    for (const w of notification.warnings) warnings.push({ path: w.path, message: w.message, code: w.code });

    if (resource.execution?.entrypoint) {
      const entrypoint = await resolveResourceTarget(root, resource.path, resource.execution.entrypoint);
      if (!entrypoint.ok) {
        errors.push({ path: resource.path, message: entrypoint.message });
      } else if (!(await pathExists(entrypoint.path))) {
        errors.push({ path: resource.path, message: `Tool introuvable: ${resource.execution.entrypoint}.` });
      }
    }

    if (resource.source?.connector === "local_fs" && resource.source.locator) {
      const source = await resolveResourceTarget(root, resource.path, resource.source.locator);
      if (!source.ok) {
        errors.push({ path: resource.path, message: source.message });
      } else if (!(await pathExists(source.path))) {
        warnings.push({ path: resource.path, message: `Source local_fs introuvable: ${resource.source.locator}.` });
      }
    }

    for (const link of extractRelativeLinks(resource.content)) {
      const target = link.split("#")[0];
      if (!target) continue;
      try {
        const confined = await confineToRoot(root, path.join(path.dirname(resource.path), target));
        if (!(await pathExists(confined))) {
          errors.push({ path: resource.path, message: `Lien relatif introuvable: ${link}.` });
        }
      } catch (error) {
        errors.push({ path: resource.path, message: `Lien relatif refuse: ${link}. ${String(error.message ?? error)}` });
      }
    }
  }

  for (const resource of resources) {
    for (const requirement of resource.requires) {
      if (!requirement || typeof requirement !== "object") continue;
      if (!requirement.ref) continue;
      if (!ids.has(requirement.ref)) {
        warnings.push({ path: resource.path, message: `Ressource requise non trouvee: ${requirement.ref}.` });
      }
    }
  }

  // Fail loudly (but don't break routing): a configured help fallback whose target is nowhere the
  // router will look silently never attaches. Warn so a typo is caught at validate time. The router
  // looks in the root first, then in the framework this root belongs to (FR-ROUTE-009), so validate
  // asks the same two corpora, in the same order, and stays silent when either answers.
  const fb = cfg.routing?.fallback;
  if (fb && !fallbackResolvesIn(fb, resources)) {
    const frameworkRoot = await resolveFrameworkRoot(root, cfg);
    const inFramework = frameworkRoot ? fallbackResolvesIn(fb, await inventoryResources(frameworkRoot)) : false;
    if (!inFramework) {
      warnings.push({
        path: "base.config.json",
        code: "base.routing.fallback_unresolved",
        message: `routing.fallback cible "${fb.agent}/${fb.process}" introuvable, ni dans cet inventaire ni dans le cadre BASE; aucun repli ne sera attaché.`,
      });
    }
  }

  const result = { ok: errors.length === 0, errors, warnings, resources };
  await recordEvent(root, {
    op: "validate",
    action: "validate",
    decision: "not_applicable",
    status: result.ok ? "ok" : "error",
    duration_ms: Date.now() - start,
    metadata: { errors: errors.length, warnings: warnings.length, resources: resources.length },
  });
  return result;
}

// Resource-metadata validation now lives in core/validators.mjs as the Validator pipeline
// (coreSchemaValidator + reference adapters). validateBase runs it; see below.

async function resolveResourceTarget(root, resourcePath, targetPath) {
  const candidates = [targetPath, path.join(path.dirname(resourcePath), targetPath)];
  let lastError = "";
  let lastConfined = null;
  for (const candidate of candidates) {
    try {
      const confined = await confineToRoot(root, candidate);
      lastConfined = confined;
      if (await pathExists(confined)) return { ok: true, path: confined };
      if (!lastError) lastError = `Chemin introuvable: ${targetPath}.`;
    } catch (error) {
      lastError = String(error.message ?? error);
    }
  }
  if (lastError.includes("escapes BASE root")) return { ok: false, message: lastError };
  if (lastConfined) return { ok: true, path: lastConfined };
  return { ok: false, message: lastError || `Chemin introuvable: ${targetPath}.` };
}

async function resolveToolEntrypoint(rootDir, resourcePath, entrypoint) {
  const resolved = await resolveResourceTarget(path.resolve(rootDir), resourcePath, entrypoint);
  if (!resolved.ok) throw new Error(resolved.message);
  if (!(await pathExists(resolved.path))) throw new Error(`Tool introuvable: ${entrypoint}.`);
  return resolved.path;
}

function commandForRuntime(runtime, entrypoint, args) {
  // For Node we use the exact runtime executing BASE (process.execPath) so a tool runs under
  // the same Node, and there is no PATH ambiguity. `python3`/`bash` are resolved via PATH — a
  // documented platform assumption (POSIX-style names); on Windows, provide them on PATH.
  if (runtime === "python") return ["python3", entrypoint, ...args];
  if (runtime === "node") return [process.execPath, entrypoint, ...args];
  if (runtime === "shell") return ["bash", entrypoint, ...args];
  return [entrypoint, ...args];
}

function projectResourceContent(resource, raw, body, projection) {
  // `metadata` must COST LESS than the body it summarizes: serialize the stripped projection
  // (no content/body), never the raw inventory record. The `metadata` projection must cost fewer
  // bytes than `full`, or the cheapest-clue-first ladder breaks.
  if (projection === "metadata") return JSON.stringify(projectResourceMetadata(resource), null, 2);
  if (projection === "instructions") return body;
  return raw;
}

/**
 * @param {string} rootDir
 * @param {string} query
 * @param {BrokerOptions} [options]
 */
export async function searchResources(rootDir, query, { limit = 10, grain = "resource", scope, config, signal, egress } = {}) {
  const start = Date.now();
  const root = path.resolve(rootDir);
  // The SAME tokenization as routing (STOPWORDS stripped): a natural question is scored on its
  // content words, never on «est/les/entre» — aligned with the keyword derivation (index side).
  const terms = routeTerms(query);
  try {
    const cfg = config ?? await resolveConfig(root);
    const rank = composeRankers([lexicalRanker, ...(cfg.rankers ?? [])]);
    // Both per-resource skips are decided ONCE, before the grain, because a grain is a unit of
    // answer and neither rule is about units. Egress: a confidential / local-only resource is not
    // even revealed in discovery to a remote model — withholding its existence is stricter than
    // withholding its content, and correct here; cutting it into passages would hand out the same
    // content in smaller pieces. Generated projection: it summarises the resources it points at, so
    // it competes with them on their own words and wins, and a reader searching for a fact opens a
    // table of contents; its headings are the map's own, which is worse at section grain than at
    // resource grain. Both stay open-able by path; neither is a hit.
    const resources = (await inventoryResources(root)).filter((resource) => !egressWithheld(resource, egress) && !isGeneratedProjection(resource.body));
    const ranked = [];

    if (grain === "section") {
      // Section grain: passages instead of whole resources. The ranking lives in core/sections-search.mjs.
      ranked.push(...searchSectionsIn(resources, terms, { limit, scope }));
    } else {
      for (const resource of resources) {
        const { score, reasons } = await rank(resource, terms, { root, mode: "discover", query, signal });
        if (score > 0) {
          ranked.push({ ...projectResourceMetadata(resource), score, reasons: [...new Set(reasons)] });
        }
      }
    }

    ranked.sort((a, b) => b.score - a.score || compareByCodePoint(a.path, b.path));
    const results = ranked.slice(0, limit);
    await recordEvent(rootDir, {
      op: "discover",
      action: "search",
      decision: "not_applicable",
      status: "ok",
      duration_ms: Date.now() - start,
      args_hash: hashArgs([query, String(limit)]),
      metadata: { results: results.length },
    });
    return results;
  } catch (error) {
    await recordEvent(rootDir, {
      op: "discover",
      action: "search",
      decision: "not_applicable",
      status: "error",
      duration_ms: Date.now() - start,
      args_hash: hashArgs([query, String(limit)]),
      error: String(error.message ?? error),
    });
    throw error;
  }
}

// Route orchestration (the deny-filtered corpus, the two-strategy selection with its fail-closed
// embedding strategy, and the traced routeRequest entry) lives in core/route-broker.mjs. Bound here with the real
// inventory, Studio resolvers and trace recorder, so the facade stays thin while the model resolution
// + try/catch stay in the broker layer (not in core/router); router.mjs / route-service.mjs remain
// model-agnostic. routeRequest is re-exported with an unchanged signature.
const routeBroker = createRouteBroker({
  inventoryResources,
  applyRoutingVectors,
  loadRoutingVectors,
  verifyRoutingVectors,
  resolveConfig,
  computeRoute,
  resolveEmbedder,
  resolveModel,
  readRouting: async (root) => (await readSettings(root)).routing ?? null,
  routingLocality,
  rootEgressPolicy,
  recordEvent,
  hashArgs,
});
export const routeRequest = routeBroker.routeRequest;
// The help target alone, without routing anything: what a caller that decides for itself opens when
// nothing on the routing map fits. Same resolution as an abstention's (root corpus, then framework).
export const routingFallback = routeBroker.routingFallback;

/**
 * Draft a first fixtures file from the corpus (`base route-test --scaffold`). CREATION-ONLY: an
 * existing file belongs to its author and is never rewritten, the same rule as `base init`'s files.
 * @param {string} rootDir @param {{ out?: string }} [options]
 * @returns {Promise<{ path: string, cases: number }>}
 */
export async function scaffoldRouteTests(rootDir, { out } = {}) {
  const root = path.resolve(rootDir);
  // The path the caller asked for, kept verbatim for every message: a root reached through a symlink
  // (macOS /tmp) would otherwise be told about a path it never typed.
  const relative = typeof out === "string" && out.trim() ? out.trim() : ROUTE_TESTS_FILENAME;
  const target = await confineToRoot(root, relative);
  if (await pathExists(target)) throw new Error(`${relative} existe déjà: ce fichier vous appartient. Passez --out <fichier> pour en écrire un autre.`);
  const cases = scaffoldRouteCases(await inventoryResources(root));
  if (cases.length === 0) throw new Error("Aucun process routable: rien à rédiger. Créez d'abord un process avec un «Quand utiliser».");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(cases, null, 2) + "\n", { encoding: "utf8", flag: "wx" }); // raw-write-ok: creation-only scaffold, never an overwrite
  await recordEvent(root, { op: "route-test", action: "write", decision: "allow", status: "ok", path: relative, metadata: { cases: cases.length } });
  return { path: relative, cases: cases.length };
}

// Run the author's routing guarantees: a fixtures file (declarative, zero-dep JSON, each case a
// `request` plus an `expect` of { status?, reason_code?, agent?, process? }) and the phrasings the
// cards declare. Protects business routes from regressions without an academic benchmark.
/**
 * @param {string} rootDir
 * @param {BrokerOptions} [options]
 */
export async function runRouteTests(rootDir, { fixturesPath, config, strategy = "lexical", examples = false } = {}) {
  const root = path.resolve(rootDir);
  const cfg = config ?? await resolveConfig(root);
  const resources = await inventoryResources(root);

  // TWO suites, side by side, because they certify two different promises. The FIXTURES say "these
  // requests must keep routing here" (the author's contract with their users, in their words). The
  // declared EXAMPLES say "every phrasing I wrote on a card still reaches that card" (the drift guard
  // on the corpus itself). Running one and calling the result "routing is fine" hides the other.
  // Explicit intent narrows: `--from <file>` runs that fixtures file alone, `--examples` the examples
  // alone. With neither flag, both run when they exist, and the report names what was absent.
  const wantFixtures = !examples;
  const wantExamples = !fixturesPath && (examples || true);
  const suites = [];

  if (wantFixtures) {
    // The path the caller asked for, kept verbatim in the report (a root reached through a symlink
    // would otherwise be told about a path it never typed).
    const requested = fixturesPath ?? ROUTE_TESTS_FILENAME;
    const target = await confineToRoot(root, requested);
    if (await pathExists(target)) {
      let cases;
      try {
        cases = JSON.parse(await fs.readFile(target, "utf8"));
      } catch (error) {
        throw new Error(`Invalid routing fixtures JSON: ${String(error.message ?? error)}`);
      }
      if (!Array.isArray(cases)) throw new Error("Routing fixtures must be a JSON array of { request, expect } cases.");
      suites.push({ source: "fixtures", path: requested, cases });
    } else if (fixturesPath) {
      // A file the caller NAMED must exist: a silent skip would certify nothing while looking green.
      throw new Error(`Routing fixtures not found: ${requested} (create it or pass --from).`);
    }
  }

  if (wantExamples) {
    const cases = casesFromExamples(resources);
    if (cases.length) suites.push({ source: "examples", path: null, cases });
    else if (examples) {
      // Same rule as a named fixtures file: an explicit `--examples` with nothing to replay certifies
      // zero cases green, which reads as "all promises hold" when none were made.
      throw new Error("No declared routing.examples to replay (add routing.examples to a SKILL.md/AGENT.md frontmatter, or drop --examples to run the JSON fixtures).");
    }
  }

  if (suites.length === 0) {
    throw new Error(`Nothing to certify: no fixtures at ${ROUTE_TESTS_FILENAME} and no routing.examples declared. Run \`base route-test --scaffold\` to draft a fixtures file from your corpus.`);
  }

  // Which strategy PRODUCTION `base route` would use right now, so a green run says honestly WHICH
  // path it certifies: replay defaults to the lexical floor (deterministic, CI-safe);
  // `strategy: "production"` replays through routeRequest, the exact `base route` path.
  let productionStrategy = "lexical";
  try {
    productionStrategy = routingStrategy((await readSettings(root)).routing ?? null);
  } catch { /* unreadable settings → the lexical default, as in routing */ }

  const runSuite = async (suite) => {
    const failures = [];
    for (const [index, testCase] of suite.cases.entries()) {
      const request = testCase?.request;
      const expect = testCase?.expect ?? {};
      if (typeof request !== "string") {
        failures.push({ source: suite.source, index, request: request ?? null, mismatches: ["case has no string `request`"] });
        continue;
      }
      const actual = strategy === "production"
        ? await routeRequest(root, request, { config: cfg })
        : { request, ...(await computeRoute(root, request, resources, cfg)) };
      const mismatches = compareRoute(expect, actual);
      if (mismatches.length) failures.push({ source: suite.source, index, request, mismatches, actual: summarizeRoute(actual) });
    }
    return { source: suite.source, path: suite.path, total: suite.cases.length, passed: suite.cases.length - failures.length, failures };
  };

  const ran = [];
  for (const suite of suites) ran.push(await runSuite(suite));
  const failures = ran.flatMap((s) => s.failures);
  // What a DEFAULT run could not certify, because the source does not exist here (never what a flag
  // deliberately narrowed away): the report says it, so a green line is not read as more than it is.
  const absent = examples || fixturesPath ? [] : ["fixtures", "examples"].filter((s) => !ran.some((r) => r.source === s));

  return {
    ok: failures.length === 0,
    total: ran.reduce((n, s) => n + s.total, 0),
    passed: ran.reduce((n, s) => n + s.passed, 0),
    failures,
    suites: ran,
    absent,
    strategy: strategy === "production" ? productionStrategy : "lexical",
    productionStrategy,
  };
}

export async function listMarkers(rootDir, { egress } = /** @type {BrokerOptions} */ ({})) {
  const start = Date.now();
  const root = path.resolve(rootDir);
  // Egress: scan markers only over the egress-filtered inventory, so a confidential / local-only
  // resource never leaks its marker text (a content snippet) or its path to a remote model.
  const resources = await inventoryResources(root, { egress });
  const markers = [];

  for (const resource of resources) {
    if (isMarkerReferencePath(resource.path)) continue;
    markers.push(...scanMarkers(resource.content, resource.path).map(({ raw, ...marker }) => marker));
  }

  const order = { "A VALIDER": 0, "A COMPLETER": 1, ATTENTION: 2, DECISION: 3 };
  markers.sort((a, b) => (order[a.type] - order[b.type]) || compareByCodePoint(a.path, b.path) || a.line - b.line);

  await recordEvent(root, {
    op: "markers",
    action: "read",
    decision: "not_applicable",
    status: "ok",
    duration_ms: Date.now() - start,
    metadata: { markers: markers.length },
  });
  return markers;
}

// The PolicyEnforcer logic (advisoryPolicy / strictPolicy) lives in core/policy.mjs.
// `decide` resolves the configured policy (default advisory) and applies it. Swap via base.config.policy.
async function decide(rootDir, resource, action, context = {}, config) {
  const cfg = config ?? await resolveConfig(rootDir);
  return resolvePolicy(cfg)(resource, action, context);
}

function extractMarkdownTitle(content) {
  const line = content.split("\n").find((item) => item.startsWith("# "));
  return line ? line.replace(/^#\s+/, "").trim() : "";
}

function deriveTitle(relativePath) {
  return path.basename(relativePath, path.extname(relativePath)).replace(/[-_]/g, " ");
}

function deriveType(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  if (normalized.endsWith("/AGENT.md") || normalized === "AGENT.md") return "agent";
  if (normalized.endsWith("/SKILL.md") && normalized.includes("/processes/")) return "process";
  if (normalized.endsWith("/SKILL.md") && normalized.includes("/competences/")) return "competence";
  if (normalized.includes("/templates/")) return "template";
  if (normalized.includes("/tools/")) return "tool";
  return "document";
}

function deriveDescription(type, body) {
  if (type === "agent") {
    // `[^\S\n]*` (horizontal whitespace only) instead of `\s*` keeps the trailing-space run on the
    // SAME line, so the `$` (multiline) anchor stays deterministic. With `\s*` the run could cross
    // newlines while `$` matched at every line end — catastrophic backtracking on a large AGENT.md,
    // and deriveDescription runs on every agent body during inventory.
    const role = body.match(/agis comme (.+?)\.?[^\S\n]*(?:\*\*)?$/im);
    if (role) return sentenceCase(role[1].replace(/\*/g, "").trim());
  }
  const paragraphs = body
    .replace(/^# .+$/m, "")
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter((item) => item && !item.startsWith("|") && !item.startsWith("```") && !item.startsWith("<!--"));
  return paragraphs[0] ? paragraphs[0].slice(0, 220) : "";
}

function deriveKeywords(metadata, resource) {
  const explicit = Array.isArray(metadata.keywords) ? metadata.keywords : [];
  const candidates = [
    ...explicit,
    resource.id,
    resource.type,
    resource.title,
    resource.description,
    resource.path,
  ].join(" ");

  const words = normalize(candidates)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));

  // Ranking stays domain-agnostic: keywords derive only from explicit metadata and the
  // resource's own text. Domain/intent synonym expansion is intentionally NOT baked into
  // the core (it coupled the engine to the demo examples). It belongs to optional,
  // per-project discovery configuration if ever needed.
  return [...new Set([...explicit.map(String), ...words])].slice(0, 20);
}

function sentenceCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function extractRelativeLinks(content) {
  // Strip fenced blocks and inline code first: a markdown link inside a code *example*
  // (e.g. `[voir](./ancien/chemin.md)`) is documentation, not a real link, and must not be
  // reported as a broken relative link by `validate`.
  const prose = content.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  const links = [];
  const regex = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(prose))) {
    const link = match[1].trim();
    if (/^(https?:|mailto:|#)/i.test(link)) continue;
    links.push(link);
  }
  return links;
}

// normalize() lives in core/rankers.mjs (used by the lexical ranker and keyword derivation).

function slugify(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
