// Spec coverage: FR-CLI-001 FR-CLI-002 UR-CORE-002 FR-INIT-002 FR-INIT-004
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
import { inventoryResources } from "../tools/base-core.mjs";
import { checkEgress } from "../tools/core/egress.mjs";

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
    assert.ok(stdout.includes(`--root ${tmpDir}`), "the apply hint echoes --root so it is copy-paste safe");
    await assert.rejects(() => fs.access(path.join(tmpDir, ".ai")));
  });

  it("--yes applies, then a re-run finds a complete BASE and changes nothing", async () => {
    await fs.writeFile(path.join(tmpDir, "notes.md"), "# Notes");
    const { stdout } = await run("init", "--tool", "claude-code", "--yes");
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
    // …and ONLY that tool's entry point: a folder does not receive the files of tools nobody named.
    await assert.rejects(() => fs.access(path.join(tmpDir, ".cursor", "rules", "assistant.mdc")));
    await assert.rejects(() => fs.access(path.join(tmpDir, "AGENTS.md")));

    // The project does NOT record an absolute path from this machine when the user-global config
    // already answers where the engine lives: a shared file stops naming somebody's home directory,
    // and the launcher reads that config next.
    const config = JSON.parse(await fs.readFile(path.join(tmpDir, "base.config.json"), "utf8"));
    assert.equal(config.framework_dir, undefined, "the shared file carries no machine-specific path");
    const userConfig = JSON.parse(await fs.readFile(path.join(tmpDir, ".config", "base", "config.json"), "utf8"));
    assert.ok(userConfig.framework_dir, "the engine location lives in the user-global config instead");
    assert.match(await fs.readFile(path.join(tmpDir, ".ai", "base.mjs"), "utf8"), /BASE launcher/);
    // …and it actually runs: `node .ai/base.mjs whereis` resolves the engine via framework_dir.
    const viaLauncher = await execFileAsync("node", [path.join(tmpDir, ".ai", "base.mjs"), "whereis"], {
      cwd: tmpDir,
      env: { ...process.env, BASE_CONFIG_HOME: tmpDir },
    });
    assert.match(viaLauncher.stdout, /BASE \d+\.\d+\.\d+/);

    // Healing an existing root never ADDS the entry point of a tool its owner did not choose.
    const again = await run("init", "--yes");
    assert.match(again.stdout, /Déjà un BASE/);
  });

  it("leaves a fresh root a door, on its map and for a deterministic caller", async () => {
    await run("init", "--tool", "claude-code", "--about", "Nous installons des pompes à chaleur", "--yes");

    // ON THE MAP, because a reader who walks it never calls the router. The map is rendered purely in
    // the plan and refreshed through the real projection, the only path that can resolve a target
    // living in the framework this root now belongs to (FR-ROUTE-009).
    const map = await fs.readFile(path.join(tmpDir, ".ai", "routing", "index.md"), "utf8");
    const link = map.match(/\[`accueil`\]\(<?([^)>]+)>?\)/);
    assert.ok(link, `the map names the help target:\n${map}`);
    assert.ok(path.isAbsolute(link[1]), `the target lies outside the root, so its path says where it is: ${link[1]}`);
    assert.match(await fs.readFile(link[1], "utf8"), /# Accueil BASE/, "and the link opens the real process");

    // AND for a caller with no model: the abstention stays honest and carries the same target.
    const { stdout } = await run("route", "qwerty zzz machin");
    assert.match(stdout, /out_of_scope/);
    assert.match(stdout, /concierge-base -> accueil/);
  });

  it("records the engine path in the root only when the user-global config cannot answer", async () => {
    // A file cannot contain `.config/base/config.json` on any supported OS. This reproduces an
    // unavailable config home without relying on POSIX permission bits, which Windows ignores.
    const unavailableHome = path.join(tmpDir, "not-a-directory");
    await fs.writeFile(unavailableHome, "");
    await execFileAsync("node", [cliPath, "init", "--tool", "autre", "--yes", "--root", tmpDir], {
      env: { ...process.env, BASE_CONFIG_HOME: unavailableHome },
    });
    const config = JSON.parse(await fs.readFile(path.join(tmpDir, "base.config.json"), "utf8"));
    assert.ok(config.framework_dir, "the root records the engine path when nothing else can");
  });

  it("asks the language question only while the answer would change the plan, and records the answer", async () => {
    await fs.writeFile(path.join(tmpDir, "notes.md"), "# Notes");

    const unanswered = await run("init");
    assert.match(unanswered.stdout, /Dans quelle langue écrire ce dossier \?/);

    // Answered, the question is gone and the answer is not asked for twice.
    const answered = await run("init", "--language", "rm", "--tool", "claude-code", "--about", "Nous réparons des vélos");
    assert.doesNotMatch(answered.stdout, /Dans quelle langue écrire ce dossier \?/);
    // A language this build cannot write earns ONE line, not a refusal.
    assert.match(answered.stdout, /Langue «rm» inconnue de ce build/);
    assert.match(answered.stdout, /langues disponibles: fr, en, de, it/);

    // A language this build DOES carry earns no such line.
    const known = await run("init", "--language", "de", "--tool", "claude-code", "--about", "Nous réparons des vélos");
    assert.doesNotMatch(known.stdout, /inconnue de ce build/);

    await run("init", "--language", "rm-CH", "--tool", "claude-code", "--yes");
    const config = JSON.parse(await fs.readFile(path.join(tmpDir, "base.config.json"), "utf8"));
    assert.equal(config.language, "rm", "the declaration is recorded, normalized, even with no table for it");
    // The words stay French: the fallback is what keeps the folder readable.
    assert.match(await fs.readFile(path.join(tmpDir, "CLAUDE.md"), "utf8"), /point d'entrée pour Claude Code/);
  });

  it("records --egress local-only and withholds the inventoried root from a remote model", async () => {
    await fs.writeFile(path.join(tmpDir, "notes.md"), "# Notes");

    const unanswered = await run("init");
    assert.match(unanswered.stdout, /--egress local-only/);

    await run("init", "--tool", "claude-code", "--egress", "local-only", "--yes");
    const config = JSON.parse(await fs.readFile(path.join(tmpDir, "base.config.json"), "utf8"));
    assert.equal(config.egress, "local-only");

    const resources = await inventoryResources(tmpDir);
    assert.ok(resources.length > 0, "the engine inventories the root before the egress assertion");
    const verdict = checkEgress({ modelLocality: "remote", rootPolicy: config.egress, resources });
    assert.equal(verdict.allowed.length, 0);
    assert.equal(verdict.withheld.length, resources.length);
    assert.ok(verdict.withheld.every((entry) => entry.reason === "root_local_only"));
  });

  it("rejects an unknown --egress value with the actionable contract", async () => {
    await assert.rejects(
      () => run("init", "--egress", "remote"),
      (error) => error.stderr.includes("--egress accepts local-only or any."),
    );
  });

  it("never asks the language question when no planned file carries words", async () => {
    // A collection plans exactly one file, base.workspace.json: ids, labels and paths, no prose.
    for (const client of ["client-a", "client-b"]) {
      await fs.mkdir(path.join(tmpDir, client, ".ai", "agents", "x"), { recursive: true });
      await fs.writeFile(path.join(tmpDir, client, ".ai", "agents", "x", "AGENT.md"), "---\nid: x\ntype: agent\ndescription: X.\n---\n# X\n");
    }
    const { stdout } = await run("init");
    assert.doesNotMatch(stdout, /Dans quelle langue/);
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
    // This root already speaks to a tool (its CLAUDE.md), so healing adds no OTHER tool's entry
    // point: an unasked-for AGENTS.md or Cursor rule is clutter, not a repair.
    assert.ok(!planned.includes("AGENTS.md"));
    assert.ok(!planned.includes(".cursor/rules/assistant.mdc"));
    assert.ok(planned.includes(".ai/base.mjs"), "an existing root missing its launcher gets it healed");
    assert.ok(planned.includes(".ai/tools.md"), "and the artifacts that belong to no tool in particular");

    await run("init", "--yes");
    // The customised file survived; the missing artifacts landed.
    assert.equal(await fs.readFile(path.join(tmpDir, "CLAUDE.md"), "utf8"), "mon CLAUDE.md personnalisé\n");
    assert.match(await fs.readFile(path.join(tmpDir, ".ai", "base.mjs"), "utf8"), /BASE launcher/);
    await assert.rejects(() => fs.access(path.join(tmpDir, "AGENTS.md")));
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
    assert.ok(cfg.framework_dir.endsWith("/base") || cfg.framework_dir.includes("Repositories"));

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
