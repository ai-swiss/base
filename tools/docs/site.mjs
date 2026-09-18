// tools/docs/site.mjs — where the documentation SITE adapter lives, and how it is launched.
//
// The site is an OPTIONAL companion package (@ai-swiss/base-docs-site): its closure (Astro,
// Starlight, Pagefind) weighs some 180 MB, which nobody installs to run `base validate`, so it stays
// out of the zero-dependency core (NFR-CORE-001). It is therefore resolved BY PACKAGE NAME, like
// every other companion, and never by repository path: `<root>/packages/base-docs-site` only ever
// existed in a contributor checkout, so `docs build` could not work for a team that installed the
// published package — the corpus BASE was pointed at is not the tree the renderer lives in.
//
// Two candidates, in order (the same shape as framework-root.mjs):
//   1. this engine's own resolution — a project install finds the adapter as a sibling in the same
//      node_modules, and a contributor checkout finds the workspace link to packages/;
//   2. the routed root's node_modules — a globally installed engine still finds an adapter installed
//      next to the corpus it documents.
//
// Resolution goes through the adapter's `package.json`, which is reachable because that package
// declares no `exports` map; should it ever declare one, it must export `./package.json`.
//
// The adapter knows no path of its own: root, model and destination arrive as environment, so it
// renders a corpus that lives anywhere and writes only where the caller decided.

import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import { createRequire } from "node:module";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { missingCompanionError } from "../core/companion.mjs";

const PACKAGE_NAME = "@ai-swiss/base-docs-site";
const BIN_NAME = "base-docs-site";

/** @typedef {{ dir: string, bin: string, id: string }} DocsSite */

/**
 * The two places the adapter may be installed, as the files resolution starts from, in order.
 * Pure: «which two places, in what order» is the decision worth reading, and the only one we own —
 * the resolution itself is Node's.
 * @param {string} rootDir @returns {string[]}
 */
export function docsSiteCandidates(rootDir) {
  return [fileURLToPath(import.meta.url), path.join(path.resolve(rootDir), "package.json")];
}

/**
 * A relative `--out` belongs to the selected BASE root, not to the shell's current directory.
 * Absolute destinations remain an explicit caller choice.
 * @param {string} rootDir
 * @param {string | undefined} requested
 * @param {string} fallback
 */
export function resolveDocsSiteOutput(rootDir, requested, fallback) {
  const destination = requested || fallback;
  return path.isAbsolute(destination)
    ? path.normalize(destination)
    : path.resolve(rootDir, destination);
}

/**
 * The one honest line to print when this Node cannot run the adapter, else null. The floor is the one
 * the adapter DECLARES (`engines.node`), so the constraint stays with the code that has it: Astro
 * needs Node >= 22.12 while the core supports >= 18. Only the `>=x.y[.z]` form BASE writes is read;
 * any other range earns no preflight rather than a guess.
 * @param {string} version @param {string | undefined} range @returns {string | null}
 */
export function engineFloorError(version, range) {
  const match = /^>=\s*(\d+)\.(\d+)(?:\.(\d+))?$/.exec(String(range ?? "").trim());
  if (!match) return null;
  const floor = [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
  const actual = version.split(".").map(Number);
  for (let part = 0; part < floor.length; part += 1) {
    const mine = actual[part] ?? 0;
    if (mine === floor[part]) continue;
    if (mine > floor[part]) return null;
    return (
      `Le site de documentation demande Node ${floor.join(".")} ou plus (vous avez ${version}).\n` +
      `  Installez la version LTS depuis https://nodejs.org puis relancez.`
    );
  }
  return null;
}

/**
 * Locate the installed adapter, or fail with the branded «install it» message every optional
 * companion uses. A runtime below the adapter's floor is refused here too, so it reads as one line
 * instead of a stack trace from inside Astro.
 * @param {string} rootDir @returns {Promise<DocsSite>}
 */
export async function resolveDocsSite(rootDir) {
  const manifestPath = locateManifest(rootDir);
  if (!manifestPath) throw missingCompanionError(PACKAGE_NAME, "Le site de documentation");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const floorError = engineFloorError(process.versions.node, manifest.engines?.node);
  if (floorError) throw new Error(floorError);
  const declaredBin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin?.[BIN_NAME];
  if (!declaredBin) {
    throw new Error(`${PACKAGE_NAME} ne déclare pas son point d'entrée «${BIN_NAME}»: paquet incomplet ou trop ancien (${manifestPath}).`);
  }
  const dir = path.dirname(manifestPath);
  return { dir, bin: path.resolve(dir, declaredBin), id: `${manifest.name}@${manifest.version}` };
}

/**
 * Run one adapter command against a written model. `cwd` is the adapter's own directory (that is
 * where its Astro configuration lives); everything about the corpus and the destination travels in
 * the environment, so nothing is ever written inside the installed package.
 * @param {DocsSite} site
 * @param {{ command: "build" | "dev" | "preview", root: string, modelDir: string, siteOut?: string }} options
 */
export async function runDocsSite(site, { command, root, modelDir, siteOut = "" }) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [site.bin, command], {
      cwd: site.dir,
      stdio: "inherit",
      env: {
        ...process.env,
        ASTRO_TELEMETRY_DISABLED: "1",
        BASE_DOCS_ROOT: path.resolve(root),
        BASE_DOCS_MODEL_DIR: modelDir,
        ...(siteOut ? { BASE_DOCS_DIST: siteOut } : {}),
      },
    });
    const forwardSignal = (signal) => child.kill(signal);
    const onInterrupt = () => forwardSignal("SIGINT");
    const onTerminate = () => forwardSignal("SIGTERM");
    const cleanup = () => {
      process.off("SIGINT", onInterrupt);
      process.off("SIGTERM", onTerminate);
    };
    process.once("SIGINT", onInterrupt);
    process.once("SIGTERM", onTerminate);
    child.on("error", (error) => {
      cleanup();
      reject(error);
    });
    child.on("exit", (code, signal) => {
      cleanup();
      if (code === 0) resolve(undefined);
      else reject(new Error(`Docs site ${command} failed${signal ? ` (${signal})` : ""}${code == null ? "" : ` with exit code ${code}`}.`));
    });
  });
}

/** @param {string} rootDir @returns {string | null} */
function locateManifest(rootDir) {
  for (const from of docsSiteCandidates(rootDir)) {
    try {
      return createRequire(from).resolve(`${PACKAGE_NAME}/package.json`);
    } catch {
      // Not installed here; ask the next place.
    }
  }
  return null;
}
