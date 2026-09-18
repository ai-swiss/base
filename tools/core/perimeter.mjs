// The bootstrap seam: from "a directory of files" to "a BASE that Studio can serve".
// Three functions, one strict order — detect (reads), buildInitPlan (decides, PURE),
// applyInitPlan (writes, creation-only). The CLI (`base init`) and Studio's Welcome screen are
// thin adapters over the same three calls: both show the EXACT files before anything is
// written, and the server never trusts client-provided content (it rebuilds the plan itself).
//
// Every string this module puts INSIDE a scaffolded file comes from ./lang/ (French by default,
// per-key fallback); `buildInitPlan` takes an optional `lang` and threads it to the shared
// renderers. The `reason` of each plan entry stays here on purpose: it is never written to disk,
// only shown to the person running the command, and that is the CLI's own voice.

import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathExists } from "./confine.mjs";
import { renderAgentsMd, renderBootstrapMd, renderToolMatrix, renderClaudeMd, renderCursorRule } from "./bootstrap.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";
import { renderRoutingIndex } from "./index-md.mjs";
import { LAUNCHER_SOURCE } from "./launcher.mjs";
import { WORKSPACE_FILENAME } from "./roots.mjs";
import { normalizeLanguage, stringsFor } from "./lang/index.mjs";
import { buildRoutingRegistry } from "./routing.mjs";

const FR = stringsFor("fr");

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
  ".gitignore",
];

// BASE runtime data never belongs in a shared repository: traces, pending change snapshots (whose
// diffs can target confidential files), field feedback and machine-local settings. init proposes the
// ignore file at birth (creation-only — a project's existing .gitignore is respected, never appended),
// so the trust promise «local, jamais transmis» survives the first `git push`.
export const GITIGNORE_FOR_UPGRADE = FR.scaffoldGitignore;

// The folder's README: what this is, in four lines, plus the attribution the method content asks
// for (LICENSING.md, CC BY 4.0). A root built on BASE's method should be able to say so without its
// owner having to find the sentence; `doctor` names a README that lost it.
//
// The README written at init carries the credit IN ITS OWN LANGUAGE (`s.attributionLine`): a folder
// whose every other line is English would otherwise state its licence in French. What both readers
// actually match is the `a-i.swiss` URL (upgrade.mjs, doctor/diagnose.mjs), which every translation
// keeps, so a translated credit stays detectable. This exported constant stays FRENCH because it is
// what `upgrade` APPENDS to an older root's README, and those roots are French.
export const ATTRIBUTION_LINE = FR.attributionLine;

function renderRootReadme(title, s) {
  return [
    `# ${title}`,
    "",
    ...s.scaffoldReadmeBody,
    "",
    s.attributionLine,
    "",
  ].join("\n");
}

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

  // Whether this folder is a git working copy decides ONE thing in the plan: a `.gitattributes`
  // that pins line endings. Outside a repository the file would mean nothing.
  const hasGit = await pathExists(path.join(abs, ".git"));

  const markdown = await listMarkdown(abs);
  if (markdown.count > 0) {
    return { type: "loose", markdownCount: markdown.count, hasSkillNames: markdown.hasSkillNames, existingArtifacts, hasGit };
  }
  return { type: "empty", existingArtifacts, hasGit };
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

// Which file each AI tool actually reads. A folder gets the entry point of the tool ITS OWNER uses,
// named at `base init --tool <id>`, and nothing else: writing four entry points for four tools puts
// three files in a folder whose owner will never open them, and one of them (a Cursor rule) in a
// dot-directory they did not ask for. Without an answer, the tool-agnostic Markdown bootstrap is the
// minimum that still works everywhere, and the report ASKS the question rather than guessing.
// The id → file mapping is structure and never moves; only the label is prose, so it is read from
// the language table. `toolEntryPoints(lang)` builds the same map in another language; the exported
// TOOL_ENTRY_POINTS constant stays French so the many callers that only need `path` or `id`
// (config.mjs, projections.mjs, views.mjs, cli/init.mjs) keep working untouched.
const TOOL_ENTRY_PATHS = {
  "claude-code": "CLAUDE.md",
  cursor: ".cursor/rules/assistant.mdc",
  "agents-md": "AGENTS.md",
  autre: "BASE_BOOTSTRAP.md",
};

export function toolEntryPoints(lang) {
  const labels = stringsFor(lang).toolEntryPointLabels;
  return Object.fromEntries(
    Object.entries(TOOL_ENTRY_PATHS).map(([id, entryPath]) => [id, { id, path: entryPath, label: labels[id] }]),
  );
}

export const TOOL_ENTRY_POINTS = toolEntryPoints("fr");
export const DEFAULT_TOOL = "autre";

