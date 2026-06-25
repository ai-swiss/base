// The bootstrap seam: from "a directory of files" to "a BASE that Studio can serve".
// Three functions, one strict order — detect (reads), buildInitPlan (decides, PURE),
// applyInitPlan (writes, creation-only). The CLI (`base init`) and Studio's Welcome screen are
// thin adapters over the same three calls: both show the EXACT files before anything is
// written, and the server never trusts client-provided content (it rebuilds the plan itself).

import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathExists } from "./confine.mjs";
import { renderAgentsMd, renderBootstrapMd, renderToolMatrix, renderClaudeMd, renderCursorRule } from "./bootstrap.mjs";
import { LAUNCHER_SOURCE } from "./launcher.mjs";
import { WORKSPACE_FILENAME } from "./roots.mjs";

const IGNORED = new Set([".git", "node_modules", ".base-docs"]);

// Files a bootstrap may want to create that could legitimately pre-exist in a loose folder.
// The detection checks them (it owns the IO); the pure plan simply omits the existing ones —
// creation-only is decided BEFORE anything is shown, never discovered at write time.
const PREEXISTABLE = [
  "base.config.json",
  ".ai/base.mjs",
  "CLAUDE.md",
  "AGENTS.md",
  "BASE_BOOTSTRAP.md",
  ".cursor/rules/assistant.mdc",
  ".ai/tools.md",
];

// The scaffolded agent's AGENT.md invites the user to say «importer mes procédures existantes»; this
// is the process that invitation routes to, shipped WITH the agent so the promise holds in the user's
// own project (not only in the framework's createur-agent). Self-contained, tight punctuation, every
// write through the gate. A pure constant: buildInitPlan stays I/O-free.
const IMPORTER_PROCESS = [
  "---",
  "schema_version: base.resource.v1",
  "id: importer-l-existant",
  "type: process",
  "title: Importer l'existant",
  "scope: personal",
  "status: active",
  "sensitivity: internal",
  "description: Convertir vos documents existants (notes, modes d'emploi, wikis, checklists) en ressources BASE (process, compétences, documents, templates), proposées via le gate, jamais écrites d'office.",
  "use_when: Quand l'utilisateur veut partir de ses documents existants: «importe mes procédures», «transforme ce mode d'emploi en process», «j'ai déjà tout dans un wiki».",
  "keywords: [import, migration, conversion, existant, onboarding]",
  "routing:",
  "  examples:",
  "    - Importer mes procédures existantes",
  "    - Transformer ce document en process",
  "    - J'ai déjà un wiki, comment le réutiliser?",
  "  avoid_when:",
  "    - Signaler un dysfonctionnement de l'assistant.",
  "user-invocable: true",
  "---",
  "",
  "# Importer l'existant",
  "",
  "Personne ne part d'une page blanche: le savoir-faire est déjà dans des documents. Ce process",
  "explore ce que vous pointez et PROPOSE des conversions en ressources BASE; chaque écriture passe",
  "par le gate (proposer puis valider), vous validez chaque diff.",
  "",
  "## Étapes",
  "",
  "1. **Explorer le matériau.** Lis chaque source indiquée. Classe chaque contenu: ce qui *se suit*",
  "   (étapes, checklist) devient un `process`; ce qui *s'apprend* (règles, conventions) une",
  "   `competence` ou un `document`; ce qui *se remplit* (trame, modèle) un `template`; ce qui *se",
  "   consulte avec une validité* (barème, tarifs) un `document` daté.",
  "2. **Proposer la carte d'import.** Présente un tableau source vers ressource cible (type, id,",
  "   chemin) et fais valider la découpe AVANT toute conversion.",
  "3. **Convertir, une ressource à la fois.** Rédige le fichier complet (frontmatter id, type, title,",
  "   description, un `use_when` digne du routeur) et propose-le. Ne committe jamais toi-même: l'humain",
  "   valide chaque diff.",
  "4. **Vérifier la santé après import.** Recommande `base doctor`: il relève les liens cassés par la",
  "   copie et les ressources orphelines.",
  "",
  "## Ce que tu ne fais jamais",
  "",
  "- Écrire sans diff validé. Proposer, toujours; committer, jamais.",
  "- Inventer du contenu absent des sources. Tu convertis, tu ne crées pas de savoir.",
  "- Importer en vrac. Chaque ressource est découpée, nommée et validée une à une.",
  "",
].join("\n");

