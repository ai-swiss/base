# 10 · Identifiers (the grammar)

> **For developers and maintainers.** How BASE's stable identifiers are shaped, allocated, and kept immutable. Stable IDs are the joints of the spec: `grep -r FR-EGRESS-001` reaches the requirement row, the tests that prove it, and its history. The grammar lives in one place in code, `tools/spec/id-grammar.mjs`, which every spec gate imports; this chapter is its prose contract.
>
> Owns: nothing. This chapter documents the grammar that the IDs in `requirements.md` obey; it allocates none of its own.

## The grammar

Every stable identifier is `{PREFIX}-{DOMAIN}-{NNN}`: an uppercase prefix, an uppercase domain drawn from the subsystem, and a three-digit number. Examples: `FR-EGRESS-001`, `NFR-CORE-010`, `RC-WRITE-002`, `AD-CHANGE-001`.

| Prefix | Kind | Lives in | Proven? |
|---|---|---|---|
| `UR` | Stakeholder / user requirement | `requirements.md` | by a test (or documentation-verified) |
| `NFR` | Non-functional requirement (a quality) | `requirements.md` | by a test |
| `FR` | Functional requirement (a behaviour) | `requirements.md` | by a test |
| `RC` | Risk control (a security or safety invariant) | `requirements.md` | by a test |
| `AD` | Architecture decision | `requirements.md` (index) + `decisions/` (record) | recorded, not proven |

Two families: **provable** (`UR`/`NFR`/`FR`/`RC`) carry a proof row in [`requirements-matrix.md`](requirements-matrix.md); **decision** (`AD`) records a choice in [`../../../decisions/`](../../../decisions/index.md) and is not "proven". Together they are the **stable** set, whose immutability is gate-enforced.

## Allocation by tooling, never by hand

A new ID is computed, never typed: editors demonstrably renumber, reuse, and duplicate identifiers. Ask the allocator for the next free number in a family:

```bash
node tools/spec/new-id.mjs FR EGRESS     # → next free FR-EGRESS-NNN
node tools/spec/new-id.mjs RC EGRESS     # → next free RC-EGRESS-NNN
npm run spec:new -- FR EGRESS
```

It returns `max(existing) + 1` for that `{PREFIX}-{DOMAIN}` (counting every mention, rows and cross-references), so a retired or gapped number is never reused. You then paste the allocated ID into the row where it belongs.

## Immutability

Once an ID is merged it is **never renumbered, reused, or deleted**. Gaps are normal and permanent. The immutability gate (`tools/spec/check-ids.mjs`) diffs the ID set in the working tree against a git baseline and fails on any ID that vanished or is duplicated; it also rejects a letter-suffixed row (`FR-XXX-003a`), which the plain grammar cannot see.

**De-scoping keeps the ID.** When a requirement is retired, mark its row with a trailing `[DE-SCOPED: reason]`. The matrix then renders it `⊘ de-scoped` and excludes it from the proof counts; the ID stays on the page rather than vanishing into history (a vanished ID would fail the immutability gate, and a reader greping it would find nothing). A leaf rename or split never touches IDs: the `Owns:` lines are the bridge between a namespace and its location.

De-scoped rows accumulate harmlessly, by design. They sit outside the active proof counts, so they never pollute the metrics, and there is **no cleanup to run**: deletion is forbidden by immutability. A periodic review (at a release boundary) confirms each is genuinely retired; the row then rides along, frozen, in that release's git tag. The de-scope lifecycle is proven end to end in `tests/requirements-matrix.test.mjs`.

## Proof strength

Each provable ID resolves to a proof status in the generated matrix:

- **✅ proven** — a real, non-skipped test cites it (in a `// Spec coverage:` header or a test title).
- **⚠️ weak** — its only citation is deliberately weak. Flag it at the test as `ID~weak[reason]`; the bracketed reason is **required** and is surfaced in the matrix.
- **❌ no test — GAP** — nothing cites it.
- **⊘ de-scoped** — retired (above); excluded from the counts.

Proof quality is monotone: the matrix `--ratchet` mode fails a change that raises the weak or gap count against the committed baseline, so unproven or weakly-proven requirements cannot accumulate.

**High-value IDs cite the assertion, not just the file.** A `// Spec coverage:` header (file granularity) is the default and is rename-safe. For the highest-stakes IDs, risk controls (`RC-*`) and any `~weak` proof, additionally name the ID in the proving test's title, so a reader greping the ID lands on the exact assertion rather than a file of many.

## How the IDs are kept honest (gates)

- **requirements matrix** (`tools/spec/requirements-matrix.mjs`): regenerated from `requirements.md` and the test suites, diffed for freshness, rejects a citation of an unknown ID, and ratchets weak/gap counts.
- **immutability** (`tools/spec/check-ids.mjs`): no ID renumbered, reused, deleted, duplicated, or letter-suffixed.
- **ID namespace** (`tools/spec/check-id-namespaces.mjs`): each row-defined ID stays within the `Owns:` namespace its section declares, so a domain never scatters across the central index.
- **leaf contract** (`tools/spec/check-leaf.mjs`): each chapter declares the namespace it `Owns:` and stays bounded, statusless and routed.

All three run locally (`npm run spec:check`) and in CI, under NFR-CORE-010. See [`les-deux-plans`](../00_overview/les-deux-plans.md) for why the present plane that these IDs anchor must stay statusless.
