// Spec coverage: FR-SCALE-001 FR-SCALE-002
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { deriveRoutingSignals } from "../../../tools/base-core.mjs";
import { buildIndex, loadIndex, saveIndex, searchIndex, serializeIndex, vectorFor } from "../index.mjs";

const RESOURCES = [
  { id: "sales", type: "agent", title: "Ventes", description: "Devis et offres.", keywords: [], path: ".ai/agents/sales/AGENT.md", use_when: "Quand il faut vendre.", metadata: {} },
  { id: "nouveau-devis", type: "process", title: "Nouveau devis", description: "Créer un devis client.", keywords: ["facture"], path: ".ai/agents/sales/skills/processes/nouveau-devis/SKILL.md", use_when: "Quand l'utilisateur veut préparer un devis.", metadata: {} },
  { id: "note", type: "document", title: "Note", description: "Un document non routable.", keywords: [], path: "notes/note.md", metadata: {} },
];

describe("buildIndex", () => {
  it("is a deterministic, idempotent projection", async () => {
    const a = await buildIndex(RESOURCES, { deriveSignals: deriveRoutingSignals });
    const b = await buildIndex([...RESOURCES].reverse(), { deriveSignals: deriveRoutingSignals });
    assert.equal(serializeIndex(a), serializeIndex(b)); // input order does not matter
    assert.equal(a.schema_version, "base.index.v1");
    assert.equal(a.built_at, null); // timestamp-free unless `now` is passed
    assert.equal(a.document_count, 3);
  });

  it("requires an injected deriveSignals", async () => {
    await assert.rejects(() => buildIndex(RESOURCES, {}), /deriveSignals/);
  });

  it("stores derived routing signals, not bodies", async () => {
    const index = await buildIndex(RESOURCES, { deriveSignals: deriveRoutingSignals });
    const process = index.documents.find((d) => d.id === "nouveau-devis");
    assert.equal(process.routable, true);
    assert.equal(process.agent_path, ".ai/agents/sales");
    assert.ok(process.route_text.length > 0);
    assert.equal("body" in process, false);
  });

  it("exposes precomputed embeddings through vectorFor", async () => {
    const index = await buildIndex(RESOURCES, {
      deriveSignals: deriveRoutingSignals,
      embed: async (texts) => texts.map((text, index) => [index + 1, text.length]),
    });

    assert.deepEqual(vectorFor(index, "nouveau-devis"), [2, index.documents[1].route_text.length]);
    assert.deepEqual(vectorFor(index, { id: "nouveau-devis" }), [2, index.documents[1].route_text.length]);
    assert.equal(vectorFor(index, "missing"), null);
  });
});

describe("searchIndex", () => {
  it("finds documents by a substring of an indexed token, ranked by weight", async () => {
    const index = await buildIndex(RESOURCES, { deriveSignals: deriveRoutingSignals });
    const hits = searchIndex(index, "devis");
    assert.ok(hits.length >= 1);
    assert.equal(hits[0].id, "nouveau-devis");
    assert.ok(hits[0].reasons.includes("index:devis"));
  });

  it("returns nothing for an out-of-vocabulary query", async () => {
    const index = await buildIndex(RESOURCES, { deriveSignals: deriveRoutingSignals });
    assert.deepEqual(searchIndex(index, "zzqq wibble"), []);
  });
});

describe("persistence (a deletable, regenerable projection)", () => {
  let dir;
  beforeEach(async () => { dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-index-")); });
  afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

  it("round-trips through disk and loses nothing when deleted and rebuilt", async () => {
    const file = path.join(dir, "local.json");
    const built = await buildIndex(RESOURCES, { deriveSignals: deriveRoutingSignals });
    await saveIndex(file, built);

    const loaded = await loadIndex(file);
    assert.equal(serializeIndex(loaded), serializeIndex(built));

    await fs.rm(file); // delete the artifact entirely
    const rebuilt = await buildIndex(RESOURCES, { deriveSignals: deriveRoutingSignals });
    await saveIndex(file, rebuilt);
    assert.equal(serializeIndex(await loadIndex(file)), serializeIndex(built)); // identical after rebuild
  });

  it("refuses to load a foreign file", async () => {
    const file = path.join(dir, "foreign.json");
    await fs.writeFile(file, JSON.stringify({ schema_version: "something.else" }));
    await assert.rejects(() => loadIndex(file), /base\.index\.v1/);
  });
});
