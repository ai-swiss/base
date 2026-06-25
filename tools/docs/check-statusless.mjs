#!/usr/bin/env node
// check-statusless.mjs — keep the reference docs in the present tense.
//
// docs/reference/ is part of the truth plane: it states what BASE does now. A roadmap, an "Horizon",
// a "coming soon", or a "feuille de route" living there is trajectory masquerading as reference, and
// it goes stale by omission (see specs/current/00_overview/les-deux-plans.md). Such forward-looking
// material belongs in the CHANGELOG (its "Orientations" section) or in .plans/, never in reference.
//
// This gate scans docs/reference/*.md for trajectory markers, ignoring fenced code blocks, and fails.
// A genuine, reviewed exception declares `[STATUSLESS-OK: reason]` on the line (counted and surfaced,
// so the escape cannot quietly become a habit).
//
//   node tools/docs/check-statusless.mjs        # exit 1 on any leak, 0 when clean
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REFERENCE_DIR = "docs/reference";

// Unambiguous roadmap/status markers. Deliberately narrow: it targets the shapes that signal a
// roadmap or a build status, not every occurrence of "prévu" (which appears in legitimate present
// tense, e.g. "l'action prévue par le dry-run").
export const TRAJECTORY_TOKENS = [
  /\bfeuille de route\b/i,
  /\broadmap\b/i,
  /\bextensions?\s+pr[ée]vues?\b/i,
  /\bhorizon\s+indicatif\b/i,
  /\bprochain\s+trimestre\b/i,
  /\bprochainement\b/i,
  /\bcoming\s+soon\b/i,
  /\bà\s+venir\b/i,
  /\bWIP\b/,
  /\bTODO\b/,
];

/**
 * Lines that carry a trajectory marker, ignoring fenced code blocks and lines that declare a
 * reviewed `[STATUSLESS-OK: reason]` exception. Line numbers are 1-based.
 * @param {string} text
 * @returns {{ line: number, token: string, text: string }[]}
 */
export function trajectoryLeaks(text) {
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
    if (line.includes("[STATUSLESS-OK:")) continue;
    for (const re of TRAJECTORY_TOKENS) {
      const m = line.match(re);
      if (m) {
        leaks.push({ line: i + 1, token: m[0], text: line.trim() });
        break;
      }
    }
  }
  return leaks;
}

async function listMarkdown(/** @type {string} */ dir) {
  const out = [];
  const entries = await fs.readdir(path.join(ROOT, dir), { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) out.push(...(await listMarkdown(path.posix.join(dir, e.name))));
    else if (e.name.endsWith(".md")) out.push(path.posix.join(dir, e.name));
  }
  return out.sort();
}

async function main() {
  const files = await listMarkdown(REFERENCE_DIR);
  const failures = [];
  let exempt = 0;
  for (const rel of files) {
    const text = await fs.readFile(path.join(ROOT, rel), "utf8");
    exempt += (text.match(/\[STATUSLESS-OK:/g) ?? []).length;
    for (const leak of trajectoryLeaks(text)) {
      failures.push(`${rel}:${leak.line}: trajectory marker "${leak.token}" in a reference (truth) page ("${leak.text}").`);
    }
  }
  if (exempt) console.log(`check-statusless: ${exempt} reviewed [STATUSLESS-OK] exception(s) (watched).`);
  if (failures.length) {
    console.error("check-statusless: FAIL — reference docs must state the present, not a roadmap:");
    for (const f of failures) console.error(`  ${f}`);
    console.error("  Move forward-looking material to the CHANGELOG's \"Orientations\" section or .plans/, or declare [STATUSLESS-OK: reason].");
    process.exit(1);
  }
  console.log(`check-statusless: pass — ${files.length} reference pages are present-tense.`);
}

if (process.argv[1] && process.argv[1].endsWith("check-statusless.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
