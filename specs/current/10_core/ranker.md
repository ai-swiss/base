# 10 · Ranker (RANK)

> **For developers and maintainers.** Port `Ranker`. Implements FR-RANK-001..004, AD-CORE-001.
>
> Owns: FR-RANK-*

## Intent
"Explainable ranking" must be **honestly** explainable: every boost has a declared, inspectable source. The core ranker contains **no business vocabulary** — otherwise a "veterinary clinic" agent would inherit a devis bias — the core ranker's scoring and keyword derivation are neutral (FR-RANK-002). Business intent lives in adapters shipped *with the example that needs it*.

## Interface
```js
// tools/core/rankers.mjs   (imports node:* only)

// A Ranker: (resource, terms, ctx) => { score: number, reasons: string[] } | Promise<...>
//   terms   = normalized query tokens (NFD, diacritics stripped, lowercased, split on whitespace)
//   resource, ctx = architecture.md §2/§3

// Default, NEUTRAL. Field-weighted; one reason per field hit.
export function lexicalRanker(resource, terms, ctx) { /* see weights below */ }

// Declarative intent boosts expressed as DATA (a non-coder can author rules):
export function keywordIntentRanker(rules) {
  // rules: { [reasonLabel]: { when:(terms)=>boolean, require?: string[], boost: number } }
  return (resource, terms, ctx) => { /* see semantics below */ };
}

// Composition: sum scores, concat+dedupe reasons.
export function composeRankers(rankers) {
  return (resource, terms, ctx) =>
    rankers.reduce((acc, r) => mergeScore(acc, r(resource, terms, ctx)), { score: 0, reasons: [] });
}
```

`searchResources` builds `composeRankers([lexicalRanker, ...config.rankers])`, awaits the score for each resource, keeps `score > 0`, sorts by `score` desc then `path` asc, applies `limit`. Synchronous rankers still return synchronously; asynchronous rankers are supported for real embedding providers. A ranker that **throws** (synchronously or via a rejected promise) is caught and contributes a zero score with a `ranker:error:<name>` reason — the composition is **fail-closed**, so a broken optional ranker (corrupt alias, undefined ctx, unreadable embedding) degrades routing to exactly what the deterministic lexical floor decided, never an exception to the caller.

### `mergeScore(a, b)` — defined (resolves the under-specification)
```js
function mergeScore(a, b) {
  return { score: a.score + b.score, reasons: [...new Set([...a.reasons, ...b.reasons])] };
}
```

### `lexicalRanker` weights (baseline, minus the hacks)
Per matching field, add the weight and push a reason `"<field>:<term>"`:

| Field | Weight | Reason |
|---|---|---|
| `id` | 80 | `id:<term>` |
| `route_text` | 70 | `route:<term>` |
| `title` | 50 | `title:<term>` |
| `description` | 30 | `description:<term>` |
| `keywords` | 25 | `keywords:<term>` |
| `path` | 10 | `path:<term>` |
| `body` | 5 | `text:<term>` |

Matching is `normalized(field).includes(term)` for terms of 4+ chars; a **short term (≤ 3 chars) must match a whole word** (a token of the normalized field), not a bare substring — so «me» does not fire inside «commerciale», nor «ca»/«va» inside «publication»/«evaluer». Longer terms keep substring recall, so «calcule» still matches «calculer» (morphology without a stemmer). This mirrors the protection `routeAvoidReasons` already applies to the avoid-text (`routing.md`), brought to the forward match. **No** `intent:*` boosts, **no** `DOMAIN_KEYWORDS` (both removed from the core — FR-RANK-003). `route_text` is an **optional** field the Router populates from `use_when`/description (`routing.md`); it is empty for plain discovery, so it never changes neutral discovery scoring (FR-RANK-004).

### `keywordIntentRanker` semantics — defined
A rule contributes its `boost` (and pushes its `reasonLabel`) **iff**:
1. `when(terms)` is `true`, **and**
2. every clause in `require` **matches the resource**.

A `require` clause is a string; `|` separates alternatives (OR). A clause matches if **any** alternative is a substring of the resource's normalized *keywords + description* haystack. Example:
```js
keywordIntentRanker({
  "intent:prospect-commercial": {
    when: t => t.includes("prospect"),
    require: ["prospect", "devis|client"],   // needs "prospect" AND (("devis") OR ("client"))
    boost: 160,
  },
})
```
Rules are pure data + one predicate; no business logic in the core.

## The devis boost becomes an example adapter (not core)
```js
// exemples/assistant-devis/base.config.mjs
import { keywordIntentRanker } from "@ai-swiss/base/rankers";   // see open decision #2 (package exports)
export default {
  rankers: [ keywordIntentRanker({
    "intent:prospect-commercial": { when: t => t.includes("prospect"), require: ["prospect","devis|client"], boost: 160 },
    "intent:offre-commerciale":   { when: t => t.includes("offre"),    require: ["devis"],                  boost: 60  },
  })],
};
```

## `deriveKeywords` change
Keep the **structural** derivation (id/type/title/description/path words minus stopwords). **Remove** the `DOMAIN_KEYWORDS` table. Examples that relied on it declare `keywords` explicitly in frontmatter (most already do) or via their `base.config.mjs`.

## Two usages + robust rankers

