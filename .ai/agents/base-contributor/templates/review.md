---
schema_version: base.resource.v1
id: template-review
type: document
title: Review template
description: The shape of a dated review in .reviews/. Copy the block, fill every field, delete the hints.
scope: team
status: active
sensitivity: internal
---

# Review template

A review is a dated, immutable assessment of part of BASE at a point in time: an audit, a
read-of-state, an evaluation. It lives in `.reviews/YYYY-MM-DD_subject.md` (personal,
gitignored). A review is trajectory, not truth: it records what someone observed on a date,
never current behaviour. A durable conclusion is promoted into `specs/` or a `decisions/`
record; the review keeps only the dated finding.

```markdown
# Review: <subject>

- **Date:** <YYYY-MM-DD>
- **Scope:** <what was assessed, and what was deliberately out of scope>
- **Valid as of:** <git sha or tag the assessment reflects>
- **Trigger:** <why this review happened (release prep, a bug, a periodic check)>
- **Verdict:** <one line: healthy / at-risk / blocked, with the headline>

## Findings
<what is true now, with evidence (file:line, command output). Cite, do not assert.>

## Gaps
<what is missing or wrong, ranked. Each gap names the truth-plane change it implies.>

## Next
<the promotion step: which finding becomes a specs/ change or a decisions/ record, and what stays trajectory>
```
