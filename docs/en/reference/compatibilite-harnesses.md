<!-- fr-synced: db50893283bf35fa5e9828119242bfa5090f3387 -->
# Knowing which guarantees you get depending on your tool

Your BASE files work in any AI tool that can read your files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code), as well as in a standard web AI platform via MCP (for example ChatGPT, Claude, Gemini), but **the guarantees vary from one tool to the next**. This page tells you, plainly, what each harness actually protects, so you can choose your level of trust with full knowledge of the facts.

> Honesty rule: a guarantee is **strict** only for actions that go through BASE (its CLI, its broker, its MCP server, or a controlled connector). An action that **bypasses** BASE (an agent writing directly into a file) stays at the harness's native level.

## Three levels

- **advisory** (1): BASE guides and traces, but the tool can override it.
- **partial mediation** (2): some actions go through BASE, others do not.
- **strict** (3): the action is mediated; the broker is the mandatory gate for actions routed by BASE.

## Matrix

This matrix is **generated** from the core (`base build tools`), which keeps it synchronized with the framework's declaration. It indicates the **maximum level attainable** when the action truly goes through BASE and the harness is configured for it. It does not automatically measure the actual state of your installation.

| Guarantee | claude-code | cursor | chatgpt (mcp) | generic |
| --- | --- | --- | --- | --- |
| Path confinement (mediated access) | 3 | 3 | 3 | 1 |
| Confirmation before writing (`propose`/`commit`) | 3¹ | 2 | 3¹ | 1 |
| Tool execution (dry-run + confirmation) | 3¹ | 2 | 3¹ | 1 |
| Native skill discovery | 3 | 2 | 1 | 1 |
| Hooks / mechanical guardrails | 3² | 2² | 0 | 0 |

¹ Level 3 only for actions routed by the BASE broker (`propose`/`commit`, `invoke`). A write or execution that bypasses the broker stays advisory.

² Level attainable only if the harness is configured to route the actions concerned to the broker or a hook. BASE does not ship these hooks for every harness.

## What this implies

- **For personal use**, advisory mode is enough: you review and validate anyway.
- **For a team or an organization**, route sensitive actions through the broker (CLI, MCP) or a hook, and configure a strict policy (`base.config`). That is where the guarantees become real.
- **The MCP server** offers the tightest enforcement, since the agent only has access to tools and never directly to files, but it is also the one that demands the most setup; see [MCP server](../../../mcp/).

For the engineering detail (the `PolicyEnforcer` port, the exact boundary), see `specs/current/10_core/policy.md`.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use cases in partnership with [Innovaud](https://innovaud.ch).
