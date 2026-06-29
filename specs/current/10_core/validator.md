# 10 · Validator (VALID)

> **For developers and maintainers.** Port `Validator`. Implements FR-VALID-001..005, FR-ONTOLOGY-*.
>
> Owns: FR-VALID-*, FR-ONTOLOGY-*

## Intent
The **core validates only the minimum BASE requires** (`base.resource.v1`). Everything else (organisation rules, PII, retention) is **opt-in** through additional `Validator`s. This keeps the contract honest: the core never pretends to know an organisation's rules.

## Pattern: Notification accumulator
A `Validator` **never throws** and **never mutates** the resource; it appends to a `Notification`. (Collect *all* problems, not just the first.)

```js
// tools/core/validators.mjs   (imports node:* only)

export function createNotification() {
  return {
    errors: [], warnings: [],
    error(path, code, message) { this.errors.push({ path, code, message }); },
    warn (path, code, message) { this.warnings.push({ path, code, message }); },
    get ok() { return this.errors.length === 0; },
  };
}

// A Validator is pure and order-independent:
//   (resource, notification, ctx) => void          // resource & ctx shapes: architecture.md §2/§3
export function coreSchemaValidator(resource, n, ctx) { /* base.resource.v1 rules; emits CODES */ }

export function runValidators(resource, validators, ctx) {
  const n = createNotification();
  for (const v of validators) v(resource, n, ctx);
  return n;
}
```

`validateBase(root, {config})` runs `[coreSchemaValidator, ...config.validators]` over every resource, plus the cross-resource checks below, and returns `{ ok, errors[], warnings[], resources[] }`.

## `coreSchemaValidator` rules (the baseline, FR-VALID-002/003/004)
Matches today's `validateResourceMetadata` + link/entrypoint/cross-ref checks. Emits stable codes:

**Errors** (block; `ok=false`):
- `base.yaml.*` — frontmatter parse errors (from the parser).
- `base.id.duplicate` — same `id` used by two files.
- Only when `schema_version` **is present** (FR-VALID-004 — progressive metadata):
  - `base.schema.unsupported` — `schema_version !== "base.resource.v1"`.
  - `base.field.required` — missing `schema_version`/`id`/`type`/`description`.
  - `base.id.invalid` — `id` not `^[a-z0-9][a-z0-9-]*$`.
  - `base.type.invalid`, `base.scope.invalid`, `base.status.invalid`, `base.sensitivity.invalid` — bad enum.
  - `base.keywords.type`, `base.may_use.type` — not a list.
  - `base.promoted_at.format` — not `YYYY-MM-DD`.
  - `base.review_by.format`, `base.valid_from.format`, `base.valid_until.format` — aging/validity dates not `YYYY-MM-DD` (living-corpus fields: `review_by` is read by `base doctor`; `valid_from`/`valid_until` by doctor and the context pack).
  - `base.validity.order` — `valid_from` after `valid_until`.
  - `base.confidential.type` — `confidential` not a boolean (set by a human, never inferred; read by the egress control).
  - `base.source.type`, `base.requires.*`, `base.execution.*` — bad shapes (see `30_schemas`).
- `base.execution.entrypoint_missing` — tool `execution.entrypoint` resolves to a missing file.
- `base.link.missing` — a relative Markdown link target does not exist (confined).

**Warnings** (non-blocking):
- `base.title.absent` — no `title` (Markdown `# ` heading will be used).
- `base.requires.unknown_ref` — a `requires[].ref` matches no known resource id.
- `base.source.locator_missing` — `source.connector == "local_fs"` locator not found.

## Reference adapters (ship these — they demonstrate the pattern)
```js
requireFields(["owner","sensitivity"], { whenScope: "team" })   // → base.org.field_required
forbidSensitivity("restricted", { unless: hasField("retention") })
requireSchemaVersion({ whenScope: "team" })   // makes the contract strict for shared resources
piiScanner({ patterns: [/\b\d{3}\.\d{3}\.\d{3}\b/], severity: "warning" })  // e.g. CH AVS number
routabilityWarnings({ whenScope: "team" })     // warns: routable resource missing description / use_when (routing.md)
```
Adapters register their own codes in `core/codes.mjs` (or a namespaced extension). Each is a pure `(resource, n, ctx) => void`.

## Design rules
- `coreSchemaValidator` is the **first** element of the pipeline (dogfooding; no special-case path).
- Codes are **stable**; French messages live in `core/codes.mjs`, decoupled from the codes (so CI and adapters react to codes, and i18n is trivial).
- Order independence: validators must not depend on each other's order.

## How it's proven
- `validateBase` collects every problem and emits stable codes (`tests/base-validators.test.mjs`, `tests/base-core.test.mjs`).
- Each reference adapter triggers and clears as specified; `requireSchemaVersion` flips a file without `schema_version` from ignored to error only when configured.

## Runtime artifacts

Files BASE writes for itself at run time (currently `.ai/studio.settings.json`) are machine
state, never knowledge: `inventoryResources` skips them, so they never appear as resources,
cards, facet counts or doctor findings. The list lives in one place,
`tools/core/runtime-artifacts.mjs`, so every consumer inherits additions. The file tree still
shows them as plain (non-resource) files: the explorer shows the truth of the disk.
