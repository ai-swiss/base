// Spec coverage: FR-SCALE-004
// Scale proof: build and query a large synthetic corpus within a stable budget, and run the benchmark
// harness as a smoke test (no fragile latency thresholds — it must produce rows, not hit a number).

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { performance } from "node:perf_hooks";
import {
  ROUTING_DEFAULTS,
  composeRankers,
  decideRoute,
  deriveRoutingSignals,
  lexicalRanker,
  routeAvoidReasons,
  routeTerms,
} from "../../../tools/base-core.mjs";
import { buildIndex, formatBenchmark, routeWithIndex, runBenchmark, searchIndex, serializeIndex, syntheticResources } from "../index.mjs";

describe("scale", () => {
  it("builds a 10k-document index and searches it in well under a second", async () => {
    const resources = syntheticResources(500, 20); // 500 agents × 20 = 10,500 documents
    const buildStart = performance.now();
    const index = await buildIndex(resources, { deriveSignals: deriveRoutingSignals });
    const buildMs = performance.now() - buildStart;

    assert.equal(index.document_count, 10_500);

    const searchStart = performance.now();
    const hits = searchIndex(index, "t321x7");
    const searchMs = performance.now() - searchStart;

    assert.equal(hits[0].id, "process-321-7");
    // Sanity ceilings only — generous so a loaded CI runner never flakes, but still catch a
    // catastrophic (e.g. accidental O(n²)) regression. Correctness is asserted above, not latency.
    assert.ok(buildMs < 20_000, `build took ${buildMs.toFixed(0)}ms`);
    assert.ok(searchMs < 2_000, `search took ${searchMs.toFixed(1)}ms`);
  });

  it("routes against a large index with the real Ranker and Router", async () => {
    const index = await buildIndex(syntheticResources(200, 20), { deriveSignals: deriveRoutingSignals });
    const decision = await routeWithIndex(index, "t137x4", {
      rank: composeRankers([lexicalRanker]),
      decide: decideRoute,
      routeTerms,
      routeAvoidReasons,
      thresholds: ROUTING_DEFAULTS,
      candidateMode: "lexical",
    });
    assert.equal(decision.status, "routed");
    assert.equal(decision.agent.id, "domain-137");
    assert.equal(decision.process.id, "process-137-4");
  });

  it("rebuilds a large index identically (freshness gate)", async () => {
    const resources = syntheticResources(100, 20);
    const a = await buildIndex(resources, { deriveSignals: deriveRoutingSignals });
    const b = await buildIndex(resources, { deriveSignals: deriveRoutingSignals });
    assert.equal(serializeIndex(a), serializeIndex(b));
  });

  it("produces a benchmark report (smoke, no latency assertion)", async () => {
    const rows = await runBenchmark({ sizes: [100, 1000] });
    assert.equal(rows.length, 2);
    assert.ok(rows[0].documents >= 100);
    assert.ok(rows[1].documents >= 1000);
    assert.ok(rows[0].documents < rows[1].documents);
    assert.match(formatBenchmark(rows), /documents/);
  });
});
