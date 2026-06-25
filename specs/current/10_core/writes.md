# 10 · Mediated writes (CHANGE / PROMOTE)

> **For developers and maintainers.** The propose→commit write subsystem and resource promotion. Implements FR-CHANGE-*, FR-PROMOTE-*, and the `write` branch of FR-POLICY-001. Source: `proposeChange`, `commitChange`, `promoteResource`, `resolveWriteContext`, `canAccessResource`.
> **This is the convention→contract leap for writes:** the broker *can* write, but only through a gated, observable, verifiable flow — never as a silent side effect.
>
> Owns: FR-CHANGE-*, FR-PROMOTE-*

## The two-step flow
A write is never a single action. It is **propose** (prepare + show a diff, write nothing) then **commit** (re-check, write, verify).

```
propose ─▶ .ai/changes/<change_id>.json   (a staged change record; target untouched)
commit  ─▶ re-check decision + base_hash ─▶ write target ─▶ verify ─▶ delete record
```

### `proposeChange(root, target, content, {purpose})` — FR-CHANGE-001
1. `confineToRoot(root, target)` — refuse paths escaping the root.
2. Read current target content (empty if new); `resolveWriteContext` parses **the existing target's** frontmatter for `sensitivity` and top-level `requires_confirmation` — *never* the proposed `content`'s own frontmatter (see "A proposal cannot grant its own exemption" below).
3. Compute the **write decision** via `canAccessResource(writeContext, "write", {confirmed:false})`.
4. Write a **change record** `.ai/changes/<change_id>.json` (shape below). **The target is not modified.**
5. Trace `op:"propose", action:"write"`.
6. Return `{ change_id, target, exists, decision, diff }` where `diff` is a human-readable `renderDiff(current, content)`.

`change_id` = `chg_<12 hex>` derived from `hash(target + "\n" + base_hash + "\n" + content)`. Folding `base_hash` in means two proposals for the same target+content but against **different base states** get distinct ids, so a pending change is not silently overwritten by a later one. The commit TOCTOU guard (step 4 below) still re-checks `base_hash` independently.

### `commitChange(root, change_id, {confirmed})` — FR-CHANGE-002
1. Validate `change_id` (`^chg_[a-z0-9]+$`); load the record (error if missing).
2. `confineToRoot(root, record.target)` again.
3. Recompute the decision via `canAccessResource({sensitivity, requires_confirmation}, "write", {confirmed})`:
   - `deny` → fail.
   - `needs_approval` && `!confirmed` → fail (`"requires explicit confirmation (--confirmed)"`).
4. **TOCTOU guard:** hash the target *now*; if it `!== record.base_hash`, fail (`"Target changed since the change was proposed; re-propose…"`).
5. Write `record.content`; **verify** by re-hashing the written file (fail on mismatch).
6. Delete the change record; trace `op:"commit", action:"write", status:"ok"`.
7. Return `{ written:true, target, decision }`.

### Change record shape (`.ai/changes/<change_id>.json`)
```js
{ change_id, target, created_at, purpose|null, exists,
  base_hash: "sha256:…"|null,   // hash of the target at propose time (null if new)
  sensitivity, requires_confirmation|null, content }
```
`.ai/changes/` is local runtime state (like `.ai/trace/`), not an inventoried resource.

## Write decision (the `write` branch of `canAccessResource`)
Parametrizable, opt-in strictness — FR-POLICY-001 (write):

| Condition | Decision |
|---|---|
| `sensitivity ∈ {sensitive, restricted}` && `!confirmed` | **deny** (confirmation never optional for these) |
| `confirmed` | **allow** |
| `requires_confirmation === false` (resource opted out) | **allow** (frictionless write) |
| otherwise (safe default) | **needs_approval** |

So a resource can opt **out** of friction (`requires_confirmation: false`) — except sensitive/restricted, which always need confirmation. The default (no metadata) asks for human approval.

### A proposal cannot grant its own exemption (deliberate)
The `requires_confirmation`/`sensitivity` that drive the decision are read from the **existing target on disk**, not from the proposed `content`. A write therefore cannot authorize *itself* by carrying `requires_confirmation: false` in the very content being written. Two consequences, both intended:
- **Creating a new file** (no existing target) can never opt out at creation time — the safe default (`needs_approval`) applies, so the first write of a frictionless resource still gets one human confirmation.
- Lowering a resource's friction is itself a reviewed write: you commit the `requires_confirmation: false` frontmatter first (with confirmation), and only *subsequent* writes to that now-existing resource are frictionless.

This keeps the exemption a property of the reviewed state, not a self-asserted claim of the incoming payload.

## `promoteResource(root, idOrPath, toScope, {purpose})` — FR-PROMOTE-001
Promotion (`personal → team → …`) reuses the write flow:
1. Validate `toScope ∈ SCHEMA_SCOPES`; refuse if equal to current scope.
2. Upsert frontmatter: `force {scope, promoted_from, promoted_at:<today>}`; `ensure {schema_version, id, type, title, description, status, sensitivity}` (so a previously-bare Markdown gains the minimal team contract).
3. `proposeChange(...)` with the new content → returns the proposal `+ {id, from, to}`.
4. CLI `base promote … --confirmed` then auto-`commitChange(confirmed:true)`.

So promotion is **a proposed, reviewable diff**, applied on commit — never a silent rewrite.

## Enforcement boundary
This is **real mediation for actions routed through the broker** (CLI `propose`/`commit`, or the MCP `propose_change`/`commit_change` tools). A write that bypasses BASE (an agent with direct FS) is still outside the gate — see `policy.md` and the generated tool matrix (`build.md`).

## How it's proven
- propose prepares a diff and **writes nothing** until commit.
- commit **requires confirmation by default**, then writes and verifies.
- auto-commits when the target opted out (`requires_confirmation:false`).
- **denies a sensitive write** without confirmation; allows once confirmed (adversarial).
- **blocks** a proposed write that escapes the project root.
- **refuses to commit** if the target changed since the proposal (TOCTOU).
- promote proposes a frontmatter promotion (scope + provenance), applied on commit; refuses same-scope.
