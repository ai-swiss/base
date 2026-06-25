// Copies the BASE broker (tools/base-core.mjs) and its tools/core/ modules next to the
// compiled MCP server so the published package is self-contained (works via `npx` without the
// surrounding repo). The adapter's loadBroker() prefers this bundled copy and falls back to the
// repo layout in dev.
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const toolsDir = resolve(here, "..", "..", "tools");
const destDir = resolve(here, "..", "dist");

await mkdir(destDir, { recursive: true });
await copyFile(resolve(toolsDir, "base-core.mjs"), resolve(destDir, "base-core.mjs"));

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
console.error(`Bundled tools/base-core.mjs + ${copied} core module(s) into mcp/dist/`);
