// Spec coverage: FR-CLI-001 UR-CORE-002 FR-INIT-004
// `base init` end to end, as a subprocess: the dry-run writes NOTHING, --yes writes the plan,
// a second --yes finds a BASE and stays put. The CLI is a thin adapter — these tests cover the
// adapter wiring; the decision logic has its own unit tests (base-perimeter.test.mjs).

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const cliPath = path.resolve("tools/base.mjs");
let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-init-cli-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// A throwaway home so init's framework registration never touches the real ~/.config.
const run = (...args) =>
  execFileAsync("node", [cliPath, ...args, "--root", tmpDir], { env: { ...process.env, BASE_CONFIG_HOME: tmpDir } });

describe("base init (CLI)", () => {
  it("dry-run shows the plan and writes nothing", async () => {
    await fs.writeFile(path.join(tmpDir, "notes.md"), "# Notes");
    const { stdout } = await run("init");
    assert.match(stdout, /Fichiers à créer/);
    assert.match(stdout, /AGENT\.md/);
    await assert.rejects(() => fs.access(path.join(tmpDir, ".ai")));
  });

  it("--yes applies, then a re-run finds a complete BASE and changes nothing", async () => {
    await fs.writeFile(path.join(tmpDir, "notes.md"), "# Notes");
    const { stdout } = await run("init", "--yes");
    assert.match(stdout, /fichiers créés/);
    assert.match(stdout, /artefacts d'outils/);
    // Every door of the epilogue is printed: the AI tool, the MCP guarantees, the workshop.
    assert.match(stdout, /importer mes procédures existantes/);
    assert.match(stdout, /installer-mcp\.md/);
    assert.match(stdout, /studio --root/);
    const [agentDir] = await fs.readdir(path.join(tmpDir, ".ai", "agents"));
    const agent = await fs.readFile(path.join(tmpDir, ".ai", "agents", agentDir, "AGENT.md"), "utf8");
    assert.match(agent, /type: agent/);
    // The folder speaks to AI tools the moment init finishes.
    assert.match(await fs.readFile(path.join(tmpDir, "CLAUDE.md"), "utf8"), /point d'entrée pour Claude Code/);
    await fs.access(path.join(tmpDir, ".cursor", "rules", "assistant.mdc"));

    // The project records where the engine lives, and gets a runnable handle on it.
    const config = JSON.parse(await fs.readFile(path.join(tmpDir, "base.config.json"), "utf8"));
    assert.ok(config.framework_dir, "base.config.json records framework_dir");
    assert.match(await fs.readFile(path.join(tmpDir, ".ai", "base.mjs"), "utf8"), /BASE launcher/);
    // …and it actually runs: `node .ai/base.mjs whereis` resolves the engine via framework_dir.
    const viaLauncher = await execFileAsync("node", [path.join(tmpDir, ".ai", "base.mjs"), "whereis"], {
      cwd: tmpDir,
      env: { ...process.env, BASE_CONFIG_HOME: tmpDir },
    });
    assert.match(viaLauncher.stdout, /BASE \d+\.\d+\.\d+/);

    const again = await run("init", "--yes");
    assert.match(again.stdout, /Déjà un BASE/);
  });

  it("an existing root missing its artifacts gets exactly the missing ones, nothing touched", async () => {
    await fs.mkdir(path.join(tmpDir, ".ai", "agents", "demo"), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, ".ai", "agents", "demo", "AGENT.md"),
      "---\nschema_version: base.resource.v1\nid: demo\ntype: agent\ntitle: Demo\ndescription: D.\n---\n# Demo\n",
    );
    await fs.writeFile(path.join(tmpDir, "CLAUDE.md"), "mon CLAUDE.md personnalisé\n");

    const dry = await run("init", "--json");
    const parsed = JSON.parse(dry.stdout.slice(dry.stdout.indexOf("{")));
    assert.equal(parsed.detection.type, "root");
    const planned = parsed.plan.map((e) => e.path);
    assert.ok(!planned.includes("CLAUDE.md")); // existing file: never in the plan
    assert.ok(planned.includes("AGENTS.md"));
    assert.ok(planned.includes(".ai/base.mjs"), "an existing root missing its launcher gets it healed");

    await run("init", "--yes");
    // The customised file survived; the missing artifacts (catalogue + launcher) landed.
    assert.equal(await fs.readFile(path.join(tmpDir, "CLAUDE.md"), "utf8"), "mon CLAUDE.md personnalisé\n");
    assert.match(await fs.readFile(path.join(tmpDir, "AGENTS.md"), "utf8"), /demo/);
    assert.match(await fs.readFile(path.join(tmpDir, ".ai", "base.mjs"), "utf8"), /BASE launcher/);
  });

  it("a collection of roots gets a workspace file (--json exposes the plan)", async () => {
    for (const client of ["client-a", "client-b"]) {
      await fs.mkdir(path.join(tmpDir, client, ".ai", "agents", "x"), { recursive: true });
      await fs.writeFile(
        path.join(tmpDir, client, ".ai", "agents", "x", "AGENT.md"),
        "---\nid: x\ntype: agent\ndescription: X.\n---\n# X\n",
      );
    }
    const dry = await run("init", "--json");
    const parsed = JSON.parse(dry.stdout.slice(dry.stdout.indexOf("{")));
    assert.equal(parsed.detection.type, "collection");
    assert.equal(parsed.plan[0].path, "base.workspace.json");
    assert.equal(parsed.applied, false);

    await run("init", "--yes");
    const ws = JSON.parse(await fs.readFile(path.join(tmpDir, "base.workspace.json"), "utf8"));
    assert.equal(ws.roots.length, 2);
  });

  it("init registers the framework location, and whereis reads it back", async () => {
    await fs.writeFile(path.join(tmpDir, "notes.md"), "# Notes");
    const { stdout } = await run("init", "--yes");
    assert.match(stdout, /BASE enregistré dans/);

    // The user-global config now points at this framework — modifiable by hand.
    const cfg = JSON.parse(await fs.readFile(path.join(tmpDir, ".config", "base", "config.json"), "utf8"));
    assert.equal(cfg.schema_version, "base.user-config.v1");
    // framework_dir is the framework root this CLI belongs to, resolved from the CLI's own
    // location. Assert that invariant, not the maintainer's checkout directory name.
    assert.equal(cfg.framework_dir, path.dirname(path.dirname(cliPath)));

    // whereis (a global command, runs from anywhere) reads it back.
    const { stdout: w } = await execFileAsync("node", [cliPath, "whereis", "--json"], {
      cwd: os.tmpdir(),
      env: { ...process.env, BASE_CONFIG_HOME: tmpDir },
    });
    const seen = JSON.parse(w);
    assert.equal(seen.registered, true);
    assert.equal(seen.frameworkDir, cfg.framework_dir);
    assert.match(seen.version, /\d+\.\d+\.\d+/);
  });
});