The `Ranker` serves **two** consumers through one contract:
- **discovery** — `searchResources` ranks all resources for `base discover`;
- **routing** — the Router scores routable candidates (agents/processes) with an enriched `route_text` field (`routing.md`) and passes `ctx.mode="route"` for custom adapters that want to inspect the call site. Built-in rankers do not need hidden mode branches: `route_text` is the explicit routing signal. The **Ranker scores; the Router decides** — the two must not merge.

`lexicalRanker` is the **zero-dependency fallback**, not the final ambition for hard cases (synonyms, paraphrases, implicit requests, heterogeneous vocabulary). It composes with `semanticHybridRanker` (also zero-dep, shipped): token overlap + token-subset aliases + fuzzy dice similarity + optional precomputed embeddings from an index/adapter — still a Ranker, still explainable (`semantic:alias:*`, `semantic:fuzzy:*`, `semantic:embedding`), selectable via `base.config` (`{type:"semanticHybrid"}`). For production real embeddings, BASE ships the separate `@ai-swiss/base-ranker-semantic` package: async Ranker, provider interface, OpenAI-compatible fetch provider, and an optional Ollama helper (`createOllamaEmbedder`, default model `nomic-embed-text`), with no model/cloud dependency in the core. Resource vectors are computed by the package on the fly (cached in process) or read from `resource.embedding`; `precomputeRoutingVectors` (`tools/core/routing-vectors.mjs`) precomputes them once at build time as a **cross-invocation cache** — the in-process cache does not survive a CLI run — and `applyRoutingVectors` injects them (the broker loads `embeddings.json` and applies it on each route via `loadRoutingVectors`; an absent or malformed file is a cache miss, never a failure). These precomputed vectors feed the embedding strategy's retriever (`route-broker.mjs`), enabled when both an embedding and a refiner model are configured (`routing.md`, FR-ROUTE-011). The package is also the **embedder behind `resolveEmbedder`** — the one seam (base-llm has no embeddings) that turns the Studio `routing.embedding_model` ref into the retriever's `embed` function, against the same shared provider registry as the chat/judge `resolveModel` (FR-ROUTE-013).

> **Requirement.** BASE provides an **official** semantic ranker path for production routing. The zero-dependency core keeps `lexicalRanker` as the fallback and ships a practical `semanticHybridRanker`; the maintained adapter package with real embeddings (`@ai-swiss/base-ranker-semantic`) is the recommended production path for larger or harder corpora (FR-ROUTE-006/008) without adding model/cloud dependencies to the core. A semantic ranker raises **relevance**; it never makes the routing **decision** (the Router's structural rules still apply).

### `@ai-swiss/base-ranker-semantic` — provider contract (FR-ROUTE-008)
The package is production-grade, not just elegant. An embedding provider is `embed(textOrTexts, ctx?) => vector | vectors` (`ctx.signal` optional), and every provider call is wrapped with:
- **Deadlines & cancellation** — per-call `timeoutMs`; a caller `AbortSignal` via `ctx.signal`. A timeout and an abort are *distinct* typed errors (`semantic.timeout` vs `semantic.abort`).
- **Bounded retries** — transient failures only (network, 5xx, 429, timeout — the typed errors whose `.retriable` is true), exponential backoff with **full jitter**, honouring a `Retry-After` floor. Config/auth/response/dimension/abort errors are **never** retried.
- **Batching + bounded concurrency** — `createBatchingEmbedder(embed, {maxBatchSize, maxConcurrency})` coalesces concurrent single-text calls into a few bounded, batched requests (OpenAI input arrays are batched natively).
- **Typed errors** — branch on `.code`: `semantic.config | timeout | abort | response | auth | rate_limit | network | dimension`.
- **Vector validation** — empty/non-numeric vectors rejected; a query/resource **dimension mismatch fails loud** by default (`onDimensionMismatch:"throw"`) so a stale index/changed model is caught, not hidden.
- **Configurable cache** — in-memory `Map` by default; any `{has,get,set}` for a persistent/org cache; concurrent calls for the same text share one request.
- **Observability** — `onMetric({provider, batchSize, attempt, latencyMs, cacheHit, similarity, dimension})` — operational signals only, **no text and no vectors**.
- **Security** — the core never calls a provider; nothing leaves without an explicit `embed`. `textOf`/`getResourceEmbedding` bound what is sent (`SECURITY.md`, `docs/trust/securite-donnees-routage.md`).

## How it's proven
- **Neutral project (no config):** `discover` produces **no** `reasons` starting with `intent:` and injects no business keyword.
- **Opt-in intent boost:** when a project adds a `keywordIntentRanker` via `base.config`, the declared `intent:` reason appears with its boost — localised and inspectable, never in the core.
- **Opt-in semantic/hybrid boost:** when a project adds `semanticHybridRanker` via `base.config`, semantic reasons appear and remain composable with lexical reasons.
- **External semantic package:** when a project adds an async embedding ranker from `@ai-swiss/base-ranker-semantic`, `searchResources` and `routeRequest` await it without breaking synchronous rankers.
- **Provider robustness:** a transient 5xx is retried then succeeds; a 401 is typed `semantic.auth` and **not** retried; a malformed payload is typed `semantic.response`; a dimension mismatch throws `semantic.dimension` (or is skipped on request).
- Explainability preserved: every score component is a stated reason.
