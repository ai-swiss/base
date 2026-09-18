import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export interface BrokerResource {
  id: string;
  type: string;
  title: string;
  description: string;
  path: string;
  scope?: string;
  status?: string;
  sensitivity?: string;
  keywords?: string[];
  requires?: Record<string, unknown>[];
  may_use?: string[];
  source?: Record<string, unknown> | null;
  execution?: Record<string, unknown> | null;
  score?: number;
  reasons?: string[];
}

// The projections openResource accepts. `outline` (the table of contents) and `source` (the record
// behind a converted document, with its printed pages) are section-grain reads: they answer about the
// document rather than returning it, so they belong beside the three body projections, not beside a
// separate tool.
export type BrokerProjection = "metadata" | "instructions" | "full" | "outline" | "source";

export interface BrokerOpenResult {
  resource?: BrokerResource;
  policy?: Record<string, unknown>;
  content: string;
  // What the broker attaches BESIDE the content when a read is narrowed: the passage it landed on,
  // the table of contents, the edition that answered a `lang` request, and the source record with its
  // page images. Each is optional because a plain full read carries none of them; naming them here
  // rather than casting keeps the siblings a contract instead of a lucky property access.
  section?: { anchor: string; heading: string; heading_path: string; ref: string };
  outline?: Array<{ anchor: string; heading: string; level: number; heading_path: string }>;
  edition?: { requested: string | null; language: string | null; fallback: boolean; available?: string[] | null; note?: string };
  source?: Record<string, unknown> | null;
  images?: Array<{ page?: number | null; path: string; mime?: string; data?: string; bytes?: number; missing?: boolean; over_budget?: boolean; unsupported?: boolean }>;
}

/** One hit of a section-grain search: a passage, its heading path, and the citable `id#anchor`. */
export interface BrokerSectionHit {
  id: string;
  path: string;
  type: string;
  title: string;
  section: string | null;
  ref: string;
  heading_path: string;
  passage: string;
  citation: string | null;
  score: number;
  reasons: string[];
}

export interface BrokerInvokeResult {
  dry_run: boolean;
  policy?: Record<string, unknown>;
  command: string[];
  stdout?: string;
  stderr?: string;
}

export interface BrokerRouteRef {
  id: string;
  type: string;
  title: string;
  path: string;
}

/**
 * The help target a root configures for the case where nothing fits. `source` says which corpus
 * answered: `root` (paths relative to the root) or `framework` (absolute paths under `root`, the BASE
 * framework this root belongs to, which may own a welcome process the root borrows rather than copies).
 */
export interface BrokerRoutingFallback {
  agent: { id: string; path: string };
  process: { id: string; path: string };
  source: "root" | "framework";
  root?: string;
}

export interface BrokerRouteCandidate {
  resource: BrokerRouteRef;
  score: number;
  reasons: string[];
  route_scope: string;
}

export interface BrokerRouteResult {
  request: string;
  status: "routed" | "ambiguous" | "needs_clarification" | "out_of_scope";
  reason_code: string | null;
  agent: BrokerRouteRef | null;
  process: BrokerRouteRef | null;
  candidates: BrokerRouteCandidate[];
  explanation: string;
  next_question: string | null;
}

// Egress context the MCP read surface passes to the broker so confidential / local-only resources are
// withheld from a (possibly remote) connecting client. See mcpEgress() below.
type EgressContext = { modelLocality: "local" | "remote"; rootPolicy?: "local-only" | "any" };

