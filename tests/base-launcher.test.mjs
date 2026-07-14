// Spec coverage: FR-CLI-001
// The launcher is the runnable handle on the engine: `node .ai/base.mjs <cmd>` must work from any
// project, wherever the framework lives, with nothing on the PATH. Two guarantees here: the
// committed copies never drift from the single source (LAUNCHER_SOURCE), and the script actually
// resolves the engine across its three tiers — explicit config, ancestor discovery, user config —
// and fails LOUDLY (exit 1, a fixable message) when it can't.

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, it } from "node:test";
import { LAUNCHER_SOURCE } from "../tools/core/launcher.mjs";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const frameworkDir = repoRoot; // tools/base.mjs lives at repoRoot/tools/base.mjs

describe("launcher: one source, no drift, present in every example root", () => {
  it("every example root ships the launcher, byte-identical to LAUNCHER_SOURCE (derived from ROOTS, so a deletion cannot pass silently)", async () => {
    // Derive the root list from the tree, not a hand-kept array (the old 4-entry list had already
    // drifted): the repo root, every exemples/<name>/, and the workspace's client roots — each is a
    // self-contained BASE by contract, so a copied folder must answer `node .ai/base.mjs …` alone.
    const { readdir, access } = await import("node:fs/promises");
    const isBaseRoot = async (dir) => {
      for (const marker of ["CLAUDE.md", "base.config.json", "base.workspace.json"]) {
        if (await access(path.join(dir, marker)).then(() => true, () => false)) return true;
      }
      return false;
    };
    const roots = [repoRoot];
    const exemplesDir = path.join(repoRoot, "exemples");
    for (const entry of (await readdir(exemplesDir, { withFileTypes: true })).filter((e) => e.isDirectory())) {
      const dir = path.join(exemplesDir, entry.name);
      if (await isBaseRoot(dir)) roots.push(dir);
      const clients = path.join(dir, "clients");
      try {
        for (const client of (await readdir(clients, { withFileTypes: true })).filter((e) => e.isDirectory())) {
          const clientDir = path.join(clients, client.name);
          if (await isBaseRoot(clientDir)) roots.push(clientDir);
        }
      } catch {
        // no clients/ — a plain example
      }
    }
    assert.ok(roots.length >= 16, `expected ≥ 16 roots (repo + 13 examples + 2 clients), found ${roots.length}`);
    for (const root of roots) {
      const rel = path.relative(repoRoot, path.join(root, ".ai", "base.mjs")) || ".ai/base.mjs";
      const onDisk = await readFile(path.join(root, ".ai", "base.mjs"), "utf8").catch(() => null);
      assert.ok(onDisk !== null, `${rel} is MISSING — every root must ship the launcher (a copied folder answers alone)`);
      assert.equal(onDisk, LAUNCHER_SOURCE, `${rel} drifted from tools/core/launcher.mjs — regenerate it`);
    }
  });
});

describe("launcher: resolves the engine, or fails loudly", () => {
  let project; // a standalone project OUTSIDE the repo, so ancestor discovery cannot find the engine
  let home; // an isolated user-config home

  beforeEach(async () => {
    project = await mkdtemp(path.join(tmpdir(), "launcher-proj-"));
    home = await mkdtemp(path.join(tmpdir(), "launcher-home-"));
    await mkdir(path.join(project, ".ai"), { recursive: true });
    await writeFile(path.join(project, ".ai", "base.mjs"), LAUNCHER_SOURCE);
  });
  afterEach(async () => {
    await rm(project, { recursive: true, force: true });
    await rm(home, { recursive: true, force: true });
  });

  // Run the project's launcher with an EMPTY user-config home unless one is provided.
  const runLauncher = (args, configHome = home) =>
    execFileAsync("node", [path.join(project, ".ai", "base.mjs"), ...args], {
      cwd: project,
      env: { ...process.env, BASE_CONFIG_HOME: configHome },
    });

  it("the committed repo launcher resolves via ancestor discovery (no config at all)", async () => {
    const { stdout } = await execFileAsync("node", [path.join(repoRoot, ".ai", "base.mjs"), "whereis"], {
      cwd: repoRoot,
      env: { ...process.env, BASE_CONFIG_HOME: home }, // empty home: ancestors must carry it
    });
    assert.match(stdout, /BASE \d+\.\d+\.\d+/);
  });

  it("tier 1: framework_dir in the project's base.config.json wins", async () => {
    await writeFile(
      path.join(project, "base.config.json"),
      JSON.stringify({ schema_version: "base.config.v1", framework_dir: frameworkDir }, null, 2),
    );
    const { stdout } = await runLauncher(["whereis"]);
    assert.match(stdout, /BASE \d+\.\d+\.\d+/);
  });

  it("tier 3: the user config resolves it when the project says nothing", async () => {
    await mkdir(path.join(home, ".config", "base"), { recursive: true });
    await writeFile(
      path.join(home, ".config", "base", "config.json"),
      JSON.stringify({ schema_version: "base.user-config.v1", framework_dir: frameworkDir }, null, 2),
    );
    // No base.config.json, project is outside the repo → only the user config can resolve it.
    const { stdout } = await runLauncher(["whereis"]);
    assert.match(stdout, /BASE \d+\.\d+\.\d+/);
  });

  it("forwards arguments and flags to the engine unchanged", async () => {
    await writeFile(
      path.join(project, "base.config.json"),
      JSON.stringify({ schema_version: "base.config.v1", framework_dir: frameworkDir }),
    );
    const { stdout } = await runLauncher([
      "route", "Quelles activités à faire cet après-midi ?", "--root", path.join(repoRoot, "exemples", "veytaux-tourisme"),
    ]);
    assert.match(stdout, /renseigner-un-visiteur/);
  });

  it("no engine anywhere → exit 1 with a fixable message, never a stack trace", async () => {
    // No base.config.json, project outside the repo, empty user-config home.
    await assert.rejects(
      () => runLauncher(["whereis"]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /BASE introuvable/);
        assert.match(error.stderr, /framework_dir/);
        assert.doesNotMatch(error.stderr, /at .*\.mjs:\d+/); // no raw stack trace
        return true;
      },
    );
  });
});
