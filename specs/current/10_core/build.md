# 10 · Build / Artifacts (BUILD)

> **For developers and maintainers.** Derived-artifact generation. Implements FR-BUILD-*. Source: `buildArtifacts`, `writeArtifacts`, `renderAgentsMd`, `renderToolMatrix`.
> These are **projections** (vision plane "Index = scale"): regenerable, never the source of truth. The text in `.ai/agents/` is the source; the artifacts are generated *from* it.
>
> Owns: FR-BUILD-*

## Interface
```js
// targets ⊆ {"agents-md","tools","bootstrap","routing-registry"}; "all" = {agents-md, tools, bootstrap}
export async function buildArtifacts(root, { targets = ["all"] } = {})  // → [{target, path, content}]
export async function writeArtifacts(root, artifacts)                    // confined writes + trace "build" → [paths]
```
CLI: `base build [all|agents-md|tools|bootstrap|routing-registry] [--write]` - **dry-run by default** (prints the plan); `--write` writes the files (each `confineToRoot`-checked).

## FR-BUILD-001 - `AGENTS.md` (target `agents-md`)
A derived index of the project's agents → repo-root `AGENTS.md`. Includes resources of `type=agent` under `.ai/agents/` excluding `/_` (so `_template` is skipped), sorted by path, each rendered as `- **<name>** - <description> → \`<path>\``. The file carries a generated-by banner ("do not edit by hand; edit the core then `base build`").

**Why it matters:** `AGENTS.md` is the emerging cross-tool convention (Codex, Cursor, …). Generating it from the core is the harness-compatibility win, dogfooded as a projection rather than a hand-maintained file.

## FR-BUILD-002 - tool matrix (target `tools`)
Generates `.ai/tools.md`: an **honest per-harness tool matrix**. Levels `0` unsupported · `1` advisory · `2` partial mediation · `3` strict (mediated). Columns: `claude-code`, `cursor`, `chatgpt (mcp)`, `generic`. Rows include: path confinement, write confirmation (propose/commit), tool execution (dry-run+confirm), native skill discovery, hooks/mechanical guardrails.

Carries the **honesty rule** inline: a guarantee is level 3 only for actions routed through BASE (`propose`/`commit`, `invoke`) or through a configured hook/connector; anything bypassing the broker stays at the harness's native level. The matrix is generated so the shipped statement stays in sync with the framework source, but the values are still a declared maximum attainable level, not a runtime measurement of a user's installation.

## FR-BUILD-003 - write semantics
`writeArtifacts` confines each path, creates parent dirs, writes, and records one `op:"build", action:"write"` trace event with `{artifacts: <count>}`. It does **not** route through propose/commit, and that is the **decided** behaviour: these are deterministic, confined, traceable, regenerable projections (not edits to source). They are reviewed by the CI freshness gate (`build --write` then `git diff --exit-code`), so per-change confirmation would add friction without benefit. Source edits - the ones a human must approve - go through propose/commit; projections do not.

## FR-BUILD-005 - harness entry points (target `bootstrap`)
Generates the four harness bootstraps from **one canonical router body** (`tools/core/bootstrap.mjs`): `CLAUDE.md` (Claude Code), `BASE_BOOTSTRAP.md` (generic), `.cursor/rules/assistant.mdc` (Cursor), and the head of `AGENTS.md` (above its catalogue). The body is **agent-agnostic** - the entry point is a *router*, not an identity: it never `@`-imports or hard-codes a default agent. It routes at task boundaries (or on an explicit `R`), preferring the deterministic engine - MCP `route_request`, then the `base route` CLI - and **never** instructs the LLM to route by reading a catalogue; if neither is available it points at the `activer-routage` setup process. Part of `all`, so the four are regenerated together and **CI-gated for freshness** (`build --write` then `git diff --exit-code`) - they cannot drift. A sync test asserts all four carry the canonical body.

**Why it matters:** BASE ships a deterministic Router; the front door must *use* it, not re-introduce hand-maintained text routing. One source → four files removes the drift that let `CLAUDE.md` hard-code an agent while Cursor routed by intent.

## FR-BUILD-004 - routing registry (target `routing-registry`)
Generates `.ai/routing/registry.json` (`schema_version: base.routing.v1`): agents, their processes grouped by agent, the derived `route_text` + signal source per card, and `diagnostics.weak_signals`. **Opt-in** - *not* part of `all`: the Router currently derives candidates in memory, and the on-disk registry is an audit/review projection plus a future cache boundary, not a runtime dependency. Deterministic for its **derived signals** (sorted, timestamp-free → idempotent; freshness-gateable if a project chooses to commit it); runtime semantic scores are **never** frozen into it. The generated `.ai/routing/` tree is excluded from inventory. See `routing.md`. Matches `buildRoutingRegistry`.

## How it's proven
- projects an `AGENTS.md` index **and** a tool matrix from the core;
- excludes the `_template` agent from the index;
- projects the four harness entry points from one canonical router body, kept in sync;
- documents the two control-retention principles consistently (matrix honesty rule);
- the routing registry is deterministic and idempotent (`buildRoutingRegistry`, `buildArtifacts`, `tests/base-routing.test.mjs`).
