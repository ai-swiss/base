<!-- fr-synced: a08ce1fa80da94cb5616f0d709ad7680258ec022 -->
# Choosing between scan, local index, and external store based on your scale

Sizing BASE's routing well means avoiding two pitfalls: paying for infrastructure you don't need, or
hitting a wall of slowness as the corpus grows. This page gives you a quantified decision rule, from
small projects to large corpora, so you know when an in-memory scan is enough, when a local index
becomes useful, and when an external store is justified.

## When an in-memory scan is enough

By default, `routeRequest` reads the resources and scores them in memory. This approach is simple,
with no state and no artifact to regenerate, and it is **enough** for hundreds, even a few thousand
resources. Most projects need nothing more. Don't add complexity before you observe a cost.

## When a local index helps

When the corpus grows (tens of thousands of resources) and a per-request scan becomes uncomfortable,
derive a local index with `@ai-swiss/base-index-local`:

```bash
base-index-local build  <projet>
base-index-local route  <projet> "préparer un devis client"
base-index-local bench  --sizes 100,1000,10000,50000
```

The index is a **local projection**: it avoids re-reading the whole filesystem and can serve a
postings list for lexical search. Measured on a laptop (see [Benchmarks](../guides/benchmarks-echelle.md)):
an index of **52,500 documents** builds in ~0.4 s and searches when warm in **under 1 ms**.

Indexed routing returns the same statuses as the default in-memory routing. To preserve this parity,
`routeWithIndex` scores all the routables stored in the index with the same injected Ranker and the
same injected Router. Teams that know their routing is lexically compatible can enable postings
prefiltering (`candidateMode: "lexical"`) as an explicit optimization.

## When an external store becomes legitimate

Beyond that (millions of documents, distributed search, multi-tenant), a dedicated engine
(OpenSearch, a vector store, an internal gateway) becomes justified. BASE neither requires it nor
bundles it in the core: it exposes the same shape (candidates → decision) so you can plug the engine
of your choice in behind it.

## Why the index stays a projection

The index is **never** a source of truth. It is rebuilt deterministically from: the inventory,
derived routing signals, frontmatter, titles/descriptions, `route_text`, and optional embeddings.
Consequences:

- **Deletable.** Erase `.ai/index/local.json`: you lose nothing, regenerate it.
- **Deterministic.** Two builds of the same files are identical: a CI gate can check its freshness
  (`git diff --exit-code`). *Runtime embeddings are not covered by this gate: the index stays
  deterministic for derived signals, not for computed semantic scores.*
- **No manual catalog.** No hand-maintained table can drift from the files.

## In one sentence

BASE knows when a scan is enough, when an index helps, and how much each option costs. Reproducible
benchmarks measure it: that beats an assertion.
