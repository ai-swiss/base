#!/usr/bin/env node
// CLI for the official BASE local index. Build a derived index, search it, route against it, or run a
// reproducible benchmark. `build`/`search`/`route` need @ai-swiss/base (the index is a projection of
// BASE resources); `bench` is self-contained.

import * as path from "node:path";
import { buildIndex } from "../src/build.mjs";
import { searchIndex } from "../src/search.mjs";
import { routeWithIndex } from "../src/route.mjs";
import { loadIndex, saveIndex } from "../src/persist.mjs";
import { formatBenchmark, runBenchmark } from "../src/bench.mjs";

const DEFAULT_INDEX = path.join(".ai", "index", "local.json");

async function loadBase() {
  try {
    return await import("@ai-swiss/base");
  } catch {
    return import(new URL("../../../tools/base-core.mjs", import.meta.url).href); // in-repo fallback
  }
}

function parseArgs(args) {
  const options = {};
  const positionals = [];
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value.startsWith("--")) {
      const next = args[index + 1];
      options[value] = next && !next.startsWith("--") ? next : true;
      if (options[value] !== true) index++;
    } else {
      positionals.push(value);
    }
  }
  return { options, positionals };
}

async function cmdBuild(args) {
  const { options, positionals } = parseArgs(args);
  const root = path.resolve(positionals[0] ?? ".");
  const out = path.resolve(options["--out"] ?? path.join(root, DEFAULT_INDEX));
  const base = await loadBase();
  const resources = await base.inventoryResources(root);
  const index = await buildIndex(resources, { deriveSignals: base.deriveRoutingSignals });
  await import("node:fs/promises").then((fs) => fs.mkdir(path.dirname(out), { recursive: true }));
  await saveIndex(out, index);
  console.log(`Index écrit: ${path.relative(root, out)} — ${index.document_count} documents, ${Object.keys(index.postings).length} tokens.`);
}

async function cmdSearch(args) {
  const { options, positionals } = parseArgs(args);
  const root = path.resolve(positionals[0] ?? ".");
  const query = positionals.slice(1).join(" ");
  const index = await loadIndex(path.resolve(options["--index"] ?? path.join(root, DEFAULT_INDEX)));
  const results = searchIndex(index, query, { limit: Number(options["--limit"] ?? 10) });
  if (results.length === 0) console.log("Aucun résultat.");
  for (const r of results) console.log(`${String(r.score).padStart(4)}  ${r.type.padEnd(8)}  ${r.id}  (${r.path})`);
}

async function cmdRoute(args) {
  const { options, positionals } = parseArgs(args);
  const root = path.resolve(positionals[0] ?? ".");
  const request = positionals.slice(1).join(" ");
  const base = await loadBase();
  const index = await loadIndex(path.resolve(options["--index"] ?? path.join(root, DEFAULT_INDEX)));
  const cfg = await base.resolveConfig(root, { configPath: options["--config"] });
  const rank = base.composeRankers([base.lexicalRanker, ...(cfg.rankers ?? [])]);
  const decision = await routeWithIndex(index, request, {
    rank,
    decide: base.decideRoute,
    routeTerms: base.routeTerms,
    routeAvoidReasons: base.routeAvoidReasons,
    thresholds: { ...base.ROUTING_DEFAULTS, ...(cfg.routing ?? {}) },
  });
  console.log(JSON.stringify(decision, null, 2));
}

async function cmdBench(args) {
  const { options } = parseArgs(args);
  const sizes = (options["--sizes"] ?? "100,1000,10000").split(",").map((n) => Number(n.trim())).filter(Boolean);
  console.log(formatBenchmark(await runBenchmark({ sizes })));
}

const [command, ...args] = process.argv.slice(2);
const commands = { build: cmdBuild, search: cmdSearch, route: cmdRoute, bench: cmdBench };

try {
  const run = commands[command];
  if (!run) {
    console.log("Usage: base-index-local <build|search|route|bench> [...]\n"
      + "  build <root> [--out <path>]\n"
      + "  search <root> <query> [--index <path>] [--limit N]\n"
      + "  route <root> <request> [--index <path>] [--config <path>]\n"
      + "  bench [--sizes 100,1000,10000]");
    process.exit(command ? 1 : 0);
  }
  await run(args);
} catch (error) {
  console.error(String(error?.message ?? error));
  process.exit(1);
}
