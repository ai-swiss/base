<!-- fr-synced: 664e913cb17eb023cb42c7857fe18b6c8a203ad0 -->
# Setting up semantic routing, from zero config to real embeddings

From the moment BASE is installed, requests should reach the right agent and the right process with no initial configuration, then grow in quality the day the need makes itself felt: that is what you set up here. BASE routes a request, or abstains honestly when nothing fits.

Two separate settings must not be confused:

- the **routing strategy** selects the complete path. The `lexical` strategy (Track 1) is the default.
  The `embedding` strategy (Track 2) activates when `.ai/studio.settings.json` names both an embedding
  model and a refiner; it retrieves a few candidates, then asks the refiner to select one or request
  clarification;
- the configurable **rankers** in `base.config` do not select a strategy. They add scores to Track 1
  ranking and to search. A ranker may itself use embeddings without activating Track 2.

See [Track 2, embedding-based routing](voie-2-routage-embeddings.md) for the `embedding` strategy.
This page mainly shows how to configure Track 1 rankers. A ranker orders candidates; the routing
strategy produces the decision. Start with no extension, then add a ranker or Track 2 only when real
cases justify it.

BASE routing chooses the primary workflow, not every possible resource. The full chain is this: choose an agent, route to a process, then open the competences, tools, templates, documents, or data that the process needs. For the full doctrine, see [`docs/reference/routage-process-et-ressources.md`](../reference/routage-process-et-ressources.md).

## Reaching the right agent (the simplest first)

Before the *quality* of the ranking (the "paths" below), here is how the assistant reaches the right agent, from the most manual to the most automatic:

- **Manual, zero tools.** If you know which agent you want, point straight at its `AGENT.md`: it is the only file to load. "Read `exemples/assistant-devis/.ai/agents/assistant-devis/AGENT.md`" is enough (path relative to the repo; in an assistant project, it is nothing more than `.ai/agents/<agent>/AGENT.md`). No routing, no installation.
- **CLI.** `base route "<request>" --root <project>` runs the configured production strategy and
  abstains honestly if nothing fits.
- **MCP.** The `route_request` tool exposes that same router to an AI tool able to read your files. To wire it up, follow the `activer-routage` process.

CLI/MCP routing helps most when several processes or agents could answer. With no model or external
ranker, Track 1 is deterministic. An embedding ranker makes its ranking depend on the provider;
Track 2 also adds a refiner. Both paths retain the same decision statuses, but their result is not
therefore identical or reproducible. For a single simple assistant, loading manually is enough.

The options below address ranking quality within Track 1. They are independent of the Track 2 strategy.

## Default ranking: zero configuration

Write agents and processes in Markdown, with a `use_when` per process. BASE routes thanks to its zero-dependency core: lexical + `semanticHybridRanker` (token overlap, aliases by token subset, fuzzy similarity), structured abstention, routing fixtures, MCP.

```bash
node tools/base.mjs route "le client conteste sa facture" --root exemples/routage-pme
node tools/base.mjs route-test --root exemples/routage-pme   # replays the expected routes
```

Ideal for a single person, a small team, a demo, a first deployment. See the example [`exemples/routage-pme`](../../../exemples/routage-pme/README.md).

### Strengthening without a dependency: `semanticHybrid`

In `base.config.json`, declare aliases (domain synonyms), still without the slightest dependency:

```json
{
  "rankers": [
    { "type": "semanticHybrid", "aliases": { "proposition": ["offre commerciale", "devis"] } }
  ]
}
```

The rule is simple: reserve `base.config.json` for declarative options (`semanticHybrid`, thresholds, validators), and `base.config.mjs` for the cases where you have to import code, for example an embedding provider. If the two coexist, BASE prefers the declarative JSON; so keep only a single format per project once you turn on real embeddings.

## Optional ranker: real embeddings

