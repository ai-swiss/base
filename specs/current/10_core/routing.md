# 10 · Routing

> **For developers and maintainers.** How BASE turns a request into a route — *which* agent and
> process to follow, or an honest abstention — derived from the files, scored by the Ranker, decided
> by inspectable rules. Implements the `ROUTE` requirements. Normative code: `tools/core/routing.mjs`
> (pure) + `routeRequest` in `tools/base-core.mjs` (orchestration).
>
> Owns: FR-ROUTE-*, NFR-ROUTE-*, FR-SCALE-*

<!-- LEAF-OVERSIZE: Routing owns FR-ROUTE + NFR-ROUTE + FR-SCALE; the refonte added the workspace, the generated index, the deny policy, and the two-strategy model (the embedding strategy: embeddings + refiner). Prose already tightened — extracting the build-projection sections (registry/index/indexed-routing) into a sibling chapter is the tracked split. -->

## Thesis

Routing **just works** because it is derived from the files teams already write. A hand-maintained
routing catalogue would betray BASE (Text = truth). The routing registry exists, but it is **generated**
— a projection, never a source of truth.

## Routing ≠ retrieval

Two different problems, kept apart:

- **Routing** decides *which agent and process* a request follows. A control-flow decision over a
  **small, closed** set of candidates derived from the files. Must be explainable and able to abstain.
- **Retrieval** finds the *context* once the route is chosen (competences, documents, data). A
  context decision over a potentially huge set; it may use search, BM25, embeddings.

The Router never free-searches the whole repository. It chooses among structured candidates.

## The routing hierarchy

`agent → process → resources` — **no required `domain` tier**. The `.ai/agents/<agent>/` directory is
already the local domain; `agentDirOf(path)` recovers it from the filesystem layout (framework and
example layouts alike). Only `type: agent` and `type: process` are **routable**; competences,
templates, data and documents are **context**, retrieved after the route is chosen — a competence is
never promoted to a primary workflow just because it matches lexically. A resource whose `status`
is `deprecated` or `archived` is **never a routing candidate** (the aging ontology): the corpus
ages explicitly, and the Router respects it. Discovery (`searchResources`) still finds such
resources; routing does not.

## The routing signal (FR-ROUTE-001)

`deriveRoutingSignals(resource)` normalises a resource into `{ route_text, avoid_entries, avoid_text,
route_scope, agent_path, reasons }` (`avoid_entries` feeds the veto; `avoid_text` is their joined
display form for index cards and refiner prompts, never re-split for matching). It is a **plain function, not a port** (Rule of Three: it becomes configurable
only when a second real extractor exists). `route_text` is built from the file by a fallback chain, and
the source is reported as an explainable `route_text:<source>` reason:

```
use_when → description → title → keywords → "## Quand utiliser" section → path
```

The single recommended new field is **`use_when`** — a short sentence on *when* to use the resource.
Optional `routing.examples` (real user phrasings) are appended to lift recall. Optional
`routing.avoid_when` counter-examples veto: when a request clearly matches one of them, the candidate
is kept explainable but its score is zeroed before the structural decision. The match is judged **per
counter-example, never across their concatenation** (two entries that each hit ONE request term must
not combine into a veto neither justifies alone — a process whose counter-examples share its own
nouns would otherwise veto itself out of every request); within an entry, two term hits are required
(one suffices for a single-term request), and a short term (three characters or fewer) must match a
whole word of the entry. `use_when`
keeps one job (when to use); examples and counter-examples live in the structured `routing` block, not
hidden in `use_when`. All of it is **progressive**: a resource routes from its title/description alone;
richer fields are optional and become advisory/strict only by scope and config.

## Scoring reuses the Ranker (FR-ROUTE-004)

The Router does **not** introduce a second ranking system. It enriches each candidate with its
`route_text` and scores it through the same `composeRankers([lexicalRanker, ...config.rankers])`
contract used by discovery. It passes `ctx.mode = "route"` for custom adapters, but the built-in
distinction is deliberately simpler: `route_text` is present for routing candidates and absent for
plain discovery. `route_text` is the highest-signal field in the ranker (reason `route:<term>`) and is
inert for resources that don't carry it, so general discovery is unchanged. A project that wants
stronger routing composes `semanticHybridRanker` (see `ranker.md`); the Router still applies the
structural rules on top.

