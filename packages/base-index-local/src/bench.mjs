// Reproducible, modest benchmarks. The point is not "BASE is always fastest" — it is to show when an
// in-memory scan suffices, when the index helps, and what each costs. Build is cold; search is run
// warm (after one priming query that caches the vocabulary) and cold (fresh index per query).

import { buildIndex } from "./build.mjs";
import { searchIndex } from "./search.mjs";
import { minimalDeriveSignals, syntheticResources } from "./synthetic.mjs";

const SIZES = [100, 1000, 10000];

// `clock` is injected (default performance.now) so tests can drive it deterministically.
export async function runBenchmark(options = {}) {
  const { sizes = SIZES, deriveSignals = minimalDeriveSignals, clock = defaultClock, queriesPerSize = 20 } = options;
  const rows = [];

  for (const size of sizes) {
    const { agentCount, processesPerAgent } = shape(size);
    const resources = syntheticResources(agentCount, processesPerAgent);

    const buildStart = clock();
    const index = await buildIndex(resources, { deriveSignals });
    const buildMs = clock() - buildStart;

    // Cold: a fresh vocabulary scan each query. Warm: vocabulary cached on the index object.
    const coldMs = median(repeat(queriesPerSize, (i) => time(clock, () => searchIndex(freshView(index), `t0x${i % processesPerAgent}`))));
    searchIndex(index, "t0x0"); // prime the warm cache
    const warmMs = median(repeat(queriesPerSize, (i) => time(clock, () => searchIndex(index, `t0x${i % processesPerAgent}`))));

    rows.push({
      documents: index.document_count,
      agents: agentCount,
      build_ms: round(buildMs),
      search_cold_ms: round(coldMs),
      search_warm_ms: round(warmMs),
    });
  }
  return rows;
}

export function formatBenchmark(rows) {
  const header = "documents   agents   build_ms   search_cold_ms   search_warm_ms";
  const lines = rows.map((r) =>
    `${pad(r.documents, 9)}   ${pad(r.agents, 6)}   ${pad(r.build_ms, 8)}   ${pad(r.search_cold_ms, 14)}   ${pad(r.search_warm_ms, 14)}`,
  );
  return [header, ...lines].join("\n");
}

function shape(size) {
  const processesPerAgent = 20;
  return { agentCount: Math.max(1, Math.round(size / processesPerAgent)), processesPerAgent };
}

// A shallow copy without the cached vocabulary, to measure a cold query honestly.
function freshView(index) {
  return { ...index };
}

function time(clock, fn) {
  const start = clock();
  fn();
  return clock() - start;
}

function repeat(n, fn) {
  return Array.from({ length: n }, (_, i) => fn(i));
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function round(ms) {
  return Math.round(ms * 100) / 100;
}

function pad(value, width) {
  return String(value).padStart(width);
}

function defaultClock() {
  return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
}
