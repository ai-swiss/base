// tools/core/views.mjs — a VIEW: one entry door onto a subset of a root.
//
// A root holds everything an organisation knows. A team working in support has no use for the
// twenty agents of the other departments in its router, and a person opening the folder for one
// afternoon of invoicing wants the invoicing door. A view is that door: a generated folder whose
// entry point lists only the agents the view names, with an ENTRY AGENT whose card opens the
// router, so the tone and the instructions of that door are authored once, as an ordinary agent.
//
// A view is a LENS, never a boundary. It hides nothing: the files stay where they are, the policy
// does not change, and a reader who walks out of the view reads the same corpus. What it changes is
// what the router proposes first, and how a shortcut lands someone in the right place.
//
// Pure: resources and the declaration come in, files come out. The caller writes them.

import { renderRoutingIndex } from "./index-md.mjs";
import { buildRoutingRegistry } from "./routing.mjs";
import { renderClaudeMd, renderAgentsMd, renderCursorRule, renderBootstrapMd } from "./bootstrap.mjs";
import { TOOL_ENTRY_POINTS, DEFAULT_TOOL } from "./perimeter.mjs";
import { agentDirOf } from "./routing.mjs";
import { stringsFor } from "./lang/index.mjs";

/** The folder a view's files live in. */
export function viewDir(name) {
  return `.ai/views/${name}`;
}

/**
 * The files a view projects, as `{ path, content }`, paths root-relative.
 * @param {string} name
 * @param {{ entry?: string, agents?: string[], include?: string[] }} view
 * @param {{ resources: any[], tools?: string[], lang?: string }} context
 */
export function buildViewArtifacts(name, view, { resources, tools = [], lang } = { resources: [] }) {
  const s = stringsFor(lang);
  const wanted = new Set(view.agents ?? []);
  const inView = resources.filter((resource) => {
    const dir = agentDirOf(resource.path);
    if (!dir) return false;
    const agent = resources.find((r) => r.type === "agent" && agentDirOf(r.path) === dir);
    return agent ? wanted.has(agent.id) : false;
  });
  const entryAgent = resources.find((r) => r.type === "agent" && r.id === view.entry) ?? null;
  const dir = viewDir(name);
  const files = [];

  // The routing index, restricted to the view's agents, rendered by the SAME renderer the root uses
  // (one map format, not a second one). Its links are rewritten relative to the view folder, so a
  // tool confined to that folder still reaches the real files.
  const index = renderRoutingIndex(buildRoutingRegistry(inView), { lang });
  for (const [rel, content] of Object.entries(index)) {
    files.push({ path: `${dir}/${rel.replace(/^\.ai\//, "")}`, content: rewriteLinks(content, rel, dir) });
  }

  // The view's own context, inserted into the canonical entry document right after its provenance
  // banner: one router body for the whole framework, one paragraph that says where this door opens.
  const context = [
    s.viewHeading(name),
    "",
    entryAgent?.description ? entryAgent.description.trim() : s.viewSummary(wanted.size),
    "",
    s.viewWhereFilesLive(upTo(dir)),
    ...(view.include?.length
      ? ["", s.viewFoldersHeading, ...view.include.map((folder) => `- [${folder}](${upTo(dir)}${folder})`)]
      : []),
    "",
  ].join("\n");

  for (const tool of entryPointsFor(tools)) {
    files.push({ path: `${dir}/${tool.path}`, content: withViewContext(bodyFor(tool.path, inView, lang), context) });
  }
  return files;
}

/** The shell line that opens this view in a tool, one per declared tool. */
export function viewShortcuts(name, rootDir, tools = []) {
  const target = `${rootDir}/${viewDir(name)}`;
  return entryPointsFor(tools).map((tool) => ({
    tool: tool.id,
    line: tool.id === "claude-code"
      ? `alias ${name}='cd "${target}" && claude --add-dir "${rootDir}"'`
      : tool.id === "cursor"
        ? `alias ${name}='cursor "${target}"'`
        : `alias ${name}='cd "${target}"'`,
    note: tool.id === "claude-code"
      ? "Claude Code lit par défaut son dossier de lancement: `--add-dir` lui ouvre la racine, où vivent les fichiers."
      : "Vérifiez dans la documentation de votre outil comment lui ouvrir un dossier au-dessus de son dossier de lancement.",
  }));
}

function entryPointsFor(tools) {
  const asked = (Array.isArray(tools) ? tools : []).map((id) => TOOL_ENTRY_POINTS[id]).filter(Boolean);
  return asked.length ? asked : [TOOL_ENTRY_POINTS[DEFAULT_TOOL]];
}

function bodyFor(entryPath, inView, lang) {
  if (entryPath === "CLAUDE.md") return renderClaudeMd(lang);
  if (entryPath === ".cursor/rules/assistant.mdc") return renderCursorRule(lang);
  if (entryPath === "AGENTS.md") return renderAgentsMd(inView, lang);
  return renderBootstrapMd(lang);
}

/** Insert the view's context into a canonical entry document, just after its provenance banner. */
function withViewContext(document, context) {
  const lines = document.split("\n");
  const banner = lines.findIndex((line) => line.trim().startsWith("<!--"));
  const at = banner === -1 ? 1 : banner + 1;
  return [...lines.slice(0, at), "", context, ...lines.slice(at)].join("\n");
}

/** `.ai/views/<name>` → `../../../`, the prefix that reaches the root from inside the view. */
function upTo(dir) {
  return `${dir.split("/").map(() => "..").join("/")}/`;
}

// The index the view carries is rendered by the ROOT's renderer, so its links assume the root's
// layout. Two cases, and only two: the root index points at the per-agent indexes, which the view
// carries itself (those links already resolve); a per-agent index points at the SKILL.md files,
// which live at the root and must be reached from inside the view.
function rewriteLinks(content, rel, dir) {
  const agentIndex = rel.match(/^\.ai\/agents\/([^/]+)\/index\.md$/);
  if (!agentIndex) return content;
  const up = upTo(`${dir}/agents/${agentIndex[1]}`);
  return content.replace(/\]\((?!\.\.\/|https?:|#)([^)]+)\)/g, (_match, link) => `](${up}.ai/agents/${agentIndex[1]}/${link})`);
}
