// The entry a web chat reads from the repository URL: PARTIR-DE-CE-QUE-VOUS-AVEZ.md is generated from
// the door process and what it declares, so it must never drift from its sources. A chat that reads
// a stale copy would follow an old door.

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { inventoryResources } from "../tools/base-core.mjs";
import { buildProcessPack } from "../tools/browser-pack.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const annexPath = ".ai/agents/concierge-base/templates/proposition.html";

async function regenerate() {
  const resources = await inventoryResources(repoRoot);
  const content = await fs.readFile(path.join(repoRoot, annexPath), "utf8");
  const pkg = JSON.parse(await fs.readFile(path.join(repoRoot, "package.json"), "utf8"));
  return buildProcessPack(resources, {
    processId: "adopter-ce-dossier",
    annexes: [{ path: annexPath, content }],
    command: "npm run porte:pack",
    linkBase: `${pkg.repository.url}/blob/main/`,
  });
}

describe("entry file for web chats", () => {
  it("matches its sources byte for byte (run `npm run porte:pack` after editing them)", async () => {
    const committed = await fs.readFile(path.join(repoRoot, "PARTIR-DE-CE-QUE-VOUS-AVEZ.md"), "utf8");
    const { markdown } = await regenerate();
    assert.equal(committed, markdown, "PARTIR-DE-CE-QUE-VOUS-AVEZ.md is stale: run `npm run porte:pack`");
  });

  it("carries the door, the judgement, both method pages read in full, and the sheet", async () => {
    const { markdown, count } = await regenerate();
    assert.equal(count, 4, "the door, faisabilite-ia, and the two co-pensée pages it declares");
    for (const marker of ["## Process: Partir de ce que vous avez", "## Dans un chat, sans dossier", "## Compétence: ", "Source: `docs/learn/pratiques-co-pensee.md`", "Source: `docs/learn/co-penser-avec-lia.md`", "## Annexe: `.ai/agents/concierge-base/templates/proposition.html`", "const LIBELLES"]) {
      assert.ok(markdown.includes(marker), `the entry file contains ${marker}`);
    }
    assert.doesNotMatch(markdown, /\]\(\.\.?\//, "no relative link survives: a chat reads the file from its own URL");
    assert.equal((markdown.match(/^# /gm) || []).length, 1, "one title: each source nests under its own section heading");
  });

  it("follows requires transitively and stops on cycles", () => {
    const resources = [
      { id: "a", type: "process", path: ".ai/a.md", title: "A", body: "# A\n\nCorps A, voir [b](../docs/b.md).\n\n## Étapes\n\n```markdown\n# gardé tel quel\n```", requires: [{ ref: "b" }] },
      { id: "b", type: "competence", path: "docs/b.md", title: "B", body: "Corps B", requires: [{ ref: "a" }, { ref: "c" }] },
      { id: "c", type: "document", path: "docs/c.md", title: "C", body: "Corps C", requires: [] },
    ];
    const { markdown, count } = buildProcessPack(resources, { processId: "a", linkBase: "https://example.org/blob/main/" });
    assert.equal(count, 3);
    assert.ok(markdown.indexOf("Corps A") < markdown.indexOf("Corps B") && markdown.indexOf("Corps B") < markdown.indexOf("Corps C"), "reading order follows the declarations");
    assert.match(markdown, /\[b\]\(https:\/\/example\.org\/blob\/main\/docs\/b\.md\)/);
    assert.match(markdown, /## Process: A\n\nSource: `\.ai\/a\.md`\n\nCorps A/, "the source's own title gives way to the section heading");
    assert.match(markdown, /^### Étapes$/m, "the source's headings move one level down");
    assert.match(markdown, /^# gardé tel quel$/m, "a fenced sample keeps its headings");
    assert.throws(() => buildProcessPack(resources, { processId: "absent" }), /process not found/);
  });
});
