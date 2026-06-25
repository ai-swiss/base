#!/usr/bin/env node

/**
 * BASE MCP Server
 *
 * Exposes BASE agents to any AI platform via the Model Context Protocol.
 * Router primitives, one lightweight compatibility bootstrap (load_agent),
 * two transports (stdio, HTTP), zero business orchestration.
 *
 * The MCP delivers context; the platform does the thinking.
 *
 * Growth discipline (triggered, not speculative): before registering a new MCP tool, first
 * extract tool registration (tools-registry.ts) and transports (transports.ts); this file
 * then only composes. Behaviour is pinned by the existing Vitest suite.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import * as fs from "fs/promises";
import { realpathSync, type Dirent } from "node:fs";
import * as path from "path";
import express from "express";
import { fileURLToPath } from "node:url";
import { noAuth, resolveAuthProvider, authMiddleware, type AuthProvider } from "./auth.js";
import {
  brokerAccessResource,
  brokerCommitChange,
  brokerConfineToProject,
  brokerInventoryResources,
  brokerInvokeTool,
  brokerListMarkers,
  brokerOpenResource,
  brokerPromoteResource,
  brokerProposeChange,
  brokerContextScope,
  brokerResolveBaseContext,
  brokerResolveConfig,
  brokerRouteRequest,
  brokerDecideWorkspaceRoute,
  brokerSearchResources,
  type BrokerRouteResult,
  brokerAppendAbstention,
  brokerIsAbstention,
  brokerReportFriction,
} from "./base-core-adapter.js";
import { createLogger } from "./logger.js";
import { parseArgs, remoteExposureError, dnsRebindingGuard } from "./transport.js";
export { parseArgs, isLoopbackHost, remoteExposureError, crossOriginError } from "./transport.js";

function compareByCodePoint(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// Type contracts live in ./types.ts; re-export the ones consumers (and the test surface) import.
import type { AgentInfo, DataFile, ResourceInfo, Logger, ServerOptions, WorkspaceRoot } from "./types.js";
export type { AgentInfo, DataFile, ResourceInfo, ServerOptions } from "./types.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SERVER_NAME = "base-mcp";
const SERVER_VERSION = "1.0.0";
const MCP_ENDPOINT = "/mcp";

const AGENT_FILENAME = "AGENT.md";
const AGENT_RESOURCE_DIRS = ["skills", "templates", "tools"] as const;
const DATA_FILES_SECTION = "## Fichiers métier";

// Directories and files excluded from scanning
const SKIP_PREFIX_DOT = ".";
const SKIP_PREFIX_UNDERSCORE = "_";
const PROJECT_DISCOVERY_SKIP_DIRS = new Set([".git", ".temp", ".plans", "node_modules", "dist", "trace"]);

// ---------------------------------------------------------------------------
// Path Confinement - prevent path traversal attacks
// ---------------------------------------------------------------------------

export async function confineToProject(projectRoot: string, targetPath: string): Promise<string> {
  try {
    return await brokerConfineToProject(projectRoot, targetPath);
  } catch (error) {
    const message = String((error as Error).message ?? error);
    if (message.includes("symlink")) {
      throw new Error(`Symlink traversal blocked: "${targetPath}" links outside project root`);
    }
    if (message.includes("escapes BASE root")) {
      throw new Error(`Path traversal blocked: "${targetPath}" resolves outside project root`);
    }
    throw error;
  }
}

// Logging (createLogger, LOG_LEVELS) lives in ./logger.ts. Module-level logger, overridden in main().
let log: Logger = createLogger("info");

// ---------------------------------------------------------------------------
// Agent Discovery
// ---------------------------------------------------------------------------

export async function discoverAgents(rootDir: string): Promise<AgentInfo[]> {
  const agents: AgentInfo[] = [];
  const startTime = Date.now();
  const root = path.resolve(rootDir);

  for (const projectRoot of await discoverProjectRoots(root)) {
    await scanAgentsIn(path.join(projectRoot, ".ai", "agents"), projectRoot, agents);
  }

  log.info("Agent discovery complete", {
    count: agents.length,
    agents: agents.map((a) => a.name),
    durationMs: Date.now() - startTime,
  });

  return agents;
}

async function discoverWorkspaceAgents(roots: WorkspaceRoot[]): Promise<AgentInfo[]> {
  const all: AgentInfo[] = [];
  for (const root of roots) {
    const agents: AgentInfo[] = [];
    await scanAgentsIn(path.join(root.path, ".ai", "agents"), root.path, agents);
    for (const agent of agents) all.push({ ...agent, rootId: root.id, rootLabel: root.label ?? root.id });
  }
  return all.sort((a, b) => compareByCodePoint(agentDisplayName(a), agentDisplayName(b)));
}

async function discoverServerRoots(rootDir: string): Promise<WorkspaceRoot[]> {
  const roots = await discoverProjectRoots(path.resolve(rootDir));
  return roots.map((projectRoot) => ({
    id: rootIdForProjectRoot(rootDir, projectRoot),
    label: path.basename(projectRoot),
    type: "project",
    path: projectRoot,
  }));
}

async function discoverProjectRoots(rootDir: string): Promise<string[]> {
  const roots: string[] = [];

  async function visit(dir: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    entries.sort((a, b) => compareByCodePoint(a.name, b.name));
    if (entries.some((entry) => entry.isDirectory() && entry.name === ".ai")) {
      try {
        await fs.access(path.join(dir, ".ai", "agents"));
        roots.push(dir);
      } catch {
        // `.ai` without agents is not a loadable BASE project root.
      }
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === ".ai") continue;
      if (shouldSkipProjectDiscoveryDir(entry.name)) continue;
      await visit(path.join(dir, entry.name));
    }
  }

  await visit(rootDir);
  return roots;
}

function shouldSkipProjectDiscoveryDir(name: string): boolean {
  return PROJECT_DISCOVERY_SKIP_DIRS.has(name) || name.startsWith(SKIP_PREFIX_DOT);
}

async function scanAgentsIn(
  agentsDir: string,
  projectRoot: string,
  agents: AgentInfo[],
): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(agentsDir, { withFileTypes: true });
  } catch {
    return; // Directory doesn't exist
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(SKIP_PREFIX_UNDERSCORE)) continue;

    const agentDir = path.join(agentsDir, entry.name);
    const agentMdPath = path.join(agentDir, AGENT_FILENAME);

    try {
      const content = await fs.readFile(agentMdPath, "utf-8");
      agents.push(parseAgent(entry.name, agentDir, projectRoot, content));
      log.debug("Agent found", { name: entry.name, dir: agentDir });
    } catch {
      log.debug("Skipping directory (no AGENT.md)", { dir: agentDir });
    }
  }
}

// ---------------------------------------------------------------------------
// Agent Parsing
// ---------------------------------------------------------------------------

function parseAgent(
  name: string,
  agentDir: string,
  projectRoot: string,
  content: string,
): AgentInfo {
  return {
    name,
    description: extractDescription(content),
    agentDir,
    projectRoot,
    dataFiles: extractDataFiles(content),
  };
}

export function extractDescription(content: string): string {
  const lines = content.split("\n");
  let pastTitle = false;

  for (const line of lines) {
    if (line.startsWith("# ")) {
      pastTitle = true;
      continue;
    }
    if (!pastTitle || line.trim().length === 0) continue;

    const clean = line.replace(/\*\*/g, "").trim();

    // "Quand ce fichier est chargé, agis comme [role]." → extract just the role
    const roleMatch = clean.match(/agis comme (.+?)\.?\s*$/i);
    if (roleMatch) {
      const role = roleMatch[1].trim();
      return role.charAt(0).toUpperCase() + role.slice(1);
    }

    return clean;
  }

  return "";
}

