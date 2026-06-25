#!/usr/bin/env node

import * as path from "node:path";
import * as fs from "node:fs/promises";
import { spawn } from "node:child_process";
import {
  buildArtifacts,
  checkManifestFresh,
  commitChange,
  createMaintenanceReport,
  formatMaintenanceReport,
  formatMarkers,
  formatRouteResult,
  formatRouteTestResult,
  formatSearchResults,
  formatTraceSummary,
  formatTracePrune,
  formatValidationResult,
  invokeTool,
  inventoryResources,
  listMarkers,
  openResource,
  promoteResource,
  writeArtifacts,
  proposeChange,
  appendAbstention,
  isAbstention,
  routeRequest,
  runRouteTests,
  searchResources,
  summarizeTrace,
  pruneTrace,
  validateBase,
  writeManifest,
  accessResource,
  confineToRoot,
  projectResourceMetadata,
  resolveConfig,
  MANIFEST_FILENAME,
} from "./base-core.mjs";
import { WORKSPACE_FILENAME, contextScope, formatContextHeader, resolveBaseContext } from "./core/roots.mjs";
import { LAUNCHER_SOURCE } from "./core/launcher.mjs";
import { decideWorkspaceRoute } from "./core/route-workspace.mjs";
import { precomputeRoutingVectors, writeRoutingVectors } from "./core/routing-vectors.mjs";
import { reportProgress } from "./core/progress.mjs";
import { loadCompanion } from "./core/companion.mjs";
import { formatDocsModelSummary, validateDocsModel, writeDocsModel } from "./docs/model.mjs";
import { parseArgs } from "./cli/parse-args.mjs";
import { describeDetection, formatBuildPlan, formatPromoteResult, formatProposeResult, projectValidationResult } from "./cli/format.mjs";
import { formatRegistration, frameworkDir, registerFramework, update, whereis } from "./cli/framework.mjs";

// Which planned paths are TOOL artifacts (vs the BASE's own files) — display grouping only.
const TOOL_ARTIFACT_PATHS = new Set([
  ".ai/base.mjs", "CLAUDE.md", "AGENTS.md", "BASE_BOOTSTRAP.md", ".cursor/rules/assistant.mdc", ".ai/tools.md",
]);

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
    `  cd "${abs}" && claude          # ou ouvrez ce dossier dans Cursor`,
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
 * `base init` — from a plain directory to a working BASE. Resolves its own target (--root or the
 * cwd); it does NOT require an existing BASE (it creates one). On an existing root it heals
 * instead of abstaining: it proposes the missing tool artifacts, from the same renderers as
 * `base build`. Detection + plan are pure (tools/core/perimeter.mjs); this only formats and asks.
 */
