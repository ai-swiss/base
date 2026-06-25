---
schema_version: base.resource.v1
id: understand-state
type: process
title: Understand the state
scope: team
status: active
sensitivity: internal
name: understand-state
description: "Read where BASE stands: what the spec requires, what is proven by tests, what is unproven, and what to work on next. Use to orient before changing anything."
use_when: Read the current state of the BASE framework - what exists, what is proven by tests, what is missing, and what to work on next.
routing:
  examples:
    - What is the state of the BASE spec?
    - What is proven and what is not in BASE?
    - What should I work on next in BASE?
    - Show me the gaps in the requirements matrix
  avoid_when:
    - Audit or clean up a user's own BASE project (that is entretien-base).
    - Create or improve a business assistant (that is createur-agent).
    - Build a change that is already understood (go to implement).
argument-hint: "[the area you care about, if any]"
user-invocable: true
allowed-tools: Read, Bash
---

# Understand the state

Orient before touching anything. The reading order is fixed: **`specs/` first, then the code**,
never a plan or a review (see `specs/current/00_overview/les-deux-plans.md`).

## Steps

1. **Read the truth plane.** Open `specs/current/10_core/requirements.md` (the ID index) and the
   chapter leaf for the area in question. This is what BASE *requires*.
2. **Read the proof.** Open `specs/current/10_core/requirements-matrix.md` (generated). The
   `✅`/`⚠️`/`❌` column tells you which requirements are proven, weakly proven, or unproven.
   Run `npm run spec:matrix` to regenerate it if in doubt.
3. **Read the change plane.** Skim `decisions/index.md` for the durable choices and any open
   change record. This is *why* things are the way they are.
4. **Confirm against the code.** For a behaviour, read the function named normative in the leaf;
   the regeneration bar is: could the code be rebuilt from the spec plus its tests?
5. **Report the state and the next step.** Name what is solid, what is `⚠️`/`❌`, and the single
   most valuable next change. Hand off to `plan` (consequential) or `implement` (obvious).

## What you never do

- Treat a plan or a review as current truth.
- Invent a state you did not read; cite `file:line` or command output.
- Drift into auditing a user's BASE project — that is a different agent.
