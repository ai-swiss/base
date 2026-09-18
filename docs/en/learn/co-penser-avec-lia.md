<!-- fr-synced: abec2c29b206a5810e3e935ccb3066f3168b31c3 -->
# Why BASE

> **The question is not only where the model runs, but who structures your interactions with it.**

BASE separates the layer you own, your files, ways of working, sources, and checks, from the execution layer, the model, tool, its instructions, and connectors. This separation supports cognitive sovereignty: the ability to review, correct, and carry away the articulation of your work with AI.

Hosting sovereignty remains important, but it does not answer this question by itself. [Sovereignty and trust](../trust/souverainete-et-confiance.md) fixes the boundary of data and security guarantees.

Owning this articulation does not mean automating or formalizing everything. It means choosing what AI should know for a task, how it should work, and which decisions remain human, without surrendering those choices to a vendor's interface.

## Provide the right context

A language model answers from its training and the context window supplied with each call. It does not spontaneously share your memory, intentions, or domain rules. The practical consequence is not to show it everything, but to make the right information findable at the right granularity.

A useful unit should be small enough to open without noise and complete enough to retain its meaning. A named decision, a rule stored in the right place, and an explicitly designated source last longer than a conversation that is hard to retrieve.

This memory is external to the model. It can combine raw material, notes that interpret it, and the resulting articulations of the work. Structuring it means preparing what a colleague would need to pick up the thread, not pouring the whole folder into every conversation.

## Enter through intent

BASE provides an intent-based entry point into a structured body of knowledge and know-how. The person states what they are trying to accomplish. Routing then identifies the agent and way of working that cover this intent, after which the elements declared useful are loaded as needed.

The corpus therefore need not be pre-decomposed into a multitude of agents meant to represent all the work. Agents serve as entry points compatible with tools. Knowledge, ways of working, document templates, and tools remain distinct elements, connected and used according to the task.

This choice preserves the thread of the work. Multiple executions are useful when independent parts can produce short results that are easy to combine. When each finding changes what follows, keeping a shared context avoids turning coordination into additional work. [Beyond agents](au-dela-des-agents.md) develops this criterion.

BASE uses files and routing to present relevant elements. Technical access to a folder does not, however, guarantee either the relevance of what is selected or compliance with a permission: that depends on the component that actually selects and enforces the rule.

## A correction method

Working well with AI does not rely on a perfect request, but on a loop: state the goal and constraints, obtain a proposal, evaluate it against an explicit check, then revise.

The framework itself is developed by AI Swiss in the public guide [*Human-AI Co-Thinking in Action*](https://a-i.swiss/guides/co-thinking-in-action). BASE transposes this practice into a durable structure for work.

Three references serve here as design analogies, not as evidence that BASE is effective:

- by analogy with Shannon's formalized channel, shared vocabulary helps reduce losses of meaning: C. E. Shannon, ["A Mathematical Theory of Communication"](https://doi.org/10.1002/j.1538-7305.1948.tb01338.x), *Bell System Technical Journal*, 27(3), 1948;
- by analogy with goals studied in human work, an explicit expected result helps frame action and evaluation: E. A. Locke and G. P. Latham, [*A Theory of Goal Setting & Task Performance*](https://search.worldcat.org/title/20219875), Prentice Hall, 1990;
- by analogy with feedback in cybernetics, comparing the result with the goal enables correction of the gap: N. Wiener, [*Cybernetics: Or Control and Communication in the Animal and the Machine*](https://lccn.loc.gov/48011017), Wiley, 1948.

These parallels explain three choices, shared vocabulary, explicit goals, and correction loops. Their usefulness must be evaluated for each use.

[Co-thinking in practice](pratiques-co-pensee.md) turns this loop into concrete actions.

## Verify without promising the impossible

The reliability of an output depends on the setup that produces it, not on the model alone. Some tasks have an external verifier, such as a compiler, data schema, or deterministic calculation. Others require human judgment about facts, intentions, or consequences. A second answer from the same model may help review, but it is not independent evidence.

The fluency of an answer and the ease with which it was obtained say nothing about its accuracy. Every claim accepted without examination adds verification debt: unchecked assumptions that someone will have to revisit later, often when the error is most expensive.

Structure can reduce this cost by making sources, assumptions, checks, and decisions visible. It can also place verification inside the way of working, for example through a test, a comparison against a source, or a decision point. It does not guarantee truth. Delegating detail must not erode the understanding needed to defend what you approve.

Intrinsic complexity does not disappear with AI. A task that requires traversing many sources, retaining intermediate steps, or applying a precise calculation still requires the corresponding information, working memory, and operations. A model may shift or reduce part of that effort; it cannot derive data absent from its inputs or safely skip the problem's dependencies.

## Readable boundaries

BASE distinguishes know-how followed as instruction from knowledge consulted as content. The [glossary](../reference/glossaire.md) fixes the meanings of **skill**, **process**, and **competence**. This separation helps present each element in its role, but it is not a security boundary by itself.

An instruction guides the model. A guarantee holds only when a component on the action path enforces it. [Security and limits](../trust/securite-et-limites.md) describes this boundary without attributing powers to files that they do not have.

Decisions and uncertainties can remain visible and searchable in files. The [marker registry](../reference/marqueurs.md) defines the markers recognized by BASE.

## Changing tools or models: portability that must be tested {#portability-that-must-be-tested}

Keeping the reference in Markdown shifts part of the value from the current product to the durable articulation of the work. Context, decisions, and ways of working can be reviewed, versioned, and transferred without relying on opaque internal memory.

This avoids rewriting expertise with every vendor change, but it does not make execution interchangeable. Another tool may require an adapter, new permissions, different configuration, and regression tests. A more powerful model still does not know facts absent from its context.

The reasonable promise is therefore to keep a readable, transferable layer, then verify its behavior in every supported environment.

## Co-think, do not delegate everything

Co-thinking does not mean keeping a person in every detail. It means calibrating delegation. A low-consequence task with an external check can be delegated extensively. A task involving uncertain facts, a relationship, a right, or a decision deserves more dialogue and review.

The risk is not only an isolated error. When production accumulates faster than understanding, the overall view erodes and approval becomes a ritual. BASE can make checkpoints visible. The person remains responsible for choosing where they are needed.

## Next action

Choose one recurring task and write, on one page, its goal, authoritative source, expected check, and the action requiring your decision. If one of these four elements is missing, clarify it before automating.