Install `@ai-swiss/base-ranker-semantic`, choose a provider, add a ranker in `base.config.mjs` (executable config, because a ranker is code). The core itself gains no model or cloud dependency.

```bash
npm install @ai-swiss/base-ranker-semantic
```

In the BASE monorepo, to contribute locally, the package lives in `packages/base-ranker-semantic/`.

```js
// base.config.mjs: OpenAI-compatible endpoint (OpenAI, Azure-like, internal gateway)
import { createOpenAICompatibleEmbedder, createSemanticRanker } from "@ai-swiss/base-ranker-semantic";

const embed = createOpenAICompatibleEmbedder({
  model: "text-embedding-3-small",
  // baseUrl: "https://gateway.interne/v1",  // an internal gateway
  timeoutMs: 10_000,
  retries: 2,
});

export default { rankers: [createSemanticRanker({ embed, minSimilarity: 0.25 })] };
```

```js
// base.config.mjs: Ollama, everything stays local
import { createOllamaEmbedder, createSemanticRanker } from "@ai-swiss/base-ranker-semantic";
export default { rankers: [createSemanticRanker({ embed: createOllamaEmbedder() })] };
```

```js
// base.config.mjs: any provider, or precomputed vectors (no resource text sent)
import { createSemanticRanker } from "@ai-swiss/base-ranker-semantic";
import { vectorFor } from "@ai-swiss/base-index-local";
export default {
  rankers: [createSemanticRanker({
    embed: async (textOrTexts, ctx) => monModele.embed(textOrTexts, { signal: ctx?.signal }),
    getResourceEmbedding: (r) => vectorFor(index, r),
  })],
};
```

The package is robust by default against provider calls: it handles timeouts, the `AbortSignal`, bounded retries (transient only), and typed errors. To group many concurrent calls together, wrap the provider in `createBatchingEmbedder`. Details: [`packages/base-ranker-semantic/README.md`](../../../packages/base-ranker-semantic/README.md) and [the provider page](choisir-provider-embeddings.md).

## Optional local index

As the corpus grows, derive a deletable local index with `@ai-swiss/base-index-local`. The user model stays the same, with no catalog to maintain by hand, and the default routing statuses do not move. See [Understanding scale](../learn/comprendre-echelle.md).

## Running the fixtures

`.ai/routing/route-tests.json` lists requests and the expected route (status, agent, process).
By default, `route-test` replays the available fixtures and `routing.examples` with the lexical
strategy and the rankers from `base.config`. It checks those written cases, not every possible
phrasing or the decision of a model reading the index:

```bash
node tools/base.mjs route-test --root <project>         # readable output, exit ≠ 0 if a route breaks
```

If both Track 2 models are configured, `base route` uses the `embedding` strategy. Deliberately replay
the real path:

```bash
node tools/base.mjs route-test --strategy production --root <project>
```

This second command calls the configured models. It checks the production path during that run; it
is neither deterministic nor intended as a reproducible CI gate. Likewise, an external ranker wired
through `base.config` can make the lexical run depend on its provider.

## Reading the score reasons

`route --json` makes every score component explicit, with inspectable reasons rather than an opaque confidence score.

```bash
node tools/base.mjs route "panne au login" --root exemples/routage-pme --json
```

| Reason | Means |
|---|---|
| `route:<term>` | the term matched the `route_text` (strongest routing signal) |
| `route_text:use_when` | the `route_text` comes from the `use_when` (the intended signal); `:title`/`:path` = weak signal |
| `route_avoid:<term>` | a `routing.avoid_when` matched: the score is **canceled** (counter-example) |
| `semantic:alias:*`, `semantic:fuzzy:*` | contribution from the zero-dependency `semanticHybridRanker` |
| `semantic:embedding:<sim>` | cosine similarity of real embeddings (semantic package) |

The status (`routed | ambiguous | needs_clarification | out_of_scope`) and its `reason_code` say *why* BASE decided, or why it preferred to ask.
