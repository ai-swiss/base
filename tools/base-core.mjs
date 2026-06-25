// Dense facade, by design: the pure logic lives in tools/core/*, this module orchestrates.
// Growth discipline (triggered, not speculative): before adding a new broker feature, first
// extract the affected domain into tools/core/ (candidates: writes, route orchestration,
// projections). The public surface of this facade never changes during an extraction.
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { confineToRoot, pathExists } from "./core/confine.mjs";
import { isRuntimeArtifact } from "./core/runtime-artifacts.mjs";
import { composeMarkdown, FrontmatterSerializeError, parseFrontmatter, serializeFrontmatter } from "./core/frontmatter.mjs";
import { resolveConfig } from "./core/config.mjs";
import { compareByCodePoint } from "./core/ordering.mjs";
import { scanMarkers } from "./core/markers.mjs";
import { SCHEMA_VERSION } from "./core/schema.mjs";
import { coreSchemaValidator, runValidators } from "./core/validators.mjs";
import { normalize, lexicalRanker, composeRankers } from "./core/rankers.mjs";
import { advisoryPolicy, resolvePolicy } from "./core/policy.mjs";
import { buildRoutingRegistry } from "./core/routing.mjs";
import { createRouteBroker } from "./core/route-broker.mjs";
import { readSettings, resolveEmbedder, resolveModel } from "./core/model-settings.mjs";
import { renderRoutingIndex } from "./core/index-md.mjs";
import { applyRoutingVectors, loadRoutingVectors } from "./core/routing-vectors.mjs";
import { renderAgentsMd, renderBootstrapMd, renderToolMatrix, renderClaudeMd, renderCursorRule } from "./core/bootstrap.mjs";
import { WORKSPACE_FILENAME } from "./core/roots.mjs";
import { computeRoute, compareRoute, summarizeRoute, STOPWORDS } from "./core/route-service.mjs";
import { hashArgs } from "./core/hashing.mjs";
import { writeFileAtomic } from "./core/atomic.mjs";
import { createBrokerWrites } from "./core/writes.mjs";
import { createManifest } from "./core/manifest.mjs";
import { checkEgress, egressNotice, rootEgressPolicy } from "./core/egress.mjs";
import { reportProgress } from "./core/progress.mjs";
export { rootEgressPolicy };

export { SCHEMA_VERSION };
export const MANIFEST_FILENAME = "base.manifest.json";
export const TRACE_DIR = path.join(".ai", "trace");
export const CHANGES_DIR = path.join(".ai", "changes");
export const ROUTE_TESTS_FILENAME = path.join(".ai", "routing", "route-tests.json");

// Never resources, in any root: VCS, scratch, build output, and tool-output directories (coverage,
// Playwright, Vite). Inventory correctness must not depend on .gitignore, so the scanner owns this.
const SKIP_DIRS = new Set([
  ".git", ".github", ".temp", ".plans", ".reviews", "node_modules", "dist", "trace", ".base-docs",
  "coverage", "test-results", "playwright-report", "blob-report", ".playwright", ".vite", ".nyc_output",
]);
const RESOURCE_EXTENSIONS = new Set([".md", ".json"]);
// Validate announces a single stage line always; a per-resource [i/N] counter only above this size,
// below which (today's corpus is ~147) a counter would be noise, not reassurance.
const VALIDATE_COUNTER_THRESHOLD = 300;
const MAINTENANCE_TOKEN_PATTERN = /\b(?:TODO|FIXME|PLACEHOLDER)\b/g;
// The base.resource.v1 controlled vocabulary lives in core/schema.mjs (used by core/validators.mjs).
const execFileAsync = promisify(execFile);

/** @typedef {{ projection?: string, purpose?: string, confirmed?: boolean, grantToken?: string, resources?: any[], config?: any, signal?: AbortSignal, limit?: number, dryRun?: boolean, fixturesPath?: string, egress?: { modelLocality: "local" | "remote", rootPolicy?: "local-only" | "any" }, embeddingStrategy?: { readRouting?: () => Promise<any>, resolveEmbedder?: (root: string, ref: string) => Promise<any>, resolveModel?: (root: string, ref: string) => Promise<any> } }} BrokerOptions */

