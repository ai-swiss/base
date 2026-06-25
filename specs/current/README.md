# BASE Tooling - Specification (current)

> **For developers and maintainers.** This is the engineering specification of BASE-the-tooling. End users want [`../../README.md`](../../README.md) and [`../../docs/`](../../docs/).

## What BASE-the-tooling is

BASE is a **local-first framework for human–AI collaboration**: an assistant is plain text - an `AGENT.md` plus `skills/` (workflows + knowledge), `templates/`, `tools/`, and business data. The *tooling* specified here makes that text **discoverable, validatable, and safely actionable** across AI harnesses, without a database or cloud:

- a **broker** (`tools/base-core.mjs`) - the single library that inventories resources, validates them, searches them, opens them under a policy, invokes tools, and records a minimal trace;
- a **CLI** (`tools/base.mjs`) - a thin wrapper exposing the broker as `base <command>`;
- an **MCP server** (`mcp/`) - an adapter exposing broker primitives to any MCP-capable platform (ChatGPT, Claude, Cursor…).

The guiding architecture is **Ports & Adapters**: the broker depends on a small set of explicit extension points (`FrontmatterParser`, `Validator`, `Ranker`, `PolicyEnforcer`, `AuthProvider`), ships **safe default adapters**, and lets an integrator extend them through optional `base.config.{json,mjs}` - **without forking the core**. On top of those, a **Router** turns a request into a route (agent → process) by scoring candidates with the Ranker and deciding with inspectable rules - see `10_core/routing.md`.

Four **optional official packages** extend BASE without touching the zero-dependency core: `@ai-swiss/base-ranker-semantic` (a production-grade real-embeddings Ranker - timeouts, abort, bounded retries, batching, typed errors), `@ai-swiss/base-index-local` (a derived, deletable index that scales routing/discovery to tens of thousands of resources, with proven routing equivalence), `@ai-swiss/base-llm` (the owned, provider-agnostic chat/tool-calling port) and `@ai-swiss/base-eval` (a simulated-user evaluation engine built on that port). See `10_core/ranker.md` (FR-ROUTE-008) and `10_core/requirements.md` (FR-SCALE-*).

## How to read this spec

Start at `00_overview/vision.md` for the *why* and the scope boundary, then `10_core/requirements.md` for the indexed requirements, then `10_core/architecture.md` for the shape. The remaining `10_core/*.md` chapters specify one subsystem each. `30_schemas/` holds the machine-readable contracts.

| Chapter | What it specifies |
|---|---|
| `00_overview/vision.md` | Purpose, the six-planes compass, convention→contract, enforcement modes |
| `00_overview/perimeter.md` | In scope (public core) vs out of scope (enterprise extensions) |
| `00_overview/les-deux-plans.md` | The two planes: present (truth) vs trajectory (history), and the statusless invariant |
| `10_core/requirements.md` | `UR/FR/NFR/RC/AD` with stable IDs - current behaviour |
| `10_core/ids.md` | Identifier grammar: prefixes, allocation by tooling, immutability, de-scope, proof strength |
| `10_core/architecture.md` | Broker, the five ports, the Router, config resolver, façade, file layout |
| `10_core/frontmatter.md` | The strict-subset frontmatter grammar + rejected constructs + error codes |
| `10_core/validator.md` | `Validator` port, Notification pattern, core schema rules |
| `10_core/ranker.md` | `Ranker` port, neutral lexical scoring, declarative intent boosts, robust semantic adapter |
| `10_core/routing.md` | `Router`: signal derivation, structural decision (4 statuses), generated registry, route CLI/MCP |
| `10_core/policy.md` | `PolicyEnforcer` port, advisory/strict, per-harness enforcement boundary |
| `10_core/egress.md` | Egress control: confidential / local-only never reaches a remote model; MCP remote-by-default |
| `10_core/writes.md` | Mediated writes (propose→commit, TOCTOU) and promotion |
| `10_core/build.md` | Derived artifacts: `AGENTS.md` index + honest tool matrix |
| `10_core/maintenance.md` | Maintenance report (`entretien`) and typed-marker query |
| `10_core/docs.md` | Documentation model, local/public builds, metadata discipline |
| `10_core/cli.md` | CLI command contract (flags, projections, exit codes) |
| `10_core/mcp.md` | MCP tools, transports, agent discovery, auth |
| `10_core/trace.md` | Trace event schema and guarantees |
| `30_schemas/` | `base.resource.v1` (canonical), `base.config.v1`, `base.manifest.v1`, `base.routing.v1`, `base.trace_event.v1`, `base.workspace.v1` |

## Conventions used in these chapters

- **Statusless truth.** Every chapter states **present behaviour** — what the software does now, statuslessly. Planned-but-unbuilt work lives in `CHANGELOG.md` and `.plans/`, never in a chapter; a genuine unknown is flagged inline `[NEEDS CLARIFICATION: reason]`.
- **Normative code.** "Matches `functionName`" means that function's source is authoritative for the detail. Functions are named, not line-numbered (line numbers drift).
- **Proof by ID.** Every `UR/FR/NFR/RC` carries its proof in `10_core/requirements-matrix.md`, regenerated from the test suites; `AD` records a decision instead (see `10_core/ids.md`). Spec discipline is itself gate-enforced (NFR-CORE-010).

## Verified baseline (current)

Reproduce before changing anything:

```bash
# Core + official packages (zero-dependency: just Node ≥ 18; tested on Node 24)
npm test                              # → green (core + all official packages)
npm run test:coverage                 # → coverage gate: 90% lines, 80% branches, 90% functions
npm run smoke:pack                    # → all three tarballs install; CLI + public exports resolve
npm run bench:index                   # → reproducible scale benchmark (no fragile thresholds)
node tools/base.mjs validate --root . # → "BASE valide." (0 errors)
node tools/base.mjs route-test --root exemples/routage-pme   # → routing example fixtures stay stable

# MCP server (has dependencies)
cd mcp && npm ci && npm run build && npm test   # → tsc clean, tests green
```

For the full test architecture — every layer (static types, unit/contract, Studio component + hook,
end-to-end + accessibility), what each proves, and how to run it — see [`../TESTING.md`](../TESTING.md).
