<!-- fr-synced: 713173e01df7a867d44af7061a2150e6d8d73fac -->
# The intent-oriented computation model

This page sets out the conceptual framework behind [Beyond agents](../learn/au-dela-des-agents.md). It describes neither a current BASE capability nor a product roadmap. It proposes a shared language for reasoning about the organization of computation without treating the agent as its fundamental unit.

An **intent** brings together the objective to satisfy, the constraints that apply, the state from which to act, and the criteria used to evaluate the result. A prompt may express it without necessarily containing all these elements.

## The object: a computation that builds its own shape

An intent triggers operations: finding a source, reading, calculating, comparing, writing, verifying, or requesting a decision. Some are known in advance. Others become necessary only after a discovery. Intermediate results, such as an extracted fact, a total, or a hypothesis, then join the working state.

We call the organization of these operations and their dependencies the **computation topology**. The work may remain in one thread, be distributed across several executions, or combine results produced separately. This organization cannot always be determined before starting, because the relevant information and its relationships may emerge during the work.

## Dimensions of the problem

Choosing between one and several agents describes only an execution configuration. The relevant organization depends on several distinct dimensions:

- the **intrinsic difficulty** of what must be established or produced, given the available methods. Distributing the work does not make difficult reasoning simple or shorten a chain of steps that necessarily depend on one another;
- the **volume and accessibility of information**: how much must be read, the cost of searches, the availability of sources, and the required tool calls;
- the **structure of dependencies**: what can be handled separately, what must be brought together, and what a discovery may call into question elsewhere;
- the **potential for parallelism**: the share of the work that can genuinely advance at the same time with the available resources;
- the **movement of information**: what must be transmitted, summarized, or reread when computation crosses a boundary between contexts, tools, or executions;
- **working memory**: the state that must remain jointly accessible to preserve important relationships;
- the **quality requirement**: expected precision, error tolerance, verification cost, and responsibility attached to the result;
- the **execution conditions**: models, tools, latency, cost, confidentiality, and the ability to coordinate several pieces of work without losing their provenance.

These dimensions do not reduce to a universal score. They interact. Separation can reduce elapsed time while increasing total work, exchanges, and verification. A summary can free working memory while removing a detail that later becomes decisive. An architecture effective in one environment may cease to be so with another model, another tool, or another standard of evidence.

Volume in particular does not characterize a task on its own. Five hundred invoices represent substantial reading, but each batch can return a subtotal that is easy to combine. A renewal decision involves fewer documents, but a clause, an incident, and a promise may need to be interpreted together. The first request is large and separable. The second is smaller but tightly coupled.

## Agents are not the fundamental unit

A permanent team, for example legal, finance, customer relations, and support, imposes a partition before the request is known. That partition may be excellent when interfaces are stable and explicit. It becomes fragile when relevance crosses domains in a way that only execution reveals.

The limitation concerns division by persona or domain. When parts are sufficiently independent and return compact results, several executions can advance usefully. When their conclusions modify one another, separation imposes handoffs, rereading, and reconciliation. The number of agents says nothing by itself about this trade-off.

A single thread and a fixed team are two possible organizations among others. A more general harness could maintain a common thread, open several pieces of work when a useful separation appears, then bring together what must be assessed jointly. It could also explore several hypotheses, process data in batches, or assign an independent verification. The organization would then follow the structure of the problem as it emerges, rather than an organization chart fixed before the request.

## Dependency does not disappear: its cost moves

When two pieces of information must be brought together, that connection has to be paid for somewhere. It may be encoded before the request in a link, an index, or a procedure. It may be rediscovered during the request through search and reading. Finally, it may be carried in a shared context or transmitted between several executions. An architecture does not remove this cost; it chooses where and when to bear it.

BASE favors the first path whenever a relationship deserves to endure: a table of contents says where to look, a record flags an exception, a clause points to the incident that clarifies it, a validated calculation keeps its date and sources. This structure is computational capital as much as documentation. It avoids rediscovering for each request what was already understood once.

It must nevertheless remain revisable. No summary can guarantee that it will preserve everything a future intent makes relevant. A useful synthesis must therefore remain linked to its sources; a derived result must retain its provenance; a new exception may require rereading. A good abstraction reduces active state without pretending to abolish the information from which it came.

## Several forms of organization

Distributing a computation can serve different needs:

- **decomposing** sufficiently independent subproblems;
- **batching** a large volume under a common rule, then aggregating compact results;
- **exploring** several hypotheses when they are uncertain and verification can distinguish them;
- **verifying** a result through an independent reading or method;
- **recomposing** work whose dependencies ultimately require a joint assessment.

These forms are not interchangeable. Duplicating the same question can diversify a search but increases total work. Batch processing accelerates aggregation but does not help indivisible reasoning. Independent verification can strengthen confidence but does not correct a false source shared by every execution. Remaining integrated is often the right choice when steps are sequential or tightly dependent.

## Necessarily imperfect adaptation

Choosing how to organize computation itself consumes time and resources. The system decides with incomplete knowledge: it may not know which sources will be useful, which dependencies will emerge, or whether separation will truly save time. Changing the organization can also require transmitting state, repeating a reading, or reconciling conclusions.

There is therefore no adaptive strategy that is always better. The aim is more modest: avoid imposing the same shape on every request and make several forms of execution possible when their cost is justified.

## Status of the proposal

This framework brings together questions studied separately in parallel algorithms, communication complexity, memory and input-output models, and metareasoning. It is not yet a unified theory of AI harnesses.

The hypothesis to test is that the observable structure of a task, its dependencies, active state, opportunities for separation, and verification requirements helps select an effective organization better than the declared number or identity of agents. This hypothesis calls for measurements and comparative experiments. It must not be presented as an acquired BASE capability.

### Theoretical foundations

- Richard P. Brent, "The Parallel Evaluation of General Arithmetic Expressions", *Journal of the ACM*, 1974: work, depth, and parallel speedup.
- Eyal Kushilevitz and Noam Nisan, *Communication Complexity*, Cambridge University Press, 1997: information required between separate parts of a computation.
- Jia-Wei Hong and H. T. Kung, "I/O Complexity: The Red-Blue Pebble Game", *STOC*, 1981: movement and preservation of intermediate states.
- Stuart Russell and Eric Wefald, *Do the Right Thing: Studies in Limited Rationality*, MIT Press, 1991: the cost of reasoning devoted to choosing the next computation.

## What BASE fixes, and what it leaves open

BASE fixes an owned intelligence layer: roles, processes, knowledge, sources, links, and decision points are written in readable, portable files. Generated indexes give the model a map; the model is instructed to follow it. The CLI and MCP also expose deterministic routing, useful as a reproducible floor. These two registers, model instruction and software mechanism, must not be confused.

BASE does not plan the execution of a request. It decides neither to open several pieces of work, nor to synchronize them, nor to combine them. Those functions belong to the chosen harness. It can work in a single thread or across several executions, drawing on the method, memory, and addressing that BASE makes readable.

The practical consequence is restrained. Structure what must endure. Make sources and their relationships findable. Preserve the provenance of important results. Then let intent determine, as late as possible, the portion of knowledge that must become active and the organization of computation that serves it.

## Going further

- [Writing for the router](../guides/ecrire-pour-le-routeur.md): how to formulate what helps the assistant find the right process.
- [Why BASE](../learn/co-penser-avec-lia.md): the structure you own.
