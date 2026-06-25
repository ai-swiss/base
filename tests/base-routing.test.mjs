// Spec coverage: FR-ROUTE-001 FR-ROUTE-002 FR-ROUTE-003 FR-ROUTE-004 FR-ROUTE-005
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  deriveRoutingSignals,
  decideRoute,
  buildRoutingRegistry,
  routeScopeOf,
  agentDirOf,
  routeText,
  ROUTING_DEFAULTS,
  ROUTING_REGISTRY_SCHEMA,
  withRoutedAgent,
} from "../tools/core/routing.mjs";
import { buildArtifacts, routeRequest, routeTerms, runRouteTests, routabilityWarnings, createNotification } from "../tools/base-core.mjs";

const res = (o) => ({ id: "", type: "process", title: "", description: "", keywords: [], path: "", body: "", metadata: {}, ...o });

describe("routeScopeOf / agentDirOf", () => {
  it("maps type to a route scope", () => {
    assert.equal(routeScopeOf("agent"), "agent");
    assert.equal(routeScopeOf("process"), "process");
    assert.equal(routeScopeOf("competence"), "resource");
  });

  it("extracts the agent directory from framework and example layouts, skipping scaffolding", () => {
    assert.equal(agentDirOf(".ai/agents/sales/AGENT.md"), ".ai/agents/sales");
    assert.equal(agentDirOf(".ai/agents/sales/skills/processes/devis/SKILL.md"), ".ai/agents/sales");
    assert.equal(agentDirOf("exemples/demo/.ai/agents/rh/AGENT.md"), "exemples/demo/.ai/agents/rh");
    assert.equal(agentDirOf(".ai/agents/_template/AGENT.md"), null);
    assert.equal(agentDirOf("docs/guide.md"), null);
  });
});

describe("routeText / deriveRoutingSignals", () => {
  it("prefers use_when, then description, then title (fallback chain) and names the source", () => {
    assert.deepEqual(
      routeText(res({ metadata: { use_when: "Créer un devis client." }, description: "Autre." })),
      { text: "Créer un devis client.", source: "use_when", has_examples: false },
    );
    assert.equal(routeText(res({ description: "Gérer la paie." })).source, "description");
    assert.equal(routeText(res({ title: "Onboarding" })).source, "title");
  });

  it("appends routing.examples to lift recall and flags them", () => {
    const signal = routeText(res({
      metadata: { use_when: "Préparer une offre.", routing: { examples: ["Devis pour Dupont SA"] } },
    }));
    assert.ok(signal.text.includes("Préparer une offre."));
    assert.ok(signal.text.includes("Devis pour Dupont SA"));
    assert.equal(signal.has_examples, true);
  });

  it("falls back to a conventional Quand utiliser section", () => {
    const signal = routeText(res({
      description: "",
      title: "",
      keywords: [],
      path: ".ai/agents/sales/skills/processes/relance/SKILL.md",
      body: "# Relance\n\n## Quand utiliser\n\nRelancer un client après une offre sans réponse.\n\n## Étapes\n\nFaire le point.",
    }));
    assert.equal(signal.source, "section");
    assert.match(signal.text, /Relancer un client/);
  });

  it("derives a complete routing signal with scope, agent_path and reasons", () => {
    const signals = deriveRoutingSignals(res({
      type: "process",
      path: ".ai/agents/sales/skills/processes/devis/SKILL.md",
      metadata: { use_when: "Créer un devis." },
    }));
    assert.equal(signals.route_scope, "process");
    assert.equal(signals.agent_path, ".ai/agents/sales");
    assert.equal(signals.route_text, "Créer un devis.");
    assert.equal(signals.avoid_text, "");
    assert.deepEqual(signals.reasons, ["route_text:use_when"]);
  });

  it("derives avoid_when as an internal negative routing signal", () => {
    const signals = deriveRoutingSignals(res({
      metadata: {
        use_when: "Créer une nouvelle facture.",
        routing: { avoid_when: ["Le client conteste une facture existante."] },
      },
    }));
    assert.equal(signals.avoid_text, "Le client conteste une facture existante.");
  });
});

