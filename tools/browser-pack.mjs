#!/usr/bin/env node
// Browser pack: bundle one agent (its processes, competences, templates and tools) into a
// single Markdown file you can paste into ChatGPT or Claude on the web. This is the "no tool, just a
// browser" path made one-click: no GitHub navigation, no manual copying of each SKILL.md.
//
//   node tools/browser-pack.mjs --root exemples/assistant-devis-demo [--agent assistant-devis] [--out pack.md]
//   node tools/browser-pack.mjs --root . --process adopter-ce-dossier --annexe <modèle> --out <fichier>   (npm run porte:pack)
//
// In browser mode these are INSTRUCTIONS followed by the model, without the mechanical guarantees of
// the CLI/MCP. See docs/start/essayer-sans-installer.md.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { inventoryResources } from "./base-core.mjs";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

const TYPE_LABEL = { process: "Process", competence: "Compétence", template: "Template", tool: "Tool" };
const TYPE_ORDER = ["process", "competence", "template", "tool"];

const asPosix = (p) => p.split(path.sep).join("/");

// Pure: assemble a single-file pack for one agent from an inventory. Throws if the agent is absent.
/**
 * @param {any[]} resources
 * @param {{ agentId?: string }} [opts]
 */
export function buildPack(resources, { agentId } = {}) {
  const agents = resources.filter((r) => r.type === "agent");
  // Prefer the requested agent; else the first business agent (not the concierge); else whatever exists.
  const agent = agentId
    ? agents.find((a) => a.id === agentId)
    : agents.find((a) => a.id !== "concierge-base") || agents[0];
  if (agentId && !agent) throw new Error(`agent not found in this root: ${agentId}`);
  if (!agent) throw new Error("no agent found in this root");

  // The agent owns the resources under its own directory (.ai/agents/<name>/...).
  const agentDir = `${asPosix(path.dirname(agent.path))}/`;
  const owned = resources.filter((r) => r.type !== "agent" && `${asPosix(path.dirname(r.path))}/`.startsWith(agentDir));

  const sections = [
    `# Pack navigateur: ${agent.title || agent.id}`,
    "",
    "Collez tout ce document dans ChatGPT ou Claude (web), puis dites «Bonjour». L'assistant connaît alors son rôle, ses process et ses conventions.",
    "",
    "> Mode navigateur: ce sont des consignes suivies par le modèle, sans les garanties mécaniques de la CLI ou du MCP. Pour des garanties réelles, voir `docs/start/essayer-sans-installer.md` puis la CLI.",
    "",
    "---",
    "",
    `## Agent: ${agent.title || agent.id}`,
    "",
    (agent.body || "").trim(),
  ];

  for (const type of TYPE_ORDER) {
    for (const r of owned.filter((x) => x.type === type).sort((a, b) => a.path.localeCompare(b.path))) {
      sections.push("", "---", "", `## ${TYPE_LABEL[type]}: ${r.title || r.id}`, "", (r.body || "").trim());
    }
  }
  return { markdown: sections.join("\n") + "\n", agentId: agent.id, count: owned.length };
}

// Pure: assemble a single-file pack for ONE process and everything it declares in `requires`,
// followed transitively (a competence that requires the method pages brings them too), plus annexed
// files quoted verbatim. This is the entry a web chat reads from a URL: one file, in reading order,
// with nothing to maintain by hand, since every section is a source the repository already keeps.
/**
 * @param {any[]} resources
 * @param {{ processId: string, annexes?: { path: string, content: string }[], command?: string, linkBase?: string }} opts
 */
