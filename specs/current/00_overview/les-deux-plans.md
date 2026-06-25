# 00 · The two planes (truth and trajectory)

> **For developers and maintainers.** BASE keeps two kinds of information apart on purpose. This page names them, states the invariant between them, and points each one at its home. Sibling to `vision.md` (why the tooling is shaped this way) and `perimeter.md` (what the core does and does not promise).
>
> Owns: nothing. This page allocates no IDs; it states a discipline that the requirement and decision IDs elsewhere already obey.

## The two kinds of information

Every fact BASE records is one of two kinds, and they must never blur:

- **The present (truth).** What the system *does now*, stated **statuslessly**: no `pending`/`done`/`built`/`fixed`, no "we will", no "we used to". It is reimplementable from the words alone. The present lives in `specs/`, in `docs/`, and in the code and its tests.
- **The trajectory (history).** Dated, episodic material: *how we got here, where we are going*. Decisions taken, changes shipped, reviews run, plans not yet built. The trajectory lives in `CHANGELOG.md`, `.plans/`, `.reviews/`, and git tags.

A useful test for which plane a sentence belongs to: if it would read oddly without a date or a tense (`added`, `now`, `next`, `was`), it is trajectory. If it states a current behaviour that simply *is*, it is truth, and it belongs in `specs/` or `docs/`.

## The invariant

**The trajectory plane never holds truth that the present plane lacks.** A plan, a review, or a changelog line may *narrate* a behaviour, but it is never the place that *defines* it. The moment a planned thing becomes real, its definition moves into `specs/` (and the code that satisfies it); the plan keeps only the dated record that it happened.

It follows that there is exactly **one** authoritative reading order for the current state: **read `specs/` first, then the code (and its tests), and never a plan or a review.** A plan tells you what someone intended on a date. A review tells you what someone observed on a date. Neither is a promise about today. The regeneration bar makes the same point from the other side: *could the code be deleted and regenerated from `specs/` plus its tests?* If yes, `specs/` is genuinely the truth; if the answer hides in a plan, the truth has leaked into the wrong plane.

## The reader corollary (and why)

A page that mixes present behaviour with status or roadmap goes stale for **both** of its readers. The reader who wants today's behaviour has to subtract the dated parts and guess which still hold; the reader who wants the history has to dig it out of prose written to describe a system, not a timeline. Each gets a worse answer than a single-purpose page would give.

One **statusless** home for the present cannot rot by omission: there is no `done` flag to forget to flip, no `pending` left lying after the work shipped, no roadmap line silently contradicting the code. The page says what the system does; when the system changes, the page changes in the same edit, and the dated record of *that* change goes to the trajectory side. This is why `specs/` chapters carry no status and why trajectory belongs elsewhere.

## Concrete homes

| Plane | What it holds | Where it lives |
|---|---|---|
| Present / truth | current behaviour, stated statuslessly; the engineering contract | `specs/current/` (single living spec) |
| Present / truth | the method and how to use BASE, for end users | `docs/` |
| Present / truth | the executable definition of behaviour | the code and its tests |
| Trajectory / change (tracked) | durable decision and change records: what changed and why, with the alternatives weighed | `decisions/` |
| Trajectory / change (tracked) | what changed, when, in the public surface or visible docs | `CHANGELOG.md` |
| Trajectory / scratch (personal, gitignored) | working plans, intended-but-unbuilt work | `.plans/` |
| Trajectory / scratch (personal, gitignored) | dated reviews and audits | `.reviews/` |
| Trajectory / history | a frozen specification at a release | a git tag (`git show vX.Y.Z:specs/current/...`) |

Durable architectural choices are their own plane. A decision is taken on a date (trajectory) but its *outcome* shapes the present, so it is captured once as an immutable record under `decisions/YYYY-MM-DD-slug.md` and then reflected statuslessly in the `specs/` chapters it governs. The record lives in `decisions/`, **not** under `specs/`: `specs/` holds what BASE *is* (pure truth), while `decisions/` is the tracked change plane that holds *why it is so, and what changed*. Keeping them apart is deliberate. A decision record is shared and durable (tracked), unlike the personal scratch of `.plans/` and `.reviews/`; it is dated and immutable, superseded by a newer record rather than edited.

