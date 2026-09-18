// tools/cli/init.mjs — `base init`, from a plain directory to a working BASE: the questions asked
// before anything is written, the plan shown, the files created, and the next step printed in the
// tool the person actually uses.
//
// Extracted from base.mjs when that file passed its size cap. Detection and the plan itself stay
// PURE in tools/core/perimeter.mjs (shared verbatim with the Studio's Welcome screen); this module
// formats, asks, and applies.

import * as path from "node:path";
import * as fs from "node:fs/promises";
import { buildArtifacts, writeArtifacts } from "../base-core.mjs";
import { LAUNCHER_SOURCE } from "../core/launcher.mjs";
import { describeDetection } from "./format.mjs";
import { formatRegistration, frameworkDir, registerFramework } from "./framework.mjs";
import { WORKSPACE_FILENAME } from "../core/roots.mjs";
import { availableLanguages, isKnownLanguage, normalizeLanguage } from "../core/lang/index.mjs";

// The languages this build can actually write, named in the question and in the note. Read once
// from the table rather than listed here, so adding a table adds it to the prompt.
const AVAILABLE_LANGUAGES = availableLanguages();

// Which planned paths are TOOL artifacts (vs the BASE's own files) — display grouping only.
const TOOL_ARTIFACT_PATHS = new Set([
  ".ai/base.mjs", "CLAUDE.md", "AGENTS.md", "BASE_BOOTSTRAP.md", ".cursor/rules/assistant.mdc", ".ai/tools.md",
]);

// How to OPEN this folder, in the tool whose entry point was just written. A generic «lancez claude»
// is wrong for someone who answered Cursor, and a list of four tools is noise for someone who
// answered one.
const ENTRY_POINT_PATHS = new Set(["CLAUDE.md", ".cursor/rules/assistant.mdc", "AGENTS.md", "BASE_BOOTSTRAP.md"]);

const OPENING_LINE = {
  "CLAUDE.md": (abs) => `cd "${abs}" && claude`,
  ".cursor/rules/assistant.mdc": (abs) => `ouvrez "${abs}" dans Cursor`,
  "AGENTS.md": (abs) => `ouvrez "${abs}" dans votre éditeur (Codex, Copilot, Windsurf: ils lisent AGENTS.md)`,
  "BASE_BOOTSTRAP.md": (abs) => `ouvrez "${abs}" dans votre outil IA et faites-lui lire BASE_BOOTSTRAP.md`,
};

function openingLineFor(created, abs) {
  const entry = created.find((p) => OPENING_LINE[p]);
  return entry ? OPENING_LINE[entry](abs) : `ouvrez "${abs}" dans votre outil IA`;
}

/**
 * The next step is always printed: real, quoted paths — never placeholders — and every door
 * gets its exact command (your AI tool, the MCP guarantees, the workshop).
 */
function initEpilogue(rootDir, created, skipped) {
  const abs = path.resolve(rootDir);
  const launcher = path.join(abs, ".ai", "base.mjs");
  const files = created.filter((p) => !TOOL_ARTIFACT_PATHS.has(p));
  const artifacts = created.filter((p) => TOOL_ARTIFACT_PATHS.has(p));
  const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
  const lines = [];
  if (files.length) lines.push(`✓ ${plural(files.length, "fichier")} créé${files.length > 1 ? "s" : ""}     ${files.join(" · ")}`);
  if (artifacts.length) lines.push(`✓ ${plural(artifacts.length, "artefact")} d'outils  ${artifacts.join(" · ")}`);
  for (const s of skipped) lines.push(`  (ignoré: ${s.path} — ${s.reason})`);
  lines.push(
    "",
    "L'expérience commence dans VOTRE outil:",
    `  ${openingLineFor(created, abs)}`,
    "  puis dites: «importer mes procédures existantes»",
    "",
    "Envie des garanties mécaniques (routage déterministe, écritures validées) ?",
    "  Le serveur MCP se branche en 3 lignes: docs/start/installer-mcp.md",
    "",
    "La CLI, lançable d'ici sans rien installer sur le PATH (le lanceur trouve le moteur tout seul) :",
    `  node "${launcher}" route "votre demande" --root "${abs}"   # routage déterministe`,
    `  node "${launcher}" studio --root "${abs}"                   # l'atelier graphique`,
  );
  return lines.join("\n");
}