describe("decideRoute — structural abstention (four statuses, no fake confidence)", () => {
  const agentsByDir = new Map([
    [".ai/agents/sales", { id: "sales", type: "agent", title: "Ventes", path: ".ai/agents/sales/AGENT.md" }],
    [".ai/agents/hr", { id: "hr", type: "agent", title: "RH", path: ".ai/agents/hr/AGENT.md" }],
  ]);
  const cand = (id, scope, dir, score) => ({
    resource: { id, type: scope === "agent" ? "agent" : "process", title: id, path: `${dir}/${id}.md` },
    score,
    reasons: ["route_text:description"],
    route_scope: scope,
    agent_path: dir,
  });
  const decide = (ranked) => decideRoute([...ranked].sort((a, b) => b.score - a.score), agentsByDir, ROUTING_DEFAULTS);

  it("routes to one clear agent + one clear process", () => {
    const out = decide([
      cand("sales", "agent", ".ai/agents/sales", 50),
      cand("nouveau-devis", "process", ".ai/agents/sales", 90),
      cand("config", "process", ".ai/agents/sales", 20),
    ]);
    assert.equal(out.status, "routed");
    assert.equal(out.reason_code, null);
    assert.equal(out.agent.id, "sales");
    assert.equal(out.process.id, "nouveau-devis");
  });

  it("abstains out_of_scope when nothing clears the floor", () => {
    const out = decide([cand("sales", "agent", ".ai/agents/sales", 10)]);
    assert.equal(out.status, "out_of_scope");
    assert.equal(out.reason_code, "below_floor");
    assert.equal(out.agent, null);
    assert.ok(out.next_question);
  });

  it("treats the floor score as inclusive", () => {
    const out = decide([
      cand("sales", "agent", ".ai/agents/sales", ROUTING_DEFAULTS.floor_score),
      cand("nouveau-devis", "process", ".ai/agents/sales", ROUTING_DEFAULTS.floor_score),
    ]);
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "nouveau-devis");
  });

  it("asks for clarification when two different agents compete", () => {
    const out = decide([
      cand("sales", "agent", ".ai/agents/sales", 90),
      cand("hr", "agent", ".ai/agents/hr", 85),
    ]);
    assert.equal(out.status, "needs_clarification");
    assert.equal(out.reason_code, "competing_intents");
    assert.equal(out.agent.id, "sales");
  });

  it("needs_clarification (no_clear_process) when the agent is clear but no process matches", () => {
    const out = decide([cand("sales", "agent", ".ai/agents/sales", 90)]);
    assert.equal(out.status, "needs_clarification");
    assert.equal(out.reason_code, "no_clear_process");
    assert.equal(out.agent.id, "sales");
    assert.equal(out.process, null);
  });

  it("does not produce a routed result when the winning process has no real agent card", () => {
    const out = decideRoute(
      [cand("orphan-process", "process", ".ai/agents/missing", 90)],
      new Map(),
      ROUTING_DEFAULTS,
    );
    assert.equal(out.status, "out_of_scope");
    assert.equal(out.agent, null);
    assert.equal(out.process, null);
    assert.deepEqual(out.candidates, []);
  });

  it("is ambiguous when two processes of the same agent are too close", () => {
    const out = decide([
      cand("sales", "agent", ".ai/agents/sales", 40),
      cand("nouveau-devis", "process", ".ai/agents/sales", 90),
      cand("modifier-devis", "process", ".ai/agents/sales", 85),
    ]);
    assert.equal(out.status, "ambiguous");
    assert.equal(out.reason_code, "two_close_candidates");
    assert.equal(out.process, null);
  });

  it("routes when the second process is just outside the ambiguity margin", () => {
    const out = decide([
      cand("sales", "agent", ".ai/agents/sales", 40),
      cand("nouveau-devis", "process", ".ai/agents/sales", 100),
      cand("modifier-devis", "process", ".ai/agents/sales", 79),
    ]);
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "nouveau-devis");
  });
});

