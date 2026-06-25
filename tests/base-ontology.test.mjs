// Spec coverage: UR-CORE-001 FR-CORE-005 FR-ONTOLOGY-001 FR-ONTOLOGY-002 RC-EGRESS-003
// The aging ontology: lifecycle/validity/confidentiality fields validated, the
// router blind to deprecated resources, the template type surfaced, and the context pack
// annotating expired reference data.

import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { inventoryResources, routeRequest, validateBase } from "../tools/base-core.mjs";
import { buildContextPack, renderContextPack } from "../tools/core/context-pack.mjs";
import { facets } from "../tools/studio/api.mjs";

const fm = (fields, body = "Corps.") =>
  `---\n${Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join("\n")}\n---\n${body}\n`;

const baseFields = (id, type, extra = {}) => ({
  schema_version: "base.resource.v1",
  id,
  type,
  title: id,
  description: `Ressource ${id}.`,
  ...extra,
});

describe("ontology — field validation", () => {
  let root;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-ontology-"));
  });
  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("accepts the new fields when well-formed, rejects bad formats and types", async () => {
    await writeFile(path.join(root, "ok.md"), fm(baseFields("ok", "document", {
      review_by: "2026-12-31",
      valid_from: "2026-01-01",
      valid_until: "2026-12-31",
      confidential: "true",
    })));
    await writeFile(path.join(root, "bad-status.md"), fm(baseFields("bad-status", "process", { status: "retired" })));
    await writeFile(path.join(root, "bad-review.md"), fm(baseFields("bad-review", "document", { review_by: "bientôt" })));
    await writeFile(path.join(root, "bad-order.md"), fm(baseFields("bad-order", "document", { valid_from: "2027-01-01", valid_until: "2026-01-01" })));
    await writeFile(path.join(root, "bad-conf.md"), fm(baseFields("bad-conf", "document", { confidential: "oui" })));

    const result = await validateBase(root);
    const codesFor = (file) => result.errors.filter((e) => e.path.endsWith(file)).map((e) => e.code);
    assert.deepEqual(codesFor("ok.md"), []);
    assert.ok(codesFor("bad-status.md").includes("base.status.invalid"));
    assert.ok(codesFor("bad-review.md").includes("base.review_by.format"));
    assert.ok(codesFor("bad-order.md").includes("base.validity.order"));
    assert.ok(codesFor("bad-conf.md").includes("base.confidential.type"));
  });
});

describe("ontology — the router never routes to deprecated", () => {
  let root;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-ontology-route-"));
    const agentDir = ".ai/agents/assistant";
    await mkdir(path.join(root, agentDir, "skills/processes/devis-v1"), { recursive: true });
    await mkdir(path.join(root, agentDir, "skills/processes/devis-v2"), { recursive: true });
    await writeFile(path.join(root, agentDir, "AGENT.md"), fm(baseFields("assistant", "agent", { use_when: "Pour tout devis." })));
    await writeFile(
      path.join(root, agentDir, "skills/processes/devis-v1/SKILL.md"),
      fm(baseFields("devis-v1", "process", { status: "deprecated", use_when: "Créer un devis pour un client." })),
    );
    await writeFile(
      path.join(root, agentDir, "skills/processes/devis-v2/SKILL.md"),
      fm(baseFields("devis-v2", "process", { status: "active", use_when: "Créer un devis pour un client." })),
    );
  });
  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("a deprecated process is never a candidate; its active twin is routed", async () => {
    const decision = await routeRequest(root, "je veux créer un devis pour un client");
    assert.equal(decision.status, "routed");
    assert.equal(decision.process.id, "devis-v2");
    assert.ok(decision.candidates.every((c) => c.id !== "devis-v1"));
  });
});

describe("ontology — template type", () => {
  it("the example template is inventoried as type template and shows in the Studio facets", async () => {
    const resources = await inventoryResources("exemples/assistant-devis");
    const template = resources.find((r) => r.id === "template-devis");
    assert.equal(template.type, "template");

    const f = await facets("exemples/assistant-devis");
    assert.ok(f.type.template >= 1);
  });
});

describe("ontology — the pack annotates expiry and demands exact citation", () => {
  it("an expired valid_until becomes «périmé depuis …» and reference data gets the citation rule", async () => {
    const inventory = [
      { path: "p/SKILL.md", type: "process", id: "p", body: "Utilise le [barème](bareme.md)." },
      { path: "bareme.md", type: "document", id: "bareme", metadata: { valid_from: "2025-01-01", valid_until: "2025-12-31" } },
    ];
    const pack = await buildContextPack(inventory, async () => "Taux : 7.7%", "p/SKILL.md", { now: "2026-06-11" });
    assert.match(pack.sections[0].note, /périmé depuis le 2025-12-31/);

    const rendered = renderContextPack(pack);
    assert.match(rendered, /cite les valeurs exactement/);

    // Still valid → no expiry note, but the citation rule stays (it is reference data).
    const fresh = await buildContextPack(inventory, async () => "Taux : 7.7%", "p/SKILL.md", { now: "2025-06-11" });
    assert.equal(fresh.sections[0].note, undefined);
    assert.match(renderContextPack(fresh), /cite les valeurs exactement/);
  });
});
