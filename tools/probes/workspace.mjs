import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MAX_OUTPUT_BYTES = 50 * 1024 * 1024;

export async function prepareProbeRuntime(repoRoot, runDir, scenarios) {
  const inputs = path.join(runDir, "inputs");
  const app = path.join(runDir, "runtime");
  await fs.mkdir(inputs, { recursive: true });
  await fs.mkdir(app, { recursive: true });
  const needsCore = scenarios.some((scenario) => scenario.mcp || scenario.setup.kind !== "empty");
  if (!needsCore) {
    return {
      app,
      baseBin: null,
      mcpBin: null,
      packageRoot: null,
      packages: {},
    };
  }
  const core = await pack(repoRoot, inputs);
  const archives = [core.file];
  let mcp = null;
  let docsSite = null;
  if (scenarios.some((scenario) => scenario.mcp)) {
    const mcpRoot = path.join(repoRoot, "mcp");
    mcp = await withPackageBuildLock(mcpRoot, async () => {
      await runStrict("npm", ["run", "build"], { cwd: mcpRoot });
      return pack(mcpRoot, inputs);
    });
    archives.push(mcp.file);
  }
  if (scenarios.some((scenario) => scenario.companions?.includes("docs-site"))) {
    docsSite = await pack(path.join(repoRoot, "packages", "base-docs-site"), inputs);
    archives.push(docsSite.file);
  }
  await fs.writeFile(path.join(app, "package.json"), '{"private":true}\n', "utf8");
  await runStrict("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", ...archives], { cwd: app });
  return {
    app,
    baseBin: binary(app, "base"),
    mcpBin: mcp ? binary(app, "base-mcp") : null,
    packageRoot: path.join(app, "node_modules", "@ai-swiss", "base"),
    packages: {
      base: { file: path.relative(runDir, core.file), sha256: core.sha256 },
      ...(mcp ? { mcp: { file: path.relative(runDir, mcp.file), sha256: mcp.sha256 } } : {}),
      ...(docsSite ? { docsSite: { file: path.relative(runDir, docsSite.file), sha256: docsSite.sha256 } } : {}),
    },
  };
}

export async function prepareProbeRoot({ root, configHome, harness, runtime, scenario }) {
  if (scenario.setup.kind === "example") {
    const source = path.join(
      runtime.packageRoot,
      "exemples",
      scenario.setup.example,
      scenario.setup.subpath ?? "",
    );
    await fs.cp(source, root, { recursive: true, force: false });
  } else if (scenario.setup.kind === "package") {
    await fs.cp(runtime.packageRoot, root, { recursive: true, force: false });
  } else if (scenario.setup.kind === "init") {
    const tool = entryToolForHarness(harness);
    await runStrict(runtime.baseBin, ["init", ...scenario.setup.args, "--tool", tool, "--yes", "--root", root], {
      cwd: root,
      env: { ...process.env, BASE_CONFIG_HOME: configHome },
    });
  }
  await writeSetupFiles(root, scenario.setup.files ?? {});
}

export function entryToolForHarness(harness) {
  if (harness === "claude-code") return "claude-code";
  if (harness === "codex") return "agents-md";
  throw new Error(`Harness de probe inconnu: ${harness}.`);
}

export async function writeMcpConfig(attemptDir, mcpBin, root) {
  if (!mcpBin) throw new Error("Le runtime MCP manque pour un scénario MCP.");
  const file = path.join(attemptDir, "mcp.json");
  await writeJson(file, {
    mcpServers: {
      base: {
        command: mcpBin,
        args: ["--root", root, "--read-only"],
      },
    },
  });
  return file;
}

