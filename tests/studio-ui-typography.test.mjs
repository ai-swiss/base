// Spec coverage: FR-STUDIO-006
// The Studio surface is the first contact many users have with BASE, and the project ships a written
// typographic convention (.ai/.../human-writing/SKILL.md): tight Swiss-romand punctuation (no space
// before : ; ! ?) and tight guillemets. The convention was held in copy.ts but broken in the JSX.
// This guard scans the Studio UI source for the two UNAMBIGUOUS display-only violations, so the fix
// cannot regress. It targets only characters that never appear in JS/TS syntax:
//   - a narrow/non-breaking space (U+00A0, U+202F) before : ; ! ?  (French typography, display only)
//   - a space of any kind right after the opening or before the closing guillemet (display only)
// A regular ASCII space before a colon is left alone: it is ordinary code (types, ternaries, objects).

import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const srcDir = path.join(repoRoot, "tools", "studio", "ui", "src");

async function sourceFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await sourceFiles(full)));
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const FRENCH_SPACE_BEFORE_PUNCT = new RegExp("[\\u00A0\\u202F][:;!?]");
const SPACE_AFTER_OPEN_GUILLEMET = new RegExp("\\u00AB[\\u0020\\u00A0\\u202F]");
const SPACE_BEFORE_CLOSE_GUILLEMET = new RegExp("[\\u0020\\u00A0\\u202F]\\u00BB");

describe("Studio UI holds the tight Swiss-romand typography it ships in copy.ts", () => {
  it("has no French (narrow/non-breaking) space before : ; ! ? in the source", async () => {
    for (const file of await sourceFiles(srcDir)) {
      const text = await readFile(file, "utf8");
      assert.ok(!FRENCH_SPACE_BEFORE_PUNCT.test(text), `${path.relative(repoRoot, file)} has a non-breaking space before punctuation; punctuation must be tight`);
    }
  });

  it("has no spaced guillemets: they must be tight", async () => {
    for (const file of await sourceFiles(srcDir)) {
      const text = await readFile(file, "utf8");
      assert.ok(!SPACE_AFTER_OPEN_GUILLEMET.test(text), `${path.relative(repoRoot, file)} has a space after the opening guillemet`);
      assert.ok(!SPACE_BEFORE_CLOSE_GUILLEMET.test(text), `${path.relative(repoRoot, file)} has a space before the closing guillemet`);
    }
  });
});
