// Spec coverage: FR-ROUTE-006
// Phase 6b: precompute the routing embeddings (a cross-invocation cache). Pure over an injected embedder,
// so the logic is proven without a model; the CLI wires a real Ollama/OpenAI-compatible embedder.

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, it } from "node:test";
import { precomputeRoutingVectors, applyRoutingVectors, loadRoutingVectors, writeRoutingVectors } from "../tools/core/routing-vectors.mjs";

const res = (o) => ({ keywords: [], metadata: {}, body: "", ...o });
// Deterministic mock embedder: [char length, word count] of the text. No model needed.
const mockEmbed = async (text) => [text.length, text.split(/\s+/).filter(Boolean).length];

const resources = [
  res({ id: "sales", type: "agent", path: ".ai/agents/sales/AGENT.md", description: "Ventes." }),
  res({ id: "devis", type: "process", path: ".ai/agents/sales/skills/processes/devis/SKILL.md", metadata: { use_when: "Préparer un devis client." } }),
  res({ id: "comm", type: "competence", path: ".ai/agents/sales/skills/competences/comm/SKILL.md", description: "Communication." }),
  res({ id: "old", type: "process", status: "deprecated", path: ".ai/agents/sales/skills/processes/old/SKILL.md", metadata: { use_when: "Vieux." } }),
];

describe("precomputeRoutingVectors — the cross-invocation cache", () => {
  it("embeds each routable, live resource — keyed by path; skips non-routable and deprecated", async () => {
    const vectors = await precomputeRoutingVectors(resources, mockEmbed);
    assert.ok(vectors[".ai/agents/sales/skills/processes/devis/SKILL.md"], "process vectorised");
    assert.ok(vectors[".ai/agents/sales/AGENT.md"], "agent vectorised");
    assert.equal(vectors[".ai/agents/sales/skills/competences/comm/SKILL.md"], undefined, "competence (non-routable) skipped");
    assert.equal(vectors[".ai/agents/sales/skills/processes/old/SKILL.md"], undefined, "deprecated skipped");
  });

  it("embeds the route_text (use_when), the same signal the Router scores", async () => {
    const vectors = await precomputeRoutingVectors([resources[1]], mockEmbed);
    const v = vectors[".ai/agents/sales/skills/processes/devis/SKILL.md"];
    assert.equal(v[1], 4, "4 words from «Préparer un devis client.»");
    assert.ok(v[0] > 0);
  });

  it("applyRoutingVectors injects by path, non-mutating, pass-through for misses", () => {
    const applied = applyRoutingVectors([resources[1], resources[2]], { [resources[1].path]: [1, 2] });
    assert.deepEqual(applied[0].embedding, [1, 2]);
    assert.equal(applied[1].embedding, undefined, "a resource with no precomputed vector passes through");
    assert.equal(resources[1].embedding, undefined, "non-mutating: the original is untouched");
  });
});

describe("loadRoutingVectors — the I/O adapter (tolerant)", () => {
  it("reads a written embeddings.json", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-vec-"));
    try {
      await fs.mkdir(path.join(dir, ".ai/routing"), { recursive: true });
      await fs.writeFile(path.join(dir, ".ai/routing/embeddings.json"), JSON.stringify({ "p.md": [1, 2] }));
      assert.deepEqual(await loadRoutingVectors(dir), { "p.md": [1, 2] });
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

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

  it("round-trips with writeRoutingVectors (the write side)", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-vec-"));
    try {
      const written = await writeRoutingVectors(dir, { "p.md": [3, 4] });
      assert.ok(written.endsWith(path.join(".ai", "routing", "embeddings.json")));
      assert.deepEqual(await loadRoutingVectors(dir), { "p.md": [3, 4] });
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
