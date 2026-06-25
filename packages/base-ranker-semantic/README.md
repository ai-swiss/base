# @ai-swiss/base-ranker-semantic

Official BASE semantic ranker adapter — **production-grade, zero npm dependencies.**

It gives BASE real semantic routing without adding a model, cloud SDK or vector database to the core
package. The adapter is intentionally small: it accepts any embedding function — OpenAI-compatible
HTTP endpoints, local models, enterprise gateways, or precomputed vectors — and wraps it with the
robustness a production path needs: timeouts, cancellation, bounded retries, typed errors, and an explicit
batching wrapper for high-concurrency callers.

## Design

- BASE core stays zero-dependency and portable; this is the official real-embeddings path for harder
  or larger routing corpora.
- The Ranker only raises **relevance**. The Router still makes the structural **decision** and can
  abstain. Every semantic boost is explainable through a `semantic:embedding:<sim>` reason.
- **No implicit provider.** You choose where text is embedded. Ollama is one local option, not a
  requirement; there is deliberately no "default/best provider" helper.
- **No business content leaves without explicit configuration.** See [`SECURITY.md`](./SECURITY.md).

## Usage

BASE routing works without this package. Install and wire it when you want real embeddings. Use
`base.config.mjs` (executable config) since a ranker needs code.

```js
// base.config.mjs — OpenAI-compatible endpoint (OpenAI, Azure-style, internal gateway)
import { createOpenAICompatibleEmbedder, createSemanticRanker } from "@ai-swiss/base-ranker-semantic";

const embed = createOpenAICompatibleEmbedder({
  model: "text-embedding-3-small",       // required
  // apiKey: process.env.OPENAI_API_KEY,  // default
  // baseUrl: "https://gateway.internal/v1",
  timeoutMs: 10_000,
  retries: 2,
});

export default { rankers: [createSemanticRanker({ embed, minSimilarity: 0.25 })] };
```

```js
// base.config.mjs — simple local path (everything stays on localhost)
import { createOllamaEmbedder, createSemanticRanker } from "@ai-swiss/base-ranker-semantic";

export default { rankers: [createSemanticRanker({ embed: createOllamaEmbedder() })] };
```

```js
// base.config.mjs — any provider, or precomputed vectors from an index (no resource text sent live)
import { createSemanticRanker } from "@ai-swiss/base-ranker-semantic";
import { vectorFor } from "@ai-swiss/base-index-local";

export default {
  rankers: [createSemanticRanker({
    embed: async (textOrTexts, ctx) => myModel.embed(textOrTexts, { signal: ctx?.signal }),
    getResourceEmbedding: (resource) => vectorFor(index, resource), // optional, precomputed
  })],
};
```

## Robustness (what "production-grade" means here)

- **Timeouts** — every provider call takes `timeoutMs` (default 10 s).
- **Cancellation** — pass `ctx.signal` (an `AbortSignal`); a timeout or caller abort is typed
  distinctly (`semantic.timeout` vs `semantic.abort`).
- **Bounded retries** — transient failures only (network, 5xx, 429, timeout), exponential backoff
  with full jitter, honouring `Retry-After`. Config/auth/response/dimension errors are **never**
  retried.
- **Batching + bounded concurrency** — `createBatchingEmbedder(embed, { maxBatchSize, maxConcurrency })`
  coalesces concurrent single-text calls into a few bounded, batched requests.
- **Typed errors** — branch on `.code`: `semantic.config | timeout | abort | response | auth |
  rate_limit | network | dimension`.
- **Vector validation** — empty/non-numeric vectors are rejected; a query/resource dimension mismatch
  fails loud by default (`onDimensionMismatch: "throw"`) so a stale index is caught, not hidden.
- **Configurable cache** — an in-memory `Map` by default; pass any `{ has, get, set }` for a
  persistent or org-wide cache. Concurrent calls for the same text share one request, and rejected
  provider calls are not retained.
- **Light observability** — `onMetric({ provider, batchSize, attempt, latencyMs, cacheHit,
  similarity, dimension })`. Operational signals only — no text, no vectors.

## Exports

| Export | Purpose |
|---|---|
| `createSemanticRanker(options)` | async BASE Ranker backed by embeddings |
| `createOpenAICompatibleEmbedder(options)` | OpenAI / Azure-style / internal-gateway provider |
| `createOllamaEmbedder(options)` | optional simple local provider |
| `createBatchingEmbedder(embed, options)` | coalescing micro-batcher, bounded concurrency |
| `cosineSimilarity(a, b)`, `textForResource(resource)` | pure helpers |
| `SemanticError` + 8 subclasses | typed errors (branch on `.code`) |

No runtime npm dependencies. Node ≥ 18 (global `fetch`, `AbortController`).
