import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-pack-smoke-"));

const binPath = (appDir) =>
  process.platform === "win32"
    ? path.join(appDir, "node_modules", ".bin", "base.cmd")
    : path.join(appDir, "node_modules", ".bin", "base");

async function packTo(packDir, cwd) {
  const { stdout } = await execFileAsync("npm", ["pack", "--json", "--pack-destination", packDir], { cwd });
  return JSON.parse(stdout)[0];
}

try {
  const packDir = path.join(tmpDir, "pack");
  const coreApp = path.join(tmpDir, "core-app"); // the core ALONE, no companions
  const fullApp = path.join(tmpDir, "full-app"); // the core PLUS every optional companion
  await fs.mkdir(packDir, { recursive: true });
  await fs.mkdir(coreApp, { recursive: true });
  await fs.mkdir(fullApp, { recursive: true });

  const packed = await packTo(packDir, repoRoot);
  const rootFiles = new Set(packed.files.map((file) => file.path));

  // Fail-closed publish surface: the tarball must NOT carry dev/test/build artifacts. A
  // presence-only smoke test once let 6953 files (incl. the UI dev tree) through; these
  // assertions are the fitness function that keeps the surface clean forever.
  const FORBIDDEN = [
    [/(^|\/)node_modules\//, "node_modules"],
    [/\/\.run/, "e2e .run* fixtures"],
    [/\.(test|spec)\.[a-z]+$/, "test/spec files"],
    [/(^|\/)test-results\//, "test-results"],
    [/(^|\/)playwright-report\//, "playwright-report"],
    [/(^|\/)coverage\//, "coverage output"],
    [/(^|\/)dist\//, "build dist"],
    [/\/\.ai\/experiments\/(runs|reports)\//, "eval run/report dev artifacts"],
    [/\/\.ai\/studio\.settings\.json$/, "studio machine-state settings"],
    [/\/\.ai\/trace\//, "trace logs"],
    [/\/\.ai\/changes\//, "pending change records"],
  ];
  for (const file of rootFiles) {
    for (const [pattern, label] of FORBIDDEN) {
      assert.ok(!pattern.test(file), `forbidden ${label} leaked into the package: ${file}`);
    }
  }
  assert.ok(rootFiles.size < 800, `package file count regressed (${rootFiles.size}); the dev tree may be leaking`);
  // The core ships NO companion package source: the optional packages travel as separate, on-demand peers.
  for (const file of rootFiles) {
    assert.ok(!/(^|\/)packages\//.test(file), `the core tarball must not bundle a companion package: ${file}`);
  }

  for (const required of [
    ".ai/agents/createur-agent/AGENT.md",
    ".ai/agents/concierge-base/AGENT.md",
    ".ai/agents/_template/AGENT.md",
    ".ai/routing/index.md",
    "base.config.json",
    "SECURITY.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "MANIFESTO.md",
    "CLAUDE.md",
  ]) {
    assert.ok(rootFiles.has(required), `packed root package must include ${required}`);
  }

  const tarball = path.join(packDir, packed.filename);
  const companions = {};
  for (const [name, dir] of [
    ["base-ranker-semantic", "packages/base-ranker-semantic"],
    ["base-index-local", "packages/base-index-local"],
    ["base-llm", "packages/base-llm"],
    ["base-eval", "packages/base-eval"],
  ]) {
    companions[name] = path.join(packDir, (await packTo(packDir, path.join(repoRoot, dir))).filename);
  }

  // ── Scenario 1: the core installs and runs ALONE, with ZERO companions ─────────────────────────
  // This is the regression the relative-path imports caused: `base validate` loaded the engine graph,
  // which statically pulled a companion that the tarball does not ship. The core must run on bare node.
  await fs.writeFile(path.join(coreApp, "package.json"), JSON.stringify({ type: "module", private: true }), "utf8");
  await execFileAsync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], { cwd: coreApp });

  await fs.writeFile(path.join(coreApp, "README.md"), "# Smoke\n", "utf8");
  await fs.mkdir(path.join(coreApp, ".ai"), { recursive: true });
  const validate = await execFileAsync(binPath(coreApp), ["validate"], { cwd: coreApp });
  assert.match(validate.stdout, /BASE valide/);

  // The documentation SITE is an optional companion (Astro, Starlight, Pagefind: ~180 MB), so the
  // core alone cannot render HTML. It must say WHICH package to install, before walking any corpus,
  // and never name a path that exists only in a contributor checkout (the bug this pins).
  const docsBuild = await execFileAsync(binPath(coreApp), ["docs", "build"], { cwd: coreApp }).then(
    () => assert.fail("`base docs build` must fail when @ai-swiss/base-docs-site is not installed"),
    (error) => error,
  );
  assert.match(docsBuild.stderr, /@ai-swiss\/base-docs-site, qui n'est pas installé/);
  assert.match(docsBuild.stderr, /npm install @ai-swiss\/base-docs-site/);
  assert.doesNotMatch(docsBuild.stderr, /packages\/base-docs-site/, "the refusal must not point at the contributor tree");
  assert.equal(
    await fs.stat(path.join(coreApp, ".base-docs")).then(() => true, () => false),
    false,
    "the refusal comes BEFORE the model is written: nothing half-built is left behind",
  );

  const coreCheck = await execFileAsync("node", [
    "--input-type=module",
    "-e",
    [
      "import { ROUTING_DEFAULTS } from '@ai-swiss/base/routing';",
      "import { WORKSPACE_FILENAME, resolveBaseContext } from '@ai-swiss/base/roots';",
      "import { compareByCodePoint } from '@ai-swiss/base/ordering';",
      // The documentation adapter renders anchors with THIS function: the published core must expose
      // it, or the site would grow a second slug implementation and deep links would drift.
      "import { slugifyText } from '@ai-swiss/base/docs-model';",
      "import { readFileSync } from 'node:fs';",
      "const schema = JSON.parse(readFileSync(new URL(import.meta.resolve('@ai-swiss/base/routing-schema')), 'utf8'));",
      "const wsSchema = JSON.parse(readFileSync(new URL(import.meta.resolve('@ai-swiss/base/workspace-schema')), 'utf8'));",
      "const cfgSchema = JSON.parse(readFileSync(new URL(import.meta.resolve('@ai-swiss/base/config-schema')), 'utf8'));",
      "if (ROUTING_DEFAULTS.floor_score !== 30) throw new Error('bad routing export');",
      "if (compareByCodePoint('z', '\\u00e9') !== -1) throw new Error('bad ordering export');",
      "if (slugifyText('Démarrer vite !') !== 'demarrer-vite') throw new Error('bad docs-model export');",
      "if (WORKSPACE_FILENAME !== 'base.workspace.json' || typeof resolveBaseContext !== 'function') throw new Error('bad roots export');",
      "if (schema.properties.schema_version.const !== 'base.routing.v1') throw new Error('bad schema export');",
      "if (wsSchema.properties.schema_version.const !== 'base.workspace.v1') throw new Error('bad workspace-schema export');",
      "if (!cfgSchema.properties.routing.properties.fallback) throw new Error('bad config-schema export');",
      "console.log('core exports ok');",
    ].join(" "),
  ], { cwd: coreApp });
  assert.match(coreCheck.stdout, /core exports ok/);

  // ── Scenario 2: with every optional companion installed, the feature surface resolves ──────────
  await fs.writeFile(path.join(fullApp, "package.json"), JSON.stringify({ type: "module", private: true }), "utf8");
  await execFileAsync(
    "npm",
    [
      "install", "--ignore-scripts", "--no-audit", "--no-fund",
      tarball,
      companions["base-ranker-semantic"],
      companions["base-index-local"],
      companions["base-llm"],
      companions["base-eval"],
    ],
    { cwd: fullApp },
  );

  const fullCheck = await execFileAsync("node", [
    "--input-type=module",
    "-e",
    [
      "import { createSemanticRanker, createBatchingEmbedder, SemanticConfigError } from '@ai-swiss/base-ranker-semantic';",
      "import { buildIndex, routeWithIndex, vectorFor } from '@ai-swiss/base-index-local';",
      "import { createFauxModel, getText, completeJson, extractJson } from '@ai-swiss/base-llm';",
      "import { runScenario, createLlmEvaluator, extractJson as evalExtractJson } from '@ai-swiss/base-eval';",
      "if (typeof createSemanticRanker !== 'function' || typeof createBatchingEmbedder !== 'function') throw new Error('bad semantic package export');",
      "if (new SemanticConfigError('x').code !== 'semantic.config') throw new Error('bad typed error export');",
      "if (typeof buildIndex !== 'function' || typeof routeWithIndex !== 'function' || typeof vectorFor !== 'function') throw new Error('bad index package export');",
      "if (typeof completeJson !== 'function' || typeof extractJson !== 'function' || typeof getText !== 'function' || typeof createFauxModel !== 'function') throw new Error('bad base-llm export');",
      "if (typeof runScenario !== 'function' || typeof createLlmEvaluator !== 'function' || typeof evalExtractJson !== 'function') throw new Error('bad base-eval export (incl. re-exported extractJson)');",
      "console.log('companion exports ok');",
    ].join(" "),
  ], { cwd: fullApp });
  assert.match(fullCheck.stdout, /companion exports ok/);

  console.log("Pack smoke OK (core runs alone; companions resolve when present)");
} finally {
  await fs.rm(tmpDir, { recursive: true, force: true });
}
