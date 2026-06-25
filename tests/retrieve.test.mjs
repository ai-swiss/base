// The Retriever adapter (tools/core/retrieve.mjs): the embedding strategy, stage 1 — broad recall by embeddings.
// Pure over an injected `embed`; the resource's precomputed `route_text` vector travels ON the
// resource (`resource.embedding`), so the top-k-by-rank logic, the no-vector fallback, and the
// routable filter are all proven with a deterministic stub — no model, no network.
//
// Spec coverage: FR-ROUTE-011

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { makeEmbeddingRetriever } from "../tools/core/retrieve.mjs";

// A resource with the fields routing reads. The embedding is the precomputed route_text vector.
const res = (o) => ({ keywords: [], metadata: {}, body: "", status: "active", ...o });

// Deterministic embedder: map text to a 2-D vector by two keyword axes, so cosine is predictable.
// "devis"/"facture" load axis 0, "congé"/"paie" load axis 1; the query points where its words point.
const axisEmbed = async (text) => {
  const t = String(text).toLowerCase();
  const x = (t.includes("devis") ? 1 : 0) + (t.includes("facture") ? 1 : 0);
  const y = (t.includes("congé") || t.includes("conge") ? 1 : 0) + (t.includes("paie") ? 1 : 0);
  return [x || 0.01, y || 0.01]; // never the zero vector (cosine undefined)
};

const devis = res({ id: "devis", type: "process", path: ".ai/agents/sales/skills/processes/devis/SKILL.md", metadata: { use_when: "Préparer un devis ou une facture." } });
const conge = res({ id: "conge", type: "process", path: ".ai/agents/rh/skills/processes/conge/SKILL.md", metadata: { use_when: "Poser un congé." } });
const paie = res({ id: "paie", type: "process", path: ".ai/agents/rh/skills/processes/paie/SKILL.md", metadata: { use_when: "Consulter la paie." } });

// Place each resource's precomputed vector ON the resource (`resource.embedding`), exactly as
// applyRoutingVectors does upstream of the broker — the one vector source the retriever reads.
async function withVectors(resources) {
  return Promise.all(resources.map(async (r) => ({ ...r, embedding: await axisEmbed(r.metadata.use_when) })));
}

describe("makeEmbeddingRetriever — top-k by rank", () => {
  it("returns the top-k candidates ranked by cosine to the query", async () => {
    const resources = await withVectors([devis, conge, paie]);
    const retrieve = makeEmbeddingRetriever({ embed: axisEmbed });

    const out = await retrieve("préparer un devis", resources, 2);
    assert.equal(out.length, 2, "k caps the result count");
    assert.equal(out[0].resource.id, "devis", "the best cosine match ranks first");
    assert.ok(out[0].similarity > out[1].similarity, "strictly ranked, no cutoff");
  });

  it("carries each candidate's derived route_text and avoid_text", async () => {
    const withAvoid = res({ id: "devis", type: "process", path: ".ai/agents/sales/skills/processes/devis/SKILL.md", metadata: { use_when: "Préparer un devis.", routing: { avoid_when: ["pour une commande déjà signée"] } } });
    const [vectored] = await withVectors([withAvoid]);
    const retrieve = makeEmbeddingRetriever({ embed: axisEmbed });

    const [c] = await retrieve("devis", [vectored], 5);
    assert.equal(c.route_text, "Préparer un devis.");
    assert.equal(c.avoid_text, "pour une commande déjà signée");
  });

  it("reads a resource's own .embedding (applyRoutingVectors) as the one vector source", async () => {
    const applied = { ...devis, embedding: [1, 0.01] };
    const retrieve = makeEmbeddingRetriever({ embed: axisEmbed });
    const [c] = await retrieve("devis", [applied], 5);
    assert.equal(c.resource.id, "devis", "the in-resource embedding is used");
  });

  it("returns ALL candidates when there are fewer than k", async () => {
    const resources = await withVectors([devis, conge]);
    const retrieve = makeEmbeddingRetriever({ embed: axisEmbed });
    const out = await retrieve("congé", resources, 10);
    assert.equal(out.length, 2, "fewer than k → all of them");
  });

  it("ignores non-routable resources (only agents and processes are candidates)", async () => {
    const competence = res({ id: "comm", type: "competence", path: ".ai/agents/sales/skills/competences/comm/SKILL.md", description: "Communication." });
    const [vectored] = await withVectors([devis]);
    const retrieve = makeEmbeddingRetriever({ embed: axisEmbed });
    const out = await retrieve("devis", [vectored, competence], 10);
    assert.deepEqual(out.map((c) => c.resource.id), ["devis"], "the competence is not a routing candidate");
  });

  it("skips deprecated and archived resources, like the floor", async () => {
    const old = res({ id: "old-devis", type: "process", status: "deprecated", path: ".ai/agents/sales/skills/processes/old/SKILL.md", metadata: { use_when: "Vieux devis." } });
    const resources = await withVectors([devis, old]);
    const retrieve = makeEmbeddingRetriever({ embed: axisEmbed });
    const out = await retrieve("devis", resources, 10);
    assert.deepEqual(out.map((c) => c.resource.id), ["devis"], "deprecated is skipped");
  });

  it("a resource with no vector falls back gracefully (ranks last, never crashes)", async () => {
    // `paie` deliberately has NO precomputed vector; devis/conge do.
    const resources = [...(await withVectors([devis, conge])), paie];
    const retrieve = makeEmbeddingRetriever({ embed: axisEmbed });
    const out = await retrieve("paie", resources, 10);

    assert.equal(out.length, 3, "the no-vector resource still appears");
    const last = out[out.length - 1];
    assert.equal(last.resource.id, "paie", "a no-vector resource ranks below any vectored match");
    assert.ok(out[0].similarity > last.similarity, "vectored matches outrank the lexical fallback");
  });

  it("an empty corpus retrieves nothing (the refiner then abstains)", async () => {
    const retrieve = makeEmbeddingRetriever({ embed: axisEmbed });
    assert.deepEqual(await retrieve("anything", [], 10), []);
  });

  it("requires an embed function", () => {
    assert.throws(() => makeEmbeddingRetriever({}), /requires an `embed` function/);
  });
});
