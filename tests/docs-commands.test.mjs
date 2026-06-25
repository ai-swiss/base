// Spec coverage: FR-CLI-001
// X-4 made mechanical: a doc that cites a command is checked against the real CLI. ONE truth
// module — every page that tells the reader to run `base <something>` is listed here, its
// code-fence `base` commands extracted, and each subcommand verified to exist in the CLI usage.
// Add a page → add a line. And no page may cite `npx @ai-swiss/...` while the package is unpublished.

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const cliPath = path.resolve("tools/base.mjs");

// The pages that instruct the reader to run BASE commands. Add a page → add a line (or a dir).
const PAGE_FILES = [
  "docs/start/installer-par-votre-ia.md",
  "docs/start/essayer-sans-installer.md",
  "docs/audiences/kit-demarrage-pme-suisse.md", // the monthly ritual cites base validate/entretien/route-test
];
const PAGE_DIRS = ["docs/tutoriel"]; // the whole tutorial is verified

async function listedPages() {
  const pages = [...PAGE_FILES];
  for (const dir of PAGE_DIRS) {
    for (const name of await readdir(dir)) if (name.endsWith(".md")) pages.push(path.join(dir, name));
  }
  return pages;
}

/** The set of valid subcommands, parsed from the CLI's own usage (the single source). */
async function cliSubcommands() {
  const { stdout } = await execFileAsync("node", [cliPath, "--help"]);
  const found = new Set();
  for (const m of stdout.matchAll(/^\s*base (\w[\w-]*)/gm)) found.add(m[1]);
  return found;
}

/** Extract `base <subcommand>` and `tools/base.mjs <subcommand>` tokens from code fences. */
function citedCommands(markdown) {
  const cited = new Set();
  for (const fence of markdown.matchAll(/```[a-z]*\n([\s\S]*?)```/g)) {
    for (const m of fence[1].matchAll(/base(?:\.mjs)? (\w[\w-]*)/g)) {
      // Skip path-ish false positives: only words that look like subcommands.
      if (/^[a-z][a-z-]*$/.test(m[1])) cited.add(m[1]);
    }
  }
  return cited;
}

describe("docs ↔ CLI — a cited command is a real command", () => {
  it("every `base <cmd>` in the listed pages exists in the CLI usage", async () => {
    const valid = await cliSubcommands();
    assert.ok(valid.has("init") && valid.has("whereis"), "usage parsing sanity");
    for (const page of await listedPages()) {
      const md = await readFile(page, "utf8");
      for (const cmd of citedCommands(md)) {
        assert.ok(valid.has(cmd), `${page} cites unknown command: base ${cmd}`);
      }
    }
  });

  it("no page promises an unpublished npm package", async () => {
    for (const page of await listedPages()) {
      const md = await readFile(page, "utf8");
      assert.ok(!/npx @ai-swiss/.test(md), `${page} cites npx @ai-swiss (the package is not published)`);
    }
  });
});

describe("docs ↔ launcher — the runnable handle the docs rely on", () => {
  it("`node .ai/base.mjs` (the form every page now cites) is actually invocable", async () => {
    const { stdout } = await execFileAsync("node", [path.resolve(".ai/base.mjs"), "--help"]);
    assert.match(stdout, /BASE CLI/);
  });

  it("harnais defines how `base` resolves before any module uses it", async () => {
    const harnais = await readFile("docs/tutoriel/harnais.md", "utf8");
    assert.match(harnais, /node \.ai\/base\.mjs/, "harnais must define the `base` shorthand");
  });
});
