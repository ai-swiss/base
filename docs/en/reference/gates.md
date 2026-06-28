<!-- fr-synced: 25e0fc55650c859ba0c79972a7f10540ab37a82b -->
# BASE's gates

BASE's discipline is held by controls, not by trust. This page lists them so that, faced with a
failure, a contributor knows what the gate checks and how to fix it.

Three levels: the commit **hook** (optional, `git config core.hooksPath .githooks`), the local
**`npm run check`** command (the heart of the gates, to pass before pushing), and **CI** (which runs
more of them). So "green locally" is not "green everywhere": CI adds the coverage, the regenerated
artifacts, the doctor, the smoke pack, and the MCP and Studio suites.

```mermaid
flowchart LR
    A[Commit hook (optional)] --> B[npm run check (before pushing)]
    B --> C[CI (coverage, doctor, smoke, MCP, Studio)]
```

## `npm run check` (the heart, locally)

| Gate | Checks | Fix |
|---|---|---|
| `spec:matrix --check` | The requirements matrix is up to date; no citation points to missing evidence. | `npm run spec:matrix`, then review the lines in the change. |
| `check-ids` | Identifiers are stable: no renumbering or reuse. | Keep the existing id; a new id is allocated with `spec:new`. |
| `check-id-namespaces` | Each id stays in the namespace declared by its section. | Align the id with its section's prefix. |
| `check-leaf` | A spec leaf stays short (<= 250 lines), statusless, and routed. | Split the leaf, remove the status, attach it. |
| `check-markers` | The closed set of markers (`[A VALIDER]`, `[ATTENTION]`, `[A COMPLETER]`, `[DECISION]`) stays consistent. | Use only these four markers. |
| `check-statusless` | Reference pages are in the present tense, statusless. | Rephrase in the present tense; remove the status. |
| `check-emdash` | No em-dash in French content (`docs/`, README, CONTRIBUTING, MANIFESTO). | Replace with a colon, parentheses, or a single hyphen. |
| `check-punctuation` | Tight Swiss-French punctuation in the French (`docs/`, `exemples/`, README, CONTRIBUTING, MANIFESTO): no space before `: ; ! ?`, tight quotes, no em-dash in the examples. | Tighten the punctuation; an exception is declared on the line with `[PUNCT-OK: reason]`. |
| `check-lexique` | No banned phrasing appears in the French prose. | Rephrase; an exception is declared on the line with `[LEXIQUE-OK: reason]`. |
| `check-translations` | Translations name French as the reference version. | Add the mention of the French source. |
| `check-tree` | No stray file; docs pages are in kebab-case and <= 400 lines. | Rename or split; remove the stray file. |
| `typecheck` | The types pass (`tsc`, with no unused variable). | Fix the reported type errors. |
| `validate` | Every resource respects the `base.resource.v1` contract. | Fix the reported frontmatter. |
| `route-test` | The expected routes (fixtures `.ai/routing/route-tests.json`) are stable. | Adjust the routing signal (`use_when` / `routing.examples`) or the fixture. |
| `docs validate` | The documentation model is consistent (zero errors). | Follow the error reported by the model. |
| `npm test` | The core and package test suite passes. | Fix the cause; never disable a test. |

## CI only (beyond `npm run check`)

| Gate | Checks | When to run it locally |
|---|---|---|
| `test:coverage` | Coverage thresholds (lines 90, branches 80, functions 90). | `npm run test:coverage` when you touch the core. |
| Manifest diff | `base index` regenerated; `base.manifest.json` is up to date. | `npm run index`, then `git diff base.manifest.json`. |
| Projections diff | `base build bootstrap --write`; `AGENTS.md` / `CLAUDE.md` / `BASE_BOOTSTRAP.md` are up to date. | `node tools/base.mjs build bootstrap --write`, then `git diff`. |
| `doctor` | Healthy corpus: no dead link, orphan, or stale resource. | `node tools/base.mjs doctor --root .`. |
| `smoke:pack` | The npm package installs and starts. | `npm run smoke:pack`. |
| MCP | The MCP server compiles and its tests pass. | See [`CONTRIBUTING.md`](../../../CONTRIBUTING.md) when you touch `mcp/`. |
| Studio | Studio's build and UI / E2E suites pass. | Same, when you touch `tools/studio/`. |

One rule above all others: a red gate is information, never an obstacle to work around. We fix the
cause; we disable neither a hook (`--no-verify`) nor a test.
