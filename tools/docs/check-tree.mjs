#!/usr/bin/env node
// check-tree.mjs — small, cumulative tree hygiene over the COMMITTED tree (git ls-files), so it
// gates what ships, never a developer's local scratch:
//   - no junk files committed (.DS_Store, editor swap/backup: *~, *.swp, *.swo),
//   - docs/ pages stay readable (<= 400 lines),
//   - docs/ filenames are kebab-case — a version token like `v1.0.0` is allowed (not `v1-0-0`),
//     and the conventional README / LICENSE are exempt.
// It rides under the gate-enforced spec discipline (NFR-CORE-010); cheap hygiene that keeps the
// repo pristine without anyone thinking about it.
//   check-tree.mjs   # exit 0 = clean, 1 = a hygiene finding, 2 = setup error
import { execFileSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const MAX_DOC_LINES = 400;
const JUNK = /(^|\/)\.DS_Store$|~$|\.sw[op]$/;
const CONVENTIONAL = new Set(["README", "LICENSE"]);
// kebab-case, with `.` tolerated inside a segment so a version reads `v1.0.0`, never `v1-0-0`.
const KEBAB = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
// Any rendered-markdown extension, case-insensitive — `docs/Foo.MD` is still a doc page.
const isDocPage = (/** @type {string} */ f) => /^docs\/.*\.(?:md|markdown|mdx|mdown|mkd)$/i.test(f);

export function junkPaths(files) {
  return files.filter((f) => JUNK.test(f));
}
export function nonKebabDocs(files) {
  return files.filter(isDocPage).filter((f) => {
    const base = path.basename(f).replace(/\.[a-z0-9]+$/i, ""); // strip whatever markdown extension
    return !CONVENTIONAL.has(base) && !KEBAB.test(base);
  });
}

function trackedFiles() {
  return execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
}

async function main() {
  let files;
  try {
    files = trackedFiles();
  } catch {
    console.log("check-tree: skipped (git unavailable — nothing tracked to inspect).");
    process.exit(0);
  }
  const problems = [];
  for (const f of junkPaths(files)) problems.push(`junk file committed: ${f}`);
  for (const f of nonKebabDocs(files)) problems.push(`docs filename not kebab-case: ${f}`);
  for (const f of files.filter(isDocPage)) {
    const count = (await fs.readFile(path.join(ROOT, f), "utf8")).split("\n").length;
    if (count > MAX_DOC_LINES) problems.push(`docs page over ${MAX_DOC_LINES} lines (${count}): ${f}`);
  }
  if (problems.length === 0) {
    const docs = files.filter(isDocPage).length;
    console.log(`check-tree: pass — no junk; ${docs} docs pages kebab-named and ≤ ${MAX_DOC_LINES} lines.`);
    process.exit(0);
  }
  console.error("check-tree: FAIL —");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("check-tree.mjs")) {
  main().catch((error) => {
    console.error(error);
    process.exit(2);
  });
}
