// Spec coverage: UR-CORE-001 FR-CORE-005 FR-DOCTOR-001 FR-DOCTOR-002~weak[CLI exit code and API door not asserted end-to-end]
// `base doctor`: a pure projection over existing data. Every check on its own
// fixture: dead link, orphan, stale eval (only AFTER a green run), due review, expired validity,
// open friction — each with a mandatory fix hint. Plus the shipped-corpus routing contracts and
// the importer-l-existant reference run (proposes through the gate, commits nothing).

import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { createFauxModel } from "../packages/base-llm/index.mjs";
import { createLlmEvaluator, createSimulatedUser, runScenario } from "../packages/base-eval/index.mjs";
import { routeRequest } from "../tools/base-core.mjs";
import { isAbstention } from "../tools/core/feedback.mjs";
import { diagnose, diagnoseData, formatDiagnosis } from "../tools/doctor/diagnose.mjs";
import { buildProcessHarness } from "../tools/eval/broker-harness.mjs";

const NOW = "2026-06-11T12:00:00.000Z";

describe("doctor — diagnoseData (pure, injected fixtures)", () => {
  it("flags dead links and orphans, with fix hints, and spares structural files", () => {
    const inventory = [
      { id: "p", type: "process", path: "a/p/SKILL.md", body: "Voir [x](docs/absent.md) et [ok](docs/present.md)." },
      { id: "present", type: "document", path: "docs/present.md", body: "" },
      { id: "lonely", type: "document", path: "docs/lonely.md", body: "" },
      { id: "readme", type: "document", path: "README.md", body: "" },
    ];
    const findings = diagnoseData({ inventory, now: NOW });

    const dead = findings.find((f) => f.type === "dead_link");
    assert.equal(dead.severity, "error");
    assert.equal(dead.path, "a/p/SKILL.md");
    assert.match(dead.message, /docs\/absent\.md/);
    assert.ok(dead.fix_hint.length > 10);

    const orphans = findings.filter((f) => f.type === "orphan").map((f) => f.path);
    assert.deepEqual(orphans, ["docs/lonely.md"]); // present.md referenced, README structural
  });

  it("a code-span path is illustrative, not a link — never a dead link", () => {
    // Prose names paths in `backticks` to illustrate (a tool's config, a folder). Those are not
    // links: doctor must not report them broken (the contract docs validation also holds).
    const inventory = [
      { id: "p", type: "process", path: "a/p/SKILL.md", body: "Configure `.cursor/rules` and see `docs/reference/absent-guide.md` later." },
    ];
    const dead = diagnoseData({ inventory, now: NOW }).filter((f) => f.type === "dead_link");
    assert.deepEqual(dead, [], "code-span paths must not be dead links");
  });

  it("an orphaned agent resource is an ERROR; an orphaned doc stays a warning", () => {
    const inventory = [
      { id: "comp", type: "competence", path: ".ai/agents/x/skills/competences/lost/SKILL.md", body: "" },
      { id: "doc", type: "document", path: "docs/stray.md", body: "" },
    ];
    const orphans = diagnoseData({ inventory, now: NOW }).filter((f) => f.type === "orphan");
    const bySeverity = Object.fromEntries(orphans.map((f) => [f.path, f.severity]));
    assert.equal(bySeverity[".ai/agents/x/skills/competences/lost/SKILL.md"], "error", "invisible agent knowledge is an error");
    assert.equal(bySeverity["docs/stray.md"], "warn", "doc reachability is the documentation graph's concern");
  });

  it("a docs page filed under a section directory is NOT an orphan (the docs site publishes it)", () => {
    const inventory = [
      { id: "guide", type: "document", path: "docs/guides/ecrire-pour-le-routeur.md", body: "" },
      { id: "aud", type: "document", path: "docs/audiences/pilote-institution-90-min.md", body: "" },
      { id: "loose", type: "document", path: "docs/stray.md", body: "" },
    ];
    const orphans = diagnoseData({ inventory, now: NOW }).filter((f) => f.type === "orphan").map((f) => f.path);
    // Section pages are reachable via the docs navigation; only the loose top-level page warns.
    assert.deepEqual(orphans, ["docs/stray.md"]);
  });

  it("a generated routing index (provenance) is not an orphan; a hand-written index.md still is", () => {
    // `base build routing-index` emits .ai/agents/<id>/index.md, reachable by convention, never
    // hand-referenced. doctor exempts them by PROVENANCE (the loader passes the generated paths),
    // fail-closed: an index.md without the generated header, or any other agent resource, stays flagged.
    const inventory = [
      { id: "gen", type: "document", path: ".ai/agents/sales/index.md", body: "" },
      { id: "hand", type: "document", path: ".ai/agents/ops/index.md", body: "" },
      { id: "comp", type: "competence", path: ".ai/agents/x/skills/competences/lost/SKILL.md", body: "" },
    ];
    const orphans = diagnoseData({ inventory, generated: [".ai/agents/sales/index.md"], now: NOW })
      .filter((f) => f.type === "orphan")
      .map((f) => f.path);
    assert.ok(!orphans.includes(".ai/agents/sales/index.md"), "a generated routing index is reachable by convention");
    assert.ok(orphans.includes(".ai/agents/ops/index.md"), "a hand-written index.md without the header stays flagged");
    assert.ok(orphans.includes(".ai/agents/x/skills/competences/lost/SKILL.md"), "a non-generated agent resource stays flagged");
  });

  it("a code-span wrapping a whole link is illustrative; a broken link with a title is still caught", () => {
    const inventory = [
      { id: "p", type: "process", path: "a/p/SKILL.md", body: 'Example: `[label](nowhere.md)`. But [real](gone.md "a title") is broken.' },
    ];
    const dead = diagnoseData({ inventory, now: NOW }).filter((f) => f.type === "dead_link");
    assert.deepEqual(dead.map((f) => f.message), ["lien mort: gone.md"], "code-span link ignored, titled link caught");
  });

  it("a self-citing agent resource stays an orphan error (reachability is from routable roots only)", () => {
    const inventory = [
      { id: "island", type: "competence", path: ".ai/agents/x/skills/competences/island/SKILL.md", body: "See `skills/competences/island/SKILL.md`." },
    ];
    const orphans = diagnoseData({ inventory, now: NOW }).filter((f) => f.type === "orphan");
    assert.equal(orphans.length, 1, "a node citing only itself is not reached");
    assert.equal(orphans[0].severity, "error");
  });

  it("review_due and expired fire on past dates only", () => {
    const inventory = [
      { id: "fresh", type: "document", path: "fresh.md", body: "", metadata: { review_by: "2027-01-01", valid_until: "2027-01-01" } },
      { id: "due", type: "document", path: "due.md", body: "", metadata: { review_by: "2026-01-01" } },
      { id: "old", type: "document", path: "old.md", body: "", metadata: { valid_until: "2025-12-31" } },
    ];
    const findings = diagnoseData({ inventory, files: ["CLAUDE.md"], now: NOW }).filter((f) => f.type !== "orphan");
    assert.deepEqual(
      findings.map((f) => [f.type, f.path, f.severity]),
      [["review_due", "due.md", "warn"], ["expired", "old.md", "error"]],
    );
  });

  it("stale_eval fires only when the process changed AFTER its last green run — never on no-eval", () => {
    const inventory = [
      { id: "edited", type: "process", path: "a/edited/SKILL.md", body: "" },
      { id: "stable", type: "process", path: "a/stable/SKILL.md", body: "" },
      { id: "never-evaluated", type: "process", path: "a/new/SKILL.md", body: "" },
    ];
    const runs = [
      { process: "edited", outcome: "goal_met", at: "2026-06-01T00:00:00.000Z" },
      { process: "stable", outcome: "goal_met", at: "2026-06-10T00:00:00.000Z" },
    ];
    const mtimes = {
      "a/edited/SKILL.md": Date.parse("2026-06-05T00:00:00.000Z"), // edited after its green run
      "a/stable/SKILL.md": Date.parse("2026-06-01T00:00:00.000Z"), // green run is later
      "a/new/SKILL.md": Date.parse("2026-06-10T00:00:00.000Z"),
    };
    const findings = diagnoseData({ inventory, runs, mtimes, now: NOW }).filter((f) => f.type === "stale_eval");
    assert.deepEqual(findings.map((f) => f.path), ["a/edited/SKILL.md"]);
    assert.match(findings[0].fix_hint, /évaluation/);
  });

  it("open frictions surface; resolved ones do not; rendering stays calm when healthy", () => {
    const feedback = { frictions: [
      { path: ".ai/feedback/a.md", process: "p", status: "open" },
      { path: ".ai/feedback/b.md", process: "p", status: "resolved" },
    ] };
    const findings = diagnoseData({ inventory: [], files: ["CLAUDE.md"], feedback, now: NOW });
    assert.deepEqual(findings.map((f) => f.type), ["open_friction"]);
    assert.match(formatDiagnosis([]), /Corpus sain/);
    assert.match(formatDiagnosis(findings), /1 signal/);
  });

  it("a recurring abstention (>= 3) surfaces as a process waiting to exist; a rare one stays quiet", () => {
    const feedback = {
      frictions: [],
      abstentions: [
        { query: "résilier le bail du local", verdict: "out_of_scope", count: 3, lastAt: "2026-06-10T00:00:00Z" },
        { query: "demande rare", verdict: "ambiguous", count: 1, lastAt: "2026-06-10T00:00:00Z" },
      ],
    };
    const findings = diagnoseData({ inventory: [], files: ["CLAUDE.md"], feedback, now: NOW }).filter((f) => f.type === "recurring_abstention");
    assert.equal(findings.length, 1, "only the >= 3 query is surfaced");
    assert.equal(findings[0].severity, "warn");
    assert.match(findings[0].message, /résilier le bail/);
    assert.match(findings[0].fix_hint, /process/);
  });

  it("a root without CLAUDE.md gets the missing-tool-artifacts signal; with it, silence", () => {
    const bare = diagnoseData({ inventory: [], now: NOW });
    assert.deepEqual(bare.map((f) => [f.type, f.severity]), [["missing_tool_artifacts", "warn"]]);
    assert.match(bare[0].fix_hint, /base init/);
    const wired = diagnoseData({ inventory: [], files: ["CLAUDE.md"], now: NOW });
    assert.deepEqual(wired, []);
  });

  it("diagnose(root) wires the loaders end to end (real example: healthy)", async () => {
    const findings = await diagnose("exemples/assistant-devis");
    assert.equal(findings.filter((f) => f.severity === "error").length, 0);
  });
});

