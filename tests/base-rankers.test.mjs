// Spec coverage: FR-RANK-001 FR-RANK-002 FR-RANK-003 FR-RANK-004
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";
import { normalize, lexicalRanker, keywordIntentRanker, semanticHybridRanker, composeRankers, mergeScore, vectorFrom, cosineSimilarity } from "../tools/core/rankers.mjs";
import { routeRequest, searchResources } from "../tools/base-core.mjs";
import { createSemanticRanker, vectorFrom as pkgVectorFrom, cosineSimilarity as pkgCosine } from "../packages/base-ranker-semantic/index.mjs";

const res = (o) => ({ id: "", title: "", description: "", keywords: [], path: "", body: "", ...o });

describe("vector helpers parity with @ai-swiss/base-ranker-semantic (deliberate zero-dep copy)", () => {
  // The core duplicates vectorFrom/cosineSimilarity because the dependency-free semanticHybrid ranker
  // cannot import the optional companion. This pins the two copies to identical behaviour so they
  // cannot silently drift (the divergence the magisterial review flagged).
  it("vectorFrom agrees on every shape, including empty, non-finite and non-array", () => {
    for (const v of [[], [1, 2, 3], [0, 0, 0], [1, NaN], [1, "x"], "nope", null, undefined, [[1]]]) {
      assert.deepEqual(vectorFrom(v), pkgVectorFrom(v), `vectorFrom mismatch for ${JSON.stringify(v)}`);
    }
  });

  it("cosineSimilarity agrees, with zero-norm and length mismatch both yielding null", () => {
    for (const [a, b] of [[[1, 0], [1, 0]], [[1, 0], [0, 1]], [[1, 2], [2, 4]], [[0, 0], [1, 1]], [[1, 2], [1, 2, 3]], [[], [1]], ["a", "b"], [[1, 2], null]]) {
      assert.deepEqual(cosineSimilarity(a, b), pkgCosine(a, b), `cosine mismatch for ${JSON.stringify([a, b])}`);
    }
    assert.equal(cosineSimilarity([0, 0], [1, 1]), null, "a zero vector is no signal, not a 0 score");
    assert.equal(cosineSimilarity([1, 2], [1, 2, 3]), null, "a length mismatch is no signal");
  });
});

describe("lexicalRanker (neutral default)", () => {
  it("scores by field weight with an explainable reason and no business vocabulary", () => {
    const r = lexicalRanker(res({ id: "nouveau-devis", title: "Nouveau devis", keywords: ["vente"] }), ["devis"]);
    assert.equal(r.score, 80 + 50); // id + title
    assert.ok(r.reasons.includes("id:devis"));
    assert.ok(r.reasons.includes("title:devis"));
    assert.equal(r.reasons.some((x) => x.startsWith("intent:")), false);
  });

  it("normalizes diacritics", () => {
    assert.equal(normalize("Métier Privé"), "metier prive");
    const r = lexicalRanker(res({ title: "Métier" }), ["metier"]);
    assert.equal(r.score, 50);
  });
});

describe("keywordIntentRanker (declarative, opt-in)", () => {
  const devis = res({ keywords: ["prospect", "devis"], description: "Créer un devis client." });

  it("applies a boost when `when` + `require` (with | alternatives) all match", () => {
    const ranker = keywordIntentRanker({
      "intent:prospect-commercial": { when: (t) => t.includes("prospect"), require: ["prospect", "devis|client"], boost: 160 },
    });
    const hit = ranker(devis, ["prospect"]);
    assert.equal(hit.score, 160);
    assert.deepEqual(hit.reasons, ["intent:prospect-commercial"]);

    const miss = ranker(devis, ["autre"]); // when() false
    assert.equal(miss.score, 0);
  });

  it("supports the declarative `whenIncludes` form (for .json config)", () => {
    const ranker = keywordIntentRanker({
      "intent:offre": { whenIncludes: ["offre"], require: ["devis"], boost: 60 },
    });
    assert.equal(ranker(devis, ["offre"]).score, 60);
    assert.equal(ranker(devis, ["offre"]).reasons[0], "intent:offre");
  });

  it("does not fire when a required clause is absent", () => {
    const ranker = keywordIntentRanker({ x: { whenIncludes: ["prospect"], require: ["inexistant"], boost: 99 } });
    assert.equal(ranker(devis, ["prospect"]).score, 0);
  });
});

describe("semanticHybridRanker (official robust adapter)", () => {
  it("matches configured semantic aliases when lexical scoring would miss", () => {
    const ranker = semanticHybridRanker({
      aliases: {
        offboarding: ["fin relation", "depart collaborateur", "quitte equipe"],
      },
    });
    const resource = res({
      title: "Départ collaborateur",
      description: "Accompagner une fin de relation de travail propre.",
    });

    const lexical = lexicalRanker(resource, ["offboarding"]);
    const semantic = ranker(resource, ["offboarding"]);

    assert.equal(lexical.score, 0);
    assert.ok(semantic.score > 0);
    assert.ok(semantic.reasons.some((reason) => reason.startsWith("semantic:alias:offboarding")));
  });

  it("uses precomputed embeddings when an index or adapter provides them", () => {
    const ranker = semanticHybridRanker({ embeddingWeight: 100 });
    const resource = res({ metadata: { routing_embedding: [1, 0, 0] } });

    const result = ranker(resource, ["anything"], { queryEmbedding: [1, 0, 0] });

    assert.equal(result.score, 100);
    assert.deepEqual(result.reasons, ["semantic:embedding"]);
  });

  it("composes with lexicalRanker without becoming the router decision", () => {
    const ranker = composeRankers([
      lexicalRanker,
      semanticHybridRanker({ aliases: { offboarding: ["depart collaborateur"] } }),
    ]);
    const result = ranker(res({ title: "Départ collaborateur" }), ["offboarding"]);

    assert.ok(result.score > 0);
    assert.ok(result.reasons.some((reason) => reason.startsWith("semantic:alias:offboarding")));
  });
});

