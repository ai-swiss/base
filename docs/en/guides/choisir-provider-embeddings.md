<!-- fr-synced: dc112fbd839940f252d0267bf3d07b1b8630c1e5 -->
# Choosing your embeddings provider

This page helps anyone putting BASE into production decide where their embeddings come from, according to their privacy, cost, and governance constraints. Computing the embeddings of a text is a deliberate choice: you pass an `embed` to `createSemanticRanker`, and BASE forces **none** on you.

## The options

| Option | How | When |
|---|---|---|
| **Local (Ollama)** | `createOllamaEmbedder()`, everything stays on `localhost` | maximum privacy, offline, demos, individual workstations |
| **Cloud (OpenAI-like)** | `createOpenAICompatibleEmbedder({ model })` | high quality, no infrastructure to manage, but data may leave |
| **Enterprise gateway** | `createOpenAICompatibleEmbedder({ baseUrl })` to an internal proxy | large organization: auth, logging, DLP at the proxy level |
| **Internal model** | any `embed: async (t) => myModel.embed(t)` | in-house ML stack, sovereignty, specialized model |
| **Pre-computed (index)** | `getResourceEmbedding` served by `vectorFor(index, resource)` from `@ai-swiss/base-index-local` | large corpus; resource text never travels at query time |

BASE deliberately ships **no** "best provider" helper: etching a technical preference into the core would mean choosing in your place.

## The criteria

- **Privacy.** Does the text leave your perimeter? Local and an internal gateway keep it in; the public cloud ships it out. See [Security & data](../trust/securite-donnees-routage.md).
- **Cost.** The cloud is billed by the token; the local route, in hardware; the pre-computed one pays for itself as soon as you build.
- **Latency.** The local route depends on your machine, the cloud on the network link; the pre-computed one is near zero, since only the query is computed when the moment comes.
- **Quality.** Large cloud models often come out ahead; for routing, a good local model is usually enough, because the `route_text` is short and discriminating.
- **Governance.** A gateway offers a single point for authentication, redacted logging, retention, and compliance, without touching the BASE core.

## Robustness, whatever the choice

Every provider in the package inherits the same guarantees: `timeoutMs`, `AbortSignal` (`ctx.signal`), bounded retries on transient errors only, backoff with jitter, typed errors (`.code`). A bad key fails at once (`semantic.auth`, never retried); a network outage, by contrast, triggers fresh attempts (`semantic.network`).

## Reduce what gets sent

- **Pre-compute** the resource vectors with an index: only the query goes out live.
- **Limit `textOf`** to the strict minimum; very often, `route_text` is enough.
- **Route through** an internal proxy so you never expose a public endpoint directly.

For the full detail: [Security & data of routing](../trust/securite-donnees-routage.md).
