// Low-level filesystem confinement primitives. Zero dependencies (node:* only).
// Shared by the broker and extension loader so every file-system boundary uses one rule.
// base-core.mjs re-exports these names.

import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Resolve targetPath inside rootDir, refusing path traversal and outward symlinks.
// Returns the canonical path. Tolerates not-yet-existing paths (returns the resolved path).
//
// Confinement must hold on the WRITE side too, so a not-yet-existing leaf cannot be smuggled out of
// the root through a symlink. Two escapes are blocked even when the leaf does not exist yet:
//   1. a symlinked *ancestor* directory (`root/sub -> /outside`, then `root/sub/new.txt`);
//   2. a dangling symlink *leaf* (`root/link -> /outside/x`, target absent).
// We therefore canonicalize the nearest existing ancestor and reject a symlink leaf, instead of
// trusting `path.resolve` (which never follows symlinks) when `realpath` reports ENOENT.
export async function confineToRoot(rootDir, targetPath) {
  const root = path.resolve(rootDir);
  const resolved = path.resolve(root, targetPath);

  if (!isWithin(resolved, root)) {
    throw new Error(`Path escapes BASE root: ${targetPath}`);
  }

  let canonicalRoot = root;
  try {
    canonicalRoot = await fs.realpath(root);
  } catch {
    // Keep normalized root for newly created projects.
  }

  const symlinkEscape = () => new Error(`Path escapes BASE root through symlink: ${targetPath}`);

  try {
    const real = await fs.realpath(resolved);
    if (!isWithin(real, canonicalRoot)) throw symlinkEscape();
    return real;
  } catch (error) {
    // Only ENOENT (the leaf, or part of the path, does not exist yet) is recoverable. Any other
    // realpath failure (ELOOP, EACCES, …) is rethrown rather than silently treated as "in root".
    if (error?.code !== "ENOENT") throw error;

    // A dangling symlink leaf would be followed by a subsequent write — refuse it outright.
    const leaf = await lstatOrNull(resolved);
    if (leaf?.isSymbolicLink()) throw symlinkEscape();

    // Canonicalize the nearest existing ancestor: this resolves any symlinked directory on the path.
    const ancestorReal = await realpathNearestAncestor(resolved);
    if (ancestorReal !== null && !isWithin(ancestorReal, canonicalRoot)) throw symlinkEscape();
    return resolved;
  }
}

function isWithin(candidate, root) {
  return candidate === root || candidate.startsWith(root + path.sep);
}

async function lstatOrNull(target) {
  try {
    return await fs.lstat(target);
  } catch {
    return null;
  }
}

// Walk up from `target` to the first ancestor that exists, and return its canonical (realpath) path.
// Returns null only if nothing up to the filesystem root exists.
async function realpathNearestAncestor(target) {
  let current = path.dirname(target);
  while (true) {
    try {
      return await fs.realpath(current);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      const parent = path.dirname(current);
      if (parent === current) return null;
      current = parent;
    }
  }
}