/**
 * What is this directory, BASE-wise? The types are mutually exclusive, checked in this order:
 *   workspace  — contains base.workspace.json                    → { type, workspaceFile }
 *   root       — .ai/agents/<x>/AGENT.md exists                  → { type, agents }
 *   collection — ≥ 2 DIRECT subdirectories are themselves roots  → { type, roots }
 *   loose      — at least one .md (besides README) at depth ≤ 1  → { type, markdownCount, hasSkillNames }
 *   empty      — none of the above                               → { type }
 * Consumers switch on `type` exhaustively: a new type must break them at review, not at runtime.
 */
export async function detectPerimeter(dir) {
  const abs = path.resolve(dir);
  if (await pathExists(path.join(abs, WORKSPACE_FILENAME))) {
    return { type: "workspace", workspaceFile: WORKSPACE_FILENAME };
  }

  const agents = await listAgents(abs);
  if (agents.length > 0) return { type: "root", agents };

  const roots = [];
  for (const entry of await listDirs(abs)) {
    const subAgents = await listAgents(path.join(abs, entry));
    if (subAgents.length > 0) roots.push({ dir: entry, label: humanize(entry), agents: subAgents });
  }
  if (roots.length >= 2) return { type: "collection", roots };

  const existingArtifacts = [];
  for (const candidate of PREEXISTABLE) {
    if (await pathExists(path.join(abs, candidate))) existingArtifacts.push(candidate);
  }

  const markdown = await listMarkdown(abs);
  if (markdown.count > 0) {
    return { type: "loose", markdownCount: markdown.count, hasSkillNames: markdown.hasSkillNames, existingArtifacts };
  }
  return { type: "empty", existingArtifacts };
}

async function listDirs(abs) {
  const entries = await readdir(abs, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !IGNORED.has(e.name))
    .map((e) => e.name)
    .sort();
}

async function listAgents(abs) {
  const agentsDir = path.join(abs, ".ai", "agents");
  const ids = [];
  for (const name of await readdir(agentsDir).catch(() => [])) {
    if (await pathExists(path.join(agentsDir, name, "AGENT.md"))) ids.push(name);
  }
  return ids.sort();
}

// Markdown at depth ≤ 1 (the loose-notes case) — README excluded, hidden dirs skipped.
async function listMarkdown(abs) {
  let count = 0;
  let hasSkillNames = false;
  const scan = (entries) => {
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith(".md") || /^README\.md$/i.test(e.name)) continue;
      count += 1;
      if (e.name === "SKILL.md" || e.name === "AGENT.md") hasSkillNames = true;
    }
  };
  const top = await readdir(abs, { withFileTypes: true }).catch(() => []);
  scan(top);
  for (const e of top) {
    if (e.isDirectory() && !e.name.startsWith(".") && !IGNORED.has(e.name)) {
      scan(await readdir(path.join(abs, e.name), { withFileTypes: true }).catch(() => []));
    }
  }
  return { count, hasSkillNames };
}

function humanize(dirName) {
  return dirName.replace(/[-_]+/g, " ").replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "assistant";
}

/**
 * From a detection, the EXACT files to create — pure: `now` and `frameworkDir` are injected,
 * nothing is read. Every entry is creation-only; an existing target makes applyInitPlan refuse,
 * never overwrite. `frameworkDir` (where the framework lives) is recorded in base.config.json so
 * the project self-describes its engine; omit it and the field is simply left out.
 * → [{ path, content, reason }] — empty when there is nothing sensible to do (root, workspace).
 */