describe("composeRankers / mergeScore", () => {
  it("sums scores and dedupes reasons", () => {
    const a = { score: 10, reasons: ["x", "y"] };
    const b = { score: 5, reasons: ["y", "z"] };
    assert.deepEqual(mergeScore(a, b), { score: 15, reasons: ["x", "y", "z"] });
  });

  it("a neutral compose equals the lexical ranker alone", () => {
    const compose = composeRankers([lexicalRanker]);
    const r = res({ id: "x", title: "x" });
    assert.deepEqual(compose(r, ["x"]), lexicalRanker(r, ["x"]));
  });
});

describe("searchResources injects config.rankers (extension path)", () => {
  let tmpDir;
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-rank-ext-"));
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("a project that wants an intent boost gets it via base.config, never from the core", async () => {
    await fs.writeFile(
      path.join(tmpDir, "devis.md"),
      "---\nid: nouveau-devis\ntype: process\ndescription: Creer un devis client.\nkeywords: [prospect, devis]\n---\n# Nouveau devis\n",
      "utf8",
    );

    // Neutral (no config): no intent reason.
    const neutral = await searchResources(tmpDir, "prospect");
    assert.equal(neutral[0].reasons.some((x) => x.startsWith("intent:")), false);

    // With a project ranker injected: the boost + reason appear, localised.
    const boosted = await searchResources(tmpDir, "prospect", {
      config: {
        rankers: [keywordIntentRanker({ "intent:prospect-commercial": { whenIncludes: ["prospect"], require: ["prospect", "devis|client"], boost: 160 } })],
        validators: [],
        policy: null,
        auth: null,
      },
    });
    assert.ok(boosted[0].reasons.includes("intent:prospect-commercial"));
    assert.ok(boosted[0].score >= 160);
  });

  it("a project can opt into semanticHybrid via declarative config", async () => {
    await fs.writeFile(
      path.join(tmpDir, "rh.md"),
      "---\nid: depart-collaborateur\ntype: process\ndescription: Accompagner une fin de relation de travail.\n---\n# Départ collaborateur\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(tmpDir, "base.config.json"),
      JSON.stringify({
        rankers: [{ type: "semanticHybrid", aliases: { offboarding: ["fin relation"] } }],
      }),
      "utf8",
    );

    const results = await searchResources(tmpDir, "offboarding");

    assert.equal(results[0].id, "depart-collaborateur");
    assert.ok(results[0].reasons.some((reason) => reason.startsWith("semantic:alias:offboarding")));
  });

  it("awaits async rankers from executable config for real embedding adapters", async () => {
    await fs.writeFile(
      path.join(tmpDir, "devis.md"),
      "---\nid: nouveau-devis\ntype: process\ndescription: Préparer un devis client.\n---\n# Devis\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(tmpDir, "facture.md"),
      "---\nid: facture\ntype: process\ndescription: Traiter une facture contestée.\n---\n# Facture\n",
      "utf8",
    );
    const semanticPackage = path.resolve("packages/base-ranker-semantic/index.mjs");
    await fs.writeFile(
      path.join(tmpDir, "base.config.mjs"),
      [
        `import { createSemanticRanker } from ${JSON.stringify(pathToFileURL(semanticPackage).href)};`,
        "const embed = async (text) => String(text).includes('offre') || String(text).includes('devis') ? [1, 0] : [0, 1];",
        "export default { rankers: [createSemanticRanker({ embed, minSimilarity: 0.8 })] };",
      ].join("\n"),
      "utf8",
    );

    const results = await searchResources(tmpDir, "offre");

    assert.equal(results[0].id, "nouveau-devis");
    assert.ok(results[0].reasons.some((reason) => reason.startsWith("semantic:embedding:")));
  });

  it("awaits async embedding rankers from routeRequest", async () => {
    await fs.mkdir(path.join(tmpDir, ".ai/agents/rh/skills/processes/depart"), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, ".ai/agents/rh/AGENT.md"),
      "---\nid: rh\ntype: agent\ndescription: Ressources humaines.\n---\n# RH\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(tmpDir, ".ai/agents/rh/skills/processes/depart/SKILL.md"),
      "---\nid: depart-collaborateur\ntype: process\ndescription: Accompagner une fin de relation de travail.\nuse_when: Quand un collaborateur quitte l'entreprise.\n---\n# Départ\n",
      "utf8",
    );
    const ranker = createSemanticRanker({
      embed: async (text) => String(text).includes("offboarding") || String(text).includes("quitte") ? [1, 0] : [0, 1],
      minSimilarity: 0.8,
    });

    const out = await routeRequest(tmpDir, "offboarding", {
      config: { rankers: [ranker], validators: [], policy: null, auth: null, routing: null },
    });

    assert.equal(out.status, "routed");
    assert.equal(out.agent.id, "rh");
    assert.equal(out.process.id, "depart-collaborateur");
    assert.ok(out.candidates[0].reasons.some((reason) => reason.startsWith("semantic:embedding:")));
  });
});
