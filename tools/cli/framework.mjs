// Engine management: where BASE itself lives, its version, self-registration in the user-global
// config, `whereis`, and `update`. Distinct from the broker (which operates on a BASE root) — this
// operates on the *framework clone*. NOTE: frameworkDir() and the dynamic ./core imports are
// resolved relative to THIS file (tools/cli/), so paths climb two levels to the repo root; keep that
// in mind if this module ever moves. These functions print directly (console.log), not via output().
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildArtifacts } from "../base-core.mjs";

/** This binary's framework directory (the clone root) — two levels up from tools/cli/. */
export function frameworkDir() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
}

/** Read the framework version from package.json — best-effort, "inconnue" if unreadable. */
export async function readFrameworkVersion() {
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(frameworkDir(), "package.json"), "utf8"));
    return pkg.version ?? "inconnue";
  } catch {
    return "inconnue";
  }
}

/** Record where BASE lives in the user-global config — best-effort (a read-only home is fine). */
export async function registerFramework() {
  const home = await configHome();
  const { writeUserConfig } = await import("../core/userconfig.mjs");
  return writeUserConfig(home, frameworkDir(), {
    readFile: (p) => fs.readFile(p, "utf8"),
    writeFile: (p, c) => fs.writeFile(p, c),
    mkdir: (p, o) => fs.mkdir(p, o),
  });
}

/** The home for the user-global config — overridable so tests never touch the real home. */
async function configHome() {
  const os = await import("node:os");
  return process.env.BASE_CONFIG_HOME || os.homedir();
}

/** Where BASE lives, its config file, its version — the question every human and AI asks. */
export async function whereis(asJson) {
  const home = await configHome();
  const { readUserConfig, userConfigPath } = await import("../core/userconfig.mjs");
  const { config } = await readUserConfig(home, (p) => fs.readFile(p, "utf8"));
  const dir = config?.framework_dir ?? frameworkDir();
  const version = await readFrameworkVersion();
  const configPath = userConfigPath(home);
  if (asJson) {
    console.log(JSON.stringify({ frameworkDir: dir, configPath, version, registered: Boolean(config) }, null, 2));
    return;
  }
  const note = config ? "" : "  (non enregistré — lancez «base init» une fois)";
  console.log(`BASE ${version}\n  framework: ${dir}${note}\n  config: ${configPath}`);
}

/** Keep the framework fresh: git pull (or a ZIP message), then version + what changed. */
export async function update() {
  const { updatePlan, staleArtifacts } = await import("../core/update.mjs");
  const dir = await resolvedFrameworkDir();
  const hasGit = await fs.access(path.join(dir, ".git")).then(() => true, () => false);
  const plan = updatePlan({ frameworkDir: dir, hasGit });

  if (plan.type === "manual") {
    console.log(plan.message);
  } else {
    const code = await new Promise((resolve) => {
      spawn("git", ["-C", dir, "pull", "--ff-only"], { stdio: "inherit" })
        .on("exit", resolve)
        .on("error", (e) => { console.error(`git indisponible: ${e.message}`); resolve(1); });
    });
    if (code !== 0) { process.exit(code ?? 1); }
  }

  console.log(`\nBASE ${await readFrameworkVersion()} — ${dir}`);
  const changes = await changelogHead(dir);
  if (changes) console.log(`\nCe qui a changé (Unreleased):\n${changes}`);

  // Honest reminder, scoped to the BASE you are standing in: only when its committed artifacts
  // differ from the current renders (and only there — never a global nag).
  const cwdRoot = await nearbyBaseRoot();
  if (cwdRoot) {
    const pairs = await artifactRenderPairs(cwdRoot);
    const stale = staleArtifacts(pairs);
    if (stale.length) {
      console.log(`\nLes artefacts de ${cwdRoot} diffèrent des rendus actuels: ${stale.join(", ")}`);
      console.log(`Régénérez avec «base build --write» (écrase vos modifications locales de ces fichiers).`);
    }
  }
}

/** The framework dir from the user config, else this binary's own location. */
async function resolvedFrameworkDir() {
  const home = await configHome();
  const { readUserConfig } = await import("../core/userconfig.mjs");
  const { config } = await readUserConfig(home, (p) => fs.readFile(p, "utf8"));
  return config?.framework_dir ?? frameworkDir();
}

/** The first lines of the CHANGELOG's Unreleased section — "what changed", best-effort. */
async function changelogHead(dir) {
  try {
    const text = await fs.readFile(path.join(dir, "CHANGELOG.md"), "utf8");
    const start = text.indexOf("## [Unreleased]");
    if (start === -1) return "";
    const after = text.slice(start + "## [Unreleased]".length);
    const next = after.indexOf("\n## ");
    const section = (next === -1 ? after : after.slice(0, next)).trim();
    return section.split("\n").slice(0, 8).join("\n");
  } catch {
    return "";
  }
}

/** A BASE root at or above the cwd, or null — so the staleness reminder is local, never global. */
async function nearbyBaseRoot() {
  let dir = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    if (await fs.access(path.join(dir, ".ai", "agents")).then(() => true, () => false)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/** Committed artifact contents paired with their fresh render, for the staleness comparison. */
async function artifactRenderPairs(root) {
  const artifacts = await buildArtifacts(root);
  const pairs = [];
  for (const a of artifacts) {
    const onDisk = await fs.readFile(path.join(root, a.path), "utf8").catch(() => null);
    pairs.push({ path: a.path, onDisk, render: a.content });
  }
  return pairs;
}

/** Announce the registration — silent on a no-op, a printed manual fallback when the home refused. */
export function formatRegistration(reg) {
  if (reg.ok) {
    return reg.changed
      ? `BASE enregistré dans ${reg.path} (modifiable à la main).`
      : `Emplacement déjà enregistré dans ${reg.path}.`;
  }
  return `Impossible d'enregistrer l'emplacement (${reg.reason}).\nCréez ${reg.path} à la main avec:\n${reg.content}`;
}
