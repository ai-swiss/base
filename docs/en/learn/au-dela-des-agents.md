<!-- fr-synced: c82c82b7d39a124223a46887d850bd077230a9b6 -->
# Beyond agents

The first question is not "how many agents?" or "which domain should receive the request?" but "what result are we seeking, and what becomes relevant to obtain it?" A serious request may reveal its sources during analysis: a clause makes an incident relevant, the incident recalls a promise, then that promise changes the decision.

The definitions of **agent** and **assistant** are fixed in the [glossary](../reference/glossaire.md). Here, "several executions" means only several treatments conducted separately, whatever vocabulary the tool uses.

## One intent-based entry point, not a multitude of agents {#one-intent-based-entry-point}

In BASE, an agent is an entry point, not a box that confines a domain. Starting from the intent, the model reads a map, chooses a procedure or abstains, then consults the knowledge and sources designated by that procedure. A factual question may also lead directly to the passage that answers it.

Knowledge and know-how therefore remain structured and addressable without being divided in advance among a team of agents. One request can cross contracts, support, finance, and the roadmap in a shared thread when those elements reveal one another. Only the useful part becomes active; the rest remains available without saturating the context.

This organization does not guarantee that the model will always choose the right path or discover every relevant relationship. It does avoid turning an assumed organization chart into a boundary on reasoning.

## The separation criterion: one thread or several parallel treatments {#the-separation-criterion}

Keep one thread when every finding can change what the other parts must seek or conclude. Separate when the parts:

- have their inputs from the outset;
- can progress independently;
- return a short, defined result;
- can be combined through an explicit check.

Several executions may reduce total duration in some environments. They also add coordination and do not, by themselves, produce better understanding.

Before separating contexts, reduce what each execution must decide. Asking for a bounded result may be enough when the parts have little to agree on. If they share many constraints, the context must also be divided and their reconciliation planned explicitly.

There is no universal rule that more context or more tasks always degrades a model. The useful shape depends on the work, the model, and the expected check. An organization must therefore remain revisable when the request reveals new dependencies.

## Four request shapes

| Request | Useful organization |
| --- | --- |
| Prepare an invoice using a known contract and price schedule | One bounded workflow, followed by approval of the amount and accounting entry |
| Prepare forty statements using the same procedure | Independent runs, followed by validation and combination of the results |
| Calculate the total of five hundred invoices | Process batches and combine their subtotals; the accounting system remains the source of record |
| Assess whether to renew a contract | Explore in one shared thread: each finding determines the next source, then assess the evidence together |

These shapes describe computation, not authorization to act. A contract defines obligations between its parties; it does not technically block a read, write, or transmission. Only mechanisms on the action path enforce permissions and data policy.

## What BASE provides

BASE makes roles, procedures, knowledge, and sources accessible from the intent that mobilizes them. It can help route a request, but does not guarantee the right choice every time and does not itself coordinate a team of executions.

A change using BASE's mediated writing is shown before application. A tool that writes directly to files bypasses this control. The same applies to egress: broker holdbacks protect paths that pass through it, not direct access. See [Sovereignty and trust](../trust/souverainete-et-confiance.md) and [Security and limits](../trust/securite-et-limites.md).

Keeping sources and ways of working in files facilitates transfer without guaranteeing identical execution elsewhere. Another environment may require adapters, permissions, and tests.

## Next action

Take a current request and draw its dependencies. Separate only branches whose inputs are known, that do not modify one another, and that return a checkable result.
