#!/usr/bin/env node
// Requirements → tests matrix, generated. The matrix is a DERIVED artifact in the BASE sense:
// regenerable from the sources (requirements.md + test files), never edited by hand, kept fresh by
// a regenerate-and-diff gate (tests/requirements-matrix.test.mjs, and `--check` here).
//
//   node tools/spec/requirements-matrix.mjs            # (re)write the matrix
//   node tools/spec/requirements-matrix.mjs --check    # exit 1 if the committed matrix is stale
//   node tools/spec/requirements-matrix.mjs --ratchet  # exit 1 if weak/gap counts rose vs a git baseline
//
// Tests declare what they cover with a `// Spec coverage: FR-XXX-NNN ...` header (or by naming an
// ID in a test title). A citation of an ID that does not exist in requirements.md fails loudly:
// a phantom citation is worse than a gap.
//
// Proof STRENGTH is honest, not binary:
//   ✅ strong   — a real, non-skipped test cites it.
//   ⚠️ weak     — its only citations are written `ID~weak[reason]` (snapshot-only, partial,
//                 tautological) or sit on a skipped/todo test; the bracketed reason is REQUIRED.
//   ❌ GAP      — no test cites it.
//   ⊘ de-scoped — the requirement was retired but keeps its ID (`[DE-SCOPED: reason]` on its row);
//                 excluded from the proof counts, never a GAP.
//
// Two no-regression properties make the gauge trustworthy:
//   - `--ratchet` fails if the weak or gap count rose against the committed baseline matrix, so a PR
//     cannot quietly add unproven/weak requirements (quality is monotone).
//   - In CI the matrix job runs AFTER the test suites (job ordering), so a green matrix cannot sit on
//     top of a red suite — "a test cites it" and "the suite passes" hold together.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { PROVABLE_PREFIXES, idPattern, rowIdPattern } from "./id-grammar.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REQUIREMENTS_FILE = "specs/current/10_core/requirements.md";
const MATRIX_FILE = "specs/current/10_core/requirements-matrix.md";

// Built from the single grammar source so the matrix and the immutability gate cannot diverge.
const ID_PATTERN = () => idPattern(PROVABLE_PREFIXES);
const ROW_ID = () => rowIdPattern(PROVABLE_PREFIXES);
const WEAK_PATTERN = () =>
  new RegExp(`\\b((?:${PROVABLE_PREFIXES.join("|")})-[A-Z]+-\\d{3})~weak(?:\\[([^\\]\\n]+)\\])?`, "g");
// A skipped/todo test title that names an ID: its citation proves nothing.
const SKIP_TITLE = () =>
  new RegExp(
    `(?:it|test|describe)\\.(?:skip|todo)\\s*\\(\\s*["'\`][^"'\`\\n]*\\b((?:${PROVABLE_PREFIXES.join("|")})-[A-Z]+-\\d{3})\\b`,
    "g",
  );

/**
 * Requirement IDs defined as table rows (first column), in file order.
 * @param {string} markdown
 * @returns {string[]}
 */
export function extractDefinedIds(markdown) {
  const ids = [];
  for (const match of markdown.matchAll(ROW_ID())) {
    if (!ids.includes(match[1])) ids.push(match[1]);
  }
  return ids;
}

/**
 * Defined IDs marked retired on their row with a trailing `[DE-SCOPED: reason]`.
 * Such an ID keeps its number (immutability) but is excluded from the proof counts.
 * @param {string} markdown
 * @returns {Set<string>}
 */
export function extractDescopedIds(markdown) {
  const ids = new Set();
  const re = new RegExp(`^\\|\\s*((?:${PROVABLE_PREFIXES.join("|")})-[A-Z]+-\\d{3})\\s*\\|[^\\n]*\\[DE-SCOPED`, "gm");
  for (const m of markdown.matchAll(re)) ids.add(m[1]);
  return ids;
}

