// Spec coverage: FR-CORE-012
// Sections: the heading-delimited unit a model can cite. Anchors derive from the heading, an explicit
// {#slug} wins, a repeat is numbered, fenced code is never cut, and a renamed heading keeps its old
// citations working only through a superseded_anchors entry that names a heading still present.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify, splitSections, headingPath, renderOutline, findSection, passageOf } from "../tools/core/sections.mjs";

describe("sections", () => {
  it("derives anchors, honours explicit ones, numbers repeats, never cuts inside a fence", () => {
    const body = ["Preamble.", "# Top", "text", "## Risk assessment", "a", "## Risk assessment", "b", "## Custom {#feasibility}", "c", "```", "## not a heading", "```"].join("\n");
    const sections = splitSections(body);
    assert.deepEqual(sections.map((s) => s.anchor), [null, "top", "risk-assessment", "risk-assessment-2", "feasibility"]);
    assert.equal(sections[0].heading, null);
    assert.equal(sections[4].text, "c\n```\n## not a heading\n```");
    assert.equal(slugify("Étape 4 : évaluer & décider"), "etape-4-evaluer-decider");
  });

  it("keeps a numbered anchor unique when a heading spells the suffixed form out", () => {
    const sections = splitSections("## Risque\na\n## Risque 2\nb\n## Risque\nc");
    assert.deepEqual(sections.map((s) => s.anchor), ["risque", "risque-2", "risque-3"]);
  });

  it("drops an HTML comment on the heading line from the anchor and the heading", () => {
    const [s] = splitSections("## The two stacks <!-- fidelity: review -->\ntext");
    assert.equal(s.anchor, "the-two-stacks");
    assert.equal(s.heading, "The two stacks");
  });

  it("builds heading paths, renders an outline, cuts a passage at a word boundary", () => {
    const sections = splitSections("# A\n## B\nbb\n### C\ncc\n## D\ndd");
    assert.equal(headingPath(sections, 2), "A › B › C");
    assert.equal(renderOutline(sections).split("\n")[2], "    ### C  #c");
    assert.equal(findSection(sections, "c")?.heading, "C");
    const passage = passageOf({ text: "mot ".repeat(200) }, 40);
    assert.equal(passage.endsWith(" …"), true);
    assert.equal(passage.includes("mo …"), false);
  });

  it("a renamed heading keeps its old citations through the superseded map", () => {
    // «Risk assessment» was reworded to «Assessing risk»: the derived anchor moved with the heading,
    // while the citations already written down still say risk-assessment.
    const sections = splitSections("# Guide\n## Assessing risk\nrr\n## Feasibility\nff");
    const superseded = { "risk-assessment": "assessing-risk" };
    assert.equal(findSection(sections, "risk-assessment", superseded)?.heading, "Assessing risk");
    assert.equal(findSection(sections, "assessing-risk", superseded)?.heading, "Assessing risk");
  });

  it("an alias that is not declared, or no longer resolves, is not found rather than another section", () => {
    const sections = splitSections("# Guide\n## Assessing risk\nrr\n## Feasibility\nff");
    // Undeclared, stale (its target was deleted), and declared nowhere at all: each returns null, so
    // the caller answers with the anchors the document does have instead of quoting its first heading.
    assert.equal(findSection(sections, "risks", { "risk-assessment": "assessing-risk" }), null);
    assert.equal(findSection(sections, "old-scope", { "old-scope": "scope" }), null);
    assert.equal(findSection(sections, "risk-assessment"), null);
    assert.equal(findSection(sections, "risk-assessment", /** @type {any} */ (["risk-assessment"])), null);
  });
});
