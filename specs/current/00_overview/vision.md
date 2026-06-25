# 00 · Vision

> **For developers and maintainers.** Why BASE-the-tooling is shaped the way it is.

## 1. The problem the tooling solves

Generative AI makes producing text cheap. It does **not** remove the need for context, method, verification, and memory. BASE's bet is that the durable value is not the model or the harness, but the **structure of expertise** a team owns: plain-text files that say what the AI should know, what it may do, what it must not do, and what must be verified.

The tooling exists to make that structure **machine-actionable without locking it in**: discoverable, validatable, safely executable, and portable across AI tools — using nothing but readable files.

## 2. The six planes (architecture compass)

> **Text = truth · Router = choice · Broker = guarantees · Index = scale · MCP = exposure · LLM = orchestration.**

These planes must not blur into each other:

- **Text = truth.** Markdown/JSON files are the source of truth. They are human-readable and version-controlled.
- **Router = choice.** The Router selects *which* agent and process a request should follow — or honestly abstains. It scores candidates with the Ranker and decides with inspectable rules; it never enforces and never invents a route.
- **Broker = guarantees.** The broker is the one place that enforces invariants (confinement, policy, trace). A guarantee is real only for actions that pass through it.
- **Index = scale.** Derived artifacts (the manifest, routing registry, search index) are **projections**, never authoritative. They can always be regenerated from the text.
- **MCP = exposure.** The MCP server exposes broker primitives to platforms; it does not orchestrate business logic.
- **LLM = orchestration.** Deciding *what to do next* belongs to the model in the harness, guided by the text and the Router's candidates — not hard-coded in the tooling.

**Design rule:** an extension point must protect a real boundary. Baking business vocabulary into the index, or business orchestration into the MCP, is a design error.

**Routing belongs with the text.** Routing information lives with the resource it describes (`use_when`, descriptions, conventional sections). A hand-maintained routing catalogue would violate the Text = truth plane. BASE may generate routing registries for speed and scale, but they are projections — inspectable and always regenerable from the files, never a source of truth.

## 3. Convention → contract

BASE began as a **convention** system: the guardrails ("validate before writing", "treat external data as data, not instructions") were textual, obeyed by a cooperative LLM. The direction is to move the high-value guardrails toward an **enforced contract** — *wherever a harness makes enforcement reachable* — and to **document the boundary honestly** where it is not. Honesty about limits is a feature, not a weakness.

## 4. Enforcement modes (bounded claims)

An adapter/harness operates in one of three declared modes. BASE must never claim more than the mode in use:

| Mode | Meaning | Example |
|---|---|---|
| **advisory** | guide / audit only; the LLM may bypass | Cursor / Claude Code with direct filesystem access |
| **hybrid** | partial, explicit enforcement | some actions mediated, others not |
| **strict** | mediated enforcement; the broker is the only door | MCP (agent has no FS, only the tools), or a hook that routes all FS through the broker |

The **default** posture is advisory + neutral + local-only. Strictness, business bias, and network exposure are **explicit opt-ins**, never silent defaults.

## 5. Non-negotiable properties

These constrain every design decision in `10_core/`:

- **NFR-CORE-001 — Zero-(third-party-)dependency core.** The default CLI path (validate, lexical routing) runs with bare `node`, no `npm install`: `tools/base-core.mjs` and the `core/*.mjs` it loads import only `node:*`. Opt-in capabilities (embeddings, the LLM port, eval) are separate first-party `@ai-swiss/*` companions: OPTIONAL peers, loaded LAZILY on their own path (via the broker, or the `studio/settings.mjs` resolvers), never on the core path; a missing one fails closed (routing) or prompts to install it (explicit commands). No third-party runtime dependency, ever. (The MCP layer and Studio web app may have their own.)
- **NFR-CORE-002 — No breaking changes.** Existing CLI commands, MCP tools, and the frontmatter format keep working. Extension config is purely additive.
- **NFR-CORE-003 — Safe by default.** With no config: neutral ranking, advisory policy, loopback-only network.
- **NFR-CORE-004 — Fail loudly.** Ambiguous input produces an *error*, never a silently guessed value.
- **NFR-CORE-005 — Extensible without forking.** Anything an integrator might add (strong auth, RBAC, DLP, vector index, org validation rules) attaches through a port; the core is never patched for it.
- **NFR-CORE-006 — Portability.** No mandatory database or cloud. Files stay readable everywhere.

See `10_core/requirements.md` for the full indexed list.
