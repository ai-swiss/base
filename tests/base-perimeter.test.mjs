// Spec coverage: UR-CORE-001 FR-INIT-001 FR-INIT-002 FR-INIT-003 RC-INIT-001
// The bootstrap seam: detection of what a directory is, the pure init plan, and the
// creation-only application. Every detection type has its fixture; the collection plan must
// produce a workspace the existing resolver accepts; nothing is ever overwritten.

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { applyInitPlan, buildInitPlan, detectPerimeter } from "../tools/core/perimeter.mjs";
import { renderBootstrapMd, renderToolMatrix, renderClaudeMd, renderCursorRule } from "../tools/core/bootstrap.mjs";
import { LAUNCHER_SOURCE } from "../tools/core/launcher.mjs";
import { routeRequest, validateBase } from "../tools/base-core.mjs";

const NOW = "2026-06-11T12:00:00.000Z";

async function makeRoot(dir, agentId = "demo") {
  await mkdir(path.join(dir, ".ai", "agents", agentId), { recursive: true });
  await writeFile(
    path.join(dir, ".ai", "agents", agentId, "AGENT.md"),
    `---\nschema_version: base.resource.v1\nid: ${agentId}\ntype: agent\ntitle: ${agentId}\ndescription: Agent ${agentId}.\n---\n# ${agentId}\n`,
  );
}

describe("detectPerimeter — one type per situation, checked in priority order", () => {
  let base;

  before(async () => {
    base = await mkdtemp(path.join(tmpdir(), "perimeter-"));
  });
  after(async () => {
    await rm(base, { recursive: true, force: true });
  });

  it("workspace file wins over everything", async () => {
    const dir = path.join(base, "ws");
    await mkdir(dir, { recursive: true });
    await makeRoot(dir); // even with agents present…
    await writeFile(path.join(dir, "base.workspace.json"), "{}");
    assert.equal((await detectPerimeter(dir)).type, "workspace");
  });

  it("a directory with .ai/agents/*/AGENT.md is a root", async () => {
    const dir = path.join(base, "root");
    await makeRoot(dir, "alpha");
    await makeRoot(dir, "beta");
    const d = await detectPerimeter(dir);
    assert.equal(d.type, "root");
    assert.deepEqual(d.agents, ["alpha", "beta"]);
  });

  it("two sibling roots make a collection (direct children only)", async () => {
    const dir = path.join(base, "coll");
    await makeRoot(path.join(dir, "client-a"));
    await makeRoot(path.join(dir, "client-b"));
    await mkdir(path.join(dir, "notes"), { recursive: true }); // a non-root sibling is fine
    const d = await detectPerimeter(dir);
    assert.equal(d.type, "collection");
    assert.deepEqual(d.roots.map((r) => r.dir), ["client-a", "client-b"]);
    assert.equal(d.roots[0].label, "Client A");
  });

  it("markdown files without BASE structure are loose — SKILL.md names are noticed", async () => {
    const dir = path.join(base, "loose");
    await mkdir(path.join(dir, "procedures"), { recursive: true });
    await writeFile(path.join(dir, "notes.md"), "# Notes");
    await writeFile(path.join(dir, "procedures", "SKILL.md"), "# Une procédure");
    await writeFile(path.join(dir, "README.md"), "readme"); // excluded from the count
    const d = await detectPerimeter(dir);
    assert.equal(d.type, "loose");
    assert.equal(d.markdownCount, 2);
    assert.equal(d.hasSkillNames, true);
  });

  it("an empty directory is empty", async () => {
    const dir = path.join(base, "void");
    await mkdir(dir, { recursive: true });
    assert.equal((await detectPerimeter(dir)).type, "empty");
  });
});

