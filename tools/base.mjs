#!/usr/bin/env node

import * as path from "node:path";
import * as fs from "node:fs/promises";
import { spawn } from "node:child_process";
import {
  buildArtifacts,
  checkManifestFresh,
  commitChange,
  getChangeStatus,
  listPendingChanges,
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
  scaffoldRouteTests,
  searchResources,
  summarizeTrace,
  pruneTrace,
  validateBase,
  writeManifest,
  accessResource,
  confineToRoot,
  contextPack,
  projectResourceMetadata,
  resolveConfig,
  MANIFEST_FILENAME,
} from "./base-core.mjs";
import { formatContextPackSummary } from "./core/formatters.mjs";
import { buildViewArtifacts, viewShortcuts } from "./core/views.mjs";
import { WORKSPACE_FILENAME, contextScope, formatContextHeader, resolveBaseContext } from "./core/roots.mjs";
import { decideWorkspaceRoute } from "./core/route-workspace.mjs";
import { precomputeRoutingVectors, writeRoutingVectors } from "./core/routing-vectors.mjs";
import { reportProgress } from "./core/progress.mjs";
import { loadCompanion } from "./core/companion.mjs";
import { formatDocsModelSummary, validateDocsModel, writeDocsModel } from "./docs/model.mjs";
import { resolveDocsSite, resolveDocsSiteOutput, runDocsSite } from "./docs/site.mjs";
import { parseArgs } from "./cli/parse-args.mjs";
import { formatBuildPlan, formatBuildWrite, formatChangeStatus, formatPendingChanges, formatPromoteResult, formatProposeResult, projectValidationResult } from "./cli/format.mjs";
import { frameworkDir, update, whereis } from "./cli/framework.mjs";
import { runInit, runUpgrade } from "./cli/init.mjs";

