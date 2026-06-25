<!-- fr-synced: 7bd22841f0b5e714d4d8df302ccf499524bc2e6c -->
# What the public core of BASE does today

This page is for anyone who wants to know, in the present tense, what the public core of BASE can and cannot do, without guessing. It exists to give an honest reference point, and it points to the three authoritative sources rather than copying them:

- **the exact boundary** (in scope, out of scope): [`specs/current/00_overview/perimeter.md`](../../../specs/current/00_overview/perimeter.md);
- **the proof of each behavior**: the requirements-to-tests matrix, [`specs/current/10_core/requirements-matrix.md`](../../../specs/current/10_core/requirements-matrix.md);
- **the history and the direction**: the [`CHANGELOG.md`](../../../CHANGELOG.md).

If any of these sources disagrees with this page, the source is authoritative. To understand which level of adoption fits your situation, see also [`docs/audiences/pour-qui.md`](../audiences/pour-qui.md).

## What the public core does

- Local inventory of Markdown and JSON resources.
- Validation of BASE frontmatter, identifiers, relative links, local sources, and tool entrypoints.
- Explainable local search over identifier, title, description, keywords, path, and text.
- Local agent-to-process routing with structured abstention: `base route` and the MCP tool `route_request` return `routed`, `ambiguous`, `needs_clarification`, or `out_of_scope`, with candidates and reasons.
- Domain routing tests: `base route-test` reads JSON fixtures and fails on drift.
- Official semantic ranker package with real embeddings: `@ai-swiss/base-ranker-semantic`, separate from the core, accepts any embeddings provider, ships an OpenAI-compatible connector with no cloud SDK, and an optional Ollama helper (`createOllamaEmbedder`, model `nomic-embed-text`). Production-grade: per-call timeouts, cancellation via `AbortSignal`, bounded retries on transient errors only (backoff plus jitter), explicit batching via `createBatchingEmbedder`, a configurable cache with no poisoning by transient failure, typed errors (`.code`), strict vector validation, and observability with no domain content.
- Official optional local index package: `@ai-swiss/base-index-local`, separate from the core, projects a derived, deletable index from the inventory and the routing signals. Indexed routing reuses the injected Ranker and Router and returns the same statuses as in-memory by default, including with a semantic ranker and no lexical match; `candidateMode:"lexical"` is an explicit optimization. Reproducible benchmarks from 100 to 50,000 documents. The core stays the default for small and medium corpora.
- Resource opening with `metadata`, `instructions`, and `full` projections.
- Local access confined within the project, refusing path traversals and outbound symlinks.
- Local tool invocation in dry-run by default, with explicit confirmation for execution.
- Mediated domain writes: `propose_change` prepares a readable diff without writing anything, `commit_change` writes after a decision (confirmation required by default, configurable per resource via `requires_confirmation`, never optional for `sensitive`/`restricted`), verifies the written state, and traces.
- Resource promotion (`promote`): updates `scope`, `promoted_from`, and `promoted_at` through the mediated write, with diff and confirmation.
- Listing of open markers (`markers`): `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]` in domain documents.
- Multi-harness projection (`build`): generates from the kernel an `AGENTS.md` index (Codex/AGENTS.md family compatibility) and a tool matrix (`.ai/tools.md`) that honestly declares the real enforcement level per harness. On demand, `base build routing-registry` also generates `.ai/routing/registry.json`, a deterministic projection of the routing signals. Derived artifacts, never sources of truth.
- Minimal JSONL trace for operations mediated by BASE, with no domain content by default.
- Local maintenance: errors, warnings, open markers, missing descriptions, and signals drawn from the traces when they exist.
- Derived, regenerable manifest for discovery.
- MCP server as an adapter to the same primitives, with no domain logic of its own.

## Outside the public core

The reference boundary is [`specs/current/00_overview/perimeter.md`](../../../specs/current/00_overview/perimeter.md). In short, the public core does not on its own provide:

- Full enterprise RBAC.
- SSO, IAM, DLP, SIEM, legal archiving, and regulatory retention.
- Strict isolation if the agent has direct access to the shell, the filesystem, or APIs outside BASE.
- Automatic correctness guarantees for model-generated answers.
- A workflow engine, DAG, automation interface, or proprietary DSL.

## Reading rule

BASE guides everywhere through text. BASE enforces only what passes through its broker, its CLI, its MCP, or a controlled connector.

A YAML metadatum expresses a stable semantic unit. The code then decides what can be verified or enforced. This separation keeps things simple for a single person, useful for an SME, and extensible for a larger organization.
