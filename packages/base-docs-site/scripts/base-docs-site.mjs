#!/usr/bin/env node
// The adapter's ONE entry point: `base-docs-site <build|dev|preview> [astro args...]`.
//
// It exists so the BASE CLI can launch the site with `process.execPath` alone — no npm on the PATH,
// no `npm --prefix` run inside a node_modules directory, no lifecycle scripts — and so a launch is
// byte for byte the same whether it comes from the CLI or from `npm run build` in a checkout. The
// per-command Astro flags live HERE, the one place both callers go through.
//
// `build` also drops Astro's ~829 per-route lines (`  ├─ /path (+Nms)`) that drown the real stages.
// Astro 6 logs every route AND every stage at the same `info` level, so no `--silent`/`--level` flag
// can keep one without the other; the route lines carry a stable tree glyph (├─), so the cleanest
// seam WE own — our invocation of Astro — is to filter them on the way out. No Astro internals are
// touched: only stdout of our own subprocess. Stage lines (Syncing content, generating static
// routes, Building search index, N page(s) built, Complete!) pass through.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const ROUTE_GLYPH = "├─"; // ├─ — Astro's per-route build line
const TIMING_ONLY = /^\s*\(\+\d+m?s\)\s*$/; // a per-route render time that wrapped onto its own line

// `dev` and `preview` bind the loopback interface only: documentation served from a laptop is for
// that laptop, never for whichever network it happens to sit on.
const COMMANDS = {
  build: { args: ["build"], quiet: true },
  dev: { args: ["dev", "--host", "127.0.0.1"], quiet: false },
  preview: { args: ["preview", "--host", "127.0.0.1"], quiet: false },
};

/** A route line, or a stray per-route timing line, is noise; everything else (the real stages) passes. */
export function isRouteNoise(line) {
  return line.includes(ROUTE_GLYPH) || TIMING_ONLY.test(line);
}

/** Drop the route-noise lines from a chunk of build output; pure, so the filter is testable line by line. */
export function filterAstroBuildOutput(text) {
  return text
    .split("\n")
    .filter((line) => !isRouteNoise(line))
    .join("\n");
}

function astroBin() {
  const require = createRequire(import.meta.url);
  // astro's `exports` map hides the CLI subpath, so resolve it off the package root (which IS exported).
  return path.join(path.dirname(require.resolve("astro/package.json")), "bin/astro.mjs");
}

function run(name, extraArgs) {
  const command = COMMANDS[name];
  if (!command) {
    process.stderr.write(`Usage: base-docs-site <${Object.keys(COMMANDS).join("|")}> [astro args...]\n`);
    process.exitCode = 2;
    return;
  }
  const child = spawn(process.execPath, [astroBin(), ...command.args, ...extraArgs], {
    stdio: ["inherit", command.quiet ? "pipe" : "inherit", "inherit"],
  });
  const onInterrupt = () => child.kill("SIGINT");
  const onTerminate = () => child.kill("SIGTERM");
  const cleanup = () => {
    process.off("SIGINT", onInterrupt);
    process.off("SIGTERM", onTerminate);
  };
  process.once("SIGINT", onInterrupt);
  process.once("SIGTERM", onTerminate);

  if (child.stdout) {
    let pending = "";
    child.stdout.on("data", (chunk) => {
      const lines = (pending + chunk).split("\n");
      pending = lines.pop() ?? ""; // the last element is the incomplete tail
      for (const line of lines) if (!isRouteNoise(line)) process.stdout.write(line + "\n");
    });
    child.stdout.on("end", () => {
      if (pending && !isRouteNoise(pending)) process.stdout.write(pending);
    });
  }
  child.on("error", (error) => {
    cleanup();
    process.stderr.write(String(error?.message ?? error) + "\n");
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    cleanup();
    process.exitCode = signal ? 1 : (code ?? 0);
  });
}

// Run when invoked as a program; stay inert when imported for the pure filter above.
if (process.argv[1] && path.basename(process.argv[1]) === "base-docs-site.mjs") {
  run(process.argv[2], process.argv.slice(3));
}
