---
schema_version: base.resource.v1
id: code-craft
type: competence
title: Code craft (the highest bar)
description: How to write, modify and review code so a pickiest reviewer finds nothing unjustifiable. Load whenever code is touched.
scope: team
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Writing master-level code: the highest bar

This skill applies whenever code is written, modified, or reviewed, in any language, in any
repo. It complements `../code-planning/SKILL.md` (which covers the plan); this one covers the act of
coding. The standard: the world's pickiest reviewer reads the diff
and finds **nothing unjustifiable**. Not "nothing wrong": nothing that cannot be explained in
one sentence, why it is there, in that form, in that place.

The conviction underneath it all: code is read a hundred times more often than it is written,
and debt always starts with a few lines nobody really looked at. Mastery is not using
patterns; it is that everything present has earned its place, and everything else is absent.

---

## 1. Before writing: think, say, push back

- **State your assumptions.** If several interpretations exist, present them, never pick one
  silently. If something is unclear, stop, name the confusion, ask.
- **Propose simpler when simpler exists.** Challenging the request is part of the job: "a
  function is enough here, the event system you describe would cost more than it returns."
  Say it before, not after.
- **Define "done" before starting**: the test that will prove the behavior, the command that
  must go green. "Fix the bug" becomes "write the test that reproduces it, then make it
  pass." Without a verifiable criterion you are not coding, you are hoping.
- **Work the smallest correct scope.** Nothing beyond the request: no unrequested
  configurability, no error handling for impossible scenarios, no field "for later." If 200
  lines could be 50, rewrite.

## 2. The law of abstractions: each one earns its place or does not exist

This is the heart of the highest bar. An abstraction (function, type, interface, layer,
parameter, module) costs four times: to understand, to name, to maintain, and to work around
the day it turns out wrong. It exists only if it pays that back.

- **An abstraction is justified by a real consumer**, never by an imagined future. Rule of
  three: generalize at the third occurrence, not before. At the second, duplicate and note
  the seam where the generalization would go. Duplication is cheaper than the wrong
  abstraction.
- **The four rules of simple design, in this order** (Beck): passes the tests; reveals
  intention; no piece of knowledge lives in two places; fewest possible elements. The order
  is half the rule: never sacrifice readability to deduplicate a textual coincidence.
- **Signs of a false abstraction**, to delete without debate: an interface with a single
  implementation, no second one planned, no testing need; a layer that only forwards; a
  parameter nobody passes; a boolean that switches behavior (= two functions); a name with
  "And" (= two things); catch-all `Manager`, `Helper`, `Utils`, `Service` (= the domain was
  never named).
- **The extension point is a new function, not one more parameter.** When a need forces a
  signature to grow, it is usually a second function asking to be born.
- **"Make the change easy, then make the easy change"** (Beck). If the code resists the
  modification, refactor first, in a separate commit, tests green before and after, then
  make the change that has become trivial. Never the two mixed together.

## 3. The default shape of code

The detail lives in the doctrine of `../code-planning/SKILL.md` §3; the essence fits in six reflexes:

- **Functional core, imperative shell.** Every decision is a pure function; IO (disk, HTTP,
  UI, clock, randomness) is injected or stays at the edge. An `if` that deserves a test
  lives in a pure function.
- **Data, not objects.** Plain structures + functions; variants as discriminated unions
  consumed by exhaustive branching that breaks at compile time when a case is added. Hidden
  state is the prime suspect in every bug.
- **Parse once, type forever.** A text format crosses a single boundary that turns it into
  typed data. Validate at the system's borders (user input, external APIs); trust the
  inside: re-checking what the type already guarantees is noise that hides the real checks.
- **Errors are data.** An expected failure becomes a typed value the caller handles; an
  impossible error is not caught, it must make noise. Never a swallowing `catch`, never a
  silent fallback, never an unannounced cap or truncation.
- **One source of truth per piece of state.** Whatever can be derived is derived; storing a
  projection of another state is scheduling their divergence.
