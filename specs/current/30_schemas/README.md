# 30 · Schemas

> **For developers and maintainers.** Machine-readable contracts referenced by the `10_core/` chapters.

| Schema | Status | Source of truth |
|---|---|---|
| `base.resource.v1` | **canonical, shipped** | [`../../../base.schema.json`](../../../base.schema.json) at the repo root |
| `base.manifest.v1` | **shipped projection schema** | `writeManifest` output - see `base.manifest.v1.json` |
| `base.config.v1` | **shipped extension schema** | the `base.config.mjs/json` extension contract - see `base.config.v1.json` |
| `base.trace_event.v1` | **shipped trace schema** | `base.trace_event.v1.json` + shape in `../10_core/trace.md` |
| `base.routing.v1` | **shipped projection schema** | `buildRoutingRegistry` output - see `base.routing.v1.json` + `../10_core/routing.md` |
| `base.workspace.v1` | **shipped input schema** | the `base.workspace.json` multi-root contract - see `base.workspace.v1.json` + `readWorkspace` (`tools/core/roots.mjs`) |

## Rules
- **`base.resource.v1` is NOT copied here.** The repo-root `base.schema.json` is the single source; this folder links to it. Any local copy would drift (NFR-CORE-009 spirit).
- These schemas describe shapes the tooling produces (`manifest`, `trace`) or accepts (`config`). They are stable documentation and validation aids; runtime enforcement is specified in the relevant `10_core/` chapter.
- Keep `$id` URLs aligned with the shipped convention (`https://a-i.swiss/base/schemas/...`).
