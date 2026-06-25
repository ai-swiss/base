// Spec coverage: FR-ROUTE-003
// The deny veto end-to-end: an agent's routing.deny removes its own process from the candidates before
// the decision, so the Router can never route to it — the structural-safety invariant, wired into
// decideRoute (Phase 5b) over the pure route-policy module (Phase 5a). Default-allow stays
// behaviour-preserving, proven by the control case routing normally with no policy.

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

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-route-veto-"));
  await write(
    ".ai/agents/rh/skills/processes/paie/SKILL.md",
    "---\nid: consulter-paie\ntype: process\nuse_when: Consulter ou afficher la paie d'un employé.\n---\n# Paie\n",
  );
  await write(
    ".ai/agents/rh/skills/processes/conge/SKILL.md",
    "---\nid: poser-conge\ntype: process\nuse_when: Poser ou demander un congé.\n---\n# Congé\n",
  );
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("routeRequest — the deny veto (Phase 5b wiring)", () => {
  it("control: with no policy, a paie request routes to the paie process", async () => {
    await write(".ai/agents/rh/AGENT.md", "---\nid: rh\ntype: agent\ndescription: Ressources humaines.\n---\n# RH\n");
    const out = await routeRequest(tmpDir, "consulter la paie d'un employé");
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "consulter-paie");
  });

  it("the agent's routing.deny vetoes its own process — it is never routed to", async () => {
    await write(
      ".ai/agents/rh/AGENT.md",
      "---\nid: rh\ntype: agent\ndescription: Ressources humaines.\nrouting:\n  deny:\n    - \"process:consulter-paie\"\n---\n# RH\n",
    );
    const out = await routeRequest(tmpDir, "consulter la paie d'un employé");
    assert.notEqual(out.process?.id, "consulter-paie", `the vetoed process was routed: ${JSON.stringify(out)}`);
    // The denied target must not leak into the candidate shortlist either — the spec tells the LLM to
    // choose from that list, so a leak would let the model reach what the structural rules forbid.
    assert.ok(
      !JSON.stringify(out.candidates ?? []).includes("consulter-paie"),
      `denied target leaked into candidates: ${JSON.stringify(out.candidates)}`,
    );
  });
});