## Structural decision — never a fake confidence (FR-ROUTE-003)

`routeRequest` first removes weak request terms — articles, pronouns, greetings, and the measured
closed class of French function words (negations, interrogatives/subordinators including the inflected determiner forms quel/quelle/quels/quelles, demonstratives,
degree adverbs, impersonal modals, polite request formulas) — so a request with no business signal
abstains instead of manufacturing a route from noise. Greetings and small talk ("Bonjour, comment ça
va ?") abstain honestly (and reach the help fallback when configured); so do negated
no-content requests («ça ne marche pas» must not credit a `use_when` for containing «ne … pas», nor
«il faut» clear the floor on its own); an empty request abstains the same way. Verb forms that carry
signal (faire/fait, pouvoir forms) are deliberately NOT stripped — «Que fait le MCP ?» is a real
request. Negation SEMANTICS stay beyond the lexical floor by design: «pas A mais B» credits both A
and B (the router counts evidence, it cannot invert it) and degrades to an honest abstention whose
candidates carry both options — the reading harness resolves it, or the user answers the question.

`decideRoute(ranked, agentsByDir, thresholds)` returns one of **four statuses**, plus a `reason_code`
that carries the fine distinction. It does **not** emit an opaque `confidence`. A `routed` result always
contains a real agent card and a real process. Orphan processes and root `AGENT.md` files can be
inventoried, but they are not returned as closed-list route candidates because they cannot satisfy the
`agent → process` invariant. Aggregated per agent (an agent's score = the best of its own card and its
processes): an agent is a strong candidate if *either* its card text or one of its processes matches well,
so a request that names the agent's domain surfaces it even before a specific process is clear. This is
deliberate; do not "simplify" it to process-only or card-only scoring. The `competing_intents` check
below relies on this best-of aggregation to compare whole agents fairly.

| status | when | reason_code |
|---|---|---|
| `routed` | one clear agent + one clear process | `null` |
| `ambiguous` | two processes of the **same** agent too close | `two_close_candidates` |
| `needs_clarification` | agent clear but no process clears the floor | `no_clear_process` |
| `needs_clarification` | two **different** agents too close (competing intentions) | `competing_intents` |
| `out_of_scope` | nothing clears the floor | `below_floor` |

The thresholds are inspectable, configurable sort rules — not probabilities — defaulting to
`{ floor_score: 30, top2_margin: 0.2, max_candidates: 5, workspace_margin: 0.4 }` and overridable via
`base.config` `routing`:

```text
floor_score = 30        # minimum score to be a real candidate
top2_margin = 20%       # how close the runner-up must be to count as "too close"
max_candidates = 5      # shortlist size returned for an LLM/human to choose from
workspace_margin = 40%  # the wider top2_margin used when deciding across workspace roots
```

The agent-level and process-level decisions — and the cross-root decision (see *Routing across a
workspace*) — share one primitive, `decideAmong` (the floor plus the single `isTooClose` margin rule).
"A clear winner versus a near-tie" is decided in **one** place and mapped to each level's
`status`/`reason_code`, never re-implemented per level.

There is **no** `incomplete` status: "agent clear, no process" is `needs_clarification` with
`reason_code: "no_clear_process"`.

## Return shape

`routeRequest(root, request, { limit?, config? })` returns:

```js
{
  request,
  status: "routed" | "ambiguous" | "needs_clarification" | "out_of_scope",
  reason_code: string | null,            // e.g. "no_clear_process", "competing_intents"
  agent: { id, type, title, path } | null,
  process: { id, type, title, path } | null,
  candidates: [{ resource: { id, type, title, path }, score, reasons, route_scope }],
  explanation: string,
  next_question: string | null,          // a clarifying question on abstention
  fallback?: { agent: { id, path }, process: { id, path } }  // help target on an honest abstention (FR-ROUTE-009)
}
```

Both strategies emit this one candidate shape (the embedding strategy's `reasons` say
`retriever:cosine` or `retriever:lexical_fallback`, from the `match` the retriever threads), but the
`score` is **strategy-scaled** — lexical ranker points on the floor, cosine similarity on the embedding
path — so scores compare only within a single decision, never across strategies.

## Help fallback on abstention (FR-ROUTE-009)

A project may declare `routing.fallback: { agent, process }` in `base.config`. When the Router **abstains** — `out_of_scope`, or `needs_clarification` with no useful `next_question` — and the configured target resolves in the inventory, `routeRequest` attaches a `fallback` pointer **on either strategy** (the broker attaches it on the embedding path exactly as `computeRoute` does on the lexical floor: same config, same deny-filtered corpus, same eligibility). It is **separate metadata, never a route**: the `status` stays the honest abstention, so analytics and route fixtures remain truthful (`route-tests.json` can assert `fallback.agent`/`fallback.process`). The core router is **agent-agnostic**: the target is configured, never hard-coded; a missing/typo'd target attaches no fallback (graceful) and `validateBase` warns (`base.routing.fallback_unresolved`). The harness loads the fallback instead of leaving the user at a dead end; the formatter prints `Fallback: <agent> -> <process>`. The text output is as honest as the decision: on a committed agent it prints the agent/process **paths** (the harness reads text — give it what to open); on `competing_intents` it prints **no** `Agent:` line at all (the decision carries the top of two too-close agents for JSON consumers, but naming one in prose invites loading exactly what the abstention forbids).

## Routing across a workspace (multiple roots)

`base route --workspace <file>` routes inside each declared root, then decides among the routed roots
with the **same** primitive as intra-root routing (`decideAmong`): a root that **clearly dominates**
wins; a **genuine near-tie** abstains as `ambiguous` / `competing_roots`, listing the roots. Cross-root
scores are less commensurable, so the workspace uses a **wider `workspace_margin` (default 0.4)** than
the intra-root `top2_margin` (0.2). A single routed root always routes; none routed → `out_of_scope` /
`no_workspace_route`. A broken root **degrades gracefully** — reported under `unreachable_roots`, never
aborting the healthy ones.

## Declarative routing policy — `deny` (FR-ROUTE-003)

A node (root, agent) may carry a `routing.deny` policy that folds **monotonically** down the chain
(`resolveEffectivePolicy`, `tools/core/route-policy.mjs`): `deny` (targets it never routes to)
accumulates as a union. Sorted, hence deterministic — a descendant can only tighten, never loosen.

`deny` is a **veto** applied once, upfront in `decideRoute`: each routable target is judged under root ∪
its agent's policy (a process can never escape its agent's deny) and a denied one is dropped from
`selectable` — so it is absent from BOTH the structural decision and the returned candidate shortlist
(`isAllowed`). The deterministic floor and the embeddings therefore never route to it, and an LLM cannot
pick it from the list. A deny entry matches by exact id, by `type:id` (`process:paie`, `agent:*` for a
class), or by a trailing-`*` glob; the veto removes, never reorders. Proven by `tests/route-policy.test.mjs`
(the fold) and `tests/route-veto.test.mjs` (the veto + no candidate leak). A process its **agent** denies,
and an agent the **root** denies, are now omitted from the index (`renderRoutingIndex` with the root
policy, `tests/route-index.test.mjs`), so the agent reading the index cannot see them; only **direct
resource loads** remain deferred.

