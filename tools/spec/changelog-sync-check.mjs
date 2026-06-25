#!/usr/bin/env node
// changelog-sync-check.mjs — the changelog-sync gate (visible changes leave a trace).
//
// CONTRIBUTING states the rule in prose: "Tout changement de la surface publique ou de la
// documentation visible ajoute sa ligne à la section [Unreleased] du CHANGELOG.md, dans le même
// commit." A rule in prose is a wish; this makes it a gate, mirroring spec-sync: a diff that touches
// the public surface or the visible docs must also touch a CHANGELOG, or declare itself
// changelog-neutral with [CHANGELOG-SKIP: reason] in a commit message / PR body (a typo, a comment).
//
// PUBLIC SURFACE / VISIBLE DOCS:
//   docs/**, README*.md, MANIFESTO*.md (what a reader sees),
//   base.schema.json, specs/current/30_schemas/** (the public contracts),
//   packages/*/index.mjs (a package's public entry point).
// Tests and internal scratch never require a changelog line.
//
//   changelog-sync-check.mjs                       # staged diff (local, pre-commit)
//   changelog-sync-check.mjs --range A..B [--pr-body-file body.txt]   # CI
//
// Exit 0 = passes, 1 = fails, 2 = usage error.
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";

/** A test or scratch path never needs a changelog line. */
function isExempt(file) {
  return /\.(test|spec)\.[a-z]+$/.test(file) || file.includes("/tests/") || file.startsWith("tests/") || file.startsWith(".temp/") || file.startsWith(".plans/");
}

/** A user-visible surface change: visible docs, public schema contracts, or a package entry point. */
export function isPublicSurface(file) {
  if (isExempt(file)) return false;
  if (file.startsWith("docs/")) return true;
  if (/^README(\.[a-z]{2})?\.md$/.test(file)) return true;
  if (/^MANIFESTO(\.[a-z]{2})?\.md$/.test(file)) return true;
  if (file === "base.schema.json") return true;
  if (file.startsWith("specs/current/30_schemas/")) return true;
  if (/^packages\/[^/]+\/index\.mjs$/.test(file)) return true;
  return false;
}

/** A changelog file (root or per-package) — touching one satisfies the gate. */
export function isChangelog(file) {
  return file === "CHANGELOG.md" || /^packages\/[^/]+\/CHANGELOG\.md$/.test(file);
}

/**
 * @param {string[]} changedFiles @param {string} markerText
 * @returns {{ ok: boolean, status: "no-surface"|"in-sync"|"skip"|"out-of-sync", surface: string[], skipReason?: string }}
 */
export function changelogSyncVerdict(changedFiles, markerText = "") {
  const surface = changedFiles.filter(isPublicSurface);
  if (surface.length === 0) return { ok: true, status: "no-surface", surface };
  if (changedFiles.some(isChangelog)) return { ok: true, status: "in-sync", surface };
  const skip = /\[CHANGELOG-SKIP:[^\]]*\]/.exec(markerText);
  if (skip) return { ok: true, status: "skip", surface, skipReason: skip[0] };
  return { ok: false, status: "out-of-sync", surface };
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function parseArgs(argv) {
  const opts = { range: "", prBodyFile: "" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--range") opts.range = argv[++i] ?? "";
    else if (a === "--pr-body-file") opts.prBodyFile = argv[++i] ?? "";
    else if (a === "--help" || a === "-h") opts.help = true;
    else {
      console.error(`changelog-sync-check: unknown option '${a}'`);
      process.exit(2);
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log("Usage: changelog-sync-check.mjs [--range A..B] [--pr-body-file FILE]");
    return;
  }
  let changed;
  let markerText = "";
  try {
    if (opts.range) {
      changed = git(["diff", "--name-only", opts.range]).split("\n").filter(Boolean);
      markerText = git(["log", "--format=%B", opts.range]);
    } else {
      changed = git(["diff", "--cached", "--name-only"]).split("\n").filter(Boolean);
    }
  } catch {
    console.error("changelog-sync-check: not a git repository or bad range.");
    process.exit(2);
  }
  if (opts.prBodyFile && fs.existsSync(opts.prBodyFile)) {
    markerText += "\n" + fs.readFileSync(opts.prBodyFile, "utf8");
  }
  if (changed.length === 0) {
    console.log("changelog-sync: nothing to check (empty diff).");
    return;
  }
  const v = changelogSyncVerdict(changed, markerText);
  if (v.status === "no-surface") {
    console.log("changelog-sync: pass — no public-surface or visible-docs change.");
    return;
  }
  if (v.status === "in-sync") {
    console.log("changelog-sync: pass — diff touches a CHANGELOG.");
    return;
  }
  if (v.status === "skip") {
    console.log(`changelog-sync: pass — declared ${v.skipReason}.`);
    console.log("  Note: the claim is a review item — reviewers verify the change is really not worth a line.");
    return;
  }
  console.error("changelog-sync: FAIL — a public-surface or visible-docs change must add a CHANGELOG line.");
  console.error("  Add your line to the '[Unreleased]' section of CHANGELOG.md in this same change,");
  console.error("  or add '[CHANGELOG-SKIP: reason]' to the commit message / PR body (e.g. a typo).");
  for (const f of v.surface) console.error(`    ${f}`);
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("changelog-sync-check.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