// The command table — name → handler({ args, context, rootDir }). The same table-driven
// dispatch the engine uses for its derived artifacts (PROJECTIONS): adding a command is adding
// a row, and main() stays a lookup, not a 300-line switch. Global commands (help, whereis,
// update, init) never require a BASE context and are dispatched before the table.
const COMMANDS = {
  "validate": async ({ args, context, rootDir }) => {
    const config = args.config ? await resolveConfig(rootDir, { configPath: args.config }) : undefined;
    const result = await validateBase(rootDir, config ? { config } : {});
    output(args.json ? projectValidationResult(result) : formatValidationResult(result), args.json, context);
    process.exitCode = result.ok ? 0 : 1;
    return;
  },

  "index": async ({ args, context, rootDir }) => {
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
    output(args.json ? result.manifest : `Manifeste écrit: ${path.relative(rootDir, result.outputPath)}`, args.json, context);
    return;
  },

  "discover": async ({ args, context, rootDir }) => {
    const query = args.positional.join(" ").trim();
    if (!query) throw new Error('Usage: base discover "requete" [--root path]');
    const config = args.config ? await resolveConfig(rootDir, { configPath: args.config }) : undefined;
    const results = await searchResources(rootDir, query, { limit: args.limit, config, grain: args.grain || undefined, scope: args.scope || undefined });
    output(args.json ? results : formatSearchResults(results, query), args.json, context);
    return;
  },

  "route": async ({ args, context, rootDir }) => {
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
  },

  "route-test": async ({ args, context, rootDir }) => {
    if (args.scaffold) {
      const drafted = await scaffoldRouteTests(rootDir, { out: args.out });
      output(
        args.json ? drafted : `${drafted.path} rédigé: ${drafted.cases} cas, un par process.\nRéécrivez chaque «request» dans les mots de vos utilisateurs, puis relancez \`base route-test\`.`,
        args.json,
        context,
      );
      return;
    }
    const config = args.config ? await resolveConfig(rootDir, { configPath: args.config }) : undefined;
    const strategy = args.strategy === "production" ? "production" : "lexical";
    if (args.strategy && !["lexical", "production"].includes(args.strategy)) {
      throw new Error("Usage: base route-test [--from fixtures.json] [--examples] [--strategy lexical|production]");
    }
    const result = await runRouteTests(rootDir, { fixturesPath: args.from || undefined, config, strategy, examples: args.examples });
    output(args.json ? result : formatRouteTestResult(result), args.json, context);
    // Green must not certify a path production does not take: when Voie 2 is configured, say
    // out loud that the fixtures replayed the lexical floor, and how to replay the real path.
    if (!args.json && strategy === "lexical" && result.productionStrategy === "embedding") {
      console.error("⚠ Voie 2 est configurée: ces fixtures certifient le plancher lexical, pas le chemin embeddings que prend «base route». Rejouez avec --strategy production pour certifier le chemin réel (appels modèle).");
    }
    process.exitCode = result.ok ? 0 : 1;
    return;
  },

  "route-eval": async ({ args, context, rootDir }) => {
    // The LABELED routing eval — an HONEST STRUCTURAL SIGNAL, not a model-performance target. Its
    // headline is recall@k (does retrieval surface the right candidate? — model-independent), with a
    // per-model refiner diagnostic alongside (the over-routes vs over-asks shape). Both need a real
    // embedder, so the eval is Ollama-gated: `--ollama` runs it (skipped cleanly if Ollama is absent);
    // without it, the default path prints the header + how to run, never a slow model round-trip. It
    // It measures the SELECTED root when that root carries a labelled set (`.ai/routing/route-eval-golden.json`,
    // or `--golden <path>` relative to it); otherwise the framework's own set over its example corpus,
    // and the report says which. If both `--from` and `--golden` are given, `--from` wins.
    const { runRouteEvalCli } = await import("./eval/route-eval-cli.mjs");
    const withOllama = args.ollama === true;
    const goldenPath = args.from || args.golden || undefined;
    const { result, text } = await runRouteEvalCli({ frameworkRoot: frameworkDir(), rootDir, goldenPath, withOllama });
    output(args.json ? result : text, args.json, context);
    return;
  },

  "inventory": async ({ args, context, rootDir }) => {
    const resources = await inventoryResources(rootDir);
    output(args.json ? resources.map(projectResourceMetadata) : resources.map((resource) => `${resource.id}\t${resource.type}\t${resource.path}`).join("\n"), args.json, context);
    return;
  },

  "open": async ({ args, context, rootDir }) => {
    const idOrPath = args.positional[0];
    if (!idOrPath) throw new Error("Usage: base open <id-or-path[#ancre]> [--section ancre] [--lang xx] [--projection metadata|instructions|full|outline|source] [--root path]");
    const result = await openResource(rootDir, idOrPath, {
      projection: args.projection,
      section: args.section || undefined,
      lang: args.lang || undefined,
      purpose: args.purpose,
      confirmed: args.confirmed,
      grantToken: args.grantToken,
    });
    output(args.json ? result : result.content, args.json, context);
    return;
  },

  "context": async ({ args, context, rootDir }) => {
    const idOrPath = args.positional[0];
    if (!idOrPath) throw new Error("Usage: base context <process-id-or-path> [--root path] [--json]");
    const summary = await contextPack(rootDir, idOrPath, {});
    output(args.json ? summary : formatContextPackSummary(summary, idOrPath), args.json, context);
    return;
  },

  "access": async ({ args, context, rootDir }) => {
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
  },

  "invoke": async ({ args, context, rootDir }) => {
    const [idOrPath, ...toolArgs] = args.positional;
    if (!idOrPath) throw new Error("Usage: base invoke <tool-id> [args...] [--execute --confirmed] [--root path]");
    const result = await invokeTool(rootDir, idOrPath, toolArgs, {
      dryRun: !args.execute,
      confirmed: args.confirmed,
      grantToken: args.grantToken,
    });
    output(args.json ? result : JSON.stringify(result, null, 2), args.json, context);
    return;
  },

  "propose": async ({ args, context, rootDir }) => {
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
  },

  "commit": async ({ args, context, rootDir }) => {
    const changeId = args.positional[0];
    if (!changeId) throw new Error("Usage: base commit <change-id> [--confirmed] [--root path]");
    const result = await commitChange(rootDir, changeId, { confirmed: args.confirmed, grantToken: args.grantToken });
    output(args.json ? result : `Changement applique: ${result.target} (${result.decision.decision})`, args.json, context);
    return;
  },

  "changes": async ({ args, context, rootDir }) => {
    // Local-first view of the mediated-write flow (pending proposals, or one change_id's status). The
    // unfakeable proof a write LANDED is commit's content_hash; this is the pending-side view.
    const id = args.positional[0];
    const result = id ? await getChangeStatus(rootDir, id) : await listPendingChanges(rootDir);
    output(args.json ? result : id ? formatChangeStatus(result) : formatPendingChanges(result), args.json, context);
    return;
  },

  "promote": async ({ args, context, rootDir }) => {
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
  },

  "markers": async ({ args, context, rootDir }) => {
    const markers = await listMarkers(rootDir);
    output(args.json ? markers : formatMarkers(markers), args.json, context);
    return;
  },

  "build": async ({ args, context, rootDir }) => {
    const target = args.positional[0] || "all";
    if (target === "routing-embeddings") {
      // Precompute the routing vectors — opt-in, model-backed — with the SAME model reference the
      // query path reads (`routing.embedding_model`, panneau Routage du Studio): one vocabulary,
      // one place, one shared provider registry (`resolveEmbedder`, exactly as at route time).
      const { readSettings, resolveEmbedder } = await import("./core/model-settings.mjs");
      const embedderRef = (await readSettings(rootDir)).routing?.embedding_model;
      if (!embedderRef) throw new Error("routing-embeddings: configurez routing.embedding_model dans .ai/studio.settings.json (panneau Routage du Studio): la même référence <provider>/<modèle> que la requête utilise.");
      await loadCompanion("@ai-swiss/base-ranker-semantic", "Le précalcul des vecteurs de routage (build routing-embeddings)");
      const embed = await resolveEmbedder(rootDir, embedderRef);
      const { vectors, skippedConfidential } = await precomputeRoutingVectors(await inventoryResources(rootDir), embed, { onProgress: reportProgress("embedding") });
      const count = Object.keys(vectors).length;
      const confidentialNote = skippedConfidential ? ` ${skippedConfidential} ressource(s) confidentielle(s) non embarquée(s): leur texte de routage ne part jamais vers un embedder.` : "";
      if (args.write) output(args.json ? { written: await writeRoutingVectors(rootDir, vectors, { embedder: embedderRef }), count, skippedConfidential } : `Vecteurs de routage écrits (${count} ressources, embedder ${embedderRef}).${confidentialNote}`, args.json, context);
      else output(args.json ? { count, skippedConfidential } : `${count} vecteurs précalculés (dry-run; --write pour écrire .ai/routing/embeddings.json).${confidentialNote}`, args.json, context);
      return;
    }
    if (!["all", "agents-md", "tools", "bootstrap", "routing-index"].includes(target)) {
      throw new Error("Usage: base build [all|agents-md|tools|bootstrap|routing-index|routing-embeddings] [--write] [--root path]");
    }
    const artifacts = await buildArtifacts(rootDir, { targets: [target] });
    if (args.write) {
      const result = await writeArtifacts(rootDir, artifacts);
      output(args.json ? result : formatBuildWrite(result), args.json, context);
    } else {
      output(args.json ? artifacts : formatBuildPlan(artifacts), args.json, context);
    }
    return;
  },

  "view": async ({ args, context, rootDir }) => {
    // A named door onto part of this root: `base view support` shows what it would write,
    // `--write` writes it, `--shell` prints the line that opens it in your tool.
    const name = args.positional[0];
    const cfg = await resolveConfig(rootDir);
    const views = cfg.views ?? {};
    const declared = Object.keys(views);
    if (!name) {
      throw new Error(declared.length
        ? `Usage: base view <nom> [--write] [--shell]. Vues déclarées: ${declared.join(", ")}.`
        : "Aucune vue déclarée. Ajoutez `views` à base.config.json: { \"views\": { \"support\": { \"entry\": \"<agent>\", \"agents\": [\"<agent>\"], \"include\": [\"<dossier>\"] } } }");
    }
    const view = views[name];
    if (!view) throw new Error(`Vue inconnue: ${name}. Déclarées: ${declared.join(", ") || "aucune"}.`);

    const resources = await inventoryResources(rootDir);
    const missing = view.agents.filter((id) => !resources.some((r) => r.type === "agent" && r.id === id));
    const artifacts = buildViewArtifacts(name, view, { resources, tools: cfg.tools ?? [], lang: cfg.language });
    const shortcuts = viewShortcuts(name, rootDir, cfg.tools ?? []);

    if (args.shell) {
      output(args.json ? { view: name, shortcuts } : shortcuts.map((s) => `${s.line}\n# ${s.note}`).join("\n\n"), args.json, context);
      return;
    }
    if (!args.write) {
      const preview = artifacts.map((a) => `  ${a.path} (${a.content.length} caractères)`).join("\n");
      output(
        args.json ? { view: name, plan: artifacts.map((a) => a.path), missing } : [
          `Vue «${name}» (rien n'est écrit sans --write):`,
          preview,
          missing.length ? `\nAgents déclarés introuvables: ${missing.join(", ")}` : "",
          `\nPour appliquer:  base view ${name} --write${args.root ? ` --root ${args.root}` : ""}`,
          `Pour le raccourci:  base view ${name} --shell${args.root ? ` --root ${args.root}` : ""}`,
        ].join("\n"),
        args.json,
      );
      return;
    }
    const result = await writeArtifacts(rootDir, artifacts);
    output(args.json ? { view: name, ...result, missing } : formatBuildWrite(result) + (missing.length ? `\n\nAgents déclarés introuvables: ${missing.join(", ")}` : ""), args.json, context);
    return;
  },

  "studio": async ({ args, context, rootDir }) => {
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
  },

  "doctor": async ({ args, context, rootDir }) => {
    // The corpus health check — dead links, orphans, stale evals, due reviews, expired reference
    // data, open frictions, weak routing, missing descriptions, dormant markers. A pure projection;
    // the raw marker QUERY stays with `base markers`.
    const { diagnose, formatDiagnosis } = await import("./doctor/diagnose.mjs");
    const findings = await diagnose(rootDir);
    output(args.json ? findings : formatDiagnosis(findings), args.json, context);
    process.exitCode = findings.some((f) => f.severity === "error") ? 1 : 0;
    return;
  },


  "trace": async ({ args, context, rootDir }) => {
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
  },

  "docs": async ({ args, context, rootDir }) => {
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
    if (subcommand === "model") {
      const result = await writeDocsModel(rootDir, { target, outputDir: args.out || undefined });
      output(args.json ? result.model : formatDocsModelSummary(result), args.json, context);
      return;
    }
    // The adapter is resolved BEFORE the corpus is walked: an optional package that is not installed,
    // or a Node below Astro's floor, is answered in one line instead of after a build nobody can render.
    const site = await resolveDocsSite(rootDir);
    const result = await writeDocsModel(rootDir, { target });
    // Always an explicit destination inside the ROOT (`.base-docs/` is git-ignored): the adapter may
    // be installed under node_modules, and a default that wrote there would write into a dependency.
    const siteOut = subcommand === "serve"
      ? ""
      : resolveDocsSiteOutput(rootDir, args.out, path.join(result.outputDir, "site"));
    if (subcommand === "preview") {
      console.error(
        "Attention: «base docs preview» est déprécié. Lancez «base docs build --out <dossier>», puis servez ce dossier avec le serveur statique de votre choix.",
      );
      // Build the production site (Pagefind indexes the search at build time) then serve it, so
      // search and the deployed look work locally — `serve` (astro dev) cannot index the search.
      output("Construction du site avec l'index de recherche, puis prévisualisation locale…", false, context);
      await runDocsSite(site, { command: "build", root: rootDir, modelDir: result.outputDir, siteOut });
      await runDocsSite(site, { command: "preview", root: rootDir, modelDir: result.outputDir, siteOut });
      return;
    }
    const command = subcommand === "serve" ? "dev" : "build";
    const siteLine = siteOut ? `\nSite output: ${path.relative(rootDir, siteOut)}` : "";
    output(`Documentation model ready: ${path.relative(rootDir, result.outputDir)}${siteLine}\nLaunching docs site (${command}) via ${site.id}...`, false, context);
    await runDocsSite(site, { command, root: rootDir, modelDir: result.outputDir, siteOut });
    return;
  },
};

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
    const channel = args.channel === "main" ? "main" : "stable";
    if (args.channel && args.channel !== "main" && args.channel !== "stable") {
      throw new Error("Usage: base update [--channel stable|main]");
    }
    await update({ channel });
    return;
  }
  // init CREATES a BASE, so it must run on a directory that is not one yet — it resolves its own
  // target (--root or the cwd) and never goes through the strict context resolution below.
  if (command === "init") {
    await runInit(args, output);
    return;
  }
  if (command === "upgrade") {
    await runUpgrade(args, output);
    return;
  }

  const context = await resolveBaseContext({
    explicitRoot: args.root,
    explicitWorkspace: args.workspace,
    rootId: args.rootId,
    allowWorkspaceRouting: command === "route",
  });
  for (const warning of context.workspace?.warnings ?? []) {
    console.error(`Attention: ${warning.message}`);
  }
  const rootDir = selectedRootPath(context);
  if (rootDir) await assertRootExists(rootDir, context);
  // Don't silently mis-target: --root-id only means something inside a workspace. Warn loudly so a
  // user who forgot --workspace doesn't believe they targeted a specific root when they didn't.
  if (args.rootId && context.mode === "root") {
    console.error(`Attention: --root-id "${args.rootId}" ignoré (aucun workspace). Ajoutez --workspace <fichier> pour sélectionner une racine.`);
  }

  const run = COMMANDS[command];
  if (!run) throw new Error(`Unknown command: ${command}\n\n${help()}`);
  await run({ args, context, rootDir });
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
    " base route-test [--from fixtures.json] [--examples] [--scaffold [--out fichier]] [--strategy lexical|production] [--config path] [--root path | --workspace path --root-id id] [--json]",
    "   (--examples rejoue les routing.examples déclarés dans les frontmatter, sans fichier de fixtures: le garde anti-dérive des formulations d'auteur)",
    " base route-eval [--ollama] [--golden path] [--json]",
    " base inventory [--root path] [--json]",
    " base open <id-or-path> [--projection metadata|instructions|full] [--purpose reason] [--confirmed] [--grant-token token] [--root path] [--json]",
    " base context <process-id-or-path> [--root path] [--json] (quoi precharger pour ce process: chemins et notes, jamais les corps)",
    " base access <id-or-path> [--projection metadata|instructions|full] [--purpose reason] [--confirmed] [--grant-token token] [--root path] [--json]",
    " base invoke <tool-id> [args...] [--execute --confirmed] [--grant-token token] [--root path] [--json]",
    " base propose <target> [--from file] [--purpose reason] [--confirmed] [--grant-token token] [--root path] [--json]",
    " base commit <change-id> [--confirmed] [--grant-token token] [--root path] [--json]",
    " base changes [<change-id>] [--root path] [--json] (changements proposés en attente de commit; avec un id: l'état de ce changement)",
    " base promote <id-or-path> --to <scope> [--confirmed] [--grant-token token] [--root path] [--json]",
    " base markers [--root path] [--json]",
    " base build [all|agents-md|tools|bootstrap|routing-index|routing-embeddings] [--write] [--root path] [--json]",
    "   (routing-index régénère .ai/routing/index.md et les index par agent, la carte que lit votre outil IA: à relancer après tout ajout ou retrait de process)",
    " base docs [validate|model|serve|build|preview] [--public] [--out dir] [--root path] [--json] (preview est déprécié; préférez build puis un serveur statique)",
    " base doctor [--root path] [--json] (santé du corpus: liens morts, orphelines, évals périmées, relectures échues, frictions ouvertes)",
    " base init [--root path] [--tool claude-code|cursor|agents-md|autre] [--about \"…\"] [--language code] [--egress local-only|any] [--yes] [--json] (d'un dossier nu à un BASE: détecte, montre les fichiers à créer, n'écrit qu'avec --yes)",
    " base upgrade [--root path] [--write] [--json] (aligne un dossier créé par une version antérieure)",
    " base studio [--root path] (l'atelier graphique: parcourir, éditer, évaluer — installe ses dépendances au premier lancement)",
    " base whereis [--json] (où vit le framework BASE, le fichier de config utilisateur, la version)",
    " base update [--channel stable|main] (met à jour le framework: canal stable = dernier tag de version; main = tête de branche)",
    " base trace [prune [--keep-days N] | clear] [--root path] [--json]",
    "",
    `Défaut: détecte le ${WORKSPACE_FILENAME} ou la racine BASE la plus proche du dossier courant et affiche le contexte retenu.`,
    "Toute commande accepte --root <path> ou --workspace <path> --root-id <id> pour cibler une racine;",
    "seul `route` cherche EN PLUS entre toutes les racines déclarées quand --root-id est omis.",
    "Principes: local-first, fichiers texte, validation légère, ranking explicable.",
  ].join("\n");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
