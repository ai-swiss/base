import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-mcp-pack-smoke-"));

function parseNpmPackJson(stdout) {
  const start = stdout.indexOf("[");
  const end = stdout.lastIndexOf("]");
  assert.ok(start >= 0 && end > start, "npm pack --json output must contain a JSON array");
  return JSON.parse(stdout.slice(start, end + 1));
}

try {
  const packDir = path.join(tmpDir, "pack");
  const appDir = path.join(tmpDir, "app");
  await fs.mkdir(packDir, { recursive: true });
  await fs.mkdir(appDir, { recursive: true });

  const { stdout: packStdout } = await execFileAsync("npm", ["pack", "--json", "--pack-destination", packDir], {
    cwd: repoRoot,
  });
  const packed = parseNpmPackJson(packStdout);
  const files = new Set(packed[0].files.map((file) => file.path));
  assert.ok(files.has("dist/index.js"), "packed MCP server must include dist/index.js");
  assert.ok(files.has("dist/base-core.mjs"), "packed MCP server must include bundled dist/base-core.mjs");
  assert.ok(files.has("dist/core/ordering.mjs"), "packed MCP server must include core modules imported by base-core.mjs");
  assert.ok(![...files].some((file) => file.startsWith("dist/dist-backup/")), "packed MCP server must not include dist/dist-backup");

  const tarball = path.join(packDir, packed[0].filename);
  await fs.writeFile(path.join(appDir, "package.json"), JSON.stringify({ type: "module", private: true }), "utf8");
  await execFileAsync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], { cwd: appDir });

  const installedRoot = path.join(appDir, "node_modules", "@ai-swiss", "base-mcp");
  const brokerPath = path.join(installedRoot, "dist", "base-core.mjs");
  const broker = await import(pathToFileURL(brokerPath).href);
  assert.equal(typeof broker.inventoryResources, "function");
  assert.equal(broker.compareByCodePoint("b", "a"), 1);

  const binName = process.platform === "win32" ? "base-mcp.cmd" : "base-mcp";
  const binPath = path.join(appDir, "node_modules", ".bin", binName);
  await fs.access(binPath);
  await assert.rejects(
    () => execFileAsync(binPath, ["--transport", "invalid"], { cwd: appDir }),
    (error) => {
      assert.match(String(error.stderr || error.stdout || error.message), /Invalid transport/);
      return true;
    },
  );

  console.log("MCP pack smoke OK");
} finally {
  await fs.rm(tmpDir, { recursive: true, force: true });
}
