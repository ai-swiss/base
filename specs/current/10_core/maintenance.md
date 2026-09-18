# 10 · Maintenance & markers (MARKERS)

> **For developers and maintainers.** Project hygiene reads: the typed-marker query and corpus health. Implements FR-MARKERS-* and FR-DOCTOR-*. Source: `listMarkers`, `formatMarkers`, `tools/doctor/diagnose.mjs`.
>
> Owns: FR-MARKERS-*, FR-DOCTOR-* (the reserved FR-CORE-010 id is owned by the CORE section)

## `listMarkers(root)` — FR-MARKERS-001
Returns the project's **open markers**, typed and located, for surfacing work-in-progress (e.g. a session-opening status line: "2 `[A VALIDER]`, 1 `[DECISION]` — resume?").

- Scans every resource **except framework/reference files** (`isMarkerReferencePath`: `.ai/agents/`, `docs/`, `specs/`, `tests/`, `tools/`, `mcp/`, `README.md`, `TRANSLATING.md`, test files), so it surfaces markers in **business documents**, not in the framework's own prose.
- Pattern: `[A COMPLETER | A VALIDER | ATTENTION | DECISION]`, with an optional `: <text>` payload.
- Returns `[{ path, line, type, text }]`, sorted by priority (`A VALIDER` < `A COMPLETER` < `ATTENTION` < `DECISION`), then path, then line.
- Traces `op:"markers", action:"read"`.

`formatMarkers(markers)` renders the human-readable list. CLI: `base markers`. MCP: `list_markers`.

**Relationship to `doctor`:** `listMarkers` is the **focused, typed, line-located** query (good for UX and for "what's open right now"). `doctor` is the **health report** below: it does not list markers, it names the ones that have stopped moving (`stale_marker`).

## One owner per health question — FR-CORE-010

FR-CORE-010 is reserved and has no answering surface. Each health question has one owner:
`base doctor` for the structural lenses, `listMarkers` for the marker query, `base validate` for
validation and `base trace` for the journal.

## `base doctor` — corpus health (FR-DOCTOR-*)

`diagnose(root)` is a **pure projection** over data that already exists: the resource inventory,
the reference graph, eval runs, per-resource mtimes, open frictions and aggregated abstentions. It
hands these inputs to `diagnoseData(...)`, which returns
`[{severity, type, path, message, fix_hint}]` and touches no disk. FR-DOCTOR-001 owns the complete
finding taxonomy. The CLI `base doctor [--json]` and Studio's `GET /api/doctor` both call
`diagnose(root)`; the CLI renders the findings and exits `1` on any error-severity finding.
Source: `tools/doctor/diagnose.mjs`.

## Design notes
- `doctor` is a **read** with no policy gate: pure project introspection.
- The marker vocabulary is a **convention** (`competences/marqueurs`), not enforced syntax; `listMarkers` is the tool that makes the convention queryable.
- Reference-path exclusion keeps the framework's own documentation of marker syntax (e.g. this spec, `docs/`, `TRANSLATING.md`) from polluting the counts.
- Only recurring `ambiguous` and `needs_clarification` abstentions suggest routing or process work. A recurring `out_of_scope` result confirms a boundary and produces no such finding.

## How it's proven
- `listMarkers` lists open markers in business docs and **skips framework files**.
- `base doctor` emits each finding kind on its own fixture, with severities and fix hints (`tests/base-doctor.test.mjs`).