/**
 * Whether this root must record WHERE the engine lives, and therefore carry an absolute path from
 * this machine into a file people share. It must not when the user-global config already answers
 * the question (`~/.config/base/config.json`, written by `init` itself): the launcher reads that
 * next, so the root stays portable and its config stops naming someone's home directory. When that
 * config is unreadable or empty, the path is recorded, since a root that cannot find its engine is
 * a root that cannot run.
 */
async function frameworkDirToRecord() {
  const home = process.env.BASE_CONFIG_HOME || (await import("node:os")).homedir();
  const { readUserConfig } = await import("../core/userconfig.mjs");
  const { config } = await readUserConfig(home, (file) => fs.readFile(file, "utf8"));
  return config?.framework_dir ? undefined : frameworkDir();
}

/**
 * What `init` still does not know, asked before anything is written. A folder gets the entry point
 * of the tool ITS OWNER uses; unanswered, it gets the tool-agnostic one and the question, rather
 * than four entry points for four tools its owner did not name (the Cursor rule in particular lands
 * in a dot-directory nobody asked for).
 *
 * Each question appears ONLY when its answer would change the plan. The language question is asked
 * on the fresh path alone (`fresh`): on an existing root the plan comes from `base build`, which
 * reads the language the root already declares, so `--language` would change nothing there and
 * asking would promise something the command does not do.
 */
function initQuestions(args, plan, { fresh = true } = {}) {
  const asked = [];
  const writesAnAgent = plan.some((entry) => entry.path.endsWith("/AGENT.md"));
  const writesAnEntryPoint = plan.some((entry) => ENTRY_POINT_PATHS.has(entry.path));
  if (!args.tools.length && writesAnEntryPoint) {
    asked.push("  Quel outil IA lira ce dossier ?  --tool claude-code | cursor | agents-md | autre");
    asked.push("    (sans réponse: BASE_BOOTSTRAP.md, que tout outil lisant du Markdown comprend)");
  }
  if (!args.about && writesAnAgent) {
    asked.push("  Que faites-vous, en une phrase ?  --about \"…\"");
    asked.push("    (cette phrase devient la description de votre premier agent, ce que lit le routage)");
  }
  if (fresh && !args.language && writesLanguageBearingFiles(plan)) {
    asked.push(`  Dans quelle langue écrire ce dossier ?  --language ${AVAILABLE_LANGUAGES.join(" | ")}`);
    asked.push("    (sans réponse: le français; une autre langue est notée et ses textes restent en français)");
  }
  if (fresh && !args.egress && plan.some((entry) => entry.path === "base.config.json")) {
    asked.push("  Des données qui ne doivent jamais atteindre un modèle hébergé ?  --egress local-only");
  }
  return asked.length ? `\nAvant d'écrire:\n${asked.join("\n")}\n\n` : "";
}

/**
 * Whether the plan carries at least one file whose WORDS come from the language table. A workspace
 * file and the launcher carry none, so a collection is never asked which language to write in.
 */
function writesLanguageBearingFiles(plan) {
  return plan.some((entry) => entry.path !== WORKSPACE_FILENAME && entry.path !== ".ai/base.mjs");
}

/**
 * The one line a language this build cannot write earns. Recording the declaration and rendering
 * French is the deliberate behaviour (a root must never become unloadable because it named a
 * language BASE has not been taught); silence would leave the owner to discover it from the files.
 */
function unknownLanguageNote(language) {
  if (!language || isKnownLanguage(language)) return "";
  return `\nLangue «${normalizeLanguage(language)}» inconnue de ce build: elle est notée dans base.config.json, et les textes sont écrits en français (langues disponibles: ${AVAILABLE_LANGUAGES.join(", ")}).\n`;
}

/**
 * `base init` — from a plain directory to a working BASE. Resolves its own target (--root or the
 * cwd); it does NOT require an existing BASE (it creates one). On an existing root it heals
 * instead of abstaining: it proposes the missing tool artifacts, from the same renderers as
 * `base build`. Detection + plan are pure (tools/core/perimeter.mjs); this only formats and asks.
 */