- **Naming speaks the domain.** The trade's own words, precise, without technical vanity. A
  comment explains only what the code cannot say: a constraint, a why, a trade-off. A
  comment that paraphrases the next line is a defect.

## 4. Modifying existing code: surgery, plus the scout rule

- **Every line of the diff traces to a nameable intention.** No drive-by "improvement" that
  restyles the neighbor, no opportunistic reformatting that drowns the review.
- **Clean up your own orphans**: imports, variables, functions, and tests that YOUR change
  killed leave in the same diff.
- **Scout rule, but in the open**: an inconsistency found in passing (misleading name, old
  dead code, false doc, cosmetics) gets fixed, never "later", but the fix is declared
  (dedicated commit or note) and stays separable from the main change. Repairing silently is
  almost as bad as not repairing: the review must be able to judge each intention in
  isolation.
- **No cohabitation.** Whatever a change replaces dies in the same change. The old path
  "kept just in case" is debt wearing a disguise.
- **Follow the host file's style**, even if you prefer another. Local consistency beats
  personal preference; if the repo's style should change, that is an explicit decision, not
  a fait accompli.

## 5. Tests are the specification

- **Every validated requirement = one named test that would fail without it.** If you cannot
  write the test, you have not understood the requirement. The suite covers the key user
  journeys, the edge cases, and the contracts of the abstractions, not a percentage.
- **Test behavior, never implementation.** A test that breaks during a behavior-preserving
  refactoring is a faulty test. Test doubles (fake model, fake disk) are injected through
  the same seams as production: if testing is hard, the design is protesting, listen to it.
- **Tests are the API's first consumer**: writing them early means feeling the interface's
  ergonomics before freezing it. An API painful to test will be painful to use.
- **Property-based when the input space deserves it** (parsers, merges, idempotence,
  serialization round-trips): one property is worth a hundred examples.
- **Red → green → refactor, and never end on red.** All the repo's gates (tests, types,
  lint, build) pass at the end of every unit of work, not "at the end."

## 6. The adversarial pass: review your own diff like an enemy

Before showing anything, reread the entire diff against this grid. One "yes" = fix it first.
This is the review that does not depend on a reviewer's talent: it is institutionalized.

1. Does a function do two things, or exceed what an honest name can cover?
2. Does one piece of knowledge (rule, format, constant) live in two places?
3. Is any stored state derivable from another?
4. Does an abstraction in this diff have fewer than two real consumers and no testing need?
5. Did a boolean parameter, an "And" name, or a `Utils` appear?
6. Is an error swallowed, a fallback silent, a limit mute?
7. Does a comment paraphrase the code, or is a "why" missing where a trade-off was made?
8. Is there a leftover TODO, stub, dead code, or reference to the plan or ticket?
9. Is any line of the diff unrelated to a declared intention?
10. Would at least one test fail if each new rule were removed?
11. Do the docs, the spec, and the CHANGELOG still tell the truth after this diff?
12. If this diff were printed in a book under my name, would I leave it as is?

## 7. Anti-patterns of the AI implementer (hunt them in yourself)

- **Defensive theater**: try/catch and null checks on paths the types or the framework
  already guarantee. Robustness goes at the borders, not everywhere.
- **Narration**: comments that recount the change ("add the field"), conversation leftovers,
  references to the plan. Code is self-supporting; the plan is disposable.
- **Speculative generality**: a registry, a plugin system, a config for two known cases.
  Code the two cases; note the seam.
- **The rewriter's enthusiasm**: rewriting a healthy module because you would have done it
  differently. The replacement cost includes every already-fixed bug the rewrite
  reintroduces.
- **Cosmetic completeness**: producing a lot to look thorough. Density is politeness: every
  line, of code as of doc, must deserve its reading.
- **The lying green**: tests that pass because they test nothing (no discriminating
  assertion, doubles that short-circuit the logic under test). Checking that a test can fail
  matters as much as seeing it pass.

---

These rules are working if: diffs shrink at constant intention, the repo's abstractions can
be counted and justified one by one, external reviews find nothing but matters of taste, and
the code reads six months later without archaeology.
