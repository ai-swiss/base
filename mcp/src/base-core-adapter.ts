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

export interface BrokerOpenResult {
  resource?: BrokerResource;
  policy?: Record<string, unknown>;
  content: string;
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
  confineToRoot(rootDir: string, targetPath: string): Promise<string>;
  resolveConfig(rootDir: string): Promise<Record<string, unknown>>;
  rootEgressPolicy(rootDir: string): Promise<"local-only" | "any">;
  inventoryResources(rootDir: string, options?: { egress?: EgressContext }): Promise<BrokerResource[]>;
  searchResources(rootDir: string, query: string, options?: { limit?: number; egress?: EgressContext }): Promise<BrokerResource[]>;
  routeRequest(rootDir: string, request: string, options?: { limit?: number; egress?: EgressContext }): Promise<BrokerRouteResult>;
  openResource(rootDir: string, idOrPath: string, options?: { projection?: "metadata" | "instructions" | "full"; purpose?: string; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerOpenResult>;
  accessResource(rootDir: string, idOrPath: string, options?: { projection?: "metadata" | "instructions" | "full"; purpose?: string; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerOpenResult>;
  invokeTool(rootDir: string, idOrPath: string, args?: string[], options?: { dryRun?: boolean; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerInvokeResult>;
  proposeChange(rootDir: string, target: string, content: string, options?: { purpose?: string; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerProposeResult>;
  commitChange(rootDir: string, changeId: string, options?: { confirmed?: boolean; grantToken?: string }): Promise<BrokerCommitResult>;
  promoteResource(rootDir: string, idOrPath: string, toScope: string, options?: { purpose?: string; confirmed?: boolean; grantToken?: string; egress?: EgressContext }): Promise<BrokerPromoteResult>;
  listMarkers(rootDir: string, options?: { egress?: EgressContext }): Promise<BrokerMarker[]>;
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
}

interface RouteWorkspaceModule {
  decideWorkspaceRoute: (
    attempts: Array<{ root: { id: string; label?: string; type?: string; path: string }; result: BrokerRouteResult }>,
    ctx: { request: string; workspaceScope: unknown; unreachable?: Array<{ id: string; error: string }>; margin?: number },
  ) => Record<string, unknown> & { status: string };
}

let brokerPromise: Promise<BrokerModule> | null = null;
let rootsPromise: Promise<RootsModule> | null = null;
let routeWorkspacePromise: Promise<RouteWorkspaceModule> | null = null;

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

export async function brokerSearchResources(rootDir: string, query: string, limit = 10): Promise<BrokerResource[]> {
  const broker = await loadBroker();
  return broker.searchResources(rootDir, query, { limit, egress: await mcpEgress(broker, rootDir) });
}

export async function brokerRouteRequest(rootDir: string, request: string, limit?: number): Promise<BrokerRouteResult> {
  const broker = await loadBroker();
  const egress = await mcpEgress(broker, rootDir);
  return broker.routeRequest(rootDir, request, typeof limit === "number" ? { limit, egress } : { egress });
}

export async function brokerOpenResource(
  rootDir: string,
  idOrPath: string,
  projection: "metadata" | "instructions" | "full" = "full",
  purpose = "",
  confirmed = false,
  grantToken?: string,
): Promise<BrokerOpenResult> {
  const broker = await loadBroker();
  return broker.openResource(rootDir, idOrPath, { projection, purpose, confirmed, grantToken, egress: await mcpEgress(broker, rootDir) });
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
