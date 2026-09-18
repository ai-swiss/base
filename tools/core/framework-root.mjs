// tools/core/framework-root.mjs — where the BASE FRAMEWORK lives for this run.
//
// A root may name a help target it does not own: `routing.fallback: { agent: "concierge-base",
// process: "accueil" }` points at the framework's own welcome process, so a user who asks something
// no process covers lands on an orientation instead of a dead end. That target is not in the user's
// inventory, so the router needs a second place to look, and exactly one: the framework this root is
// already running.
//
// Two candidates, in order:
//   1. `framework_dir` in the root's base.config.json — written by `base init`, and the root's own
//      statement of which framework it belongs to. It is also how the launcher finds the engine, so
//      in CLI use the two coincide by construction.
//   2. the directory of the code currently running — true wherever the engine was installed from
//      (a git checkout, a global npm install), and never stale, since it IS what is executing.
//
// A candidate counts only if it carries `.ai/agents/`: the published MCP bundle ships the engine
// modules without the framework's own corpus, so there the second candidate correctly fails and a
// root that named no `framework_dir` simply gets no fallback (the behaviour before this existed).
// Nothing is copied into the user's root, so nothing can fall behind.

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { pathExists } from "./confine.mjs";

/**
 * The framework directory of the engine executing this code (two levels up from tools/core/).
 * POSIX-normalized like every recorded BASE path, so a resolved target reads the same on every OS.
 */
export function engineFrameworkRoot() {
  return toPosix(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

/**
 * The framework root to consult for a target this root does not own, or null when there is none.
 * Never returns `rootDir` itself: the root corpus was already searched.
 * @param {string} rootDir @param {{ framework_dir?: string }} [cfg]
 * @returns {Promise<string | null>}
 */
export async function resolveFrameworkRoot(rootDir, cfg = {}) {
  const root = toPosix(path.resolve(rootDir));
  const declared = typeof cfg.framework_dir === "string" && cfg.framework_dir.trim()
    ? toPosix(path.resolve(root, cfg.framework_dir.trim()))
    : null;
  for (const candidate of [declared, engineFrameworkRoot()]) {
    if (!candidate || candidate === root) continue;
    if (await pathExists(path.join(candidate, ".ai", "agents"))) return candidate;
  }
  return null;
}