export function buildInitPlan(detection, { dirName, now, frameworkDir }) {
  if (detection.type === "workspace" || detection.type === "root") return [];

  if (detection.type === "collection") {
    const workspace = {
      schema_version: "base.workspace.v1",
      id: slugify(dirName),
      label: humanize(dirName),
      roots: detection.roots.map((r, i) => ({
        id: slugify(r.dir),
        label: r.label,
        path: r.dir,
        ...(i === 0 ? { default: true } : {}),
      })),
    };
    return [{
      path: WORKSPACE_FILENAME,
      content: `${JSON.stringify(workspace, null, 2)}\n`,
      reason: `${detection.roots.length} BASE détectés dans ce dossier — ce fichier les réunit en workspace.`,
    }];
  }

  if (detection.type === "loose" || detection.type === "empty") {
    // The agent exists as DATA first: the same fields render the AGENT.md markdown AND the
    // AGENTS.md catalogue entry — never parse back what was just generated.
    const slug = slugify(dirName);
    const agentFields = {
      id: slug,
      title: humanize(dirName),
      description: `Assistant de travail pour ${humanize(dirName)} — à préciser au fil de l'usage.`,
      use_when: `Quand le travail concerne ${humanize(dirName)}.`,
      path: `.ai/agents/${slug}/AGENT.md`,
    };
    const agent = [
      "---",
      "schema_version: base.resource.v1",
      `id: ${agentFields.id}`,
      "type: agent",
      `title: ${agentFields.title}`,
      `description: ${agentFields.description}`,
      `use_when: ${agentFields.use_when}`,
      "scope: personal",
      "status: active",
      "sensitivity: internal",
      `created: ${now.slice(0, 10)}`,
      "---",
      `# ${agentFields.title}`,
      "",
      "Ce fichier est la carte d'identité de votre assistant: qui il est, quand le solliciter.",
      "Précisez la description et le use_when dès que son rôle se dessine — c'est ce que lit le",
      "routeur pour décider de l'activer.",
      "",
      "Pour transformer vos documents existants en process et compétences, demandez à votre",
      "assistant: «importer mes procédures existantes» — le routeur l'enverra sur le process",
      "`importer-l-existant`, qui propose chaque conversion en diff (rien n'est écrit sans vous).",
      "",
    ].join("\n");

    const plan = [
      {
        path: agentFields.path,
        content: agent,
        reason: detection.type === "loose"
          ? "Vos fichiers Markdown existants méritent un agent qui les connaît."
          : "Le point de départ minimal d'un BASE: un agent.",
      },
      {
        path: `.ai/agents/${slug}/skills/processes/importer-l-existant/SKILL.md`,
        content: IMPORTER_PROCESS,
        reason: "Le process «importer mes procédures existantes» que l'agent promet, livré avec lui.",
      },
      {
        path: "base.config.json",
        content: `${JSON.stringify(
          { schema_version: "base.config.v1", ...(frameworkDir ? { framework_dir: frameworkDir } : {}) },
          null,
          2,
        )}\n`,
        reason: "La configuration du root — et `framework_dir`, où vit le moteur, pour le retrouver d'ici.",
      },
      // The runnable handle on the engine: `node .ai/base.mjs <cmd>` works from this folder with no
      // PATH entry, alias, or global install — it finds tools/base.mjs via framework_dir (above).
      {
        path: ".ai/base.mjs",
        content: LAUNCHER_SOURCE,
        reason: "Le lanceur de la CLI BASE: `node .ai/base.mjs route \"…\" --root .`, lançable d'ici sans rien installer.",
      },
      // The tool artifacts, from the SAME renderers as `base build` — an AI tool must
      // understand the folder the moment it opens it.
      {
        path: "CLAUDE.md",
        content: renderClaudeMd(),
        reason: "Votre Claude Code lira ce fichier en ouvrant le dossier: il devient le routeur.",
      },
      {
        path: "AGENTS.md",
        content: renderAgentsMd([{ type: "agent", ...agentFields }]),
        reason: "Le point d'entrée des éditeurs qui lisent AGENTS.md, avec le catalogue de vos agents.",
      },
      {
        path: ".cursor/rules/assistant.mdc",
        content: renderCursorRule(),
        reason: "La règle Cursor: ouvrir le dossier suffit, Cursor charge le contexte BASE.",
      },
      {
        path: "BASE_BOOTSTRAP.md",
        content: renderBootstrapMd(),
        reason: "Le point d'entrée générique pour tout autre outil IA qui lit du Markdown.",
      },
      {
        path: ".ai/tools.md",
        content: renderToolMatrix(),
        reason: "La déclaration honnête de ce que chaque outil garantit (ou pas).",
      },
    ];
    const existing = new Set(detection.existingArtifacts ?? []);
    return plan.filter((entry) => !existing.has(entry.path));
  }

  // Exhaustiveness guard: a sixth type must be handled here, loudly.
  throw new Error(`unknown perimeter type: ${detection.type}`);
}

/**
 * Write the plan. `wx` makes the filesystem itself refuse overwrites — and a refusal is an
 * EXPECTED outcome (a file appeared since detection), never a crash mid-write: the entry is
 * skipped and reported, the rest of the plan still lands. → { created: [paths], skipped:
 * [{ path, reason }] }
 */
export async function applyInitPlan(dir, plan) {
  const abs = path.resolve(dir);
  const created = [];
  const skipped = [];
  for (const entry of plan) {
    const target = path.join(abs, entry.path);
    await mkdir(path.dirname(target), { recursive: true });
    try {
      await writeFile(target, entry.content, { flag: "wx" });
      created.push(entry.path);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      skipped.push({ path: entry.path, reason: "existait déjà" });
    }
  }
  return { created, skipped };
}
