#!/usr/bin/env node
// Build wrapper: run `astro build`, but drop its ~829 per-route lines (`  ├─ /path (+Nms)`) that
// drown the real stages. Astro 6 logs every route AND every stage at the same `info` level, so no
// `--silent`/`--level` flag can keep one without the other; the route lines carry a stable tree
// glyph (├─), so the cleanest seam WE own — our invocation of Astro — is to filter them on the way
// out. No Astro internals are touched: only stdout of our own subprocess. Stage lines (Syncing
// content, generating static routes, Building search index, N page(s) built, Complete!) pass through.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const ROUTE_GLYPH = "├─"; // ├─ — Astro's per-route build line
const TIMING_ONLY = /^\s*\(\+\d+m?s\)\s*$/; // a per-route render time that wrapped onto its own line

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

function runBuild() {
  const require = createRequire(import.meta.url);
  // astro's `exports` map hides the CLI subpath, so resolve it off the package root (which IS exported).
  const astroBin = path.join(path.dirname(require.resolve("astro/package.json")), "bin/astro.mjs");
  const child = spawn(process.execPath, [astroBin, "build", ...process.argv.slice(2)], {
    stdio: ["inherit", "pipe", "inherit"],
  });

  let pending = "";
  child.stdout.on("data", (chunk) => {
    const lines = (pending + chunk).split("\n");
    pending = lines.pop() ?? ""; // the last element is the incomplete tail
    for (const line of lines) if (!isRouteNoise(line)) process.stdout.write(line + "\n");
  });
  child.stdout.on("end", () => {
    if (pending && !isRouteNoise(pending)) process.stdout.write(pending);
  });
  child.on("error", (error) => {
    process.stderr.write(String(error?.message ?? error) + "\n");
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    process.exitCode = signal ? 1 : (code ?? 0);
  });
}

if (process.argv[1] && process.argv[1].endsWith("scripts/build.mjs")) runBuild();