describe("shipped corpus — routing contracts (clean corpus root)", () => {
  let corpus;

  before(async () => {
    corpus = await mkdtemp(path.join(tmpdir(), "base-corpus-"));
    await mkdir(path.join(corpus, ".ai", "agents"), { recursive: true });
    await cp(".ai/agents/concierge-base", path.join(corpus, ".ai/agents/concierge-base"), { recursive: true });
    await cp(".ai/agents/createur-agent", path.join(corpus, ".ai/agents/createur-agent"), { recursive: true });
  });
  after(async () => {
    await rm(corpus, { recursive: true, force: true });
  });

  it("«mon assistant s'est trompé» routes to signaler-une-friction", async () => {
    const decision = await routeRequest(corpus, "mon assistant s'est trompé");
    assert.equal(decision.status, "routed");
    assert.equal(decision.process.id, "signaler-une-friction");
  });

  it("«résilier le bail» routes nowhere — an honest, journalable abstention", async () => {
    const decision = await routeRequest(corpus, "résilier le bail");
    assert.equal(decision.status, "out_of_scope");
    assert.equal(isAbstention(decision.status), true); // what the adapters journal
  });

  it("importer-l-existant: the reference run PROPOSES a conversion through the gate, commits nothing", async () => {
    const docPath = "notes/procedure-relance.md";
    await mkdir(path.join(corpus, "notes"), { recursive: true });
    await writeFile(path.join(corpus, docPath), "# Relance client\n\n1. Vérifier l'échéance.\n2. Envoyer le rappel.\n");

    const harness = await buildProcessHarness(corpus, { agentId: "createur-agent", processId: "importer-l-existant" });
    const sut = createFauxModel([
      { toolCalls: [{ id: "c1", name: "open_resource", arguments: { id_or_path: docPath } }] },
      { toolCalls: [{ id: "c2", name: "propose_change", arguments: {
        target: ".ai/agents/demo/skills/processes/relance/SKILL.md",
        content: "---\nschema_version: base.resource.v1\nid: relance\ntype: process\ntitle: Relance client\ndescription: Relancer un client en retard.\nuse_when: Quand un client doit être relancé.\n---\n# Relance\n\n1. Vérifier l'échéance.\n2. Envoyer le rappel.\n",
      } }] },
      "J'ai proposé le process «Relance client» — validez le diff avant toute écriture.",
    ]);
    const result = await runScenario({
      sut,
      runner: createSimulatedUser(createFauxModel('{"status":"satisfied","message":"Parfait."}')),
      harness,
      evaluator: createLlmEvaluator(createFauxModel('{"outcome":"goal_met","confidence":0.9,"evidence":[],"rationale":"a proposé sans écrire"}')),
      scenario: {
        id: "import-reference",
        seedInput: `Transforme ${docPath} en process BASE.`,
        goals: ["Proposer au moins un process via le gate", "Ne rien écrire sans validation humaine"],
      },
    });

    const propose = result.turns[0].toolCalls.find((c) => c.name === "propose_change");
    const staged = JSON.parse(propose.result);
    assert.match(staged.change_id, /^chg_/);
    assert.match(staged.diff, /Relance client/);
    assert.equal(result.verdict.outcome, "goal_met");
    // Nothing written: only the staged change exists, not the target file.
    const { pathExists } = await import("../tools/core/confine.mjs");
    assert.equal(await pathExists(path.join(corpus, ".ai/agents/demo/skills/processes/relance/SKILL.md")), false);
  });
});

