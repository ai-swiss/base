// Disk-tree walker — zero dependencies, one rule for every consumer (Studio's explorer, the
// doctor's link graph): the truth of the disk, confined. Hidden entries are skipped except `.ai`;
// .git/node_modules/.base-docs are skipped; symlinks are never followed (they are omitted,
// matching the confinement rule of every other surface).

import { readdir } from "node:fs/promises";
import path from "node:path";

const IGNORED_DIRS = new Set([".git", "node_modules", ".base-docs"]);

/**
 * Walk a root directory into a nested tree of plain entries.
 * → { name, path, dirs: [Tree], files: [{ name, path }] } — `path` is root-relative POSIX
 *   ("" for the root node), entries sorted by name.
 */
export async function walkTree(rootDir) {
  const abs = path.resolve(rootDir);
  return walk(abs, "", path.basename(abs));
}

async function walk(abs, rel, name) {
  const entries = await readdir(abs, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  const dirs = [];
  const files = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    if (entry.name.startsWith(".") && entry.name !== ".ai") continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      dirs.push(await walk(path.join(abs, entry.name), childRel, entry.name));
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
