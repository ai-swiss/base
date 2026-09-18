<!-- fr-synced: 1a1989e576976a4c4197bd1bb12011164a1af1f9 -->
# BASE's gates

BASE's discipline rests on controls, not on trust. This page catalogs them so that, when something
fails, a contributor knows what the gate checks and how to fix it.

There are three levels: the commit **hook** (optional, `git config core.hooksPath .githooks`), the
local **`npm run check`** command (the heart of the gates, to be run before you push), and **CI**
(which runs more of them). "Green locally," then, does not mean "green everywhere": CI adds coverage,
the regenerated artifacts, the doctor, the smoke pack, and the MCP and Studio suites.

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
| `check-frontmatter-yaml` | Frontmatter stays valid for a strict YAML reader (GitHub, Astro): an unquoted value must not contain a colon followed by a space. | Wrap the value in straight double quotes (`description: "text with a colon: here"`). |
| `check-punctuation` | Tight Swiss-French punctuation in the French (`docs/`, `exemples/`, README, CONTRIBUTING, MANIFESTO): no space before `: ; ! ?`, tight quotes, no em-dash in the examples. The language is read, not assumed: a nested root whose `base.config.json` declares anything but French is skipped whole, and the run names it. | Tighten the punctuation; an exception is declared on the line with `[PUNCT-OK: reason]`. |
| `check-lexique` | No banned phrasing appears in the French prose. | Rephrase; an exception is declared on the line with `[LEXIQUE-OK: reason]`. |
| `check-translations` | Translations name French as the reference version, and their `fr-synced` marker is fresh: the `docs/en|de|it/` mirrors against the French page they shadow, and the word tables `tools/core/lang/{en,de,it}.mjs` against `fr.mjs`. A missing table is not a failure; a table that exists declares what it translates. | Add the mention of the French source; re-translate the changed keys, then recompute the marker with `git hash-object <source>`. |
| `check-tree` | No stray file; docs pages are in kebab-case and <= 400 lines. | Rename or split; remove the stray file. |
| `typecheck` | The types pass (`tsc`, with no unused variable). | Fix the reported type errors. |
| `validate` | Every resource respects the `base.resource.v1` contract. | Fix the reported frontmatter. |
| `route-test` | The available fixtures and `routing.examples` return the expected result on the lexical strategy and configured rankers. This check covers Track 2 only with `--strategy production`, a non-deterministic model run. | Adjust the signal (`use_when` / `routing.examples` / `routing.avoid_when`) or the fixture; if Track 2 is active, replay it separately. |
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

`base route-eval` is a maintainer tool, gated on Ollama (`--ollama`): without that flag the command
prints the header and how to run it, nothing more. It runs neither in `npm run check` nor in CI.

## Manual probes with a real harness

`npm run probes -- --suite smoke` plans a qualification of the package that would actually ship:
it prints the scenarios, their timeout, and the evidence location without calling a model. Running
them remains an explicit act:

```bash
npm run probes -- --suite release --harness claude-code --model <model> --effort medium --max-budget-usd <per-invocation> --yes
npm run probes -- --suite release --harness codex --model <model> --effort medium --yes
```

The runner packs and installs BASE in an isolated environment, starts every scenario in a temporary
root outside the contributor repository, then copies its final state under
`.temp/probes/<date>_<suite>_<revision>/` with the raw harness trace, normalized tool calls, versions,
package hashes, workspace changes, and verdicts. These recordings may contain local paths and text,
so `.temp/` remains ignored by git. The versioned non-regression contracts live in `tests/probes/`.

`--harness` explicitly selects `claude-code` or `codex`; the runner uses `CLAUDE.md` or `AGENTS.md`
respectively in initialized roots. Claude Code requires a per-invocation monetary cap enforced by
its CLI. The plan counts primary attempts and semantic evaluations separately before showing the
maximum total. Codex does not expose that cap, so the runner's per-invocation timeout remains the
enforced bound.

The `release` suite follows visible user journeys: ordinary configuration and quote requests,
repository discovery, creation of a team workflow with HTML review, evidence-based improvement
from recorded friction, ambiguity, honest abstention, a contradiction held for confirmation, a
first request in four languages, local and MCP questions with citations, missing knowledge, and
non-disclosure of a confidential pricing grid.

Reads, commands, citations, and file changes remain mechanical evidence. A quality with no single
valid wording, such as an honest boundary or a genuinely useful question, is evaluated by a second
tool-free invocation against a versioned rubric. It must justify every verdict with an exact quote
from the answer and can never override a mechanical failure.

After publication, a separate suite checks the journey that starts from a shared link. It requires
web access and targets the immutable release URL, never the moving default branch:

```bash
npm run probes -- --suite public --harness claude-code --model <model> --effort medium --max-budget-usd <per-invocation> --yes
npm run probes -- --suite public --harness codex --model <model> --effort medium --yes
```

A network failure in that suite does not alter the pre-publication verdict on the installed
package.

These probes run neither in `npm run check`, nor in `npm run check:release`, nor in CI, nor on a
schedule. They observe how a real harness follows BASE. Deterministic gates remain the source of
schema, confinement, write, and egress guarantees.

One rule above all others: a red gate is information, never an obstacle to work around. We fix the
cause; we disable neither a hook (`--no-verify`) nor a test.
