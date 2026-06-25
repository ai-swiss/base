# 10 · Requirements

> **For developers and maintainers.** Indexed requirements for BASE-the-tooling.
> Every row states **present behaviour**, statuslessly — what the software does now, precisely enough to
> reimplement. Planned-but-unbuilt work lives in `CHANGELOG.md` and `.plans/`, never here; a genuine
> unknown is flagged inline `[NEEDS CLARIFICATION: reason]`.
> "Matches `fn`" means that function's source in `tools/base-core.mjs`, `tools/core/*.mjs`,
> `tools/base.mjs`, or `mcp/src/index.ts` is normative.
> Each section declares the ID namespace it `Owns:`; proof of each ID lives in
> [`requirements-matrix.md`](requirements-matrix.md), regenerated from the test suites.

<!-- LEAF-OVERSIZE: central requirements index; the single ID table is deliberately one leaf (the joint the matrix and immutability gate resolve against). Split by domain only past ~400 lines. -->

## Stakeholders / user requirements (UR)

Owns: UR-CORE-*

| ID | Requirement |
|---|---|
| UR-CORE-001 | An **AI agent** in a harness can discover, read, and act on a BASE project's resources through a small, predictable set of primitives. |
| UR-CORE-002 | A **CLI user** (Personal/SME) can validate, index, search, open, and maintain a BASE project from the terminal with zero install beyond Node. |
| UR-CORE-003 | An **integrator/IT developer** can make discovery, validation, permissions, and auth stricter or domain-aware **without forking the core**. |
| UR-CORE-004 | A **maintainer** can understand, test, and safely change the tooling from this spec plus the code it names. |

## Non-functional requirements (NFR)

Owns: NFR-CORE-*, NFR-PARSE-* (NFR-ROUTE-* is owned by the ROUTE section)

Canonical list in `00_overview/vision.md` §5: **NFR-CORE-001** zero-dependency core · **002** no breaking changes · **003** safe by default · **004** fail loudly · **005** extensible without forking · **006** portability. Additional:

| ID | Requirement |
|---|---|
| NFR-CORE-007 | Operations record a minimal trace that **never** throws into the user's workflow (`recordEvent` swallows its own errors). |
| NFR-CORE-008 | Trace and logs contain **no business content by default** (args hashed; MCP logs to stderr only). |
| NFR-CORE-009 | Derived artifacts (manifest, index) are **regenerable** and never the source of truth. |
| NFR-CORE-010 | Spec discipline is **gate-enforced** by tools a developer runs locally and CI runs: the requirements→tests matrix is regenerated-and-diffed and rejects phantom citations (`tools/spec/requirements-matrix.mjs`); **spec-sync** requires a runtime-code change — `tools/**` (excluding the studio/eval/spec/docs apps and meta), `mcp/src/**`, or `packages/*/{src,bin}/**` (`.mjs`/`.ts`/`.js`, tests excluded) — to also touch `specs/` or declare `[SPEC-NEUTRAL: reason]` (`tools/spec/spec-sync-check.mjs`); requirement **IDs are immutable** — never renumbered, reused, or deleted (`tools/spec/check-ids.mjs`) — and **namespace-scoped**: each row-defined ID sits within the `Owns:` namespace its section declares (`tools/spec/check-id-namespaces.mjs`). |
| NFR-PARSE-001 | Frontmatter parsing is **deterministic** and **rejects** unsupported constructs loudly (no silent mis-parse). |

## Functional requirements - CORE (broker)

Owns: FR-CORE-*

