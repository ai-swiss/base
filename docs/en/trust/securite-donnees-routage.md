<!-- fr-synced: 741fc2e17bcbd9835481b0a7151945e47adf5806 -->
# Keeping your data under control when routing uses a provider

When routing relies on a remote provider, text may leave your machine. Two scopes must be distinguished: the shipped BASE Way 2 and direct integration of the `@ai-swiss/base-ranker-semantic` package.

## Shipped Way 2

Way 2 is enabled with `routing.embedding_model` and `refiner_model`.

- During precomputation, `base build routing-embeddings` sends only `route_text` to the configured embedding model. A `confidential` resource is skipped.
- At query time, the embedding model receives the user's request. The refiner receives that request and the candidates' `route_text` / `avoid_text`, never their bodies.
- The strategy gate applies regardless of caller, including from `base route`. If the configured models are remote, a `confidential` process never reaches the refiner; for a `local-only` root, none of these remote calls occurs and the deterministic floor answers.
- This Way 2 strategy gate does not cover a direct read, `base open` without an egress context, or copy-paste into an AI tool.

## Direct integration of the semantic package

### Nothing is sent without explicit configuration

The package does not call a provider until you supply `embed`, directly or through `createOpenAICompatibleEmbedder` / `createOllamaEmbedder`. The `semanticHybrid` path with no external embedder runs locally.

### Which strings are sent

Once a provider is configured, two kinds of text can go out to it:

1. **The query**, that is, the user's request.
2. **The text of each routable resource**: by default `route_text` + `title` + `description` +
   `keywords` + `body` (`textForResource`). This scope stays under your control.

### Reducing exposure

- **Pre-compute** the resource vectors in a controlled environment (`@ai-swiss/base-index-local`)
  and serve them through `getResourceEmbedding`. At query time, **only the query** goes out.
- **Trim `textOf`** to the bare minimum needed to route well; often `route_text` alone is enough:

  ```js
  createSemanticRanker({ embed, textOf: (r) => [r.route_text, r.title].filter(Boolean).join("\n") });
  ```

- **Stay local** with `createOllamaEmbedder()`: no text is transmitted to a remote provider.
- **Go through an internal gateway**: `createOpenAICompatibleEmbedder({ baseUrl })` pointed at a reverse
  proxy under your control (auth, mTLS, DLP). Tuned well, this proxy keeps domain text out of any public endpoint.

### Secrets

`createOpenAICompatibleEmbedder` reads `OPENAI_API_KEY` by default, or accepts an explicit `apiKey`.
Store keys in a secrets manager or environment variables, never in the repository. An auth failure is typed `EmbeddingAuthError` (`code: "semantic.auth"`) and is **never
retried**: a bad key fails fast instead of hammering the provider.

### Logging without domain content

The `onMetric` hook reports only operational signals (`{ provider, batchSize, attempt,
latencyMs, cacheHit, similarity, dimension }`): **no text, no vectors**. Log them
freely; never log the embedded strings or the raw query if the corpus is sensitive.

```js
createSemanticRanker({ embed, onMetric: (m) => logger.info({ embedding: m }) }); // safe: no content
```

### Cancellation and limits

Every provider call respects a `timeoutMs` and an `AbortSignal` (`ctx.signal`): an embedding that runs too long or
spins out of control can be bounded and canceled from the CLI, the MCP, or a server.

## Scope

Semantic routing improves **relevance**; it does not replace your organization's IAM, DLP, SIEM, or
retention policies. See also [Security and limits](securite-et-limites.md).