## Two strategies, one port (FR-ROUTE-010..013)

BASE routes one of two ways, **chosen by configuration, never blended**. Both satisfy the same `Router`
port and produce the same `RouteDecision`, so the caller compares one type and never branches on which
strategy ran. The patterns are textbook: Strategy (two strategies), Pipeline (the embedding strategy is `refine ∘ retrieve`),
Ports & Adapters (the models are injected adapters; the core imports no model client). The seam is
`tools/core/router.mjs`; the broker (`route-broker.mjs`) wires the real resolvers. The distinction that
governs both: a **MECHANISM** is code-guaranteed by a test (the floor, the deny veto, the refiner's
hallucination guard); a **CONSIGNE** is followed by the model, faillible, always bounded by a mechanism
(reading the index).

**The lexical strategy — the deterministic floor + the consigne (default; «Voie 1» in the user docs).** The harness LLM reads the generated index
(the consigne) and chooses; under it, `computeRoute → decideRoute` is the offline floor — a constrained
classifier over the returned `candidates`, choosing *from the list* (or abstaining), never free-exploring
the filesystem. If the index-read choice disagrees with the floor, that is an ambiguity signal: re-examine
«Quand l'utiliser»/«Éviter si» or ask, never silently override. No LLM call lives in the zero-dependency
core. The canonical consigne (`ROUTER_BODY`, projected into every entry point and freshness-gated)
states the full reading discipline, each rule at its point of use: decide on candidate **metadata**,
never by reading all bodies (`base discover`, `--projection metadata`, the frontmatter block); a
knowledge question routes to `discover`, not to a guessed process; once routed, preload what the
process declares via the context planner (`base context` / `get_context_pack` — paths and notes,
never bodies); on abstention ask the returned question without opening competing bodies; and when the
active process path can no longer be cited (a summarized long conversation), re-read the on-disk
`SKILL.md`/`AGENT.md` before acting — the file is the source of truth, not the model's memory.

