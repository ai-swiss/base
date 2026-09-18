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
// WHICH content is French is READ, not assumed. A root declares its language in its own
// `base.config.json` (core/lang/, `language`), and BASE writes that root's files in it: an example
// root under exemples/ can legitimately be German or English throughout. Judging such a root by
// Swiss-romand rules would flag correct typography in its own language, so a nested root whose
// config declares anything but French is skipped WHOLE, and the run says which ones and why.
// The scan STARTS in French and only a nested root can change that: docs/ is the framework's own
// documentation, authoritative French by policy (docs/reference/langues.md), whatever this
// repository's own `language` key happens to say.
//
//   node tools/docs/check-punctuation.mjs    # exit 1 on any violation, 0 when clean
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "../core/lang/index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONFIG_FILENAME = "base.config.json";
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

/**
 * The language a root declares in its own `base.config.json`, normalised to the primary subtag.
 * A missing, unreadable or malformed config yields French: a gate must never become the thing that
 * breaks, and a root that says nothing is French by default (core/config.mjs DEFAULTS).
 * @param {string | null} configText the file's contents, or null when there is no config
 * @returns {string} a primary subtag, e.g. "fr", "de"
 */
export function declaredLanguage(configText) {
  if (typeof configText !== "string") return DEFAULT_LANGUAGE;
  try {
    return normalizeLanguage(JSON.parse(configText)?.language) || DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

/**
 * The French markdown under one directory. A sub-directory carrying its own `base.config.json` is a
 * nested root: it is skipped whole when that config declares a language other than French, and the
 * skip is recorded so the run can name it.
 * @param {string} absDir the directory to walk @param {string} relDir its path relative to ROOT
 * @param {{ dir: string, language: string }[]} skipped collects the non-French roots met on the way
 * @returns {Promise<string[]>} ROOT-relative paths
 */
export async function frenchMarkdownUnder(absDir, relDir, skipped = []) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(absDir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = path.posix.join(relDir, e.name);
    if (EXCLUDE(rel)) continue;
    if (e.isDirectory()) {
      const abs = path.join(absDir, e.name);
      const config = await fs.readFile(path.join(abs, CONFIG_FILENAME), "utf8").catch(() => null);
      if (config !== null) {
        const language = declaredLanguage(config);
        if (language !== DEFAULT_LANGUAGE) {
          skipped.push({ dir: rel, language });
          continue;
        }
      }
      out.push(...(await frenchMarkdownUnder(abs, rel, skipped)));
    } else if (e.name.endsWith(".md")) out.push(rel);
  }
  return out;
}

async function main() {
  /** @type {{ dir: string, language: string }[]} */
  const skipped = [];
  const fromDirs = (await Promise.all(FRENCH_DIRS.map((dir) => frenchMarkdownUnder(path.join(ROOT, dir), dir, skipped)))).flat();
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
  for (const { dir, language } of skipped.sort((a, b) => a.dir.localeCompare(b.dir))) {
    console.log(`check-punctuation: ${dir}/ skipped — its base.config.json declares language "${language}", so French typography does not apply.`);
  }
  console.log(`check-punctuation: pass — ${files.length} French files hold tight Swiss-romand punctuation.`);
}

if (process.argv[1] && process.argv[1].endsWith("check-punctuation.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