/**
 * Every full-form ID mentioned anywhere (defined rows + cross-references): the set a test may cite.
 * @param {string} markdown
 * @returns {Set<string>}
 */
export function extractKnownIds(markdown) {
  return new Set([...markdown.matchAll(ID_PATTERN())].map((m) => m[1]));
}

/**
 * IDs cited by one test file (header comments and test titles alike). A `~weak` suffix is tolerated
 * by the word boundary, so `FR-X-001~weak` still counts as a citation of `FR-X-001`.
 * @param {string} source
 * @returns {string[]}
 */
export function extractCitedIds(source) {
  return [...new Set([...source.matchAll(ID_PATTERN())].map((m) => m[1]))];
}

/**
 * IDs cited on a `// Spec coverage:` header line: the deliberate proof claim (vs an incidental title).
 * @param {string} source
 * @returns {Set<string>}
 */
export function extractHeaderIds(source) {
  const ids = new Set();
  for (const line of source.split("\n")) {
    if (/Spec coverage:/i.test(line)) for (const m of line.matchAll(ID_PATTERN())) ids.add(m[1]);
  }
  return ids;
}

/**
 * IDs a file marks as a deliberately WEAK proof (written `ID~weak` or `ID~weak[reason]`).
 * @param {string} source
 * @returns {Set<string>}
 */
export function extractWeakCitedIds(source) {
  return new Set([...source.matchAll(WEAK_PATTERN())].map((m) => m[1]));
}

/**
 * Weak citations with their (required) reason: `{id, reason}` per occurrence.
 * @param {string} source
 * @returns {{ id: string, reason: string }[]}
 */
export function extractWeakCitations(source) {
  return [...source.matchAll(WEAK_PATTERN())].map((m) => ({ id: m[1], reason: m[2] ?? "" }));
}

/**
 * IDs named only by a skipped/todo test title (`it.skip("FR-X-001 …")`): a citation that proves nothing.
 * @param {string} source
 * @returns {Set<string>}
 */
export function extractSkippedIds(source) {
  return new Set([...source.matchAll(SKIP_TITLE())].map((m) => m[1]));
}

/** @param {string} dir @param {(name: string) => boolean} keep */
async function listFiles(dir, keep) {
  try {
    const entries = await fs.readdir(path.join(ROOT, dir));
    return entries.filter(keep).map((name) => path.posix.join(dir, name));
  } catch {
    return [];
  }
}

/** Recursive variant for nested test trees (the Studio UI keeps tests beside the components). */
async function listFilesRec(dir, keep) {
  let entries;
  try {
    entries = await fs.readdir(path.join(ROOT, dir), { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFilesRec(rel, keep)));
    else if (keep(entry.name)) out.push(rel);
  }
  return out;
}