**The embedding strategy — embeddings retrieve, a small LLM refines (opt-in, for scale; «Voie 2» in the user docs).** `routingStrategy(routing)` reaches
the embedding strategy **only when an embedding model AND a refiner model are both configured** — all-or-nothing, so a
project that never configures the pair never touches an embedding or LLM call. The pipeline
`embeddingRouter(retrieve, refine, k)` is two ports:

- **`Retriever`** (`retrieve.mjs`) embeds the query once and returns the top-`k` candidates **by rank** —
  `k` is a count of how many the refiner sees, never a tuned similarity cutoff; even the kth-best rides
  through, a no-vector resource falls back below any cosine match rather than vanishing.
- **`Refiner`** (`refine.mjs`) asks the small LLM for ONE decision over the candidates' «Quand l'utiliser»/
  «Éviter si», enum-constrained to `select | needs_clarification | out_of_scope`. A `select` routes only to
  a candidate id (off-list or absent → abstain, `off_list_selection`): routing outside the retrieved,
  deny-filtered set is **structurally impossible**, not trusted-then-checked.

The broker is **fail-closed** (mechanism): any embedding-strategy error — model unreachable, missing vectors, a
resolution failure — drops to the lexical strategy, never throws, never silent, and is **recorded** as a trace event
(`strategy_fallback`). The deny veto is the shared pre-filter applied **once upstream of both strategies**
(`denyFilterResources`), so a denied target reaches neither the floor, the embedding recall, nor the
refiner's list.

**Egress holds at the strategy gate, whoever calls** (mechanism). The embedding branch derives where its
own configured models run (`routingLocality`: both refs on a local provider → `local`; a remote,
unknown or unreadable provider → `remote`, the fail-safe) and applies the root policy itself, so a
caller that injects no egress context — the local CLI — gets the same guarantee as the MCP surface:
a `local-only` root's request text never leaves toward a remote model (the deterministic floor answers,
journaled `strategy_fallback` + `egress: root_local_only`); under policy `any`, a `confidential`
resource's `route_text`/`avoid_text` never reaches the remote refiner prompt (`checkEgress` filters the
branch corpus, journaled `routing_egress_withheld`; combined with the off-list guard, picking a
withheld target is structurally impossible). The filter narrows **only the corpus fed to the remote
model**: the lexical fallback that answers on any embedding-strategy error is fully local and sends
nothing to a model, so it routes over the **whole** corpus — withholding a confidential resource from
it would silently drop a legitimate route, a strict regression versus a plain (no-Voie-2) project.
Idempotent over an MCP corpus already egress-filtered upstream; with local models nothing leaves, so
nothing is withheld.