export async function snapshotTree(root) {
  const snapshot = {};
  async function visit(current, relative = "") {
    for (const entry of (await fs.readdir(current, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const absolute = path.join(current, entry.name);
      const rel = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) await visit(absolute, rel);
      else if (entry.isFile()) snapshot[rel] = await sha256(absolute);
    }
  }
  await visit(root);
  return snapshot;
}

export function diffSnapshots(before, after) {
  const beforePaths = new Set(Object.keys(before));
  const afterPaths = new Set(Object.keys(after));
  return {
    added: [...afterPaths].filter((item) => !beforePaths.has(item)).sort(),
    removed: [...beforePaths].filter((item) => !afterPaths.has(item)).sort(),
    modified: [...afterPaths].filter((item) => beforePaths.has(item) && before[item] !== after[item]).sort(),
  };
}

export async function runCaptured(command, args, options) {
  const { timeout = 0, killGrace = 1_000, ...spawnOptions } = options;
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      ...spawnOptions,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let overflowed = false;
    let forceKillTimer;
    const terminate = () => {
      signalProcessTree(child, "SIGTERM");
      forceKillTimer ??= setTimeout(() => {
        signalProcessTree(child, "SIGKILL");
        signalDirectChild(child, "SIGKILL");
        child.stdout.destroy();
        child.stderr.destroy();
      }, killGrace);
    };
    const timeoutTimer = timeout > 0
      ? setTimeout(() => {
        timedOut = true;
        terminate();
      }, timeout)
      : null;
    const capture = (stream, append) => stream.on("data", (chunk) => {
      append(String(chunk));
      if (!overflowed && Buffer.byteLength(stdout) + Buffer.byteLength(stderr) > MAX_OUTPUT_BYTES) {
        overflowed = true;
        stderr += `\nSortie interrompue: limite de ${MAX_OUTPUT_BYTES} octets dépassée.\n`;
        terminate();
      }
    });
    capture(child.stdout, (chunk) => { stdout += chunk; });
    capture(child.stderr, (chunk) => { stderr += chunk; });
    child.on("error", (error) => {
      stderr += error.message;
    });
    child.on("close", (code, signal) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (forceKillTimer) clearTimeout(forceKillTimer);
      resolve({
        stdout,
        stderr,
        code: Number.isInteger(code) ? code : null,
        signal,
        timedOut,
      });
    });
  });
}

function signalProcessTree(child, signal) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    const force = signal === "SIGKILL" ? ["/F"] : [];
    spawn("taskkill", ["/PID", String(child.pid), "/T", ...force], { stdio: "ignore" });
    return;
  }
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

function signalDirectChild(child, signal) {
  try {
    child.kill(signal);
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

export async function runStrict(command, args, options) {
  const result = await execFileAsync(command, args, {
    ...options,
    encoding: "utf8",
    maxBuffer: MAX_OUTPUT_BYTES,
  });
  return { stdout: String(result.stdout), stderr: String(result.stderr) };
}

export async function withPackageBuildLock(packageRoot, task) {
  const key = createHash("sha256").update(path.resolve(packageRoot)).digest("hex").slice(0, 16);
  const lock = path.join(os.tmpdir(), `base-probe-build-${key}.lock`);
  const deadline = Date.now() + 120_000;
  while (true) {
    try {
      await fs.mkdir(lock);
      await fs.writeFile(path.join(lock, "owner.json"), JSON.stringify({ pid: process.pid }), "utf8");
      break;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      const owner = await readLockOwner(lock);
      if ((owner && !processIsAlive(owner.pid)) || (!owner && await lockIsAbandoned(lock))) {
        await fs.rm(lock, { recursive: true, force: true });
        continue;
      }
      if (Date.now() >= deadline) {
        throw new Error(`Délai dépassé en attendant la préparation du paquet ${packageRoot}.`);
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  try {
    return await task();
  } finally {
    await fs.rm(lock, { recursive: true, force: true });
  }
}

export async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function pack(cwd, destination) {
  const { stdout } = await runStrict(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", destination],
    { cwd },
  );
  const [description] = JSON.parse(stdout);
  if (!description?.filename) throw new Error(`npm pack n'a produit aucune archive dans ${cwd}.`);
  const file = path.join(destination, description.filename);
  return { file, sha256: await sha256(file) };
}

async function readLockOwner(lock) {
  try {
    const owner = JSON.parse(await fs.readFile(path.join(lock, "owner.json"), "utf8"));
    return Number.isInteger(owner?.pid) && owner.pid > 0 ? owner : null;
  } catch {
    return null;
  }
}

async function lockIsAbandoned(lock) {
  try {
    return Date.now() - (await fs.stat(lock)).mtimeMs > 5_000;
  } catch {
    return false;
  }
}

function processIsAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

function binary(app, name) {
  return path.join(app, "node_modules", ".bin", process.platform === "win32" ? `${name}.cmd` : name);
}

async function sha256(file) {
  return createHash("sha256").update(await fs.readFile(file)).digest("hex");
}

async function writeSetupFiles(root, files) {
  for (const [relative, content] of Object.entries(files)) {
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${path.resolve(root)}${path.sep}`)) {
      throw new Error(`Fichier de setup hors racine: ${relative}.`);
    }
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, content, { flag: "wx" });
  }
}