describe("buildInitPlan — pure decision, exact files", () => {
  it("a collection plans ONE file: a valid workspace, first root as default", () => {
    const plan = buildInitPlan(
      { type: "collection", roots: [
        { dir: "client-a", label: "Client A", agents: ["a"] },
        { dir: "client-b", label: "Client B", agents: ["b"] },
      ] },
      { dirName: "mes-clients", now: NOW },
    );
    assert.equal(plan.length, 1);
    assert.equal(plan[0].path, "base.workspace.json");
    const ws = JSON.parse(plan[0].content);
    assert.equal(ws.schema_version, "base.workspace.v1");
    assert.equal(ws.id, "mes-clients");
    assert.deepEqual(ws.roots.map((r) => r.path), ["client-a", "client-b"]);
    assert.equal(ws.roots[0].default, true);
    assert.equal(ws.roots[1].default, undefined);
  });

  it("loose/empty plan a full root: agent + config + launcher + the five tool artifacts, dated, valid frontmatter", () => {
    const plan = buildInitPlan(
      { type: "loose", markdownCount: 3, hasSkillNames: false },
      { dirName: "Mon Cabinet", now: NOW, frameworkDir: "/opt/base" },
    );
    assert.deepEqual(plan.map((e) => e.path), [
      ".ai/agents/mon-cabinet/AGENT.md",
      ".ai/agents/mon-cabinet/skills/processes/importer-l-existant/SKILL.md",
      "base.config.json",
      ".ai/base.mjs",
      "CLAUDE.md",
      "AGENTS.md",
      ".cursor/rules/assistant.mdc",
      "BASE_BOOTSTRAP.md",
      ".ai/tools.md",
    ]);
    assert.match(plan[0].content, /id: mon-cabinet/);
    assert.match(plan[0].content, /type: agent/);
    assert.match(plan[0].content, /created: 2026-06-11/);
    assert.match(plan[0].content, /importer-l-existant/); // the next step is IN the scaffold
    // The promised process ships with the agent, so the invitation actually routes.
    assert.match(plan[1].content, /id: importer-l-existant\ntype: process/);
    assert.match(plan[1].content, /Importer l'existant/);
    // The project self-describes its engine, so its launcher can find it later.
    const config = JSON.parse(plan.find((e) => e.path === "base.config.json").content);
    assert.equal(config.framework_dir, "/opt/base");
  });

  it("the framework_dir is omitted when not injected (a pure function never invents it)", () => {
    const plan = buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW });
    const config = JSON.parse(plan.find((e) => e.path === "base.config.json").content);
    assert.equal("framework_dir" in config, false);
  });

  it("the tool artifacts are byte-for-byte the canonical renders — never a copy", () => {
    const plan = buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW });
    const byPath = Object.fromEntries(plan.map((e) => [e.path, e.content]));
    assert.equal(byPath[".ai/base.mjs"], LAUNCHER_SOURCE);
    assert.equal(byPath["CLAUDE.md"], renderClaudeMd());
    assert.equal(byPath["BASE_BOOTSTRAP.md"], renderBootstrapMd());
    assert.equal(byPath[".cursor/rules/assistant.mdc"], renderCursorRule());
    assert.equal(byPath[".ai/tools.md"], renderToolMatrix());
    // AGENTS.md catalogues the PLANNED agent: its id and description, before it exists on disk.
    assert.match(byPath["AGENTS.md"], /\*\*atelier\*\* - Assistant de travail pour Atelier/);
    assert.match(byPath["AGENTS.md"], /\.ai\/agents\/atelier\/AGENT\.md/);
  });

  it("artifacts already on disk leave the plan (creation-only is decided BEFORE showing)", () => {
    const plan = buildInitPlan(
      { type: "loose", markdownCount: 1, hasSkillNames: false, existingArtifacts: ["CLAUDE.md", "base.config.json"] },
      { dirName: "atelier", now: NOW },
    );
    const paths = plan.map((e) => e.path);
    assert.ok(!paths.includes("CLAUDE.md"));
    assert.ok(!paths.includes("base.config.json"));
    assert.ok(paths.includes("AGENTS.md"));
  });

  it("root and workspace plan nothing", () => {
    assert.deepEqual(buildInitPlan({ type: "root", agents: ["x"] }, { dirName: "d", now: NOW }), []);
    assert.deepEqual(buildInitPlan({ type: "workspace", workspaceFile: "base.workspace.json" }, { dirName: "d", now: NOW }), []);
  });
});

describe("applyInitPlan — creation-only, end to end", () => {
  it("writes the plan, skips what exists (reported, never a crash), and the result is a valid BASE", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "perimeter-apply-"));
    try {
      const plan = buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW });
      const { created, skipped } = await applyInitPlan(dir, plan);
      assert.deepEqual(created, plan.map((e) => e.path));
      assert.deepEqual(skipped, []);

      // The scaffold is a real BASE: detected as root, valid for the validator.
      assert.equal((await detectPerimeter(dir)).type, "root");
      const result = await validateBase(dir);
      assert.deepEqual(result.errors, []);

      // A re-run skips every existing file — reported one by one, nothing overwritten,
      // and a file racing into existence never interrupts the rest of the plan.
      const again = await applyInitPlan(dir, plan);
      assert.deepEqual(again.created, []);
      assert.equal(again.skipped.length, plan.length);
      assert.deepEqual(again.skipped[0], { path: plan[0].path, reason: "existait déjà" });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("the scaffold keeps its promise: «importer mes procédures existantes» routes in the new project", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "perimeter-route-"));
    try {
      await applyInitPlan(dir, buildInitPlan({ type: "loose", markdownCount: 1, hasSkillNames: false }, { dirName: "cabinet", now: NOW }));
      const route = await routeRequest(dir, "importer mes procédures existantes");
      assert.equal(route.status, "routed", "the phrase the scaffold invites must actually route");
      assert.equal(route.process.id, "importer-l-existant");
      assert.equal(route.agent.id, "cabinet");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("a collection becomes a workspace the studio resolver accepts", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "perimeter-ws-"));
    try {
      await makeRoot(path.join(dir, "client-a"));
      await makeRoot(path.join(dir, "client-b"));
      const detection = await detectPerimeter(dir);
      await applyInitPlan(dir, buildInitPlan(detection, { dirName: path.basename(dir), now: NOW }));

      const { resolveStudioContext } = await import("../tools/studio/api.mjs");
      const ctx = await resolveStudioContext(dir);
      assert.equal(ctx.mode, "workspace");
      assert.equal(ctx.roots.length, 2);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
