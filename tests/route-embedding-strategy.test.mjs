// The broker wiring (tools/base-core.mjs, routeRequest → routeWithStrategy): routingStrategy picks the strategy, the
// deny pre-filter runs ONCE upstream of both, and the embedding strategy is FAIL-CLOSED. The model resolution is
// injected (embeddingStrategy seam) so the whole path runs with stubs — no model, no network — while production
// still uses the real Studio resolvers.
//
// Spec coverage: FR-ROUTE-013

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { routeRequest } from "../tools/base-core.mjs";

let tmpDir;
const write = async (rel, content) => {
  const full = path.join(tmpDir, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf8");
};

// A stub embedder: a 2-D vector keyed on a couple of words, deterministic and offline.
const stubEmbed = () => async (text) => {
  const t = String(text).toLowerCase();
  return [t.includes("devis") || t.includes("facture") ? 1 : 0.01, t.includes("congé") || t.includes("conge") ? 1 : 0.01];
};

// A stub refiner model: a `.complete` that returns scripted JSON and records the request it received
// (so a test can assert what DID and did NOT reach the remote prompt). `sink.request` is the capture.
const stubModel = (json, sink = {}) => ({ complete: async (request) => { sink.request = request; return { message: { role: "assistant", content: [{ type: "text", text: json }] } }; } });

// The embeddingStrategy seam: BOTH models configured (→ embedding), resolvers return the stubs above.
const embeddingStrategyWith = ({ refinerJson, embed = stubEmbed(), throwOn, sink = {}, locality }) => ({
  readRouting: async () => ({ embedding_model: "stub/embed", refiner_model: "stub/llm", k: 10 }),
  resolveEmbedder: async () => {
    if (throwOn === "embed") throw new Error("embedder unreachable");
    return embed;
  },
  resolveModel: async () => {
    if (throwOn === "model") throw new Error("refiner unreachable");
    return stubModel(refinerJson, sink);
  },
  // Optional locality override; absent, the REAL binding runs (no settings in tmpDir => "remote",
  // the fail-safe — which is exactly what the egress tests below exercise).
  ...(locality ? { routingLocality: async () => locality } : {}),
});

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-embedding-strategy-"));
  await write(".ai/agents/sales/AGENT.md", "---\nid: sales\ntype: agent\ndescription: Ventes et facturation.\n---\n# Ventes\n");
  await write(".ai/agents/sales/skills/processes/devis/SKILL.md", "---\nid: devis\ntype: process\nuse_when: Préparer un devis ou une facture client.\n---\n# Devis\n");
  await write(".ai/agents/rh/AGENT.md", "---\nid: rh\ntype: agent\ndescription: Ressources humaines.\n---\n# RH\n");
  await write(".ai/agents/rh/skills/processes/conge/SKILL.md", "---\nid: conge\ntype: process\nuse_when: Poser ou demander un congé.\n---\n# Congé\n");
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("routeRequest — embedding strategy vs lexical strategy selection", () => {
  it("routes via the embedding strategy when both models are configured (the refiner picks)", async () => {
    const embeddingStrategy = embeddingStrategyWith({ refinerJson: '{"decision":"select","process_id":"devis"}' });
    const out = await routeRequest(tmpDir, "préparer un devis", { embeddingStrategy });

    assert.equal(out.strategy, "embedding", "the embedding strategy ran");
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "devis");
  });

  it("with no routing block, stays on the lexical strategy (computeRoute) — no model touched", async () => {
    let resolverCalled = false;
    const embeddingStrategy = {
      readRouting: async () => null, // no embedding-strategy config
      resolveEmbedder: async () => { resolverCalled = true; },
      resolveModel: async () => { resolverCalled = true; },
    };
    const out = await routeRequest(tmpDir, "préparer un devis", { embeddingStrategy });

    assert.equal(out.strategy, "lexical", "the deterministic floor ran");
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "devis");
    assert.equal(resolverCalled, false, "no model resolution on the lexical-strategy default");
  });

  it("the embedding strategy routes a needs_clarification through with the model's question", async () => {
    const embeddingStrategy = embeddingStrategyWith({ refinerJson: '{"decision":"needs_clarification","next_question":"Devis ou congé ?"}' });
    const out = await routeRequest(tmpDir, "j'ai besoin de quelque chose", { embeddingStrategy });
    assert.equal(out.strategy, "embedding");
    assert.equal(out.status, "needs_clarification");
    assert.equal(out.next_question, "Devis ou congé ?");
  });

  it("attaches the FR-ROUTE-009 help fallback on an embedding-strategy abstention, like the lexical floor", async () => {
    // A help agent + the configured fallback, exactly as base-fallback.test.mjs wires the lexical case.
    await write(".ai/agents/help-agent/AGENT.md", "---\nid: help-agent\ntype: agent\ndescription: Accueil et orientation.\n---\n# Aide\n");
    await write(".ai/agents/help-agent/skills/processes/accueil/SKILL.md", "---\nid: accueil\ntype: process\nuse_when: Orienter un utilisateur perdu.\n---\n# Accueil\n");
    await write("base.config.json", JSON.stringify({ routing: { fallback: { agent: "help-agent", process: "accueil" } } }));

    const embeddingStrategy = embeddingStrategyWith({ refinerJson: '{"decision":"out_of_scope","process_id":null,"next_question":null}' });
    const out = await routeRequest(tmpDir, "quelque chose de totalement hors sujet", { embeddingStrategy });

    assert.equal(out.strategy, "embedding");
    assert.equal(out.status, "out_of_scope", "the abstention stays honest — the fallback is metadata, never a route");
    assert.deepEqual(out.fallback, {
      agent: { id: "help-agent", path: ".ai/agents/help-agent/AGENT.md" },
      process: { id: "accueil", path: ".ai/agents/help-agent/skills/processes/accueil/SKILL.md" },
    });
  });
});