interface BrokerModule {
  withTraceActor<T>(actor: unknown, fn: () => T): T;
  confineToRoot(rootDir: string, targetPath: string): Promise<string>;
  resolveConfig(rootDir: string): Promise<Record<string, unknown>>;
  rootEgressPolicy(rootDir: string): Promise<"local-only" | "any">;
  inventoryResources(rootDir: string, options?: { egress?: EgressContext }): Promise<BrokerResource[]>;
  searchResources(rootDir: string, query: string, options?: { limit?: number; grain?: "resource" | "section"; scope?: string; egress?: EgressContext }): Promise<BrokerResource[] | BrokerSectionHit[]>;
  routeRequest(rootDir: string, request: string, options?: { limit?: number; egress?: EgressContext }): Promise<BrokerRouteResult>;
  routingFallback(rootDir: string, options?: { egress?: EgressContext }): Promise<BrokerRoutingFallback | null>;
  buildRoutingRegistry(resources: BrokerResource[]): {
    agents: Array<{
      agent: { id: string; title: string | null; route_text?: string } | null;
      processes: Array<{ id: string; title: string | null; route_text?: string; avoid_text?: string; path: string }>;
    }>;
  };
  openResource(rootDir: string, idOrPath: string, options?: { projection?: BrokerProjection; section?: string; lang?: string; purpose?: string; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerOpenResult>;
  parseFrontmatter(content: string): { data: Record<string, unknown>; body: string; errors: unknown[] };
  accessResource(rootDir: string, idOrPath: string, options?: { projection?: "metadata" | "instructions" | "full"; purpose?: string; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerOpenResult>;
  invokeTool(rootDir: string, idOrPath: string, args?: string[], options?: { dryRun?: boolean; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerInvokeResult>;
  proposeChange(rootDir: string, target: string, content: string, options?: { purpose?: string; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerProposeResult>;
  commitChange(rootDir: string, changeId: string, options?: { confirmed?: boolean; grantToken?: string }): Promise<BrokerCommitResult>;
  listPendingChanges(rootDir: string): Promise<BrokerPendingChange[]>;
  getChangeStatus(rootDir: string, changeId: string): Promise<BrokerChangeStatus>;
  promoteResource(rootDir: string, idOrPath: string, toScope: string, options?: { purpose?: string; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerPromoteResult>;
  listMarkers(rootDir: string, options?: { egress?: EgressContext }): Promise<BrokerMarker[]>;
  contextPack(rootDir: string, idOrPath: string, options?: { budget?: number; egress?: EgressContext }): Promise<BrokerContextPackSummary>;
  renderMcpInstructions(): string;
  MCP_ROUTE_DISCIPLINE: string;
  MCP_READ_DISCIPLINE: string;
  MCP_CONTINUITY: string;
  reportFriction(
    rootDir: string,
    report: { process: string; summary: string; detail?: string; via?: "user" | "assistant" },
  ): Promise<{ path: string }>;
  appendAbstention(
    rootDir: string,
    abstention: { query: string; verdict: string; suggestion?: string | null },
  ): Promise<void>;
  isAbstention(status: string): boolean;
}

interface RootsModule {
  resolveBaseContext(options: {
    cwd?: string;
    explicitRoot?: string;
    explicitWorkspace?: string;
    rootId?: string;
    allowWorkspaceRouting?: boolean;
  }): Promise<Record<string, unknown>>;
  contextScope(context: Record<string, unknown>, cwd?: string): Record<string, unknown>;
}

export interface BrokerPromoteResult extends BrokerProposeResult {
  id: string;
  from: string;
  to: string;
}

export interface BrokerContextPackSummary {
  sections: Array<{ path: string; note?: string }>;
  omitted: string[];
  unresolved: Array<{ ref: string; suggestions: string[] }>;
  withheld: Array<{ path: string; reason: string }>;
}

export interface BrokerMarker {
  path: string;
  line: number;
  type: string;
  text: string;
}

export interface BrokerProposeResult {
  change_id: string;
  target: string;
  exists: boolean;
  decision: { decision: string; reason: string };
  diff: string;
}

export interface BrokerCommitResult {
  written: boolean;
  target: string;
  decision: { decision: string; reason: string };
  content_hash?: string;
}

export interface BrokerPendingChange {
  change_id: string;
  target: string;
  created_at: string;
  purpose: string | null;
  exists: boolean;
}

export interface BrokerChangeStatus {
  change_id: string;
  status: "pending" | "absent" | "invalid";
  target?: string;
  created_at?: string;
  purpose?: string | null;
  note?: string;
}

interface RouteWorkspaceModule {
  decideWorkspaceRoute: (
    attempts: Array<{ root: { id: string; label?: string; type?: string; path: string }; result: BrokerRouteResult }>,
    ctx: { request: string; workspaceScope: unknown; unreachable?: Array<{ id: string; error: string }>; margin?: number },
  ) => Record<string, unknown> & { status: string };
}

let brokerPromise: Promise<BrokerModule> | null = null;
let rootsPromise: Promise<RootsModule> | null = null;
let walkPolicyPromise: Promise<{ UNIVERSAL_SKIP_DIRS: Set<string> }> | null = null;
let routeWorkspacePromise: Promise<RouteWorkspaceModule> | null = null;

/** Attribute every trace event recorded while `fn` runs to `actor` (no-op when actor is empty). */
export async function brokerWithTraceActor<T>(actor: unknown, fn: () => T): Promise<Awaited<T>> {
  const broker = await loadBroker();
  return await broker.withTraceActor(actor, fn);
}

async function loadBroker(): Promise<BrokerModule> {
  if (!brokerPromise) {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
      path.resolve(currentDir, "base-core.mjs"), // bundled beside the compiled index (prod / npx)
      path.resolve(currentDir, "..", "..", "tools", "base-core.mjs"), // repo layout (dev / tsx)
    ];
    let brokerPath = candidates[candidates.length - 1];
    for (const candidate of candidates) {
      try {
        fs.accessSync(candidate);
        brokerPath = candidate;
        break;
      } catch {
        // try the next candidate
      }
    }
    brokerPromise = import(pathToFileURL(brokerPath).href) as Promise<BrokerModule>;
  }
  return brokerPromise;
}

async function loadRoots(): Promise<RootsModule> {
  if (!rootsPromise) {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
      path.resolve(currentDir, "core", "roots.mjs"), // bundled beside the compiled index (prod / npx)
      path.resolve(currentDir, "..", "..", "tools", "core", "roots.mjs"), // repo layout (dev / tsx)
    ];
    let rootsPath = candidates[candidates.length - 1];
    for (const candidate of candidates) {
      try {
        fs.accessSync(candidate);
        rootsPath = candidate;
        break;
      } catch {
        // try the next candidate
      }
    }
    rootsPromise = import(pathToFileURL(rootsPath).href) as Promise<RootsModule>;
  }
  return rootsPromise;
}

/** The shared walk policy (universal skip names) — the same table every walker in the core uses. */
export async function brokerWalkPolicy(): Promise<{ UNIVERSAL_SKIP_DIRS: Set<string> }> {
  if (!walkPolicyPromise) {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
      path.resolve(currentDir, "core", "walk-policy.mjs"), // bundled beside the compiled index (prod / npx)
      path.resolve(currentDir, "..", "..", "tools", "core", "walk-policy.mjs"), // repo layout (dev / tsx)
    ];
    let policyPath = candidates[candidates.length - 1];
    for (const candidate of candidates) {
      try {
        fs.accessSync(candidate);
        policyPath = candidate;
        break;
      } catch {
        // try the next candidate
      }
    }
    walkPolicyPromise = import(pathToFileURL(policyPath).href) as Promise<{ UNIVERSAL_SKIP_DIRS: Set<string> }>;
  }
  return walkPolicyPromise;
}

async function loadRouteWorkspace(): Promise<RouteWorkspaceModule> {
  if (!routeWorkspacePromise) {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
      path.resolve(currentDir, "core", "route-workspace.mjs"), // bundled beside the compiled index (prod / npx)
      path.resolve(currentDir, "..", "..", "tools", "core", "route-workspace.mjs"), // repo layout (dev / tsx)
    ];
    let modPath = candidates[candidates.length - 1];
    for (const candidate of candidates) {
      try {
        fs.accessSync(candidate);
        modPath = candidate;
        break;
      } catch {
        // try the next candidate
      }
    }
    routeWorkspacePromise = import(pathToFileURL(modPath).href) as Promise<RouteWorkspaceModule>;
  }
  return routeWorkspacePromise;
}

// The cross-root workspace routing DECISION, shared verbatim with the CLI (tools/core/route-workspace.mjs),
// so MCP and CLI never diverge on near-ties (both apply the same margin via decideAmong). Pure: no I/O.
export async function brokerDecideWorkspaceRoute(
  attempts: Array<{ root: { id: string; label?: string; type?: string; path: string }; result: BrokerRouteResult }>,
  ctx: { request: string; workspaceScope: unknown; unreachable?: Array<{ id: string; error: string }>; margin?: number },
): Promise<Record<string, unknown> & { status: string }> {
  const mod = await loadRouteWorkspace();
  return mod.decideWorkspaceRoute(attempts, ctx);
}

export async function brokerResolveBaseContext(options: {
  cwd?: string;
  explicitRoot?: string;
  explicitWorkspace?: string;
  rootId?: string;
  allowWorkspaceRouting?: boolean;
}): Promise<Record<string, unknown>> {
  const roots = await loadRoots();
  return roots.resolveBaseContext(options);
}

export function brokerWorkspaceWarnings(context: Record<string, unknown>): Array<{ code?: string; path?: string; message: string }> {
  const workspace = context.workspace;
  if (!workspace || typeof workspace !== "object" || !("warnings" in workspace) || !Array.isArray(workspace.warnings)) return [];
  return workspace.warnings.filter(
    (warning): warning is { code?: string; path?: string; message: string } =>
      Boolean(warning && typeof warning === "object" && "message" in warning && typeof warning.message === "string"),
  );
}

export async function brokerContextScope(context: Record<string, unknown>, cwd = process.cwd()): Promise<Record<string, unknown>> {
  const roots = await loadRoots();
  return roots.contextScope(context, cwd);
}

export async function brokerConfineToProject(rootDir: string, targetPath: string): Promise<string> {
  const broker = await loadBroker();
  return broker.confineToRoot(rootDir, targetPath);
}

export async function brokerResolveConfig(rootDir: string): Promise<Record<string, unknown>> {
  const broker = await loadBroker();
  return broker.resolveConfig(rootDir);
}

export async function brokerInventoryResources(rootDir: string): Promise<BrokerResource[]> {
  const broker = await loadBroker();
  // Egress applies to the inventory too: the agent-bootstrap catalog (load_agent) lists resources
  // straight from here, so a confidential / local-only resource must not even appear by id/title/path.
  return broker.inventoryResources(rootDir, { egress: await mcpEgress(broker, rootDir) });
}

// The MCP server is a SERVER: an external client (possibly a remote cloud model) calls its tools, so
// BASE cannot know the caller's locality. It therefore treats the read surface as a REMOTE egress
// context by default — confidential resources and resources of a local-only root are withheld — so a
// remote model cannot pull them via open/access/discover. An operator who knows the connected client
// is local can opt in with BASE_MCP_ALLOW_CONFIDENTIAL=1 — that asserts a LOCAL client, so it releases
// both confidential resources AND local-only roots (egress only ever withholds toward a remote model).
async function mcpEgress(broker: BrokerModule, rootDir: string): Promise<EgressContext> {
  let rootPolicy: "local-only" | "any" = "any";
  try {
    // Use the dedicated reader: resolveConfig()/mergeConfig drops the `egress` key, so reading
    // cfg.egress would always be undefined and silently leave local-only roots unprotected here.
    rootPolicy = await broker.rootEgressPolicy(rootDir);
  } catch {
    // unreadable config -> default "any"; confidential withholding still applies via modelLocality
  }
  return { modelLocality: process.env.BASE_MCP_ALLOW_CONFIDENTIAL === "1" ? "local" : "remote", rootPolicy };
}

// `grain` chooses the unit of the answer (whole resources, or the passages inside them) and `scope`
// narrows it to one folder. Both are the broker's own options: the adapter carries them rather than
// re-deciding, so the MCP surface and the CLI discover the same way.
export async function brokerSearchResources(
  rootDir: string,
  query: string,
  limit = 10,
  grain: "resource" | "section" = "resource",
  scope?: string,
): Promise<BrokerResource[] | BrokerSectionHit[]> {
  const broker = await loadBroker();
  return broker.searchResources(rootDir, query, { limit, grain, scope, egress: await mcpEgress(broker, rootDir) });
}

/**
 * The `attribution` line declared on ONE folder's README.md card, or null when the folder has no card,
 * no such line, or no readable file. A collection of converted material states once how it must be
 * credited; the deployment decides whether that line travels (mcp.attribution_prefix).
 *
 * The walk up the tree stays with the caller, which is what decides how far to climb and how long a
 * lookup may be trusted. This is the single confined read.
 */
export async function brokerAttributionFor(rootDir: string, relDir: string): Promise<string | null> {
  const broker = await loadBroker();
  try {
    const card = broker.parseFrontmatter(await fs.promises.readFile(await broker.confineToRoot(rootDir, `${relDir}/README.md`), "utf8")).data;
    return typeof card.attribution === "string" && card.attribution.trim() ? card.attribution.trim() : null;
  } catch {
    // no card here (or an unreadable one): the caller climbs to the parent folder
    return null;
  }
}

export async function brokerRouteRequest(rootDir: string, request: string, limit?: number): Promise<BrokerRouteResult> {
  const broker = await loadBroker();
  const egress = await mcpEgress(broker, rootDir);
  return broker.routeRequest(rootDir, request, typeof limit === "number" ? { limit, egress } : { egress });
}

// The help target, resolved by the ENGINE (root corpus, then the framework corpus the root belongs to),
// never by a second read of `routing.fallback`: a root that borrows the framework's welcome process
// would otherwise be reported as having no help at all, and a typo'd target as having one.
export async function brokerRoutingFallback(rootDir: string): Promise<BrokerRoutingFallback | null> {
  const broker = await loadBroker();
  return broker.routingFallback(rootDir, { egress: await mcpEgress(broker, rootDir) });
}

export interface BrokerRoutingMapProcess {
  id: string;
  title: string | null;
  use_when: string | null;
  avoid: string | null;
  path: string;
}
export interface BrokerRoutingMapAgent {
  id: string;
  title: string | null;
  use_when: string | null;
  processes: BrokerRoutingMapProcess[];
}

// The compact routing map a model reads to route: agents (with their use_when) and their processes
// (with use_when + avoid), egress-filtered. It is the SAME derivation the generated index is built
// from (buildRoutingRegistry), so the thin-client MCP path and file-capable agents route on one map.
export async function brokerRoutingMap(rootDir: string): Promise<BrokerRoutingMapAgent[]> {
  const broker = await loadBroker();
  const resources = await broker.inventoryResources(rootDir, { egress: await mcpEgress(broker, rootDir) });
  const registry = broker.buildRoutingRegistry(resources);
  return registry.agents
    .map((a) =>
      a.agent
        ? {
            id: a.agent.id,
            title: a.agent.title ?? null,
            use_when: a.agent.route_text ?? null,
            processes: a.processes.map((p) => ({
              id: p.id,
              title: p.title ?? null,
              use_when: p.route_text ?? null,
              avoid: p.avoid_text ?? null,
              path: p.path,
            })),
          }
        : null,
    )
    .filter((a): a is BrokerRoutingMapAgent => a !== null);
}

// `section` narrows the read to one passage and `lang` picks the edition to read it from. The anchor
// may also ride on `idOrPath` as `id#anchor`, which the broker splits itself: a ref copied out of a
// section hit works wherever an id works, and the adapter has no reason to take it apart first.
export async function brokerOpenResource(
  rootDir: string,
  idOrPath: string,
  projection: BrokerProjection = "full",
  purpose = "",
  confirmed = false,
  grantToken?: string,
  section?: string,
  lang?: string,
): Promise<BrokerOpenResult> {
  const broker = await loadBroker();
  return broker.openResource(rootDir, idOrPath, { projection, section, lang, purpose, confirmed, grantToken, egress: await mcpEgress(broker, rootDir) });
}

export async function brokerAccessResource(
  rootDir: string,
  idOrPath: string,
  projection: "metadata" | "instructions" | "full" = "full",
  purpose = "",
  confirmed = false,
  grantToken?: string,
): Promise<BrokerOpenResult> {
  const broker = await loadBroker();
  return broker.accessResource(rootDir, idOrPath, { projection, purpose, confirmed, grantToken, egress: await mcpEgress(broker, rootDir) });
}

export async function brokerInvokeTool(
  rootDir: string,
  idOrPath: string,
  args: string[] = [],
  dryRun = true,
  confirmed = false,
  grantToken?: string,
): Promise<BrokerInvokeResult> {
  const broker = await loadBroker();
  return broker.invokeTool(rootDir, idOrPath, args, { dryRun, confirmed, grantToken, egress: await mcpEgress(broker, rootDir) });
}

export async function brokerProposeChange(
  rootDir: string,
  target: string,
  content: string,
  purpose = "",
  confirmed = false,
  grantToken?: string,
): Promise<BrokerProposeResult> {
  const broker = await loadBroker();
  return broker.proposeChange(rootDir, target, content, { purpose, confirmed, grantToken, egress: await mcpEgress(broker, rootDir) });
}

// The field loop: friction reports + abstention journal — origin "terrain", append-only under .ai/feedback/.
export async function brokerReportFriction(
  rootDir: string,
  report: { process: string; summary: string; detail?: string; via?: "user" | "assistant" },
): Promise<{ path: string }> {
  const broker = await loadBroker();
  return broker.reportFriction(rootDir, report);
}

export async function brokerAppendAbstention(
  rootDir: string,
  abstention: { query: string; verdict: string; suggestion?: string | null },
): Promise<void> {
  const broker = await loadBroker();
  return broker.appendAbstention(rootDir, abstention);
}

export async function brokerIsAbstention(status: string): Promise<boolean> {
  const broker = await loadBroker();
  return broker.isAbstention(status);
}

export async function brokerCommitChange(
  rootDir: string,
  changeId: string,
  confirmed = false,
  grantToken?: string,
): Promise<BrokerCommitResult> {
  const broker = await loadBroker();
  return broker.commitChange(rootDir, changeId, { confirmed, grantToken });
}

export async function brokerListPendingChanges(rootDir: string): Promise<BrokerPendingChange[]> {
  const broker = await loadBroker();
  return broker.listPendingChanges(rootDir);
}

export async function brokerGetChangeStatus(rootDir: string, changeId: string): Promise<BrokerChangeStatus> {
  const broker = await loadBroker();
  return broker.getChangeStatus(rootDir, changeId);
}

export async function brokerPromoteResource(
  rootDir: string,
  idOrPath: string,
  toScope: string,
  purpose = "",
  confirmed = false,
  grantToken?: string,
): Promise<BrokerPromoteResult> {
  const broker = await loadBroker();
  return broker.promoteResource(rootDir, idOrPath, toScope, { purpose, confirmed, grantToken, egress: await mcpEgress(broker, rootDir) });
}

export async function brokerListMarkers(rootDir: string): Promise<BrokerMarker[]> {
  const broker = await loadBroker();
  return broker.listMarkers(rootDir, { egress: await mcpEgress(broker, rootDir) });
}

// The canonical MCP guidance, loaded from the ONE source (tools/core/bootstrap.mjs): the server
// `instructions` and the discipline sentences the route_request description carries. Loaded once at
// server creation — the reason createServer is async.
export interface BrokerMcpGuidance {
  instructions: string;
  routeDiscipline: string;
  readDiscipline: string;
  continuity: string;
}

export async function brokerMcpGuidance(): Promise<BrokerMcpGuidance> {
  const broker = await loadBroker();
  return {
    instructions: broker.renderMcpInstructions(),
    routeDiscipline: broker.MCP_ROUTE_DISCIPLINE,
    readDiscipline: broker.MCP_READ_DISCIPLINE,
    continuity: broker.MCP_CONTINUITY,
  };
}

// The retrieval planner: paths + notes, never bodies. Under the MCP egress posture a confidential
// process is not even revealed (same not-found as open_resource on this surface).
export async function brokerContextPack(rootDir: string, idOrPath: string): Promise<BrokerContextPackSummary> {
  const broker = await loadBroker();
  return broker.contextPack(rootDir, idOrPath, { egress: await mcpEgress(broker, rootDir) });
}
