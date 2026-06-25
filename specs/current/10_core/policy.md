# 10 · PolicyEnforcer (POLICY)

> **For developers and maintainers.** Port `PolicyEnforcer`. Implements FR-POLICY-001..003.
>
> Owns: FR-POLICY-*

## The key fact: the choke-point already exists
Every mediated read/write/execute already passes through `canAccessResource`, and the broker acts on `deny` (throws in `openResource`/`invokeTool`/`commitChange`). **Writes are now genuinely gated** through the propose→commit flow (`writes.md`) - the CLI/MCP *do* write, but only through that mediated, verified path. "Advisory" now means only that the **default adapter is permissive for `needs_approval`** (it proceeds). The remaining advisory→strict step is making the policy a **swappable port** (an adapter that *bites* on `needs_approval`), with no core change.

## Interface
```js
// tools/core/policy.mjs   (imports node:* only)

// decide(resource, action, ctx) => { decision, reason, grant? }
//   action   ∈ "read" | "write" | "execute"
//   decision ∈ "allow" | "deny" | "needs_approval"
//   resource, ctx = architecture.md §2/§3

export function advisoryPolicy(resource, action, ctx) { /* = canAccessResource, byte-for-byte */ }
```

### `advisoryPolicy` (default = FR-POLICY-001, unchanged behaviour)
- **read:** `metadata` projection → `allow` (no body exposed). `restricted` full read without `purpose` and without `confirmed` → `deny`. `confidential`/`sensitive`/`restricted` → `needs_approval`. else → `allow`.
- **execute:** dry-run → `allow`. `requires_confirmation !== false && !confirmed` → `deny`. `sensitive`/`restricted` && `!confirmed` → `deny`. else → `allow`.
- **write:** `sensitive`/`restricted` && `!confirmed` → `deny`; `confirmed` → `allow`; resource `requires_confirmation === false` → `allow`; else → `needs_approval`. Enforced by the propose/commit flow (`writes.md`).
- otherwise → `deny`.

### `strictPolicy` (reference adapter - written by IT, it *blocks*)
```js
export function strictPolicy({ grants = new Set() } = {}) {
  return (resource, action, ctx) => {
    const s = resource.sensitivity ?? "internal";
    if (action === "read" && s === "restricted" && !grants.has(ctx.grantToken))
      return { decision: "deny", reason: "restricted: grant required" };
    if (action === "write" && !ctx.confirmed)
      return { decision: "deny", reason: "write: human grant required" };   // actually blocks
    if (action === "execute" && ["sensitive","restricted"].includes(s) && !ctx.confirmed)
      return { decision: "deny", reason: `${s}: confirmation required` };
    return { decision: "allow", reason: "strict policy satisfied" };
  };
}
```
The already-parsed YAML metadata is split in two categories:

- `sensitivity`, `requires_confirmation` and future explicit policy fields can feed the real gate when an action passes through the broker.
- `requires[].access` is a workflow need: it says the process expects to read, write or execute a referenced resource. It does not grant access and is not enforced by itself.

**precheck + grant** model: a mediated write flow asks for the decision first (`precheck`), obtains a `grant` (token/confirmation), then proceeds. If the precheck returns `deny`, the broker must not persist the proposed content.

## The honest enforcement boundary (physics, not a defect)
A policy can only enforce **what passes through the broker**. Strict mode is *airtight* only where the broker is the single door:

| Harness | Strict reachable? | How |
|---|---|---|
| **MCP** | **Yes, today** | the agent has no filesystem, only the tools → swap the enforcer |
| **Hook (e.g. Claude Code PreToolUse)** | **Yes** | route Read/Write/Bash through the broker |
| **Cursor / direct FS** | **No (advisory)** | the agent can bypass → BASE must **say so** (conformance matrix) |

BASE **documents** this boundary rather than hiding it (vision §4; perimeter.md). The conformance matrix states, per harness, the real mode (advisory/hybrid/strict).

## Wiring
The broker calls `config.policy(resource, action, ctx)` at the same points it calls `canAccessResource` today. `DEFAULTS.policy` is `null`, which `resolvePolicy` maps to `advisoryPolicy`, so the effective default is advisory and behaviour is unchanged unless an integrator sets `policy` in `base.config.json` or, for trusted executable adapters, `base.config.mjs`.

## How it's proven
- `advisoryPolicy` is the default and matches FR-POLICY-001 (`tests/base-policy.test.mjs`).
- `strictPolicy` **denies** a write without `confirmed` and a `restricted` read without a matching grant, and **allows** when granted.
