---
schema_version: base.resource.v1
id: verify
type: process
title: Verify the gates
scope: team
status: active
sensitivity: internal
name: verify
description: "Run BASE's own gates before committing or pushing: tests, typecheck, the spec-discipline chain, docs validation and routing. Green everywhere, or it is not done."
use_when: Run BASE's gates to confirm a built change is sound before committing or pushing - the matrix, the proof, the immutability check.
routing:
  examples:
    - Run the BASE gates before pushing
    - Check the spec discipline is green
    - Verify the requirements matrix and the immutability check
    - Is BASE ready to commit?
  avoid_when:
    - Audit a user's BASE project for health (that is entretien-base).
    - Build the change first (that is implement).
argument-hint: "[what you changed, if relevant]"
user-invocable: true
allowed-tools: Read, Bash
---

# Verify the gates

The discipline is gate-enforced, not trusted. A contributor runs the gates locally before CI
does. The single command runs them all; run it and read the output honestly.

## Steps

1. **Run the core gates:** `npm run check` (tests, typecheck, the `spec:check` chain, docs
   validation and route-test). Green here means the core is sound; CI additionally runs coverage,
   the regenerated-artifact diffs (`base index` / `base build`), `doctor`, the pack smoke test and
   the MCP/Studio suites — run those when you touch those areas (commands in `CONTRIBUTING.md`).
2. **Read each gate's meaning** if one fails (the full registry is `docs/reference/gates.md`; each
   script also prints what it checks): the requirements matrix rejects phantom
   citations; `spec-sync` wants a runtime change to touch `specs/` or declare `[SPEC-NEUTRAL]`;
   the immutability check forbids renumbering or reusing an ID; `changelog-sync` wants a visible
   change to carry its `[Unreleased]` line.
3. **Fix the cause, not the symptom.** Never bypass a hook (`--no-verify`, `--force`), never add a
   silent fallback to make a gate pass. A red gate is information.
4. **Confirm the proof is honest.** Regenerate the matrix (`npm run spec:matrix`) and check that
   the change's requirements are `✅`, not `⚠️`/`❌`; a gap is reported, never hidden.
5. **Report green** (or the exact failing gate and why), then hand back for commit.

## What you never do

- Declare done on a red gate, or claim a gate passed without running it.
- Run heavy suites to look thorough; run what can falsify the change, plus the one command.
