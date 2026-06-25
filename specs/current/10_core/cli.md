# 10 · CLI (CLI)

> **For developers and maintainers.** The `base` command contract. Implements FR-CLI-*, FR-INIT-*. Source: `tools/base.mjs` (thin wrapper over the broker).
>
> Owns: FR-CLI-*, FR-INIT-*

## Invocation
```bash
node tools/base.mjs <command> [args] [flags]
# or, installed:  base <command> [args] [flags]
```
Zero dependencies: runs with bare `node` (NFR-CORE-001).

## Commands (baseline — verified)

| Command | Purpose | Broker call |
|---|---|---|
| `validate` | Validate the project; print errors/warnings | `validateBase` |
| `index` | (Re)write `base.manifest.json` | `writeManifest` |
| `discover "<query>"` | Explainable search | `searchResources` |
| `route "<demande>"` | Route to agent → process, or abstain | `routeRequest` |
| `route-test` | Run routing fixtures (JSON); exit `1` on mismatch | `runRouteTests` |
| `inventory` | List resources (`id\tkind\tpath`) | `inventoryResources` |
| `open <id\|path>` | Open a resource under policy | `openResource` |
| `access <id\|path>` | Read a resource or confined file | `accessResource` |
| `invoke <id> [args…]` | Prepare/run a tool | `invokeTool` |
| `entretien` | Maintenance report (markers, missing descriptions, trace) | `createMaintenanceReport` |
| `init` | Bootstrap: detect what a directory is (workspace / root / collection of roots / loose markdown / empty), print the EXACT files to create, write them only with `--yes` (creation-only, `wx`). Core logic in `tools/core/perimeter.mjs`, shared verbatim with Studio's Welcome screen | `detectPerimeter` + `buildInitPlan` + `applyInitPlan` |
| `doctor` | Corpus health: dead links, orphans, stale evals, due reviews, expired reference data, open frictions — pure projection, mandatory fix hint per finding, `--json` | `tools/doctor/diagnose.mjs` |
| `trace` | Trace summary | `summarizeTrace` |
| `propose <target>` | Stage a write; show a diff, write nothing | `proposeChange` |
| `commit <change-id>` | Apply a staged write (re-checked, verified) | `commitChange` |
| `promote <id> --to <scope>` | Propose a scope promotion (frontmatter) | `promoteResource` |
| `markers` | List typed open markers (business files) | `listMarkers` |
| `build [target]` | Project derived artifacts (`AGENTS.md`, tool matrix, `routing-registry`) | `buildArtifacts` |
| `docs [validate\|model\|serve\|build]` | Build, validate, serve or statically export the interactive documentation model/site | `tools/docs/model.mjs` |
| `studio` | Launch the local Studio workshop (installs deps on first run) | `tools/studio/ui/dev.mjs` |
| `whereis` | Print the framework install location and version | `tools/cli/framework.mjs` |
| `update` | Update the framework (git) and show what changed | `tools/cli/framework.mjs` |
| `help` / `--help` / `-h` / *(none)* | Usage | — |

Unknown command → error + usage, exit `1`.

## Flags

