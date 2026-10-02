# Changelog - BASE engineering specs

All notable changes to the BASE **engineering specification** are recorded here.
Format follows the spirit of Keep a Changelog. Versions follow the documented compatibility policy (see `../../docs/reference/versions-et-stabilite.md`).

## [Unreleased]

## [1.5.1] - 2026-10-02

### Changed
- FR-INIT-002: every generated entry point sends a person who shows what they have and wants to see what an assistant would make of it to the framework's `adopter-ce-dossier` first, which writes only a proposition sheet under `.temp/`; `base init` and the import or creation follow its export, and a returned export resumes at its step 6. The scaffolded `.gitignore` ignores `.temp/`. The scaffolded `importer-l-existant` defers to that process in the same case, and sorts rules already written for AI (not copied when a model applies them on its own; a lock, tried once on something harmless through each path, when a single breach would cost dearly), in all four language tables.

- Browser pack: `tools/browser-pack.mjs --process <id>` bundles one process with everything it declares in `requires`, followed transitively and in reading order, plus annexed files quoted verbatim, with relative links made absolute against the repository URL. The committed `PARTIR-DE-CE-QUE-VOUS-AVEZ.md` is built this way for web chats, and `tests/porte-pack.test.mjs` keeps it identical to its sources.

The release also reworks the framework's own entry process (`adopter-ce-dossier`), adds the shared `faisabilite-ia` competence and the proposition sheet template, with their tests; see the root `CHANGELOG.md`.

### Fixed
- NFR-EGRESS-001 / routing: `base build routing-embeddings` applies the root policy. On a `local-only` root it refuses a remote or unknown embedder and embeds nothing; before, the precompute withheld only `confidential` resources.

## [1.5.0] - 2026-09-17

### Removed
- FR-CORE-010 is RETIRED (the ID stays, immutable): the `entretien` report and `createMaintenanceReport` are removed in 1.5.0, two minors after the 1.3.0 deprecation. Its lenses are FR-DOCTOR-001 findings, its marker query FR-MARKERS-001, its trace summary FR-TRACE-002.
- FR-MCP-002: the `include_data` no-op flag on `load_agent` is removed; an old caller degrades silently (the unknown field is dropped).
- FR-CONFIG-*: the inert `routing.embedder` key is removed; a config still carrying it now fails with a message naming `routing.embedding_model`.

### Added
- FR-PROBE-001/002/003: a manual, dry-run-by-default acceptance runner supports an explicitly selected Claude Code or Codex harness, packs pre-publication release surfaces into isolated roots, and checks the immutable public URL without packing local code. It combines closed trace and workspace expectations with versioned semantic rubrics judged by a fresh tool-free invocation whose evidence quotes are verified; semantic judgement can fail but never override mechanical evidence. Dated local records remain under gitignored `.temp/probes/`; probes are never scheduled or included in deterministic gates.
- FR-ROUTE-017: `selfVetoedPhrasings` + the `base.route.self_veto` warning — a card whose own `avoid_when` discards its declared examples is named at validate time.

