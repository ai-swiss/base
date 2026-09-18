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
import { everyLanguage } from "../tools/core/lang/index.mjs";
import { isAbstention } from "../tools/core/feedback.mjs";
import { diagnose, diagnoseData, formatDiagnosis } from "../tools/doctor/diagnose.mjs";
import { buildProcessHarness } from "../tools/eval/broker-harness.mjs";

const NOW = "2026-06-11T12:00:00.000Z";

describe("doctor — diagnoseData (pure, injected fixtures)", () => {
  it("stale_routing_vectors: a drifted or legacy vector cache warns, a fresh one stays silent (Voie 2 never degrades silently)", () => {
    const stale = diagnoseData({ inventory: [], routingVectors: { byPath: null, stale: ["a.md", "b.md"], legacy: false, embedder: "ollama/e" }, now: NOW })
      .filter((f) => f.type === "stale_routing_vectors");
    assert.equal(stale.length, 1);
    assert.equal(stale[0].severity, "warn");
    assert.match(stale[0].message, /2 vecteur/);
    const legacy = diagnoseData({ inventory: [], routingVectors: { byPath: {}, stale: [], legacy: true, embedder: null }, now: NOW })
      .filter((f) => f.type === "stale_routing_vectors");
    assert.equal(legacy.length, 1, "a pre-v1 cache cannot say whether it is stale: same nudge");
    const fresh = diagnoseData({ inventory: [], routingVectors: { byPath: { "a.md": [1] }, stale: [], legacy: false, embedder: "ollama/e" }, now: NOW })
      .filter((f) => f.type === "stale_routing_vectors");
    assert.equal(fresh.length, 0, "a healthy cache is not a finding");
  });

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

  it("a declared may_use or requires reaches its target: no orphan, no duplicated inline path", () => {
    // An author declares what a process opens in its frontmatter. That declaration is as deliberate
    // as a link, so the graph follows it: a declared competence is not invisible knowledge, and the
    // prose no longer has to repeat its path just to escape this check.
    const inventory = [
      { id: "p", type: "process", path: ".ai/agents/x/skills/processes/p/SKILL.md", body: "Rien dans le corps.", may_use: ["conventions"], requires: [{ ref: ".ai/agents/x/templates/devis.md", access: "read" }] },
      { id: "conventions", type: "competence", path: ".ai/agents/x/skills/competences/conventions/SKILL.md", body: "" },
      { id: "devis", type: "template", path: ".ai/agents/x/templates/devis.md", body: "" },
    ];
    const findings = diagnoseData({ inventory, now: NOW });
    assert.deepEqual(findings.filter((f) => f.type === "orphan"), []);
    assert.deepEqual(findings.filter((f) => f.type === "unresolved_declaration"), []);
  });

  it("a declaration whose target disappeared is named, with what to fix", () => {
    const inventory = [
      { id: "p", type: "process", path: ".ai/agents/x/skills/processes/p/SKILL.md", body: "", may_use: ["parti"] },
    ];
    const findings = diagnoseData({ inventory, now: NOW }).filter((f) => f.type === "unresolved_declaration");
    assert.equal(findings.length, 1);
    assert.equal(findings[0].severity, "warn");
    assert.match(findings[0].message, /parti/);
    assert.ok(findings[0].fix_hint.includes("may_use"));
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
    const findings = diagnoseData({ inventory, files: ["CLAUDE.md", ".ai/base.mjs"], now: NOW }).filter((f) => f.type !== "orphan");
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
    const findings = diagnoseData({ inventory: [], files: ["CLAUDE.md", ".ai/base.mjs"], feedback, now: NOW });
    assert.deepEqual(findings.map((f) => f.type), ["open_friction"]);
    assert.match(formatDiagnosis([]), /Corpus sain/);
    assert.match(formatDiagnosis(findings), /1 signal/);
  });

  it("only recurring actionable abstentions suggest routing or process work", () => {
    const feedback = {
      frictions: [],
      abstentions: [
        { query: "résilier le bail du local", verdict: "out_of_scope", count: 3, lastAt: "2026-06-10T00:00:00Z" },
        { query: "préparer le dossier", verdict: "ambiguous", count: 3, lastAt: "2026-06-10T00:00:00Z" },
        { query: "répondre au client", verdict: "needs_clarification", count: 4, lastAt: "2026-06-10T00:00:00Z" },
        { query: "demande rare", verdict: "ambiguous", count: 1, lastAt: "2026-06-10T00:00:00Z" },
      ],
    };
    const findings = diagnoseData({ inventory: [], files: ["CLAUDE.md", ".ai/base.mjs"], feedback, now: NOW }).filter((f) => f.type === "recurring_abstention");
    assert.deepEqual(findings.map((f) => f.message.match(/«([^»]+)»/)?.[1]), ["préparer le dossier", "répondre au client"]);
    assert.ok(findings.every((f) => f.severity === "warn" && /process/.test(f.fix_hint)));
    assert.equal(findings.some((f) => /résilier le bail/.test(f.message)), false, "out_of_scope is a valid boundary, not a missing process");
  });

  it("a root without CLAUDE.md gets the missing-tool-artifacts signal; with it, silence", () => {
    const bare = diagnoseData({ inventory: [], now: NOW });
    assert.deepEqual(bare.map((f) => [f.type, f.severity]), [["missing_tool_artifacts", "warn"]]);
    assert.match(bare[0].fix_hint, /base init/);
    const wired = diagnoseData({ inventory: [], files: ["CLAUDE.md", ".ai/base.mjs"], now: NOW });
    assert.deepEqual(wired, []);
  });

  it("an entry file without the launcher gets the same class of signal, naming the heal", () => {
    // A copied root with CLAUDE.md but no .ai/base.mjs answers `node .ai/base.mjs …` with a raw
    // stack trace — the doctor says the one command that heals it (init, creation-only).
    const findings = diagnoseData({ inventory: [], files: ["CLAUDE.md"], now: NOW });
    assert.deepEqual(findings.map((f) => [f.type, f.path]), [["missing_tool_artifacts", ".ai/base.mjs"]]);
    assert.match(findings[0].message, /lanceur/);
    assert.match(findings[0].fix_hint, /base init/);
  });

  it("migrated entretien lenses: weak routing, missing description, dormant marker — each on its own fixture", () => {
    const NOW_MS = Date.parse(NOW);
    const DAY = 24 * 60 * 60 * 1000;
    const findings = diagnoseData({
      inventory: [
        { id: "weak", type: "process", path: "a/weak/SKILL.md", body: "", description: "Décrit.", metadata: {} },
        { id: "strong", type: "process", path: "a/strong/SKILL.md", body: "", description: "Décrit.", use_when: "Quand il le faut.", metadata: {} },
        { id: "mute", type: "agent", path: ".ai/agents/mute/AGENT.md", body: "", metadata: {} },
        { id: "dormant", type: "document", path: "clients/dossier.md", body: "[A VALIDER: montant]", description: "Dossier.", metadata: {} },
        { id: "active", type: "document", path: "clients/actif.md", body: "[A VALIDER: date]", description: "Dossier.", metadata: {} },
        { id: "translating", type: "document", path: "TRANSLATING.md", body: "Keep [A VALIDER] literal.", description: "Guide.", metadata: {} },
      ],
      files: ["CLAUDE.md", ".ai/base.mjs"],
      mtimes: {
        "clients/dossier.md": NOW_MS - 31 * DAY,
        "clients/actif.md": NOW_MS - 2 * DAY,
        "TRANSLATING.md": NOW_MS - 31 * DAY,
      },
      now: NOW,
    });
    assert.deepEqual(findings.filter((f) => f.type === "weak_routing").map((f) => f.path), ["a/weak/SKILL.md"], "use_when or examples silences the lens");
    assert.deepEqual(findings.filter((f) => f.type === "missing_description").map((f) => f.path), [".ai/agents/mute/AGENT.md"]);
    const dormant = findings.filter((f) => f.type === "stale_marker");
    assert.deepEqual(
      dormant.map((f) => f.path),
      ["clients/dossier.md"],
      "recent business markers and TRANSLATING.md's marker vocabulary stay silent",
    );
    assert.match(dormant[0].message, /31 jours/);
    for (const f of [...dormant, ...findings.filter((f) => f.type === "weak_routing" || f.type === "missing_description")]) {
      assert.equal(f.severity, "warn");
      assert.ok(f.fix_hint);
    }
  });

  it("a stale adopted projection warns with the exact rebuild command; nothing by default", () => {
    const findings = diagnoseData({
      inventory: [],
      files: ["CLAUDE.md", ".ai/base.mjs"],
      staleProjections: [{ path: ".ai/agents/a/index.md", target: "routing-index" }],
      now: NOW,
    });
    assert.deepEqual(findings.map((f) => [f.type, f.severity, f.path]), [["stale_generated_projection", "warn", ".ai/agents/a/index.md"]]);
    assert.match(findings[0].fix_hint, /base build routing-index --write/);
    assert.deepEqual(diagnoseData({ inventory: [], files: ["CLAUDE.md", ".ai/base.mjs"], now: NOW }), []);
  });

  it("diagnose(root) compares adopted projections to their sources; hand-owned and absent files are exempt", async () => {
    // A root whose committed CLAUDE.md carries the provenance banner but predates the current
    // renderer (version dilution: an old generation serving yesterday's discipline) must warn;
    // a hand-written CLAUDE.md (no banner) and a never-adopted AGENTS.md must not.
    const root = await mkdtemp(path.join(tmpdir(), "doctor-stale-"));
    try {
      await mkdir(path.join(root, ".ai/agents/a"), { recursive: true });
      await writeFile(path.join(root, ".ai/agents/a/AGENT.md"), "---\nid: a\ntype: agent\ndescription: Agent de test des projections.\n---\n# A\n");
      await writeFile(path.join(root, ".ai/base.mjs"), "// lanceur factice pour le test\n");
      await writeFile(
        path.join(root, "CLAUDE.md"),
        "# BASE\n\n<!-- Généré par `base build bootstrap --write`. Ne pas éditer à la main: le corps canonique est dans `tools/core/bootstrap.mjs`. -->\n\nAncienne génération.\n",
      );
      const stale = (await diagnose(root)).filter((f) => f.type === "stale_generated_projection");
      assert.deepEqual(stale.map((f) => f.path), ["CLAUDE.md"], "banner + drift on CLAUDE.md only; absent AGENTS.md stays exempt");

      await writeFile(path.join(root, "CLAUDE.md"), "# Mon point d'entrée, écrit à la main.\n");
      const hand = (await diagnose(root)).filter((f) => f.type === "stale_generated_projection");
      assert.deepEqual(hand, [], "no banner: the file is hand-owned, never compared");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("diagnose(root) wires the loaders end to end (real example: healthy)", async () => {
    const findings = await diagnose("exemples/assistant-devis");
    assert.equal(findings.filter((f) => f.severity === "error").length, 0);
    assert.equal(findings.filter((f) => f.type === "stale_generated_projection").length, 0, "shipped example projections stay fresh");
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

// A-15 / A-04: attribution where it is owed, and an entry point whatever the tool.
describe("doctor — attribution and entry points", () => {
  const card = (over = {}) => ({ id: "x", type: "process", path: ".ai/agents/a/skills/processes/x/SKILL.md", scope: "personal", content: "# X", ...over });

  it("asks for attribution only when the root declares sharing", () => {
    const readme = { id: "readme", type: "document", path: "README.md", scope: "personal", content: "# Mon dossier\n" };
    const personal = diagnoseData({ inventory: [card(), readme], files: ["CLAUDE.md", ".ai/base.mjs"] });
    assert.equal(personal.some((f) => f.type === "missing_attribution"), false, "a private folder shares nothing");

    const shared = diagnoseData({ inventory: [card({ scope: "org" }), readme], files: ["CLAUDE.md", ".ai/base.mjs"] });
    const finding = shared.find((f) => f.type === "missing_attribution");
    assert.ok(finding, "a folder that shares credits the method it is built on");
    assert.match(finding.fix_hint, /a-i\.swiss/);

    const credited = diagnoseData({
      inventory: [card({ scope: "org" }), { ...readme, content: "# Mon dossier\n\nConstruit avec BASE, par AI Swiss, https://a-i.swiss\n" }],
      files: ["CLAUDE.md", ".ai/base.mjs"],
    });
    assert.equal(credited.some((f) => f.type === "missing_attribution"), false);
  });

  it("accepts ANY tool entry point, and asks for one only when none exists", () => {
    const withCursor = diagnoseData({ inventory: [card()], files: [".cursor/rules/assistant.mdc", ".ai/base.mjs"] });
    assert.equal(withCursor.some((f) => f.type === "missing_tool_artifacts"), false, "a Cursor root is not missing a CLAUDE.md");

    const withNone = diagnoseData({ inventory: [card()], files: [".ai/base.mjs"] });
    const finding = withNone.find((f) => f.type === "missing_tool_artifacts");
    assert.ok(finding);
    assert.match(finding.fix_hint, /--tool/);
  });
});

// A-17: what a card kept from its template, and a harness file nobody declared.
describe("doctor — template residue and undeclared harness files", () => {
  const card = (over = {}) => ({ id: "x", type: "process", path: ".ai/agents/a/skills/processes/x/SKILL.md", scope: "personal", metadata: {}, body: "# X", content: "# X", ...over });
  const files = ["CLAUDE.md", ".ai/base.mjs"];

  it("names an unfilled placeholder in a frontmatter value", () => {
    const findings = diagnoseData({ inventory: [card({ metadata: { handle: "{dataset-handle}" } })], files });
    const residue = findings.find((f) => f.type === "template_residue");
    assert.ok(residue);
    assert.match(residue.message, /\{dataset-handle\}/);
  });

  it("names the scaffold sentence a card never rewrote, in every language BASE can write it", () => {
    // The detector asks the language tables rather than carrying a French literal: a translated
    // scaffold would otherwise leave the check passing while the untouched card it exists to catch
    // sat in plain sight.
    for (const render of everyLanguage("scaffoldAgentDescription")) {
      const sentence = typeof render === "function" ? render("Atelier") : String(render);
      const findings = diagnoseData({ inventory: [card({ type: "agent", body: sentence })], files });
      assert.ok(findings.some((f) => f.type === "template_residue"), sentence);
    }
  });

  it("says nothing about a card whose description its author actually wrote", () => {
    const findings = diagnoseData({ inventory: [card({ type: "agent", body: "Nous réparons des vélos et gérons un atelier partagé." })], files });
    assert.equal(findings.some((f) => f.type === "template_residue"), false);
  });

  it("says nothing about a pattern a process TEACHES in code", () => {
    const teaching = card({ body: "Nommez le fichier `{YYYY-MM-DD}_{sujet}.html`, puis rangez-le.\n\n```\n{slug}/index.md\n```\n" });
    assert.equal(diagnoseData({ inventory: [teaching], files }).some((f) => f.type === "template_residue"), false);
  });

  it("exempts a template resource: a placeholder is its content", () => {
    const template = card({ type: "template", path: ".ai/agents/a/templates/devis/TEMPLATE.md", body: "Client: {nom}" });
    assert.equal(diagnoseData({ inventory: [template], files }).some((f) => f.type === "template_residue"), false);
  });

  it("names an entry point the root does not declare, and never removes it", () => {
    const findings = diagnoseData({
      inventory: [card()],
      files: ["CLAUDE.md", ".cursor/rules/assistant.mdc", ".ai/base.mjs"],
      declaredTools: ["claude-code"],
    });
    const undeclared = findings.find((f) => f.type === "undeclared_harness_file");
    assert.equal(undeclared.path, ".cursor/rules/assistant.mdc");
    assert.match(undeclared.fix_hint, /tools/);
    // Nothing is flagged when the root declares nothing: an older root keeps what it has.
    assert.equal(diagnoseData({ inventory: [card()], files: ["CLAUDE.md", ".cursor/rules/assistant.mdc", ".ai/base.mjs"] }).some((f) => f.type === "undeclared_harness_file"), false);
  });
});

// T-02b: a summary never replaces its sources.
describe("doctor — a document that derives from sources", () => {
  const source = { id: "barometre", type: "document", path: "data/barometre.md", scope: "personal", metadata: {}, body: "# Barème", content: "# Barème" };
  const summary = (over = {}) => ({ id: "synthese", type: "document", path: "notes/synthese.md", scope: "personal", metadata: { derived_from: ["barometre"] }, body: "# Synthèse", content: "# Synthèse", ...over });
  const files = ["CLAUDE.md", ".ai/base.mjs"];

  it("names a summary whose source moved after it was written", () => {
    const findings = diagnoseData({
      inventory: [source, summary()],
      files,
      mtimes: { "notes/synthese.md": 1000, "data/barometre.md": 2000 },
    });
    const stale = findings.find((f) => f.type === "derived_stale");
    assert.equal(stale.path, "notes/synthese.md");
    assert.match(stale.message, /data\/barometre\.md/);
  });

  it("says nothing while the summary is the more recent of the two", () => {
    const findings = diagnoseData({
      inventory: [source, summary()],
      files,
      mtimes: { "notes/synthese.md": 3000, "data/barometre.md": 2000 },
    });
    assert.equal(findings.some((f) => f.type === "derived_stale"), false);
  });

  it("is a reachability edge like may_use, and a declaration that leads nowhere is named", () => {
    // Reachability starts at the routable roots, so the deriving resource is a process here: what it
    // declares as its source is then reached, exactly as a competence it declares would be.
    const deriving = summary({ type: "process", path: ".ai/agents/a/skills/processes/synthese/SKILL.md" });
    const reachable = diagnoseData({ inventory: [source, deriving], files, mtimes: {} });
    assert.equal(reachable.some((f) => f.type === "orphan" && f.path === "data/barometre.md"), false);

    const broken = diagnoseData({ inventory: [summary({ metadata: { derived_from: ["disparu"] } })], files, mtimes: {} });
    assert.ok(broken.some((f) => f.type === "unresolved_declaration"));
  });
});