// The help target a fresh root declares (`routing.fallback`, FR-ROUTE-009): the framework's own
// welcome process, which the Router attaches to an honest abstention and the routing index names at
// its foot. Without it a new folder has NO door at all: its only process is the starter import, so a
// request nothing covers ends nowhere, and the person is left to discover the framework's own help by
// reading someone's absolute path. Nothing is copied here — the target is resolved at route time in
// the framework this root belongs to (`resolveFrameworkRoot`), so no copy can age.
//
// It lives beside the other scaffold constants rather than in the language tables: these are
// identifiers of the framework's own corpus, and translating them would break the resolution.
export const FRAMEWORK_HELP_TARGET = { agent: "concierge-base", process: "accueil" };

/**
 * From a detection, the EXACT files to create — pure: `frameworkDir` is injected, nothing is
 * read. Every entry is creation-only; an existing target makes applyInitPlan refuse,
 * never overwrite. `frameworkDir` (where the framework lives) is recorded in base.config.json so
 * the project self-describes its engine; omit it and the field is simply left out.
 *
 * `intake` carries what the person answered: `tools` (which entry points to write), `about` (one
 * sentence on the work, which becomes the starter agent's description and its «Quand l'utiliser»,
 * the two fields the router reads), and `egress` (whether any resource may reach a hosted model).
 * All are optional: absent, the plan writes the tool-agnostic minimum and a generic card the owner
 * refines; `any`, the egress default, adds no redundant config.
 *
 * `lang` picks the language of the FILES this writes; absent means French. It is also RECORDED as
 * `language` in the `base.config.json` the plan carries, so the next `base build --write` keeps
 * writing that language instead of reverting the root to French. The `reason` of each entry is the
 * CLI's own voice and stays French either way — it is shown, never written.
 * → [{ path, content, reason }] — empty when there is nothing sensible to do (root, workspace).
 * @param {any} detection
 * @param {{ dirName: string, frameworkDir?: string, intake?: { tools?: string[], about?: string, egress?: string }, lang?: string }} options
 */
