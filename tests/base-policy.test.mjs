// Spec coverage: FR-POLICY-001 FR-POLICY-002 FR-POLICY-003
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { advisoryPolicy, strictPolicy, resolvePolicy } from "../tools/core/policy.mjs";
import { proposeChange, commitChange } from "../tools/base-core.mjs";

describe("advisoryPolicy (default, unchanged)", () => {
  it("denies a restricted full read without purpose, needs_approval for sensitive", () => {
    assert.equal(advisoryPolicy({ sensitivity: "restricted" }, "read", { projection: "full" }).decision, "deny");
    assert.equal(advisoryPolicy({ sensitivity: "confidential" }, "read", {}).decision, "needs_approval");
    assert.equal(advisoryPolicy({}, "read", {}).decision, "allow");
  });
  it("write defaults to needs_approval, auto-allows opt-out, denies sensitive without confirm", () => {
    assert.equal(advisoryPolicy({}, "write", {}).decision, "needs_approval");
    assert.equal(advisoryPolicy({ requires_confirmation: false }, "write", {}).decision, "allow");
    assert.equal(advisoryPolicy({ sensitivity: "sensitive" }, "write", {}).decision, "deny");
  });
});

describe("strictPolicy (reference adapter, it bites)", () => {
  const strict = strictPolicy({ grants: new Set(["G1"]) });
  it("denies any unconfirmed write — even an opt-out resource", () => {
    assert.equal(strict({ requires_confirmation: false }, "write", {}).decision, "deny");
    assert.equal(strict({}, "write", { confirmed: true }).decision, "allow");
  });
  it("gates restricted reads behind a grant token", () => {
    assert.equal(strict({ sensitivity: "restricted" }, "read", {}).decision, "deny");
    assert.equal(strict({ sensitivity: "restricted" }, "read", { grantToken: "G1" }).decision, "allow");
  });
});

describe("resolvePolicy", () => {
  it("uses a function policy from config, else falls back to advisory", () => {
    const fn = () => ({ decision: "allow", reason: "x" });
    assert.equal(resolvePolicy({ policy: fn }), fn);
    assert.equal(resolvePolicy({}), advisoryPolicy);
  });

  it("warns (does not silently downgrade) on a truthy non-function policy", () => {
    const original = process.emitWarning;
    const warnings = [];
    process.emitWarning = (msg, opts) => warnings.push({ msg, code: opts?.code });
    try {
      // A raw descriptor reaching resolvePolicy means resolveConfig was bypassed.
      assert.equal(resolvePolicy({ policy: "strict-descriptor" }), advisoryPolicy);
    } finally {
      process.emitWarning = original;
    }
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].code, "BASE_POLICY_NOT_FUNCTION");
  });
});

describe("broker honours config.policy (swap without forking)", () => {
  let tmpDir;
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-policy-ext-"));
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  async function setupTarget(dir) {
    // A target that opts OUT of confirmation: under advisory, an unconfirmed commit auto-allows.
    await fs.writeFile(path.join(dir, "note.md"), "---\nid: n\ntype: document\nrequires_confirmation: false\n---\nold\n", "utf8");
    const proposal = await proposeChange(dir, "note.md", "---\nid: n\ntype: document\nrequires_confirmation: false\n---\nnew\n");
    return proposal.change_id;
  }

  it("advisory (no config): an opt-out write commits without --confirmed", async () => {
    const id = await setupTarget(tmpDir);
    const result = await commitChange(tmpDir, id, { confirmed: false });
    assert.equal(result.written, true);
  });

  it("strict (config.policy): an unconfirmed write is denied before staging", async () => {
    await fs.writeFile(
      path.join(tmpDir, "base.config.mjs"),
      "export default { policy: (resource, action, ctx) => (action === 'write' && !ctx.confirmed) ? { decision: 'deny', reason: 'strict' } : { decision: 'allow', reason: 'ok' } };",
      "utf8",
    );
    await fs.writeFile(path.join(tmpDir, "note.md"), "---\nid: n\ntype: document\nrequires_confirmation: false\n---\nold\n", "utf8");
    await assert.rejects(
      () => proposeChange(tmpDir, "note.md", "---\nid: n\ntype: document\nrequires_confirmation: false\n---\nnew\n"),
      /Write denied|strict/,
    );
    await assert.rejects(() => fs.access(path.join(tmpDir, ".ai", "changes")));
  });
});
