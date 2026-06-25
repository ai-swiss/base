#!/usr/bin/env node
// check-emdash.mjs — no em-dash in authoritative French content.
//
// CONTRIBUTING states the house style: "En français, pas de tiret cadratin ni de tiret d'incise :
// reformulez en virgules, parenthèses, deux-points ou phrases séparées." A rule in prose is a wish;
// this makes it a gate over the French content a reader actually sees: README.md, CONTRIBUTING.md,
// MANIFESTO.md, and docs/**. It flags the em-dash (U+2014). English content (the spec tree, the
// English/German/Italian mirrors, code) is out of scope. A genuine exception declares
// `[EMDASH-OK: reason]` on the line (counted, so it cannot quietly spread). Fenced code is ignored.
//
//   node tools/docs/check-emdash.mjs        # exit 1 on any em-dash, 0 when clean
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const EM_DASH = "—";
// Authoritative French roots. Translation mirrors (.en/.de/.it.md and docs/en|de|it/) and the English
// spec tree are excluded, so a legitimate English em-dash, German Gedankenstrich or Italian text is
// never audited as faulty French — the translations CONTRIBUTING.md invites must pass these gates.
const FRENCH_ROOT_FILES = ["README.md", "CONTRIBUTING.md", "MANIFESTO.md"];
const FRENCH_DIRS = ["docs"];
const EXCLUDE = (/** @type {string} */ rel) => /\.(en|de|it)\.md$/.test(rel) || /^docs\/(en|de|it)\//.test(rel) || rel.includes("/.");

/**
 * Lines bearing an em-dash, ignoring fenced code and lines that declare `[EMDASH-OK: reason]`.
 * @param {string} text @returns {{ line: number, text: string }[]}
 */
export function emDashLines(text) {
  const hits = [];
  let fenced = false;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (line.includes("[EMDASH-OK:")) continue;
    if (line.includes(EM_DASH)) hits.push({ line: i + 1, text: line.trim() });
  }
  return hits;
}

async function listMarkdown(/** @type {string} */ dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(path.join(ROOT, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = path.posix.join(dir, e.name);
    if (EXCLUDE(rel)) continue;
    if (e.isDirectory()) out.push(...(await listMarkdown(rel)));
    else if (e.name.endsWith(".md")) out.push(rel);
  }
  return out;
}

async function frenchFiles() {
  const fromDirs = (await Promise.all(FRENCH_DIRS.map(listMarkdown))).flat();
  return [...FRENCH_ROOT_FILES.filter((f) => !EXCLUDE(f)), ...fromDirs].sort();
}

async function main() {
  const files = await frenchFiles();
  const failures = [];
  let exempt = 0;
  for (const rel of files) {
    const text = await fs.readFile(path.join(ROOT, rel), "utf8").catch(() => "");
    exempt += (text.match(/\[EMDASH-OK:/g) ?? []).length;
    for (const hit of emDashLines(text)) failures.push(`${rel}:${hit.line}: em-dash (—) in French content ("${hit.text}").`);
  }
  if (exempt) console.log(`check-emdash: ${exempt} reviewed [EMDASH-OK] exception(s) (watched).`);
  if (failures.length) {
    console.error("check-emdash: FAIL — replace the em-dash with a comma, colon, parentheses, or a separate sentence:");
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`check-emdash: pass — ${files.length} French files free of em-dashes.`);
}

if (process.argv[1] && process.argv[1].endsWith("check-emdash.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
