# Developing BASE

This is the entry point for working on **BASE itself** — the framework's source, specs, and
gates. It is the *forge*, kept separate from the *product*: if you want to **use** BASE (create
an assistant, write a devis), read [`README.md`](README.md) and [`docs/`](docs/) instead. Those
teach the method; this page is for contributors changing the machinery.

The shape of the code itself — the parts and the invariants that hold them together — is mapped in
[`ARCHITECTURE.md`](ARCHITECTURE.md).

The apparatus described here is **deliberately minimal**. The goal is a light but effective
framework: a handful of targeted skills and gates, each earning its place, nothing decorative.
A reviewer who values mastery should find the development discipline tight and obvious, not
heavy. We keep only what makes a framework genuinely maintainable.

## The workshop: one agent

BASE develops itself with BASE. A single agent, [`base-contributor`](.ai/agents/base-contributor/AGENT.md),
routes contributor work to the right step:

- **understand-state** — read what the spec requires, what tests prove, what to do next.
- **plan** — work out the approach before building, when the work is consequential.
- **open-change** — open a durable record in `decisions/` for a unit of work or a decision.
- **implement** — write code and spec together, to the highest bar, ending green.
- **verify** — run the gates before pushing.
- **decide** — build a decision sheet to collect choices on several open points at once.

Load `base-contributor`'s `AGENT.md` and follow its routing table — the reliable entry, since the
agent reads contributor intent in context. The raw `node .ai/base.mjs route "<task>" --root .` CLI
also works but routes best with process-shaped phrasing (e.g. "open a change record", "run the
gates"); when in doubt, load the `AGENT.md`. The agent carries the craft competences it needs
(`code-craft`, `code-planning`, `human-writing`, `human-writing-institution`).

## The three planes

Every fact lives in exactly one place (full discipline in
[`specs/current/00_overview/les-deux-plans.md`](specs/current/00_overview/les-deux-plans.md)):

| Plane | What it holds | Where |
|---|---|---|
| **Truth** | what BASE *is*, stated statuslessly, with its proof | [`specs/`](specs/README.md), the code and its tests |
| **Change** (tracked) | *why* it is so and what changed, with alternatives | [`decisions/`](decisions/index.md), `CHANGELOG.md` |
| **Scratch** (personal, gitignored) | working plans and dated reviews | `.plans/`, `.reviews/` |

To learn the current state, read `specs/` first, then the code — never a plan or a review.

## One command before pushing

The discipline is gate-enforced, not trusted. One command runs the **core** gates before committing
or pushing:

```bash
npm run check
```

It chains the spec-discipline gates (`spec:check`), the typecheck, `validate`, `route-test`,
the docs model, and the tests. The optional `commit-msg` hook runs the drift gates on every
commit: `git config core.hooksPath .githooks`.

CI runs **more**, so green-here is not green-everywhere: coverage thresholds, the regenerated-artifact
diffs (`base index` / `base build`), `doctor`, the pack smoke test, and the MCP and Studio suites.
Run those when you touch those areas. Every gate (what it checks, where it runs, how to fix it) is
catalogued in [`docs/reference/gates.md`](docs/reference/gates.md); the commands are in
[`CONTRIBUTING.md`](CONTRIBUTING.md) and [`specs/README.md`](specs/README.md).

Cutting a release is a separate, governance-gated step with its own runbook,
[`RELEASING.md`](RELEASING.md).

## What we deliberately keep out

Minimalism is a feature, and saying no protects it. BASE's development does **not** adopt:

- **Heavy process machinery** — no risk-management folders, formal validation protocols, or
  multi-level work profiles. That weight belongs to specialised stacks, not a public framework
  someone should be able to adopt alone.
- **Rigid section templates as mandatory forms** — the leaf and record templates are checklists,
  not gates. A small change should not fight a form.
- **Hand-maintained proof tables** — proof is *generated* into the requirements matrix and
  diffed, so it cannot quietly lie. We never copy it by hand into each leaf.
- **A cross-harness block generator** — harness files do not duplicate the marker set; a single
  test keeps them consistent. A sync generator would be over-engineering for no gain.
- **A disk↔inventory audit gate** — the inventory *is* a fresh disk walk, so the two cannot
  drift; the one derived artifact that could, `base.manifest.json`, is already regenerated and
  diffed in CI. An extra audit would guard a problem that the architecture removes.

If a new control is ever worth adding, it earns its place through a `decisions/` record with the
alternatives weighed — never by accretion.
