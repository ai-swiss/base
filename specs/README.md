# BASE — Engineering Specifications

> **Audience: developers and maintainers — not end users.**
> This folder is the engineering source of truth for **BASE-the-tooling**: the broker (`tools/base-core.mjs`), the CLI (`tools/base.mjs`), the MCP server (`mcp/`), the schemas, and the extension points. It describes *what the software does and why*, precisely enough to maintain it, extend it, or reimplement it.
>
> If you are an **end user** who wants to *use* BASE (create an assistant, write a devis), you are in the wrong place — read [`../README.md`](../README.md) and [`../docs/`](../docs/) instead. Those teach the method. This folder specifies the machinery.

This repository **dogfoods its own method**: BASE is built the AI-first, spec-driven way it advocates — text is the source of truth, AI drafts, humans validate, files are observable.

---

## How this folder works

```
.
├── decisions/           ← architecture & change records (tracked change plane; immutable, superseded never edited)
└── specs/
    ├── README.md        ← this file (workflow guide)
    └── current/         ← the living specification — the single source of truth
        ├── README.md        ← index + overview of BASE-the-tooling
        ├── CHANGELOG.md     ← change history for the spec
        ├── 00_overview/     ← vision, scope/perimeter
        ├── 10_core/         ← requirements, architecture, one chapter per subsystem
        └── 30_schemas/      ← machine-readable schemas (resource, config, manifest)
```

### Rules
1. **`current/` is the single living spec.** There is no parallel snapshot tree; a historical specification is a git tag — `git show v1.0.0:specs/current/10_core/requirements.md`. The Design-History question is answered by git, not a copied folder.
2. **Statusless truth — *what the system does*, not *what was built*.** No `pending`/`done`/`Built`/`Fixed` status in a chapter; trajectory (what changed, when) lives in `CHANGELOG.md`, `.plans/`, and git. The bar to hold every chapter to: *could the code be deleted and regenerated from `specs/` plus its tests?*
3. **Never invent a requirement.** Mark unknowns inline as `[NEEDS CLARIFICATION: reason]`.
4. **Update `CHANGELOG.md`** in the same edit as any notable spec change.
5. **The code is part of the spec.** "Matches `functionName`" makes that function's source normative. Reference functions **by name** (stable), not line number (drifts).
6. **Spec discipline is gate-enforced** (NFR-CORE-010): the requirements→tests matrix is regenerated-and-diffed (`npm run spec:matrix`), IDs are immutable (`npm run spec:ids`), and a code change touches `specs/` or declares `[SPEC-NEUTRAL: reason]` (`npm run spec:sync`).

### Semantic IDs
Format `{PREFIX}-{DOMAIN}-{NNN}`:
- `UR-` user/stakeholder requirement · `FR-` functional requirement · `NFR-` non-functional requirement · `AD-` architecture decision.
- Domains: `BUILD, CHANGE, CLI, CONFIG, CORE, DOCS, DOCTOR, EGRESS, FEEDBACK, INIT, MARKERS, MCP, ONTOLOGY, PARSE, POLICY, PROMOTE, RANK, ROUTE, SCALE, TRACE, VALID`.
- **Immutable once merged**: never renumbered, reused, or deleted (a de-scoped requirement keeps its ID). Each chapter declares the namespace it `Owns:`. Gate: `npm run spec:ids`.
- Example: `FR-RANK-001`, `FR-EGRESS-001`, `AD-CORE-002`.

### Versioning (semver)
- **MAJOR** — breaking change to a public contract (CLI command, MCP tool, frontmatter format, schema).
- **MINOR** — additive tool (a new port, a new optional field).
- **PATCH** — clarification, typo, non-behavioural edit.

### Releasing a version
When `current/` is reviewed and stable, set the version in `current/CHANGELOG.md` (move its `[Unreleased]` heading to `[X.Y.Z] - <date>`) and tag the release in git (`git tag vX.Y.Z`). The tag **is** the frozen specification: read a past spec with `git show vX.Y.Z:specs/current/10_core/requirements.md`. No folder is copied — history lives in git, the working tree stays a single `current/`.

---

## Relationship to other docs

| Location | Audience | Purpose |
|---|---|---|
| `specs/` (here) | developers / maintainers | engineering contract of the **tooling** |
| `docs/` | end users | teach the **method** and how to use BASE |
| `base.schema.json` (repo root) | machines | canonical resource schema (referenced from `30_schemas/`, never copied) |
| `.temp/` (gitignored) | us, during dev | working plans, audits, scratch |

`docs/reference/specification-v0.md` is **superseded by this folder** and now serves as a short public pointer here.