export async function runInit(args, output) {
  const rootDir = args.root ? path.resolve(args.root) : process.cwd();
  const { applyInitPlan, buildInitPlan, detectPerimeter } = await import("../core/perimeter.mjs");
  const detection = await detectPerimeter(rootDir);
  let plan;
  let registration = null;
  let fresh = true;
  if (detection.type === "root") {
    fresh = false;
    const { TOOL_ENTRY_POINTS, DEFAULT_TOOL } = await import("../core/perimeter.mjs");
    const entryPaths = new Set(Object.values(TOOL_ENTRY_POINTS).map((tool) => tool.path));
    const onDisk = async (rel) => fs.access(path.join(rootDir, rel)).then(() => true, () => false);
    // Which entry points this root already uses. Healing must never ADD a tool's entry point that
    // its owner did not choose: a root that works in Cursor has no use for a CLAUDE.md, and the
    // first version of this command handed every root all four.
    const chosen = new Set();
    for (const rel of entryPaths) if (await onDisk(rel)) chosen.add(rel);
    if (chosen.size === 0) {
      for (const id of args.tools.length ? args.tools : [DEFAULT_TOOL]) {
        const tool = TOOL_ENTRY_POINTS[String(id).trim().toLowerCase()];
        if (tool) chosen.add(tool.path);
      }
    }
    const missing = [];
    for (const artifact of await buildArtifacts(rootDir)) {
      if (entryPaths.has(artifact.path) && !chosen.has(artifact.path)) continue;
      if (await onDisk(artifact.path)) continue;
      missing.push({
        path: artifact.path,
        content: artifact.content,
        reason: entryPaths.has(artifact.path)
          ? "Ce dossier n'a aucun point d'entrée: aucun outil IA ne le reconnaît en l'ouvrant."
          : "Artefact d'outil manquant — sans lui, votre outil IA ne reconnaît pas ce BASE.",
      });
    }
    // The launcher is not a build artifact (it is root-independent); heal it here if absent so an
    // existing BASE gains the runnable `node .ai/base.mjs` handle without a full re-init.
    if (!(await fs.access(path.join(rootDir, ".ai", "base.mjs")).then(() => true, () => false))) {
      missing.push({
        path: ".ai/base.mjs",
        content: LAUNCHER_SOURCE,
        reason: "Le lanceur de la CLI BASE: `node .ai/base.mjs … --root .`, lançable d'ici sans rien installer.",
      });
    }
    plan = missing;
  } else {
    // Register the engine location FIRST when we are about to write: the user-global config is what
    // keeps the root's own file free of a machine-specific path (see frameworkDirToRecord).
    if (args.yes) registration = await registerFramework();
    plan = buildInitPlan(detection, {
      dirName: path.basename(rootDir),
      frameworkDir: await frameworkDirToRecord(),
      intake: { tools: args.tools, about: args.about, egress: args.egress },
      lang: args.language || undefined,
    });
  }
  if (plan.length === 0) {
    output(args.json ? { detection, plan, applied: false } : `Déjà un BASE (${detection.type}) : rien à initialiser.`, args.json);
    return;
  }
  if (!args.yes) {
    const preview = plan
      .map((e) => `  ${e.path}\n    ${e.reason}\n    | ${e.content.split("\n").slice(0, 3).join("\n    | ")} …`)
      .join("\n");
    output(
      args.json
        ? { detection, plan, applied: false }
        : `Détection: ${describeDetection(detection)}\n` +
          `Fichiers à créer (rien n'est écrit sans --yes) :\n${preview}\n` +
          `${fresh ? unknownLanguageNote(args.language) : ""}\n` +
          // The hint echoes the full command: launched with --root, a hint without it is a
          // non-sequitur when copy-pasted from another directory («Déjà un BASE: rien à initialiser»).
          `${initQuestions(args, plan, { fresh })}Pour appliquer:  base init${args.root ? ` --root ${args.root}` : ""} --yes`,
      args.json,
    );
    return;
  }
  const { created, skipped } = await applyInitPlan(rootDir, plan);
  // The map the entry point tells the reader to open FIRST, refreshed through the real projection.
  // The plan renders it purely, because it must be shown before anything is written, and a pure
  // render cannot resolve the help target it declares: that target lives in the framework this root
  // now belongs to, and only a reader of the framework's inventory can turn it into a link
  // (FR-ROUTE-009). Same renderer and same resolution as every later `base build routing-index
  // --write`, so a fresh root's map and a built one cannot differ.
  if (created.includes(".ai/routing/index.md")) {
    await writeArtifacts(rootDir, await buildArtifacts(rootDir, { targets: ["routing-index"] }));
  }
  // Self-register the framework location, best-effort: a read-only home never fails init. Already
  // done above on the fresh-root path, where the plan depends on whether it succeeded.
  registration = registration ?? await registerFramework();
  output(
    args.json
      ? { detection, plan, applied: true, created, skipped, registration }
      : `${initEpilogue(rootDir, created, skipped)}\n${fresh ? unknownLanguageNote(args.language) : ""}\n${formatRegistration(registration)}`,
    args.json,
  );
}

