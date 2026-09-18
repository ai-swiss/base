// Spec coverage: FR-DOCS-002
// Publish smoke for the OPTIONAL documentation site adapter: a team that installed the two published
// packages, and nothing else, must be able to produce the HTML the documentation promises.
//
// It is deliberately NOT part of `smoke:pack` (which stays a fast, dependency-free check of the core
// tarball): this one installs Astro, Starlight and Pagefind from the registry, so it rides the
// release gate (`npm run check:release`). Below Astro's engine floor it skips, honestly, instead of
// failing a suite for a constraint that belongs to the optional layer.

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

const [nodeMajor, nodeMinor] = process.versions.node.split(".").map(Number);
if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 12)) {
  console.log(`Docs pack smoke skipped: the site adapter requires Node >= 22.12 (this runtime is ${process.versions.node}).`);
  process.exit(0);
}

const binPath = (appDir) =>
  process.platform === "win32"
    ? path.join(appDir, "node_modules", ".bin", "base.cmd")
    : path.join(appDir, "node_modules", ".bin", "base");

async function packTo(packDir, cwd) {
  const { stdout } = await execFileAsync("npm", ["pack", "--json", "--pack-destination", packDir], { cwd });
  return JSON.parse(stdout)[0];
}

const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-pack-smoke-docs-"));

try {
  const packDir = path.join(tmpDir, "pack");
  const app = path.join(tmpDir, "docs-app"); // the core PLUS the documentation adapter
  await fs.mkdir(packDir, { recursive: true });
  await fs.mkdir(app, { recursive: true });

  const core = await packTo(packDir, repoRoot);
  const adapter = await packTo(packDir, path.join(repoRoot, "packages", "base-docs-site"));

  // ── The adapter's publish surface ─────────────────────────────────────────────────────────────
  const adapterFiles = new Set(adapter.files.map((file) => file.path));
  for (const required of [
    "package.json",
    "astro.config.mjs",
    "scripts/base-docs-site.mjs",
    "src/lib/model.ts",
    "src/lib/sidebar.mjs",
    "src/components/ResourcePage.astro",
    "src/pages/explorer.astro",
    "README.md",
    "LICENSE",
  ]) {
    assert.ok(adapterFiles.has(required), `the adapter package must include ${required}`);
  }
  for (const file of adapterFiles) {
    for (const [pattern, label] of [
      [/(^|\/)node_modules\//, "node_modules"],
      [/(^|\/)dist\//, "a local build"],
      [/(^|\/)\.astro\//, "the Astro cache"],
      [/\.(test|spec)\.[a-z]+$/, "test/spec files"],
    ]) {
      assert.ok(!pattern.test(file), `forbidden ${label} leaked into the adapter package: ${file}`);
    }
  }

  // ── The team's project: the two packages, installed the way a team installs them ──────────────
  await fs.writeFile(path.join(app, "package.json"), JSON.stringify({ type: "module", private: true }), "utf8");
  await execFileAsync(
    "npm",
    ["install", "--no-audit", "--no-fund", path.join(packDir, core.filename), path.join(packDir, adapter.filename)],
    { cwd: app, timeout: 600000 },
  );

  // One document is a corpus: the adapter renders whatever the model holds, so the smoke stays fast.
  await fs.writeFile(path.join(app, "README.md"), "# Smoke\n\nFront door.\n", "utf8");
  await fs.mkdir(path.join(app, ".ai"), { recursive: true });

  const deployDir = path.join(app, "public-site");
  const build = await execFileAsync(binPath(app), ["docs", "build", "--public", "--out", deployDir], { cwd: app, timeout: 600000 });

  // The launch names the adapter that answered, so support never has to guess which one ran.
  assert.match(build.stdout, /Launching docs site \(build\) via @ai-swiss\/base-docs-site@/);

  const isFile = (...parts) => fs.stat(path.join(deployDir, ...parts)).then((stat) => stat.isFile(), () => false);
  const isDir = (...parts) => fs.stat(path.join(deployDir, ...parts)).then((stat) => stat.isDirectory(), () => false);
  assert.equal(await isFile("index.html"), true, "the promised HTML: a landing page");
  assert.equal(await isFile("explorer", "index.html"), true, "a model-driven page");
  assert.equal(await isFile("resources", "readme", "index.html"), true, "a resource page rendering the root's own file");
  assert.equal(await isFile("en", "index.html"), true, "the bilingual chrome, not a stub");
  assert.equal(await isDir("pagefind"), true, "the search index is built at publish time");

  // Nothing is written inside the installed dependency: the destination is always the caller's.
  const inAdapter = path.join(app, "node_modules", "@ai-swiss", "base-docs-site");
  assert.equal(await fs.stat(path.join(inAdapter, "dist")).then(() => true, () => false), false, "no build output inside node_modules");
  assert.equal(
    await fs.stat(path.join(app, ".base-docs", "public", "model.json")).then((stat) => stat.isFile(), () => false),
    true,
    "the model stays in the root, beside the site it feeds",
  );

  console.log("Docs pack smoke OK (the two published packages render the promised HTML)");
} finally {
  await fs.rm(tmpDir, { recursive: true, force: true });
}
