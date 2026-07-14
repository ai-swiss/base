<!-- fr-synced: 4b1908ed2c94bd2c69bd2f5b5edf068def9e4e57 -->
---
schema_version: base.resource.v1
id: decouverte-progressive-en
type: document
title: Progressive discovery, from the first file to the final gesture
description: "What an AI tool reads in a BASE, in what order, and when it stops: the root, the entry point, the route, the process, the context, the tool, the write. One page at the level of the contract's gestures, that any harness can follow."
scope: public
status: active
sensitivity: public
keywords: [discovery, progressive, reading, order, harness, integration, routing, context, budget, playbook]
---

# Progressive discovery, from the first file to the final gesture

A BASE is made to be discovered little by little. This page answers a harness integrator's question:
in what order do I read what, and when do I stop? It describes each step at the level of the
**contract's gestures** (route, read, bind, search, invoke, propose, commit), not at the level of one
tool's commands: the CLI, the MCP server and a file harness each offer their own door to the same
gestures (see [BASE and your AI tools](base-et-vos-outils-ia.md)).

One rule governs the whole page:

> At each step, read the smallest object that proves the next decision. If the proof is missing,
> abstain and ask.

## 1. Find the root

A folder is a BASE root if it carries an entry point (`CLAUDE.md` or equivalent), a configuration
(`base.config.json`) and the `.ai/` core. If a `base.workspace.json` exists, it declares several
roots: read it first. If several roots remain possible, ask (or use the explicit root selection the
surface offers), never guess.

## 2. Read the entry point

The entry point says whether the folder has already chosen its agent. If it points directly to an
`AGENT.md`, read that agent and work: global routing would be a useless expense. If it describes a
router (the general case), move to the next step at the first need for a process.

## 3. Route when the process is unknown

The `route` gesture takes the request and returns a route or an honest abstention. The order of the
first move depends on the surface:

- **File harness**: the generated routing index (or the direct pointer) first; the deterministic
  router confirms or serves as fallback.
- **Broker or MCP**: `route_request` first, because the access policy and the audit live in the
  broker.
- **Proof and CI**: the CLI first, because the route must be reproducible.
- **Degraded mode** (no index, no CLI, no MCP): metadata-only search (see the last section).

In every case: **never full bodies before a shortlist**. The router returns four statuses, and each
commands a precise gesture:

| Status | The gesture that follows |
| --- | --- |
| `routed` | Load the designated agent then process, nothing else. |
| `ambiguous` | Ask the proposed question. Do not open the competing processes' bodies to decide: at most their metadata. |
| `needs_clarification` | Ask the proposed question. |
| `out_of_scope` | Load the help fallback if configured, otherwise simply state the limit. |

## 4. Read the chosen process

Read the routed process's `SKILL.md`, and it alone: not its siblings, not the whole agent. A process
is self-sufficient; whatever else it needs, it declares.

## 5. Bind the context

Before following the process, ask what it declares to preload (the `context` gesture: the
`base context` CLI, the `get_context_pack` MCP tool). The answer lists paths and notes under a
budget, never contents: reading a retained path stays an explicit gesture. The order:

1. The declared references (`requires`), always.
2. The optional references (`may_use`), only if the task calls for them.
3. The entities named by the request (a client, a case), searched in the scopes the process
   declares, never in the whole repository.

The reading rule that bounds everything else: a resource is read because it is **declared**,
**found in a bounded scope**, or **explicitly requested**. No other reason.

## 6. Resolve a resource

To open a resource whose intent is known but whose path is not, from cheapest to most expensive:

1. The exact reference (id or path), if it exists.
2. The expected folder's README.
3. The metadata search (the `search` gesture: `base discover`, `discover_resources`).
4. The ranker's fuzzy rescue, only if the score is clear.
5. The question, if nothing resolves.

## 7. Search for a business entity

"Where is Dupont SA?" The probable slug first if the folder's convention is known
(`clients/dupont-sa.md`), then the search in the expected business scope, reading the most plausible
matches within a named limit. If several records remain close, ask. What must never be done: search
the whole repository, read all the clients, read all the quotes.

Contextual variants of a process (one sub-file per discriminant value) are not a BASE mechanism:
when two variants change the intent or the output, they are two processes; when the delta is small,
it is a branch in the process body.

## 8. Invoke a tool

The `invoke` gesture follows a single rhythm: understand, propose, validate, act. Read the tool's
sheet (not its code), go through the dry run when it exists, show the result or the plan, and
execute only after explicit confirmation.

## 9. Write

The write gesture happens in two steps (`propose` then `commit`): propose the diff or the list of
files, obtain validation, apply through the mediated path when it exists, trace. Never a final file
without confirmation; never a modification of the `.ai/` core in the middle of a business process.

## 10. The conversation that continues

Routing happens at task boundaries, not at every message. Two cases refine this rule:

- **A precision** ("actually it is for an existing client, Dupont"): stay in the process, bind the
  new information, search in the declared scope. Do not reroute.
- **A change of intent** ("in the end I want to dispute an invoice already sent"): reroute, because
  the unit of work changes.

And when a long, summarized conversation loses the thread: reopen the active process's `SKILL.md`
and its `AGENT.md` from disk before acting. The file is authoritative, not the conversation's
memory.

## Degraded mode (diagnostic only)

Without an index, without the CLI and without MCP, what remains is file discovery (`AGENT.md`,
`SKILL.md`) and reading only their routing metadata to build a shortlist. This mode serves
diagnosis and robustness, not the daily life of an installed BASE, and it never justifies reading
the whole corpus: the rule of the smallest object that proves the next decision holds even in
failure.
