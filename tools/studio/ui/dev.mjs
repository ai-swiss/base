#!/usr/bin/env node
// One command to run the whole app in development: starts the Studio API server (tools/studio/server.mjs)
// against a BASE root, and the Vite dev server (which proxies /api to it). Ctrl-C stops both.
//
//   npm run dev               # root defaults to exemples/assistant-devis
//   npm run dev -- ../../..    # or pass a BASE root (relative to the repo root)
//   BASE_ROOT=exemples/assistant-rh npm run dev

import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const uiDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(uiDir, "..", "..", "..");
// Default to the examples workspace (exemples/base.workspace.json): "open the Studio" should show ALL
// the example assistants at once, which is what someone asking BASE to open it wants. `base studio`
// always passes an explicit `--root`, so this default only applies to a bare `npm run studio` from the
// repo. To dogfood the framework itself, pass it explicitly: `npm run studio -- .`. Override with an
// arg or BASE_ROOT.
const root = process.argv[2] || process.env.BASE_ROOT || "exemples";
const apiPort = process.env.STUDIO_API_PORT || "4319";
const uiPort = process.env.STUDIO_UI_PORT || "5174";

// Friendly preflight #1 — Node version. Without it, an old Node dies in Vite with a stack
// nobody can read; the fix must be printed, not guessed.
const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < 18) {
  console.error(
    `BASE Studio demande Node 18 ou plus (vous avez ${process.versions.node}).\n` +
    `  Installez la version LTS depuis https://nodejs.org puis relancez.`,
  );
  process.exit(1);
}

// Friendly preflight #2 — if the API port is already bound, Studio is almost certainly already
// running. Say so plainly and point at the existing instance, instead of spawning two servers and
// letting the API crash with a cryptic EADDRINUSE stack.
function portInUse(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", (error) => resolve(error.code === "EADDRINUSE"));
    tester.once("listening", () => tester.close(() => resolve(false)));
    tester.listen(Number(port), host);
  });
}

if (await portInUse(apiPort)) {
  console.error(
    `BASE Studio tourne deja (port ${apiPort} occupe).\n` +
    `  Ouvrez http://127.0.0.1:${uiPort} dans votre navigateur,\n` +
    `  ou arretez l'instance existante avant de relancer.`,
  );
  process.exit(1);
}

const procs = [
  spawn("node", ["tools/studio/server.mjs", "--root", root, "--port", apiPort], { cwd: repoRoot, stdio: "inherit" }),
  spawn(path.join(uiDir, "node_modules", ".bin", "vite"), [], { cwd: uiDir, stdio: "inherit", shell: process.platform === "win32" }),
];

// Co-launch the documentation site (the separate Astro app) so the Studio "Documentation" link
// resolves the moment Studio is open. Best-effort and ISOLATED: if it cannot start (docs deps not
// installed, or the port is busy because it is already running), Studio carries on. We stop it on
// exit, but its own exit never stops Studio. Set STUDIO_NO_DOCS=1 to skip.
const docsPort = "4321";
let docsProc = null;
if (process.env.STUDIO_NO_DOCS !== "1" && !(await portInUse(docsPort))) {
  docsProc = spawn("node", ["tools/base.mjs", "docs", "serve"], { cwd: repoRoot, stdio: "inherit" });
  docsProc.on("error", () => {}); // a missing docs build must never crash Studio
}

let stopping = false;
const stop = (code = 0) => {
  if (stopping) return;
  stopping = true;
  for (const p of procs) p.kill("SIGTERM");
  if (docsProc) docsProc.kill("SIGTERM");
  process.exit(code);
};
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
for (const p of procs) p.on("exit", (code) => stop(code ?? 0));

const url = `http://127.0.0.1:${uiPort}`;
const docsNote = docsProc ? `, Documentation : http://127.0.0.1:${docsPort}` : "";
console.log(`BASE Studio — root : ${root}\n\n  ➜  Ouvrez ${url}\n     (API : http://127.0.0.1:${apiPort}${docsNote})`);

// Best-effort browser open: the printed URL stays the truth — a machine without an opener
// (headless, CI) just ignores this, silently and on purpose.
if (process.env.STUDIO_NO_OPEN !== "1") {
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  spawn(opener, [url], { stdio: "ignore", shell: process.platform === "win32" }).on("error", () => {});
}
