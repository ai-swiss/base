// Spec coverage: FR-VALID-001 FR-VALID-002 FR-VALID-003 FR-VALID-004 FR-VALID-005 FR-ONTOLOGY-002 FR-ROUTE-017
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

  it("does not interpret the removed execution.dry_run extension", () => {
    const n = createNotification();
    coreSchemaValidator(
      resource({
        schema_version: "base.resource.v1",
        id: "r",
        type: "tool",
        description: "A tool.",
        execution: { type: "script", dry_run: "uninterpreted extension" },
      }),
      n,
    );
    assert.ok(!n.errors.some((error) => error.code === "base.execution.dry_run_type"));
  });

  it("requires requires[].purpose to be explanatory text when present", () => {
    const n = createNotification();
    coreSchemaValidator(
      resource({
        schema_version: "base.resource.v1",
        id: "r",
        type: "process",
        description: "A process.",
        requires: [{ ref: "source", purpose: ["not", "text"] }],
      }),
      n,
    );
    assert.equal(n.errors.find((error) => error.code === "base.requires.purpose_type")?.path, "x.md");
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

// A card whose counter-examples are written with its own words refuses the requests it exists for.
// The router's veto zeroes such a candidate, so the author must hear it while writing, not from a
// user whose request was refused.
describe("validateBase names a card that vetoes its own declared examples", () => {
  let tmpDir;
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-self-veto-"));
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const writeProcess = (frontmatter) =>
    fs.mkdir(path.join(tmpDir, ".ai/agents/rh/skills/processes/procedure"), { recursive: true })
      .then(() => fs.writeFile(path.join(tmpDir, ".ai/agents/rh/skills/processes/procedure/SKILL.md"), frontmatter, "utf8"));

  it("names the phrasing, the shared words and what to change", async () => {
    await writeProcess(
      "---\nschema_version: base.resource.v1\nid: ecrire-procedure\ntype: process\ndescription: Écrire une procédure.\n" +
      "use_when: Quand une façon de faire doit devenir une procédure écrite.\n" +
      "routing:\n  avoid_when:\n    - Pas pour l'intégration d'une personne, la procédure d'intégration le décrit.\n" +
      "  examples:\n    - transformer notre intégration en procédure écrite\n---\n# Procédure\n",
    );
    const result = await validateBase(tmpDir);
    const warning = result.warnings.find((w) => w.code === "base.route.self_veto");
    assert.ok(warning, `expected a self_veto warning, got ${JSON.stringify(result.warnings)}`);
    assert.match(warning.message, /transformer notre intégration en procédure écrite/);
    assert.match(warning.message, /intégration/); // the shared word is named
    assert.match(warning.message, /éviter si/);   // and what to rewrite
  });

  it("stays silent when the counter-example uses the words of the case it excludes", async () => {
    await writeProcess(
      "---\nschema_version: base.resource.v1\nid: ecrire-procedure\ntype: process\ndescription: Écrire une procédure.\n" +
      "use_when: Quand une façon de faire doit devenir une procédure écrite.\n" +
      "routing:\n  avoid_when:\n    - Pas pour un contrat de travail ni une fiche de salaire.\n" +
      "  examples:\n    - transformer notre intégration en procédure écrite\n---\n# Procédure\n",
    );
    const result = await validateBase(tmpDir);
    assert.equal(result.warnings.some((w) => w.code === "base.route.self_veto"), false);
  });

  it("says nothing about a card with no declared examples: there is no phrasing to judge", async () => {
    await writeProcess(
      "---\nschema_version: base.resource.v1\nid: ecrire-procedure\ntype: process\ndescription: Écrire une procédure.\n" +
      "use_when: Quand une façon de faire doit devenir une procédure écrite.\n" +
      "routing:\n  avoid_when:\n    - Pas pour l'intégration d'une personne, la procédure d'intégration le décrit.\n---\n# Procédure\n",
    );
    const result = await validateBase(tmpDir);
    assert.equal(result.warnings.some((w) => w.code === "base.route.self_veto"), false);
  });
});

// S-11: an id may carry a namespace, and every id written before this stays valid.
describe("the id grammar accepts a dotted namespace", () => {
  const check = (id) => runValidators(resource({ schema_version: "base.resource.v1", id, type: "process", description: "d" }), [coreSchemaValidator]);
  const refused = (id) => check(id).errors.some((e) => e.code === "base.id.invalid");

  it("accepts a namespace, and still every hyphen-only id", () => {
    assert.equal(refused("devis"), false);
    assert.equal(refused("nouveau-devis"), false);
    assert.equal(refused("client.contrats.resiliation"), false);
  });

  it("refuses what would make an id ambiguous", () => {
    // A dot is a separator, so it needs a segment on each side; the rest of the grammar is unchanged.
    for (const id of [".resiliation", "contrats.", "a..b", "Client.contrats", "client contrats"]) {
      assert.equal(refused(id), true, id);
    }
  });

  it("names the namespace in the message, so the fix is readable", () => {
    const message = check("Client.Contrats").errors.find((e) => e.code === "base.id.invalid").message;
    assert.match(message, /espace de noms/);
  });
});
