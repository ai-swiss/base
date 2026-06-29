# Changelog - BASE engineering specs

All notable changes to the BASE **engineering specification** are recorded here.
Format follows the spirit of Keep a Changelog. Versions follow semver (see `../README.md`).

## [Unreleased]

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
