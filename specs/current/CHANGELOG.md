# Changelog - BASE engineering specs

All notable changes to the BASE **engineering specification** are recorded here.
Format follows the spirit of Keep a Changelog. Versions follow semver (see `../README.md`).

## [1.0.0] - 2026-06-25

First public specification of BASE. It documents the **implemented** Ports & Adapters architecture (not a plan) and is verified against the code it describes. The living spec is `specs/current/`; earlier states live as git tags, never a copied tree.

### Deterministic routing: floor, agent-native index, declarative deny, optional embeddings (routing.md, ranker.md)
- **Floor hardened.** Short terms (≤ 3 chars) match a whole word, not a bare substring (no more «me» inside «commerciale»); the margin rule is one shared primitive (`decideAmong`/`isTooClose`) for the agent, process and workspace-root decisions; the workspace near-tie bug fixed (a clearly-dominant root routes). Scores stay explainable weighted sums — **not** normalised to `[0,1]` (a fake confidence the design rejects; the decision is already ratio-based).
- **Generated index** (`base build routing-index`): the registry projected into an agent-readable markdown tree (root → agent → process, with «Quand l'utiliser»/«Éviter si»), committed and CI-gated for freshness; the router body reads it by progressive disclosure and reconciles with the deterministic router on disagreement.
- **Declarative routing `deny` policy** (`route-policy.mjs`, monotone fold): `deny` is a veto applied upfront in `decideRoute`, so a denied target is absent from the decision AND the candidate shortlist, and omitted from the generated index (agent + root level) — the invariant holds across every routing path. The MCP direct-load veto is a tracked follow-up.
- **Fail-closed composition** (`safeRank`): a ranker that throws degrades to the lexical floor, never an exception to the caller.
- **Two routing strategies** (`route-broker.mjs`, `router.mjs`): the lexical strategy is the deterministic lexical floor (default, no model); the embedding strategy (opt-in, on only when BOTH an embedding and a refiner model are configured) retrieves the `k` best candidates by embedding rank, then a small LLM refines — fail-closed to the lexical strategy on any error. `base build routing-embeddings` precomputes the routing vectors (a cross-invocation cache) for the shipped `@ai-swiss/base-ranker-semantic` package, consumed by the embedding strategy's retriever.

### Spec discipline & de-staling
- **Statusless truth.** Purged build/history status from the chapters (`Built.` / `(Fixed)` / `(Done, 0B)`; `## Acceptance (all green)` → `## How it's proven`; the routing `Planned` section → a present-tense "out of the core" boundary). Every chapter declares the ID namespace it `Owns:`.
- **De-staling.** Shipped-but-unspecified core features now carry first-class, test-traced requirements: **EGRESS** (`FR-EGRESS-001..004`, `NFR-EGRESS-001`, new `10_core/egress.md`), **DOCTOR** (`FR-DOCTOR-001..002`), **INIT** (`FR-INIT-001..005`), **FEEDBACK** (`FR-FEEDBACK-001..005`), **ONTOLOGY** (`FR-ONTOLOGY-001..002`). `FR-CLI-001` and `FR-MCP-001` lists corrected (`init`/`doctor`/`docs`; `report_friction`).
- **Proof strength + ratchet.** Every requirement gets a row in `requirements-matrix.md` with a status column (✅ proven, ⚠️ weak `ID~weak[reason]`, ❌ GAP, ⊘ de-scoped); the count is 110/110 proven, 2 weak, 0 gap. A weak proof must carry a bracketed reason, a skipped/todo test never counts as strong, and `requirements-matrix.mjs --ratchet` fails any change that raises the weak or gap count against the baseline (proof quality is monotone). The ID grammar lives in one place, `tools/spec/id-grammar.mjs`, shared by every gate.
- **Risk controls are first-class IDs.** The security and safety invariants become an `RC-*` ID class (`RC-CONFINE-001`, `RC-WRITE-*`, `RC-EGRESS-*`, `RC-EXEC-001`, `RC-TRACE-001`, `RC-INIT-*`, `RC-FEEDBACK-001`, `RC-MCP-001`), each implemented by named requirements and proven by the tests that cite it: `grep -r RC-EGRESS-001` reaches the control, its requirement, and its proof.
- **IDs allocated by tooling.** `tools/spec/new-id.mjs` (`npm run spec:new -- FR EGRESS`) computes the next free `{PREFIX}-{DOMAIN}-{NNN}`; IDs are never hand-numbered. A new `10_core/ids.md` chapter states the grammar, immutability, de-scope and proof-strength rules.
- **Gates over guidelines** (`NFR-CORE-010`): joining matrix-freshness, spec-sync and ID-immutability are `check-leaf` (a chapter is ≤250 lines, statusless, routed, with a watched `<!-- LEAF-OVERSIZE -->` exemption), `check-markers` (one closed marker set across scanner, registry, requirement and every agent skill), `check-statusless` (reference docs state the present, no roadmap), `check-emdash` (no em-dash in authoritative French), `changelog-sync` (a visible change adds a CHANGELOG line) and `check-translations` (French is authoritative). All run via `npm run spec:check`, the CI `spec` job (now behind green tests via `needs:`), and an opt-in `.githooks/commit-msg`.
- **Two planes, named.** A new `00_overview/les-deux-plans.md` chapter states the truth/trajectory split and the statusless invariant the gates protect.
- **Decision records.** `decisions/` establishes the ADR convention with a template and an index. The `AD-*` ids (`AD-CORE-001`, `AD-CHANGE-001`, …) name the architecture decisions in the `AD-*` table in `requirements.md`; records are added under `decisions/` as decisions are written.
- **Versioning.** Single living `specs/current/`; historical specs are git tags, not a copied tree. Removed the drifted `specs/v1.0.0/` snapshot and the docs-site archive group (the single-living-current decision).
- A **Risk controls** index in `requirements.md` maps each `RC-*` invariant (confinement, mediated writes, egress, creation-only init, …) to the requirements that implement it.
- **Doctor.** `diagnose` gains a `recurring_abstention` finding (`FR-DOCTOR-001`): a request the router keeps refusing (≥ 3 times) surfaces as a process waiting to exist, even on a headless run.

### Aging ontology and egress flag (base.schema.json, validator.md, routing.md)
- `base.resource.v1` gains four optional fields for the living corpus: `review_by`
  (date a human should re-read the resource — consumed by `base doctor`), `valid_from`/`valid_until`
  (validity window for reference data — consumed by doctor and the context pack, which annotates
  «périmé depuis …» past expiry and demands exact citation), and `confidential` (boolean, set by
  a human, never inferred — consumed by the egress control). New validator codes
  `base.review_by.format`, `base.valid_from.format`, `base.valid_until.format`,
  `base.validity.order`, `base.confidential.type` (validator.md).
- Routing (routing.md): a `deprecated` or `archived` resource is never a routing candidate;
  discovery still finds it.
- `base doctor` (cli.md): the corpus health check — a pure projection over inventory, the link
  graph, eval runs and field feedback. Six finding kinds (dead_link, orphan, stale_eval,
  review_due, expired, open_friction), two severities, a mandatory fix hint per finding; exit 1 on
  any error-severity finding. The previous `doctor` alias of `entretien` is repurposed (the marker
  lens stays under `entretien`). Same function behind `GET /api/doctor` (Studio banner).
- Field-feedback loop (mcp.md): new write-gated MCP tool `report_friction` (dated, creation-only
  entries under `.ai/feedback/`), and abstention journalling in the ROUTER ADAPTERS (CLI `base
  route` and MCP `route_request` append `.ai/feedback/abstentions.jsonl` on honest abstentions;
  the broker stays side-effect free). Every field signal carries `origin: "terrain"` by
  construction and never mixes with simulation counters.
- Egress control (base.config.v1.json, base.workspace.v1.json): a root may declare
  `egress: "local-only" | "any"` (config file, or per-root workspace entry). One rule, one control
  point (`tools/core/egress.mjs`): a confidential resource or a local-only root never leaves
  toward a `remote` model provider, and every withhold is announced (context pack, chat, eval
  trace) — never silent.

### Documentation site contract (docs.md, requirements.md)
- `docs.md` "Presentation Boundary" now specifies the redesigned site adapter: bilingual chrome
  (French root locale, English under `/en/`, content keeps its source language), the sidebar
  contract (generated from `navigation.json`, navigation-not-inventory exclusions, reference
  split by reading intent, label uniqueness via path-context disambiguation), the resource page
  contract (content first, anchors equal to model heading slugs, internal links rewritten to
  resource pages, collapsible metadata panel), and the build-time full-text search index.
- New requirement family **FR-DOCS-001..004** in `requirements.md`, covered by
  `tests/base-docs.test.mjs` and `tests/docs-site-sidebar.test.mjs`; the requirements → tests
  matrix is regenerated accordingly.
- Sidebar contract extended (`docs.md`, FR-DOCS-003): misleading-in-navigation pages are
  excluded (README variants, manifesto translations, raw `LICENSE`, generated harness
  artifacts), the packages group keeps front doors (`README.md`) only, sections may pin a
  reading order by canonical path (unpinned pages follow in model order), the start section
  nests the installer pages under one group (hub first), each example nests as one group
  labelled by its front door, and the previous/next reading rail follows the sidebar order.
- `docs.md` chapter heading aligned with its siblings: `10 · Documentation Model (DOCS)`.

### Specification
- `00_overview/`: vision (the six-planes compass, convention→contract) and perimeter.
- `10_core/`: requirements, architecture, and one chapter per subsystem -
  frontmatter, validator, ranker, routing, policy, writes, build, maintenance, cli, mcp, trace.
- `30_schemas/`: the canonical `base.resource.v1` schema (linked, never copied), plus the
  shipped `base.config`, `base.manifest`, `base.routing`, and `base.trace_event` schemas.

### Architecture
- The broker is the single place guarantees live, and depends on five **extension points** -
  `FrontmatterParser`, `Validator`, `Ranker`, `PolicyEnforcer`, `AuthProvider`. Core ships
  safe default adapters (strict-subset frontmatter, neutral lexical ranker, advisory policy,
  no-auth); an integrator swaps any of them through an optional `base.config.{json,mjs}` -
  **without forking the core**.
- `base-core.mjs` stays a façade re-exporting the core modules in `tools/core/*`; the CLI
  (`tools/base.mjs`) and MCP server (`mcp/`) are thin adapters. Networking is the MCP's own
  concern, so `AuthProvider` lives in `mcp/src/auth.ts`.
- Writes are mediated (propose→commit with a TOCTOU guard); discovery is neutral and
  explainable; the manifest is deterministic and CI-gated for freshness; remote MCP is
  refused by default unless an `AuthProvider` is configured.
- A **Router** (`routeRequest`) turns a request into a route - agent → process - scoring
  candidates with the Ranker contract and abstaining by inspectable rules
  (`routed | ambiguous | needs_clarification | out_of_scope`), never a fabricated confidence.
  Routing signals are derived from the files (`use_when`, descriptions); the `base.routing.v1`
  registry is a deterministic projection. This makes the compass **six planes**:
  Text · Router · Broker · Index · MCP · LLM.
- **Multi-root workspace** (FR-CLI-005): a `base.workspace.json` declares named roots;
  `--workspace`/`--root-id` select one, `base route --workspace` can search across roots, and every
  read/write/execute stays confined to the selected root. Module `tools/core/roots.mjs`,
  schema `base.workspace.v1`. See `10_core/cli.md`.
- **Help fallback** (FR-ROUTE-009): `routing.fallback` in `base.config` attaches a help target to an
  honest abstention (never a fabricated route); agent-agnostic, validated, surfaced by CLI, MCP and
  the generated bootstrap. Schema `base.config.v1`. See `10_core/routing.md`.
- Two **optional official packages** extend BASE without touching the zero-dependency core:
  `@ai-swiss/base-ranker-semantic` (production-grade real-embeddings Ranker - timeouts, abort,
  bounded retries with jitter, batching, configurable cache, typed errors, observability;
  OpenAI-compatible and optional Ollama providers; FR-ROUTE-006/008) and
  `@ai-swiss/base-index-local` (a derived, deletable, deterministic index whose `routeWithIndex`
  reuses the injected Ranker/Router for **status-equivalent** routing at scale, with reproducible
  benchmarks; FR-SCALE-001..004).

### Verified state
- The full suite (core, official packages, MCP) is green; the coverage gate holds (90% lines,
  80% branches, 90% functions); the npm tarball smoke check passes; `base validate` is clean on the
  framework and on every example (each validated in isolation); `tsc` is clean; derived artifacts
  (`AGENTS.md`, `.ai/tools.md`, `base.manifest.json`) are idempotent under regeneration; the
  framework and example routing fixtures are green via `base route-test`.
- Resource boundary: the engineering `specs/`, the `exemples/` sample projects, the
  `.ai/agents/_template` scaffolding, the `.plans/` working notes, project `base.config.*`,
  and the generated `.ai/routing/` registry are kept out of the framework's own inventory,
  discovery, and manifest.

### Notes
- The `30_schemas/` schemas are stable documentation and validation aids; runtime
  enforcement is specified in the relevant `10_core/` chapter.
- This was the first published specification. Releases are now frozen as git tags rather than a
  copied `specs/vX.Y.Z/` tree.
