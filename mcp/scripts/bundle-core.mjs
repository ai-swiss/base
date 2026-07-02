// Copies the BASE broker (tools/base-core.mjs) and its tools/core/ modules next to the
// compiled MCP server so the published package is self-contained (works via `npx` without the
// surrounding repo). The adapter's loadBroker() prefers this bundled copy and falls back to the
// repo layout in dev.
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const toolsDir = resolve(here, "..", "..", "tools");
const destDir = resolve(here, "..", "dist");

await mkdir(destDir, { recursive: true });
await copyFile(resolve(toolsDir, "base-core.mjs"), resolve(destDir, "base-core.mjs"));

// Stamp the frozen copy: WHICH core this build embeds (root package version + exact commit when
// git is available). Once both artifacts circulate independently, drift between the server and its
// bundled broker must be visible, not invisible — the health route reports this stamp. No
// timestamp: the stamp stays reproducible for one (version, commit) pair.
const rootPkg = JSON.parse(await readFile(resolve(here, "..", "..", "package.json"), "utf8"));
let commit = null;
try {
  commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: toolsDir, encoding: "utf8" }).trim();
} catch {
  // building outside a git checkout (e.g. from a source tarball): version alone still identifies the core
}
await writeFile(
  resolve(destDir, "core-version.json"),
  JSON.stringify({ name: rootPkg.name, version: rootPkg.version, commit }, null, 2) + "\n",
);

// base-core.mjs imports from ./core/*.mjs — bundle those too, or the published package breaks.
const coreSrc = resolve(toolsDir, "core");
const coreDest = resolve(destDir, "core");
await mkdir(coreDest, { recursive: true });
let copied = 0;
for (const name of await readdir(coreSrc)) {
  if (name.endsWith(".mjs")) {
    await copyFile(resolve(coreSrc, name), resolve(coreDest, name));
    copied++;
  }
}
console.error(`Bundled tools/base-core.mjs + ${copied} core module(s) into mcp/dist/ (core ${rootPkg.version}${commit ? ` @ ${commit.slice(0, 7)}` : ""})`);