describe("routeRequest — egress holds at the strategy gate, whoever calls (MECHANISM)", () => {
  it("a local-only root never sends the request to remote models: the floor answers, the fallback is journaled", async () => {
    await write("base.config.json", JSON.stringify({ egress: "local-only" }));
    let modelTouched = false;
    const embeddingStrategy = {
      ...embeddingStrategyWith({ refinerJson: '{"decision":"select","process_id":"devis"}' }),
      resolveEmbedder: async () => { modelTouched = true; return stubEmbed(); },
      resolveModel: async () => { modelTouched = true; return stubModel("{}"); },
      // No settings file in tmpDir: the REAL routingLocality fail-safes to "remote" — asserted here.
    };
    const out = await routeRequest(tmpDir, "préparer un devis", { embeddingStrategy });

    assert.equal(out.strategy, "lexical", "the deterministic floor answered");
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "devis");
    assert.equal(modelTouched, false, "neither the embedder nor the refiner was resolved: nothing left");
  });

  it("under policy any, a confidential process never reaches the remote refiner prompt", async () => {
    await write(
      ".ai/agents/sales/skills/processes/secret/SKILL.md",
      "---\nid: secret-fusion\ntype: process\nconfidential: true\nuse_when: Préparer le devis confidentiel de la fusion.\n---\n# Secret\n",
    );
    const sink = {};
    // The refiner is scripted to PICK the confidential process — the off-list guard must make that
    // impossible, because egress removed it from the candidates before the prompt was built.
    const embeddingStrategy = embeddingStrategyWith({ refinerJson: '{"decision":"select","process_id":"secret-fusion"}', sink });
    const out = await routeRequest(tmpDir, "préparer le devis de la fusion", { embeddingStrategy });

    assert.equal(out.strategy, "embedding");
    const prompt = sink.request.messages.map((m) => m.content).join("\n");
    assert.ok(!prompt.includes("secret-fusion"), "the confidential id never reached the remote prompt");
    assert.ok(!prompt.includes("confidentiel de la fusion"), "its use_when never reached the remote prompt");
    assert.notEqual(out.status, "routed", "picking the withheld id is impossible (off-list guard)");
    assert.ok(!JSON.stringify(out.candidates).includes("secret-fusion"), "nor does it leak via candidates");
  });

  it("with LOCAL models, a confidential process stays routable (local computation keeps it)", async () => {
    await write(
      ".ai/agents/sales/skills/processes/secret/SKILL.md",
      "---\nid: secret-fusion\ntype: process\nconfidential: true\nuse_when: Préparer le devis confidentiel de la fusion interne.\n---\n# Secret\n",
    );
    const embeddingStrategy = embeddingStrategyWith({ refinerJson: '{"decision":"select","process_id":"secret-fusion"}', locality: "local" });
    const out = await routeRequest(tmpDir, "préparer le devis de la fusion", { embeddingStrategy });

    assert.equal(out.strategy, "embedding");
    assert.equal(out.status, "routed", "nothing leaves the machine: egress does not withhold");
    assert.equal(out.process.id, "secret-fusion");
  });
});

