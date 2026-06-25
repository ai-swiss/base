---
schema_version: base.resource.v1
id: template-plan
type: document
title: Plan template
description: The shape of an execution plan in .plans/. Copy the block, fill every section, delete the hints.
scope: team
status: active
sensitivity: internal
---

# Plan template

A plan turns a request into an execution plan precise enough that two implementers would
produce nearly the same code. It lives in `.plans/YYYY-MM-DD_subject.md` (personal, gitignored)
and is disposable after merge: the code, tests and CHANGELOG must stand on their own. The
doctrine behind each section is in [`../skills/competences/code-planning/SKILL.md`](../skills/competences/code-planning/SKILL.md).

```markdown
# Plan: <subject>

- **Date:** <YYYY-MM-DD>
- **Origin:** <3-5 lines: the concrete feedback or problems that triggered this work>

## Non-negotiable rules
<repo invariants this work must respect, and the exact verification commands to run per slice>

## Engineering doctrine
<for each principle: a name + a sentence + where in this work it applies>

## Slices
| # | Content | Size | Depends on |
|---|---|---|---|

## Detailed slices
### Slice 1 — <name>
- Why this shape: <3-5 lines, naming the doctrine principles it embodies>
- Signatures / files touched:
- Rules (each paired with a named test):
- Tests (unit / contract / e2e) and their files:
- Deleted (the old code this replaces):
- Spec + CHANGELOG sync if a contract changes:

## Known traps
<each foreseeable mistake, phrased as an instruction, to read before coding the slice>

## Self-review grid
<10-12 binary questions to ask of the diff before showing it>

## Definition of done
- [ ] <mechanically verifiable criteria>
```