/** Test files that participate in the matrix, relative POSIX paths, sorted. */
export async function listTestFiles() {
  const isMjsTest = (/** @type {string} */ name) => name.endsWith(".test.mjs");
  const isTsTest = (/** @type {string} */ name) => name.endsWith(".test.ts");
  // The Studio UI proves its flows with vitest (`*.test.tsx`) and Playwright (`e2e/*.spec.ts`);
  // both layers carry `// Spec coverage:` headers, so the matrix sees the UI, not only the broker.
  const isUiTest = (/** @type {string} */ name) => name.endsWith(".test.ts") || name.endsWith(".test.tsx");
  const isE2eSpec = (/** @type {string} */ name) => name.endsWith(".spec.ts");
  const packageDirs = (await fs.readdir(path.join(ROOT, "packages"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.posix.join("packages", entry.name, "tests"));
  const groups = await Promise.all([
    listFiles("tests", isMjsTest),
    ...packageDirs.map((dir) => listFiles(dir, isMjsTest)),
    listFiles("mcp/tests", isTsTest),
    listFilesRec("tools/studio/ui/src", isUiTest),
    listFilesRec("tools/studio/ui/e2e", isE2eSpec),
  ]);
  return groups.flat().sort();
}

const PROOF_LABEL = { strong: "✅", weak: "⚠️ weak", gap: "❌ no test — GAP", descoped: "⊘ de-scoped" };

/**
 * Proof status per requirement: de-scoped (retired), gap (no citation), weak (cited but no strong
 * citation), else strong.
 * @param {string[]} definedIds
 * @param {Map<string, string[]>} citations id → citing files
 * @param {Set<string>} [strongIds] ids with at least one strong (non-weak, non-skipped) citation
 * @param {Set<string>} [descopedIds] retired ids
 * @returns {Map<string, "strong"|"weak"|"gap"|"descoped">}
 */
export function proofStatus(definedIds, citations, strongIds, descopedIds) {
  const status = new Map();
  for (const id of definedIds) {
    if (descopedIds && descopedIds.has(id)) {
      status.set(id, "descoped");
      continue;
    }
    const files = citations.get(id) ?? [];
    if (files.length === 0) status.set(id, "gap");
    else if (strongIds && !strongIds.has(id)) status.set(id, "weak");
    else status.set(id, "strong");
  }
  return status;
}

/**
 * @param {string[]} definedIds
 * @param {Map<string, string[]>} citations requirement id → citing test files
 * @param {{ statusById?: Map<string, "strong"|"weak"|"gap"|"descoped">, weakReasons?: Map<string, Set<string>>, descopedIds?: Set<string>, partialIds?: Set<string> }} [options]
 * @returns {string}
 */
export function renderMatrix(definedIds, citations, options = {}) {
  const { weakReasons = new Map(), descopedIds = new Set(), partialIds = new Set() } = options;
  const status = options.statusById ?? proofStatus(definedIds, citations, undefined, descopedIds);
  const gaps = definedIds.filter((id) => status.get(id) === "gap");
  const weak = definedIds.filter((id) => status.get(id) === "weak");
  const descoped = definedIds.filter((id) => status.get(id) === "descoped");
  const active = definedIds.length - descoped.length;
  const proven = active - gaps.length;
  let headline = `**${proven} of ${active} requirements proven by a test — ${weak.length} weak, ${gaps.length} gap`;
  if (descoped.length) headline += `, ${descoped.length} de-scoped`;
  headline += `.**`;
  const lines = [
    "# 10 · Requirements → tests matrix",
    "",
    "<!-- generated by `node tools/spec/requirements-matrix.mjs` - do not edit -->",
    "",
    "Derived from the `Spec coverage:` headers (and test titles) in the test suites. Proof statuses:",
    "✅ proven · ⚠️ weak (snapshot-only/partial/tautological — flagged `ID~weak[reason]` at the test, or",
    "named only by a skipped test) · ❌ no test — GAP · ⊘ de-scoped (retired, keeps its ID). Regenerate",
    "with `npm run spec:matrix`; CI fails when this file is stale, when a test cites an unknown ID, or",
    "when the weak/gap count rises against the baseline (`--ratchet`).",
    "",
    headline,
    "",
    "| Requirement | Proof | Covered by |",
    "|---|---|---|",
  ];
  for (const id of definedIds) {
    const files = citations.get(id) ?? [];
    const covered = files.length ? files.map((file) => `\`${file}\``).join("<br>") : "—";
    lines.push(`| ${id} | ${PROOF_LABEL[status.get(id) ?? "gap"]} | ${covered} |`);
  }

  lines.push("", "## Weak proofs (cited, but not yet a strong test)", "");
  if (weak.length === 0 && partialIds.size === 0) {
    lines.push("None.");
  } else {
    if (weak.length) {
      for (const id of weak) {
        const reasons = [...(weakReasons.get(id) ?? new Set())].filter(Boolean);
        lines.push(`- ${id}${reasons.length ? ` — ${reasons.join("; ")}` : ""}`);
      }
    } else {
      lines.push("None fully weak.");
    }
    const partials = definedIds.filter((id) => partialIds.has(id) && status.get(id) === "strong");
    if (partials.length) {
      lines.push(
        "",
        "Partial proof (a strong test exists, but at least one citation is flagged weak — review that the",
        "strong test really covers the claim):",
        "",
        ...partials.map((id) => {
          const reasons = [...(weakReasons.get(id) ?? new Set())].filter(Boolean);
          return `- ${id}${reasons.length ? ` — ${reasons.join("; ")}` : ""}`;
        }),
      );
    }
  }

  lines.push("", "## Gaps (requirements with no citing test)", "");
  if (gaps.length === 0) {
    lines.push("None.");
  } else {
    lines.push(
      "Listed honestly rather than padded. A gap means no test file cites the ID yet - the behaviour",
      "may still be covered by an unannotated test, or be documentation-verified (UR rows).",
      "",
      ...gaps.map((id) => `- ${id}`),
    );
  }

  if (descoped.length) {
    lines.push(
      "",
      "## De-scoped (retired, ID preserved)",
      "",
      "Retired requirements keep their ID for traceability and are excluded from the proof counts.",
      "",
      ...descoped.map((id) => `- ${id}`),
    );
  }
  return lines.join("\n") + "\n";
}

/** Build the matrix content from the repository state. */
export async function buildMatrix() {
  const requirements = await fs.readFile(path.join(ROOT, REQUIREMENTS_FILE), "utf8");
  const definedIds = extractDefinedIds(requirements);
  const knownIds = extractKnownIds(requirements);
  const descopedIds = extractDescopedIds(requirements);
  const citations = new Map(definedIds.map((id) => [id, /** @type {string[]} */ ([])]));
  const strongIds = new Set();
  /** @type {Map<string, Set<string>>} */
  const weakReasons = new Map();
  const weakAnywhere = new Set();
  const phantoms = [];
  const missingReasons = [];

  for (const file of await listTestFiles()) {
    const source = await fs.readFile(path.join(ROOT, file), "utf8");
    const headerHere = extractHeaderIds(source);
    const weakHere = extractWeakCitedIds(source);
    const skippedHere = extractSkippedIds(source);
    for (const id of extractCitedIds(source)) {
      if (!knownIds.has(id)) {
        phantoms.push(`${file} cites ${id}, which does not exist in ${REQUIREMENTS_FILE}`);
        continue;
      }
      const files = citations.get(id);
      if (files && !files.includes(file)) files.push(file);
      // Strong if cited on a non-weak header, or in any non-skipped, non-weak position.
      const strong = (headerHere.has(id) && !weakHere.has(id)) || (!skippedHere.has(id) && !weakHere.has(id));
      if (strong) strongIds.add(id);
    }
    for (const { id, reason } of extractWeakCitations(source)) {
      if (!knownIds.has(id)) continue; // already reported as a phantom above
      weakAnywhere.add(id);
      if (!reason.trim()) {
        missingReasons.push(`${file} cites ${id}~weak without a [reason]`);
      } else {
        let reasons = weakReasons.get(id);
        if (!reasons) {
          reasons = new Set();
          weakReasons.set(id, reasons);
        }
        reasons.add(reason.trim());
      }
    }
  }
  if (phantoms.length > 0) {
    throw new Error(`Phantom requirement citations:\n- ${phantoms.join("\n- ")}`);
  }
  if (missingReasons.length > 0) {
    throw new Error(
      `Weak proofs must carry a reason (write \`ID~weak[reason]\`):\n- ${missingReasons.join("\n- ")}`,
    );
  }
  // Partial: a strong test exists but a weak citation also exists — surfaced for review, not failed.
  const partialIds = new Set([...weakAnywhere].filter((id) => strongIds.has(id)));
  const statusById = proofStatus(definedIds, citations, strongIds, descopedIds);
  return renderMatrix(definedIds, citations, { statusById, weakReasons, descopedIds, partialIds });
}

/**
 * Parse the headline counts of a rendered matrix.
 * @param {string} markdown
 * @returns {{ proven: number, total: number, weak: number, gap: number, descoped: number } | null}
 */
export function parseCounts(markdown) {
  const m = markdown.match(
    /\*\*(\d+) of (\d+) requirements proven by a test — (\d+) weak, (\d+) gap(?:, (\d+) de-scoped)?\.\*\*/,
  );
  if (!m) return null;
  return {
    proven: Number(m[1]),
    total: Number(m[2]),
    weak: Number(m[3]),
    gap: Number(m[4]),
    descoped: Number(m[5] ?? 0),
  };
}

/**
 * The no-regression ratchet: quality may stay or improve, never slip.
 * @param {{ weak: number, gap: number }} base
 * @param {{ weak: number, gap: number }} current
 * @returns {{ ok: boolean, weakRose: boolean, gapRose: boolean }}
 */
export function ratchetVerdict(base, current) {
  const weakRose = current.weak > base.weak;
  const gapRose = current.gap > base.gap;
  return { ok: !weakRose && !gapRose, weakRose, gapRose };
}

function gitTry(/** @type {string[]} */ args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
}

/** First resolvable baseline ref, or null. */
function resolveBaseRef(/** @type {string} */ explicit) {
  const candidates = explicit ? [explicit] : ["origin/main", "main", "HEAD"];
  for (const ref of candidates) {
    if (gitTry(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]) !== null) return ref;
  }
  return null;
}

async function ratchetMain(/** @type {string[]} */ argv) {
  const baseIdx = argv.indexOf("--base");
  const explicit = baseIdx >= 0 ? (argv[baseIdx + 1] ?? "") : "";
  const current = parseCounts(await buildMatrix());
  if (!current) {
    console.error("spec-matrix ratchet: cannot parse the freshly built matrix counts.");
    process.exit(1);
  }
  const ref = resolveBaseRef(explicit);
  if (ref === null) {
    console.log("spec-matrix ratchet: no baseline ref (origin/main, main, HEAD) — skipping.");
    return;
  }
  const baseMatrix = gitTry(["show", `${ref}:${MATRIX_FILE}`]);
  const baseCounts = baseMatrix ? parseCounts(baseMatrix) : null;
  if (!baseCounts) {
    console.log(`spec-matrix ratchet: no parseable baseline matrix at ${ref} — skipping (first run).`);
    return;
  }
  const v = ratchetVerdict(baseCounts, current);
  if (!v.ok) {
    if (v.weakRose)
      console.error(
        `spec-matrix ratchet: weak proof count rose ${baseCounts.weak} → ${current.weak} vs ${ref}. ` +
          `A new weak (⚠️) requirement must gain a strong test before merging; proof quality may not regress.`,
      );
    if (v.gapRose)
      console.error(
        `spec-matrix ratchet: GAP count rose ${baseCounts.gap} → ${current.gap} vs ${ref}. ` +
          `A new requirement must carry a citing test; proof quality may not regress.`,
      );
    process.exit(1);
  }
  console.log(
    `spec-matrix ratchet: ok — weak ${current.weak} (≤ ${baseCounts.weak}), gap ${current.gap} (≤ ${baseCounts.gap}) vs ${ref}.`,
  );
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--ratchet")) return ratchetMain(argv);

  const check = argv.includes("--check");
  const content = await buildMatrix();
  const target = path.join(ROOT, MATRIX_FILE);
  if (check) {
    const committed = await fs.readFile(target, "utf8").catch(() => "");
    if (committed !== content) {
      console.error(`${MATRIX_FILE} is stale. Run: node tools/spec/requirements-matrix.mjs`);
      process.exit(1);
    }
    console.log(`${MATRIX_FILE} is fresh.`);
    return;
  }
  await fs.writeFile(target, content, "utf8");
  console.log(`Wrote ${MATRIX_FILE}.`);
}

if (process.argv[1] && process.argv[1].endsWith("requirements-matrix.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
