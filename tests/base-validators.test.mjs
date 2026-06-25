// Spec coverage: FR-VALID-001 FR-VALID-002 FR-VALID-003 FR-VALID-004 FR-VALID-005 FR-ONTOLOGY-002
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  createNotification,
  coreSchemaValidator,
  runValidators,
  requireFields,
  requireSchemaVersion,
  forbidSensitivity,
  hasField,
  piiScanner,
} from "../tools/core/validators.mjs";
import { validateBase } from "../tools/base-core.mjs";

const resource = (metadata, extra = {}) => ({ path: "x.md", metadata, ...extra });

describe("Notification + runValidators", () => {
  it("accumulates all problems and never throws on a misbehaving validator", () => {
    const boom = () => { throw new Error("kaboom"); };
    const n = runValidators(resource({ schema_version: "base.resource.v1", type: "nope" }), [coreSchemaValidator, boom]);
    const codes = n.errors.map((e) => e.code);
    assert.ok(codes.includes("base.type.invalid"));
    assert.ok(codes.includes("base.validator.threw"));
    assert.equal(n.ok, false);
  });

  it("coreSchemaValidator ignores files that don't opt into the contract", () => {
    const n = createNotification();
    coreSchemaValidator(resource({}), n); // no schema_version
    assert.deepEqual(n.errors, []);
  });
});

describe("coreSchemaValidator: egress hint when sensitivity implies confidentiality", () => {
  const base = { schema_version: "base.resource.v1", id: "r", type: "document", description: "d" };

  it("warns (never errors) when sensitivity is confidential/sensitive/restricted but confidential is not true", () => {
    for (const sensitivity of ["confidential", "sensitive", "restricted"]) {
      const n = createNotification();
      coreSchemaValidator(resource({ ...base, sensitivity }), n);
      assert.ok(
        n.warnings.some((w) => w.code === "base.confidential.egress_hint"),
        `expected egress hint for sensitivity=${sensitivity}`,
      );
      assert.deepEqual(n.errors, [], `sensitivity=${sensitivity} must warn, not error`);
    }
  });

  it("stays silent once confidential: true is set (egress will actually withhold it)", () => {
    const n = createNotification();
    coreSchemaValidator(resource({ ...base, sensitivity: "confidential", confidential: true }), n);
    assert.ok(!n.warnings.some((w) => w.code === "base.confidential.egress_hint"));
  });

  it("does not warn for sensitivity levels that carry no egress expectation", () => {
    for (const sensitivity of ["internal", "public"]) {
      const n = createNotification();
      coreSchemaValidator(resource({ ...base, sensitivity }), n);
      assert.ok(!n.warnings.some((w) => w.code === "base.confidential.egress_hint"));
    }
  });
});

describe("reference adapters", () => {
  it("requireFields errors on a missing field, scoped by scope", () => {
    const n1 = createNotification();
    requireFields(["owner"], { whenScope: "team" })(resource({ scope: "team" }), n1);
    assert.equal(n1.errors[0].code, "base.org.field_required");

    const n2 = createNotification();
    requireFields(["owner"], { whenScope: "team" })(resource({ scope: "personal" }), n2);
    assert.deepEqual(n2.errors, []); // wrong scope → skipped
  });

  it("requireSchemaVersion flips a no-schema_version file to an error when configured", () => {
    const n = createNotification();
    requireSchemaVersion({ whenScope: "team" })(resource({ scope: "team" }), n);
    assert.equal(n.errors[0].code, "base.schema.required");
  });

  it("forbidSensitivity respects the `unless` escape hatch", () => {
    const guard = forbidSensitivity("restricted", { unless: hasField("retention") });
    const blocked = createNotification();
    guard({ path: "a.md", sensitivity: "restricted", metadata: {} }, blocked);
    assert.equal(blocked.errors.length, 1);

    const allowed = createNotification();
    guard({ path: "a.md", sensitivity: "restricted", metadata: { retention: "P7Y" } }, allowed);
    assert.deepEqual(allowed.errors, []);
  });
});

describe("piiScanner reference validator", () => {
  const doc = (content) => ({ path: "x.md", metadata: {}, content });

  it("warns by default when a pattern matches, and stays silent on clean content", () => {
    const scan = piiScanner({ patterns: [/\b\d{3}-\d{2}-\d{4}\b/] }); // SSN-shaped

    const hit = createNotification();
    scan(doc("contact 123-45-6789 for details"), hit);
    assert.equal(hit.warnings[0]?.code, "base.pii.detected");
    assert.equal(hit.errors.length, 0);

    const clean = createNotification();
    scan(doc("nothing sensitive here"), clean);
    assert.deepEqual(clean.warnings, []);
    assert.deepEqual(clean.errors, []);
  });

  it("escalates to an error when severity is 'error'", () => {
    const scan = piiScanner({ patterns: [/secret/], severity: "error" });
    const n = createNotification();
    scan(doc("a secret value"), n);
    assert.equal(n.errors[0]?.code, "base.pii.detected");
  });

  it("does NOT skip resources when a pattern carries the global flag (statefulness regression)", () => {
    // A single validator instance is reused across resources. A /g (or /y) regex retains lastIndex
    // between .test() calls, which silently skipped every other resource before the fix.
    const scan = piiScanner({ patterns: [/\d{3}/g] });
    const flagged = [];
    for (const id of ["a", "b", "c", "d"]) {
      const n = createNotification();
      scan(doc(`resource ${id} has 123`), n);
      if (n.warnings.length) flagged.push(id);
    }
    assert.deepEqual(flagged, ["a", "b", "c", "d"], "every matching resource must be flagged");
  });
});

describe("validateBase consumes config.validators (extension path)", () => {
  let tmpDir;
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-valid-ext-"));
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("an org validator added via base.config.mjs is enforced by validateBase", async () => {
    await fs.writeFile(
      path.join(tmpDir, "base.config.mjs"),
      "export default { validators: [(r, n) => { if (r.metadata.schema_version && !r.metadata.owner) n.error(r.path, 'org.owner', 'owner required'); }] };",
      "utf8",
    );
    await fs.writeFile(
      path.join(tmpDir, "res.md"),
      "---\nschema_version: base.resource.v1\nid: r\ntype: process\ndescription: A resource.\n---\n# R\n",
      "utf8",
    );

    const result = await validateBase(tmpDir);
    assert.equal(result.ok, false);
    assert.match(result.errors.map((e) => e.message).join("\n"), /owner required/);
  });
});