/**
 * `base upgrade` — what an older root should change to match the framework as it is today. Dry-run
 * by default, like `init` and `build`; `--write` applies. Creations are creation-only, appends add
 * a line at the end of a file BASE owns the format of, and the single rewrite is BASE's own JSON
 * config. Nothing is deleted: a file the author wrote is named, never touched.
 */
export async function runUpgrade(args, output) {
  const rootDir = args.root ? path.resolve(args.root) : process.cwd();
  const { planUpgrade } = await import("../core/upgrade.mjs");
  const { ATTRIBUTION_LINE, FRAMEWORK_HELP_TARGET, GITIGNORE_FOR_UPGRADE } = await import("../core/perimeter.mjs");
  const { inventoryResources } = await import("../base-core.mjs");
  const read = async (rel) => fs.readFile(path.join(rootDir, rel), "utf8").catch(() => null);
  const { listFiles, walkTree } = await import("../core/fswalk.mjs");

  const configText = await read("base.config.json");
  const home = process.env.BASE_CONFIG_HOME || (await import("node:os")).homedir();
  const { readUserConfig } = await import("../core/userconfig.mjs");
  const userConfig = await readUserConfig(home, (file) => fs.readFile(file, "utf8"));

  const { plan, notes } = planUpgrade({
    files: listFiles(await walkTree(rootDir)),
    gitignore: await read(".gitignore"),
    readme: await read("README.md"),
    config: configText ? JSON.parse(configText) : null,
    inventory: await inventoryResources(rootDir),
    userConfigHasFramework: Boolean(userConfig.config?.framework_dir),
    attributionLine: ATTRIBUTION_LINE,
    gitignoreContent: GITIGNORE_FOR_UPGRADE,
    helpTarget: FRAMEWORK_HELP_TARGET,
  });

  if (!args.write) {
    const lines = plan.map((entry) => `  ${entry.path} (${entry.action})\n    ${entry.reason}`);
    output(
      args.json
        ? { plan, notes, applied: false }
        : [
            plan.length ? `À mettre à jour (rien n'est écrit sans --write):\n${lines.join("\n")}` : "Rien à mettre à jour: ce dossier suit déjà les conventions actuelles.",
            ...notes.map((note) => `\nÀ votre main: ${note}`),
            plan.length ? `\nPour appliquer:  base upgrade${args.root ? ` --root ${args.root}` : ""} --write` : "",
          ].join("\n"),
      args.json,
    );
    return;
  }

  const applied = [];
  for (const entry of plan) {
    const target = path.join(rootDir, entry.path);
    if (entry.action === "create") await fs.writeFile(target, entry.content, { flag: "wx" }).catch(() => {}); // raw-write-ok: creation-only, like the init plan
    else if (entry.action === "append") await fs.appendFile(target, entry.content); // raw-write-ok: one line at the end of a file BASE owns the format of
    else await fs.writeFile(target, entry.content); // raw-write-ok: BASE's own JSON config, rewritten from its parsed content
    applied.push(entry.path);
  }
  output(
    args.json ? { plan, notes, applied: true, changed: applied } : [
      applied.length ? `Mis à jour:\n${applied.map((p) => `  ${p}`).join("\n")}` : "Rien à mettre à jour.",
      ...notes.map((note) => `\nÀ votre main: ${note}`),
    ].join("\n"),
    args.json,
  );
}

