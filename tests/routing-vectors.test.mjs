// Spec coverage: FR-ROUTE-006
// Phase 6b: precompute the routing embeddings (a cross-invocation cache). Pure over an injected embedder,
// so the logic is proven without a model; the CLI wires a real Ollama/OpenAI-compatible embedder.
// The cache is STAMPED (base.routing_vectors.v1): each entry carries the hash of the route_text it
// embedded, the file names its embedder, and verifyRoutingVectors drops (and reports) what drifted —
// a stale vector is a visible fact, never silently served. Confidential resources are never embedded.

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, it } from "node:test";
import {
  ROUTING_VECTORS_SCHEMA,
  applyRoutingVectors,
  hashRouteText,
  loadRoutingVectors,
  precomputeRoutingVectors,
  verifyRoutingVectors,
  writeRoutingVectors,
} from "../tools/core/routing-vectors.mjs";

const res = (o) => ({ keywords: [], metadata: {}, body: "", ...o });
// Deterministic mock embedder: [char length, word count] of the text. No model needed.
const mockEmbed = async (text) => [text.length, text.split(/\s+/).filter(Boolean).length];

const resources = [
  res({ id: "sales", type: "agent", path: ".ai/agents/sales/AGENT.md", description: "Ventes." }),
  res({ id: "devis", type: "process", path: ".ai/agents/sales/skills/processes/devis/SKILL.md", metadata: { use_when: "Préparer un devis client." } }),
  res({ id: "comm", type: "competence", path: ".ai/agents/sales/skills/competences/comm/SKILL.md", description: "Communication." }),
  res({ id: "old", type: "process", status: "deprecated", path: ".ai/agents/sales/skills/processes/old/SKILL.md", metadata: { use_when: "Vieux." } }),
  res({ id: "secret", type: "process", confidential: true, path: ".ai/agents/sales/skills/processes/secret/SKILL.md", metadata: { use_when: "Dossier confidentiel." } }),
];

describe("precomputeRoutingVectors — the cross-invocation cache", () => {
  it("embeds each routable, live resource — keyed by path; skips non-routable, deprecated AND confidential", async () => {
    const { vectors, skippedConfidential } = await precomputeRoutingVectors(resources, mockEmbed);
    assert.ok(vectors[".ai/agents/sales/skills/processes/devis/SKILL.md"], "process vectorised");
    assert.ok(vectors[".ai/agents/sales/AGENT.md"], "agent vectorised");
    assert.equal(vectors[".ai/agents/sales/skills/competences/comm/SKILL.md"], undefined, "competence (non-routable) skipped");
    assert.equal(vectors[".ai/agents/sales/skills/processes/old/SKILL.md"], undefined, "deprecated skipped");
    // Egress on the BUILD path: a confidential route_text never reaches an embedder (it may be remote).
    assert.equal(vectors[".ai/agents/sales/skills/processes/secret/SKILL.md"], undefined, "confidential never embedded");
    assert.equal(skippedConfidential, 1, "and the skip is counted, so the CLI says it out loud");
  });

  it("embeds the route_text (use_when) and stamps each entry with its hash", async () => {
    const { vectors } = await precomputeRoutingVectors([resources[1]], mockEmbed);
    const entry = vectors[".ai/agents/sales/skills/processes/devis/SKILL.md"];
    assert.equal(entry.v[1], 4, "4 words from «Préparer un devis client.»");
    assert.ok(entry.v[0] > 0);
    assert.equal(entry.h.length, 16, "sha256-derived route_text fingerprint");
  });

  it("applyRoutingVectors injects by path, non-mutating, pass-through for misses", () => {
    const applied = applyRoutingVectors([resources[1], resources[2]], { [resources[1].path]: [1, 2] });
    assert.deepEqual(applied[0].embedding, [1, 2]);
    assert.equal(applied[1].embedding, undefined, "a resource with no precomputed vector passes through");
    assert.equal(resources[1].embedding, undefined, "non-mutating: the original is untouched");
  });
});

describe("verifyRoutingVectors — staleness is a visible fact, never silently served", () => {
  it("keeps a vector whose route_text hash still matches, drops and REPORTS one that drifted", async () => {
    const { vectors } = await precomputeRoutingVectors([resources[0], resources[1]], mockEmbed);
    const loaded = { schema_version: ROUTING_VECTORS_SCHEMA, embedder: "ollama/embeddinggemma", vectors };
    // The owner edits the use_when after the precompute: that entry no longer speaks for the resource.
    const edited = { ...resources[1], metadata: { use_when: "Préparer une offre entièrement nouvelle." } };
    const out = verifyRoutingVectors([resources[0], edited], loaded);
    assert.deepEqual(Object.keys(out.byPath), [resources[0].path], "fresh vector kept");
    assert.deepEqual(out.stale, [resources[1].path], "drifted vector dropped AND named");
    assert.equal(out.embedder, "ollama/embeddinggemma", "the stamp travels for the model-mismatch check");
    assert.equal(out.legacy, false);
  });

  it("a legacy bare map (pre-v1, no hashes) keeps working but is flagged legacy", () => {
    const out = verifyRoutingVectors(resources, { [resources[1].path]: [1, 2] });
    assert.equal(out.legacy, true, "no hashes → staleness undetectable → flagged for doctor");
    assert.deepEqual(out.byPath, { [resources[1].path]: [1, 2] }, "trusted as before");
  });

  it("null in, null out — a cache miss, never a failure", () => {
    const out = verifyRoutingVectors(resources, null);
    assert.equal(out.byPath, null);
    assert.deepEqual(out.stale, []);
  });

  it("hashRouteText is stable and content-sensitive", () => {
    assert.equal(hashRouteText("a"), hashRouteText("a"));
    assert.notEqual(hashRouteText("a"), hashRouteText("b"));
  });
});

describe("loadRoutingVectors — the I/O adapter (tolerant)", () => {
  it("returns null when absent or malformed — a cache miss, never a routing failure", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-vec-"));
    try {
      assert.equal(await loadRoutingVectors(dir), null, "absent → null");
      await fs.mkdir(path.join(dir, ".ai/routing"), { recursive: true });
      await fs.writeFile(path.join(dir, ".ai/routing/embeddings.json"), "not json");
      assert.equal(await loadRoutingVectors(dir), null, "malformed → null");
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it("round-trips the stamped envelope with writeRoutingVectors (embedder + dimension + entries)", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-vec-"));
    try {
      const written = await writeRoutingVectors(dir, { "p.md": { h: hashRouteText("x"), v: [3, 4] } }, { embedder: "ollama/embeddinggemma" });
      assert.ok(written.endsWith(path.join(".ai", "routing", "embeddings.json")));
      const loaded = await loadRoutingVectors(dir);
      assert.equal(loaded.schema_version, ROUTING_VECTORS_SCHEMA);
      assert.equal(loaded.embedder, "ollama/embeddinggemma");
      assert.equal(loaded.dimension, 2);
      assert.deepEqual(loaded.vectors["p.md"].v, [3, 4]);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it("still reads a legacy bare map (a pre-v1 cache is not thrown away)", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-vec-"));
    try {
      await fs.mkdir(path.join(dir, ".ai/routing"), { recursive: true });
      await fs.writeFile(path.join(dir, ".ai/routing/embeddings.json"), JSON.stringify({ "p.md": [1, 2] }));
      assert.deepEqual(await loadRoutingVectors(dir), { "p.md": [1, 2] });
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