export function extractDataFiles(content: string): DataFile[] {
  const sectionStart = content.indexOf(DATA_FILES_SECTION);
  if (sectionStart === -1) return [];

  // Find the table body: skip header row and separator row
  const afterSection = content.slice(sectionStart);
  const tableMatch = afterSection.match(/\|[-\s|]+\n([\s\S]*?)(?=\n## |\n---|\n$)/);
  if (!tableMatch) return [];

  const files: DataFile[] = [];
  for (const row of tableMatch[1].trim().split("\n")) {
    if (!row.includes("|")) continue;
    const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    files.push({
      path: cells[0].replace(/`/g, ""),
      description: cells[1],
    });
  }

  return files;
}

// ---------------------------------------------------------------------------
// Bundling - assemble agent intelligence into a single document
// ---------------------------------------------------------------------------

export async function bundleAgentBootstrap(agent: AgentInfo): Promise<string> {
  const agentMd = await fs.readFile(path.join(agent.agentDir, AGENT_FILENAME), "utf-8");
  const parts = [`# Agent: ${agent.name}\n\n${agentMd}`];
  const resources = await listAgentResourceCatalog(agent);

  if (resources.length > 0) {
    parts.push(
      [
        "\n---\n# Ressources disponibles\n",
        "Ces ressources ne sont pas chargées automatiquement. Utilisez `discover_resources`, puis `open_resource` ou `access_resource` pour ouvrir uniquement ce qui est utile.",
        "",
        ...resources.map((resource) => `- \`${resource.id}\` (${resource.type}) : ${resource.title} -> \`${resource.path}\``),
      ].join("\n"),
    );
  }

  parts.push(formatDataListing(agent));
  return parts.join("\n");
}

export function formatDataListing(agent: AgentInfo): string {
  if (agent.dataFiles.length === 0) return "";

  const lines = [
    "\n---\n# Données métier disponibles\n",
    "Ces données ne sont pas chargées automatiquement. Utilisez `access_resource` avec un chemin précis quand elles sont nécessaires:\n",
    ...agent.dataFiles.map((df) => `- \`${df.path}\` : ${df.description}`),
  ];
  return lines.join("\n");
}

async function listAgentResourceCatalog(agent: AgentInfo): Promise<ResourceInfo[]> {
  const allResources = await inventoryResources(agent.projectRoot);
  const agentRoot = path.relative(agent.projectRoot, agent.agentDir).split(path.sep).join("/");
  return allResources
    .filter((resource) => AGENT_RESOURCE_DIRS.some((dir) => resource.path.split(path.sep).join("/").startsWith(`${agentRoot}/${dir}/`)))
    .sort((a, b) => compareByCodePoint(a.path, b.path));
}

// An agent is visible to the connecting client only if its AGENT.md survives the egress-filtered
// inventory (inventoryResources here threads mcpEgress). A confidential agent, or one in an
// egress: local-only root, is therefore hidden from a remote model: it is neither listed by
// list_agents nor loadable via load_agent, so its AGENT.md body and data listing never reach the
// client. This mirrors discover/open/route, which all gate on the same egress-filtered inventory.
async function egressVisibleAgents(agents: AgentInfo[]): Promise<AgentInfo[]> {
  const visibleByRoot = new Map<string, Set<string>>();
  const out: AgentInfo[] = [];
  for (const agent of agents) {
    let visible = visibleByRoot.get(agent.projectRoot);
    if (!visible) {
      const inv = await inventoryResources(agent.projectRoot);
      visible = new Set(inv.map((r) => r.path.split(path.sep).join("/")));
      visibleByRoot.set(agent.projectRoot, visible);
    }
    const agentMdRel = path.relative(agent.projectRoot, path.join(agent.agentDir, AGENT_FILENAME)).split(path.sep).join("/");
    if (visible.has(agentMdRel)) out.push(agent);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Resource Router - public MVP primitives
// ---------------------------------------------------------------------------

export async function inventoryResources(rootDir: string): Promise<ResourceInfo[]> {
  return brokerInventoryResources(rootDir) as Promise<ResourceInfo[]>;
}

export async function searchResources(rootDir: string, query: string, limit = 10): Promise<ResourceInfo[]> {
  return brokerSearchResources(rootDir, query, limit) as Promise<ResourceInfo[]>;
}

export async function routeRequest(rootDir: string, request: string, limit?: number) {
  return brokerRouteRequest(rootDir, request, limit);
}

export async function openResource(
  rootDir: string,
  idOrPath: string,
  projection: "metadata" | "instructions" | "full" = "full",
  purpose = "",
  confirmed = false,
  grantToken?: string,
): Promise<{ resource: ResourceInfo; content: string }> {
  const result = await brokerOpenResource(rootDir, idOrPath, projection, purpose, confirmed, grantToken);
  if (!result.resource) throw new Error(`Resource not found: ${idOrPath}`);
  return { resource: result.resource as ResourceInfo, content: result.content };
}

export async function accessResource(
  rootDir: string,
  idOrPath: string,
  projection: "metadata" | "instructions" | "full" = "full",
  purpose = "",
  confirmed = false,
  grantToken?: string,
): Promise<{ resource?: ResourceInfo; content: string }> {
  const result = await brokerAccessResource(rootDir, idOrPath, projection, purpose, confirmed, grantToken);
  return { resource: result.resource as ResourceInfo | undefined, content: result.content };
}

export async function invokeTool(
  rootDir: string,
  idOrPath: string,
  args: string[] = [],
  dryRun = true,
  confirmed = false,
  grantToken?: string,
): Promise<{ dry_run: boolean; command: string[]; stdout?: string; stderr?: string }> {
  return brokerInvokeTool(rootDir, idOrPath, args, dryRun, confirmed, grantToken);
}

// ---------------------------------------------------------------------------
// MCP Server Factory
// ---------------------------------------------------------------------------

// Strip the absolute project root from a client-facing error message so the server never discloses
// the host's filesystem layout. Broker errors embed resolved absolute paths; relativize them.
function clientError(err: unknown, rootDir: string): string {
  const message = String((err as Error)?.message ?? err);
  return message.split(rootDir).join(".");
}

export function createServer(rootDir: string, options: ServerOptions = {}): McpServer {
  const { readOnly = false, requireExecuteConfirmation = false, scope, workspaceScope, workspaceRoots } = options;
  const agentScope = workspaceRoots?.length ? workspaceScope : scope;
  const routeScope = workspaceRoots?.length ? workspaceScope : scope;
  const json = (payload: unknown, payloadScope: Record<string, unknown> | undefined = scope) => JSON.stringify(withScope(payloadScope, payload), null, 2);
  const rootChoices = async () => workspaceRoots?.length ? workspaceRoots : await discoverServerRoots(rootDir);
  const effectiveRoot = async (rootId?: string) => {
    const roots = await rootChoices();
    if (rootId) return selectServerRoot(roots, rootId).path;
    if (roots.length === 1) return roots[0].path;
    if (roots.length > 1) {
      throw new Error(`root_id is required when several BASE roots are visible. Available roots: ${roots.map((root) => root.id).join(", ")}`);
    }
    return rootDir;
  };
  // Report the scope of the root actually used (not always the default), so a client never has to
  // read server logs to know which root answered. Falls back to the default scope outside a workspace.
  const scopeForRoot = (rootPath: string): Record<string, unknown> | undefined => {
    if (!workspaceRoots?.length || !workspaceScope) return scope;
    const match = workspaceRoots.find((root) => root.path === rootPath);
    return match ? { mode: "workspace", workspace: workspaceScope, root: rootScope(match) } : scope;
  };
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  server.tool(
    "load_agent",
    [
      "Load the lightweight bootstrap for a BASE business AI agent.",
      "Call this when the user asks to load, activate, or use one of their agents.",
      "Without a name: lists available agents.",
      "With a name: returns AGENT.md, a resource catalog, and data references.",
      "It does not load all skills, templates, tools, or business data; use discover_resources, open_resource, access_resource and invoke_tool for targeted access.",
    ].join(" "),
    {
      name: z.string().optional().describe("Agent name. Omit to list available agents."),
      include_data: z
        .boolean()
        .optional()
        .describe("Deprecated compatibility flag. Data is not bulk-loaded; use access_resource for targeted access."),
    },
    async ({ name, include_data }) => {
      const agents = await egressVisibleAgents(await discoverWorkspaceAgents(await rootChoices()));

      // No name → list available agents
      if (!name) {
        if (agents.length === 0) {
          return {
            content: [{ type: "text" as const, text: withScopeText(agentScope, formatNoAgentsFound(rootDir)) }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text" as const, text: withScopeText(agentScope, formatAgentCatalog(agents)) }],
        };
      }

      // Find the requested agent
      const matches = findAgentsByName(agents, name);
      const agent = matches.length === 1 ? matches[0] : null;
      if (matches.length > 1) {
        return {
          content: [{ type: "text" as const, text: withScopeText(agentScope, formatAmbiguousAgentName(name, matches)) }],
          isError: true,
        };
      }
      if (!agent) {
        return {
          content: [{ type: "text" as const, text: withScopeText(agentScope, formatAgentNotFound(name, agents)) }],
          isError: true,
        };
      }

      // Load only bootstrap and catalogs. Detailed access goes through router primitives.
      log.info("Loading agent", { agent: name, includeData: !!include_data });
      let result = await bundleAgentBootstrap(agent);

      if (include_data) {
        result += [
          "",
          "---",
          "# Note de compatibilité",
          "",
          "`include_data` n'entraîne plus de chargement global des données métier. Ouvrez seulement les données nécessaires avec `access_resource`.",
        ].join("\n");
      }

      log.info("Agent loaded", { agent: name, totalChars: result.length });

      return { content: [{ type: "text" as const, text: withScopeText(agentScope, result) }] };
    },
  );

  server.tool(
    "discover_resources",
    "Search local BASE resources with explainable ranking over metadata, titles, descriptions and full text.",
    {
      query: z.string().describe("Search query."),
      limit: z.number().int().positive().optional().describe("Maximum number of results. Default: 10."),
      root_id: z.string().optional().describe("Optional root id from load_agent or route_request when several roots are visible."),
    },
    async ({ query, limit, root_id }) => {
      let selectedRoot = rootDir;
      try {
        selectedRoot = await effectiveRoot(root_id);
        const results = await searchResources(selectedRoot, query, limit ?? 10);
        return { content: [{ type: "text" as const, text: json({ results }, scopeForRoot(selectedRoot)) }] };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: clientError(err, selectedRoot) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "route_request",
    [
      "Route a user request to the right BASE agent and process, or honestly abstain.",
      "Returns a status (routed | ambiguous | needs_clarification | out_of_scope), the chosen agent/process,",
      "ranked candidates with explainable reasons, and a clarifying question when unsure.",
      "Choose only from the returned candidates; never invent a route or load every instruction.",
    ].join(" "),
    {
      request: z.string().describe("The user request, in natural language."),
      limit: z.number().int().positive().optional().describe("Max candidates to return. Default: 5."),
      root_id: z.string().optional().describe("Optional root id. Omit to route across available roots when several are visible."),
    },
    async ({ request, limit, root_id }) => {
      // Every abstention is journalled by this ADAPTER (.ai/feedback/abstentions.jsonl) — an
      // unserved request is a process waiting to exist. The broker stays side-effect free.
      const journal = async (root: string, result: { status: string; next_question?: string | null }) => {
        if (await brokerIsAbstention(result.status)) {
          await brokerAppendAbstention(root, { query: request, verdict: result.status, suggestion: result.next_question ?? null }).catch(() => {});
        }
      };
      if (root_id) {
        const selected = selectServerRoot(await rootChoices(), root_id);
        const result = await routeRequest(selected.path, request, limit);
        await journal(selected.path, result);
        return { content: [{ type: "text" as const, text: json({ root: rootScope(selected), ...result }, scope) }] };
      }
      const roots = await rootChoices();
      const result = roots.length > 1
        ? await routeAcrossWorkspaceRoots(roots, request, limit)
        : roots.length === 1
          ? { root: rootScope(roots[0]), ...await routeRequest(roots[0].path, request, limit) }
          : await routeRequest(rootDir, request, limit);
      if (roots.length <= 1) await journal(roots[0]?.path ?? rootDir, result as { status: string; next_question?: string | null });
      return { content: [{ type: "text" as const, text: json(result, roots.length > 1 ? routeScope ?? scope : scope) }] };
    },
  );



  server.tool(
    "open_resource",
    "Open a BASE resource by id or relative path, confined to the local project.",
    {
      id_or_path: z.string().describe("Resource id or relative path."),
      projection: z.enum(["metadata", "instructions", "full"]).optional().describe("Projection to return. Default: full."),
      purpose: z.string().optional().describe("Why this resource is needed. Used by policy adapters."),
      confirmed: z.boolean().optional().describe("Explicit confirmation for sensitive reads."),
      grant_token: z.string().optional().describe("Optional grant token for strict policy adapters."),
      root_id: z.string().optional().describe("Optional root id from load_agent or route_request when several roots are visible."),
    },
    async ({ id_or_path, projection, purpose, confirmed, grant_token, root_id }) => {
      let selectedRoot = rootDir;
      try {
        selectedRoot = await effectiveRoot(root_id);
        const result = await openResource(selectedRoot, id_or_path, projection ?? "full", purpose ?? "", confirmed ?? false, grant_token);
        return { content: [{ type: "text" as const, text: json(result, scopeForRoot(selectedRoot)) }] };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: clientError(err, selectedRoot) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "access_resource",
    "Read a local file by relative path with BASE path confinement.",
    {
      path: z.string().describe("Resource id, resource path, or relative path inside the BASE project."),
      purpose: z.string().optional().describe("Why this resource is needed. Logged or enforced by stricter adapters."),
      confirmed: z.boolean().optional().describe("Explicit confirmation for sensitive reads."),
      grant_token: z.string().optional().describe("Optional grant token for strict policy adapters."),
      projection: z.enum(["metadata", "instructions", "full"]).optional().describe("Projection to return for BASE resources. Default: full."),
      root_id: z.string().optional().describe("Optional root id from load_agent or route_request when several roots are visible."),
    },
    async ({ path: requestedPath, purpose, confirmed, grant_token, projection, root_id }) => {
      let selectedRoot = rootDir;
      try {
        selectedRoot = await effectiveRoot(root_id);
        const result = await accessResource(selectedRoot, requestedPath, projection ?? "full", purpose ?? "", confirmed ?? false, grant_token);
        const payload = result.resource ? { ...result, purpose: purpose ?? null } : result.content;
        const selectedScope = scopeForRoot(selectedRoot);
        return { content: [{ type: "text" as const, text: typeof payload === "string" ? withScopeText(selectedScope, payload) : json(payload, selectedScope) }] };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: clientError(err, selectedRoot) }],
          isError: true,
        };
      }
    },
  );

  // Write & execute tools. In read-only mode (recommended for shared/remote deployments) they are
  // not registered at all, so the surface is provably read-only — there is no tool to reach a write.
  if (!readOnly) {
    server.tool(
      "report_friction",
      [
        "Report a field friction about a process: what broke or drifted in real use. Appends a dated",
        "Markdown entry under .ai/feedback/ (creation-only: the journal is never modified). A reported",
        "friction is a pending process amendment — the cheapest gap detector there is.",
      ].join(" "),
      {
        process: z.string().describe("Path (or id) of the concerned process."),
        summary: z.string().describe("One line: what went wrong."),
        detail: z.string().optional().describe("The full story: step, expected, observed."),
        via: z.enum(["user", "assistant"]).optional().describe("Who reports. Default: user."),
        root_id: z.string().optional().describe("Optional root id when several roots are visible."),
      },
      async ({ process, summary, detail, via, root_id }) => {
        let selectedRoot = rootDir;
        try {
          selectedRoot = await effectiveRoot(root_id);
          const result = await brokerReportFriction(selectedRoot, { process, summary, detail, via });
          return { content: [{ type: "text" as const, text: json(result, scopeForRoot(selectedRoot)) }] };
        } catch (err) {
          return {
            content: [{ type: "text" as const, text: clientError(err, selectedRoot) }],
            isError: true,
          };
        }
      },
    );

    server.tool(
      "invoke_tool",
      "Invoke a local tool script. Dry-run is default; execution requires explicit confirmation.",
      {
        id_or_path: z.string().describe("Tool id or relative path."),
        args: z.array(z.string()).optional().describe("Command arguments."),
        dry_run: z.boolean().optional().describe("Return the command without executing it. Default: true."),
        confirmed: z.boolean().optional().describe("Explicit confirmation for non-dry-run execution."),
        grant_token: z.string().optional().describe("Optional grant token for strict policy adapters."),
        root_id: z.string().optional().describe("Optional root id from load_agent or route_request when several roots are visible."),
      },
      async ({ id_or_path, args, dry_run, confirmed, grant_token, root_id }) => {
        const isDryRun = dry_run ?? true;
        // When the surface is reachable remotely, never honor a tool's own
        // `requires_confirmation: false` opt-out: require an explicit confirmed=true to execute.
        if (requireExecuteConfirmation && !isDryRun && !confirmed) {
          return {
            content: [
              {
                type: "text" as const,
                text:
                  "Execution over this transport requires confirmed: true. A tool's own " +
                  "requires_confirmation: false opt-out is not honored remotely. Re-run with " +
                  "confirmed: true to execute, or dry_run: true to preview the command.",
              },
            ],
            isError: true,
          };
        }
        let selectedRoot = rootDir;
        try {
          selectedRoot = await effectiveRoot(root_id);
          const result = await invokeTool(selectedRoot, id_or_path, args ?? [], isDryRun, confirmed ?? false, grant_token);
          return { content: [{ type: "text" as const, text: json(result, scopeForRoot(selectedRoot)) }] };
        } catch (err) {
          return {
            content: [{ type: "text" as const, text: clientError(err, selectedRoot) }],
            isError: true,
          };
        }
      },
    );

    server.tool(
      "propose_change",
      [
        "Prepare a mediated write to a local file, confined to the project. Writes NOTHING:",
        "returns a change_id, a readable diff, and the access decision.",
        "Call commit_change to actually write it after the human has seen the diff.",
      ].join(" "),
      {
        target: z.string().describe("Relative path of the file to create or modify."),
        content: z.string().describe("Full proposed content of the file."),
        purpose: z.string().optional().describe("Why this change is proposed. Logged in the trace."),
        confirmed: z.boolean().optional().describe("Explicit confirmation to stage sensitive/restricted proposed content."),
        grant_token: z.string().optional().describe("Optional grant token for strict policy adapters."),
        root_id: z.string().optional().describe("Optional root id from load_agent or route_request when several roots are visible."),
      },
      async ({ target, content, purpose, confirmed, grant_token, root_id }) => {
        let selectedRoot = rootDir;
        try {
          selectedRoot = await effectiveRoot(root_id);
          const result = await brokerProposeChange(selectedRoot, target, content, purpose ?? "", confirmed ?? false, grant_token);
          return { content: [{ type: "text" as const, text: json(result, scopeForRoot(selectedRoot)) }] };
        } catch (err) {
          return {
            content: [{ type: "text" as const, text: clientError(err, selectedRoot) }],
            isError: true,
          };
        }
      },
    );

    server.tool(
      "commit_change",
      [
        "Apply a previously proposed change by its change_id. Confined to the project, verifies the",
        "written state, and records a trace. Sensitive/restricted targets and the default policy",
        "require confirmed=true; a resource can opt out via requires_confirmation: false.",
      ].join(" "),
      {
        change_id: z.string().describe("The change_id returned by propose_change."),
        confirmed: z.boolean().optional().describe("Explicit human confirmation. Required unless the target opted out."),
        grant_token: z.string().optional().describe("Optional grant token for strict policy adapters."),
        root_id: z.string().optional().describe("Optional root id from load_agent or route_request when several roots are visible."),
      },
      async ({ change_id, confirmed, grant_token, root_id }) => {
        let selectedRoot = rootDir;
        try {
          selectedRoot = await effectiveRoot(root_id);
          const result = await brokerCommitChange(selectedRoot, change_id, confirmed ?? false, grant_token);
          return { content: [{ type: "text" as const, text: json(result, scopeForRoot(selectedRoot)) }] };
        } catch (err) {
          return {
            content: [{ type: "text" as const, text: clientError(err, selectedRoot) }],
            isError: true,
          };
        }
      },
    );

    server.tool(
      "promote_resource",
      [
        "Prepare the promotion of a resource to a wider scope (e.g. personal -> team).",
        "Updates scope/promoted_from/promoted_at via the mediated write path: returns a change_id",
        "and a diff. Nothing is written until commit_change is called.",
      ].join(" "),
      {
        id_or_path: z.string().describe("Resource id or relative path to promote."),
        to_scope: z.enum(["personal", "team", "org", "public", "enterprise-extension"]).describe("Target scope."),
        purpose: z.string().optional().describe("Why this resource is being promoted."),
        confirmed: z.boolean().optional().describe("Explicit confirmation to stage sensitive/restricted promotion content."),
        grant_token: z.string().optional().describe("Optional grant token for strict policy adapters."),
        root_id: z.string().optional().describe("Optional root id from load_agent or route_request when several roots are visible."),
      },
      async ({ id_or_path, to_scope, purpose, confirmed, grant_token, root_id }) => {
        let selectedRoot = rootDir;
        try {
          selectedRoot = await effectiveRoot(root_id);
          const result = await brokerPromoteResource(selectedRoot, id_or_path, to_scope, purpose ?? "", confirmed ?? false, grant_token);
          return { content: [{ type: "text" as const, text: json(result, scopeForRoot(selectedRoot)) }] };
        } catch (err) {
          return {
            content: [{ type: "text" as const, text: clientError(err, selectedRoot) }],
            isError: true,
          };
        }
      },
    );
  }

  server.tool(
    "list_markers",
    "List open work markers ([A VALIDER], [A COMPLETER], [ATTENTION], [DECISION]) in business documents, skipping framework files.",
    {
      root_id: z.string().optional().describe("Optional root id from load_agent or route_request when several roots are visible."),
    },
    async ({ root_id }) => {
      let selectedRoot = rootDir;
      try {
        selectedRoot = await effectiveRoot(root_id);
        const markers = await brokerListMarkers(selectedRoot);
        return { content: [{ type: "text" as const, text: json({ markers }, scopeForRoot(selectedRoot)) }] };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: clientError(err, selectedRoot) }],
          isError: true,
        };
      }
    },
  );

  return server;
}

// ---------------------------------------------------------------------------
// Response Formatting
// ---------------------------------------------------------------------------

function withScope(scope: Record<string, unknown> | undefined, payload: unknown): unknown {
  if (!scope) return payload;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return { scope, ...(payload as Record<string, unknown>) };
  }
  return { scope, value: payload };
}

function withScopeText(scope: Record<string, unknown> | undefined, text: string): string {
  if (!scope) return text;
  return `${formatScopeText(scope)}\n\n${text}`;
}

function formatScopeText(scope: Record<string, unknown>): string {
  const root = scope.root as Record<string, unknown> | undefined;
  const workspace = scope.workspace as Record<string, unknown> | undefined;
  if (workspace && root) return `Using BASE workspace: ${workspace.label ?? workspace.id}\nUsing BASE root: ${root.id ?? root.display_path ?? root.path}`;
  if (root) return `Using BASE root: ${root.display_path ?? root.path}`;
  return `Using BASE scope: ${scope.mode ?? "unknown"}`;
}

function formatAgentCatalog(agents: AgentInfo[]): string {
  const list = agents.map((a) => `- **${agentDisplayName(a)}** : ${a.description}`).join("\n");
  return `# Agents BASE disponibles\n\n${list}\n\nPour charger un agent, demandez-moi de charger l'agent de votre choix.`;
}

function formatAgentNotFound(name: string, agents: AgentInfo[]): string {
  const available = agents.map(agentDisplayName).join(", ");
  return `Agent "${name}" non trouvé. Agents disponibles: ${available}`;
}

function formatAmbiguousAgentName(name: string, agents: AgentInfo[]): string {
  return [
    `Plusieurs agents correspondent à "${name}".`,
    "Choisissez un nom qualifié:",
    ...agents.map((agent) => `- ${agentDisplayName(agent)}`),
  ].join("\n");
}

function formatNoAgentsFound(rootDir: string): string {
  return [
    `Aucun agent trouvé dans ${rootDir}.`,
    "Vérifiez que le dossier contient .ai/agents/ avec des fichiers AGENT.md.",
  ].join(" ");
}

function findAgentsByName(agents: AgentInfo[], name: string): AgentInfo[] {
  if (name.includes("/")) {
    const [rootId, agentName] = name.split("/", 2);
    return agents.filter((agent) => agent.rootId === rootId && agent.name === agentName);
  }
  return agents.filter((agent) => agent.name === name);
}

function agentDisplayName(agent: AgentInfo): string {
  return agent.rootId ? `${agent.rootId}/${agent.name}` : agent.name;
}

async function routeAcrossWorkspaceRoots(roots: WorkspaceRoot[], request: string, limit?: number) {
  const attempts: Array<{ root: WorkspaceRoot; result: BrokerRouteResult }> = [];
  const unreachable: Array<{ id: string; error: string }> = [];
  for (const root of roots) {
    try {
      const result = await routeRequest(root.path, request, limit);
      attempts.push({ root, result });
    } catch (error) {
      unreachable.push({ id: root.id, error: String((error as Error)?.message ?? error) });
    }
  }
  // Single source of truth for the cross-root DECISION (which root wins, or a genuine near-tie abstains):
  // the SAME function the CLI uses (tools/core/route-workspace.mjs, via the adapter), so MCP and CLI can
  // never diverge on the margin. Only the PRESENTATION is MCP's own (see toMcpWorkspaceShape).
  const decision = await brokerDecideWorkspaceRoute(attempts, {
    request,
    workspaceScope: { mode: "workspace", workspace: null },
    unreachable,
  });
  return toMcpWorkspaceShape(decision, attempts);
}

// Map the shared decision to the MCP tool's shape: the winning root is exposed at the top level (`root`),
// and the route_request handler is the single adder of the workspace `scope` — so lift the decision's
// `scope.root` to `root` (rebuilt via rootScope, so default label/type are preserved) and drop its `scope`.
function toMcpWorkspaceShape(
  decision: Record<string, unknown> & { status: string },
  attempts: Array<{ root: WorkspaceRoot; result: BrokerRouteResult }>,
) {
  const { scope, ...rest } = decision as Record<string, unknown> & { scope?: { root?: { id?: string } } };
  if (decision.status === "routed" && scope?.root) {
    const winner = attempts.find((attempt) => attempt.root.id === scope.root?.id);
    return { ...rest, root: rootScope(winner ? winner.root : (scope.root as WorkspaceRoot)) };
  }
  return rest;
}

function rootScope(root: WorkspaceRoot) {
  return {
    id: root.id,
    label: root.label ?? root.id,
    type: root.type ?? "project",
    path: root.path,
  };
}

function selectServerRoot(roots: WorkspaceRoot[], rootId: string): WorkspaceRoot {
  const selected = roots.find((root) => root.id === rootId);
  if (!selected) throw new Error(`Unknown root_id "${rootId}". Available roots: ${roots.map((root) => root.id).join(", ")}`);
  return selected;
}

function rootIdForProjectRoot(containerRoot: string, projectRoot: string): string {
  const relative = path.relative(path.resolve(containerRoot), projectRoot).split(path.sep).filter(Boolean);
  if (relative.length === 0) return "root";
  return relative.map(slugPart).join("-");
}

function slugPart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "root";
}

// CLI parsing (parseArgs) and remote-exposure policy (isLoopbackHost, remoteExposureError) live in
// ./transport.ts and are re-exported above; createHttpApp + main below wire them to the SDK.

// ---------------------------------------------------------------------------
// HTTP Transport
// ---------------------------------------------------------------------------

function createHttpApp(
  rootDir: string,
  authProvider: AuthProvider = noAuth,
  options: ServerOptions = {},
  bindHost: string = "127.0.0.1",
): express.Express {
  const app = express();
  // Bound the request body: the endpoint rebuilds a fresh server (full inventory) per POST, so an
  // unbounded body is a cheap amplification vector. 1 MB is ample for MCP JSON-RPC envelopes.
  app.use(express.json({ limit: "1mb" }));

  // Health check (unauthenticated — no project data)
  app.get("/", (_req, res) => {
    res.json({ name: SERVER_NAME, version: SERVER_VERSION, status: "running" });
  });

  // MCP endpoint - stateless: fresh server+transport per request, behind the AuthProvider
  // DNS-rebinding / cross-origin guard ahead of auth: a loopback-bound server is reachable from a
  // victim's browser, so a forged Host/Origin is refused before any work (dnsRebindingGuard, transport.ts).
  app.post(MCP_ENDPOINT, dnsRebindingGuard(bindHost), authMiddleware(authProvider), async (req, res) => {
    const startTime = Date.now();
    try {
      // HTTP is the network-reachable surface: never honor a tool's confirmation opt-out here.
      const requestServer = createServer(rootDir, { ...options, requireExecuteConfirmation: true });
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      await requestServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
      log.debug("HTTP request handled", { durationMs: Date.now() - startTime });
    } catch (err) {
      log.error("HTTP handler error", { error: String(err) });
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  // GET and DELETE return 405 in stateless mode (MCP spec)
  app.get(MCP_ENDPOINT, (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32601, message: "Method not allowed. Use POST." },
      id: null,
    });
  });

  app.delete(MCP_ENDPOINT, (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32601, message: "Method not allowed." },
      id: null,
    });
  });

  return app;
}

function selectedRootPath(context: Record<string, unknown>): string {
  if (context.mode === "root" && typeof context.rootPath === "string") return context.rootPath;
  const root = context.root;
  if (root && typeof root === "object" && "path" in root && typeof root.path === "string") return root.path;
  throw new Error("MCP server requires one selected BASE root. Use --root, or --workspace with --root-id/default root.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function main() {
  const config = parseArgs();
  log = createLogger(config.logLevel);
  const routingContext = await brokerResolveBaseContext({
    explicitRoot: config.root,
    explicitWorkspace: config.workspace,
    rootId: config.rootId,
    allowWorkspaceRouting: true,
  });
  const context = routingContext.mode === "workspace"
    ? await brokerResolveBaseContext({
      explicitRoot: config.root,
      explicitWorkspace: config.workspace,
      rootId: config.rootId,
    })
    : routingContext;
  const workspaceScope = routingContext.mode === "workspace" ? await brokerContextScope(routingContext) : undefined;
  const workspaceRoots = routingContext.mode === "workspace" && Array.isArray(routingContext.roots)
    ? routingContext.roots as WorkspaceRoot[]
    : undefined;
  const scope = await brokerContextScope(context);
  const rootDir = selectedRootPath(context);

  log.info("Starting BASE MCP server", {
    transport: config.transport,
    root: rootDir,
    scope,
    version: SERVER_VERSION,
  });

  // Relaxing a confidentiality control must leave a trace, not just a silent behaviour change.
  if (process.env.BASE_MCP_ALLOW_CONFIDENTIAL === "1") {
    log.warn("Egress control relaxed: BASE_MCP_ALLOW_CONFIDENTIAL=1 — confidential resources may be sent to the model (the client is assumed local).");
  }

  if (config.transport === "http") {
    const projectConfig = await brokerResolveConfig(rootDir);
    const { provider, configured } = resolveAuthProvider(projectConfig, process.env);
    const refusal = remoteExposureError(config.host, process.env, configured);
    if (refusal) {
      log.error(refusal, { host: config.host });
      process.exit(1);
    }
    if (configured) log.info("AuthProvider active for HTTP transport");
    if (config.readOnly) log.info("Read-only mode: write and execute tools are not exposed");
    const app = createHttpApp(rootDir, provider, { readOnly: config.readOnly, scope, workspaceScope, workspaceRoots }, config.host);

    const httpServer = app.listen(config.port, config.host, () => {
      log.info("HTTP server listening", {
        url: `http://${config.host}:${config.port}${MCP_ENDPOINT}`,
      });
    });

    // Graceful shutdown
    const shutdown = () => {
      log.info("Shutting down");
      httpServer.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } else {
    if (config.readOnly) log.info("Read-only mode: write and execute tools are not exposed");
    const server = createServer(rootDir, { readOnly: config.readOnly, scope, workspaceScope, workspaceRoots });
    const transport = new StdioServerTransport();
    await server.connect(transport);

    log.info("stdio transport connected");

    // Graceful shutdown
    const shutdown = async () => {
      log.info("Shutting down");
      await server.close();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }
}

function realpathOrOriginal(filePath: string): string {
  try {
    return realpathSync(filePath);
  } catch {
    return filePath;
  }
}

// Only start server when run directly (not when imported by tests). npm bin shims may invoke this
// file through a symlink, so compare real paths rather than raw argv/import paths.
const isMain = process.argv[1] ? realpathOrOriginal(process.argv[1]) === realpathOrOriginal(fileURLToPath(import.meta.url)) : false;
if (isMain) {
  main().catch((err) => {
    log.error("Fatal error", { error: String(err), stack: (err as Error).stack });
    process.exit(1);
  });
}