async function runInit(args) {
  const rootDir = args.root ? path.resolve(args.root) : process.cwd();
  const { applyInitPlan, buildInitPlan, detectPerimeter } = await import("./core/perimeter.mjs");
  const detection = await detectPerimeter(rootDir);
  let plan;
  if (detection.type === "root") {
    const missing = [];
    for (const artifact of await buildArtifacts(rootDir)) {
      if (await fs.access(path.join(rootDir, artifact.path)).then(() => true, () => false)) continue;
      missing.push({
        path: artifact.path,
        content: artifact.content,
        reason: "Artefact d'outil manquant — sans lui, votre outil IA ne reconnaît pas ce BASE.",
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
    plan = buildInitPlan(detection, { dirName: path.basename(rootDir), now: new Date().toISOString(), frameworkDir: frameworkDir() });
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
          `Fichiers à créer (rien n'est écrit sans --yes) :\n${preview}\n\n` +
          `Pour appliquer:  base init --yes`,
      args.json,
    );
    return;
  }
  const { created, skipped } = await applyInitPlan(rootDir, plan);
  // Self-register the framework location, best-effort: a read-only home never fails init.
  const registration = await registerFramework();
  output(
    args.json
      ? { detection, plan, applied: true, created, skipped, registration }
      : `${initEpilogue(rootDir, created, skipped)}\n\n${formatRegistration(registration)}`,
    args.json,
  );
}

async function main(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  const args = parseArgs(rest);

  if (["help", "--help", "-h", undefined].includes(command)) {
    console.log(help());
    return;
  }

  // Global commands: they answer questions ABOUT the framework itself, so they run from anywhere
  // and never require a BASE root in the working directory.
  if (command === "whereis") {
    await whereis(args.json);
    return;
  }
  if (command === "update") {
    await update();
    return;
  }
  // init CREATES a BASE, so it must run on a directory that is not one yet — it resolves its own
  // target (--root or the cwd) and never goes through the strict context resolution below.
  if (command === "init") {
    await runInit(args);
    return;
  }

  const context = await resolveBaseContext({
    explicitRoot: args.root,
    explicitWorkspace: args.workspace,
    rootId: args.rootId,
    allowWorkspaceRouting: command === "route",
  });
  const rootDir = selectedRootPath(context);
  if (rootDir) await assertRootExists(rootDir, context);
  // Don't silently mis-target: --root-id only means something inside a workspace. Warn loudly so a
  // user who forgot --workspace doesn't believe they targeted a specific root when they didn't.
  if (args.rootId && context.mode === "root") {
    console.error(`Attention: --root-id "${args.rootId}" ignoré (aucun workspace). Ajoutez --workspace <fichier> pour sélectionner une racine.`);
  }

  switch (command) {
    case "validate": {
      const config = args.config ? await resolveConfig(rootDir, { configPath: args.config }) : undefined;
      const result = await validateBase(rootDir, config ? { config } : {});
      output(args.json ? projectValidationResult(result) : formatValidationResult(result), args.json, context);
      process.exitCode = result.ok ? 0 : 1;
      return;
    }

    case "index": {
      // `--check`: freshness gate for CI. Compare the committed manifest to what index would produce
      // (no write, no network) and fail loudly on drift, so a stale manifest cannot pass `check` silently.
      if (args.check) {
        const { fresh, exists } = await checkManifestFresh(rootDir);
        const reason = exists ? "obsolète (le contenu a changé)" : "absent";
        const message = fresh
          ? `Manifest à jour: ${MANIFEST_FILENAME}.`
          : `Manifest ${reason}: ${MANIFEST_FILENAME}. Lancez «npm run index» et committez le résultat.`;
        output(args.json ? { fresh, exists, manifest: MANIFEST_FILENAME } : message, args.json, context);
        process.exitCode = fresh ? 0 : 1;
        return;
      }
      const result = await writeManifest(rootDir);
      output(args.json ? result.manifest : `Manifest ecrit: ${path.relative(rootDir, result.outputPath)}`, args.json, context);
      return;
    }

    case "discover": {
      const query = args.positional.join(" ").trim();
      if (!query) throw new Error('Usage: base discover "requete" [--root path]');
      const config = args.config ? await resolveConfig(rootDir, { configPath: args.config }) : undefined;
      const results = await searchResources(rootDir, query, { limit: args.limit, config });
      output(args.json ? results : formatSearchResults(results, query), args.json, context);
      return;
    }

    case "route": {
      // Empty/whitespace input is not a dead end: route it like any unmatched request so it abstains
      // honestly (out_of_scope) and lands on the configured help fallback, instead of a raw usage string.
      const request = args.positional.join(" ").trim();
      if (context.routeAcrossRoots) {
        const result = await routeAcrossWorkspace(context, request, { limit: args.limit, configPath: args.config });
        output(args.json ? result : formatRouteResult(result), args.json, context);
        return;
      }
      const config = args.config ? await resolveConfig(rootDir, { configPath: args.config }) : undefined;
      const result = await routeRequest(rootDir, request, { limit: args.limit, config });
      // An abstention is an unserved request — journalled by the ADAPTER (the broker stays pure).
      if (isAbstention(result.status)) {
        await appendAbstention(rootDir, { query: request, verdict: result.status, suggestion: result.next_question ?? null });
      }
      output(args.json ? result : formatRouteResult(result), args.json, context);
      return;
    }

    case "route-test": {
      const config = args.config ? await resolveConfig(rootDir, { configPath: args.config }) : undefined;
      const result = await runRouteTests(rootDir, { fixturesPath: args.from || undefined, config });
      output(args.json ? result : formatRouteTestResult(result), args.json, context);
      process.exitCode = result.ok ? 0 : 1;
      return;
    }

    case "route-eval": {
      // The LABELED routing eval — an HONEST STRUCTURAL SIGNAL, not a model-performance target. Its
      // headline is recall@k (does retrieval surface the right candidate? — model-independent), with a
      // per-model refiner diagnostic alongside (the over-routes vs over-asks shape). Both need a real
      // embedder, so the eval is Ollama-gated: `--ollama` runs it (skipped cleanly if Ollama is absent);
      // without it, the default path prints the header + how to run, never a slow model round-trip. It
      // runs against the framework's golden set + corpus, not an arbitrary --root. `--golden <path>`
      // overrides the set (relative to the framework root).
      const { runRouteEvalCli } = await import("./eval/route-eval-cli.mjs");
      const withOllama = args.positional.includes("--ollama");
      const gIdx = args.positional.indexOf("--golden");
      const goldenPath = args.from || (gIdx >= 0 ? args.positional[gIdx + 1] : undefined);
      const { result, text } = await runRouteEvalCli({ frameworkRoot: frameworkDir(), goldenPath, withOllama });
      output(args.json ? result : text, args.json, context);
      return;
    }

    case "inventory": {
      const resources = await inventoryResources(rootDir);
      output(args.json ? resources.map(projectResourceMetadata) : resources.map((resource) => `${resource.id}\t${resource.type}\t${resource.path}`).join("\n"), args.json, context);
      return;
    }

    case "open": {
      const idOrPath = args.positional[0];
      if (!idOrPath) throw new Error("Usage: base open <id-or-path> [--projection metadata|instructions|full] [--root path]");
      const result = await openResource(rootDir, idOrPath, {
        projection: args.projection,
        purpose: args.purpose,
        confirmed: args.confirmed,
        grantToken: args.grantToken,
      });
      output(args.json ? result : result.content, args.json, context);
      return;
    }

    case "access": {
      const idOrPath = args.positional[0];
      if (!idOrPath) throw new Error("Usage: base access <id-or-path> [--purpose reason] [--projection metadata|instructions|full] [--root path]");
      const result = await accessResource(rootDir, idOrPath, {
        projection: args.projection,
        purpose: args.purpose,
        confirmed: args.confirmed,
        grantToken: args.grantToken,
      });
      output(args.json ? result : result.content, args.json, context);
      return;
    }

    case "invoke": {
      const [idOrPath, ...toolArgs] = args.positional;
      if (!idOrPath) throw new Error("Usage: base invoke <tool-id> [args...] [--execute --confirmed] [--root path]");
      const result = await invokeTool(rootDir, idOrPath, toolArgs, {
        dryRun: !args.execute,
        confirmed: args.confirmed,
        grantToken: args.grantToken,
      });
      output(args.json ? result : JSON.stringify(result, null, 2), args.json, context);
      return;
    }

    case "propose": {
      const target = args.positional[0];
      if (!target) throw new Error("Usage: base propose <target> [--from file | stdin] [--purpose reason] [--root path]");
      // `--from` is resolved against the BASE root (like every other path in the broker, and like
      // `route-test --from`), NOT the current working directory — so `propose x --from sub/y.md
      // --root /base` reads /base/sub/y.md regardless of where the CLI was launched. confineToRoot
      // leaves absolute paths absolute (and still confines them).
      const content = args.from ? await fs.readFile(await confineToRoot(rootDir, args.from), "utf8") : await readStdin();
      const result = await proposeChange(rootDir, target, content, { purpose: args.purpose, confirmed: args.confirmed, grantToken: args.grantToken });
      output(args.json ? result : formatProposeResult(result), args.json, context);
      return;
    }

    case "commit": {
      const changeId = args.positional[0];
      if (!changeId) throw new Error("Usage: base commit <change-id> [--confirmed] [--root path]");
      const result = await commitChange(rootDir, changeId, { confirmed: args.confirmed, grantToken: args.grantToken });
      output(args.json ? result : `Changement applique: ${result.target} (${result.decision.decision})`, args.json, context);
      return;
    }

    case "promote": {
      const idOrPath = args.positional[0];
      if (!idOrPath) throw new Error("Usage: base promote <id-or-path> --to <scope> [--confirmed] [--root path]");
      if (!args.to) throw new Error("base promote requires --to <scope> (personal, team, org, public, enterprise-extension).");
      const proposal = await promoteResource(rootDir, idOrPath, args.to, { confirmed: args.confirmed, grantToken: args.grantToken });
      if (args.confirmed) {
        const committed = await commitChange(rootDir, proposal.change_id, { confirmed: true, grantToken: args.grantToken });
        output(args.json ? { ...proposal, committed } : `Promotion appliquee: ${proposal.id} (${proposal.from} -> ${proposal.to})`, args.json, context);
      } else {
        output(args.json ? proposal : formatPromoteResult(proposal), args.json, context);
      }
      return;
    }

    case "markers": {
      const markers = await listMarkers(rootDir);
      output(args.json ? markers : formatMarkers(markers), args.json, context);
      return;
    }

    case "build": {
      const target = args.positional[0] || "all";
      if (target === "routing-embeddings") {
        // Precompute the routing vectors (Phase 6b) — opt-in, model-backed. The embedder comes from the
        // shipped semantic package via a DYNAMIC import, so the core stays dependency-free.
        const embedderCfg = (await resolveConfig(rootDir)).routing?.embedder;
        if (!embedderCfg) throw new Error("routing-embeddings: configurez cfg.routing.embedder { provider: 'ollama'|'openai', model, ... }.");
        const pkg = await loadCompanion("@ai-swiss/base-ranker-semantic", "Le précalcul des vecteurs de routage (build routing-embeddings)");
        const embed = embedderCfg.provider === "openai" ? pkg.createOpenAICompatibleEmbedder(embedderCfg) : pkg.createOllamaEmbedder(embedderCfg);
        const vectors = await precomputeRoutingVectors(await inventoryResources(rootDir), embed, { onProgress: reportProgress("embedding") });
        const count = Object.keys(vectors).length;
        if (args.write) output(args.json ? { written: await writeRoutingVectors(rootDir, vectors), count } : `Vecteurs de routage écrits (${count} ressources).`, args.json, context);
        else output(args.json ? { count } : `${count} vecteurs précalculés (dry-run; --write pour écrire .ai/routing/embeddings.json).`, args.json, context);
        return;
      }
      if (!["all", "agents-md", "tools", "bootstrap", "routing-registry", "routing-index"].includes(target)) {
        throw new Error("Usage: base build [all|agents-md|tools|bootstrap|routing-registry|routing-index|routing-embeddings] [--write] [--root path]");
      }
      const artifacts = await buildArtifacts(rootDir, { targets: [target] });
      if (args.write) {
        const written = await writeArtifacts(rootDir, artifacts);
        output(args.json ? { written } : `Artefacts ecrits:\n${written.map((p) => `- ${p}`).join("\n")}`, args.json, context);
      } else {
        output(args.json ? artifacts : formatBuildPlan(artifacts), args.json, context);
      }
      return;
    }

    case "studio": {
      // The workshop in one command. Thin shell: the steps are a pure decision
      // (studioLaunchPlan), dev.mjs remains the single launcher (ports, preflights, URL).
      // Studio's server statically needs the LLM port (chat/settings); check it up front so a missing
      // optional companion prints "install it" instead of crashing the spawned server later.
      await loadCompanion("@ai-swiss/base-llm", "BASE Studio");
      const { studioLaunchPlan } = await import("./studio/launch.mjs");
      const uiDir = path.join(frameworkDir(), "tools", "studio", "ui");
      const hasNodeModules = await fs.access(path.join(uiDir, "node_modules")).then(() => true, () => false);
      const steps = studioLaunchPlan({ uiDir, hasNodeModules, root: path.resolve(rootDir) });
      for (const step of steps) {
        if (step.announce) console.log(step.announce);
        const code = await new Promise((resolve) => {
          spawn(step.command[0], step.command.slice(1), { cwd: step.cwd, stdio: "inherit", shell: process.platform === "win32" })
            .on("exit", resolve)
            .on("error", (error) => {
              console.error(`Impossible de lancer ${step.command.join(" ")} : ${error.message}`);
              resolve(1);
            });
        });
        if (code !== 0) process.exit(code ?? 1);
      }
      return;
    }

    case "doctor": {
      // The corpus health check — dead links, orphans, stale evals, due reviews, expired
      // reference data, open frictions. A pure projection; `entretien` keeps the marker lens.
      const { diagnose, formatDiagnosis } = await import("./doctor/diagnose.mjs");
      const findings = await diagnose(rootDir);
      output(args.json ? findings : formatDiagnosis(findings), args.json, context);
      process.exitCode = findings.some((f) => f.severity === "error") ? 1 : 0;
      return;
    }

    case "entretien": {
      const report = await createMaintenanceReport(rootDir);
      output(args.json ? report : formatMaintenanceReport(report), args.json, context);
      process.exitCode = report.ok ? 0 : 1;
      return;
    }

    case "trace": {
      const subcommand = args.positional[0];
      if (subcommand === "prune" || subcommand === "clear") {
        const options = subcommand === "clear" ? { all: true } : { keepDays: args.keepDays ?? 30 };
        const result = await pruneTrace(rootDir, options);
        output(args.json ? result : formatTracePrune(result), args.json, context);
        return;
      }
      if (subcommand && subcommand !== "summary") {
        throw new Error("Usage: base trace [prune [--keep-days N] | clear | summary] [--root path] [--json]");
      }
      const summary = await summarizeTrace(rootDir);
      output(args.json ? summary : formatTraceSummary(summary), args.json, context);
      return;
    }

    case "docs": {
      const subcommand = args.positional[0] || "model";
      if (!["validate", "model", "serve", "build", "preview"].includes(subcommand)) {
        throw new Error("Usage: base docs [validate|model|serve|build|preview] [--public] [--out dir] [--root path] [--json]");
      }
      const target = args.public ? "public" : ["build", "preview"].includes(subcommand) ? "static" : "local";
      if (subcommand === "validate") {
        const result = await validateDocsModel(rootDir, { target });
        output(args.json ? result : formatDocsModelSummary(result.model), args.json, context);
        process.exitCode = result.ok ? 0 : 1;
        return;
      }
      const result = await writeDocsModel(rootDir, { target, outputDir: subcommand === "model" ? args.out || undefined : undefined });
      if (subcommand === "model") {
        output(args.json ? result.model : formatDocsModelSummary(result), args.json, context);
        return;
      }
      if (subcommand === "preview") {
        // Build the production site (Pagefind indexes the search at build time) then serve it, so
        // search and the deployed look work locally — `serve` (astro dev) cannot index the search.
        output("Construction du site avec l'index de recherche, puis prévisualisation locale…", false, context);
        await runDocsSite(rootDir, "build", result.outputDir, {});
        await runDocsSite(rootDir, "preview", result.outputDir, {});
        return;
      }
      const script = subcommand === "serve" ? "dev" : "build";
      const siteOut = subcommand === "build" && args.out ? path.resolve(args.out) : "";
      const siteLine = siteOut ? `\nSite output: ${path.relative(rootDir, siteOut)}` : "";
      output(`Documentation model ready: ${path.relative(rootDir, result.outputDir)}${siteLine}\nLaunching docs site (${script})...`, false, context);
      await runDocsSite(rootDir, script, result.outputDir, { siteOut });
      return;
    }

    default:
      throw new Error(`Unknown command: ${command}\n\n${help()}`);
  }
}

function selectedRootPath(context) {
  if (context.mode === "root") return context.rootPath;
  if (context.mode === "workspace-root") return context.root.path;
  return null;
}

// Fail loudly with a branded, contextual message instead of a raw ENOENT deep in a walk/read.
async function assertRootExists(rootDir, context) {
  try {
    const stat = await fs.stat(rootDir);
    if (stat.isDirectory()) return;
  } catch {
    // fall through to the branded error below
  }
  const where = context.mode === "workspace-root" ? ` (workspace root "${context.root.id}")` : "";
  throw new Error(`BASE root not found${where}: ${rootDir}`);
}

function output(value, asJson, context) {
  if (asJson) {
    console.log(JSON.stringify(value, null, 2));
  } else {
    const header = context ? formatContextHeader(context, process.cwd()) : "";
    console.log(header ? `${header}\n\n${value}` : value);
  }
}

async function routeAcrossWorkspace(context, request, { limit, configPath } = /** @type {{ limit?: number, configPath?: string }} */ ({})) {
  // Orchestration only: route inside each declared root (an unreachable one degrades gracefully,
  // never aborting the others), then hand the results to the pure cross-root decision in core.
  const attempts = [];
  const unreachable = [];
  for (const root of context.roots) {
    try {
      const config = configPath ? await resolveConfig(root.path, { configPath }) : undefined;
      attempts.push({ root, result: await routeRequest(root.path, request, { limit, config }) });
    } catch (error) {
      unreachable.push({ id: root.id, error: String(error?.message ?? error) });
    }
  }
  return decideWorkspaceRoute(attempts, { request, workspaceScope: contextScope(context), unreachable });
}

async function runDocsSite(rootDir, script, modelDir, { siteOut = "" } = /** @type {{ siteOut?: string }} */ ({})) {
  const siteDir = path.join(rootDir, "packages", "base-docs-site");
  try {
    const stat = await fs.stat(siteDir);
    if (!stat.isDirectory()) throw new Error();
  } catch {
    throw new Error("Docs site package not found: packages/base-docs-site. Run the docs-site implementation step first.");
  }

  await new Promise((resolve, reject) => {
    const child = spawn("npm", ["--prefix", siteDir, "run", script], {
      cwd: rootDir,
      stdio: "inherit",
      env: {
        ...process.env,
        ASTRO_TELEMETRY_DISABLED: "1",
        BASE_DOCS_ROOT: rootDir,
        BASE_DOCS_MODEL_DIR: modelDir,
        ...(siteOut ? { BASE_DOCS_DIST: siteOut } : {}),
      },
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`Docs site ${script} failed${signal ? ` (${signal})` : ""}${code == null ? "" : ` with exit code ${code}`}.`));
    });
  });
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function help() {
  return [
    "BASE CLI",
    "",
    "Usage:",
    " base validate [--root path | --workspace path --root-id id] [--config path] [--json]",
    " base index [--check] [--root path | --workspace path --root-id id] [--json]",
    ' base discover "requete" [--root path | --workspace path --root-id id] [--limit n] [--config path] [--json]',
    ' base route "demande" [--limit n] [--config path] [--root path | --workspace path [--root-id id]] [--json]',
    " base route-test [--from fixtures.json] [--config path] [--root path | --workspace path --root-id id] [--json]",
    " base route-eval [--ollama] [--golden path] [--json]",
    " base inventory [--root path] [--json]",
    " base open <id-or-path> [--projection metadata|instructions|full] [--purpose reason] [--confirmed] [--grant-token token] [--root path] [--json]",
    " base access <id-or-path> [--projection metadata|instructions|full] [--purpose reason] [--confirmed] [--grant-token token] [--root path] [--json]",
    " base invoke <tool-id> [args...] [--execute --confirmed] [--grant-token token] [--root path] [--json]",
    " base propose <target> [--from file] [--purpose reason] [--confirmed] [--grant-token token] [--root path] [--json]",
    " base commit <change-id> [--confirmed] [--grant-token token] [--root path] [--json]",
    " base promote <id-or-path> --to <scope> [--confirmed] [--grant-token token] [--root path] [--json]",
    " base markers [--root path] [--json]",
    " base build [all|agents-md|tools|bootstrap|routing-registry] [--write] [--root path] [--json]",
    " base docs [validate|model|serve|build|preview] [--public] [--out dir] [--root path] [--json]",
    " base entretien [--root path] [--json] (marqueurs ouverts; lens prive, lance par vous, jamais de la telemetrie)",
    " base doctor [--root path] [--json] (sante du corpus: liens morts, orphelines, evals perimees, relectures echues, frictions ouvertes)",
    " base init [--root path] [--yes] [--json] (d'un dossier nu a un BASE: detecte, montre les fichiers a creer, n'ecrit qu'avec --yes)",
    " base studio [--root path] (l'atelier graphique: parcourir, editer, evaluer — installe ses dependances au premier lancement)",
    " base whereis [--json] (ou vit le framework BASE, le fichier de config utilisateur, la version)",
    " base update (met a jour le framework via git, montre la version et ce qui a change)",
    " base trace [prune [--keep-days N] | clear] [--root path] [--json]",
    "",
    `Default: detects the nearest ${WORKSPACE_FILENAME} or BASE root from the current directory and prints the selected context.`,
    "Toute commande accepte --root <path> ou --workspace <path> --root-id <id> pour cibler une racine;",
    "seul `route` cherche EN PLUS entre toutes les racines déclarées quand --root-id est omis.",
    "Principes: local-first, fichiers texte, validation legere, ranking explicable.",
  ].join("\n");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