| Flag | Applies to | Meaning |
|---|---|---|
| `--root <path>` | all | Explicit project root. Overrides autodetection and workspace selection. |
| `--workspace <path>` | all | Explicit `base.workspace.json` file or directory containing it. |
| `--root-id <id>` | all with `--workspace` | Select a root from the workspace. Root-specific commands use the workspace default when omitted. Passed without a workspace context, it is ignored with a visible warning (never a silent mis-target). |
| `--json` | all | Emit JSON instead of formatted text |
| `--limit <n>` | `discover`, `route` | Max results / candidate shortlist (positive integer) |
| `--projection <metadata\|instructions\|full>` | `open`, `access` | Which projection to return (default `full`) |
| `--purpose <text>` | `open`, `access`, `propose` | Stated purpose (unlocks `restricted` reads under advisory policy) / change rationale for `propose` |
| `--execute` | `invoke` | Actually run (default is dry-run) |
| `--confirmed` | `invoke`, `open`, `access`, `commit`, `promote` | Explicit confirmation for gated actions |
| `--grant-token <token>` | `open`, `access`, `invoke`, `propose`, `commit`, `promote` | Optional grant token for strict policy adapters |
| `--from <file>` | `propose`, `route-test` | New content (propose) / fixtures path (route-test) |
| `--to <scope>` | `promote` | Target scope (`personal`/`team`/`org`/`public`/`enterprise-extension`) |
| `--write` | `build` | Write the projected artifacts (else dry-run plan) |
| `--config <path>` | `validate`, `discover`, `route`, `route-test` | Confined path to a `base.config.{json,mjs}`; default `<root>/base.config.*` |
| `--public` | `docs` | Build or validate the public-filtered documentation target |
| `--out <dir>` | `docs model`, `docs build` | For `model`: write projections under a custom directory. For `build`: write the static site to this deployment directory. |

## Exit codes (FR-CLI-003)
- `validate`, `entretien`: exit `1` when `ok == false`, else `0`. `doctor`: exit `1` when any finding has `severity: "error"`.
- Any command: uncaught error → message to **stderr**, exit `1`.
- Otherwise `0`.

## Output contract
- Default: human-readable text (the `format*` helpers).
- Human-readable output starts with the selected context, for example `BASE root: .` or `BASE workspace: AI Swiss`.
- `--json`: the structured result object (stable shape; safe for scripts/CI).

## Root and workspace defaults

Without `--root` or `--workspace`, the CLI starts from the current directory and resolves context in this order:

1. nearest parent BASE root, detected by `.ai/` or `base.manifest.json`;
2. nearest parent `base.workspace.json`;
3. helpful error with suggested `--root` / `--workspace` usage.

In workspace mode, the selected root for root-specific commands is: `--root-id` if given, else the single root marked `default: true`, else the **first declared** root (declaration order is preserved; selecting the first-written root is the least surprising default). A selected root whose path is missing fails loudly (`BASE root not found`), never a raw `ENOENT`. `route` can search across all declared roots when no `--root-id` is provided; if several roots match, it returns `ambiguous` instead of guessing, and an unreachable root is reported under `unreachable_roots` rather than aborting the whole route.

## Examples (also serve as docs)
```bash
node tools/base.mjs validate --root exemples/assistant-devis
node tools/base.mjs discover "devis client" --root exemples/assistant-devis --limit 5
node tools/base.mjs route "je dois préparer un devis client" --root exemples/assistant-devis
node tools/base.mjs route-test --root exemples/assistant-devis --from .ai/routing/route-tests.json
node tools/base.mjs build routing-registry --root exemples/assistant-devis
node tools/base.mjs docs model --root.
node tools/base.mjs docs build --public --root . --out public-site
node tools/base.mjs open nouveau-devis --root exemples/assistant-devis --projection instructions
node tools/base.mjs invoke calculer-devis devis/DEV-2026-001.json --root exemples/assistant-devis          # dry-run
node tools/base.mjs invoke calculer-devis devis/DEV-2026-001.json --root exemples/assistant-devis --execute --confirmed
```

## Scale diagnostics (separate package CLI)
Scale tooling stays **out of the core CLI** to keep it thin. The optional `@ai-swiss/base-index-local`
package ships a `base-index-local` bin: `build <root>` (project the derived index), `search <root>
"<query>"`, `route <root> "<request>"` (indexed routing, same statuses as `base route` by default), and `bench
[--sizes …]` (reproducible benchmark, `docs/guides/benchmarks-echelle.md`). Routing reasons stay inspectable
via `base route … --json`.

## Notes for maintainers
- `parseArgs` rejects missing flag values and bad enums (`--projection`, `--limit`) up front.
- The CLI is the reference for FR-CORE behaviour at the boundary; keep it thin — logic belongs in the broker, not here.
- `--config` resolves **once** and threads `{config}` to the broker call (architecture.md §4).
