// Every FRENCH docs page carries authored base.resource.v1 frontmatter with a description: the
// description is the retrieval signal `base discover` weighs (a page without one falls back to a
// derived, truncated first paragraph — the exact weakness that buried versions-et-stabilite.md under
// function words). The standard asks its adopters for routable metadata; its own documentation eats
// the same cooking. EN mirrors are exempt: docs/en is inventory-excluded (FR is authoritative), and
// the mirrors carry the fr-synced marker instead.

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const docsDir = path.join(repoRoot, "docs");

async function frenchDocsPages(dir) {
  const pages = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "en") continue; // mirrors: fr-synced marker, not frontmatter
      pages.push(...(await frenchDocsPages(full)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      pages.push(full);
    }
  }
  return pages;
}

describe("docs frontmatter — every French page is a first-class retrieval citizen", () => {
  it("carries base.resource.v1 frontmatter with an authored description", async () => {
    const pages = await frenchDocsPages(docsDir);
    assert.ok(pages.length >= 70, `expected ≥ 70 French docs pages, found ${pages.length}`);
    const bare = [];
    for (const page of pages) {
      const content = await fs.readFile(page, "utf8");
      const rel = path.relative(repoRoot, page);
      if (!content.startsWith("---\n")) {
        bare.push(rel);
        continue;
      }
      const head = content.split("\n---", 2)[0];
      assert.ok(/^description: .{20,}/m.test(head), `${rel}: frontmatter lacks an authored description`);
    }
    assert.deepEqual(bare, [], `pages without frontmatter (add the base.resource.v1 block): ${bare.join(", ")}`);
  });
});
