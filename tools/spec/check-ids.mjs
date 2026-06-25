#!/usr/bin/env node
// check-ids.mjs — the ID-immutability gate.
//
// Stable identifiers are the joints of the system: tests cite them, the matrix resolves them, and
// `grep -r` for any ID returns its requirement, its proving tests, and its history. That only holds
// if an ID, once merged, is NEVER renumbered, reused, or deleted (a de-scoped requirement keeps its
// ID). Agents demonstrably renumber and reuse identifiers when editing; immutability must be a gate,
// not a hope. This gate diffs the requirement-ID set in the working tree against a git baseline and
// fails on any ID that vanished, plus any duplicate row in the working tree.
//
//   check-ids.mjs                 # compare working tree vs origin/main (then main, then HEAD)
//   check-ids.mjs --base <ref>    # compare against an explicit git ref
//
// Exit 0 = no ID broke, 1 = an ID vanished or is duplicated, 2 = usage / setup error.
import { execFileSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { STABLE_PREFIXES, rowIdPattern, suffixedRowIdPattern } from "./id-grammar.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REQUIREMENTS_FILE = "specs/current/10_core/requirements.md";
// Every stable, immutable identifier class defined as a table row in requirements.md: UR/NFR/FR/RC
// (behaviour, qualities, risk controls — proven by the matrix) plus AD (architecture decisions —
// recorded in decisions/, never "proven"). The grammar lives in one place (`id-grammar.mjs`)
// so this gate and the matrix can never disagree on what an ID is.

/** Row-defined stable IDs, in file order, WITH duplicates preserved (a dup is a finding). */
export function extractStableIds(markdown) {
  const ids = [];
  for (const m of markdown.matchAll(rowIdPattern(STABLE_PREFIXES))) ids.push(m[1]);
  return ids;
}

/**
 * Row IDs with a forbidden lowercase-letter suffix (e.g. `FR-VALID-003a`). These are invisible to
 * ROW_ID and to the matrix generator's identical regex, so such a requirement would silently carry
 * no proof row and no immutability protection — the `*-009a` anti-pattern. Reject it loudly.
 */
export function extractSuffixedIdRows(markdown) {
  return [...markdown.matchAll(suffixedRowIdPattern(STABLE_PREFIXES))].map((m) => m[1]);
}

/**
 * @param {string[]} baselineIds @param {string[]} currentIds
 * @returns {{ ok: boolean, vanished: string[], duplicated: string[], added: string[] }}
 */
export function immutabilityVerdict(baselineIds, currentIds) {
  const currentSet = new Set(currentIds);
  const baselineSet = new Set(baselineIds);
  const vanished = [...baselineSet].filter((id) => !currentSet.has(id)).sort();
  const added = [...currentSet].filter((id) => !baselineSet.has(id)).sort();
  const seen = new Set();
  const duplicated = [];
  for (const id of currentIds) {
    if (seen.has(id) && !duplicated.includes(id)) duplicated.push(id);
    seen.add(id);
  }
  return { ok: vanished.length === 0 && duplicated.length === 0, vanished, duplicated: duplicated.sort(), added };
}

function gitTry(args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
}

/** First resolvable baseline ref, or null. */
function resolveBaseRef(explicit) {
  const candidates = explicit ? [explicit] : ["origin/main", "main", "HEAD"];
  for (const ref of candidates) {
    if (gitTry(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]) !== null) return ref;
  }
  return null;
}

async function main() {
  const argv = process.argv.slice(2);
  let base = "";
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--base") base = argv[++i] ?? "";
    else if (argv[i] === "--help" || argv[i] === "-h") {
      console.log("Usage: check-ids.mjs [--base <git-ref>]");
      return;
    } else {
      console.error(`check-ids: unknown option '${argv[i]}'`);
      process.exit(2);
    }
  }

  const source = await fs.readFile(path.join(ROOT, REQUIREMENTS_FILE), "utf8");
  const suffixed = extractSuffixedIdRows(source);
  if (suffixed.length) {
    console.error(`check-ids: FAIL — letter-suffixed ID row(s) are invisible to the matrix and this gate: ${suffixed.join(", ")}`);
    console.error("  Use a plain three-digit ID (FR-AREA-NNN), or fold the clause into an existing requirement as prose.");
    process.exit(1);
  }
  const current = extractStableIds(source);
  const ref = resolveBaseRef(base);
  if (ref === null) {
    if (base) {
      console.error(`check-ids: baseline ref not found: ${base}`);
      process.exit(2);
    }
    console.log("check-ids: no baseline ref (origin/main, main, HEAD) — skipping immutability diff.");
    // Still enforce no-duplicates within the working tree.
    const v = immutabilityVerdict(current, current);
    if (v.duplicated.length) {
      console.error(`check-ids: FAIL — duplicate ID row(s): ${v.duplicated.join(", ")}`);
      process.exit(1);
    }
    console.log(`check-ids: ${current.length} IDs, no duplicates.`);
    return;
  }

  const baselineSource = gitTry(["show", `${ref}:${REQUIREMENTS_FILE}`]) ?? "";
  const baseline = extractStableIds(baselineSource);
  const v = immutabilityVerdict(baseline, current);
  if (!v.ok) {
    if (v.vanished.length) {
      console.error(`check-ids: FAIL — ${v.vanished.length} ID(s) present in ${ref} vanished from the working tree:`);
      for (const id of v.vanished) console.error(`    ${id}`);
      console.error("  IDs are immutable: never renumber, reuse, or delete. A de-scoped requirement keeps");
      console.error("  its ID (mark its proof status de-scoped); a renamed leaf never touches IDs.");
    }
    if (v.duplicated.length) {
      console.error(`check-ids: FAIL — duplicate ID row(s): ${v.duplicated.join(", ")}`);
    }
    process.exit(1);
  }
  console.log(
    `check-ids: pass — ${current.length} IDs stable vs ${ref}` +
      (v.added.length ? ` (+${v.added.length} new: ${v.added.join(", ")})` : "") +
      ".",
  );
}

if (process.argv[1] && process.argv[1].endsWith("check-ids.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
