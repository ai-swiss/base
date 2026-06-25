# 10 · Maintenance & markers (MARKERS)

> **For developers and maintainers.** Project hygiene reads: the maintenance report, the typed-marker query, and corpus health. Implements FR-CORE-010 (entretien), FR-MARKERS-*, and FR-DOCTOR-*. Source: `createMaintenanceReport`, `listMarkers`, `formatMarkers`, `tools/doctor/diagnose.mjs`.
>
> Owns: FR-MARKERS-*, FR-DOCTOR-* (FR-CORE-010 entretien is owned by the CORE section)

## `listMarkers(root)` — FR-MARKERS-001
Returns the project's **open markers**, typed and located, for surfacing work-in-progress (e.g. a session-opening status line: "2 `[A VALIDER]`, 1 `[DECISION]` — resume?").

- Scans every resource **except framework/reference files** (`isMarkerReferencePath`: `.ai/agents/`, `docs/`, `specs/`, `tests/`, `tools/`, `mcp/`, `README.md`, test files). So it surfaces markers in **business documents**, not in the framework's own prose.
- Pattern: `[A COMPLETER | A VALIDER | ATTENTION | DECISION]`, with an optional `: <text>` payload.
- Returns `[{ path, line, type, text }]`, sorted by priority (`A VALIDER` < `A COMPLETER` < `ATTENTION` < `DECISION`), then path, then line.
- Traces `op:"markers", action:"read"`.

`formatMarkers(markers)` renders the human-readable list. CLI: `base markers`. MCP: `list_markers`.

**Relationship to `entretien`:** `listMarkers` is the **focused, typed, line-located** query (good for UX and for "what's open right now"). `entretien` is the **full health report** below (counts + validation + trace + recommendations).

## `createMaintenanceReport(root)` — FR-CORE-010 (entretien)
A maintenance health report:
- runs `validateBase` (errors/warnings),
- counts **open markers** (`[A COMPLETER|A VALIDER|ATTENTION|DECISION]`, `TODO`, `FIXME`, `PLACEHOLDER`) in non-reference files (`isMarkerReferencePath` skip; `docs/` and `specs/` are excluded as reference docs),
- flags **missing descriptions** for `agent`/`process`/`tool`,
- flags **stale markers**: open markers in business files whose mtime is ≥ 30 days old (`STALE_MARKER_DAYS`). An open marker is a pending human decision; one that triggers no decision is "verification theater". mtime is a deliberate approximation (any edit resets it); an unreadable mtime yields no signal, never an error,
- summarises the trace,
- emits plain-language recommendations.

`actionable_placeholders` further excludes documentation paths (`isDocumentationMarkerPath`); stale-marker detection applies the same exclusion. CLI: `base entretien` (exit `1` if not ok). MCP: surfaced via the broker.

## `base doctor` — corpus health (FR-DOCTOR-*)

`diagnose(root)` is a **pure projection** over data that already exists — the resource inventory, the link graph, eval runs (`.ai/experiments/runs`), per-resource mtimes, and open frictions (`.ai/feedback/`) — handed to `diagnoseData(...)`, which returns findings `[{severity, type, path, message, fix_hint}]` and touches no disk. Eight finding kinds — `dead_link` (error, broken Markdown links only — an illustrative `code` path is not a link), `orphan` (error under `.ai/agents/`, where unreferenced knowledge is invisible; `warn` elsewhere, where reachability is the documentation graph's concern), `review_due` (warn), `expired` (error), `stale_eval` (warn), `open_friction` (warn), `missing_tool_artifacts` (warn), `recurring_abstention` (warn) — each carrying a mandatory fix hint and one of two severities. The CLI `base doctor [--json]` and Studio's `GET /api/doctor` both call `diagnose(root)`; the CLI renders the findings (`formatDiagnosis`) and exits `1` on any error-severity finding. Source: `tools/doctor/diagnose.mjs`.

**`entretien` vs `doctor`:** `entretien` is the marker/validation/trace lens (what is open right now); `doctor` says what is about to break — dead links, orphans, stale evals, expired reference data, due reviews, open frictions.

## Design notes
- Both `entretien` and `doctor` are **reads** (no writes, no policy gate) — pure project introspection.
- The marker vocabulary is a **convention** (`competences/marqueurs`), not enforced syntax; `listMarkers` is the tool that makes the convention queryable.
- Reference-path exclusion keeps the framework's own documentation of marker syntax (e.g. this spec, `docs/`) from polluting the counts.

## How it's proven
- `listMarkers` lists open markers in business docs and **skips framework files**.
- `createMaintenanceReport` reports open markers and derives simple descriptions.
- `createMaintenanceReport` flags markers in files untouched for 30+ days as stale, with their age in days.
- `base doctor` emits each finding kind on its own fixture, with severities and fix hints (`tests/base-doctor.test.mjs`).