describe("buildRoutingRegistry — deterministic projection", () => {
  it("groups processes under agents, sorts everything, and flags weak signals", () => {
    const resources = [
      res({ id: "sales", type: "agent", path: ".ai/agents/sales/AGENT.md", description: "Ventes et devis." }),
      res({ id: "b-proc", type: "process", path: ".ai/agents/sales/skills/processes/b/SKILL.md", metadata: { use_when: "B." } }),
      res({ id: "a-proc", type: "process", path: ".ai/agents/sales/skills/processes/a/SKILL.md", description: "A." }),
      res({ id: "weak", type: "process", path: ".ai/agents/sales/skills/processes/w/SKILL.md", title: "W", description: "" }),
      res({ id: "ignored", type: "competence", path: ".ai/agents/sales/skills/competences/x/SKILL.md" }),
    ];
    const registry = buildRoutingRegistry(resources);
    assert.equal(registry.schema_version, ROUTING_REGISTRY_SCHEMA);
    assert.equal(registry.agents.length, 1);
    assert.equal(registry.agents[0].agent.id, "sales");
    assert.deepEqual(registry.agents[0].processes.map((p) => p.id), ["a-proc", "b-proc", "weak"]);
    assert.ok(registry.diagnostics.weak_signals.includes(".ai/agents/sales/skills/processes/w/SKILL.md"));
  });

  it("is idempotent — same resources produce a byte-identical registry", () => {
    const resources = [res({ id: "a", type: "agent", path: ".ai/agents/a/AGENT.md", description: "A." })];
    assert.equal(JSON.stringify(buildRoutingRegistry(resources)), JSON.stringify(buildRoutingRegistry(resources)));
  });

  it("buildArtifacts exposes the routing registry projection without adding it to build all", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-route-build-"));
    try {
      await fs.mkdir(path.join(tmpDir, ".ai/agents/sales"), { recursive: true });
      await fs.writeFile(path.join(tmpDir, ".ai/agents/sales/AGENT.md"), "# Sales\n\nVentes.\n", "utf8");
      const all = await buildArtifacts(tmpDir, { targets: ["all"] });
      assert.equal(all.some((artifact) => artifact.target === "routing-registry"), false);
      const [registry] = await buildArtifacts(tmpDir, { targets: ["routing-registry"] });
      assert.equal(registry.path, ".ai/routing/registry.json");
      assert.match(registry.content, /"schema_version": "base.routing.v1"/);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("buildArtifacts exposes the routing-index projection (opt-in): a root index plus one per agent", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-route-index-"));
    try {
      await fs.mkdir(path.join(tmpDir, ".ai/agents/sales/skills/processes/devis"), { recursive: true });
      await fs.writeFile(path.join(tmpDir, ".ai/agents/sales/AGENT.md"), "---\nid: sales\ntype: agent\ndescription: Ventes et devis.\n---\n# Sales\n", "utf8");
      await fs.writeFile(path.join(tmpDir, ".ai/agents/sales/skills/processes/devis/SKILL.md"), "---\nid: nouveau-devis\ntype: process\nuse_when: Préparer un devis.\n---\n# Devis\n", "utf8");

      const all = await buildArtifacts(tmpDir, { targets: ["all"] });
      assert.equal(all.some((a) => a.target === "routing-index"), false, "opt-in: not in build all");

      const index = await buildArtifacts(tmpDir, { targets: ["routing-index"] });
      const paths = index.map((a) => a.path);
      assert.ok(paths.includes(".ai/routing/index.md"), "root index");
      assert.ok(paths.includes(".ai/agents/sales/index.md"), "per-agent index");
      assert.ok(index.every((a) => a.target === "routing-index"));
      assert.match(index.find((a) => a.path === ".ai/agents/sales/index.md").content, /nouveau-devis/);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});

describe("routeRequest (broker integration) + runRouteTests", () => {
  let tmpDir;
  const write = async (rel, content) => {
    const full = path.join(tmpDir, rel);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, content, "utf8");
  };
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-route-"));
    await write(".ai/agents/sales/AGENT.md", "---\nid: sales\ntype: agent\ndescription: Gère les ventes et les devis clients.\n---\n# Ventes\n");
    await write(".ai/agents/sales/skills/processes/devis/SKILL.md", "---\nid: nouveau-devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis pour un client.\n---\n# Nouveau devis\n");
    await write(".ai/agents/hr/AGENT.md", "---\nid: hr\ntype: agent\ndescription: Ressources humaines, recrutement et paie.\n---\n# RH\n");
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("routes a clear request to the right agent and process", async () => {
    const out = await routeRequest(tmpDir, "créer un devis pour un client");
    assert.equal(out.status, "routed");
    assert.equal(out.agent.id, "sales");
    assert.equal(out.process.id, "nouveau-devis");
    assert.ok(out.candidates.length > 0);
  });

  it("abstains (out_of_scope) on an unrelated request", async () => {
    const out = await routeRequest(tmpDir, "zzqq wibble flumph");
    assert.equal(out.status, "out_of_scope");
    assert.equal(out.reason_code, "below_floor");
  });

  it("abstains when the request contains no meaningful routing terms", async () => {
    const out = await routeRequest(tmpDir, "je veux un pour mon");
    assert.equal(out.status, "out_of_scope");
    assert.equal(out.reason_code, "below_floor");
  });

  it("drops common English fillers before scoring a route", () => {
    assert.deepEqual(routeTerms("review and adapt all issues in this BASE"), ["review", "adapt", "issues"]);
  });

  it("does not expose orphan routables as closed-list candidates", async () => {
    await write(".ai/agents/orphan/skills/processes/devis/SKILL.md", "---\nid: orphan-devis\ntype: process\ndescription: Créer un devis client.\n---\n# Devis\n");
    const out = await routeRequest(tmpDir, "créer un devis client");
    assert.equal(out.status, "routed");
    assert.equal(out.agent.id, "sales");
    assert.equal(out.candidates.some((candidate) => candidate.resource.id === "orphan-devis"), false);
  });

  it("does not pretend a root AGENT.md is a routable agent", async () => {
    await write("AGENT.md", "---\nid: root-agent\ntype: agent\ndescription: Agent racine pour les devis clients.\n---\n# Root\n");
    const out = await routeRequest(tmpDir, "devis client");
    assert.equal(out.status, "routed");
    assert.equal(out.agent.id, "sales");
    assert.equal(out.candidates.some((candidate) => candidate.resource.id === "root-agent"), false);
  });

  it("honours routing.avoid_when before structural decision", async () => {
    await write(".ai/agents/sales/skills/processes/contestation/SKILL.md", "---\nid: contestation\ntype: process\ndescription: Gérer une facture contestée.\nuse_when: Quand le client conteste une facture existante.\n---\n# Contestation\n");
    await write(".ai/agents/sales/skills/processes/facture/SKILL.md", "---\nid: nouvelle-facture\ntype: process\ndescription: Créer une facture.\nuse_when: Quand l'utilisateur veut créer une nouvelle facture client.\nrouting:\n  avoid_when:\n    - Le client conteste une facture existante.\n---\n# Facture\n");
    const out = await routeRequest(tmpDir, "le client conteste une facture existante");
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "contestation");
    assert.equal(out.candidates.some((candidate) => candidate.resource.id === "nouvelle-facture"), false);
  });

  it("can route paraphrases through the in-core semanticHybrid ranker", async () => {
    await write(".ai/agents/hr/skills/processes/offboarding/SKILL.md", "---\nid: depart-collaborateur\ntype: process\ndescription: Accompagner une fin de relation de travail.\n---\n# Départ collaborateur\n");
    await write("base.config.json", JSON.stringify({
      rankers: [{ type: "semanticHybrid", aliases: { offboarding: ["fin relation", "depart collaborateur"] } }],
    }));

    const out = await routeRequest(tmpDir, "offboarding");

    assert.equal(out.status, "routed");
    assert.equal(out.agent.id, "hr");
    assert.equal(out.process.id, "depart-collaborateur");
    assert.ok(out.candidates[0].reasons.some((reason) => reason.startsWith("semantic:alias:offboarding")));
  });

  it("never routes to a competence as a primary workflow", async () => {
    await write(".ai/agents/sales/skills/competences/tva/SKILL.md", "---\nid: tva\ntype: competence\ndescription: Règles de TVA pour un devis.\n---\n# TVA\n");
    const out = await routeRequest(tmpDir, "tva devis");
    assert.notEqual(out.process?.id, "tva");
    assert.ok(out.candidates.every((c) => c.route_scope !== "resource"));
  });

  it("runs a JSON routing fixtures file and reports pass/fail", async () => {
    await write(".ai/routing/route-tests.json", JSON.stringify([
      { request: "créer un devis pour un client", expect: { status: "routed", agent: "sales", process: "nouveau-devis" } },
      { request: "zzqq wibble", expect: { status: "out_of_scope" } },
    ]));
    const result = await runRouteTests(tmpDir);
    assert.equal(result.ok, true);
    assert.equal(result.passed, 2);
    assert.equal(result.total, 2);
  });

  it("reports a failing fixture with a readable mismatch", async () => {
    await write(".ai/routing/route-tests.json", JSON.stringify([
      { request: "créer un devis", expect: { agent: "hr" } },
    ]));
    const result = await runRouteTests(tmpDir);
    assert.equal(result.ok, false);
    assert.equal(result.failures.length, 1);
    assert.match(result.failures[0].mismatches[0], /agent/);
  });
});

describe("routabilityWarnings adapter (advisory, opt-in)", () => {
  it("warns a shared process that lacks use_when, and never errors", () => {
    const n = createNotification();
    routabilityWarnings()(res({ type: "process", scope: "team", description: "X.", metadata: { scope: "team" } }), n);
    assert.equal(n.errors.length, 0);
    assert.ok(n.warnings.some((w) => w.code === "base.route.no_use_when"));
  });

  it("ignores personal-scope processes and non-routable types", () => {
    const n = createNotification();
    routabilityWarnings()(res({ type: "process", scope: "personal", description: "X.", metadata: { scope: "personal" } }), n);
    routabilityWarnings()(res({ type: "competence", description: "" }), n);
    assert.equal(n.warnings.length, 0);
  });
});

describe("withRoutedAgent — a routed result always carries a real agent (FR-ROUTE-003)", () => {
  const corpus = [
    { id: "sales", type: "agent", title: "Ventes", path: ".ai/agents/sales/AGENT.md" },
    { id: "devis", type: "process", title: "Devis", path: ".ai/agents/sales/skills/processes/devis/SKILL.md" },
  ];
  const routedProcessOnly = {
    status: "routed", reason_code: null, agent: null,
    process: { id: "devis", type: "process", title: "Devis", path: ".ai/agents/sales/skills/processes/devis/SKILL.md" },
    candidates: [], explanation: "", next_question: null,
  };

  it("fills the agent from the full corpus when the refiner left it null (the embedding-strategy gap)", () => {
    const out = withRoutedAgent(routedProcessOnly, corpus);
    assert.equal(out.agent.id, "sales", "the process's owning agent is resolved from the corpus by its directory");
    assert.equal(out.process.id, "devis");
  });

  it("leaves an already-resolved agent untouched", () => {
    const withAgent = { ...routedProcessOnly, agent: { id: "x", type: "agent", title: "X", path: ".ai/agents/x/AGENT.md" } };
    assert.equal(withRoutedAgent(withAgent, corpus).agent.id, "x");
  });

  it("never fabricates: an abstention stays an abstention, and a missing agent card stays null", () => {
    assert.equal(withRoutedAgent({ ...routedProcessOnly, status: "needs_clarification" }, corpus).agent, null);
    assert.equal(withRoutedAgent(routedProcessOnly, [corpus[1]]).agent, null, "no agent card in the corpus → unchanged");
  });
});