describe("runtime artifacts are machine state, never knowledge", () => {
  let root;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-runtime-"));
    await mkdir(path.join(root, ".ai", "agents", "demo"), { recursive: true });
    await writeFile(
      path.join(root, ".ai", "agents", "demo", "AGENT.md"),
      "---\nschema_version: base.resource.v1\nid: demo\ntype: agent\ntitle: Demo\ndescription: Agent démo.\n---\n# Demo\n",
    );
    await writeFile(path.join(root, ".ai", "studio.settings.json"), JSON.stringify({ providers: [] }));
  });
  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("the Studio settings file is not inventoried, hence never an orphan", async () => {
    const { inventoryResources } = await import("../tools/base-core.mjs");
    const inventory = await inventoryResources(root);
    assert.ok(inventory.every((r) => r.path !== ".ai/studio.settings.json"));

    const findings = await diagnose(root);
    assert.ok(findings.every((f) => f.path !== ".ai/studio.settings.json"));
  });

  it("the tree still SHOWS the file — as a plain non-resource (the truth of the disk)", async () => {
    const { tree } = await import("../tools/studio/api.mjs");
    const t = await tree(root);
    const ai = t.dirs.find((d) => d.name === ".ai");
    const file = ai.files.find((f) => f.name === "studio.settings.json");
    assert.ok(file);
    assert.equal(file.resource, null);
  });
});
