// Disk-tree walker — zero dependencies, one rule for every consumer (Studio's explorer, the
// doctor's link graph): the truth of the disk, confined. Hidden entries are skipped except `.ai`;
// the universal skip set (walk-policy.mjs: VCS, build output, tool output) is skipped; symlinks are
// never followed (they are omitted, matching the confinement rule of every other surface).

import { readdir } from "node:fs/promises";
import path from "node:path";
import { UNIVERSAL_SKIP_DIRS, compareByCodePoint, isUnder } from "./walk-policy.mjs";

/**
 * Walk a root directory into a nested tree of plain entries.
 * → { name, path, dirs: [Tree], files: [{ name, path }] } — `path` is root-relative POSIX
 *   ("" for the root node), entries sorted by name.
 * `exclude`: the root's own `inventory.exclude` (root-relative prefixes, dirs or files) — the
 * same list the inventory scan honours, so the explorer never shows more disk than the inventory
 * reads (a root with large scratch/build trees would otherwise ship a tree of 100k+ entries).
 */
export async function walkTree(rootDir, { exclude = [] } = /** @type {{ exclude?: string[] }} */ ({})) {
  const abs = path.resolve(rootDir);
  return walk(abs, "", path.basename(abs), exclude);
}

async function walk(abs, rel, name, exclude) {
  const entries = await readdir(abs, { withFileTypes: true });
  // Code-point order, never localeCompare: stable projections must not depend on the host ICU
  // configuration (the ordering doctrine every other walker already follows).
  entries.sort((a, b) => compareByCodePoint(a.name, b.name));
  const dirs = [];
  const files = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    if (entry.name.startsWith(".") && entry.name !== ".ai") continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (exclude.some((p) => isUnder(childRel, p))) continue;
    if (entry.isDirectory()) {
      if (UNIVERSAL_SKIP_DIRS.has(entry.name)) continue;
      dirs.push(await walk(path.join(abs, entry.name), childRel, entry.name, exclude));
    } else if (entry.isFile()) {
      files.push({ name: entry.name, path: childRel });
    }
  }
  return { name, path: rel, dirs, files };
}

/** Flatten a walked tree into the list of file paths (the doctor's link-graph input). */
export function listFiles(tree) {
  const out = [...tree.files.map((f) => f.path)];
  for (const dir of tree.dirs) out.push(...listFiles(dir));
  return out;
}