**Config.** The embedding strategy's switch is the `routing` block in `.ai/studio.settings.json` — `{ embedding_model,
refiner_model, k? }`, validated all-or-nothing at write time. This is a **distinct namespace** from
`base.config` `routing`, which holds the lexical strategy's thresholds and the `deny` policy. Both models resolve
through the **same shared provider registry** the eval runner/judge use (`resolveModel`/`resolveEmbedder`,
the embedder being the shipped semantic adapter — `ranker.md`), exposed 1:1 in the Studio's «Routage /
Voie 2» page. Defaults are illustrative, not prescriptive; see `docs/guides/voie-2-routage-embeddings.md`.

## Generated registry (FR-ROUTE-005, projection)

`buildRoutingRegistry(resources)` is a **deterministic in-memory derivation** (`schema_version:
base.routing.v1`): agents, their processes, the derived `route_text` and per-card signal source, plus a
`diagnostics.weak_signals` list. It holds **derived signals only** — no semantic scores, no file
bodies, no hand-maintained mapping — so everything projected from it is idempotent. It is not written
to disk itself (the former `routing-registry` disk target had no reader and was retired); its readable
face is the routing index below, and the eval harness consumes the same derivation.

Current runtime behaviour is intentionally simple and honest: `routeRequest` derives candidates in
memory from `inventoryResources`. The derivation itself is never written to disk; its only committed
face is the agent-readable routing **index** (`base build routing-index`), an opt-in projection for
navigation and review, not read by the Router today. `base.manifest.json` is likewise a general
discovery projection, not a routing cache. This keeps the small-project path zero-dependency and
avoids a half-built scale abstraction.

### Generated index tree (FR-ROUTE-005)

`renderRoutingIndex(registry)` (`tools/core/index-md.mjs`, pure, zero-dep, no I/O) is a second
deterministic projection of the registry: the markdown index the agent reads to route by **progressive
disclosure**. `.ai/routing/index.md` lists the agents; each `.ai/agents/<agent>/index.md` lists that
agent's processes with their `route_text` («Quand l'utiliser») and `avoid_text` («Éviter si»), linked
to the `SKILL.md`. It **invents nothing** — it materialises what `buildRoutingRegistry` already derives;
only the rendering is new. Sorted and **timestamp-free**, so regeneration is byte-identical and CI gates
freshness. Orphans are skipped. The agent's reading is a **consigne** bounded by the floor and the veto;
the generation is the **mechanism**.

### Optional indexed routing (scale, FR-SCALE-001..004)

The scale path keeps the **same user model** and ships as an optional package — not in the
core. `@ai-swiss/base-index-local` projects a derived, deletable postings index from the inventory +
derived signals; `routeWithIndex(index, request, {rank, decide, routeTerms, routeAvoidReasons,
thresholds})` reuses BASE's **injected** Ranker and Router. By default it scores every routable document
stored in the index, preserving the **same status/agent/process/reason_code** as in-memory `routeRequest`
even for semantic rankers without lexical hits. `candidateMode:"lexical"` is available as an explicit
speed/recall trade-off for lexical-compatible rankers. Measured: a 52 500-document index builds in ~0.4 s
and searches warm in <1 ms (`docs/guides/benchmarks-echelle.md`). The index is a projection (deterministic for
derived signals, deletable, regenerable); embeddings are runtime and not frozen.

A persistent `SearchIndex` **port inside the core** stays out by the Rule of Three: it is extracted
only once ≥ 2 real consumers need it. Until then the contract lives in the official index package.

Determinism applies to the **derived signals** only. Semantic scores are computed at runtime by the
ranker and are never frozen into the "deterministic" registry; their reproducibility depends on a
pinned model/index. The generated `.ai/routing/` tree is excluded from inventory.

## CLI & MCP (FR-ROUTE-005)

- `base route "<demande>" --root <root>` — observable, testable routing outside any harness (`--json` for the full shape).
- `base route-test [--from fixtures.json] [--strategy lexical|production]` — runs a declarative JSON fixtures file
  (`[{ request, expect: { status?, reason_code?, agent?, process? } }]`, default
  `.ai/routing/route-tests.json`); exits non-zero on a mismatch. Fixtures replay the **lexical floor** by default (deterministic, CI-safe); the result names both the strategy replayed and the strategy production `base route` would take (`productionStrategy`), and the CLI warns when they differ — green must never silently certify a path production does not take. `--strategy production` replays each case through `routeRequest` (model-backed when Voie 2 is configured; deliberate, per-run, not for CI). `--examples` replays the corpus's own declared
  `routing.examples` as cases instead of a fixtures file (`casesFromExamples`, scope-aware: an agent
  example asserts the agent, a process example asserts the process) — the drift guard for the
  phrasings authors promised their users. An empty replay (no resource declares `routing.examples`)
  **throws**, exactly as the fixtures path does on a missing file: a guard that certifies zero cases
  green reads as "all promises hold" when none were made. Each failure carries the WHY next to the WHAT: the actual
  decision and its capped candidate shortlist (`summarizeRoute`: `{ id, score, reasons }`), printed as
  `obtenu:`/`candidat:` lines, so the author tightens `use_when`/`avoid_when`/`keywords` without
  re-running `base route` case by case. Protects business routes from
  regressions without an academic benchmark.
- `base build routing-index [--write]` — generates the agent-readable index tree (root + one per agent), a deterministic projection of the registry, committed to the repo and gated for freshness in CI (opt-in, not part of `build all`).
- `base build routing-embeddings [--write]` — precomputes the routing vectors with the SAME model reference the query path reads (`routing.embedding_model` from `.ai/studio.settings.json`, resolved through the shared provider registry by `resolveEmbedder` — one vocabulary, one place; the shipped semantic package is imported dynamically), writing the model-specific `embeddings.json` cache (gitignored). Opt-in, model-backed. The cache is a **stamped envelope** (`base.routing_vectors.v1`): it names the embedder it was built with (`<provider>/<model>`) and each entry carries the sha256-derived hash of the `route_text` it embedded (`hashRouteText`). `confidential` resources are **never embedded** (the egress promise holds on the build path; the CLI reports the skip count). At route time, `verifyRoutingVectors` drops entries whose `route_text` drifted (journaled: `routing_vectors_stale`) and the embedding strategy strips ALL precomputed vectors when the cache's stamp names another model than `routing.embedding_model` (journaled: `routing_vectors_model_mismatch`; vectors from another model live in another space — noise, worse than no cache; since build and query read the same reference, this only fires on a cache from an earlier model or another machine). A pre-v1 bare map keeps working, flagged `legacy`; `base doctor` surfaces both drifts (`stale_routing_vectors`).
- MCP tool `route_request` — returns a route or an abstention; it does not load every instruction.

## Routability advisory (opt-in)

`routabilityWarnings` is a reference Validator adapter (opt-in via `base.config`
`{ "type": "routability" }`). It **warns, never blocks**: a routable resource without a description, or
a shared (`team|org|public`) process without `use_when`. The core validator stays minimal.

## How it's proven

- Pure core: `deriveRoutingSignals` (fallback chain + examples + `avoid_when`), `agentDirOf`
  (framework/example layouts, skips `_template`), `decideRoute` (the five rows above) over the shared
  `decideAmong`/`isTooClose` margin primitive, `buildRoutingRegistry` (sorted, idempotent) — unit-tested
  in `tests/base-routing.test.mjs` and `tests/route-workspace.test.mjs` (the margin rule and the
  cross-root decision, incl. the dominant-winner and genuine near-tie cases).
- Integration: `routeRequest` routes a clear request to agent+process, abstains `out_of_scope` on an
  unrelated or signal-free one, never routes to a competence, never exposes orphan routables as
  closed-list candidates, and can use `semanticHybridRanker`; `runRouteTests` reports pass/fail from
  JSON fixtures.
- Quality: route fixtures cover paraphrases, counter-examples and near-duplicate ambiguity; a synthetic
  scale smoke protects routing over larger generated agent/process sets.
- Semantic package: `@ai-swiss/base-ranker-semantic` is exercised as an async Ranker path with real
  embedding-provider semantics and no core dependency.
- CLI: `base route`, `base route-test`, and `base build routing-index` are exercised.
- MCP: the registered `route_request` tool returns a route or abstention.
- Discovery is unchanged: `route_text` is inert without a Router (backward-compatible Ranker change).

## Deliberately out of the core (Rule of Three)

- The core does **not** read the generated registry as a runtime cache; it derives candidates in
  memory. The optional `@ai-swiss/base-index-local` package covers the scale path out of core, and an
  in-core cache is justified only by profiling.
- There is **no** persistent `SearchIndex` port in the core; the index contract lives in the official
  package until ≥ 2 real consumers need a core port.
- Scores are **not** normalised to `[0,1]`. They are explainable weighted sums, and the **decision** is
  already ratio-based (`decideAmong` compares second/best) — the only absolute is the floor, a
  minimum-signal gate, not a confidence. A `[0,1]` score would read as the fake confidence this design
  rejects; embeddings do not re-score the floor, they run as a separate strategy (the embedding strategy: retrieve by rank
  then refine), never blended. Coverage-penalising a lone match in a long request is likewise left out:
  the safe form needs a stemmer/IDF (out of core), and the blunt form (score × matched/terms) harms
  verbose-but-legitimate requests.