## Choosing where information goes (the artifact ladder)

When you have something to record, reach for the **least powerful artifact that still preserves the work**. The ladder runs from the lightest, most disposable note to the heaviest, most durable contract. Start low; promote upward only when the work becomes real and a future reader would need it.

| Artifact | Use it when | Plane |
|---|---|---|
| A line in `CHANGELOG.md` | a change to the public surface or visible docs has shipped and needs only a dated note | Trajectory / change (tracked) |
| A plan in `.plans/` | you are thinking before building: intended, not-yet-real work, scratch design | Trajectory / scratch (personal) |
| A review in `.reviews/` | you have a dated assessment or audit worth keeping for yourself | Trajectory / scratch (personal) |
| A decision record in `decisions/` | a choice will shape the present and a future reader will ask *why*, with the alternatives that lost | Trajectory / change (tracked) |
| A chapter in `specs/current/` | the thing is real and *defines* what BASE does, stated statuslessly | Truth |
| The code and its tests | the behaviour must be executable and proven | Truth |

The anti-patterns the ladder prevents: opening a `specs/` chapter for something a `CHANGELOG` line captures; writing a decision record for a choice a plan still holds; or letting everything pile up in plans and chat so the truth plane never receives it. Promote, do not hoard; and when you promote, the lower artifact keeps only the dated trace that it happened.

## Keeping the trajectory plane clean

The trajectory plane grows forever. A light, manual discipline keeps it readable, with no tooling to maintain.

**Archival.** A plan or review that is finished or superseded moves to `_archive/{year}/` inside its own folder (`.plans/_archive/2026/`, `.reviews/_archive/2026/`), content unchanged. Archiving relocates; it never rewrites. Neither `specs/` nor `decisions/` has an `_archive/`: a superseded chapter is edited in place, a superseded decision is replaced by a newer record that supersedes it, and the old state is recovered from a git tag (`git show vX.Y.Z:specs/...`).

**Always / never.**

- ALWAYS date a trajectory file (`YYYY-MM-DD_subject.md`) and give it the exact header its template defines.
- ALWAYS supersede instead of editing: a newer plan, review, or decision replaces an older one, and the older one says what replaced it.
- ALWAYS promote a durable conclusion out of personal scratch: into a `specs/` chapter (truth) or a `decisions/` record (the change plane); the scratch file keeps only the dated finding.
- NEVER delete a trajectory file silently: if it must go, move it to `.temp/` with a one-line reason.
- NEVER treat a plan or a review as current truth: to learn what BASE does, read `specs/` first, then the code.
- NEVER let a chapter under `specs/` carry a date, a status, or a roadmap line: that belongs on the trajectory side.

## The gates that keep the planes honest

The separation is not a style preference; named gates enforce it, and a contributor runs them locally before CI does. This page connects to them without restating their internals:

- **spec-sync** ties the code plane to the spec plane: a change to runtime code must also touch `specs/` or declare an explicit neutral reason, so present behaviour cannot drift away from its definition.
- **the requirements matrix** ties each requirement to its proof, regenerated from the tests and diffed, rejecting any citation that no longer resolves, so truth in `specs/` stays backed by the code that satisfies it.
- **the immutability check** protects the stable identifiers the other two rely on: an ID, once merged, is never renumbered, reused, or deleted, so a de-scoped requirement keeps its place in the present plane rather than vanishing into history.

The discipline these gates protect is the **statusless rule** itself: describe present behaviour without status; let dated, episodic material live only on the trajectory side. A reader who internalises one sentence should keep this one: to learn what BASE does today, read `specs/` first, then the code, never a plan or a review.
