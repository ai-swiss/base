// The ONE user-global config of the whole system: where the BASE framework lives, so any human,
// any AI, any tool can find it later — and the user can change it by hand. It is the single file
// BASE writes outside a project root; everything else stays project-local.
//
// Pure decisions, injected IO: `readUserConfig`/`writeUserConfig` take an environment and the
// fs functions, so the home path and the disk are testable without touching the real machine.
// Reads are tolerant (missing or corrupt → null + reason, never a throw). Writes are best-effort:
// a read-only home (a sandboxed AI agent's, often) must never make `base init` fail — the caller
// prints the manual fallback instead.

import path from "node:path";

export const USER_CONFIG_VERSION = "base.user-config.v1";

/** The config path for a given environment — XDG-ish, works on Windows via os.homedir(). */
export function userConfigPath(homedir) {
  return path.join(homedir, ".config", "base", "config.json");
}

/**
 * Read the user config. → { config, path } on success; { config: null, path, reason } when absent
 * or unreadable. Never throws: a corrupt file is a degraded value the caller can surface, not a crash.
 * @param {string} homedir
 * @param {(p: string) => Promise<string>} readFile
 */
export async function readUserConfig(homedir, readFile) {
  const configPath = userConfigPath(homedir);
  let raw;
  try {
    raw = await readFile(configPath);
  } catch {
    return { config: null, path: configPath, reason: "absent" };
  }
  try {
    const config = JSON.parse(raw);
    return { config, path: configPath };
  } catch {
    return { config: null, path: configPath, reason: "illisible (JSON invalide)" };
  }
}

/**
 * Write framework_dir, best-effort. → { ok: true, path, changed } when written (changed=false if
 * the value was already there: no needless rewrite), or { ok: false, path, content, reason } when
 * the home is not writable — the caller prints `content` as the manual fallback.
 * @param {string} homedir
 * @param {string} frameworkDir
 * @param {{ readFile: (p: string) => Promise<string>, writeFile: (p: string, c: string) => Promise<void>, mkdir: (p: string, o: object) => Promise<unknown> }} io
 */
export async function writeUserConfig(homedir, frameworkDir, { readFile, writeFile, mkdir }) {
  const configPath = userConfigPath(homedir);
  const desired = { schema_version: USER_CONFIG_VERSION, framework_dir: frameworkDir };
  const content = `${JSON.stringify(desired, null, 2)}\n`;

  const existing = await readUserConfig(homedir, readFile);
  if (existing.config && existing.config.framework_dir === frameworkDir) {
    return { ok: true, path: configPath, changed: false };
  }
  try {
    await mkdir(path.dirname(configPath), { recursive: true });
    await writeFile(configPath, content);
    return { ok: true, path: configPath, changed: true };
  } catch (error) {
    return { ok: false, path: configPath, content, reason: error.message };
  }
}
