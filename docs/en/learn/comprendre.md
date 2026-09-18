<!-- fr-synced: 5a37f8a1cfe06a18f6afdb35675496e24d2654ce -->
# What is BASE, and what is it for? {#understanding-base-and-shaping-interaction-with-ai}

BASE helps you retain control over what you produce with generative AI. It puts context, ways of working, checks, and decisions into readable files that can be reviewed and versioned. This page provides an overview before you move into the reference pages.

Four objects must remain distinct:

- the **method** is how the work is conducted: steps, authoritative sources, rules, checks, and human decisions;
- the **BASE structure** is the set of resources and relationships that describe this method;
- the **reference** is the approved, versioned description of the method at a given time;
- the **execution** is what a model, tool, or integration actually does from that reference in a given context.

The structure is therefore not the method itself, and the reference is not its execution. The same reference can lead to different executions depending on the model, tools, data, permissions, and integration. Specialized terms on this page are defined in the [glossary](../reference/glossaire.md).

## Why structure the collaboration

A model produces plausible answers from its training and the supplied context. It does not spontaneously know your environment, implicit rules, or current work. Its language remains underspecified, and its memory between calls depends on the surrounding setup.

BASE therefore makes five elements explicit: the goal, authoritative sources, the way of working, action boundaries, and human decisions. An answer remains a proposal to compare with facts and accepted risk.

The work follows a simple loop:

```text
FRAME → DELEGATE → EVALUATE → ADJUST
```

You state the goal and constraints, let the AI propose up to the next checkpoint, check against sources or reality, then correct. [Co-thinking in practice](pratiques-co-pensee.md) develops this practice.

## From intent to useful context

The entry into BASE is an intent: "prepare this quote," "update this policy," or "analyze this feedback." Routing consults the map of agents and their ways of working, then chooses what covers the request or abstains if nothing fits. Once that choice is made, only the elements declared useful are opened as needed.

The movement is therefore:

```text
intent → entry point → way of working → useful knowledge → check
```

BASE does not require pre-decomposing an entire corpus into agents. An agent is an entry point for a coherent body of work. Knowledge, ways of working, document templates, and tools retain their own roles and can be connected where they actually help.

Consider a quote. The intent leads to the way of preparing a quote. It can open the price list, document template, and validation rules without loading recruitment policies or unrelated archives. The context is targeted, but each element must remain complete enough to be understood outside its original file.

## The necessities that guide BASE

### Write down what must last

A conversation is not enough as durable memory. Useful rules, decisions, and data live in files so they can be found, reviewed, and corrected. A journal can carry work between sessions when an agent or process explicitly provides for writing it.

Without this external memory, the same questions return and decisions scatter through conversation histories. Writing information down does not make it true, but it makes it possible to find and correct.

### Make state searchable

Canonical markers identify missing information, proposals awaiting confirmation, alerts, and decisions. Their meaning and location are defined once in the [marker registry](../reference/marqueurs.md). A domain-specific annotation may complement that registry, but the scanner does not treat it as a canonical marker.

Information that cannot be found when a decision is made behaves almost like missing information. Titles, relationships, and markers provide handles for search without turning the index into a new authoritative source.

### Verify according to the task

Some tasks have an external check, such as a compiler, schema, or deterministic calculation. Many others require human comparison with facts, intentions, or domain constraints. In either case, asking the same model to "check itself" is not independent evidence.

Precise structure can reduce checking effort without guaranteeing truth or replacing the ability to judge. Every claim accepted without examination adds verification debt.

The check belongs before the costly or hard-to-reverse action. A rephrasing can be corrected in conversation. A price sent, a publication, or a data change deserves an explicit decision point.

### Separate instructions from mechanisms

An instruction guides a cooperative model. A permission, rule, or policy blocks an action only when a component on the action path enforces it. Broker protections therefore apply to reads, writes, and calls mediated by it; direct access to the filesystem, shell, or an API can bypass them. The full boundary is described in [Security and limits](../trust/securite-et-limites.md).

An external source remains content to examine, not a working instruction. This rule reduces injection risk, but it remains textual unless a technical component actually separates data from commands.

### Keep a way out

Markdown files facilitate audit and tool changes. This portability is not automatic: a new environment may require adapters, a new permission configuration, and tests to verify that the reference still produces the expected behavior.

## Minimal anatomy

An agent folder may contain:

```text
AGENT.md
├── skills/
│   ├── processes/
│   └── competences/
├── templates/
└── tools/
```

The [glossary](../reference/glossaire.md) fixes the distinctions between **agent** and **assistant**, and between **skill**, **process**, and **competence**. In practice, `AGENT.md` is the entry point, a process describes a way of working, a competence provides reusable knowledge, a template defines a document's form, and a tool performs an operation.

This anatomy does not require every agent to have each subfolder or knowledge to be duplicated for each one. The structure follows real needs and explicit relationships.

## How to begin

Choose a recurring task whose expected result you understand. Gather one authoritative source, a short way of working, an output template if form matters, and a check that could reveal an error. Then test the complete journey on a real case.

Starting small reveals where context is missing and where a human decision is necessary. Expertise develops from these differences, not from an exhaustive architecture imagined before use. [The lifecycle of expertise](cycle-de-vie-expertise.md) shows how to maintain this structure after it enters service.

## Next action

Open the [assistant-devis example agent](../../../exemples/assistant-devis/.ai/agents/assistant-devis/AGENT.md), choose one of its processes, and identify, in order, the intent it covers, its goal, sources, checkpoint, and expected output.
