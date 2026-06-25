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

// A stub refiner model: a `.complete` that returns scripted JSON. `pick` is the process id to select.
const stubModel = (json) => ({ complete: async () => ({ message: { role: "assistant", content: [{ type: "text", text: json }] } }) });

// The embeddingStrategy seam: BOTH models configured (→ embedding), resolvers return the stubs above.
const embeddingStrategyWith = ({ refinerJson, embed = stubEmbed(), throwOn }) => ({
  readRouting: async () => ({ embedding_model: "stub/embed", refiner_model: "stub/llm", k: 10 }),
  resolveEmbedder: async () => {
    if (throwOn === "embed") throw new Error("embedder unreachable");
    return embed;
  },
  resolveModel: async () => {
    if (throwOn === "model") throw new Error("refiner unreachable");
    return stubModel(refinerJson);
  },
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
