#!/usr/bin/env node
// check-leaf.mjs — the leaf-contract gate for the specification tree.
//
// A spec leaf is one chapter under specs/current/ (not a router, not a generated or dated file). The
// contract keeps retrieval cheap and the truth plane clean, and it is a gate, not a wish:
//   1. Bounded — a leaf is ≤ MAX_LINES lines, so it fits one reading. The single exemption is an
//      explicit `<!-- LEAF-OVERSIZE: reason -->` marker (reviewable, and counted here so a growing
//      number of exemptions is visible, never silent).
//   2. Statusless — a leaf states present behaviour; it carries no `## Status` heading or `Status:`
//      field. Lifecycle and history are trajectory: they live in CHANGELOG.md and .plans/, never in
//      a present-tense leaf. (A `status` FIELD documented inside a fenced code block is fine.)
//   3. Routed — every leaf is referenced by its area router (specs/current/README.md), so a reader
//      reaches it in O(depth) hops rather than scanning a flat folder.
//
//   node tools/spec/check-leaf.mjs        # exit 1 on any violation, 0 when clean
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CURRENT = "specs/current";
const ROUTER = "specs/current/README.md";
const MAX_LINES = 250;
// Not leaves: the area routers (README.md), the generated matrix, and the dated changelog (trajectory).
const NOT_A_LEAF = new Set(["README.md", "requirements-matrix.md", "CHANGELOG.md"]);

/** A leaf is any .md under specs/current/ that is not a router, a generated file, or the changelog. */
export function isLeaf(/** @type {string} */ relPath) {
  return relPath.endsWith(".md") && !NOT_A_LEAF.has(path.posix.basename(relPath));
}

/** True if the leaf declares the explicit oversize exemption marker. */
export function oversizeExempt(/** @type {string} */ text) {
  return /<!--\s*LEAF-OVERSIZE:/.test(text);
}

/**
 * Body lines that assert a lifecycle Status (heading `## Status`, or a `Status:` / `**Status:` field),
 * ignoring fenced code blocks (where a documented `status` field is legitimate). Line numbers are 1-based.
 * @param {string} text
 * @returns {{ line: number, text: string }[]}
 */
export function statusLeaks(text) {
  const leaks = [];
  let fenced = false;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (/^\s{0,3}(#{1,6}\s*Status\b|\*{0,2}Status:)/.test(line)) {
      leaks.push({ line: i + 1, text: line.trim() });
    }
  }
  return leaks;
}

/**
 * @param {string} relPath leaf path relative to specs/current (posix)
 * @param {string} text the leaf content
 * @param {string} routerText specs/current/README.md content
 * @param {number} [maxLines]
 * @returns {{ ok: boolean, lines: number, tooLong: boolean, exempt: boolean, statusLines: {line:number,text:string}[], routed: boolean }}
 */
export function leafVerdict(relPath, text, routerText, maxLines = MAX_LINES) {
  const lines = text.split("\n").length;
  const exempt = oversizeExempt(text);
  const tooLong = lines > maxLines && !exempt;
  const statusLines = statusLeaks(text);
  const routed = routerText.includes(relPath) || routerText.includes(path.posix.basename(relPath));
  return { ok: !tooLong && statusLines.length === 0 && routed, lines, tooLong, exempt, statusLines, routed };
}

/** Recursively list .md files under a directory, relative POSIX paths. */
async function listMarkdown(/** @type {string} */ dir, /** @type {string} */ base = "") {
  const out = [];
  const entries = await fs.readdir(path.join(ROOT, dir), { withFileTypes: true });
  for (const e of entries) {
    const rel = path.posix.join(base, e.name);
    if (e.isDirectory()) out.push(...(await listMarkdown(path.posix.join(dir, e.name), rel)));
    else if (e.name.endsWith(".md")) out.push(rel);
  }
  return out.sort();
}

async function main() {
  const routerText = await fs.readFile(path.join(ROOT, ROUTER), "utf8");
  const all = await listMarkdown(CURRENT);
  const leaves = all.filter(isLeaf);
  const failures = [];
  const exemptions = [];
  for (const rel of leaves) {
    const text = await fs.readFile(path.join(ROOT, CURRENT, rel), "utf8");
    const v = leafVerdict(rel, text, routerText);
    if (v.exempt) exemptions.push(`${rel} (${v.lines} lines)`);
    if (v.ok) continue;
    if (v.tooLong) failures.push(`${rel}: ${v.lines} lines > ${MAX_LINES}. Split the chapter, or declare <!-- LEAF-OVERSIZE: reason -->.`);
    for (const s of v.statusLines)
      failures.push(`${rel}:${s.line}: a leaf is statusless — move lifecycle/status to CHANGELOG.md or .plans/ ("${s.text}").`);
    if (!v.routed) failures.push(`${rel}: not routed — add it to ${ROUTER} so readers can reach it.`);
  }
  if (exemptions.length) {
    console.log(`check-leaf: ${exemptions.length} oversize exemption(s) (watched): ${exemptions.join(", ")}.`);
  }
  if (failures.length) {
    console.error("check-leaf: FAIL —");
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`check-leaf: pass — ${leaves.length} leaves within contract (≤${MAX_LINES} lines, statusless, routed).`);
}

if (process.argv[1] && process.argv[1].endsWith("check-leaf.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
