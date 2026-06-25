// Spec coverage: FR-ROUTE-003
// The declarative routing policy: the monotone fold and the deny veto. These are the invariants that
// make "a process can never route outside its agent's intent" a property of the code, not of the model.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveEffectivePolicy, isAllowed, denyFilterResources } from "../tools/core/route-policy.mjs";
import { agentDirOf, ROUTABLE_KINDS } from "../tools/core/routing.mjs";

describe("resolveEffectivePolicy — the monotone fold", () => {
  it("no layers → default-allow policy (empty deny)", () => {
    assert.deepEqual(resolveEffectivePolicy(), { deny: [] });
    assert.deepEqual(resolveEffectivePolicy([]), { deny: [] });
  });

  it("deny accumulates as a sorted union down the chain", () => {
    assert.deepEqual(resolveEffectivePolicy([{ deny: ["b", "a"] }, { deny: ["a", "c"] }]).deny, ["a", "b", "c"]);
  });

  it("is deterministic — sorted deny regardless of input order", () => {
    assert.deepEqual(resolveEffectivePolicy([{ deny: ["z", "a"] }]).deny, ["a", "z"]);
  });
});

describe("isAllowed — the deny predicate", () => {
  it("default-allow: nothing denied unless a layer says so", () => {
    assert.equal(isAllowed("x", []), true);
    assert.equal(isAllowed("x"), true);
  });

  it("exact id", () => {
    assert.equal(isAllowed("paie", ["paie"]), false);
    assert.equal(isAllowed("devis", ["paie"]), true);
  });

  it("type:id and type:* (a whole class)", () => {
    assert.equal(isAllowed("paie", ["process:paie"], "process"), false);
    assert.equal(isAllowed("paie", ["process:paie"], "agent"), true); // type mismatch → allowed
    assert.equal(isAllowed("anything", ["agent:*"], "agent"), false); // whole class denied
    assert.equal(isAllowed("anything", ["agent:*"], "process"), true);
  });

  it("trailing-* prefix glob", () => {
    assert.equal(isAllowed("experimental-x", ["experimental-*"]), false);
    assert.equal(isAllowed("stable-x", ["experimental-*"]), true);
  });
});

describe("denyFilterResources — the shared pre-filter (upstream of both strategies)", () => {
  const ctx = { routableKinds: ROUTABLE_KINDS, agentDirOf };
  const agent = { id: "sales", type: "agent", path: ".ai/agents/sales/AGENT.md", metadata: {} };
  const devis = { id: "devis", type: "process", path: ".ai/agents/sales/skills/processes/devis/SKILL.md", metadata: {} };
  const comm = { id: "comm", type: "competence", path: ".ai/agents/sales/skills/competences/comm/SKILL.md", metadata: {} };

  it("default-allow: with no policy, every routable resource passes (behaviour-preserving)", () => {
    const out = denyFilterResources([agent, devis, comm], { ...ctx, rootDeny: [] });
    assert.deepEqual(out.map((r) => r.id), ["sales", "devis", "comm"]);
  });

  it("a non-routable resource always passes (it is not a routing target)", () => {
    const out = denyFilterResources([comm], { ...ctx, rootDeny: ["comm"] });
    assert.deepEqual(out.map((r) => r.id), ["comm"], "the competence is not a routing target, so deny does not touch it");
  });

  it("the agent's own routing.deny drops its process upstream", () => {
    const denying = { ...agent, metadata: { routing: { deny: ["process:devis"] } } };
    const out = denyFilterResources([denying, devis], ctx);
    assert.deepEqual(out.map((r) => r.id), ["sales"], "the denied process is gone before either strategy");
  });

  it("a root deny on the agent drops the agent AND its processes", () => {
    const out = denyFilterResources([agent, devis], { ...ctx, rootDeny: ["agent:sales"] });
    assert.deepEqual(out.map((r) => r.id), [], "the agent and its now-unreachable process are both dropped");
  });

  it("is idempotent — re-filtering already-filtered resources is a no-op", () => {
    const denying = { ...agent, metadata: { routing: { deny: ["process:devis"] } } };
    const once = denyFilterResources([denying, devis], ctx);
    const twice = denyFilterResources(once, ctx);
    assert.deepEqual(twice.map((r) => r.id), once.map((r) => r.id));
  });
});