| ID | Requirement |
|---|---|
| FR-CORE-001 | **Inventory.** `inventoryResources(root)` walks the project, skipping `.git`, `.temp`, `.plans`, `.reviews`, `.base-docs`, `node_modules`, `dist`, `trace`, the `.ai/trace` + `.ai/changes` runtime dirs, `.ai/routing`, `.ai/agents/_template`, the engineering `specs/` tree, the `exemples/` sample projects, the `packages/` optional units, and the `tests/` tree (resource boundary - specs, examples, packages and test fixtures are validated/run in isolation, never merged into the framework's own inventory, so a fixture can never become routable); includes only `.md`/`.json`; excludes `base.manifest.json`, `base.config.*` and `base.workspace.json`. A nested directory that is itself a separate root - one carrying `base.config.json`, `base.manifest.json`, or `base.workspace.json` (a copied/generated BASE or a nested workspace such as the Studio E2E `e2e/.run-ws/`) - is discovered in isolation, never descended into. Matches `walkResourceFiles`. |
| FR-CORE-002 | **Derived defaults.** For each resource it derives `id` (frontmatter `id` else slug of path), `type` (frontmatter else path-based, `deriveType`), `title`, `description`, `keywords`, and defaults `scope=personal`, `status=active`, `sensitivity=internal`. Matches `inventoryResources`. |
| FR-CORE-003 | **Resource record shape** (the object every port receives): `{ id, type, title, description, path, schema_version, scope, status, sensitivity, keywords[], requires[], may_use[], use_when, source, execution, metadata, frontmatter_errors[], content, body }`. See `architecture.md` §"Resource record". |
| FR-CORE-004 | **Path confinement.** `confineToRoot(root, target)` resolves inside `root`, rejecting traversal (`escapes BASE root`) and outward symlinks (`escapes BASE root through symlink`), tolerating not-yet-existing paths. |
| FR-CORE-005 | **Open.** `openResource(root, idOrPath, {projection, purpose, confirmed, egress})` finds by `id` or `path`, asks the policy for a `read` decision, throws on `deny`, else returns `{resource, policy, content}` projected as `metadata`\|`instructions`\|`full`. Under an `egress` context a withheld resource returns the egress notice instead of content (FR-EGRESS-003). |
| FR-CORE-006 | **Access.** `accessResource(root, idOrPath, …)` returns the resource via `openResource` if known, else reads an arbitrary **confined** file and returns it with an `allow` decision. |
| FR-CORE-007 | **Invoke.** `invokeTool(root, idOrPath, args, {dryRun, confirmed})` requires `type=tool` and an `execution.entrypoint`; resolves the entrypoint (confined); builds the command via `commandForRuntime` (`python3`/`node`/`bash`/raw); **dry-run by default** returns the command without running; real run requires policy `allow` **and** confirmation; executes via `execFile` with a **30 s timeout**, `cwd=root`. |
| FR-CORE-008 | **Search.** `searchResources(root, query, {limit})` normalises terms (NFD, strip diacritics, lowercase) and scores per field. See FR-RANK-*. |
| FR-CORE-009 | **Index.** `writeManifest(root)` writes `base.manifest.json` = `{schema_version:"base.manifest.v1", root_name, resources[]}`; the manifest is a **deterministic** projection (no `generated_at` field), so a rebuild is byte-identical and a CI no-diff freshness gate holds. `checkManifestFresh(root)` is that gate (compare, never write): it rebuilds in memory and reports the committed manifest fresh only if byte-identical, stale otherwise (and a missing manifest is never fresh); `base index --check` runs it in `npm run check`, failing with a "run npm run index" message so a stale manifest cannot pass silently. Matches `writeManifest`/`checkManifestFresh`. |
| FR-CORE-010 | **Maintenance report.** `createMaintenanceReport(root)` returns validation + open markers (`[A COMPLETER|A VALIDER|ATTENTION|DECISION]`, `TODO`, `FIXME`, `PLACEHOLDER`) + missing descriptions (for `agent`/`process`/`tool`) + trace summary + recommendations. Structural lenses: weak routing signals, orphan competences/templates, and **stale markers** (open markers in business files whose mtime is ≥ 30 days old — the "verification theater" signal; mtime approximation by design, never an error when unreadable). |

## Functional requirements - PARSE (frontmatter) · see `frontmatter.md`

Owns: FR-PARSE-*

| ID | Requirement |
|---|---|
| FR-PARSE-001 | Parse a `---`-delimited subset to `{data, body, raw, errors}`; `errors` are `{line, code, message}`. `tools/core/frontmatter.mjs`. |
| FR-PARSE-002 | Strict-subset parser with a documented grammar and stable `base.yaml.*` codes; **rejects** unsupported constructs (tab indent, block scalars `\|`/`>`, flow maps `{}`, anchors/aliases/tags, unterminated quotes, duplicate keys, bad indent) instead of guessing - and never inserts a guessed value for a rejected token. Golden + negative-per-code + property + fuzz tests (`tests/base-frontmatter.test.mjs`). |
| FR-PARSE-003 | An empty scalar - `key:` with no nested block - and empty inline-array items parse to `null` (not `{}`). |

## Functional requirements - VALID (validation) · see `validator.md`

Owns: FR-VALID-*

| ID | Requirement |
|---|---|
| FR-VALID-001 | `validateBase(root)` returns `{ok, errors[], warnings[], resources[]}`; collects **all** problems (does not stop at first). |
| FR-VALID-002 | Errors: frontmatter parse errors, duplicate `id`, invalid `id`/`type`/`scope`/`status`/`sensitivity` enums, missing required fields, bad `execution`/`requires`/`source` shapes, missing tool entrypoint, broken relative links, and the aging-ontology codes (FR-ONTOLOGY-001). Matches `validateResourceMetadata` + link/entrypoint checks. |
| FR-VALID-003 | Warnings (non-blocking): missing `title`, unknown `requires[].ref`, missing `source.local_fs` locator, and the egress hint (FR-ONTOLOGY-002). |
| FR-VALID-004 | **Minimal contract only.** Metadata is validated **only if `schema_version` is present**; files that don't opt into the contract are not schema-checked. This is intentional ("progressive metadata"). |
| FR-VALID-005 | Validation is a **`Validator` pipeline** (`tools/core/validators.mjs`): `runValidators([coreSchemaValidator, ...config.validators])` over a Notification accumulator; `validateBase(root, {config})` resolves config and runs it. Reference adapters: `requireFields`, `requireSchemaVersion`, `forbidSensitivity`, `hasField`, `piiScanner`. Enums live in `core/schema.mjs`; messages decoupled into `core/codes.mjs`. |

**`requires[].access` is intent, not a grant** (clarifies FR-VALID-002/003): it declares an intended use (`read`/`write`/`execute`) of a referenced resource for validation — never an authorization. Enforcement happens only when a mediated action reaches `openResource`/`accessResource`/`invokeTool`/`proposeChange`/`commitChange`, or in the native system that owns the source.

## Functional requirements - ONTOLOGY (living-corpus fields) · see `validator.md`

Owns: FR-ONTOLOGY-*

| ID | Requirement |
|---|---|
| FR-ONTOLOGY-001 | **Living-corpus fields, validated.** `base.resource.v1` carries four OPTIONAL fields — `review_by`, `valid_from`, `valid_until` (dates, `YYYY-MM-DD`) and `confidential` (boolean) — validated by `coreSchemaValidator` only when `schema_version` is present: a malformed date emits `base.review_by.format` / `base.valid_from.format` / `base.valid_until.format`; `valid_from` after `valid_until` emits `base.validity.order`; a non-boolean `confidential` emits `base.confidential.type`. Matches `coreSchemaValidator`. |
| FR-ONTOLOGY-002 | **`confidential` is a human-set egress gate.** `confidential` is set by a human and **never inferred**; it is the per-resource flag the egress control honours (FR-EGRESS-001). When `sensitivity` is `confidential`/`sensitive`/`restricted` but `confidential !== true`, `coreSchemaValidator` emits a non-blocking warning `base.confidential.egress_hint` (only `confidential: true` withholds from a remote model). The aging fields are consumed by `base doctor` (FR-DOCTOR-001: `review_due`/`expired`) and the context pack, which annotates «périmé depuis …» and demands exact citation of reference data (`buildContextPack`). Matches `coreSchemaValidator`. |

## Functional requirements - RANK (discovery) · see `ranker.md`

Owns: FR-RANK-*

| ID | Requirement |
|---|---|
| FR-RANK-001 | Field-weighted scoring: `id 80, route_text 70, title 50, description 30, keywords 25, path 10, body 5`, with an explainable `reasons[]`; sort by score desc then path asc; apply `limit`. `route_text` is present only when the Router enriches candidates. Matches `searchResources`/`lexicalRanker`. |
| FR-RANK-002 | Core scoring (`searchResources`) and keyword derivation (`deriveKeywords`) are **neutral**: no business-intent boosts and no `DOMAIN_KEYWORDS` table; a neutral project produces **no** `intent:` reason and no injected business keyword. Business intent lives in an adapter shipped with the example that needs it. |
| FR-RANK-003 | Scoring is a swappable `Ranker` port (`tools/core/rankers.mjs`): neutral `lexicalRanker` default + `keywordIntentRanker` helper (declarative `whenIncludes`/`require`/`boost`, or `when` fn). Rankers may be sync or async; `searchResources(root, query, {config})` awaits `composeRankers([lexicalRanker, ...config.rankers])`. A project re-adds intent boosts via `base.config` - never the core. |
| FR-RANK-004 | Optional `route_text` field - highest-signal, explainable reason `route:<term>` - scored by `lexicalRanker`, in-core `semanticHybridRanker`, or the external `@ai-swiss/base-ranker-semantic`; **inert when absent**, so general discovery is unchanged. Zero-dep `semanticHybridRanker` (token overlap + token-subset aliases + fuzzy dice + optional precomputed embeddings) composes via the same contract and is selectable in `base.config` (`{type:"semanticHybrid"}`). |

## Functional requirements - ROUTE (routing) · see `routing.md`

Owns: FR-ROUTE-*, NFR-ROUTE-*

| ID | Requirement |
|---|---|
| FR-ROUTE-001 | Derive a routing signal per resource: `deriveRoutingSignals` → `{route_text, avoid_text, route_scope, agent_path, reasons}`, `route_text` from a fallback chain (`use_when` → description → title → keywords → `## Quand utiliser` → path) plus optional `routing.examples`; `routing.avoid_when` becomes a negative signal. A pure function, **not a port** (Rule of Three). `tools/core/routing.mjs`. |
| FR-ROUTE-002 | Route `agent → process → resources` with **no required `domain` tier** (`agentDirOf` recovers the agent from the path). Only `type: agent`/`process` under a real `.ai/agents/<agent>/AGENT.md` are selectable; orphan processes and root `AGENT.md` files may be inventoried but are not returned as closed-list route candidates. Competences/templates/data/documents are context, never promoted to a primary workflow by a lexical match. |
| FR-ROUTE-003 | `routeRequest` filters weak request terms, then returns `routed | ambiguous | needs_clarification | out_of_scope` + a `reason_code` (`below_floor`/`competing_intents`/`no_clear_process`/`two_close_candidates`) - never a fabricated confidence. A `routed` result always has a real agent and process. Structural thresholds (`floor_score 30`, `top2_margin 20%`, `max_candidates 5`) are validated and configurable via `base.config` `routing`. Matches `decideRoute`. |
| FR-ROUTE-004 | Candidate scoring **reuses the `Ranker` contract** (`composeRankers`, enriched `route_text`, optional `ctx.mode="route"` for custom adapters) - no parallel ranking system. Built-in rankers distinguish routing through `route_text`, not through hidden mode-specific logic. |
| FR-ROUTE-005 | `base route "<demande>" --root <root>` and `base route-test --root <root> [--from fixtures.json]` (declarative JSON fixtures, non-zero exit on mismatch); MCP tool `route_request`; `base.routing.v1` registry as a deterministic projection (`base build routing-registry --root <root>`, derived signals only). The Router reads files in memory at runtime; the registry is an opt-in projection, not a runtime cache. Matches `routeRequest`/`runRouteTests`/`buildRoutingRegistry`. |
| FR-ROUTE-006 | Official semantic ranker adapter **package** for production routing (`@ai-swiss/base-ranker-semantic`), beyond the in-core zero-dep `semanticHybridRanker`, without adding model/cloud dependencies to the core. Accepts any embedding provider; ships an OpenAI-compatible provider (platform `fetch`) and an optional Ollama helper (`createOllamaEmbedder`, default `nomic-embed-text`). |
| FR-ROUTE-007 | Routing quality is protected by fixtures and synthetic scale/ambiguity tests: paraphrases, synonyms, counter-examples, near-duplicate processes, larger generated agent/process sets, and a realistic example (`exemples/routage-pme`) whose fixtures CI runs. |
| FR-ROUTE-008 | The semantic package is **production-grade**: per-call `timeoutMs`, `AbortSignal` (via `ctx.signal`), bounded retries on transient failures only (network/5xx/429/timeout) with exponential backoff + full jitter, `createBatchingEmbedder` (coalescing, bounded concurrency), a configurable `{has,get,set}` cache that does not retain rejected provider calls, strict vector validation (dimension mismatch fails loud by default), light `onMetric` observability (no text/vectors), and a typed-error taxonomy branchable on `.code` (`semantic.config|timeout|abort|response|auth|rate_limit|network|dimension`). Security: no business content leaves without an explicit provider (`SECURITY.md`). |
| FR-ROUTE-009 | Optional help **fallback**: `routing.fallback: { agent, process }` in `base.config` attaches a `fallback` pointer to an HONEST abstention (`out_of_scope`, or `needs_clarification` without a useful question) — never turning it into `routed`. Agent-agnostic (configured, never hard-coded); target resolved from inventory; a missing target attaches nothing and `validateBase` warns (`base.routing.fallback_unresolved`). Surfaced by the CLI formatter, the MCP `route_request` JSON, and the generated bootstrap. Matches `computeRoute`/`resolveFallback`/`instantiateFallback`; route fixtures assert `fallback`. |
| FR-ROUTE-010 | **Two strategies, one port, chosen by config.** Both strategies satisfy the same `Router` port and produce one `RouteDecision`; the caller never branches on which ran. `routingStrategy(routing)` is **all-or-nothing**: it returns `"embedding"` only when an `embedding_model` AND a `refiner_model` are both non-empty strings, else `"lexical"` — one alone is a misconfiguration, never a half-mode, so a project that never configures the pair never touches an embedding or LLM call. The embedding strategy is the Pipeline `embeddingRouter(retrieve, refine, k) = refine ∘ retrieve`, a single total expression (an empty corpus is the refiner's to answer). `tools/core/router.mjs`. |
| FR-ROUTE-011 | **Embedding-strategy retriever — broad recall by rank.** `makeEmbeddingRetriever({ embed, vectors })` embeds the query once, cosine-compares it to each routable resource's precomputed `route_text` vector, and returns the top-`k` candidates **by rank**, never by a tuned similarity cutoff (`k` is a count of how many the refiner sees; even the kth-best rides through). Only `agent`/`process` resources are candidates and `deprecated`/`archived` are skipped (mirrors the floor); a resource with no precomputed vector falls back to a lexical-overlap score mapped below any cosine match, so it ranks last rather than vanishing; an empty corpus retrieves nothing; an embed failure is not swallowed (the broker fails closed). Matches `makeEmbeddingRetriever`. `tools/core/retrieve.mjs`. |
| FR-ROUTE-012 | **Embedding-strategy refiner — enum-constrained, hallucination-proof.** `makeLlmRefiner({ complete })` asks the model (via the shared `completeJson`: temperature 0, one corrective retry, brace-matched extraction) for ONE structured decision over the candidates' «Quand l'utiliser»/«Éviter si» and maps it to a `RouteDecision`. The decision enum is closed — `select | needs_clarification | out_of_scope`; a `select` routes **only** to a `process_id` that is one of the candidate ids (an off-list or absent id → `needs_clarification` with `reason_code: "off_list_selection"`, never a route), so routing outside the retrieved, deny-filtered set is structurally impossible. An unparseable or unrecognised reply abstains rather than guessing; an empty candidate list is `out_of_scope` **without** a model call. Matches `makeLlmRefiner`. `tools/core/refine.mjs`. |
| FR-ROUTE-013 | **Embedding-strategy broker — fail-closed, deny upstream, shared resolution.** `createRouteBroker` prepares the corpus by applying the **deny pre-filter once upstream of BOTH strategies** (`denyFilterResources`), so a denied target reaches neither the deterministic floor, the embedding recall, nor the refiner's candidate list; then `routeWithStrategy` runs `routingStrategy` and, on the embedding strategy, resolves the embedder and refiner via the SAME shared model registry the eval harness uses (`resolveEmbedder`/`resolveModel`, injectable for tests). The embedding strategy is **fail-closed** (MECHANISM): any resolution/embed/refine error (model unreachable, missing vectors) drops to the lexical strategy — never throws, never silent — and the fallback is **recorded** as a trace event (`strategy_fallback: "embedding->lexical"`); each decision carries its `strategy`. Matches `routeRequest`/`routeWithStrategy`/`prepareCorpus`. `tools/core/route-broker.mjs`. |
| FR-ROUTE-014 | **A LABELED golden set + PURE scorers — the grading abstraction the eval rides on.** A labeled golden set (`tests/fixtures/route-eval-golden.json`) carries MANY phrasings per real route of a corpus — clear hits, paraphrases, `avoid_when` near-misses, out-of-scope (must abstain), ambiguous (must ask), and multilingual EN→FR — each labeled with its expected outcome (`route` to agent+process, or an abstention kind). PURE scorers (no I/O, no model, the same family as the base-eval judge) grade any measurement through ONE shape: `scoreCase`/`summarizeEval` (route = strict agent+process; abstention = honest non-route; separate TP/TN), `scoreRecall`/`summarizeRecall` (the expected process surfaced in the top-k?), `summarizeRefiner` (the per-model over-routes vs over-asks shape). A malformed set is rejected loudly (`validateGoldenSet`), never silently run. Pinned with no corpus and no model by `tests/route-eval-scorer.test.mjs`. The measured RUN of these scorers is FR-ROUTE-015. Matches `scoreCase`/`summarizeEval`/`scoreRecall`/`summarizeRecall`/`summarizeRefiner`/`validateGoldenSet`/`runRouteEval`/`runRecallEval`. |
| FR-ROUTE-015 | **An HONEST STRUCTURAL SIGNAL, not a model-performance target: retrieval recall@k + a per-model refiner diagnostic, Ollama-gated.** The headline is **recall@k** — model-INDEPENDENT: for each `route` case, embed the query, run the embedding retriever over the deny-filtered corpus, and check whether the EXPECTED process is in the top-`k` (no refiner). It reports overall + per-category recall (multilingual especially: does the embedder bridge an EN query to a FR `route_text`?). recall@k is honestly vacuous when `k` ≥ the corpus's process count (the top-`k` then holds every candidate); the discriminating signal is the RANK (recall@1), and recall@k earns its keep at scale where the catalogue dwarfs `k`. The refiner's final accuracy is DEMOTED to a per-model diagnostic, explicitly labeled model-dependent (two small refiners gave OPPOSITE failures on the same structure — over-routing vs over-asking, a ~26-point swing from the model alone), reported as the failure SHAPE (`forcedRoutes`/`forcedClarifications`), never floored. The final route/abstain runs on the user's OWN AI, far stronger than any local model here, so prompts and structure are NOT tuned to lift a small model's score (`NOT_A_TARGET_HEADER`, surfaced in the CLI and the eval module). Both legs are Ollama-gated on a real embedder + small refiner (defaults `qwen3-embedding:0.6b` + `qwen2.5:3b`, a fast non-reasoning refiner), SKIPPING cleanly when absent (`probeOllama`); never in the default suite (the smoke is opt-in via `ROUTE_EVAL_OLLAMA`, so `npm run check` does no model round-trips). Surfaced as `base route-eval [--ollama]` / `npm run route-eval:ollama`. Matches `runOllamaEval`/`makeRecallProbe`/`makeEmbeddingRoute`/`probeOllama`. |
| FR-ROUTE-016 | **The AGENT-IN-THE-LOOP eval — the lived route, faithfully simulated, as a DIAGNOSTIC.** Measures the path that DOMINATES in practice: the harness LLM (Claude Code) reading the generated index and choosing. An LLM gets EXACTLY what the harness gets — the routing consigne sourced verbatim from the canonical bootstrap (`ROUTER_INTRO`/`ROUTER_BODY`, so the eval can never drift from what the harness is told) as the system turn, the index content rendered over the deny-filtered corpus by the SAME `buildRoutingRegistry`/`renderRoutingIndex` the production index build uses (root → agents → processes, each with «Quand l'utiliser»/«Éviter si») as the user turn, and the query — and returns a chosen agent/process or an honest abstention (`route`/`needs_clarification`/`out_of_scope`). Its reply is mapped to a `RouteDecision` (`interpretAgentReply`) and graded by the SAME pure scorers as the refiner (`runRouteEval`/`summarizeRefiner`), so the two diagnostics are comparable. MECHANISM (mirrors the refiner): a route is accepted ONLY to an (agent, process) pair the index navigates (`navigableCorpus.resolve`) — an off-list or mismatched id abstains (`reason_code: "off_list_selection"`), never routes, so the model cannot invent a target. Model-configurable and HONESTLY LABELLED a per-model diagnostic, NOT a score: a small local model (Ollama-gated default `qwen2.5:3b`) is only INDICATIVE; the real routing runs on the user's far-stronger AI, so the consigne and index are NOT tuned to lift a small model's number (`NOT_A_TARGET_HEADER`, `printAgentDiagnostic`). Pure pieces pinned model-free by `tests/route-eval-agent.test.mjs`; the measured RUN rides the same opt-in Ollama smoke as recall@k (`ROUTE_EVAL_OLLAMA`, never in `npm run check`). Surfaced in `base route-eval --ollama` alongside recall@1/recall@k and the refiner. Matches `renderAgentRoutingPrompt`/`interpretAgentReply`/`navigableCorpus`/`makeAgentRoute`/`makeAgentRouteForCorpus`/`makeOllamaAgentRoute`. `tools/eval/route-eval-agent.mjs`. |
| NFR-ROUTE-001 | No hand-maintained routing catalogue: routing is derived from the files; the registry is generated, never a source of truth. |

## Functional requirements - SCALE (optional local index) · see `routing.md`

Owns: FR-SCALE-*

| ID | Requirement |
|---|---|
| FR-SCALE-001 | Optional `@ai-swiss/base-index-local` package - a derived inverted index, **not a dependency of the core**. `buildIndex(resources, {deriveSignals, embed?})` projects a postings index from inventory + derived routing signals; `searchIndex` is a fast standalone finder. The core's in-memory `routeRequest` stays the default for small/medium corpora. |
| FR-SCALE-002 | The index is a **projection, never a source of truth**: deterministic (sorted, timestamp-free) so a rebuild is byte-identical (freshness-gateable), and **deletable** - `saveIndex`/`loadIndex` persist a single JSON artifact you can erase and regenerate. Determinism covers derived signals only, not runtime semantic scores. |
| FR-SCALE-003 | `routeWithIndex(index, request, {rank, decide, routeTerms, routeAvoidReasons, thresholds})` reuses BASE's injected `Ranker` and Router. By default it scores every routable document stored in the index, so an indexed route returns the same status/agent/process/reason_code as in-memory routing, including semantic rankers without lexical hits. `candidateMode:"lexical"` is an explicit speed/recall trade-off for lexical-compatible rankers. |
| FR-SCALE-004 | Reproducible benchmarks (`base-index-local bench`, sizes 100→50 000) with cold/warm search; a CI smoke runs without fragile thresholds. Heavy sizes are reproducible locally. Report: `docs/guides/benchmarks-echelle.md`. |

## Functional requirements - POLICY (permissions) · see `policy.md`

Owns: FR-POLICY-*

| ID | Requirement |
|---|---|
| FR-POLICY-001 | `canAccessResource(resource, action, ctx)` returns `{decision, reason}` with `decision ∈ allow|deny|needs_approval`. **read:** `metadata` projection always `allow`; `restricted` full read without `purpose`/`confirmed` → `deny`; `confidential`/`sensitive`/`restricted` → `needs_approval`; else `allow`. **execute:** dry-run `allow`; `requires_confirmation !== false && !confirmed` → `deny`; `sensitive`/`restricted` && `!confirmed` → `deny`; else `allow`. **write:** `sensitive`/`restricted` && `!confirmed` → `deny`; `confirmed` → `allow`; resource `requires_confirmation === false` → `allow`; else `needs_approval`. else `deny`. (Enforced by the propose/commit flow - `writes.md`.) |
| FR-POLICY-002 | The broker enforces `deny` (throws) for mediated reads/executes; `needs_approval` proceeds (advisory default). |
| FR-POLICY-003 | Policy is a **swappable `PolicyEnforcer` port** (`tools/core/policy.mjs`): default `advisoryPolicy` (= FR-POLICY-001), reference `strictPolicy({grants})` that denies unconfirmed writes + gates `restricted` reads behind a grant. The broker resolves `config.policy` via `decide()` at every read/write/execute site (`openResource`/`invokeTool`/`proposeChange`/`commitChange`). Integration-tested: a `base.config` policy swaps enforcement without forking. |

## Functional requirements - EGRESS (model-locality control) · see `egress.md`

Owns: FR-EGRESS-*, NFR-EGRESS-*

The security differentiator: a confidential resource, or any resource of a `local-only` root, never reaches a remote model — and every withholding is **said**, never silent.

| ID | Requirement |
|---|---|
| FR-EGRESS-001 | **The one egress rule.** `checkEgress({modelLocality, rootPolicy, resources})` is the single decision: a `local` model receives everything; a `remote` model is denied every resource of an `egress: local-only` root (reason `root_local_only`) and every resource with `confidential === true` (reason `confidential`), and allowed the rest, returning `{allowed, withheld:[{resource, reason}]}`. `rootPolicy` defaults to `any`; `rootEgressPolicy(rootDir)` reads `egress` from `base.config.json` (exactly `"local-only"`, else `"any"`; any read failure → `"any"`) because the config merge drops the key. Zero-dependency. Matches `checkEgress`, `rootEgressPolicy`. |
| FR-EGRESS-002 | **Withholding is announced, never silent.** `egressNotice(withheld)` returns `""` when nothing is held, else a human-readable line stating the count, splitting `confidential` from `local-only` documents and giving the remedy (choose a local model). Every surface that withholds substitutes or appends this notice. Matches `egressNotice`. |
| FR-EGRESS-003 | **Read & write chokepoint.** When a caller supplies an `egress` context, the broker enforces the rule at every model-facing surface: `openResource`/`accessResource` replace withheld content with the notice and strip the resource sibling (no `content`/`body`/`description`/`title`/`metadata` leaks); `searchResources`/`routeRequest`/`inventoryResources`/`listMarkers` hide a withheld resource's very existence; `invokeTool` refuses a confidential/local-only tool before resolving its entrypoint; `proposeChange` withholds the diff and `promoteResource` treats the resource as not-found. The local CLI passes no `egress` context (trusted human) and is unchanged. Matches `egressWithheld`. |
| FR-EGRESS-004 | **MCP defaults to remote.** The MCP read surface builds its egress context via `mcpEgress`: `modelLocality` is `remote` unless `BASE_MCP_ALLOW_CONFIDENTIAL=1` (asserting a local client), `rootPolicy` via `rootEgressPolicy`; every MCP broker entry threads it, so a connecting cloud model is treated as remote by default. Matches `mcpEgress`. |
| NFR-EGRESS-001 | **One control point.** The egress decision exists only in `tools/core/egress.mjs` (`checkEgress`/`egressNotice`) and the broker's single `egressWithheld` wrapper; the chat surface, the eval harness, and the MCP read surface import the same rule rather than re-implementing it, so the guarantee cannot diverge by surface and no withholding is silent. Matches `checkEgress`. |

## Functional requirements - CLI · see `cli.md`

Owns: FR-CLI-*

| ID | Requirement |
|---|---|
| FR-CLI-001 | Commands: `validate`, `index`, `discover`, **`route`**, **`route-test`**, `inventory`, `open`, `access`, `invoke`, `init`, `doctor`, `entretien`, `trace`, `help`, **`propose`**, **`commit`**, **`promote`**, **`markers`**, **`build`**, `docs`, `studio`, `whereis`, `update`. Matches `tools/base.mjs`. See `routing.md`, `writes.md`, `build.md`, `maintenance.md`, and FR-INIT-* / FR-DOCTOR-* / FR-DOCS-*. |
| FR-CLI-002 | Flags: `--root`, `--workspace`, `--root-id`, `--json`, `--limit` (`discover`/`route`), `--projection {metadata,instructions,full}`, `--execute`, `--confirmed`, `--grant-token`, `--purpose`, **`--write`** (build), **`--to <scope>`** (promote), **`--from <file>`** (propose; else stdin, and `route-test` fixtures), **`--config <path>`** (`validate`/`discover`/`route`/`route-test`), **`--yes`** (init), **`--public`**/**`--out <dir>`** (docs). |
| FR-CLI-003 | `validate` and `entretien` exit `1` when not ok; `doctor` exits `1` on any error-severity finding (FR-DOCTOR-002); others exit `0` on success, `1` on thrown error (message to stderr). |
| FR-CLI-004 | `--config <path>` points `validate`, `discover`, `route` and `route-test` at a confined `base.config.{json,mjs}` (resolved once, passed as `{config}`); policy/auth commands resolve config from the project root. |
| FR-CLI-005 | Without explicit `--root`/`--workspace`, CLI resolves the nearest BASE root from `.ai/` or `base.manifest.json`, then the nearest `base.workspace.json`; human-readable output prints the selected context. Workspace routing can search all declared roots and returns `ambiguous` on competing roots. |
| FR-CLI-006 | **Progress at the right level — which stage, roughly how far; never noise, never silence.** A long CLI leg reports on **stderr** (the result stays on stdout, so `--json`/pipes/MCP stay clean), via one convention, `reportProgress(stage)` → `(done, total, label?)` rendering `[done/total] stage · label`: **silent** unless a TTY or `BASE_PROGRESS` is set, rewriting in place (`\r`) on a TTY. `runOllamaEval` reports its embedder pull and each of its three legs (recall/agent/refiner); `precomputeRoutingVectors` reports each embed (`base build`); `validateBase` announces one stage line **always** and a per-resource `[i/N]` counter **only** above ~300 resources (below it a counter is noise); `startStudioServer` announces context resolution then the bind; `docs build` keeps Astro's real stage lines and drops its per-route lines. Matches `reportProgress`. |

## Functional requirements - INIT (bootstrap & perimeter) · see `cli.md`

Owns: FR-INIT-*

| ID | Requirement |
|---|---|
| FR-INIT-001 | **Perimeter detection.** `detectPerimeter(dir)` classifies a directory into one of five mutually-exclusive kinds, in strict order: `workspace` (a `base.workspace.json`), `root` (any `.ai/agents/<id>/AGENT.md`), `collection` (≥ 2 direct sub-roots), `loose` (≥ 1 non-`README` `.md` at depth ≤ 1), else `empty`; scans skip `.git`, `node_modules`, `.base-docs` and dot-dirs; for `loose`/`empty` it records which bootstrap artifacts already exist on disk. Matches `detectPerimeter`. |
| FR-INIT-002 | **Pure init plan + canonical scaffold.** `buildInitPlan(detection, {dirName, now, frameworkDir})` returns the exact files to create as `[{path, content, reason}]` and reads nothing: `[]` for `root`/`workspace`; a single `base.workspace.json` for `collection` (first sub-root `default: true`); for `loose`/`empty` a full root in fixed order (`.ai/agents/<slug>/AGENT.md`, `base.config.json`, `.ai/base.mjs`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/assistant.mdc`, `BASE_BOOTSTRAP.md`, `.ai/tools.md`) whose tool artifacts carry the shared renderers verbatim (`renderClaudeMd`/`renderAgentsMd`/`renderCursorRule`/`renderBootstrapMd`/`renderToolMatrix`, `LAUNCHER_SOURCE`) and exclude already-existing artifacts. Matches `buildInitPlan`. |
| FR-INIT-003 | **Creation-only application.** `applyInitPlan(dir, plan)` writes each entry with the filesystem `wx` flag so the filesystem itself refuses to overwrite; an `EEXIST` entry is skipped and reported under `skipped`, any other error re-thrown; returns `{created, skipped}`. Never destroys a user-authored file. Matches `applyInitPlan`. |
| FR-INIT-004 | **CLI gate + root healing.** `base init` resolves `--root` else the current directory, runs detection, and prints the plan **without writing** unless `--yes`; on an existing `root` it plans only the missing tool artifacts (creation-only, so a hand-edited `CLAUDE.md` is untouched); `init` needs no existing BASE and skips strict context resolution; `--json` emits `{detection, plan, applied}`. Matches `runInit`. |
| FR-INIT-005 | **Shared with Studio, server-side rebuild.** Studio's Welcome screen reuses the same three functions; `initPerimeter` recomputes the plan **server-side** from the stored detection (the browser sends no content) and applies it creation-only, refusing with `CONFLICT` when the directory is already a BASE or the plan is empty. Matches `initPerimeter`. |

## Functional requirements - MCP · see `mcp.md`

Owns: FR-MCP-*

| ID | Requirement |
|---|---|
| FR-MCP-001 | Tools: `load_agent`, `discover_resources`, **`route_request`**, `open_resource`, `access_resource`, `invoke_tool`, **`propose_change`**, **`commit_change`**, **`promote_resource`**, **`list_markers`**, **`report_friction`** (write-gated, FR-FEEDBACK-003). Router primitives delegate to the broker via `base-core-adapter`. Matches `mcp/src/index.ts`. |
| FR-MCP-002 | `load_agent` returns a **lazy bootstrap** (`AGENT.md` + resource catalogue + data references), never a bulk dump. Agent discovery scans the configured root and nested BASE project roots, where a project root is any non-skipped directory containing `.ai/agents/*/AGENT.md`; each discovered agent keeps its own `projectRoot`. |
| FR-MCP-003 | Transports `stdio` (default) and `http`; HTTP binds `127.0.0.1:3100` by default; stateless server-per-request. CLI flags include `--root`, `--workspace`, `--root-id`, `--transport`, `--port`, `--host`, `--read-only`, `--read-write`, `--log-level`. Tool responses include selected root/workspace scope when available. |
| FR-MCP-004 | **No bulk-dump tool.** The only agent loader is the lazy `bundleAgentBootstrap`; there is no bulk `bundleAgent`/`bundleData`/`bundleDirectory` tool (a whole-agent export, if ever added, is an explicit `export_agent` tool with a confined recursive walk). Matches `bundleAgentBootstrap`. |
| FR-MCP-005 | `AuthProvider` port (`mcp/src/auth.ts`): `noAuth` default + loopback; `bearerTokenAuth` reference (`BASE_MCP_BEARER_TOKEN`); project `config.auth` function or descriptor; `authMiddleware` on `/mcp`; non-loopback refusal lifted when auth is configured (else `BASE_MCP_ALLOW_INSECURE_REMOTE=1`). On a loopback bind, `/mcp` also refuses cross-origin / DNS-rebinding requests (non-loopback `Host` or foreign `Origin`) with 403 before auth (`crossOriginError`, `transport.ts`), mirroring the Studio; skipped on a deliberate non-loopback bind where auth is the control. |

## Functional requirements - STUDIO (the local workshop UI)

Owns: FR-STUDIO-*

| ID | Requirement |
|---|---|
| FR-STUDIO-001 | **One mediated review, every door.** A manual edit (⌘S) and an AI proposal both enter a single review rendered as the document-with-changes in the editor's own frame; the human keeps or undoes individual blocks. Applying is the ONLY write path: a full selection commits the staged change as-is, a partial selection rebuilds the document from the kept blocks and re-enters the same gate. Refusing writes nothing and loses no keystroke. Rides the broker contract (FR-CHANGE-001/002/003). Matches `ResourceCard`/`DocumentDiff` + `propose`/`commit`. |
| FR-STUDIO-002 | **Edit with AI, through the same gate.** The chat co-thinker proposes via `propose_document`, which returns a diff and writes nothing until the human applies it in the review; its read tools are confined to the root; the on-screen draft is session truth; the conversation compacts under a token budget. The chat has no private write path. Matches `chat` (`tools/studio`). |
| FR-STUDIO-003 | **Evaluation launch as a server-side queue, across agents.** The launcher selects one or several processes, which may span more than one agent; the selection normalizes to a flat list of `(agentId, processId)` targets, and the one-at-a-time engine runs them in sequence under each target's own agent (a single in-flight run, `409` on overlap). The status reports both the batch position (`batchIndex`/`batchCount`) and the in-process progress (`done`/`total`). A single `processId` (relaunch), a single-agent `processIds` batch, and a cross-agent `targets` list all share the one path. Matches `startEvaluation`/`evalStatus` (`normalizeTargets`). |
| FR-STUDIO-005 | **Edit the workspace from the UI.** `PUT /api/workspace` (gated like every write) replaces the workspace's roots from the editor: each declared path must resolve to a real BASE root (else `400`), the manifest is rewritten with paths relative to its own directory, and the served context is re-resolved in place so the change takes effect without a restart. Matches `server` (`PUT /api/workspace`) + `writeWorkspace`. |
| FR-STUDIO-004 | **The settings file is named, with its scope.** `GET /api/settings` reports the active settings file (`file`) and whether one root owns it or a workspace shares it (`scope`), so the editing surface always names the exact `.ai/studio.settings.json` in play and the per-workspace resolution is never ambiguous. Secrets never transit the page (a provider names an env var; the server answers a boolean). Matches `server` (`GET /api/settings`). |
| FR-STUDIO-006 | **Réglages reads as a guided surface.** The settings page presents each provider with per-model display names (shown as an alias on the model card), names the default models by their role with the role explained (simulated user, judge), and turns a provider-test failure into actionable French through a code→message registry (a missing key names the exact env var to export). Removing a provider scrubs the defaults and aliases that pointed at it, so no setting dangles. Rides the no-secret contract of FR-STUDIO-004. Matches `Settings`/`copy` (`PROVIDER_ERRORS`) + `settings` (`testProvider`). |

## Functional requirements - DOCTOR (corpus health) · see `maintenance.md`

Owns: FR-DOCTOR-*

| ID | Requirement |
|---|---|
| FR-DOCTOR-001 | **Corpus-health projection.** `diagnose(root)` loads inventory + on-disk files + mtimes + eval runs (`.ai/experiments/runs`) + open frictions + aggregated abstentions and hands them to the pure `diagnoseData(...)`, which returns findings `[{severity, type, path, message, fix_hint}]` touching no disk. Eight finding kinds: `dead_link` (error — a broken **Markdown link**; an illustrative `code` path is not a link), `orphan` (error under `.ai/agents/` — a competence or template no agent/process reaches, i.e. invisible knowledge; a docs page filed under a section directory `docs/<section>/…` is exempt, its reachability being owned by the documentation graph; a generated artifact is exempt by **provenance** (a first-line header «Généré par … Ne pas éditer», e.g. the routing indexes `.ai/agents/<id>/index.md` that `base build routing-index` emits, reachable by convention) while a hand-written `index.md` without that header stays flagged; `warn` for any other unreferenced context resource, e.g. a loose top-level docs page), `review_due` (warn), `expired` (error), `stale_eval` (warn), `open_friction` (warn), `missing_tool_artifacts` (warn), `recurring_abstention` (warn — a normalized request the router abstained on ≥ 3 times, a process waiting to exist); every finding carries a mandatory fix hint and one of two severities (`error`/`warn`). Matches `diagnoseData`. |
| FR-DOCTOR-002 | **Two doors, error-gated exit.** The CLI `base doctor [--json]` and Studio's `GET /api/doctor` both call `diagnose(root)`; `--json`/the API return the findings array, the CLI renders them (`formatDiagnosis`) and sets exit `1` when any finding has `severity: "error"`, else `0`. Matches `diagnose`. |

## Functional requirements - TRACE · see `trace.md`

Owns: FR-TRACE-*

| ID | Requirement |
|---|---|
| FR-TRACE-001 | `recordEvent(root, event)` appends one JSON line to `.ai/trace/YYYY-MM-DD.jsonl`; fields per `trace.md`; failures are swallowed (NFR-CORE-007). |
| FR-TRACE-002 | `summarizeTrace(root)` aggregates `{events, by_operation, by_resource, denied, errors}`. |

## Functional requirements - CONFIG (extension) · see `architecture.md`

Owns: FR-CONFIG-*

| ID | Requirement |
|---|---|
| FR-CONFIG-001 | `resolveConfig(root, {configPath})` loads an optional `base.config.json` (preferred, declarative) or `base.config.mjs` (executable), confined, returns a complete `{rankers, validators, policy, auth, routing}` merged over `DEFAULTS`; absent → defaults. Declarative descriptors include `keywordIntent`, `semanticHybrid`, `routability`, strict/advisory policy, bearer auth and validated routing thresholds. `tools/core/config.mjs`. |
| FR-CONFIG-002 | Config is **code/data loaded only from the confined project root** (or an explicit confined `--config`), never from resource data; malformed config fails loudly with `base.config.invalid`. JSON is the safe beginner path, MJS is trusted project code (NFR-CORE-003). |
| FR-CONFIG-003 | Injection contract (no breaking change): each broker function takes an optional `{config}` override (resolving from `root` by default), wired at every port. See `architecture.md` §"Config injection". |
| FR-CONFIG-004 | Stable error-code registry `tools/core/codes.mjs` (`CODES`, `codeMessage`, `registerCodes`) decouples codes from FR-language messages; exposed as the `./codes` package export so third-party adapters can register custom codes without forking. |
| FR-CONFIG-005 | Locale-independent ordering `tools/core/ordering.mjs` (`compareByCodePoint`) keeps derived projections stable across host ICU/locale configurations; exposed as the `./ordering` package export. `@ai-swiss/base-index-local` carries a deliberate import-free copy; the root test suite enforces parity. |

## Functional requirements - CHANGE (mediated writes) · see `writes.md`

Owns: FR-CHANGE-*

| ID | Requirement |
|---|---|
| FR-CHANGE-001 | `proposeChange(root, target, content, {purpose})` confines `target`, computes a `write` decision from the target's `sensitivity`/`requires_confirmation`, stores a change record `.ai/changes/<chg_id>.json` (with `base_hash`), **writes nothing to the target**, and returns `{change_id, target, exists, decision, diff}`. Traces `op:"propose"`. |
| FR-CHANGE-002 | `commitChange(root, change_id, {confirmed})` re-confines, re-decides (`deny`→fail; `needs_approval`&&`!confirmed`→fail), enforces a **TOCTOU guard** (current hash must equal `base_hash`, else fail), writes, **verifies** the written content, deletes the record, traces `op:"commit"`. |
| FR-CHANGE-003 | All broker/CLI/MCP writes go through propose→commit; `.ai/changes/` is local runtime state, not an inventoried resource. |

## Functional requirements - PROMOTE · see `writes.md`

Owns: FR-PROMOTE-*

| ID | Requirement |
|---|---|
| FR-PROMOTE-001 | `promoteResource(root, idOrPath, toScope, {purpose})` validates `toScope` (and `!=` current), upserts frontmatter (`scope`, `promoted_from`, `promoted_at`; ensures the minimal team contract), and routes through `proposeChange` → a reviewable diff applied on commit. CLI `promote --confirmed` auto-commits. |

## Functional requirements - FEEDBACK (field-feedback loop) · see `mcp.md`

Owns: FR-FEEDBACK-*

| ID | Requirement |
|---|---|
| FR-FEEDBACK-001 | **Friction reports — dated, creation-only.** `reportFriction(root, {process, summary, detail?, via?, now?})` writes one Markdown file `.ai/feedback/<stamp>_<slug>.md` (frontmatter `process`/`reported`/`via`/`status: open`; body `# summary` + detail) with the `wx` flag (create-never-modify; name collisions get a `-2`,`-3`… suffix); throws on empty `process`/`summary`; returns `{path}`. Matches `reportFriction`. |
| FR-FEEDBACK-002 | **Abstention journalling is the adapter's job; the broker stays pure.** `appendAbstention(root, {query, verdict, suggestion?, at?})` appends one JSON line to `.ai/feedback/abstentions.jsonl`; `isAbstention(status)` is true only for `out_of_scope`/`ambiguous`/`needs_clarification`. `routeRequest` performs no I/O; on the single/selected-root path the CLI `base route` and the MCP `route_request` call `appendAbstention` after an honest abstention (the multi-root branches do not journal). Matches `appendAbstention`, `isAbstention`. |
| FR-FEEDBACK-003 | **`report_friction` MCP tool — write-gated.** The MCP server registers `report_friction` only when not read-only, delegating to `reportFriction`; parameters `process`, `summary`, optional `detail`/`via`/`root_id`; returns `{path}` with the selected scope. Matches `brokerReportFriction`. |
| FR-FEEDBACK-004 | **The field pile, read side.** `readFeedback(root, {status?})` returns `{frictions, abstentions}`: frictions parsed from `.ai/feedback/*.md` filtered by `status` (default `open`) newest-first; abstentions aggregated from `abstentions.jsonl` by `normalizeQuery` into `{query, verdict, count, lastAt}`; unreadable/missing entries skipped. `normalizeQuery` lowercases, strips diacritics, and collapses non-alphanumerics to single spaces. Powers `base doctor` (FR-DOCTOR-001) and Studio. Matches `readFeedback`, `normalizeQuery`. |
| FR-FEEDBACK-005 | **Resolving a friction is an ordinary gated edit.** `resolveFriction(root, relPath)` refuses a path outside `.ai/feedback/` (`BAD_REQUEST`) or a missing file (`NOT_FOUND`), then re-serialises the entry with `status: resolved` through propose→commit; the creation-only exemption never extends to status edits. Matches `resolveFriction`. |

## Functional requirements - MARKERS · see `maintenance.md`

Owns: FR-MARKERS-*

| ID | Requirement |
|---|---|
| FR-MARKERS-001 | `listMarkers(root)` returns typed open markers `[{path, line, type, text}]` (`A VALIDER`/`A COMPLETER`/`ATTENTION`/`DECISION`) from **business** files only (skips `isMarkerReferencePath`: `.ai/agents/`, `docs/`, `specs/`, `tests/`, `tools/`, `mcp/`, READMEs, tests), sorted by priority. Powers the session status-line UX. Traces `op:"markers"`. |

## Functional requirements - BUILD (derived artifacts) · see `build.md`

Owns: FR-BUILD-*

| ID | Requirement |
|---|---|
| FR-BUILD-001 | `buildArtifacts(root, {targets})` projects derived artifacts from the inventory: `agents-md` → repo-root **`AGENTS.md`** (cross-tool agent index, excludes `_template`); `tools` → `.ai/tools.md` (**honest per-harness enforcement matrix**, levels 0–3). |
| FR-BUILD-002 | `writeArtifacts(root, artifacts)` writes each (confined), traces `op:"build"`. CLI `base build [target] [--write]` is **dry-run by default**. |
| FR-BUILD-003 | Generated artifacts are confined, traceable projections and do **not** go through propose→commit; source edits still use mediated writes. |
| FR-BUILD-004 | `base build routing-registry` projects `.ai/routing/registry.json` (`base.routing.v1`) from derived routing signals. It is deterministic for those signals, excluded from inventory, and not part of `build all`. |
| FR-BUILD-005 | `base build bootstrap` projects the **four harness entry points** - `CLAUDE.md`, `BASE_BOOTSTRAP.md`, `.cursor/rules/assistant.mdc`, and the head of `AGENTS.md` - from **one** canonical router body in `tools/core/bootstrap.mjs` (`renderClaudeMd` / `renderBootstrapMd` / `renderCursorRule` / `renderAgentsHeader`). The body is agent-agnostic (route-first, no hard-coded default agent); part of `build all`; CI freshness-gated so the four cannot drift. |

## Functional requirements - DOCS (documentation model & site) · see `docs.md`

Owns: FR-DOCS-*

| ID | Requirement |
|---|---|
| FR-DOCS-001 | `base docs model` builds a deterministic `base.docs_model.v1` projection (resources, graph, navigation, search documents, route fixtures with build-time route results, warnings, errors) and writes its projections (`model.json`, `graph.json`, `navigation.json`, `search.json`, `route-fixtures.json`, `warnings.json`). Excludes `.plans/`, `.temp/`, `.reviews/` and generated outputs. |
| FR-DOCS-002 | The `public` target keeps only resources publishable as public documentation and strips internal paths from route results; `base docs build --public --out <dir>` produces a deployable static site from that model. |
| FR-DOCS-003 | The site sidebar is generated from the navigation projection, never hand-maintained. Sidebar is navigation, not inventory: machine files (JSON outside `specs/`, repo templates), the `operations` section, README variants, manifesto translations, the raw `LICENSE` and generated harness artifacts are excluded (the Explorer and search serve them); the `reference` catch-all is split by reading intent (reference docs, project pages, current specs, package front doors); sections may pin a reading order by canonical path with unpinned pages following in model order, the start section nests the installer pages under one group, each example nests as one group labelled by its front door, and the previous/next rail follows the sidebar order; labels are unique within a group via path-context disambiguation; chrome is bilingual (French root locale, English under `/en/`) while content keeps its source language. |
| FR-DOCS-004 | Resource pages render the canonical source content first, with metadata, backlinks and route examples in a collapsible panel. Heading anchors equal the model's heading slugs; internal Markdown links are rewritten to resource pages when the target is modeled, to the repository URL otherwise. The model **validates** those anchors: a link to `#slug` whose slug is not a heading of the target resource (or, for a same-page `#…` link, of the page itself) fails the model as `base.docs.broken_anchor`, the way a missing file fails it as `base.docs.broken_link` — so deep links stay aligned. |

## Risk controls (RC) — security & safety invariants

Owns: RC-*

The invariants that protect the user. Each is a **first-class control with a stable `RC-*` ID**, so an auditor (or a refactor) can `grep -r RC-EGRESS-001` and reach the control, the requirement(s) that implement it, and the test(s) that prove it. A control is **implemented by** the requirement(s) named and **proven by** the tests that cite its `RC-*` ID (see `requirements-matrix.md`); de-scoping a control keeps its ID.

| ID | Invariant | Implemented by |
|---|---|---|
| RC-CONFINE-001 | Local path confinement (no traversal / outward symlink) | FR-CORE-004 |
| RC-WRITE-001 | Mediated writes: propose→commit, TOCTOU guard, post-write verify | FR-CHANGE-001, FR-CHANGE-002 |
| RC-WRITE-002 | A proposal cannot grant its own write exemption | FR-POLICY-001, FR-CHANGE-001 |
| RC-EXEC-001 | Tool execution: dry-run default + explicit confirmation | FR-CORE-007, FR-POLICY-001 |
| RC-TRACE-001 | Trace/logs carry no business content by default | NFR-CORE-008 |
| RC-EGRESS-001 | Confidential / local-only never reaches a remote model | FR-EGRESS-001, FR-EGRESS-003, FR-EGRESS-004 |
| RC-EGRESS-002 | Egress withholding is announced, never silent | FR-EGRESS-002, NFR-EGRESS-001 |
| RC-EGRESS-003 | `confidential` is human-set, never inferred | FR-ONTOLOGY-002 |
| RC-INIT-001 | Bootstrap never overwrites a user file (creation-only) | FR-INIT-003 |
| RC-INIT-002 | Studio init rebuilds plans server-side (no client-supplied writes) | FR-INIT-005 |
| RC-FEEDBACK-001 | Field journal is append-only at creation | FR-FEEDBACK-001 |
| RC-MCP-001 | Remote MCP refused without configured auth | FR-MCP-005 |

## Architecture decisions (AD)

Owns: AD-*

The one-line rationale below is the index of each architecture decision. AD-* IDs are immutability-tracked like every stable ID, but they record a decision rather than a behaviour, so they carry no proof row in the matrix.

| ID | Decision | Rationale |
|---|---|---|
| AD-CORE-001 | **Ports & Adapters** with five explicit extension points (FrontmatterParser, Validator, Ranker, PolicyEnforcer, AuthProvider). | One pattern resolves discovery bias, extensible validation, real permissions, and auth coherently; core stays minimal (UR-CORE-003, NFR-CORE-005). |
| AD-CORE-002 | **`base-core.mjs` stays a façade** re-exporting everything; extension modules live in `tools/core/*.mjs`. | The MCP adapter imports `../../tools/base-core.mjs`; preserving its exports = zero breakage (NFR-CORE-002). |
| AD-PARSE-001 | **Strict-subset frontmatter parser, zero-dependency** (not a YAML library). | Frontmatter is a constrained header, not arbitrary YAML; preserves NFR-CORE-001 while removing silent mis-parse. |
| AD-CORE-003 | **Deterministic manifest** (no `generated_at`), kept committed + CI freshness gate. | Makes the derived index verifiable by regeneration (NFR-CORE-009). |
| AD-CONFIG-001 | **Internal config resolution from `root`** + optional `{config}` override. | Adds extension wiring without changing public signatures (NFR-CORE-002). |
| AD-CHANGE-001 | **Two-step mediated writes** (propose→commit) with `base_hash` TOCTOU guard + post-write verification + change records under `.ai/changes/`. | Makes "AI generates, human validates" a real gate, observable and reversible-by-review, not a convention (convention→contract for writes). |
| AD-BUILD-001 | **Derived artifacts as projections** (`AGENTS.md`, tool matrix) via `base build`, regenerable, never source of truth. | Harness compatibility + an honest conformance matrix that can't drift from the code (vision plane "Index = scale"). |
