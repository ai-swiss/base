---
schema_version: base.resource.v1
id: decision-unifier-identite-et-navigation-documentaires
type: document
title: Unify documentation identity, sections and navigation
description: Use one authored resource identity, one section parser and one generated navigation projection across AI retrieval and the documentation site.
scope: public
status: active
sensitivity: public
doc_role: decision
audience: [developer, maintainer]
learning_level: advanced
related: [specs-current-10-core-docs, structurer-un-corpus-de-connaissance]
---

# Unify documentation identity, sections and navigation

Architecture decision: **AD-DOCS-001**

## Status

Accepted.

## Context

BASE exposes the same documentation through two paths. AI tools inventory live resources, discover
heading-delimited passages and cite `id#anchor`. The documentation site builds a separate model for
human navigation and rendering. Before this decision, the two paths inferred identities, visibility
and headings independently, while the site adapter maintained a second page-membership map.

Seven public pages were publishable on the site but ineligible for section discovery. Five pages
produced different headings in the site model because its regular expression parsed Markdown headings
inside fenced examples. A thirty-question French probe retrieved the canonical passage in its first
five results only twenty times. These are violations of NFR-CORE-009 and the documentation contract:
derived views had become competing descriptions of the same corpus.

## Decision

Authored `base.resource.v1` metadata is the semantic identity of first-class documentation.
`splitSections()` is the only Markdown section and anchor parser. The documentation model derives the
final reader-journey navigation; presentation adapters render that projection without maintaining
page membership.

The web route uses a separate deterministic path key because one documentation model may include
several nested BASE roots that legitimately repeat authored IDs. Where an authored ID is unique, the
site also exposes an alias so an AI citation can lead directly to the human-readable page.

The authoritative French documentation corpus is protected by a complete-card gate and by real
retrieval questions. A knowledge import is complete only after representative questions discover and
open the intended passages.

## Consequences

- AI retrieval and the site agree on resource identity, visibility, headings and anchors.
- Every first-class public page must carry a complete authored card and stable ID.
- A path-derived web key remains necessary for global uniqueness across nested roots, but is not a
  second semantic identity.
- Reader-journey ordering remains an explicit product decision, generated in one place and tested for
  complete, unique membership.
- New documentation must satisfy both structural validation and observed retrieval.
- Changing an authored ID or stable anchor is a compatibility change and requires an explicit alias or
  migration.

## Alternatives considered

| Option | Verdict | Why |
|---|---|---|
| Add a hand-written `docs/index.md` for AI tools | Rejected | It would duplicate the live inventory, omit sections and drift whenever a page moved. |
| Keep path slugs as every resource identity | Rejected | Paths are deployment locations, not author-chosen stable citation identities. |
| Let the site and core keep separate Markdown parsers | Rejected | Fenced examples and explicit anchors already produced divergent, false navigation. |
| Put the final grouping only in the site adapter | Rejected | `navigation.json` would not be the navigation authority and non-site consumers would receive a different map. |
| Admit uncarded pages by deriving citation IDs | Rejected | A derived path reference has no author-owned compatibility promise. |
