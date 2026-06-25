---
schema_version: base.resource.v1
id: implement
type: process
title: Implement a spec
scope: team
status: active
sensitivity: internal
name: implement
description: "Write or modify BASE's code, spec leaves, agents and tools to the highest bar, with the narrowest test that can falsify it, ending green."
use_when: Build BASE source whose approach is already clear - write or modify code, spec leaves, agents and tools, with tests, ending green. Also the landing for a contributor fixing a bug or sending a patch/PR to BASE.
keywords: [fix, bug, contribute, contribution, patch, PR]
routing:
  examples:
    - Implement this BASE spec
    - Build this feature in the BASE core
    - Write the code and the spec for this feature
    - Fix a bug in the BASE CLI
    - Contribute a fix or patch to BASE
  avoid_when:
    - Audit or harden a user's existing BASE project (that is entretien-base).
    - Work out the approach first (that is plan).
argument-hint: "[the change to build]"
user-invocable: true
allowed-tools: Read, Write, Edit, Bash
---

# Implement a change

Build to the highest bar: load `skills/competences/code-craft/SKILL.md` and apply it to every
line. The truth and change planes move together.

## Steps

1. **Define done first.** The test that proves the behaviour, the command that must go green.
   Without a verifiable criterion you are not coding, you are hoping.
2. **Work the smallest correct scope.** Nothing beyond the change: no speculative config, no
   error handling for impossible cases, no field "for later".
3. **Code and spec in the same change.** When behaviour changes, the `specs/current/` leaf
   changes too (use `templates/spec-leaf.md` for a new chapter), or the work declares
   `[SPEC-NEUTRAL: reason]`. New IDs come from `node tools/spec/new-id.mjs`; cite them in prose,
   never restate their proof.
4. **Tests are the specification.** Each validated requirement = one named test that would fail
   without it. Test behaviour, not implementation. Run the narrowest test that can falsify the
   change; the full suite belongs to `verify`.
5. **No cohabitation.** Whatever the change replaces dies in the same change. Clean up your own
   orphans (imports, dead code, obsolete tests) in the same diff.
6. **Update the visible record.** A public-surface or visible-docs change adds its `[Unreleased]`
   line to `CHANGELOG.md`, or declares `[CHANGELOG-SKIP: reason]`.
7. **Run the adversarial pass** on your own diff (the grid in `code-craft`), then hand off to `verify`.

## What you never do

- Swallow an error, add a silent fallback, or cap without announcing it.
- Leave a `[A COMPLETER]` placeholder or a reference to the plan in committed code.
- End on red: the change is not done until its narrowest tests pass.
