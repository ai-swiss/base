#!/usr/bin/env node
// spec-sync-check.mjs — the spec-sync gate (truth never lags trajectory).
//
// A diff that changes runtime source code must change the spec in the same change, or declare
// itself behaviour-neutral with [SPEC-NEUTRAL: reason] in a commit message / PR body. This is the
// gate that keeps `specs/` from drifting behind the code (the exact failure that left `egress`,
// `doctor`, `init`, the feedback loop and the ontology fields shipped-but-unspecified before
// 1.1.0). It runs identically as a local commit-msg hook (sees the staged diff + the message) and
// in CI (`--range origin/main..HEAD --pr-body-file body.txt`).
//
// SOURCE = runtime code whose behaviour the spec is meant to describe:
//   tools/**, mcp/src/**, packages/*/src/**, packages/*/bin/**  (extensions .mjs/.ts/.js)
//   minus apps and meta that the engineering spec deliberately does NOT cover:
//   tools/studio/** (the Studio UI app), tools/eval/** (the eval harness app),
//   tools/spec/** (this gate + the matrix generator), tools/docs-ui/** (vendored viewer),
//   and any test file (*.test.*, *.spec.*, **/tests/**).
// SPEC   = specs/** or the canonical base.schema.json (the resource contract).
//
//   spec-sync-check.mjs                         # staged diff (run as .git/hooks/commit-msg)
//   spec-sync-check.mjs <commit-msg-file>       # commit-msg hook convention
//   spec-sync-check.mjs --range A..B [--pr-body-file body.txt]   # CI
//
// Exit 0 = gate passes, 1 = gate fails, 2 = usage error.
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";

const SRC_GLOBS = ["tools/", "mcp/src/", "packages/"];
// Apps + meta the engineering spec does not cover (changing them needs no spec change).
const SRC_EXCLUDE = [
  "tools/studio/",
  "tools/eval/",
  "tools/spec/",
  "tools/docs-ui/",
  "tools/docs/", // the local zero-dep doc viewer launcher (model logic lives under tools/docs/model.mjs — see note)
];
const CODE_EXT = [".mjs", ".ts", ".js"];
const SPEC_PREFIXES = ["specs/"];
const SPEC_FILES = ["base.schema.json"];

/** A path is a test file (never a spec-bearing source change). */
export function isTestFile(file) {
  return (
    /\.(test|spec)\.[a-z]+$/.test(file) ||
    file.includes("/tests/") ||
    file.startsWith("tests/")
  );
}

/** A runtime-source change whose behaviour the spec should describe. */
export function isSourceFile(file, { srcGlobs = SRC_GLOBS, srcExclude = SRC_EXCLUDE } = {}) {
  if (isTestFile(file)) return false;
  if (!CODE_EXT.some((ext) => file.endsWith(ext))) return false;
  if (srcExclude.some((p) => file.startsWith(p))) return false;
  // packages/<name>/{src,bin}/ only — not a package's docs/fixtures/config at its root.
  if (file.startsWith("packages/")) {
    const rest = file.slice("packages/".length).split("/").slice(1).join("/");
    if (!(rest.startsWith("src/") || rest.startsWith("bin/"))) return false;
  }
  return srcGlobs.some((p) => file.startsWith(p));
}

/** A spec change (truth-plane file). */
export function isSpecFile(file, { specPrefixes = SPEC_PREFIXES, specFiles = SPEC_FILES } = {}) {
  return specPrefixes.some((p) => file.startsWith(p)) || specFiles.includes(file);
}

/**
 * The pure verdict, given the changed files and the text to scan for the escape valve.
 * @param {string[]} changedFiles
 * @param {string} markerText
 * @returns {{ ok: boolean, status: "no-source"|"in-sync"|"spec-neutral"|"out-of-sync", srcFiles: string[], neutralReason?: string }}
 */
export function specSyncVerdict(changedFiles, markerText = "", opts = {}) {
  const srcFiles = changedFiles.filter((f) => isSourceFile(f, opts));
  if (srcFiles.length === 0) return { ok: true, status: "no-source", srcFiles };
  if (changedFiles.some((f) => isSpecFile(f, opts))) return { ok: true, status: "in-sync", srcFiles };
  const neutral = /\[SPEC-NEUTRAL:[^\]]*\]/.exec(markerText);
  if (neutral) return { ok: true, status: "spec-neutral", srcFiles, neutralReason: neutral[0] };
  return { ok: false, status: "out-of-sync", srcFiles };
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function parseArgs(argv) {
  const opts = { range: "", prBodyFile: "", msgFile: "" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--range") opts.range = argv[++i] ?? "";
    else if (a === "--pr-body-file") opts.prBodyFile = argv[++i] ?? "";
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a.startsWith("-")) {
      console.error(`spec-sync-check: unknown option '${a}'`);
      process.exit(2);
    } else opts.msgFile = a; // commit-msg hook convention: $1 is the message file
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log("Usage: spec-sync-check.mjs [<commit-msg-file>] [--range A..B] [--pr-body-file FILE]");
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
  } catch (error) {
    console.error("spec-sync-check: not a git repository or bad range.");
    console.error(`  Fix: run inside the repo, or pass a valid --range (e.g. origin/main..HEAD).`);
    process.exit(2);
  }
  if (opts.prBodyFile) {
    if (!fs.existsSync(opts.prBodyFile)) {
      console.error(`spec-sync-check: PR body file not found: ${opts.prBodyFile}`);
      process.exit(2);
    }
    markerText += "\n" + fs.readFileSync(opts.prBodyFile, "utf8");
  } else if (opts.msgFile && fs.existsSync(opts.msgFile)) {
    markerText += "\n" + fs.readFileSync(opts.msgFile, "utf8");
  }
  if (changed.length === 0) {
    console.log("spec-sync: nothing to check (empty diff).");
    return;
  }
  const v = specSyncVerdict(changed, markerText);
  if (v.status === "no-source") {
    console.log("spec-sync: pass — no runtime source change in this diff.");
    return;
  }
  if (v.status === "in-sync") {
    console.log("spec-sync: pass — diff changes both source and specs/.");
    return;
  }
  if (v.status === "spec-neutral") {
    console.log(`spec-sync: pass — source changed without specs, declared ${v.neutralReason}.`);
    console.log("  Note: the claim is a review item — reviewers verify it is really behaviour-neutral.");
    return;
  }
  console.error("spec-sync: FAIL — source changed without touching specs/.");
  console.error("  Update the affected requirement/chapter in specs/current/ in this same change,");
  console.error("  or add '[SPEC-NEUTRAL: reason]' to the commit message / PR body.");
  console.error("  Source files changed without a spec change:");
  for (const f of v.srcFiles) console.error(`    ${f}`);
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("spec-sync-check.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
