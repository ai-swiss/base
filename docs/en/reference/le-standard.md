<!-- fr-synced: 4d443e8432aeab91a7ca6dae4fe534db8a3e82dc -->
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

`base.resource.v1` is the schema an author writes. It belongs to a small versioned family:
`base.config.v1` and `base.workspace.v1` describe a BASE's configuration, `base.manifest.v1` and
`base.routing.v1` are **generated** projections (never a source of truth), and `base.trace_event.v1`
describes traces. Each carries its own stable `$id`.

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

The `type` is a **closed and deliberately short** enumeration: six values, each justified by a
distinct behavior in the implementation. A closed list is a contract, not a catalogue of
illustrations; a type that would change nothing in behavior would not be a type, but a label.

- **The method**, how the work is articulated: `agent`, `process`, `competence`. The `agent` (a role)
  and the `process` (a unit of work) are the only **routable** types, the ones a router chooses
  toward. The `competence` is the knowledge a process consults; it is never routed for itself.
- **The operation**: `tool` is the only **executable** type, `base invoke` requires `type: tool` and
  an `execution.entrypoint`. `template` is a fill-in artifact; its only distinctive behavior is to be
  flagged when no resource references it, the same maintenance lens as `competence`.
- **The context**: `document`, what an agent consults once the route is chosen. It triggers no
  operation; it is inventoried, opened, validated, dated, and held locally if `confidential`, like any
  resource.

The method / operation / context distinction is operable, not decorative: it is what the router, the
CLI and the checker actually treat.

### Optional fields

The rest is progressive, and each field serves a precise **mechanism**, never decoration. Grouped by
what they turn on:

- **Routing**: `use_when`, `routing.examples`, `routing.avoid_when` (see below). `title` stays
  optional, but is strongly advised on a shared resource: it feeds discovery and recall.
- **Egress control**: `confidential`, a boolean **set by a human, never inferred**. It is the only
  resource field that prevents a send to a remote model.
- **Classification and ownership**: `sensitivity`, `scope`, `owner`, `license`. They **describe** a
  resource, and `sensitivity` is the field the policy layer can read to filter an action. But
  classification does not drive egress: only `confidential: true`, or a root declared `local-only`,
  holds a resource on the local side. A `sensitivity: confidential`, which is merely a classification
  value, therefore holds nothing back by itself: the egress boolean is `confidential`.
- **Aging**: `review_by`, `valid_from`, `valid_until`, read by `base doctor` and the context pack, so
  that a stale resource is flagged instead of circulating silently.
- **Lifecycle**: `status` (`draft`, `active`, `deprecated`, `archived`). A deprecated or archived
  resource is never a routing candidate; the corpus ages explicitly.
- **Extension points**: `execution` (tools), `requires` (dependencies), `policy`, `trace`,
  `governance`, `source` (governance and traceability). Add them when a mechanism calls for them.

The contract allows additional keys (`additionalProperties: true`): a producer enriches without
breaking a consumer. An application can thus set its own keys (a documentation page like this one
carries `audience` and `learning_level`): these are extensions of an **application model**, not of the
format, and they do not commit the standard. What BASE **recognizes**, by contrast, is constrained and
verified: that is where it takes its few opinions, precisely the ones that turn on a mechanism.

### File name, type, and location

Three distinct things are often wrongly conflated. The **type** is the ontology, what the resource is.
The **file name** is an interoperability convention: a process is written in a `SKILL.md`, the native
format recognized by the Agent Skills convention, and an agent in an `AGENT.md`. The **location** is
the path grammar a BASE follows: `.ai/agents/<id>/AGENT.md`, its processes under
`.ai/agents/<id>/skills/processes/<id>/SKILL.md`, its competences under
`.ai/agents/<id>/skills/competences/<id>/`, plus the agent's `templates/` and `tools/`. These names
and segments also serve as keys: when the frontmatter does not declare the `type`, it is **derived**
from the path (an `AGENT.md` is an agent, a `SKILL.md` under `processes/` a process, and so on). The
full grammar is in [`specs/`](../../../specs/README.md).

Body markers (`[A VALIDER]`, `[DECISION]`, `[A COMPLETER]`, `[ATTENTION]`) follow the same logic: a
method convention surfaced by `base doctor`, and not fields of the format.

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