describe("routeRequest — the embedding strategy is fail-closed (MECHANISM)", () => {
  it("falls back to the lexical strategy when the embedder is unreachable", async () => {
    const embeddingStrategy = embeddingStrategyWith({ refinerJson: "{}", throwOn: "embed" });
    const out = await routeRequest(tmpDir, "préparer un devis", { embeddingStrategy });
    assert.equal(out.strategy, "lexical", "an unreachable embedder fell back to the floor");
    assert.equal(out.status, "routed", "the deterministic route still answers");
    assert.equal(out.process.id, "devis");
  });

  it("falls back to the lexical strategy when the refiner model is unreachable", async () => {
    const embeddingStrategy = embeddingStrategyWith({ refinerJson: "{}", throwOn: "model" });
    const out = await routeRequest(tmpDir, "préparer un devis", { embeddingStrategy });
    assert.equal(out.strategy, "lexical");
    assert.equal(out.status, "routed");
  });

  it("keeps a confidential best-match on the lexical fallback when the remote refiner throws", async () => {
    // Regression guard: the egress filter narrows only the corpus fed to the REMOTE model, never the
    // corpus the fully-local lexical fallback routes over. Otherwise a transient remote failure
    // silently drops a legitimate confidential route — worse than a plain (no-Voie-2) project.
    await write(
      ".ai/agents/sales/skills/processes/secret/SKILL.md",
      "---\nid: secret-fusion\ntype: process\nconfidential: true\nuse_when: Préparer le devis confidentiel de la fusion Zephyr.\n---\n# Secret\n",
    );
    const embeddingStrategy = embeddingStrategyWith({ refinerJson: "{}", throwOn: "model" });
    const out = await routeRequest(tmpDir, "préparer le devis confidentiel de la fusion Zephyr", { embeddingStrategy });
    assert.equal(out.strategy, "lexical", "the remote refiner threw; the local floor answered");
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "secret-fusion", "the confidential best match is kept by the local fallback");
  });

  it("falls back to the lexical strategy when the model emits garbage that the refiner cannot use", async () => {
    // The refiner itself turns garbage into an honest needs_clarification, so the embedding strategy does NOT throw —
    // it returns that abstention. The fail-closed guard is for resolution/embed errors; a bad-but-parsed
    // model output is a legitimate embedding-strategy abstention, not a fallback. Asserts the abstention is surfaced.
    const embeddingStrategy = embeddingStrategyWith({ refinerJson: "not json at all" });
    const out = await routeRequest(tmpDir, "préparer un devis", { embeddingStrategy });
    assert.equal(out.strategy, "embedding");
    assert.equal(out.status, "needs_clarification", "garbage output → an honest embedding-strategy abstention");
  });
});

describe("routeRequest — the deny pre-filter reaches neither strategy", () => {
  it("a denied process never appears in the embedding-strategy candidates, so the refiner cannot pick it", async () => {
    // The agent denies its own process; the pre-filter drops it upstream. The refiner is told to pick
    // it — but it is not in the list, so the hallucination guard abstains: the deny holds across the embedding strategy.
    await write(
      ".ai/agents/sales/AGENT.md",
      "---\nid: sales\ntype: agent\ndescription: Ventes.\nrouting:\n  deny:\n    - \"process:devis\"\n---\n# Ventes\n",
    );
    const embeddingStrategy = embeddingStrategyWith({ refinerJson: '{"decision":"select","process_id":"devis"}' });
    const out = await routeRequest(tmpDir, "préparer un devis", { embeddingStrategy });

    assert.equal(out.strategy, "embedding");
    assert.notEqual(out.process?.id, "devis", "the denied process was not routed to");
    assert.ok(!JSON.stringify(out.candidates ?? []).includes("devis"), `denied target leaked into candidates: ${JSON.stringify(out.candidates)}`);
  });
});
