#!/usr/bin/env node
// check-punctuation.mjs — tight Swiss-romand punctuation in authoritative French content.
//
// The house style (.ai/.../human-writing/SKILL.md) is tight: no space before : ; ! ?, and tight
// guillemets. This gate makes that a mechanism over the French a reader sees and an example a
// newcomer copies: README/CONTRIBUTING/MANIFESTO, docs/**, exemples/**, and the French agents under
// .ai/agents/** (the prose a user loads first; the English base-contributor and the GENERATED
// index.md are excluded — the latter is derived from its sources). It is code-aware: fenced blocks,
// inline `code` spans, YAML frontmatter and table-separator rows are skipped, so only prose is judged.
// In examples and agents it also flags the em-dash (banned everywhere; check-emdash already covers docs/root).
//
//   node tools/docs/check-punctuation.mjs    # exit 1 on any violation, 0 when clean
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const FRENCH_ROOT_FILES = ["README.md", "CONTRIBUTING.md", "MANIFESTO.md"];
const FRENCH_DIRS = ["docs", "exemples", ".ai/agents"];
const EXCLUDE = (/** @type {string} */ rel) =>
  /\.(en|de|it)\.md$/.test(rel) ||
  /^docs\/(en|de|it)\//.test(rel) ||
  rel.includes("/node_modules/") ||
  rel.includes("/dist/") ||
  rel.startsWith(".ai/agents/base-contributor/") || // the contributor agent is authored in English
  /^\.ai\/agents\/[^/]+\/index\.md$/.test(rel); // generated routing index — derived from its sources

const SP = "[\\u0020\\u00A0\\u202F]";
const SPACE_BEFORE_PUNCT = new RegExp(SP + "[:;!?]");
const SPACED_GUILLEMET = new RegExp("\\u00AB" + SP + "|" + SP + "\\u00BB");
const TABLE_SEPARATOR = /^\s*\|?[\s:|-]+\|[\s:|-]*$/;
const EM_DASH = "—";

/**
 * Typography violations in one French markdown file, prose only.
 * @param {string} text @param {boolean} flagEmDash @returns {{ line: number, rule: string, text: string }[]}
 */
export function punctuationLines(text, flagEmDash) {
  const hits = [];
  const lines = text.split("\n");
  let fenced = false;
  let inFrontmatter = lines[0] === "---";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inFrontmatter) {
      if (i > 0 && line === "---") inFrontmatter = false;
      continue;
    }
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (TABLE_SEPARATOR.test(line)) continue;
    if (line.includes("[PUNCT-OK:")) continue;
    // Inline code is not prose. Replace each span with a placeholder (not "") so a colon that hugs a
    // code span (`file`: tight, correct) is not turned into a false "space before colon".
    const prose = line.replace(/`[^`]*`/g, "x");
    if (SPACE_BEFORE_PUNCT.test(prose)) hits.push({ line: i + 1, rule: "space before : ; ! ?", text: line.trim() });
    if (SPACED_GUILLEMET.test(prose)) hits.push({ line: i + 1, rule: "spaced guillemets", text: line.trim() });
    if (flagEmDash && prose.includes(EM_DASH)) hits.push({ line: i + 1, rule: "em-dash", text: line.trim() });
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

async function main() {
  const fromDirs = (await Promise.all(FRENCH_DIRS.map(listMarkdown))).flat();
  const files = [...FRENCH_ROOT_FILES.filter((f) => !EXCLUDE(f)), ...fromDirs].sort();
  const failures = [];
  for (const rel of files) {
    const text = await fs.readFile(path.join(ROOT, rel), "utf8").catch(() => "");
    for (const hit of punctuationLines(text, rel.startsWith("exemples/") || rel.startsWith(".ai/agents/"))) {
      failures.push(`${rel}:${hit.line}: ${hit.rule} ("${hit.text}").`);
    }
  }
  if (failures.length) {
    console.error("check-punctuation: FAIL — tighten the punctuation (no space before : ; ! ?, tight guillemets, no em-dash):");
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`check-punctuation: pass — ${files.length} French files hold tight Swiss-romand punctuation.`);
}

if (process.argv[1] && process.argv[1].endsWith("check-punctuation.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
