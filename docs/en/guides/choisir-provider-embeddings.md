<!-- fr-synced: c42ce8744fdd3b36492f6e44f8bcd495787032a2 -->
# Choosing your embeddings provider

This page helps anyone putting BASE into production decide where their embeddings come from, according to their privacy, cost, and governance constraints. Embedding text is an explicit choice: you pass an `embed` to `createSemanticRanker`, and BASE imposes **none** on your behalf.

## The options

| Option | How | When |
|---|---|---|
| **Local (Ollama)** | `createOllamaEmbedder()`, everything stays on `localhost` | maximum privacy, offline, demos, individual workstations |
| **Cloud (OpenAI-like)** | `createOpenAICompatibleEmbedder({ model })` | high quality, zero infrastructure to manage, data may leave |
| **Enterprise gateway** | `createOpenAICompatibleEmbedder({ baseUrl })` to an internal proxy | large organization: auth, logging, DLP at the proxy level |
| **Internal model** | any `embed: async (t) => myModel.embed(t)` | in-house ML stack, sovereignty, specialized model |
| **Pre-computed (index)** | `getResourceEmbedding` served by `vectorFor(index, resource)` from `@ai-swiss/base-index-local` | large corpus; resource text does not travel at query time |

BASE deliberately provides **no** "best provider" helper: hard-coding a technical preference into the core would amount to choosing on your behalf.

## The criteria

- **Privacy.** Does the text leave your perimeter? Local and internal gateway keep it in; public cloud sends it out. See [Security & data](../trust/securite-donnees-routage.md).
- **Cost.** Cloud = cost per token; local = hardware cost; pre-computed = cost amortized at build time.
- **Latency.** Local depends on your machine; cloud on the network link; pre-computed is near zero at query time (only the query is embedded).
- **Quality.** Large cloud models often lead; a good local model is frequently enough for routing (the `route_text` is short and discriminating).
- **Governance.** A gateway gives a single point for auth, redacted logging, retention, and compliance, without touching the BASE core.

## Robustness, whatever the choice

All the package's providers inherit the same guarantees: `timeoutMs`, `AbortSignal` (`ctx.signal`), bounded retries on transient errors only, backoff with jitter, typed errors (`.code`). A bad key fails fast (`semantic.auth`, never retried); a network outage is retried (`semantic.network`).

## Reduce what is sent

- **Pre-compute** the resource vectors via an index: only the query is sent live.
- **Limit `textOf`** to strictly what is useful (often `route_text` is enough).
- **Go through an internal proxy** to avoid directly exposing a public endpoint.

Full detail: [Security & data of routing](../trust/securite-donnees-routage.md).
