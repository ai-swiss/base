#!/usr/bin/env node
// BASE launcher — one per BASE root, created by 'base init' (this file: .ai/base.mjs).
// It exists so ONE copy-pasteable command works from any project, wherever the framework lives:
//   node .ai/base.mjs <commande>        (par ex. node .ai/base.mjs route "..." --root .)
// It finds the engine (tools/base.mjs) with no PATH entry, no alias, no global install, then
// forwards your arguments to it unchanged. Resolution order, first hit wins:
//   1. framework_dir in this root's base.config.json   (ecrit par 'base init')
//   2. an ancestor folder containing tools/base.mjs     (le depot BASE, ou un projet range dedans)
//   3. framework_dir in the user config                 (~/.config/base/config.json, ou $BASE_CONFIG_HOME)
// If none resolves, it says how to fix it and exits 1 — jamais une stack trace cryptique.

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function engineAt(dir) {
  if (!dir) return null;
  const target = path.join(dir, "tools", "base.mjs");
  return existsSync(target) ? target : null;
}

function frameworkDirFrom(configFile) {
  try {
    return JSON.parse(readFileSync(configFile, "utf8")).framework_dir || null;
  } catch {
    return null;
  }
}

function fromAncestors(start) {
  let dir = start;
  for (;;) {
    const hit = engineAt(dir);
    if (hit) return hit;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const home = process.env.BASE_CONFIG_HOME || os.homedir();
const engine =
  engineAt(frameworkDirFrom(path.join(root, "base.config.json"))) ||
  fromAncestors(root) ||
  engineAt(frameworkDirFrom(path.join(home, ".config", "base", "config.json")));

if (!engine) {
  console.error("BASE introuvable depuis ce dossier.");
  console.error("Lancez 'base init' ici, ou ajoutez 'framework_dir' (le chemin du depot BASE) a base.config.json.");
  process.exit(1);
}

const child = spawn(process.execPath, [engine, ...process.argv.slice(2)], { stdio: "inherit" });
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code === null ? 0 : code);
});
child.on("error", (error) => {
  console.error("Impossible de lancer BASE : " + error.message);
  process.exit(1);
});
