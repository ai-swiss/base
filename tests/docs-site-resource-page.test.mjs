// The resource page surfaces key metadata as pills and links to the source — interactions, so they
// are tested. These are the fast, hermetic checks on the helpers that drive both; the rendered page
// (pills in the HTML, the link hrefs, the Pagefind search index) is asserted in tests/docs-site-render.mjs,
// which runs against a real build via `npm run docs:test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { repoBlobUrl, resourcePills } from "../packages/base-docs-site/src/lib/metadata.mjs";
import { renderMarkdownBody } from "../packages/base-docs-site/src/lib/render-markdown.mjs";
import { splitSections } from "../tools/docs/model.mjs";

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

describe("resource page canonical heading rendering", () => {
  it("renders a translated body from canonical sections, ignoring fences and numbering repeats", () => {
    const body = [
      "# **Translated** title",
      "",
      "```md",
      "## Not a heading",
      "```",
      "",
      "## Repeated heading",
      "First.",
      "",
      "## Repeated heading",
      "Second.",
      "",
      "> ### Display heading inside a quote",
    ].join("\n");

    const rendered = renderMarkdownBody(body);

    assert.deepEqual(rendered.headings.map((heading) => heading.slug), [
      "translated-title",
      "repeated-heading",
      "repeated-heading-2",
    ]);
    assert.match(rendered.content, /<h1 id="translated-title"><strong>Translated<\/strong> title<\/h1>/);
    assert.match(rendered.content, /<h2 id="repeated-heading">Repeated heading<\/h2>/);
    assert.match(rendered.content, /<h2 id="repeated-heading-2">Repeated heading<\/h2>/);
    assert.doesNotMatch(rendered.content, /<h2 id="not-a-heading">/);
    assert.match(rendered.content, /<blockquote>[\s\S]*<h3>Display heading inside a quote<\/h3>/);
    assert.doesNotMatch(rendered.content, /id="display-heading-inside-a-quote"/);
  });

  it("uses explicit anchors without rendering their marker or heading comments", () => {
    const rendered = renderMarkdownBody("## Stable *word* <!-- editorial note --> {#fixed-anchor}\n");

    assert.deepEqual(rendered.headings, [{
      depth: 2,
      text: "Stable *word*",
      slug: "fixed-anchor",
    }]);
    assert.match(rendered.content, /<h2 id="fixed-anchor">Stable <em>word<\/em>\s*<\/h2>/);
    assert.doesNotMatch(rendered.content, /\{#fixed-anchor\}|editorial note|<!--/);
  });

  it("keeps canonical bodies exactly aligned with the exported section parser", () => {
    const body = "# Canonical\n\n## Risk\nOne.\n\n## Risk\nTwo.\n\n### Fixed {#stable}\nThree.\n";
    const expected = splitSections(body)
      .filter((section) => section.heading !== null)
      .map((section) => ({ depth: section.level, text: section.heading, slug: section.anchor }));

    const rendered = renderMarkdownBody(body);

    assert.deepEqual(rendered.headings, expected);
    for (const heading of expected) assert.match(rendered.content, new RegExp(`id="${heading.slug}"`));
  });
});
