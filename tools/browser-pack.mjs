#!/usr/bin/env node
// Browser pack: bundle one agent (its processes, competences, templates and tools) into a
// single Markdown file you can paste into ChatGPT or Claude on the web. This is the "no tool, just a
// browser" path made one-click: no GitHub navigation, no manual copying of each SKILL.md.
//
//   node tools/browser-pack.mjs --root exemples/assistant-devis-demo [--agent assistant-devis] [--out pack.md]
//
// In browser mode these are INSTRUCTIONS followed by the model, without the mechanical guarantees of
// the CLI/MCP. See docs/start/essayer-sans-installer.md.

import { writeFile } from "node:fs/promises";
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = typeof args.root === "string" ? args.root : null;
  if (!root) {
    console.error("Usage: node tools/browser-pack.mjs --root <dossier-exemple> [--agent <id>] [--out <fichier.md>]");
    process.exit(2);
  }

  const resources = await inventoryResources(root);
  let pack;
  try {
    pack = buildPack(resources, { agentId: typeof args.agent === "string" ? args.agent : undefined });
  } catch (error) {
    console.error(error instanceof Error ? error.message : `Aucun agent trouvé dans ${root}.`);
    process.exit(1);
  }
  const { markdown: out, agentId, count } = pack;

  if (typeof args.out === "string") {
    await writeFile(args.out, out, "utf8");
    console.error(`Pack écrit: ${args.out} (agent ${agentId}, ${count} ressources).`);
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
