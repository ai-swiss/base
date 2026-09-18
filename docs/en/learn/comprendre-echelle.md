<!-- fr-synced: 7ffe0c8a4b496b8115160011eab2e2914d207053 -->
# Choosing between scan, local index, and external store based on scale

Start with the simplest mechanism, measure it on your corpus, and change only when measurements reveal a limit. The orders of magnitude below guide an experiment; they do not promise universal speed.

## In-memory scan

By default, `routeRequest` reads resources and scores them in memory. This option avoids state and generated artifacts. It is suitable while its latency, memory use, and throughput remain acceptable in your environment.

## Local index

A local index becomes useful when repeated scans cost too much. The `@ai-swiss/base-index-local` package can build the index, route, and measure:

```bash
base-index-local build <project>
base-index-local route <project> "prepare a client quote"
base-index-local bench --sizes 100,1000,10000,50000
```

The [reproducible benchmarks](../guides/benchmarks-echelle.md) use a synthetic corpus and synthetic queries. They isolate technical cost on specified hardware and software, but measure neither routing quality nor the latency of your real queries. Measure those separately on a representative sample of your corpus.

The index remains a **projection**, as defined in the [glossary](../reference/glossaire.md): it is rebuilt from sources. By default, `routeWithIndex` uses `candidateMode: "all"` and re-scores every routable resource with the same ranker and router as the in-memory path; this is the configuration intended to preserve parity of status, agent, and process. The `"lexical"` mode re-scores only candidates found in the postings. It preserves that parity with a compatible lexical ranker, but may discard a result that a semantic or hybrid ranker would have found.

## External engine

A dedicated engine may be justified for a distributed corpus, multiple tenants, availability constraints, or a volume the local index no longer serves adequately. BASE requires none: the integration keeps the candidates-then-decision shape, while operations, permissions, egress, and tests belong to the chosen setup.

## Keep the index derived

- Deleting `.ai/index/local.json` deletes no source.
- Two builds from the same derived signals should produce the same index.
- Runtime embeddings do not make their semantic scores deterministic.
- A hand-maintained catalog must not become a second source of truth.

## Next action

First run the synthetic benchmark at three sizes close to your corpus, then replay a sample of real queries and separately record latency, expected route, and abstentions. Change strategy only if an explicit business threshold is exceeded.
