// Spec coverage: FR-ROUTE-003
// The adversarial routing net. Requests that MUST abstain at the deterministic floor — so a future
// ranker change can never make the router "succeed by accident" on noise. Cases here are ones the
// FLOOR can decide (short-term/substring noise, unrelated, out of scope). Cases that need a model
// (semantic paraphrase, negation, cross-lingual) belong to the agent/embeddings tier and arrive with
// those tiers — the floor abstains on them honestly. The corpus is synthetic and stable, so the
// assertions never depend on the evolving dogfood.

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { routeRequest } from "../tools/base-core.mjs";

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-route-adversarial-"));
  await fs.mkdir(path.join(tmpDir, ".ai/agents/sales/skills/processes/nouveau-devis"), { recursive: true });
  await fs.writeFile(
    path.join(tmpDir, ".ai/agents/sales/AGENT.md"),
    "---\nid: sales\ntype: agent\ndescription: Ventes, devis et offres commerciales.\n---\n# sales\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(tmpDir, ".ai/agents/sales/skills/processes/nouveau-devis/SKILL.md"),
    "---\nid: nouveau-devis\ntype: process\ndescription: Préparer une offre commerciale.\n"
      + "use_when: Quand l'utilisateur veut préparer une nouvelle offre commerciale ou un devis client.\n---\n# nouveau-devis\n",
    "utf8",
  );
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("adversarial net — the floor abstains on noise (floor can decide)", () => {
  // "me" and "mer" are bare substrings of "commerciale"; before whole-word matching of short terms,
  // these manufactured a route. They must now abstain.
  for (const request of ["me me me", "écris-moi un poème sur la mer", "quelle heure est-il à Tokyo", "aaa bbb ccc"]) {
    it(`«${request}» → never routed`, async () => {
      const out = await routeRequest(tmpDir, request);
      assert.notEqual(
        out.status,
        "routed",
        `routed wrongly: ${JSON.stringify({ status: out.status, agent: out.agent?.id, process: out.process?.id })}`,
      );
    });
  }

  it("a real intent still routes — the net does not over-abstain", async () => {
    const out = await routeRequest(tmpDir, "préparer une offre commerciale pour un client");
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "nouveau-devis");
  });
});
