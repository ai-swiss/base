---
schema_version: base.resource.v1
id: template-spec-leaf
type: document
title: Spec leaf template
description: The shape of a spec chapter under specs/current/. A light checklist, not a rigid form. Copy the block, delete the hints.
scope: team
status: active
sensitivity: internal
---

# Spec leaf template

A spec leaf is one chapter of `specs/current/`: the **present** behaviour of one subsystem,
stated **statuslessly** (no `pending`/`done`/`built`), precise enough to reimplement, under
**250 lines**. IDs are allocated centrally with `node tools/spec/new-id.mjs` and registered in
`specs/current/10_core/requirements.md`; a leaf **cites** them in prose, it does not invent
them and it does not restate their proof (proof is generated into `requirements-matrix.md`).
This is a checklist of recommended sections, not a form to fill rigidly: a small leaf may need
only two of them.

```markdown
# <NN> · <Subsystem name>

> **For developers and maintainers.** <One sentence: what this chapter governs.>
>
> Owns: <ID-NAMESPACE-*>   (the ID namespace this chapter is responsible for, e.g. FR-ROUTE-*)

## What it does
<the key behaviour, present tense, statusless. Name the function(s) in tools/ that are normative.>

## Rules and invariants
<the precise rules, each citing the ID it satisfies (FR-..., NFR-..., RC-...). Cite, do not re-prove.>

## How it connects
<the ports, callers, and adjacent chapters; relative links to the leaves it depends on.>
```

A leaf does not carry a proof table: proof lives once in
[`../../../../specs/current/10_core/requirements-matrix.md`](../../../../specs/current/10_core/requirements-matrix.md),
regenerated from the tests.
