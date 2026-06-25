# 00 · Perimeter (scope)

> **For developers and maintainers.** What the public core does and does not promise. Mirrors `SECURITY.md` and `docs/trust/securite-et-limites.md`, stated as engineering scope.

## In scope — the public core guarantees

For actions that pass through the broker / CLI / MCP / a mediated connector:

- **Local path confinement** — resources resolve inside the BASE root; path traversal and outward symlinks are refused (`confineToRoot`).
- **Frontmatter & metadata validation** — required fields, ID format, enums, relative-link existence, tool entrypoint existence (`validateBase`).
- **Mediated reads under policy** — sensitivity-aware decisions (`canAccessResource`), `metadata`/`instructions`/`full` projections.
- **Mediated writes** — propose→commit with a TOCTOU guard + post-write verification (`10_core/writes.md`); the safe default asks for human approval.
- **Tool invocation** — dry-run by default; real execution requires explicit confirmation.
- **Minimal trace** — append-only JSONL of mediated operations, **no business content by default** (args are hashed).
- **Explainable discovery** — lexical ranking with stated reasons; derived, regenerable index.

## Out of scope — not provided by the public core alone

These are **documented extension points**, attached via ports/connectors — never claimed as built-in:

- IAM, SSO, RBAC at enterprise grade (→ `PolicyEnforcer` + `AuthProvider` adapters).
- DLP, SIEM, legal archival, regulatory retention (→ `Validator` + connector adapters).
- Strict isolation when the agent has **direct shell/filesystem access outside BASE** (a physics limit — see `10_core/policy.md`).
- Correctness of model-generated content (BASE structures and verifies; it does not guarantee the model is right).
- Protection against the policies of the AI provider in use.

## The enforcement boundary (state it, don't hide it)

A guarantee is real **only** for actions routed through the broker. In a harness where the agent can touch the filesystem directly (advisory mode), the core's policy is guidance, not a gate. Strict enforcement is reachable only where the broker is the single door (MCP, or a mediating hook). This boundary is **documented**, not papered over, and is reflected in the per-harness conformance matrix (`10_core/policy.md`, and the future docs matrix).

## Audience tiers (informational)

The same tooling serves four tiers without changing the core:

| Tier | What the core gives | What stays the integrator's responsibility |
|---|---|---|
| Personal | plain-text assistants, local validation | choosing what to share with the AI tool; review |
| Start-up | encode repeatable practices fast | stabilise repeatable bits; protect sensitive data |
| SME / team | shared workflows, light validation, maintenance | who validates; versioning; sensitivity conventions |
| Enterprise | a portable structure + documented extension ports | IAM, SSO, RBAC, audit, DLP, retention, compliance via adapters |