export function buildInitPlan(detection, { dirName, frameworkDir, intake = {}, lang }) {
  const s = stringsFor(lang);
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
      reason: `${detection.roots.length} BASE détectés dans ce dossier, ce fichier les réunit en workspace.`,
    }];
  }

  if (detection.type === "loose" || detection.type === "empty") {
    // The agent exists as DATA first: the same fields render the AGENT.md markdown AND the
    // AGENTS.md catalogue entry — never parse back what was just generated.
    const slug = slugify(dirName);
    const declaredLanguage = normalizeLanguage(lang);
    const entryTools = entryPointsFor(intake.tools, lang);
    const about = typeof intake.about === "string" && intake.about.trim() ? intake.about.trim().replace(/\s+/g, " ") : null;
    const agentFields = {
      id: slug,
      title: humanize(dirName),
      // The one sentence the owner gave about their work IS the routing signal: it is what the
      // description and the «Quand l'utiliser» are for. Absent, a generic card, to refine.
      description: about ?? s.scaffoldAgentDescription(humanize(dirName)),
      use_when: about ? s.scaffoldAgentUseWhenAbout(about) : s.scaffoldAgentUseWhenGeneric(humanize(dirName)),
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
      "---",
      `# ${agentFields.title}`,
      "",
      ...s.scaffoldAgentBody,
      "",
    ].join("\n");
    const processPath = `.ai/agents/${slug}/skills/processes/importer-l-existant/SKILL.md`;
    const processContent = s.scaffoldImporterProcess.join("\n");
    const routingIndex = initialRoutingIndex(agentFields, processPath, processContent, lang);

    const plan = [
      {
        path: agentFields.path,
        content: agent,
        reason: detection.type === "loose"
          ? "Vos fichiers Markdown existants méritent un agent qui les connaît."
          : "Le point de départ minimal d'un BASE: un agent.",
      },
      {
        path: processPath,
        // The scaffolded agent's AGENT.md invites the user to say «importer mes procédures
        // existantes»; this is the process that invitation routes to, shipped WITH the agent so the
        // promise holds in the user's own project (not only in the framework's createur-agent).
        content: processContent,
        reason: "Le process «importer mes procédures existantes» que l'agent promet, livré avec lui.",
      },
      ...Object.entries(routingIndex).map(([entryPath, content]) => ({
        path: entryPath,
        content,
        reason: "La carte que le point d'entrée demande de lire avant de choisir un agent ou un process.",
      })),
      // Line endings, pinned. A process, a template and a script are read by people on Windows,
      // macOS and Linux at once; without this, one checkout rewrites every line ending and the next
      // diff shows a file nobody touched. Text is normalised, scripts stay LF (a CRLF shebang fails
      // to execute). Git LFS is NOT written: its patterns break a clone on a machine where `git lfs`
      // is absent, and that failure is silent until someone opens an empty file.
      ...(detection.hasGit
        ? [{
            path: ".gitattributes",
            content: s.scaffoldGitattributes,
            reason: "Ce dossier est un dépôt git: les fins de ligne sont fixées, pour qu'un même process lu sous Windows et sous macOS ne produise pas un diff entier.",
          }]
        : []),
      {
        path: "README.md",
        content: renderRootReadme(humanize(dirName), s),
        reason: "Ce que contient ce dossier, en quatre lignes, et l'attribution que demandent les contenus de méthode.",
      },
      {
        path: ".gitignore",
        content: s.scaffoldGitignore,
        reason: "Les données locales BASE (traces, changements, feedback, réglages) restent hors du dépôt partagé.",
      },
      {
        path: "base.config.json",
        content: `${JSON.stringify(
          {
            schema_version: "base.config.v1",
            ...(frameworkDir ? { framework_dir: frameworkDir } : {}),
            // The answer to "which tool reads this folder", recorded so `base build` keeps writing
            // that entry point and no other (FR-BUILD-001).
            ...(entryTools.length ? { tools: entryTools.map((tool) => tool.id) } : {}),
            // The answer to "in which language is this folder written", recorded for the same
            // reason: without it, the next `base build --write` would rewrite a German root's
            // entry point in French. Recorded EVEN when this build has no table for it, so the
            // declaration survives until a table lands and nobody has to answer twice.
            ...(declaredLanguage ? { language: declaredLanguage } : {}),
            ...(intake.egress === "local-only" ? { egress: "local-only" } : {}),
            // The door out of a dead end, from the first minute: a request nothing here covers lands
            // on the framework's welcome process instead of nowhere (see FRAMEWORK_HELP_TARGET).
            routing: { fallback: { ...FRAMEWORK_HELP_TARGET } },
          },
          null,
          2,
        )}\n`,
        reason: entryTools.length
          ? "La configuration du root: où vit le moteur, quel outil lit ce dossier, et où atterrit une demande que rien ici ne couvre."
          : "La configuration du root: `framework_dir` pour retrouver le moteur d'ici, et où atterrit une demande que rien ici ne couvre.",
      },
      // The runnable handle on the engine: `node .ai/base.mjs <cmd>` works from this folder with no
      // PATH entry, alias, or global install — it finds tools/base.mjs via framework_dir (above).
      {
        path: ".ai/base.mjs",
        content: LAUNCHER_SOURCE,
        reason: "Le lanceur de la CLI BASE: `node .ai/base.mjs route \"…\" --root .`, lançable d'ici sans rien installer.",
      },
      // The entry point of the tool THIS person uses, from the SAME renderers as `base build`, so
      // opening the folder in that tool is enough. One tool, one file (see TOOL_ENTRY_POINTS).
      ...entryTools.map((tool) => ({
        path: tool.path,
        content: renderEntryPoint(tool.path, agentFields, lang),
        reason: `Le point d'entrée de ${tool.label}: ouvrir ce dossier suffit pour que l'outil devienne le routeur.`,
      })),
      {
        path: ".ai/tools.md",
        content: renderToolMatrix(lang),
        reason: "La déclaration honnête de ce que chaque outil garantit (ou pas).",
      },
    ];
    const existing = new Set(detection.existingArtifacts ?? []);
    return plan.filter((entry) => !existing.has(entry.path));
  }

  // Exhaustiveness guard: a sixth type must be handled here, loudly.
  throw new Error(`unknown perimeter type: ${detection.type}`);
}

/** The entry points to write, from the answer. An unknown or absent answer falls back to the minimum. */
function entryPointsFor(tools, lang) {
  const entries = toolEntryPoints(lang);
  const asked = (Array.isArray(tools) ? tools : [])
    .map((id) => entries[String(id).trim().toLowerCase()])
    .filter(Boolean);
  const unique = [];
  for (const tool of asked) if (!unique.some((t) => t.path === tool.path)) unique.push(tool);
  return unique.length ? unique : [entries[DEFAULT_TOOL]];
}

function renderEntryPoint(entryPath, agentFields, lang) {
  if (entryPath === "CLAUDE.md") return renderClaudeMd(lang);
  if (entryPath === ".cursor/rules/assistant.mdc") return renderCursorRule(lang);
  if (entryPath === "AGENTS.md") return renderAgentsMd([{ type: "agent", ...agentFields }], lang);
  return renderBootstrapMd(lang);
}

function initialRoutingIndex(agentFields, processPath, processContent, lang) {
  const parsed = parseFrontmatter(processContent);
  const process = {
    ...parsed.data,
    type: "process",
    path: processPath,
    body: parsed.body,
    metadata: parsed.data,
  };
  const agent = { type: "agent", body: "", metadata: {}, ...agentFields };
  return renderRoutingIndex(buildRoutingRegistry([agent, process]), { lang });
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
