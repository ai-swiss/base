---
schema_version: base.resource.v1
id: decisions-index
type: document
title: Decision records
description: Index and convention for BASE architecture decision records (ADRs).
scope: public
status: active
sensitivity: public
doc_role: reference
audience: [developer, maintainer]
learning_level: advanced
related: [specs-current-10-core-requirements, decision-template]
---

# Decision records

A decision record captures one architecture decision for BASE: the context that forced a choice, the choice itself, and the consequences the codebase now lives with. Each file records a single decision and is immutable once **Accepted**: a record is not rewritten to reflect a later change of mind. When a decision is replaced, a new record is written that supersedes the old one, and the older record states what superseded it rather than being edited away. The shape of a record is fixed by [`_template.md`](_template.md); a record carries the architecture-decision id where one applies (`AD-CORE-001`, `AD-CHANGE-001`).

The ADR convention and its template are in place; records are added under `decisions/` as architecture decisions are written.
