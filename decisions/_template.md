---
schema_version: base.resource.v1
id: decision-template
type: document
title: Decision record template
description: The canonical shape for a BASE architecture decision record. Copy the block below to decisions/YYYY-MM-DD-slug.md and fill every section.
scope: public
status: active
sensitivity: public
doc_role: decision
audience: [developer, maintainer]
learning_level: advanced
related: [decisions-index]
---

# Decision record template

A decision record (ADR) captures one architecture decision: the context that forced a choice, the choice itself, the consequences the codebase now lives with, and the alternatives that lost. A record is immutable once **Accepted**: it is superseded by a new record, never edited to reflect a later change of mind.

To create one: copy the block below to `decisions/YYYY-MM-DD-slug.md` (dated today), delete the inline hints, and fill every section. If the decision is one of the architecture-decision rows in `../specs/current/10_core/requirements.md`, carry its `AD-*` id in the title note and link the row to this record.

```markdown
---
schema_version: base.resource.v1
id: decision-<slug>
type: document
title: <Short imperative title of the decision>
description: <One sentence: what is decided and why it matters.>
scope: public
status: active
sensitivity: public
doc_role: decision
audience: [developer, maintainer]
learning_level: advanced
related: [<canonical-resource-id>, ...]
---

# <Short imperative title of the decision>

## Status

Accepted.  (Use `Accepted`, `Proposed`, or `Superseded by YYYY-MM-DD-slug`.)

## Context

The forces at play: what BASE looks like today, the pressure that forces a choice, and the
constraints that bound it (zero runtime dependencies, local-first, text as the source of
truth, statusless `current/`). Cite the requirements in tension by stable id. Describe the
situation neutrally, before naming a winner.

## Decision

The choice in one or two present-tense sentences, then the concrete mechanism: the file,
function (by name, never by line number), command, or port that implements it. Precise enough
that the code could be deleted and regenerated from this record plus its tests.

## Consequences

- What becomes easier, and for whom.
- What becomes harder, or what is now forbidden.
- New obligations this creates (a gate to keep honest, a link to keep, an id to never reuse).
- The trade accepted on purpose.

## Alternatives considered

Every rejected option, with the reason it lost. A decision without alternatives is unproven.

| Option | Verdict | Why |
|---|---|---|
| <The alternative you did not take> | Rejected | <The specific force or cost that ruled it out> |
```
