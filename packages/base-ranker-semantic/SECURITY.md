# Security & data handling — `@ai-swiss/base-ranker-semantic`

This adapter sends text to an embedding provider **only when you configure one**. BASE's core never
calls a provider; nothing leaves your machine until you pass an `embed` function (or a provider built
by `createOpenAICompatibleEmbedder` / `createOllamaEmbedder`) into `createSemanticRanker`.

## What text is sent

For a routing/discovery request, two kinds of string can be embedded:

1. **The request** (the user's query).
2. **Each routable resource's text** — by default `route_text` + `title` + `description` + `keywords`
   + `body`, joined (`textForResource`). Override `textOf` to send less (for example, only
   `route_text` + `title`), or precompute resource vectors out of band so resource **content never
   transits at query time**:

   ```js
   import { vectorFor } from "@ai-swiss/base-index-local";

   createSemanticRanker({
     embed,                                           // embeds the query only
     getResourceEmbedding: (r) => vectorFor(index, r), // precomputed; no resource text sent
   });
   ```

## Reducing exposure

- **Precompute** resource embeddings in a controlled environment (e.g. `@ai-swiss/base-index-local`)
  and serve them via `getResourceEmbedding`. The query is then the only text sent live.
- **Trim `textOf`** to the minimum signal that routes well — usually `route_text` is enough.
- **Stay local**: `createOllamaEmbedder` keeps everything on `localhost`. No cloud, no egress.
- **Use an internal gateway**: point `createOpenAICompatibleEmbedder({ baseUrl })` at a reverse proxy
  you control; add headers/mTLS there. Business text never reaches a public endpoint.

## Credentials

- `createOpenAICompatibleEmbedder` reads `OPENAI_API_KEY` from the environment by default, or takes an
  explicit `apiKey`. Keep keys in a secret manager or env, never in the repo.
- Auth failures surface as a typed `EmbeddingAuthError` (`code: "semantic.auth"`) and are **never
  retried**, so a bad credential fails fast instead of hammering the provider.

## Logging without business content

The `onMetric` hook reports `{ provider, batchSize, attempt, latencyMs, cacheHit, similarity,
dimension }` — operational signals only, **no text and no vectors**. Log those freely; never log the
embedded strings or the raw query if your corpus is sensitive.

## Cancellation & limits

Every provider request honours a per-call `timeoutMs` and a caller `AbortSignal` (via `ctx.signal`),
so a long or runaway embedding call can be bounded and cancelled from the CLI, MCP, or a server.
