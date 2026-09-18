// Spec coverage: UR-CORE-001 FR-INIT-001 FR-INIT-002 FR-INIT-003 RC-INIT-001
// The bootstrap seam: detection of what a directory is, the pure init plan, and the
// creation-only application. Every detection type has its fixture; the collection plan must
// produce a workspace the existing resolver accepts; nothing is ever overwritten.

import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { applyInitPlan, buildInitPlan, detectPerimeter, FRAMEWORK_HELP_TARGET } from "../tools/core/perimeter.mjs";
import { renderBootstrapMd, renderToolMatrix, renderClaudeMd, renderCursorRule } from "../tools/core/bootstrap.mjs";
import { FR } from "../tools/core/lang/fr.mjs";
import { EN } from "../tools/core/lang/en.mjs";
import { DE } from "../tools/core/lang/de.mjs";
import { IT } from "../tools/core/lang/it.mjs";
import { availableLanguages } from "../tools/core/lang/index.mjs";
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

  it("loose/empty plan a full root: agent + config + launcher + ONE tool entry point, valid frontmatter", () => {
    const plan = buildInitPlan(
      { type: "loose", markdownCount: 3, hasSkillNames: false },
      { dirName: "Mon Cabinet", frameworkDir: "/opt/base" },
    );
    // Unanswered, the tool question yields the tool-agnostic entry point and nothing else: a folder
    // never receives the entry files of three tools its owner did not name.
    assert.deepEqual(plan.map((e) => e.path), [
      ".ai/agents/mon-cabinet/AGENT.md",
      ".ai/agents/mon-cabinet/skills/processes/importer-l-existant/SKILL.md",
      ".ai/agents/mon-cabinet/index.md",
      ".ai/routing/index.md",
      "README.md",
      ".gitignore",
      "base.config.json",
      ".ai/base.mjs",
      "BASE_BOOTSTRAP.md",
      ".ai/tools.md",
    ]);
    assert.match(plan[0].content, /id: mon-cabinet/);
    assert.match(plan[0].content, /type: agent/);
    assert.doesNotMatch(plan[0].content, /^created:/m);
    assert.match(plan[0].content, /importer-l-existant/); // the next step is IN the scaffold
    // The promised process ships with the agent, so the invitation actually routes.
    assert.match(plan[1].content, /id: importer-l-existant\ntype: process/);
    assert.match(plan[1].content, /Importer l'existant/);
    assert.match(plan[1].content, /Au premier échange, ne récite ni les étapes ni les catégories/);
    assert.match(plan[2].content, /importer-l-existant/);
    assert.match(plan[2].content, /skills\/processes\/importer-l-existant\/SKILL\.md/);
    assert.match(plan[3].content, /mon-cabinet/);
    assert.match(plan[3].content, /\.\.\/agents\/mon-cabinet\/index\.md/);
    const bootstrap = plan.find((entry) => entry.path === "BASE_BOOTSTRAP.md").content;
    assert.match(bootstrap, /ta première lecture est `\.ai\/routing\/index\.md`/);
    assert.match(bootstrap, /Parle de son travail et de ses documents, pas de la mécanique de BASE/);
    // The project self-describes its engine, so its launcher can find it later.
    const config = JSON.parse(plan.find((e) => e.path === "base.config.json").content);
    assert.equal(config.framework_dir, "/opt/base");
  });

  it("pins line endings only inside a git working copy, and never writes LFS patterns", () => {
    const outside = buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW });
    assert.equal(outside.some((e) => e.path === ".gitattributes"), false, "outside a repository the file would mean nothing");

    const inside = buildInitPlan({ type: "empty", hasGit: true }, { dirName: "atelier", now: NOW });
    const entry = inside.find((e) => e.path === ".gitattributes");
    assert.match(entry.content, /^\* text=auto$/m);
    assert.match(entry.content, /\*\.sh text eol=lf/);
    // LFS patterns break a clone where `git lfs` is absent, silently: a folder that needs them adds
    // them knowingly.
    assert.doesNotMatch(entry.content, /lfs/i);
  });

  it("gives the folder a README carrying the attribution the method content asks for", () => {
    const plan = buildInitPlan({ type: "empty" }, { dirName: "mon atelier", now: NOW });
    const readme = plan.find((e) => e.path === "README.md");
    assert.match(readme.content, /^# Mon Atelier/);
    assert.match(readme.content, /par AI Swiss, https:\/\/a-i\.swiss/);
    assert.match(readme.content, /CC BY 4\.0/);
  });

  it("keeps the manifest out of the shared repository: it is a build product", () => {
    const plan = buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW });
    assert.match(plan.find((e) => e.path === ".gitignore").content, /^base\.manifest\.json$/m);
  });

  it("the framework_dir is omitted when not injected (a pure function never invents it)", () => {
    const plan = buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW });
    const config = JSON.parse(plan.find((e) => e.path === "base.config.json").content);
    assert.equal("framework_dir" in config, false);
  });

  it("declares the help target, so a request nothing covers never ends nowhere", () => {
    // A fresh folder holds ONE process, the starter import. Without a declared door, a request none of
    // its processes covers dies on an abstention, and the person is left to find the framework's own
    // help by reading somebody's absolute path. Only DECLARED: nothing is copied, so no copy ages.
    const config = JSON.parse(
      buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW }).find((e) => e.path === "base.config.json").content,
    );
    assert.deepEqual(config.routing.fallback, FRAMEWORK_HELP_TARGET);
    assert.notEqual(config.routing.fallback, FRAMEWORK_HELP_TARGET, "a copy, so a caller cannot mutate the constant");
  });

  it("records a local-only egress decision, and omits the default", () => {
    const configFor = (egress) => JSON.parse(
      buildInitPlan(
        { type: "empty" },
        { dirName: "atelier", now: NOW, intake: egress === undefined ? {} : { egress } },
      ).find((entry) => entry.path === "base.config.json").content,
    );

    assert.equal(configFor("local-only").egress, "local-only");
    assert.equal("egress" in configFor("any"), false);
    assert.equal("egress" in configFor(undefined), false);
  });

  it("the tool artifacts are byte-for-byte the canonical renders — never a copy", () => {
    const byPath = (intake) => Object.fromEntries(buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW, intake }).map((e) => [e.path, e.content]));
    const minimum = byPath(undefined);
    assert.equal(minimum[".ai/base.mjs"], LAUNCHER_SOURCE);
    assert.equal(minimum["BASE_BOOTSTRAP.md"], renderBootstrapMd());
    assert.equal(minimum[".ai/tools.md"], renderToolMatrix());
    const claudeMd = byPath({ tools: ["claude-code"] })["CLAUDE.md"];
    assert.equal(claudeMd, renderClaudeMd());
    assert.match(claudeMd, /^@\.ai\/routing\/index\.md$/m);
    assert.match(claudeMd, /Commence par la réponse utile/);
    assert.equal(byPath({ tools: ["cursor"] })[".cursor/rules/assistant.mdc"], renderCursorRule());
    // AGENTS.md catalogues the PLANNED agent: its id and description, before it exists on disk.
    const agentsMd = byPath({ tools: ["agents-md"] })["AGENTS.md"];
    assert.match(agentsMd, /\*\*atelier\*\* - Assistant de travail pour Atelier/);
    assert.match(agentsMd, /\.ai\/agents\/atelier\/AGENT\.md/);
  });

  it("writes one entry point per tool named, and only those", () => {
    const paths = (tools) => buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW, intake: { tools } }).map((e) => e.path);
    assert.ok(paths(["claude-code"]).includes("CLAUDE.md"));
    assert.equal(paths(["claude-code"]).includes(".cursor/rules/assistant.mdc"), false);
    // A team that genuinely uses two tools names two; a repeated or unknown answer changes nothing.
    const two = paths(["claude-code", "cursor", "claude-code", "inconnu"]);
    assert.deepEqual(two.filter((p) => /CLAUDE\.md|assistant\.mdc|AGENTS\.md|BOOTSTRAP/.test(p)), ["CLAUDE.md", ".cursor/rules/assistant.mdc"]);
  });

  it("makes the owner's sentence the agent's description and its «Quand l'utiliser»", () => {
    const plan = buildInitPlan(
      { type: "empty" },
      { dirName: "atelier", now: NOW, intake: { about: "Nous réparons des vélos et gérons un atelier partagé" } },
    );
    const card = plan[0].content;
    assert.match(card, /description: Nous réparons des vélos et gérons un atelier partagé/);
    assert.match(card, /use_when: Quand la demande porte sur: Nous réparons des vélos/);
  });

  it("records the language it was given, and writes French for a language no table covers yet", () => {
    // `rm` has no table in this build. The declaration is recorded all the same, so it survives
    // until the table lands and nobody answers the question twice; the words fall back to French,
    // key by key, rather than leaving the folder half empty.
    const plan = buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW, intake: { tools: ["claude-code"] }, lang: "rm-CH" });
    const config = JSON.parse(plan.find((e) => e.path === "base.config.json").content);
    assert.equal(config.language, "rm", "recorded, normalized to its primary subtag");
    assert.equal(plan.find((e) => e.path === "CLAUDE.md").content, renderClaudeMd(), "no table for `rm`: the French bytes, exactly");

    // A plan asked for nothing declares nothing: a French root carries no language key.
    const french = JSON.parse(buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW }).find((e) => e.path === "base.config.json").content);
    assert.equal("language" in french, false);
  });

  it("writes an English root when the folder declares `en`", () => {
    const plan = buildInitPlan({ type: "empty" }, { dirName: "bike workshop", now: NOW, intake: { tools: ["claude-code"] }, lang: "en" });
    const byPath = Object.fromEntries(plan.map((e) => [e.path, e.content]));

    assert.equal(JSON.parse(byPath["base.config.json"]).language, "en");
    assert.equal(byPath["CLAUDE.md"], renderClaudeMd("en"));
    assert.match(byPath["CLAUDE.md"], /entry point for Claude Code/);
    assert.match(byPath["CLAUDE.md"], /Lead with the useful answer/);
    assert.match(byPath[".ai/tools.md"], /^# BASE tool matrix/m);

    // The README speaks the root's language and still carries the credit LICENSING.md asks for.
    // `upgrade` and `doctor` match the URL, which every translation keeps.
    assert.match(byPath["README.md"], /^# Bike Workshop/);
    assert.match(byPath["README.md"], /This folder is a BASE/);
    assert.match(byPath["README.md"], /by AI Swiss, https:\/\/a-i\.swiss/);
    assert.match(byPath["README.md"], /CC BY 4\.0/);

    // The starter process keeps its id: a stable identifier, like a tool id. Only its words move.
    const process = byPath[".ai/agents/bike-workshop/skills/processes/importer-l-existant/SKILL.md"];
    assert.match(process, /^id: importer-l-existant$/m);
    assert.match(process, /^title: Import what you already have$/m);
    assert.match(process, /^use_when: When the user wants to start from their existing documents/m);
  });

  it("writes a German root when the folder declares `de`", () => {
    const plan = buildInitPlan({ type: "empty" }, { dirName: "velowerkstatt", now: NOW, intake: { tools: ["claude-code"] }, lang: "de-CH" });
    const byPath = Object.fromEntries(plan.map((e) => [e.path, e.content]));

    assert.equal(JSON.parse(byPath["base.config.json"]).language, "de", "a table is per language, not per region");
    assert.equal(byPath["CLAUDE.md"], renderClaudeMd("de"));
    assert.match(byPath["CLAUDE.md"], /Einstiegspunkt für Claude Code/);
    assert.match(byPath["CLAUDE.md"], /Beginne mit der nützlichen Antwort/);
    assert.match(byPath[".ai/tools.md"], /^# BASE-Werkzeugmatrix/m);

    // The README speaks the root's language and still carries the credit LICENSING.md asks for.
    // `upgrade` and `doctor` match the URL, which every translation keeps.
    assert.match(byPath["README.md"], /Dieser Ordner ist ein BASE/);
    assert.match(byPath["README.md"], /von AI Swiss, https:\/\/a-i\.swiss/);
    assert.match(byPath["README.md"], /CC BY 4\.0/);

    // The starter process keeps its id: a stable identifier, like a tool id. Only its words move,
    // `use_when` first — it is the field the router actually reads.
    const process = byPath[".ai/agents/velowerkstatt/skills/processes/importer-l-existant/SKILL.md"];
    assert.match(process, /^id: importer-l-existant$/m);
    assert.match(process, /^title: Das Vorhandene importieren$/m);
    assert.match(process, /^use_when: Wenn von den eigenen vorhandenen Dokumenten ausgegangen werden soll/m);
  });

  it("writes an Italian root when the folder declares `it`", () => {
    const plan = buildInitPlan({ type: "empty" }, { dirName: "officina bici", now: NOW, intake: { tools: ["claude-code"] }, lang: "it" });
    const byPath = Object.fromEntries(plan.map((e) => [e.path, e.content]));

    assert.equal(JSON.parse(byPath["base.config.json"]).language, "it");
    assert.equal(byPath["CLAUDE.md"], renderClaudeMd("it"));
    assert.match(byPath["CLAUDE.md"], /punto di ingresso per Claude Code/);
    assert.match(byPath["CLAUDE.md"], /Inizia dalla risposta utile/);
    assert.match(byPath[".ai/tools.md"], /^# Matrice degli strumenti BASE/m);

    assert.match(byPath["README.md"], /^# Officina Bici/);
    assert.match(byPath["README.md"], /Questa cartella è un BASE/);
    assert.match(byPath["README.md"], /da AI Swiss, https:\/\/a-i\.swiss/);
    assert.match(byPath["README.md"], /CC BY 4\.0/);

    const process = byPath[".ai/agents/officina-bici/skills/processes/importer-l-existant/SKILL.md"];
    assert.match(process, /^id: importer-l-existant$/m);
    assert.match(process, /^title: Importare l'esistente$/m);
    assert.match(process, /^use_when: Quando l'utente vuole partire dai propri documenti esistenti/m);
  });

  it("the shipped importer proves retrieval on real questions before declaring a corpus healthy", async () => {
    const process = await readFile(
      new URL("../.ai/agents/createur-agent/skills/processes/importer-l-existant/SKILL.md", import.meta.url),
      "utf8",
    );

    assert.match(process, /doctor.*ne prouve pas[^.]*retrouvables/is);
    assert.match(process, /questions réelles/);
    assert.match(process, /découverte au grain section avec une limite de cinq résultats/);
    assert.match(process, /ouvre son `id#ancre` exact/);
    assert.match(process, /consigne la question, la référence attendue, son rang et tout échec/);
    assert.match(process, /métadonnées exactes ou le découpage en sections/);
    assert.match(process, /Condition de fin observable/);
    assert.match(process, /question voisine/);
    assert.match(process, /jamais utilisée pour les\s+ajuster/);
  });

  it("every translated table covers every key of the French one, with the same shape", () => {
    // A missing key degrades to French per key (stringsFor merges over FR), which is readable but
    // half translated. A table that claims to be full must be full — and all four ship full today.
    const TABLES = { en: EN, de: DE, it: IT };
    // «# Agents» and «## Agents» read the same in English as in French; every other string moves.
    const SAME_AS_FRENCH = { en: new Set(["agentsTitle", "indexAgentsHeading"]), de: new Set(), it: new Set() };
    assert.deepEqual(availableLanguages(), ["fr", ...Object.keys(TABLES)], "the resolver knows exactly these four");

    for (const [lang, table] of Object.entries(TABLES)) {
      assert.deepEqual(Object.keys(table), Object.keys(FR), `${lang}: same keys, same order`);
      for (const [key, fr] of Object.entries(FR)) {
        const value = table[key];
        assert.equal(typeof value, typeof fr, `${lang}.${key}: same kind of value`);
        if (Array.isArray(fr)) {
          assert.ok(Array.isArray(value), `${lang}.${key}: still an array`);
          assert.equal(value.length, fr.length, `${lang}.${key}: same number of lines`);
        }
        if (typeof fr === "function") assert.equal(value.length, fr.length, `${lang}.${key}: same placeholders`);
        if (fr && typeof fr === "object" && !Array.isArray(fr)) assert.deepEqual(Object.keys(value), Object.keys(fr), `${lang}.${key}: same ids`);
        if (typeof fr === "string" && !SAME_AS_FRENCH[lang].has(key)) assert.notEqual(value, fr, `${lang}.${key}: actually translated`);
      }
    }
  });

  it("artifacts already on disk leave the plan (creation-only is decided BEFORE showing)", () => {
    const plan = buildInitPlan(
      { type: "loose", markdownCount: 1, hasSkillNames: false, existingArtifacts: ["CLAUDE.md", "base.config.json"] },
      { dirName: "atelier", now: NOW, intake: { tools: ["claude-code"] } },
    );
    const paths = plan.map((e) => e.path);
    assert.ok(!paths.includes("CLAUDE.md"));
    assert.ok(!paths.includes("base.config.json"));
    assert.ok(paths.includes(".ai/base.mjs"));
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

  it("proposes a .gitignore for BASE runtime data — and NEVER touches an existing one", async () => {
    // The trust promise «local, jamais transmis» must survive the first `git push` of a fresh
    // project: traces, pending change snapshots, feedback and machine settings stay out of the repo.
    const plan = buildInitPlan({ type: "empty" }, { dirName: "atelier", now: NOW });
    const gitignore = plan.find((e) => e.path === ".gitignore");
    assert.ok(gitignore, "init proposes .gitignore");
    for (const line of [".ai/trace/", ".ai/changes/", ".ai/feedback/", ".ai/studio.settings.json"]) {
      assert.ok(gitignore.content.includes(line), `${line} is ignored`);
    }

    // Creation-only is absolute: a project's own .gitignore is respected, never appended.
    const dir = await mkdtemp(path.join(tmpdir(), "perimeter-gitignore-"));
    try {
      await writeFile(path.join(dir, ".gitignore"), "custom\n", "utf8");
      const { skipped } = await applyInitPlan(dir, plan);
      assert.ok(skipped.some((s) => s.path === ".gitignore"), "the existing file is skipped, reported");
      const { readFile } = await import("node:fs/promises");
      assert.equal(await readFile(path.join(dir, ".gitignore"), "utf8"), "custom\n", "byte-identical: no append");
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

  it("the English scaffold keeps the same promise: an English request routes to the starter process", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "perimeter-route-en-"));
    try {
      await applyInitPlan(dir, buildInitPlan({ type: "loose", markdownCount: 1, hasSkillNames: false }, { dirName: "practice", now: NOW, lang: "en" }));
      const route = await routeRequest(dir, "import my existing procedures");
      assert.equal(route.status, "routed", "the phrase the English card invites must actually route");
      assert.equal(route.process.id, "importer-l-existant");
      assert.equal(route.agent.id, "practice");

      // And the root it produced is a valid BASE, frontmatter included.
      const report = await validateBase(dir);
      assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
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
