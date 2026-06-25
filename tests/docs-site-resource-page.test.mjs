// The resource page surfaces key metadata as pills and links to the source — interactions, so they
// are tested. These are the fast, hermetic checks on the helpers that drive both; the rendered page
// (pills in the HTML, the link hrefs, the Pagefind search index) is asserted in tests/docs-site-render.mjs,
// which runs against a real build via `npm run docs:test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { repoBlobUrl, resourcePills } from "../packages/base-docs-site/src/lib/metadata.mjs";

describe("resource page metadata helpers", () => {
  it("repoBlobUrl points at the canonical repository blob", () => {
    assert.equal(
      repoBlobUrl("docs/start/quickstart.md"),
      "https://github.com/ai-swiss/base/blob/main/docs/start/quickstart.md",
    );
  });

  it("derives a level pill and a role pill, and drops an audience that only repeats the level", () => {
    const pills = resourcePills({ learning_level: "beginner", doc_role: "tutorial", audience: ["beginner"] }, "fr");
    assert.deepEqual(pills, [
      { kind: "level", label: "Débutant" },
      { kind: "role", label: "Tutoriel" },
    ]);
  });

  it("keeps an audience that adds to the level, localized and prefixed", () => {
    const labels = resourcePills(
      { learning_level: "intermediate", doc_role: "guide", audience: ["developer", "maintainer"] },
      "fr",
    ).map((pill) => pill.label);
    assert.deepEqual(labels, ["Intermédiaire", "Guide", "Pour développeur", "Pour mainteneur"]);
  });

  it("localizes to English and falls back to the raw code when a value is unknown", () => {
    const pills = resourcePills({ learning_level: "advanced", doc_role: "wild", audience: [] }, "en");
    assert.deepEqual(pills, [
      { kind: "level", label: "Advanced" },
      { kind: "role", label: "wild" },
    ]);
  });
});
