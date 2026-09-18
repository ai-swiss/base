// Spec coverage: FR-CORE-008, FR-CORE-005
// Discover at section grain: passages carrying `id#anchor`, their heading path and their citation,
// ranked by a weight computed over the passage population. The two per-resource skips of resource
// grain hold here too: a withheld resource and a generated projection yield no passage either.
// Open at section grain: one passage, or the outline, and nothing describing a withheld body.

import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { openResource, searchResources } from "../tools/base-core.mjs";

const card = (/** @type {Record<string, string>} */ fields, /** @type {string} */ body) =>
  ["---", ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`), "---", body, ""].join("\n");

let root;
before(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), "base-sections-"));
  await writeFile(path.join(root, "base.config.json"), '{ "schema_version": "base.config.v1" }\n');
  await mkdir(path.join(root, "docs", "guide"), { recursive: true });
  await writeFile(
    path.join(root, "docs", "guide", "assess.md"),
    card(
      { schema_version: "base.resource.v1", id: "guide-assess", type: "document", description: "Assessing ideas.", cite_as: '"Guide (2026), p. 4"' },
      ["# Assess", "Intro line.", "## Risk assessment", "Examination of exceptional risks such as bias and oversight.", "## Feasibility", "Four areas are considered when assessing feasibility."].join("\n"),
    ),
  );
  await mkdir(path.join(root, "notes"), { recursive: true });
  await writeFile(
    path.join(root, "notes", "other.md"),
    card({ schema_version: "base.resource.v1", id: "other", type: "document", description: "Other." }, "# Other\n## Feasibility elsewhere\nfeasibility mentioned here too"),
  );
  await writeFile(
    path.join(root, "notes", "supported-schema.md"),
    card({ schema_version: "base.resource.v1", id: "supported-schema", type: "document", description: "Supported schema." }, "# Supported\n## Citation eligibility\nsupported-schema-citation-sentinel"),
  );
  await writeFile(
    path.join(root, "notes", "missing-schema.md"),
    "# Missing schema\n## Citation eligibility\nmissing-schema-citation-sentinel\n",
  );
  await writeFile(
    path.join(root, "notes", "unsupported-schema.md"),
    card({ schema_version: "base.resource.v2", id: "unsupported-schema", type: "document", description: "Unsupported schema." }, "# Unsupported\n## Citation eligibility\nunsupported-schema-citation-sentinel"),
  );
  await writeFile(
    path.join(root, "notes", "metadata-only.md"),
    card(
      { schema_version: "base.resource.v1", id: "metadata-only", type: "document", description: "metadata-only-sentinel" },
      "# Unrelated\n## First passage\nApples.\n## Second passage\nOranges.",
    ),
  );
  // The same guide after its heading was reworded: the citations already written say risk-assessment.
  await writeFile(
    path.join(root, "docs", "guide", "renamed.md"),
    [
      "---",
      "schema_version: base.resource.v1",
      "id: guide-renamed",
      "type: document",
      "description: Assessing ideas, reworded.",
      "superseded_anchors:",
      "  risk-assessment: assessing-risk",
      "---",
      "# Guide",
      "## Assessing risk",
      "Examination of exceptional risks.",
      "",
    ].join("\n"),
  );
  // A confidential card, and a generated projection carrying the provenance banner: neither is a hit.
  await writeFile(
    path.join(root, "notes", "secret.md"),
    card({ schema_version: "base.resource.v1", id: "secret", type: "document", description: "Secret.", confidential: "true" }, "# Secret\n## Feasibility of the merger\nfeasibility of the confidential merger"),
  );
  await writeFile(
    path.join(root, "notes", "map.md"),
    card({ schema_version: "base.resource.v1", id: "map", type: "document", description: "Map." }, "<!-- BASE:generated — ne pas éditer -->\n# Map\n## Feasibility index\nfeasibility of everything, listed"),
  );
});
after(async () => rm(root, { recursive: true, force: true }));

describe("discover at section grain", () => {
  it("admits a resource whose schema is exactly base.resource.v1", async () => {
    const hits = await searchResources(root, "supported schema citation sentinel", { grain: "section", limit: 20 });
    assert.ok(hits.some((hit) => hit.ref === "supported-schema#citation-eligibility"));
  });

  it("does not emit citations for a resource with no schema_version", async () => {
    const hits = await searchResources(root, "missing schema citation sentinel", { grain: "section", limit: 20 });
    assert.ok(hits.every((hit) => hit.path !== "notes/missing-schema.md"));
  });

  it("does not emit citations for an unsupported schema_version", async () => {
    const hits = await searchResources(root, "unsupported schema citation sentinel", { grain: "section", limit: 20 });
    assert.ok(hits.every((hit) => hit.path !== "notes/unsupported-schema.md"));
  });

  it("does not turn parent metadata alone into matching passages", async () => {
    const hits = await searchResources(root, "metadata only sentinel", { grain: "section", limit: 20 });
    assert.ok(hits.every((hit) => hit.path !== "notes/metadata-only.md"));
  });

  it("returns passages with their heading path, ref and citation, ranked", async () => {
    const hits = await searchResources(root, "feasibility areas", { grain: "section", limit: 5 });
    assert.equal(hits[0].ref, "guide-assess#feasibility");
    assert.equal(hits[0].heading_path, "Assess › Feasibility");
    assert.match(hits[0].passage, /^Four areas/);
    assert.equal(hits[0].citation, "Guide (2026), p. 4");
    assert.ok(hits.some((h) => h.ref === "other#feasibility-elsewhere"));
  });

  it("never carries the body or the content of the resource it comes from", async () => {
    const hits = await searchResources(root, "feasibility", { grain: "section" });
    assert.ok(hits.length >= 2);
    assert.ok(hits.every((h) => h.body === undefined && h.content === undefined && h.metadata === undefined));
  });

  it("scope narrows to a folder", async () => {
    const hits = await searchResources(root, "feasibility", { grain: "section", scope: "docs/guide" });
    assert.ok(hits.length >= 1);
    assert.ok(hits.every((h) => h.path.startsWith("docs/guide/")));
  });

  it("a generated projection yields no passage, at either grain", async () => {
    const sections = await searchResources(root, "feasibility", { grain: "section", limit: 20 });
    assert.ok(sections.every((h) => h.id !== "map"));
    const whole = await searchResources(root, "feasibility", { limit: 20 });
    assert.ok(whole.every((h) => h.id !== "map"));
  });

  it("a withheld resource yields no passage either, so its existence stays hidden", async () => {
    const egress = { modelLocality: /** @type {const} */ ("remote") };
    const sections = await searchResources(root, "merger feasibility", { grain: "section", limit: 20, egress });
    assert.ok(sections.every((h) => h.id !== "secret"));
    assert.ok(sections.every((h) => !h.passage.includes("confidential merger")));
    const local = await searchResources(root, "merger feasibility", { grain: "section", limit: 20 });
    assert.ok(local.some((h) => h.ref === "secret#feasibility-of-the-merger"));
  });

  it("resource grain is unchanged", async () => {
    const hits = await searchResources(root, "assessing", { limit: 3 });
    assert.equal(hits[0].id, "guide-assess");
    assert.equal(hits[0].section, undefined);
    assert.equal(hits[0].ref, undefined);
  });
});

describe("open at section grain", () => {
  it("returns the passage asked for, with its heading and its ref", async () => {
    const one = await openResource(root, "guide-assess", { section: "risk-assessment" });
    assert.equal(one.section.ref, "guide-assess#risk-assessment");
    assert.equal(one.section.heading_path, "Assess › Risk assessment");
    assert.match(one.content, /^## Risk assessment\n\nExamination of exceptional risks/);
    assert.ok(!one.content.includes("Four areas"));
  });

  it("opens the `id#anchor` form as it stands, an explicit section winning over the fragment", async () => {
    const byRef = await openResource(root, "guide-assess#feasibility");
    assert.equal(byRef.section.ref, "guide-assess#feasibility");
    assert.match(byRef.content, /Four areas/);
    const explicit = await openResource(root, "guide-assess#feasibility", { section: "risk-assessment" });
    assert.equal(explicit.section.ref, "guide-assess#risk-assessment");
    await assert.rejects(() => openResource(root, "nowhere#feasibility"), /Resource not found: nowhere/);
  });

  it("the outline projection lists the headings with their anchors", async () => {
    const outline = await openResource(root, "guide-assess", { projection: "outline" });
    assert.deepEqual(outline.outline.map((o) => o.anchor), ["assess", "risk-assessment", "feasibility"]);
    assert.deepEqual(outline.outline.map((o) => o.level), [1, 2, 2]);
    assert.match(outline.content, /^# Assess {2}#assess\n/);
    assert.ok(!outline.content.includes("Four areas"));
  });

  it("an unknown anchor names the anchors the document does have", async () => {
    await assert.rejects(
      () => openResource(root, "guide-assess", { section: "nope" }),
      /Section not found: guide-assess#nope\. Known sections: assess, risk-assessment, feasibility\./,
    );
  });

  it("a citation written before a heading was reworded still lands, through superseded_anchors", async () => {
    const renamed = await openResource(root, "guide-renamed#risk-assessment");
    assert.equal(renamed.section.ref, "guide-renamed#assessing-risk");
    assert.match(renamed.content, /^## Assessing risk/);
    // The map is the only bridge: an alias nobody declared is not-found, never the first heading.
    await assert.rejects(() => openResource(root, "guide-renamed#risks"), /Known sections: guide, assessing-risk/);
  });

  it("a withheld resource yields no outline and no section: its table of contents is content too", async () => {
    const egress = { modelLocality: /** @type {const} */ ("remote") };
    const outline = await openResource(root, "secret", { projection: "outline", egress });
    assert.equal(outline.withheld, true);
    assert.equal(outline.outline, undefined);
    assert.equal(outline.section, undefined);
    assert.ok(!outline.content.includes("Feasibility of the merger"));
    assert.ok(!JSON.stringify(outline).includes("merger"));
    // The same for a named section, and the anchor list of the refusal is not a way round it either.
    const one = await openResource(root, "secret#feasibility-of-the-merger", { egress });
    assert.equal(one.section, undefined);
    assert.ok(!JSON.stringify(one).includes("merger"));
    // Locally, the very same calls answer in full, so the two results differ only by egress.
    const open = await openResource(root, "secret", { projection: "outline" });
    assert.deepEqual(open.outline.map((o) => o.anchor), ["secret", "feasibility-of-the-merger"]);
  });
});
