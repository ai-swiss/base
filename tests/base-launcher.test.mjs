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

describe("launcher: one source, no drift", () => {
  it("every committed .ai/base.mjs is byte-identical to LAUNCHER_SOURCE", async () => {
    const committed = [
      ".ai/base.mjs",
      "exemples/veytaux-tourisme/.ai/base.mjs",
      "exemples/starter-perso/.ai/base.mjs",
      "exemples/agence-multi-clients/.ai/base.mjs",
    ];
    for (const rel of committed) {
      const onDisk = await readFile(path.join(repoRoot, rel), "utf8");
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
