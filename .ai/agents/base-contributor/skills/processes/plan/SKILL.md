---
schema_version: base.resource.v1
id: plan
type: process
title: Plan a change
scope: team
status: active
sensitivity: internal
name: plan
description: "Turn a request into an execution plan precise enough that two implementers would produce nearly the same code. Use before consequential work, not for an obvious one-line change."
use_when: Plan a change to BASE before building it - work out the approach, the architecture and the slices first, when the work is consequential.
routing:
  examples:
    - Plan a change to BASE before building it
    - Work out the approach for this BASE feature
    - Design the slices for this change to the framework
  avoid_when:
    - Implement an already-planned or obvious change (go to implement).
    - Just read the current state (that is understand-state).
argument-hint: "[the change to plan]"
user-invocable: true
allowed-tools: Read, Write
---

# Plan a change

A plan turns intent into an execution plan a junior or a context-free agent could follow
without inventing. The doctrine is in `skills/competences/code-planning/SKILL.md`; load it and
apply it. The shape is in `templates/plan.md`.

## Steps

1. **Ground first.** Run `understand-state` (or read `specs/` and the matrix) so the plan rests
   on what is, not on memory.
2. **Ask only design-changing questions.** Three maximum, each with concrete options; if visual,
   an ASCII mock-up per option. Record the answers in the plan's *Origin* section. If the user
   proposes better, adopt it.
3. **Write the plan** to `.plans/YYYY-MM-DD_subject.md` from `templates/plan.md`: origin,
   non-negotiable rules + exact verification commands, engineering doctrine (named principles
   anchored in this ticket), the slice table, detailed vertical slices, known traps, the
   self-review grid, the definition of done.
4. **Keep slices vertical, green, irreversible.** Each crosses all layers and ships observable
   behaviour; each ends with all gates green; each kills the code it replaces in the same slice.
5. **Hand off to `implement`**, slice by slice.

## What you never do

- Write truth into the plan: the plan is disposable, the code and `specs/` are the source.
- Leave a fuzzy task (no end test = not ready) or plan speculative generality for two cases.