// confineToRoot + pathExists live in core/confine.mjs; re-exported for the façade.
export { confineToRoot, pathExists };

// Extension foundation: config resolver + stable error-code registry (façade re-exports).
export { resolveConfig, DEFAULTS, mergeConfig } from "./core/config.mjs";
export { appendAbstention, isAbstention, normalizeQuery, reportFriction } from "./core/feedback.mjs";
export { CODES, codeMessage } from "./core/codes.mjs";
export { compareByCodePoint } from "./core/ordering.mjs";
export {
  formatMaintenanceReport,
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
export { ROUTER_BODY, ROUTER_INTRO, renderClaudeMd, renderBootstrapMd, renderCursorRule } from "./core/bootstrap.mjs";

export async function walkResourceFiles(rootDir) {
  const root = path.resolve(rootDir);
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
      if (SKIP_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const relativeFromRoot = path.relative(root, fullPath).split(path.sep).join("/");
      if (relativeFromRoot === ".ai/trace" || relativeFromRoot.startsWith(".ai/trace/")) continue;
      if (relativeFromRoot === ".ai/changes" || relativeFromRoot.startsWith(".ai/changes/")) continue;
      // Evaluation data: scenario specs, run results and reports are eval artifacts, not resources.
      if (relativeFromRoot === ".ai/experiments" || relativeFromRoot.startsWith(".ai/experiments/")) continue;
      // The generated routing registry is a derived projection, not a source resource.
      if (relativeFromRoot === ".ai/routing" || relativeFromRoot.startsWith(".ai/routing/")) continue;
      // The agent template is scaffolding, not a discoverable business resource.
      if (relativeFromRoot === ".ai/agents/_template" || relativeFromRoot.startsWith(".ai/agents/_template/")) continue;
      // Engineering specs are developer docs, not business resources: keep them out of
      // inventory/discovery/manifest (resource boundary, plan 0A.3). They are reviewed via CI + tests.
      if (relativeFromRoot === "specs" || relativeFromRoot.startsWith("specs/")) continue;
      // Examples are standalone sample projects, not the framework's own resources. Each is
      // validated/discovered in isolation (`--root exemples/<name>`); merging them here would
      // share an id namespace across independent projects and pollute framework discovery.
      if (relativeFromRoot === "exemples" || relativeFromRoot.startsWith("exemples/")) continue;
      // The official optional packages (`@ai-swiss/base-ranker-semantic`, `-index-local`) are
      // separate publishable units with their own README/SECURITY/package.json — not the framework's
      // own business resources. Same resource boundary as specs/ and exemples/.
      if (relativeFromRoot === "packages" || relativeFromRoot.startsWith("packages/")) continue;
      // The test tree holds fixtures and scaffolding, never business resources: a golden eval set or a
      // sample frontmatter file must never become routable. Same resource boundary as specs/ and exemples/.
      if (relativeFromRoot === "tests" || relativeFromRoot.startsWith("tests/")) continue;
      // Documentation translation mirrors (docs/en/…, docs/de/…) shadow a French source for the docs
      // site; they are translations, not standalone resources, so they stay out of inventory,
      // discovery and the manifest (their links resolve against the French source, not their own path).
      if (/^docs\/(en|de|it)\//.test(relativeFromRoot)) continue;

      if (entry.isDirectory()) {
        await visit(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!RESOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;

      const relativePath = path.relative(root, fullPath);
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
    const files = (await walkResourceFiles(root)).filter((f) => !isRuntimeArtifact(f));
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

// `build all` expands to the always-on projections; opt-in targets are absent from it (see PROJECTIONS).
const DEFAULT_BUILD = ["agents-md", "tools", "bootstrap"];

// Build projections, one table instead of a per-target if-chain (the orchestration ratchet's "extract
// the projections"): target → (resources, root) => [{ path, content }] (sync or async). The opt-in targets (routing-registry,
// routing-index) are absent from DEFAULT_BUILD, so `build all` keeps every project's tree minimal — the
// Router derives candidates in memory for small projects; the on-disk faces are a scale optimisation
// behind the same model, not a file every project carries.
const PROJECTIONS = {
  "agents-md": (resources) => [{ path: "AGENTS.md", content: renderAgentsMd(resources) }],
  tools: () => [{ path: ".ai/tools.md", content: renderToolMatrix() }],
  // One canonical router body (core/bootstrap.mjs) projected into every harness entry point so they cannot drift.
  bootstrap: () => [
    { path: "CLAUDE.md", content: renderClaudeMd() },
    { path: "BASE_BOOTSTRAP.md", content: renderBootstrapMd() },
    { path: ".cursor/rules/assistant.mdc", content: renderCursorRule() },
  ],
  "routing-registry": (resources) => [{ path: ".ai/routing/registry.json", content: JSON.stringify(buildRoutingRegistry(resources), null, 2) + "\n" }],
  // Agent-readable face of the registry (root + per-agent index.md), committed and CI-gated (routing.md).
  "routing-index": async (resources, root) => {
    const deny = (await resolveConfig(root)).routing?.policy?.deny;
    return Object.entries(renderRoutingIndex(buildRoutingRegistry(resources), { rootDeny: Array.isArray(deny) ? deny : [] })).map(([path, content]) => ({ path, content }));
  },
};

export async function buildArtifacts(rootDir, { targets = ["all"] } = {}) {
  const root = path.resolve(rootDir);
  const resources = await inventoryResources(root);
  const want = targets.includes("all") ? DEFAULT_BUILD : targets;
  return (await Promise.all(want.map(async (t) => ((await PROJECTIONS[t]?.(resources, root)) ?? []).map((a) => ({ target: t, ...a }))))).flat();
}

export async function writeArtifacts(rootDir, artifacts) {
  const start = Date.now();
  const root = path.resolve(rootDir);
  const written = [];
  for (const artifact of artifacts) {
    const full = await confineToRoot(root, artifact.path);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await writeFileAtomic(full, artifact.content);
    written.push(artifact.path);
  }
  await recordEvent(root, {
    op: "build",
    action: "write",
    decision: "allow",
    status: "ok",
    duration_ms: Date.now() - start,
    metadata: { artifacts: written.length },
  });
  return written;
}

function findResource(resources, idOrPath) {
  return resources.find((item) => item.id === idOrPath || item.path === idOrPath);
}

// Egress at the read chokepoint. When a caller supplies its egress context (a remote model in chat,
// the eval SUT, or the MCP read surface), a confidential resource or a resource of a local-only root
// is withheld HERE, so the rule cannot be bypassed by a tool read (open/access/discover). The refusal
// is SAID (the content becomes the egress notice), never silent. Absent egress (the local human CLI),
// reads are unchanged. This keeps egress.mjs's promise: one control point, no divergence by surface.
function egressWithheld(resource, egress) {
  if (!egress) return null;
  const verdict = checkEgress({ modelLocality: egress.modelLocality, rootPolicy: egress.rootPolicy, resources: [resource] });
  return verdict.withheld.length ? verdict.withheld : null;
}

/**
 * @param {string} rootDir
 * @param {string} idOrPath
 * @param {BrokerOptions} [options]
 */
export async function openResource(rootDir, idOrPath, { projection = "full", purpose = "", confirmed = false, grantToken, resources, config, egress } = {}) {
  const start = Date.now();
  const resourceList = resources ?? await inventoryResources(rootDir);
  const resource = findResource(resourceList, idOrPath);
  if (!resource) throw new Error(`Resource not found: ${idOrPath}`);

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
    const result = {
      resource,
      policy: decision,
      content: projectResourceContent(resource, raw, parsed.body, projection),
    };
    const withheld = egressWithheld(resource, egress);
    if (withheld) {
      result.content = egressNotice(withheld);
      result.withheld = true;
      result.egress_reason = withheld[0].reason;
      // The resource sibling carries .content/.body/.description/.title/.metadata of the confidential
      // file, and consumers (the MCP handler) serialize the whole result object. Reduce it to the
      // identifiers the caller already supplied so no confidential field leaves on this path either.
      result.resource = { id: resource.id, type: resource.type, path: resource.path, withheld: true };
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
const { proposeChange, commitChange, promoteResource } = createBrokerWrites({
  decide,
  recordEvent,
  inventoryResources,
  changesDir: CHANGES_DIR,
});
export { proposeChange, commitChange, promoteResource };

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

  // Fail loudly (but don't break routing): a configured help fallback whose target is not in the
  // inventory will silently never attach. Warn so a typo is caught at validate time.
  const fb = cfg.routing?.fallback;
  if (fb) {
    const hasAgent = resources.some((r) => r.type === "agent" && r.id === fb.agent);
    const hasProcess = resources.some((r) => r.type === "process" && r.id === fb.process);
    if (!hasAgent || !hasProcess) {
      warnings.push({
        path: "base.config.json",
        code: "base.routing.fallback_unresolved",
        message: `routing.fallback cible "${fb.agent}/${fb.process}" introuvable dans l'inventaire; aucun repli ne sera attaché.`,
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
  if (projection === "metadata") return JSON.stringify(resource, null, 2);
  if (projection === "instructions") return body;
  return raw;
}

/**
 * @param {string} rootDir
 * @param {string} query
 * @param {BrokerOptions} [options]
 */
export async function searchResources(rootDir, query, { limit = 10, config, signal, egress } = {}) {
  const start = Date.now();
  const root = path.resolve(rootDir);
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  try {
    const cfg = config ?? await resolveConfig(root);
    const rank = composeRankers([lexicalRanker, ...(cfg.rankers ?? [])]);
    const resources = await inventoryResources(root);
    const ranked = [];

    for (const resource of resources) {
      // Egress: a confidential / local-only resource is not even revealed in discovery to a remote
      // model — withholding its existence is stricter than withholding its content, and correct here.
      if (egressWithheld(resource, egress)) continue;
      const { score, reasons } = await rank(resource, terms, { root, mode: "discover", query, signal });
      if (score > 0) {
        ranked.push({ ...projectResourceMetadata(resource), score, reasons: [...new Set(reasons)] });
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
  resolveConfig,
  computeRoute,
  resolveEmbedder,
  resolveModel,
  readRouting: async (root) => (await readSettings(root)).routing ?? null,
  recordEvent,
  hashArgs,
});
export const routeRequest = routeBroker.routeRequest;

// Run a routing fixtures file (declarative, zero-dep JSON): each case has a `request` and an
// `expect` of { status?, reason_code?, agent?, process? }. Protects business routes from regressions
// without an academic benchmark. Returns { ok, total, passed, failures[] }.
/**
 * @param {string} rootDir
 * @param {BrokerOptions} [options]
 */
export async function runRouteTests(rootDir, { fixturesPath, config } = {}) {
  const root = path.resolve(rootDir);
  const target = await confineToRoot(root, fixturesPath ?? ROUTE_TESTS_FILENAME);
  if (!(await pathExists(target))) {
    throw new Error(`Routing fixtures not found: ${path.relative(root, target)} (create it or pass --from).`);
  }
  let cases;
  try {
    cases = JSON.parse(await fs.readFile(target, "utf8"));
  } catch (error) {
    throw new Error(`Invalid routing fixtures JSON: ${String(error.message ?? error)}`);
  }
  if (!Array.isArray(cases)) throw new Error("Routing fixtures must be a JSON array of { request, expect } cases.");

  const cfg = config ?? await resolveConfig(root);
  const resources = await inventoryResources(root);
  const failures = [];
  for (const [index, testCase] of cases.entries()) {
    const request = testCase?.request;
    const expect = testCase?.expect ?? {};
    if (typeof request !== "string") {
      failures.push({ index, request: request ?? null, mismatches: ["case has no string `request`"] });
      continue;
    }
    const actual = { request, ...(await computeRoute(root, request, resources, cfg)) };
    const mismatches = compareRoute(expect, actual);
    if (mismatches.length) failures.push({ index, request, mismatches, actual: summarizeRoute(actual) });
  }

  return { ok: failures.length === 0, total: cases.length, passed: cases.length - failures.length, failures };
}

// Static, owner-run structural insights: things that can drift silently, found without running
// anything and without watching usage. This is a private lens the owner runs on their own BASE,
// not telemetry. It reads structure, never behaviour.
function computeStructuralInsights(resources) {
  // The portion of a path that an agent/process body would reference (relative to the agent dir).
  const bodyRef = (p) => {
    const m = p.match(/(?:skills|templates)\/.+$/);
    return m ? m[0] : p;
  };
  const containerBodies = resources
    .filter((resource) => resource.type === "agent" || resource.type === "process")
    .map((resource) => resource.content);

  const weakRouting = [];
  const orphans = [];

  for (const resource of resources) {
    // A user-facing process routes on use_when + routing examples. With neither, its routing is a
    // weak signal that can drift silently (the case route fixtures exist to catch).
    if (resource.type === "process") {
      const hasUseWhen = typeof resource.use_when === "string" && resource.use_when.trim().length > 0;
      const examples = resource.metadata?.routing?.examples;
      const hasExamples = Array.isArray(examples) && examples.length > 0;
      if (!hasUseWhen && !hasExamples) weakRouting.push(resource.path);
    }
    // A competence or template referenced by no agent and no process is either dead weight or a
    // missing link. Either way the owner should see it.
    if (resource.type === "competence" || resource.type === "template") {
      const ref = bodyRef(resource.path);
      if (!containerBodies.some((body) => body.includes(ref))) orphans.push(resource.path);
    }
  }
  return { weak_routing: weakRouting, orphans };
}

// An open marker is a pending human decision. When the file carrying it has not been touched for
// this long, the marker has likely stopped being a decision point and become decor ("verification
// theater"). mtime is an approximation (any edit resets it), which is exactly the honest signal we
// want: "nobody has even opened this file in a month".
const STALE_MARKER_DAYS = 30;

export async function createMaintenanceReport(rootDir) {
  const start = Date.now();
  const validation = await validateBase(rootDir);
  const resources = validation.resources;
  const placeholders = [];
  const missingDescriptions = [];
  const traceSummary = await summarizeTrace(rootDir);
  const structural = computeStructuralInsights(resources);

  for (const resource of resources) {
    if (isMarkerReferencePath(resource.path)) continue;
    const markers = scanMarkers(resource.content, resource.path).map((marker) => marker.raw);
    const tokens = resource.content.match(MAINTENANCE_TOKEN_PATTERN) ?? [];
    const matches = [...markers, ...tokens];
    if (matches.length > 0) {
      placeholders.push({ path: resource.path, markers: [...new Set(matches)] });
    }
    if (!resource.description && ["agent", "process", "tool"].includes(resource.type)) {
      missingDescriptions.push(resource.path);
    }
  }

  const staleMarkers = [];
  const staleCutoffMs = Date.now() - STALE_MARKER_DAYS * 24 * 60 * 60 * 1000;
  for (const item of placeholders) {
    if (isDocumentationMarkerPath(item.path)) continue;
    try {
      const stat = await fs.stat(path.join(path.resolve(rootDir), item.path));
      if (stat.mtimeMs < staleCutoffMs) {
        staleMarkers.push({
          path: item.path,
          markers: item.markers,
          days: Math.floor((Date.now() - stat.mtimeMs) / (24 * 60 * 60 * 1000)),
        });
      }
    } catch {
      // unreadable mtime: no age signal, never an error
    }
  }
  structural.stale_markers = staleMarkers;

  const report = {
    ok: validation.ok,
    summary: {
      resources: resources.length,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      placeholders: placeholders.length,
      actionable_placeholders: placeholders.filter((item) => !isDocumentationMarkerPath(item.path)).length,
      missing_descriptions: missingDescriptions.length,
      weak_routing: structural.weak_routing.length,
      orphans: structural.orphans.length,
      stale_markers: staleMarkers.length,
      trace_events: traceSummary.events,
    },
    validation,
    placeholders,
    missing_descriptions: missingDescriptions,
    structural,
    trace: traceSummary,
    recommendations: buildMaintenanceRecommendations(validation, placeholders, missingDescriptions, structural),
  };
  await recordEvent(rootDir, {
    op: "entretien",
    action: "maintain",
    decision: "not_applicable",
    status: report.ok ? "ok" : "error",
    duration_ms: Date.now() - start,
    metadata: { placeholders: placeholders.length, trace_events: traceSummary.events },
  });
  return report;
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

/**
 * @param {any} validation
 * @param {any[]} placeholders
 * @param {string[]} missingDescriptions
 * @param {{ weak_routing: string[], orphans: string[], stale_markers?: any[] }} [structural]
 */
function buildMaintenanceRecommendations(validation, placeholders, missingDescriptions, structural = { weak_routing: [], orphans: [] }) {
  const recommendations = [];
  if (validation.errors.length > 0) recommendations.push("Corriger les erreurs de validation avant de promouvoir ou partager ce BASE.");
  if (validation.warnings.length > 0) recommendations.push("Relire les avertissements pour ameliorer la decouvrabilite sans bloquer l'usage.");
  if (placeholders.length > 0) recommendations.push("Verifier les marqueurs ouverts et transformer les decisions validees en contenu stable.");
  if (missingDescriptions.length > 0) recommendations.push("Ajouter des descriptions courtes aux agents, processes et tools exposes.");
  if (structural.weak_routing.length > 0) recommendations.push("Ajouter use_when ou des exemples de routage aux processes a signal faible: sans cela leur routage peut deriver sans alerte.");
  if (structural.orphans.length > 0) recommendations.push("Relier ou retirer les competences et templates orphelins: aucun agent ni process ne les reference.");
  if ((structural.stale_markers ?? []).length > 0) recommendations.push(`Traiter les marqueurs dormants (fichiers non touches depuis ${STALE_MARKER_DAYS} jours ou plus): un marqueur qui ne declenche plus de decision est du theatre de verification.`);
  if (recommendations.length === 0) recommendations.push("Aucune action critique detectee; le BASE est coherent pour un usage local.");
  return recommendations;
}

// The PolicyEnforcer logic (advisoryPolicy / strictPolicy) lives in core/policy.mjs.
// `decide` resolves the configured policy (default advisory) and applies it. Swap via base.config.policy.
async function decide(rootDir, resource, action, context = {}, config) {
  const cfg = config ?? await resolveConfig(rootDir);
  return resolvePolicy(cfg)(resource, action, context);
}

export async function recordEvent(rootDir, event) {
  const root = path.resolve(rootDir);
  const traceDir = path.join(root, TRACE_DIR);
  const ts = new Date().toISOString();
  const entry = {
    ts,
    trace_id: event.trace_id ?? crypto.randomUUID(),
    op: event.op,
    resource_id: event.resource_id ?? null,
    path: event.path ?? null,
    action: event.action ?? null,
    decision: event.decision ?? "not_applicable",
    status: event.status ?? "ok",
    duration_ms: event.duration_ms ?? null,
    args_hash: event.args_hash ?? null,
    error: event.error ?? null,
    metadata: event.metadata ?? undefined,
  };

  try {
    await fs.mkdir(traceDir, { recursive: true });
    const filePath = path.join(traceDir, `${ts.slice(0, 10)}.jsonl`);
    await fs.appendFile(filePath, JSON.stringify(entry) + "\n", "utf8"); // raw-write-ok: append-only trace journal, not a mediated business resource
  } catch {
    // Tracing must never break the user's actual work.
  }
}

export async function summarizeTrace(rootDir) {
  const traceDir = path.join(path.resolve(rootDir), TRACE_DIR);
  const summary = {
    events: 0,
    by_operation: {},
    by_resource: {},
    denied: 0,
    errors: 0,
  };

  let files = [];
  try {
    files = await fs.readdir(traceDir);
  } catch {
    return summary;
  }

  for (const file of files.filter((item) => item.endsWith(".jsonl")).sort()) {
    const content = await fs.readFile(path.join(traceDir, file), "utf8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);
        summary.events++;
        if (event.op) summary.by_operation[event.op] = (summary.by_operation[event.op] ?? 0) + 1;
        if (event.resource_id) summary.by_resource[event.resource_id] = (summary.by_resource[event.resource_id] ?? 0) + 1;
        if (event.decision === "deny") summary.denied++;
        if (event.status === "error") summary.errors++;
      } catch {
        summary.errors++;
      }
    }
  }

  return summary;
}

// Trace is an append-only, local, git-ignored journal (daily `YYYY-MM-DD.jsonl` files). It is useful
// — `base trace` and the entretien report read it back — but it grows without bound. This gives the
// user explicit control over its retention, instead of silently pruning behind their back. Default
// keeps the last 30 days; `{ all: true }` clears everything; `before` (a YYYY-MM-DD cutoff) is the
// deterministic seam for tests. Filenames are dated, so a lexicographic compare is enough.
export async function pruneTrace(rootDir, { keepDays = 30, all = false, before = null } = {}) {
  const traceDir = path.join(path.resolve(rootDir), TRACE_DIR);
  let files = [];
  try {
    files = await fs.readdir(traceDir);
  } catch {
    return { removed: [], removed_count: 0, kept: 0, cutoff: null };
  }

  let cutoff = null;
  if (!all) {
    if (before) {
      cutoff = before;
    } else {
      const day = new Date();
      day.setUTCDate(day.getUTCDate() - keepDays);
      cutoff = day.toISOString().slice(0, 10);
    }
  }

  const removed = [];
  let kept = 0;
  for (const file of files.filter((item) => item.endsWith(".jsonl")).sort()) {
    const dated = /^\d{4}-\d{2}-\d{2}$/.test(file.slice(0, 10)) ? file.slice(0, 10) : null;
    if (all || (dated !== null && cutoff !== null && dated < cutoff)) {
      try {
        await fs.rm(path.join(traceDir, file), { force: true });
        removed.push(file);
      } catch {
        // Best-effort: a file we cannot remove is simply kept; pruning never throws into the workflow.
      }
    } else {
      kept++;
    }
  }

  return { removed, removed_count: removed.length, kept, cutoff };
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
  if (normalized === "base.schema.json") return "schema";
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

function isDocumentationMarkerPath(relativePath) {
  return relativePath.startsWith("docs/")
    || relativePath.includes("/_template/")
    || relativePath.includes("/templates/")
    || relativePath.endsWith("README.md")
    || relativePath.endsWith(".test.mjs")
    || relativePath.endsWith(".test.ts");
}

function isMarkerReferencePath(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  return normalized.startsWith(".ai/agents/")
    || normalized.includes("/.ai/agents/")
    || normalized.startsWith("docs/")
    || normalized.startsWith("specs/")
    || normalized.startsWith("tests/")
    || normalized.startsWith("tools/")
    || normalized.startsWith("mcp/")
    || normalized.endsWith("README.md")
    || normalized.endsWith(".test.mjs")
    || normalized.endsWith(".test.ts");
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
