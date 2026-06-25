// tools/core/index-md.mjs — render the routing index tree from the deterministic registry. Pure,
// zero-dependency, no I/O: returns { <relPath>: <markdown> } for the caller to write atomically. The
// AGENT reads this tree to route by progressive disclosure (root → agent → process); the deterministic
// floor and the optional embeddings read registry.json. The index INVENTS NOTHING — it materialises on
// disk what `buildRoutingRegistry` already derives in memory (route_text, avoid_text). Deterministic
// (sorted upstream, no timestamp), so `base build routing-index` is idempotent and CI can gate freshness.
// A process its agent DENIES is omitted, so the agent reading this map cannot even see what the veto
// would refuse — the deny invariant extended to the index-read path (route-policy.mjs).

import { isAllowed } from "./route-policy.mjs";

const BANNER = "<!-- Généré par `base build routing-index`. Ne pas éditer: régénéré depuis les AGENT.md/SKILL.md. -->";
const ROOT_INDEX = ".ai/routing/index.md";

/**
 * @typedef {{ id: string, path: string, title?: string | null, route_text?: string, avoid_text?: string }} IndexCard
 * @param {{ agents: Array<{ agent_dir: string, agent: IndexCard | null, deny?: string[], processes: IndexCard[] }> }} registry
 * @param {{ rootDeny?: string[] }} [policy] root-level deny (base.config); a denied agent is omitted entirely.
 * @returns {Record<string, string>} relPath → markdown content
 */
export function renderRoutingIndex(registry, { rootDeny = [] } = {}) {
  /** @type {Record<string, string>} */
  const files = {};
  const rootEntries = [];

  for (const entry of registry.agents) {
    if (entry.agent_dir === "(orphan)") continue; // orphan processes are not a navigable agent
    if (entry.agent && !isAllowed(entry.agent.id, rootDeny, "agent")) continue; // root policy denies this agent
    const title = entry.agent?.title || entry.agent?.id || lastSegment(entry.agent_dir);
    const id = entry.agent?.id || lastSegment(entry.agent_dir);
    const agentIndexPath = `${entry.agent_dir}/index.md`;

    rootEntries.push(`### ${title} — [\`${id}\`](${relativeLink(dirOf(ROOT_INDEX), agentIndexPath)})`);
    if (entry.agent?.route_text) rootEntries.push(`**Quand l'utiliser**: ${entry.agent.route_text}`);
    rootEntries.push("");

    files[agentIndexPath] = renderAgentIndex(entry, title, rootDeny);
  }

  files[ROOT_INDEX] = section([
    BANNER,
    "",
    "# Index de routage — agents disponibles",
    "",
    "Choisissez l'agent dont le «Quand l'utiliser» couvre la demande, puis ouvrez son index. En cas de doute, ne devinez pas: demandez.",
    "",
    "## Agents",
    "",
    ...rootEntries,
  ]);

  return files;
}

function renderAgentIndex(entry, title, rootDeny = []) {
  const lines = [BANNER, "", `# ${title} — process disponibles`, ""];
  if (entry.agent?.route_text) lines.push(`**Quand utiliser cet agent**: ${entry.agent.route_text}`, "");
  lines.push("Choisissez le process dont le «Quand l'utiliser» couvre la demande. Respectez «Éviter si».", "", "## Process", "");
  const deny = [...rootDeny, ...(entry.deny ?? [])];
  for (const p of entry.processes.filter((proc) => isAllowed(proc.id, deny, "process"))) {
    lines.push(`### ${p.title || p.id} — [\`${p.id}\`](${relativeLink(entry.agent_dir, p.path)})`);
    if (p.route_text) lines.push(`**Quand l'utiliser**: ${p.route_text}`);
    if (p.avoid_text) lines.push(`**Éviter si**: ${p.avoid_text}`);
    lines.push("");
  }
  return section(lines);
}

function section(lines) {
  return `${lines.join("\n").trimEnd()}\n`;
}

function dirOf(p) {
  const i = p.lastIndexOf("/");
  return i < 0 ? "" : p.slice(0, i);
}

function lastSegment(p) {
  return String(p).split("/").filter(Boolean).pop() ?? p;
}

// Relative POSIX link from a directory to a target path (both relative to the BASE root). Pure string
// arithmetic — no node:path, so this leaf stays dependency-free and platform-independent.
function relativeLink(fromDir, toPath) {
  const from = fromDir.split("/").filter(Boolean);
  const to = toPath.split("/").filter(Boolean);
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) i++;
  return [...Array(from.length - i).fill(".."), ...to.slice(i)].join("/");
}
