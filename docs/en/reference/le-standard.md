<!-- fr-synced: 0a8ba0c3c7a39944cf53e78b902a13361707cba3 -->
# The BASE standard: `base.resource.v1`

BASE is not yet another platform: it is an **open standard we propose**, with its reference
implementation. It does not only standardize the knowledge an AI consults: it standardizes how a
human and an AI articulate the work, which agent, which process, which data, which verification.
This page is the citable home of the standard. It names each piece and points to its source of
truth, copying none of them: a local copy would drift, and the anti-drift rule
(`specs/current/30_schemas`) holds that there is only one machine truth.

This standard is still young. It is stabilized and versioned, it has a reference implementation and
verifiable conformance, but it is not ratified by a third-party body. This page states what the
format guarantees today, and presents nothing else as a given.

## Scope

The standard covers the **format of a resource** and the **conventions** that make it useful to an
agent: how a file declares itself, how it validates, how a router picks it. It defines neither an
organization's business rules, nor an execution engine, nor a model: those choices stay outside, and
the reference implementation treats them as extension points or replaceable parts. Where BASE sits
among other tools, and what it does not claim to be, are detailed in [Positioning](positionnement.md);
this page describes the format itself.

## Versioned identifier

The format's identity is carried by a single field, required in every resource:

```yaml
schema_version: base.resource.v1
```

