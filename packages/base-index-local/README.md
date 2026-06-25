# @ai-swiss/base-index-local

Official **optional** local index for BASE — a derived, deletable projection that scales routing and
discovery to large corpora **without a database**, and **without becoming a dependency of the BASE
core**.

## When (and when not) to use it

- **Don't** reach for it first. BASE's in-memory routing is honest and fast for hundreds of
  resources — even a few thousand. Most projects never need an index.
- **Do** add it when a growing corpus makes a full scan per request uncomfortable, or when you want to
  serve precomputed embeddings so resource text never transits at query time.

The index is a **projection, never a source of truth**. It is reconstructed deterministically from the
inventory + derived routing signals; delete the file and rebuild — nothing is lost. It can later be
replaced by OpenSearch, a vector DB, or an internal gateway behind the same shape.

## Why routing stays correct

By default, `routeWithIndex` scores every routable document stored in the index. This preserves parity
with in-memory routing even when a custom semantic ranker can match without a lexical hit. If you know
your route rankers are lexical/postings-compatible, you can opt into `candidateMode: "lexical"` to score
only documents sharing a query term.

Scoring and the decision are BASE's own, injected:

```js
import { inventoryResources, resolveConfig, deriveRoutingSignals,
         composeRankers, lexicalRanker, decideRoute, routeTerms, routeAvoidReasons,
         ROUTING_DEFAULTS } from "@ai-swiss/base";
import { buildIndex, routeWithIndex } from "@ai-swiss/base-index-local";

const resources = await inventoryResources(root);
const cfg = await resolveConfig(root);
const index = await buildIndex(resources, { deriveSignals: deriveRoutingSignals });

const decision = await routeWithIndex(index, "préparer un devis client", {
  rank: composeRankers([lexicalRanker, ...(cfg.rankers ?? [])]),
  decide: decideRoute,
  routeTerms,
  routeAvoidReasons,
  thresholds: { ...ROUTING_DEFAULTS, ...(cfg.routing ?? {}) },
  root,
});
```

Same closed candidate set, same Ranker and same Router ⇒ the **same status / agent / process /
reason_code** as the in-memory broker. This equivalence is a test (`tests/equivalence.test.mjs`), not a
claim. The lexical candidate mode is an explicit speed/recall trade-off for teams that choose it.

## CLI

```bash
base-index-local build  <root> [--out .ai/index/local.json]
base-index-local search <root> "<query>" [--limit 10]
base-index-local route  <root> "<request>"
base-index-local bench  [--sizes 100,1000,10000,50000]
```

`.ai/index/local.json` is a derived artifact — git-ignore it and regenerate on demand.

## Benchmarks (reproducible, modest)

`base-index-local bench` on a laptop (Node 24), synthetic agents/processes, median of 20 queries:

| documents | build | search (cold) | search (warm) |
|---:|---:|---:|---:|
| 105 | 9 ms | 0.01 ms | 0 ms |
| 1 050 | 10 ms | 0.03 ms | 0.01 ms |
| 10 500 | 83 ms | 0.65 ms | 0.13 ms |
| 52 500 | 394 ms | 5.3 ms | 0.9 ms |

The point is not "always fastest" — it is to show *when the scan suffices, when the index helps, and
what it costs*. Numbers vary by machine; re-run `bench` to measure yours.

## Embeddings (optional)

Pass an `embed` function to `buildIndex` to store a precomputed vector per document (use
`@ai-swiss/base-ranker-semantic`'s providers and `createBatchingEmbedder`). A semantic Ranker can then
score against those vectors with `vectorFor(index, resource)`, with no resource text leaving at query
time. The lexical index stays
deterministic; embeddings are runtime and machine/model-dependent (not part of the freshness gate).

## Exports

`buildIndex`, `searchIndex`, `candidateDocIndices`, `routeWithIndex`, `saveIndex`, `loadIndex`,
`serializeIndex`, `vectorFor`, `runBenchmark`, `formatBenchmark`, `syntheticResources`, `tokenize`,
`INDEX_SCHEMA`, `FIELD_WEIGHTS`.

No runtime npm dependencies. `@ai-swiss/base` is a peer for the routing/build wiring (the index core
and benchmarks are self-contained). Node ≥ 18.
