#!/usr/bin/env node
// check-frontmatter-yaml.mjs — frontmatter must be valid for a STRICT YAML reader, not just BASE's.
//
// BASE's own parser (tools/core/frontmatter.mjs) is a tolerant reader: it takes everything after the
// first `key:` as the value, so `description: Comment X: Y` parses fine. But STRICT YAML parsers —
// GitHub's Markdown renderer, Jekyll, Astro content collections — read the second `: ` as the start of
// a nested mapping and fail with "mapping values are not allowed in this context". The result is an
// ugly red "Error in user YAML" banner when the file is opened on GitHub.
//
// This gate is the separate validator layer the parser's audit note reserves for value strictness
// (see tools/core/frontmatter.mjs, "PARSER POLICY"). It flags the one construct that silently passes
// BASE yet breaks strict YAML: an unquoted top-level scalar whose value contains a colon followed by
// whitespace (or a trailing colon). Fix = wrap the value in double quotes. BASE's parser strips the
// quotes on read (slice 1,-1), so quoting round-trips losslessly.
//
//   node tools/docs/check-frontmatter-yaml.mjs        # exit 1 on any offending value
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** The inner frontmatter lines (between the opening `---` and the next `---`), or null if none. */
export function frontmatterLines(text) {
  if (!/^---\r?\n/.test(text)) return null;
  const lines = text.split("\n");
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (end === -1) return null;
  return lines.slice(1, end);
}

/**
 * Offending top-level scalars: an unquoted value (not opening with " ' [ {) that contains ": "
 * (colon + whitespace) or ends with a colon — the exact shape strict YAML rejects. Returns
 * [{ key, value, fmLine }] with fmLine 1-based within the frontmatter block.
 */
export function offendingScalars(fmLines) {
  const hits = [];
  fmLines.forEach((line, i) => {
    const m = /^([A-Za-z0-9_-]+):(\s+)(\S.*?)\s*$/.exec(line); // top-level `key: value` only (no indent)
    if (!m) return;
    const value = m[3];
    if (/^["'[{]/.test(value)) return;      // already quoted, or a flow array/map
    if (/:(\s|$)/.test(value)) hits.push({ key: m[1], value, fmLine: i + 1 });
  });
  return hits;
}

function main() {
  const files = execFileSync("git", ["ls-files", "*.md"], { cwd: ROOT, encoding: "utf8" })
    .split("\n").filter(Boolean);
  const failures = [];
  let scanned = 0;
  for (const rel of files) {
    let text;
    try { text = readFileSync(path.join(ROOT, rel), "utf8"); } catch { continue; }
    const fm = frontmatterLines(text);
    if (!fm) continue;
    scanned++;
    for (const hit of offendingScalars(fm)) {
      failures.push(`${rel}:${hit.fmLine + 1} <${hit.key}>: unquoted value contains ": " — strict YAML (GitHub) rejects it. Wrap the value in double quotes.`);
    }
  }
  if (failures.length) {
    console.error("check-frontmatter-yaml: FAIL —");
    for (const f of failures) console.error(`  ${f}`);
    console.error(`\n  ${failures.length} value(s) break strict YAML. Quote each value, e.g.  description: "text with a : colon".`);
    process.exit(1);
  }
  console.log(`check-frontmatter-yaml: pass — ${scanned} frontmatter block(s) valid for a strict YAML reader.`);
}

if (process.argv[1] && process.argv[1].endsWith("check-frontmatter-yaml.mjs")) {
  main();
}
