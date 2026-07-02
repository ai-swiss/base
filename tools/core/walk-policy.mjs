// tools/core/walk-policy.mjs — THE walk policy: which directories no walker enters, and the one
// comparator every stable listing uses. Zero dependencies.
//
// Four walkers consume it — the inventory scan (walkResourceFiles), the disk-tree walker
// (fswalk.mjs: Studio explorer + doctor link graph), the Studio watcher (watch.mjs), and the MCP
// project discovery (via the bundled core). Before this module each carried its own copy of the
// rules, and they had already drifted (different skip sets, one locale-dependent sort). One table,
// one comparator: the next rule lands everywhere at once.

import { compareByCodePoint } from "./ordering.mjs";
export { compareByCodePoint };

// Never resources, never explored, in ANY root: VCS, scratch, build output, and tool-output
// directories (coverage, Playwright, Vite). Inventory correctness must not depend on .gitignore,
// so the policy owns this — matched by NAME, at any depth.
export const UNIVERSAL_SKIP_DIRS = new Set([
  ".git", ".github", ".temp", ".plans", ".reviews", ".admin", "node_modules", "dist", "trace", ".base-docs",
  "coverage", "test-results", "playwright-report", "blob-report", ".playwright", ".vite", ".nyc_output",
]);

// Runtime and derived areas under `.ai/` — written by BASE at run time (trace, changes, eval data)
// or generated projections (routing) and scaffolding (the agent template): never source resources.
// Matched as ROOT-RELATIVE path prefixes.
export const RUNTIME_PREFIXES = [
  ".ai/trace",
  ".ai/changes",
  ".ai/experiments",
  ".ai/routing",
  ".ai/agents/_template",
];

/** True when `relPath` (root-relative, POSIX) is `prefix` itself or sits under it. */
export function isUnder(relPath, prefix) {
  return relPath === prefix || relPath.startsWith(`${prefix}/`);
}

/** True when a directory NAME is universally skipped (any root, any depth). */
export function skipsDirName(name) {
  return UNIVERSAL_SKIP_DIRS.has(name);
}

/**
 * True when a root-relative path falls in a runtime area or in one of the project's own configured
 * exclusions (`inventory.exclude` in base.config — e.g. this repository excludes its engineering
 * trees `specs/`, `tests/`, `packages/` and its translation mirrors `docs/en|de|it`; a user's root
 * excludes nothing by default, so a business folder named `specs/` is inventoried like any other).
 * @param {string} relPath @param {string[]} [exclude]
 */
export function skipsPath(relPath, exclude = []) {
  return RUNTIME_PREFIXES.some((p) => isUnder(relPath, p)) || exclude.some((p) => isUnder(relPath, p));
}

/**
 * Normalize a configured exclusion list: strings only, POSIX separators, no leading `./`, no
 * trailing `/`, empties dropped. Order-preserving, duplicates tolerated (a Set downstream is fine).
 * @param {unknown} raw @returns {string[]}
 */
export function normalizeExcludeList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e) => typeof e === "string")
    .map((e) => e.trim().replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, ""))
    .filter(Boolean);
}
