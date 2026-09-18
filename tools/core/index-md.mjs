// tools/core/index-md.mjs — render the routing index tree from the deterministic registry. Pure,
// zero-dependency, no I/O: returns { <relPath>: <markdown> } for the caller to write atomically. The
// AGENT is the only reader of this tree (progressive disclosure: root → agent → process); the
// deterministic floor re-derives its candidates from the inventory on every request, and the optional
// embeddings read their own cache (embeddings.json). The index INVENTS NOTHING — it materialises on
// disk what `buildRoutingRegistry` already derives in memory (route_text, avoid_text). Deterministic
// (sorted upstream, no timestamp), so `base build routing-index` is idempotent and CI can gate freshness.
// A process its agent DENIES is omitted, so the agent reading this map cannot even see what the veto
// would refuse — the deny invariant extended to the index-read path (route-policy.mjs).
//
// The words come from ./lang/ (French by default, per-key fallback); the shape of the tree stays
// here. The two card labels are the SAME keys the router body uses, so the instruction to look for
// «Quand l'utiliser» and the heading that says it can never drift apart.

import { isAllowed } from "./route-policy.mjs";
import { stringsFor } from "./lang/index.mjs";

const ROOT_INDEX = ".ai/routing/index.md";

/**
 * @typedef {{ id: string, path: string, title?: string | null, route_text?: string, avoid_text?: string }} IndexCard
 * @param {{ agents: Array<{ agent_dir: string, agent: IndexCard | null, deny?: string[], processes: IndexCard[] }> }} registry
 * @param {{ rootDeny?: string[], fallback?: { id: string, path: string, title?: string | null } | null, lang?: string }} [policy]
 *   `rootDeny`: root-level deny (base.config); a denied agent is omitted entirely.
 *   `fallback`: the configured help target (routing.fallback), named at the foot of the root index.
 *   A reader who walks this map never calls the router, so the anti-dead-end door has to be ON the
 *   map; otherwise it exists only for callers of `route` / `route_request`.
 *   `lang`: which language table to render in; absent means French.
 * @returns {Record<string, string>} relPath → markdown content
 */
export function renderRoutingIndex(registry, { rootDeny = [], fallback = null, lang } = {}) {
  const s = stringsFor(lang);
  /** @type {Record<string, string>} */
  const files = {};
  const rootEntries = [];

  for (const entry of registry.agents) {
    if (entry.agent_dir === "(orphan)") continue; // orphan processes are not a navigable agent
    if (entry.agent && !isAllowed(entry.agent.id, rootDeny, "agent")) continue; // root policy denies this agent
    const title = entry.agent?.title || entry.agent?.id || lastSegment(entry.agent_dir);
    const id = entry.agent?.id || lastSegment(entry.agent_dir);
    const agentIndexPath = `${entry.agent_dir}/index.md`;

    rootEntries.push(`### ${title}: [\`${id}\`](${relativeLink(dirOf(ROOT_INDEX), agentIndexPath)})`);
    if (entry.agent?.route_text) rootEntries.push(`${s.cardUseWhen}: ${entry.agent.route_text}`);
    rootEntries.push("");

    files[agentIndexPath] = renderAgentIndex(entry, title, rootDeny, s);
  }

  files[ROOT_INDEX] = section([
    s.routingIndexBanner,
    "",
    s.indexRootTitle,
    "",
    s.indexRootInstruction,
    "",
    s.indexAgentsHeading,
    "",
    ...rootEntries,
    ...(fallback
      ? [
          s.indexFallbackTitle,
          "",
          s.indexFallbackSentence(
            `[\`${fallback.id}\`](${relativeLink(dirOf(ROOT_INDEX), fallback.path)})${fallback.title ? ` (${fallback.title})` : ""}`,
          ),
          "",
        ]
      : []),
  ]);

  return files;
}

function renderAgentIndex(entry, title, rootDeny = [], s = stringsFor()) {
  const lines = [s.routingIndexBanner, "", s.indexAgentTitle(title), ""];
  if (entry.agent?.route_text) lines.push(`${s.indexAgentWhenLabel}: ${entry.agent.route_text}`, "");
  lines.push(s.indexAgentInstruction, "", s.indexProcessesHeading, "");
  const deny = [...rootDeny, ...(entry.deny ?? [])];
  for (const p of entry.processes.filter((proc) => isAllowed(proc.id, deny, "process"))) {
    lines.push(`### ${p.title || p.id}: [\`${p.id}\`](${relativeLink(entry.agent_dir, p.path)})`);
    if (p.route_text) lines.push(`${s.cardUseWhen}: ${p.route_text}`);
    if (p.avoid_text) lines.push(`${s.cardAvoid}: ${p.avoid_text}`);
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

// The destination of a Markdown link, from a directory to a target path (both relative to the BASE
// root). Pure string arithmetic — no node:path, so this leaf stays dependency-free and
// platform-independent.
//
// A target OUTSIDE the root keeps its own ABSOLUTE path. The configured help target may live in the
// framework this root belongs to (FR-ROUTE-009), and counting `..` hops from a root-relative
// directory to an absolute path produces a destination that opens nothing (`../../Users/…`).
//
// A destination carrying a space or a parenthesis is wrapped in angle brackets, the Markdown form
// for exactly that case: an absolute framework path is a real directory on someone's disk, and a
// bare `(…/AI Swiss/…)` ends the link at the first space.
function relativeLink(fromDir, toPath) {
  return enclose(isAbsolutePath(toPath) ? toPath : hopsTo(fromDir, toPath));
}

function hopsTo(fromDir, toPath) {
  const from = fromDir.split("/").filter(Boolean);
  const to = toPath.split("/").filter(Boolean);
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) i++;
  return [...Array(from.length - i).fill(".."), ...to.slice(i)].join("/");
}

function isAbsolutePath(value) {
  return value.startsWith("/") || /^[a-zA-Z]:\//.test(value);
}

function enclose(destination) {
  return /[ ()]/.test(destination) ? `<${destination}>` : destination;
}
