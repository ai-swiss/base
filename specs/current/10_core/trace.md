# 10 · Trace (TRACE)

> **For developers and maintainers.** Observability. Implements FR-TRACE-001/002, NFR-CORE-007/008. Source: `recordEvent`, `summarizeTrace`.
>
> Owns: FR-TRACE-* (NFR-CORE-007/008 are owned by the CORE section)

## Guarantees
- **Never breaks the user's work** (NFR-CORE-007): `recordEvent` wraps its filesystem writes in a `try/catch` that swallows errors. A failing trace must never fail an operation.
- **No business content by default** (NFR-CORE-008): event payloads carry identifiers, decisions, durations, and a **hash** of args — never the args themselves or file content.

## Storage
Append-only JSONL, one file per day:
```
<root>/.ai/trace/YYYY-MM-DD.jsonl
```
`.ai/trace/` is excluded from inventory and (in the repo) is git-ignored — it is local runtime data, not a resource.

## Event schema (one JSON object per line)
```js
{
  ts: string,            // ISO 8601
  trace_id: string,      // event.trace_id ?? crypto.randomUUID()
  op: string,            // "validate"|"index"|"discover"|"route"|"inventory"|"open"|"access"|"invoke"|"entretien"|"build"|...
  resource_id: string|null,
  path: string|null,
  action: string|null,   // "read"|"write"|"execute"|"validate"|"search"|"maintain"|...
  decision: string,      // "allow"|"deny"|"needs_approval"|"not_applicable"
  status: string,        // "ok"|"error"
  duration_ms: number|null,
  args_hash: string|null,// "sha256:<hex>" of JSON.stringify(args)
  error: string|null,
  metadata?: object      // small, non-sensitive counts (e.g. {resources: 115})
}
```
The machine-readable schema is `../30_schemas/base.trace_event.v1.json`.

## Summary
`summarizeTrace(root)` reads all `*.jsonl` and returns:
```js
{ events: number, by_operation: {op: count}, by_resource: {id: count}, denied: number, errors: number }
```
Surfaced by `base trace` and folded into `base entretien`.

## Design notes
- Trace is a **derived, optional** signal (vision plane: not source of truth). It exists to support maintenance and a future drift-detection check ("a write happened without a recorded decision"), not surveillance — keep it minimal (CONTRIBUTING: "useful traces must not become surveillance").
- Trace `mode` (`off`/`minimal`/`full`) is a documented frontmatter intent (`base.resource.v1.trace`). **Verified: it is documented-only today** — `recordEvent` does not read per-resource `trace.mode`. Honouring it (per-resource trace levels) is a future `Δ`; until then, do not claim enforcement.
