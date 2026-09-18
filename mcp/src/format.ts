// mcp/src/format.ts — what the server SAYS: the shape of a tool payload and the human-readable text
// beside it. Pure functions, no I/O and no SDK types, extracted from index.ts so the wording lives in
// one place (the CLI keeps its own, tools/cli/format.mjs) and the server file stays composition.
//
// A message names the root it acted on whenever several are visible: a caller with a workspace open
// should never have to guess which BASE answered.

import type { AgentInfo } from "./types.js";

export function withScope(scope: Record<string, unknown> | undefined, payload: unknown): unknown {
  if (!scope) return payload;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return { scope, ...(payload as Record<string, unknown>) };
  }
  return { scope, value: payload };
}

export function withScopeText(scope: Record<string, unknown> | undefined, text: string): string {
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

export function formatAgentCatalog(agents: AgentInfo[]): string {
  const list = agents.map((a) => `- **${agentDisplayName(a)}** : ${a.description}`).join("\n");
  return `# Agents BASE disponibles\n\n${list}\n\nPour charger un agent, demandez-moi de charger l'agent de votre choix.`;
}

export function formatAgentNotFound(name: string, agents: AgentInfo[]): string {
  const available = agents.map(agentDisplayName).join(", ");
  return `Agent "${name}" non trouvé. Agents disponibles: ${available}`;
}

export function formatAmbiguousAgentName(name: string, agents: AgentInfo[]): string {
  return [
    `Plusieurs agents correspondent à "${name}".`,
    "Choisissez un nom qualifié:",
    ...agents.map((agent) => `- ${agentDisplayName(agent)}`),
  ].join("\n");
}

export function formatNoAgentsFound(rootDir: string): string {
  return [
    `Aucun agent trouvé dans ${rootDir}.`,
    "Vérifiez que le dossier contient .ai/agents/ avec des fichiers AGENT.md.",
  ].join(" ");
}

export function findAgentsByName(agents: AgentInfo[], name: string): AgentInfo[] {
  if (name.includes("/")) {
    const [rootId, agentName] = name.split("/", 2);
    return agents.filter((agent) => agent.rootId === rootId && agent.name === agentName);
  }
  return agents.filter((agent) => agent.name === name);
}

export function agentDisplayName(agent: AgentInfo): string {
  return agent.rootId ? `${agent.rootId}/${agent.name}` : agent.name;
}