### Changed
- NFR-CORE-001 through NFR-CORE-006 are canonical rows in `10_core/requirements.md`; the matrix gate rejects any requirement ID mentioned by the canonical index without its own row. Existing behavioral suites substantiate all six through the zero-dependency architecture checks, compatibility fixtures, safe-default tests, fail-loud parser and CLI cases, replaceable policy and ranker ports, and the file-only adoption scenario.
- FR-DOCTOR-001: `TRANSLATING.md` is a marker-reference path, and only recurring `ambiguous` or `needs_clarification` abstentions produce the routing/process-work finding; `out_of_scope` remains a valid boundary.
- FR-CORE-008: section discovery admits only the supported `base.resource.v1` identity contract; a passage must match on its own, while parent metadata contributes a bounded bonus computed over a separate population.
- FR-DOCS-001/003/004: docs model v2 separates authored resource identity from collision-free site routes, exports one canonical section sequence to the renderer, and generates the complete site navigation from that model.
- NFR-CORE-002: the compatibility promise explicitly distinguishes major breaks from removals that follow a documented deprecation window; BASE does not claim strict Semantic Versioning while permitting the latter in a minor release.
- The documentation and first-contact probe contracts: the repository front door starts from a person's intended work and acts as a compact self-contained map. At organizational scale it presents the proposed open standard as one reference structure that can serve bounded AI layers in an ERP, a capable harness or an MCP integration, while limiting neutrality to the owned method rather than adapters, permissions or identical results. It preserves one verifiable example, executable starts, the informational rationale, roles and boundaries, then routes human or AI readers by intent to canonical detail.
- FR-INIT-002: generated entry points lead with the useful answer and add detail only when it serves the request.
- FR-BUILD-001: French routing indexes use simple punctuation throughout generated titles and cards, including combined examples and exclusions.
- FR-INIT-002/006, FR-ROUTE-009: new and upgraded roots declare the framework welcome fallback, generated maps link to it across root boundaries, and config migrations coalesce into one rewrite.
- FR-MCP-001: a framework fallback also returns its agent's process card as `guidance_map` when the welcome process delegates further.
- FR-MCP-006: section-search guidance requires copying the returned `id#anchor` ref unchanged into `open_resource`, rather than opening its parent or deriving a new anchor from the heading.
- FR-PROBE-002/003: simultaneous runs reserve distinct evidence directories and serialize the shared MCP build-and-pack section before continuing with parallel model calls; attempt roots execute outside the contributor git context, writable Claude probes enforce their Bash vocabulary with a blocking hook, command expectations can require successful completion, bounded UTF-8 contents of changed files are assertable, and semantic judges are tool-audited.
- FR-PROBE-003: the installed package used for repository first-contact probes includes its generated root routing index, and a scenario that declares the optional documentation companion installs its packed artifact beside the packed core.
- FR-PROBE-001/002/003: timeouts terminate the complete harness process tree and close captured streams after force-kill escalation, bounding completion even when an escaped descendant retains a writer; incomplete Codex turns never promote progress text to a final answer. Codex probes disable account apps and plugins, isolate MCP reads from shell access, and grant disposable companion runtimes the write access their build caches require. Judge evidence tolerates presentation-only outer quotation marks while still verifying the enclosed quote exactly.
- FR-DOCS-002: the static renderer is the optional `@ai-swiss/base-docs-site` package, resolved by name beside the engine then from the target root; missing-package refusal precedes corpus traversal, the release smoke renders real HTML from the two installed tarballs, and the release gate refuses any known advisory in the complete production workspace graph.
- NFR-MCP-001: the npm package includes nested bundled-core modules such as `dist/core/lang/`, the pack smoke imports a module that depends on them, and the release gate refuses any known production dependency advisory.
- FR-INIT-002 / FR-BUILD-001: the generated entry point makes the routing index the first read for a routed task; `base init` creates both routing indexes in the same pure plan as their cards, Claude imports the root map as project context, and every entry point keeps BASE's implementation vocabulary out of ordinary user conversation.
- FR-ROUTE-009: the help fallback resolves in the root's inventory, then in the framework the root belongs to (`framework_dir`, else the engine's own directory); the pointer carries `source` and, for a framework target, `root` + absolute paths, and the MCP inlines that process as `guidance`.
- FR-FEEDBACK-002: a read-only MCP server journals no abstention (the line holds the request text).
- FR-BUILD-002: `writeArtifacts` keeps a hand-owned file (no provenance banner) and names it in `kept`, a list of paths.
- FR-DOCTOR-001: fourteen finding kinds — `unresolved_declaration` added; the reachability graph follows `may_use`/`requires`.
- NFR-EGRESS-001: `isConfidential` is the one reading of the flag; the routing-vector precompute asks it (it previously read a field an inventoried resource never carries, and embedded every confidential route text).
- FR-PARSE-002: a bare `{placeholder}` frontmatter value is read as text, not as a flow map.
- FR-ROUTE-001: the «when to use» section heading is read in the four languages BASE generates.
- FR-CORE-008: a generated projection is never a search hit (provenance decides).

### Changed
- FR-CLI-002: unknown `--*` flags are rejected (`parseArgs` throws; exit 1), not accumulated into `positional`; `--ollama` (boolean) and `--golden <path>` registered for `route-eval` (previously read from positional).
- FR-STUDIO-007: the non-loopback bind refusal is on the server object (a `remoteExposureError` guard wraps `listen`), so `createStudioServer(...).listen(port, host)` can no longer bypass the guard that `startStudioServer` enforced; a bare `listen(port)` is pinned to loopback.
- FR-ROUTE-005: `route_request` returns a compact `routing_map` (agents → processes with use_when + avoid) for the model to decide from, plus `next_actions`/`guidance`; its deterministic lexical decision is now a labelled hint, authoritative only for no-model or headless callers.
- FR-MCP-001: two read-only status tools, `list_pending_changes` and `get_change_status`, registered in every mode; `commit_change` returns a `{ written, target, content_hash }` receipt, the verified proof the write landed.
- FR-CLI-001: `changes [<id>]` command added, a read-only view of pending proposals or one change's status.

## [1.0.0] - 2026-06-25

First public specification of BASE-the-tooling. It documents the **implemented**
Ports & Adapters architecture - not a plan - and is verified against the code it describes.

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
