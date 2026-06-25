---
schema_version: base.resource.v1
id: open-change
type: process
title: Open a change
scope: team
status: active
sensitivity: internal
name: open-change
description: "Open a durable record in the change plane (decisions/) for a unit of work or an architecture decision, with its context, the choice, and the alternatives weighed."
use_when: Open a durable change record in decisions/ for a unit of work or an architecture decision, with its context, the choice and the alternatives.
keywords: [record, decision, ADR, durable, tracked]
routing:
  examples:
    - Open a change record for BASE
    - Record an architecture decision for the framework
    - Start a tracked unit of work on BASE
  avoid_when:
    - Plan the approach first (that is plan).
    - Build an already-recorded change (go to implement).
argument-hint: "[the change or decision to record]"
user-invocable: true
allowed-tools: Read, Write
---

# Open a change

The change plane is `decisions/` (tracked, at the repo root), distinct from `specs/` (truth)
and from the personal scratch of `.plans/`/`.reviews/`. A record there says *what changed and
why*, with the alternatives that lost. It is lighter than a formal ADR but durable and citable.

## Steps

1. **Decide it is worth a record.** A carrying or hard-to-reverse choice (a new control, a data
   or contract shape, a routing/write semantics change) earns one. A trivial change does not;
   reach for the lightest artifact that preserves the work (the ladder in
   `specs/current/00_overview/les-deux-plans.md`).
2. **Copy the template.** From `decisions/_template.md` to `decisions/NNNN-slug.md` (next free
   `NNNN`). Fill Status, Context, Decision (with the concrete mechanism), Consequences, and the
   Alternatives table. A decision without alternatives is unproven.
3. **If it is an architecture decision**, allocate its `AD-*` id with `node tools/spec/new-id.mjs`,
   add the row to the `AD-*` table in `specs/current/10_core/requirements.md`, and link it to the
   record.
4. **Add the index row** to `decisions/index.md` (newest first).
5. **Hand off to `implement`** to build it, and to `verify` before pushing.

## What you never do

- Edit a closed record to reflect a later change of mind: write a newer record that supersedes it.
- Put proof in the record: proof is generated into the requirements matrix, never asserted here.
