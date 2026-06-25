---
schema_version: base.resource.v1
id: code-planning
type: competence
title: Code planning (intent to execution plan)
description: How to turn a request into an execution plan precise enough that two implementers would produce nearly the same code. Load before consequential work.
scope: team
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Planning code: from a ticket of intent to an execution plan

This skill applies whenever a request ("redo the evaluation screen", "add a bootstrap")
becomes an **execution plan** a developer — even a junior, even an AI agent with no context —
can follow without inventing. The bar: the plan is precise enough that two different
implementers would produce nearly the same code, and motivated enough that a demanding
reviewer recognises a doctrine in it, not a task list. It complements
[`../code-craft/SKILL.md`](../code-craft/SKILL.md), which covers the act of coding.

A plan lives in `.plans/YYYY-MM-DD_subject.md` of the repo it concerns. It is disposable
after merge: the code, the tests and the CHANGELOG must stand on their own, hence rule 1
below.

---

## 1. The eight sections of a complete plan, in this order

1. **Origin** — 3 to 5 lines: which concrete feedback or problems triggered this work (cite
   the observed symptoms, not generalities). This is what lets you arbitrate later: "does this
   slice serve one of the origin problems?"
2. **Non-negotiable rules** — the repo's invariants (zero dependency, the write gate, tests by
   role, max component size, no old/new code cohabitation…) AND the exact verification commands
   to run at the end of each slice.
3. **Engineering doctrine** — see §3. This is what tells a plan apart from a to-do list.
4. **The slice table** — number, content, estimated size, dependencies between slices.
5. **The detailed slices** — see §4.
6. **Known traps** — each mistake already made on this repo or foreseeable on this ticket,
   phrased as an instruction ("apply bottom-up, or the line numbers shift"), to read BEFORE
   coding the relevant slice.
7. **The self-review grid** — 10 to 12 binary questions the implementer asks of THEIR own diff
   before showing it (function over 40 lines? derivable state stored? one rule known in two
   places? a silent cap?). One "yes" = fix it first.
8. **The definition of done** — checkboxes, mechanically verifiable where possible.

## 2. Before writing: the questions that change the design

- Ask ONLY the questions whose answer changes the architecture or the scope — never those a
  convention or the code already settles. Three questions maximum, each with concrete options
  and, if visual, an **ASCII mock-up per option**.
- Record the answers IN the plan (origin section): a plan whose reasons are forgotten gets
  re-litigated at every review.
- If the user proposes something better than your options (it happens often), say so and adopt it.

## 3. The doctrine: name the principles, anchor them in the ticket

A list of generic principles is useless. The form that works: for each principle, **a name + a
sentence + the precise place in the ticket where it applies**. At review, a deviation becomes
nameable ("that violates D-6") instead of debatable. The hard core, valid everywhere:

- **Functional core, imperative shell.** Every decision is a pure function; IO (disk, HTTP,
  UI, CLI) is a thin shell. Practical rule: *an `if` that deserves a test lives in a pure
  function*. Corollary: clock and randomness are INJECTED (`now` as a parameter), never read inside.
- **Data, not objects.** Plain structures + functions; variants as discriminated unions
  (`kind`) consumed by exhaustive switches that break at compile time when a case is added.
  No classes, no hidden state.
- **Parse once, type forever.** Each text format crosses ONE boundary that turns it into typed
  data; a second regex on the same format elsewhere is an architecture bug.
- **Errors are data.** A render never throws; a parse failure becomes a degraded, displayable
  value; a domain failure becomes a message the caller shows.
- **One write path.** Compute functions never touch disk; every byte written passes through
  the repo's validation mechanism (gate, preview, create-only).
- **One source of truth per state.** Whatever can be derived is derived. The number-one smell
  in UI: a state that stores a projection of another state.
- **Symmetry of the doors.** CLI, server, UI = thin adapters over the same core functions;
  zero decisions in an adapter.
- **Written complexity budget.** Say "everything is linear" and hold to it; prefer
  prefix/suffix to LCS when it covers 95% of cases; and when you bound (cap, truncation),
  ANNOUNCE it to the user — never a silent limit.
- **No speculative generality.** A component does ONE thing; the extension point is a new
  function, not one more parameter. A boolean that switches behaviour = two functions; a name
  with "And" = two things.
- **Naming speaks the domain.** The trade's own words (`hunk`, `perimeter`, `friction`), never
  `Manager`/`Helper`/`Utils`. A comment explains only what the code cannot say: a constraint,
  a "why" — never a "what".

## 4. The slices: vertical, green, irreversible

- **Vertical**: each slice crosses all layers (pure core → adapters → UI → tests → e2e →
  spec/CHANGELOG) and ships an observable behaviour. Never a "backend only" slice waiting for
  its twin.
- **Green**: the slice ends with ALL suites green (the commands are in plan section 2). You do
  not start the next one on red.
- **No cohabitation**: if a slice replaces something, the old code dies in the same slice. A
  plan that says "we'll clean up later" is planning debt.
- Each detailed slice contains, in this order: (1) **"Why this shape"** — 3 to 5 lines naming
  the doctrine principles it embodies; (2) the **exact signatures** of new functions/components
  and the files touched; (3) the **precise rules**, each paired with a named test ("each rule =
  one test"); (4) the **test list** (unit, UI, e2e) with the file each goes in; (5) what is
  **deleted** (components, styles, API parameters, obsolete tests); (6) the **spec + CHANGELOG**
  sync if a contract changes.
- ASCII mock-ups for any UI element: ten lines of boxes beat a hundred lines of prose.

## 5. Plan anti-patterns (hunt them when reviewing the plan itself)

- **The fuzzy task**: "improve component X", "make Y cleaner". If you cannot write the
  end test, the task is not ready.
- **The plan leaking into the code**: references to the plan ("(B3)", "§2.1") in comments. The
  code must be self-supporting; the plan is disposable. Write this prohibition IN the plan (AI
  implementers are especially prone to it).
- **The false small slice**: "wire the button" that assumes three undecided things. A slice
  begins when all its decisions are in the plan.
- **The theatrical number**: half-hour estimates. Size orders the work and detects obese slices
  (> 2 days = re-split), it does not make a Gantt.
- **Generality up front**: planning a plugin system for two known cases. Plan the two cases;
  note in the doctrine where the seam would go IF a third arrived.
- **Silence on the existing**: a plan that does not list what it deletes leaves corpses. Each
  replacement names its victim.

## 6. The execution contract

- The plan is a contract, not a prison: any divergence during implementation is allowed if it
  is **better AND noted** (one line in the final summary: "divergence: X instead of Y, because Z").
- The implementer runs the self-review grid (§1.7) on their own diff at the end of each slice —
  the institutionalised adversarial pass, the one that does not depend on a single reviewer's talent.
- At the end of the ticket: reread the "origin" section and check that each triggering problem
  has its visible answer on screen or in the CLI. A ticket can be 100% green and still miss its
  target; that reread is the one that counts.