The machine truth is [`base.schema.json`](../../../base.schema.json), published under the stable
identifier `https://a-i.swiss/base/schemas/base.resource.v1.json`. That identifier only changes with
a **major** version of the format. The format follows semantic versioning (see [Its stability
promise](#its-stability-promise)): a backward-compatible addition stays `base.resource.v1`; a break
would increment the `v`.

## The object model

A resource is a Markdown (or JSON) file carrying a small typed header. The principle is **progressive
metadata**: few fields are required, the rest is added when a mechanism or a signal needs it. The
full frontmatter grammar is specified in
[`specs/current/10_core/frontmatter.md`](../../../specs/current/10_core/frontmatter.md), precisely
enough to be reimplemented: a strict, documented subset that rejects loudly anything outside it,
rather than a full YAML engine.

### Required fields

Four fields, and only four, are required as soon as `schema_version` is present:

| Field | Constraint | Role |
| --- | --- | --- |
| `schema_version` | constant `base.resource.v1` | declares the format and its version |
| `id` | `^[a-z0-9][a-z0-9-]*$`, unique within a BASE | names the resource stably |
| `type` | closed enumeration (see below) | says what the resource is |
| `description` | non-empty string | one sentence of meaning, useful to the router too |

### The `type`s

The `type` is a closed enumeration: `agent`, `process`, `knowledge`, `competence`, `tool`,
`template`, `data`, `data_collection`, `document`, `note`, `journal`, `trace`, `source`, `connector`,
`policy`, `adapter`, `schema`. Two of them, `agent` and `process`, are **routable**; the others are
**context**, retrieved once the route is chosen. The closed list is what makes the distinction
operable instead of a soft convention.

### Optional fields

The rest is progressive. Each optional field serves a precise mechanism or signal, never decoration.
A few of the most load-bearing:

- `use_when`, `routing.examples`, `routing.avoid_when`: the routing signals (see below).
- `confidential` (boolean, **set by a human, never inferred**): the resource does not leave for a
  remote model. This is the field that drives egress control.
- `sensitivity`, `scope`, `owner`, `license`: per-resource classification and ownership.
- `review_by`, `valid_from`, `valid_until`: the aging ontology, read by `base doctor` and the context
  pack, so that stale data is flagged instead of circulating silently.
- `status` (`draft`, `active`, `deprecated`, `archived`): a deprecated or archived resource is never
  a routing candidate; the corpus ages explicitly.
- `execution`, `requires`, `policy`, `trace`, `governance`, `source`: the extension points for tools,
  dependencies, enterprise governance, and traceability.

The contract allows additional keys (`additionalProperties: true`): a producer can enrich without
breaking a consumer. But, unlike a format that requires almost nothing, the fields BASE recognizes
are constrained and verified: that is where the standard takes its few opinions, precisely the ones
that turn on a mechanism.

## The two separations

What the format alone does not say, and BASE adds, comes down to two boundaries.

- **Instructions kept separate from data.** This is the security boundary: what guides the model does
  not mix with what is merely read. An egress control rests on it (the `confidential` field).
- **Know-how kept separate from knowledge.** Within the instructions, the process (how to do it) is
  distinct from the competence (what one needs to know): this is the maintainability boundary.

A neighboring knowledge format lets a runbook and a table's description coexist with the same status
of consultable content. BASE separates them, because security and maintainability depend on it. These
boundaries are laid down in [ARCHITECTURE.md](../../../ARCHITECTURE.md) and the
[README](../../../README.en.md).

## The routing conventions

A standard that describes a unit of work must say how to choose it. BASE routes to a **whole agent
and process**, deterministically and explainably, or abstains; it does not retrieve fragments by
similarity. The signals live in the file itself:

- `use_when`: a short sentence on *when* to use the resource, the strongest signal.
- `routing.examples`: real user phrasings, to improve recall.
- `routing.avoid_when`: counterexamples, which rule out a mismatched resource without making it
  opaque.

These fields are progressive: a resource already routes from its title and description alone. The
decision returns one of four statuses, `routed`, `ambiguous`, `needs_clarification`, `out_of_scope`,
never an opaque confidence, and abstains rather than manufacturing a route from noise. The normative
specification is [`routing.md`](../../../specs/current/10_core/routing.md); the writing guide is
[Writing for the router](../guides/ecrire-pour-le-routeur.md).

## Verifiable conformance

Here the standard sets itself clearly apart from a permissively-consumed format. `base validate` is
the conformance checker, and it **blocks**: on a violation of a required field, an `id`, a `type`, or
a date, it refuses instead of accepting best-effort. The diagnostics are **stable codes**, which a CI
and extensions can react to, with the offending line; the human-readable message is decoupled from
the code.

- Frontmatter grammar errors: `base.yaml.*` (for example `base.yaml.duplicate_key`,
  `base.yaml.tab_indent`, `base.yaml.unterminated_quote`).
- Model conformance errors: `base.field.required`, `base.id.invalid`, `base.id.duplicate`,
  `base.type.invalid`, `base.schema.unsupported`, `base.confidential.type`, `base.validity.order`,
  among others.
- Golden rule, the same as the parser's: **on error, no guessed value**. The code is recorded, the
  key omitted, and validation fails cleanly.

The core validates only the minimum BASE requires. An organization's rules (fields required per
perimeter, personal-data detection, retention) are **opt-in** validators that record their own codes:
the core never pretends to know an organization's rules. The specification is
[`validator.md`](../../../specs/current/10_core/validator.md).

## Its stability promise

The format follows semantic versioning: a file that is valid today stays valid across all of 1.x.
This is the **NFR-CORE-002** commitment, called "no breakage", detailed in
[Versions and stability](versions-et-stabilite.md). The `base.resource.v1` identifier only changes
with a major version of the format. A stable element that must disappear is first deprecated, kept
working for at least one minor version, before any removal. The stable surface spans the format and
its `type`s, the existing CLI commands and MCP tools, and the projection schemas (`base.manifest.v1`,
`base.routing.v1`).

## The reference implementation, and the others

The repository provides the reference implementation: the `base` CLI, the Studio and the MCP server,
all on the same core (Node.js >= 18, with no third-party dependency at the core). The specifications
([`specs/`](../../../specs/README.md)) are written to allow an independent reimplementation:
switching languages or libraries and rebuilding equivalent functionality remains possible from them
alone. The standard is the format and its conventions; the CLI, the Studio and the MCP server are
only one implementation of it.

## A minimal example

A process, the smallest useful routable resource:

```markdown
---
schema_version: base.resource.v1
id: draft-a-quote
type: process
description: "Draft a client quote from the current price catalogue."
use_when: "the user wants to create or price a quote for a client"
---

# Draft a quote
1. ...
```

Four required fields, one routing signal, and the body in Markdown. The rest is added when a need
calls for it: `confidential: true` to hold a resource on the local side, `valid_until` to date a
price, `owner` and `sensitivity` for a shared resource.

## Interoperability, today

A BASE resource is already readable by the neighboring open formats (AGENTS.md, Agent Skills,
CLAUDE.md, Open Knowledge Format): it is a plain Markdown file with frontmatter. A BASE's `CLAUDE.md`,
`AGENTS.md` and Cursor rules are **generated adapters** from the source you own (`base build`), and
`SKILL.md` is the native format of processes. Where a knowledge format describes what an agent can
consult, BASE articulates how a human and an AI work: it adds the two separations, deterministic
routing, egress control, mediated writing, and the human-verification loop. The full positioning
against these formats: [Positioning](positionnement.md). Other export targets are not implemented to
date and are not presented as a given.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