export function buildProcessPack(resources, { processId, annexes = [], command = "", linkBase = "" }) {
  const byId = new Map(resources.map((r) => [r.id, r]));
  const byPath = new Map(resources.map((r) => [asPosix(r.path), r]));
  const start = byId.get(processId);
  if (!start) throw new Error(`process not found in this root: ${processId}`);
  /** @type {any[]} */
  const ordered = [];
  const seen = new Set();
  const visit = (/** @type {any} */ resource) => {
    if (!resource || seen.has(resource.id)) return;
    seen.add(resource.id);
    ordered.push(resource);
    for (const need of Array.isArray(resource.requires) ? resource.requires : []) {
      const ref = typeof need === "string" ? need : need?.ref;
      if (typeof ref === "string") visit(byId.get(ref) || byPath.get(ref));
    }
  };
  visit(start);

  const sections = [
    `# ${start.title || start.id}: l'entrée de BASE pour un chat`,
    "",
    `<!-- Généré depuis les sources du dépôt${command ? ` par \`${command}\`` : ""}. Ne pas éditer à la main. -->`,
    "",
    `Ce fichier rassemble, dans l'ordre de lecture, ce qu'une IA doit lire pour suivre «${start.title || start.id}» depuis un chat, sans dossier ni terminal: le process, ce qu'il déclare, et ${annexes.length ? "les fichiers annexés" : "rien d'autre"}.`,
    "",
    "**Pour l'IA qui lit ce fichier**: suis le process ci-dessous, avec sa section «Dans un chat, sans dossier». Lis en entier chaque page qu'il déclare avant de juger. N'écris rien d'autre que ce que le process demande.",
    "",
    "> Mode chat: ce sont des consignes suivies par le modèle, sans les garanties mécaniques de la CLI ou du MCP.",
  ];
  // A relative link («../reference/glossaire.md») breaks once the pack is read from its own URL: make it
  // absolute against the repository, so a web chat can still follow it.
  const absolutise = (/** @type {string} */ body, /** @type {string} */ from) => linkBase
    ? body.replace(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g, (_m, /** @type {string} */ target) => {
      const [file, anchor] = target.split("#");
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(asPosix(from)), file));
      return `](${linkBase}${resolved}${anchor ? `#${anchor}` : ""})`;
    })
    : body;
  // Each source sits under its own `## Process: …` heading: its leading title repeats that heading and
  // goes, and its other headings move one level down, so the file reads as one outline. Fenced code
  // (an export format, a sample) is left as written.
  const nest = (/** @type {string} */ body) => {
    let fence = "";
    const lines = body.split("\n");
    if (/^# /.test(lines[0] || "")) lines.splice(0, lines[1] === "" ? 2 : 1);
    return lines.map((line) => {
      const open = line.match(/^(`{3,}|~{3,})/);
      if (open && (!fence || line.startsWith(fence))) { fence = fence ? "" : open[1]; return line; }
      // A heading attribute (`{#ancre}`) is site syntax: a chat would read it as literal text.
      return !fence && /^#{1,5} /.test(line) ? `#${line.replace(/\s*\{#[\w-]+\}\s*$/, "")}` : line;
    }).join("\n");
  };
  for (const r of ordered) {
    const label = r.type === "process" ? "Process" : r.type === "competence" ? "Compétence" : "Page";
    sections.push("", "---", "", `## ${label}: ${r.title || r.id}`, "", `Source: \`${asPosix(r.path)}\``, "", nest(absolutise((r.body || "").trim(), r.path)));
  }
  for (const a of annexes) {
    const fence = "`".repeat(Math.max(3, ...[...a.content.matchAll(/`+/g)].map((m) => m[0].length + 1)));
    const lang = path.extname(a.path).slice(1) || "text";
    sections.push("", "---", "", `## Annexe: \`${asPosix(a.path)}\``, "", `${fence}${lang}`, a.content.replace(/\n$/, ""), fence);
  }
  return { markdown: sections.join("\n") + "\n", count: ordered.length };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = typeof args.root === "string" ? args.root : null;
  if (!root) {
    console.error("Usage: node tools/browser-pack.mjs --root <dossier> [--agent <id> | --process <id> [--annexe <fichier,…>]] [--out <fichier.md>]");
    process.exit(2);
  }

  const resources = await inventoryResources(root);
  let out;
  let summary;
  try {
    if (typeof args.process === "string") {
      const annexPaths = typeof args.annexe === "string" ? args.annexe.split(",").filter(Boolean) : [];
      const annexes = await Promise.all(annexPaths.map(async (p) => ({ path: p, content: await readFile(path.join(root, p), "utf8") })));
      let linkBase = "";
      try {
        const url = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"))?.repository?.url;
        if (typeof url === "string") linkBase = `${url.replace(/\.git$/, "")}/blob/main/`;
      } catch { linkBase = ""; }
      const pack = buildProcessPack(resources, { processId: args.process, annexes, command: "npm run porte:pack", linkBase });
      out = pack.markdown;
      summary = `process ${args.process}, ${pack.count} ressources, ${annexes.length} annexe(s)`;
    } else {
      const pack = buildPack(resources, { agentId: typeof args.agent === "string" ? args.agent : undefined });
      out = pack.markdown;
      summary = `agent ${pack.agentId}, ${pack.count} ressources`;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : `Aucun agent trouvé dans ${root}.`);
    process.exit(1);
  }

  if (typeof args.out === "string") {
    await writeFile(args.out, out, "utf8");
    console.error(`Pack écrit: ${args.out} (${summary}).`);
  } else {
    process.stdout.write(out);
  }
}

// Run only when invoked directly (so `buildPack` can be imported + tested without side effects).
if (process.argv[1] && process.argv[1].endsWith("browser-pack.mjs")) {
  main().catch((error) => {
    console.error(`browser-pack a échoué: ${error?.stack ?? error}`);
    process.exit(1);
  });
}
