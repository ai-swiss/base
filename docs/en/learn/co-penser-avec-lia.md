<!-- fr-synced: 6f19128646c3d0c51c3571ea19abceafb78205e2 -->
# Why BASE

> **The question is not where your servers are, but who structures your interactions with AI.**
> Who injects information in your place. Who nudges you to delegate rather than verify. The sovereignty that counts is cognitive: what the AI knows, what it does, what you expect, your instructions, set down in text you own, readable by all, usable by the AI.

This document explains *why* BASE exists. Not its commands (see [Quickstart](../start/quickstart.md)), not its architecture (see [Public framework](../reference/framework-public.md)): the method it makes executable for co-thinking with AI, and the applied science it rests on. For the day-to-day *how*, see [Co-thinking in practice](pratiques-co-pensee.md).

## The sovereignty that counts is cognitive

Server sovereignty (where the compute runs) is **necessary, but it is not sufficient**. You can own your chips, your electricity, your hard drive, and remain a stranger to what matters most: your interactions with AI. An AI sovereign in its servers but foreign in its uses remains a trap, because what you can neither articulate nor verify does not truly belong to you, wherever it runs.

The real question is therefore not "where are my servers?" but **"who owns the articulation of my way of thinking with AI, me or my vendor?"**. Behind it, these questions:

> **Who structures my interactions with AI? Who injects information in my place? Who nudges me to delegate rather than verify?**

This is *cognitive sovereignty*, the layer no one else gives back to you. It is not played out in an infrastructure, but in the freedom to articulate, to structure, to think with these intelligences. And it does not concern work alone: whether you organize your ideas as an individual or your processes as a company, it is your interactions with AI that are at stake.

Hence a clean separation:

- **Your intelligence layer**: how you articulate the work, structure the knowledge, define the checks, keep the decisions. That is BASE. In text, yours, portable, model-independent.
- **The execution layer**: the compute, the models, the orchestration, the internal memory, the connectors. Interchangeable, to be rented and to evolve.

BASE does not replace your tools and does not stop you from using them: it is their sovereign layer. Keep your tools for compute and execution; own, in BASE, the intelligence they execute. Details: [BASE and your AI tools](../reference/base-et-vos-outils-ia.md), and [where BASE sits in the landscape of tools](../reference/positionnement.md).

## The model, an amnesiac colleague from elsewhere

AI **does not behave like classic digital software**. The most workable mental shortcut is a **colleague from elsewhere**, a little amnesiac: a rich representation of the world, but not of yours. It masters a great many verifiable domains, but it never shares a coffee with you and knows nothing of your terrain. Two real shortcomings follow. First, the generative core starts **every conversation** with an empty context window: by default, it does not share your memory, each exchange starts from scratch. Second, it communicates with you in natural language, intrinsically underspecified, which is both its strength and its weakness (any ambiguity can get executed).

The key is not a setting you make once. It is to **structure your information so it is available at the right granularity, at the right moment, across all your interactions**. For example, working back up the thread:

- from the **raw transcripts** of your meetings and exchanges;
- to the **notes** you derive from them;
- to the **project articulations** you build on top.

Re-contextualizing each conversation becomes a quick and reliable gesture: memory lives in your files, ready to be re-supplied, targeted by routing. The window is empty each time *and* bounded, hence the point of putting back the **right** information, not all the information. You do not structure it like a note tossed off: you make your knowledge **more usable** by the AI, the way you would prepare it for a colleague who has to take hold of it fast.

## The applied science of human-AI interaction

Co-thinking well is not a matter of talent or of the perfect prompt: it is an **applied science**, and BASE **ships the documentation** for it, reflecting the current state of the research AI Swiss conducts (including Bardyn, C. E., "Human-AI Co-Thinking: An Operational Framework for Education", in *Design for Thinking for Transformative Education*, Springer Nature, forthcoming). Collaboration rests on proven principles:

- **compatible terms** to exchange without loss (Shannon, 1948): the other party understands only what your shared code can carry;
- **clear objectives**, without which collaboration fails even when the other party is brilliant (Locke & Latham, 1990);
- **correction loops**, like a meeting that realigns (Wiener, 1948): you generate, you evaluate, you realign.

The lesson fits on one line: **the bottleneck of human-AI collaboration is shared understanding, not raw power.** And shared understanding cannot be bought ready-made and cannot be recited: hence BASE's path, between AI through products (which you consume) and AI through concepts (which you recite), both scientific and sovereign.

The operational form is a **co-thinking loop**: state the goal and the constraints, generate, evaluate against an explicit check, revise. You start again, and the structure carries the context so each turn stays light. The full method, principle by principle: [Co-thinking in practice](pratiques-co-pensee.md).

## What BASE brings: a structure that you own

Co-thinking well must not drown you. A strong structure upstream makes each turn light downstream. Here is how BASE goes about it:

- **Point to what matters.** A *process* opens only the resources useful to *this* task, not your entire folder. You decide what the AI sees. Less noise, better answers, and a human review focused on a legible step rather than an opaque block.
- **Make the boundary explicit.** This is first a security question: instructions are executed, content is not. Mixing the two opens the door to injection, when a processed document ends up dictating the model's behavior. So BASE separates **know-how** (text the model follows, with no guarantee) from **knowledge** (content it consults), and distinguishes the *consigne* from the **mechanism** actually enforced by the code. You document the boundary instead of papering over it.
- **Keep decisions visible.** A proposal is shown (a diff) before any write; the `[A VALIDER]` markers flag what awaits your judgment. These markers matter a great deal: they serve as a searchable landmark in your files and lend themselves to algorithmic handling (you can list them, count them, block while any remain). Nothing important happens without you.
- **Provide a shared memory.** Memory becomes a simple file structure; language becomes an explicit articulation, set down in black and white rather than left to guesswork. You keep, version, and evolve what the AI draws on.

## Fine-grained control is what makes for efficiency

**Having access to information is not having access to useful information.** Plugging in your whole inbox and your whole drive as context is noise if nothing is targeted. Choosing what the AI sees is a matter of confidentiality, but also and above all of **efficiency**: in information (the right context, not all of it), in cost (a tight context is faster to process), and in attention (you review a framed step, not a sprawling result).

This is also why the "multi-agent everything" reflex often misleads, and it is worth being precise about its true value. Delegating to several agents in parallel pays off when the pieces are genuinely independent, and especially when a clear verification signal means more compute yields more results: combing through logs to find incidents, searching code for vulnerabilities, generating then sorting a thousand variants. There, parallelism pays, and you should use it. The cost appears as soon as the task does not split cleanly, that is, as soon as the agents have to *share* context. Their only channel is then natural language, underspecified by nature: at each handoff, context is copied, summarized, re-verified, and a little coherence leaks away. Multiplying copies of the same model adds no extra eyes, only throughput: they share the same bias. For judgment work, which rarely splits without loss, a single agent that keeps the thread, carried by an explicit structure, costs less than a coordination that gets paid for in tokens and misunderstandings. **The bottleneck of agentic systems is not power, it is shared understanding.** The useful question is therefore not "one agent or several", but "does this task split without costing coherence": often no, and that is why "agentic everything" describes only a corner of real work.

## The AI retrieves only what you have made findable

We often hear that "the AI starts from scratch" at each exchange. Let us be precise, because the nuance changes what to do. It is not the whole system that forgets: it is the generative core, the language model. At each call, it starts with an empty **context window**, with no memory of the previous one. Memory has not disappeared for all that; it is simply *external* to the model. A larger system around it, like BASE, can perfectly well give it back: your files are that memory, and the whole challenge becomes filling the window, at the right moment, with the right pieces.

How are these pieces retrieved from your files? By mechanical means, the same as yours, but faster: you list folders, you search for words, you cross-reference by resemblance (glob, grep, and semantic search, in the vocabulary of the tools). From your world, then, the system retrieves only what you have made findable, and at the grain at which you have made it findable.

The practical consequence: **structure information every time you touch it, and put it away better than you found it.** Whether it serves as memory (a history, a past decision) or not (a rule, a fact, a catalog), the model will have it in view only if the system retrieves it and places it in its window. And not just for today's task, but for all those that follow: a clearly named note, a fact filed in the right place, a rule written cleanly once pay off every time you come back to draw on them. It is the flip side of "an access is not a useful access": you do not file for today, you make findable for what comes next.

That leaves the right grain. Too coarse, and you can no longer point to the useful piece within an indistinct block; too fine, and the piece loses the meaning its surroundings gave it. The right granularity is the one you can point to with a single gesture and that stands on its own: small enough to open without dragging the rest along, large enough to keep its meaning. It is this repeated work that makes the right information surface in the window at the right moment, ready to serve precisely rather than to be groped for. The discipline is first human; BASE gives it support (named files, an external memory you own, reusable competences distinct from processes, a router that retrieves the right unit of work), but the habit of filing well, every time, remains yours.

## Verification, one important brick among others

Co-thinking exposes you to many potential losses of control, and verification prevents one of the most silent. The core of a model, the famous "LLM", is a generator of probable completions: it can generate, compare, and simulate, but **it never verifies**. In some domains, a verifier exists outside the model: a compiler for code, the rules of chess, a data schema. There, an error is detected and can be corrected, through iteration for instance. But most real work has no external verifier: an analysis, an offer, a decision, an internal memo, your intentions. For this work, **the only verifier is you**, calibrated to the risk you accept.

The trap is that we verify poorly by default. Fluent text inspires a trust it has not earned; an answer obtained without effort switches off critical thinking. Every claim accepted without scrutiny adds a **verification debt**: a reserve of unverified assumptions that eventually gives way under the first real pressure. So treat every answer as a **hypothesis**.

The reliability of an output is a property of the workflow that produced it, not of the model alone. The good news is not only that a strong structure upstream lightens verification downstream. It is also that **the structure can include verification itself**, in the form of iteration, review, re-anchoring in reliable data. BASE tools up this engineering with elements you own (markers, write gate, process evaluation), enough to make an output reliable enough to ship, without thereby guaranteeing that an answer is true. Verification remains a brick, important and non-optional, never the column.

## The limits of the task, the AI shares them

A model does not verify; nor does it escape the limits of the task itself. Finding information requires combing through where it might be; computing correctly requires following a procedure flawlessly; reasoning far requires holding ever more intermediate steps. Humans and AI alike run up against these three requirements, and answer them the same way: a search engine, a calculator, a medium to write on to stay coherent. The difference is not in the need for tools, but in whose hand they are: it is you who decides to use them, and you who judges what comes out.

These limits are not a flaw in the AI, they are properties of the problem, which no one bypasses by intelligence alone. A computation does not create the information absent from its inputs, and no physical process exceeds what is computable: that is the physical Church-Turing thesis (any physical process can be simulated on a Turing machine to the desired precision). Its extended version, about efficiency (a classical simulation at only polynomial overhead), is more delicate: quantum computing contradicts it for certain tasks, but under hardness assumptions that are accepted and not proven, and without touching language models, which are classical. The practical lesson fits on one line, it is [principle 6 of co-thinking](pratiques-co-pensee.md): what would require intermediate steps from you requires them from the AI, as from any system in the world (and if you think you can do better, go fetch your Nobel prize!).

## The freedom to think any process

Most work consists of following the thread of your own thinking, fluid, not cutting it up in advance into "agents". Yet many tools impose a grammar: break things down into agents, roles, handoffs, configured in their interface. It is the tool that dictates the process.

BASE does not impose this grammar. You can just as well keep a framed context and think. **Autonomy without dialogue stays fragile, whatever the intelligence on the other side.** Beyond the question "where are my servers?", the deeper risk is to lose the freedom of our interactions with AI, to end up thinking in agents and interfaces, through someone else's instructions. BASE defends the freedom to articulate *any* process, including none.

### Why we say "agent" even as we criticize the grammar of agents

Because the models and the tools, for their part, are used to the word. Models are trained on the vocabulary of "agents", "skills", "tools"; the tools (AI editors, agent platforms, MCP servers) are built around it. To be *executable* on these tools, BASE has to speak their language at the boundary. Refusing the word would not make BASE purer, only incompatible.

So we adopt "agent" **out of pragmatism, not conviction**: it is an interface term toward the tools, not the mental model of the work. Concretely, a BASE "agent" is **your** Markdown, readable, comparable, deletable, and **optional**: a simple train of thought, not a worker you launch and forget. What you own is the intelligence layer; the word "agent" belongs to the execution layer that runs it.

## Tools pass, the context remains

Cognitive sovereignty has a practical corollary: your know-how becomes **essentially independent of the model** that executes it. A model stays better here than there, more or less elegant to instruct; but at the level of instructions, a model that follows instructions will follow your procedures, whichever one it is. You change models without starting from scratch.

This is why value shifts. In most current discourse, it lies in the model or the product of the moment; with BASE, it lies in the **articulation of your know-how**, in a base you own. Two assets compound: your **context** and your **tools**. The risk is to bind everything in a box you do not own; BASE keeps the context layer (and the routing, and the index) yours and **separable from the model**, so that a change of vendor becomes a matter of configuration, not a migration.

And it is **durable**, not a stopgap while waiting for better models. A more powerful core generates better and reasons better, but it still does not guess your context nor verify itself. Future models will have the same fundamental nature and the same struggle: the information missing about your reality is not in the model and cannot emerge from scale alone. The structure you build therefore does not go stale at the pace of products.

## An anchor, when tools change faster than literacy

Building with AI is not just about choosing a product. Interfaces change so fast that even those who design them do not know what they will look like in a few months. The common answer from the big players is implicit: try it, learn as you go, switch tools every few months. You do not build a durable literacy on that, and you do not train a team on shifting ground.

BASE **aims to serve as an anchor**, insofar as your files stay readable and portable. Your method, your processes, your checks live in a structure you own and that does not follow the pace of products. The depth of integration, for its part, varies by tool; but adapting to a new tool does not require relearning everything: it is done through BASE's **adaptation layers** (a bridge, an adapter), with little effort, and the AI itself can help you rewrite them. You change execution; your intelligence remains.

## Calibrated, not anti-automation

Co-thinking means **choosing consciously**, not doing everything by hand. Delegate what has a verifier or requires no judgment; co-think what carries risk and meaning. BASE simply makes human-in-the-loop the *default* choice, and delegation an *explicit and visible* choice, where the market trend is *invisible* automation.

Some tasks can be delegated; others, fundamentally, cannot. Beyond the risk of wrong answers lies another, more insidious one: the gradual loss of the big picture, when output accumulates faster than understanding and review becomes a ritual. BASE cannot force you to structure your interactions accordingly, but it can help you do so, so that you remain able to preserve that big picture, by nudging you to keep a certain level of exchange with the AI rather than pure delegation.

## BASE puts what matters in front of you

A good collaboration spares you the search. Just as a *process* must give the AI the information that matters, BASE must give *you* what matters, without your having to ask:

- the **welcome** (concierge) orients you the moment you are lost; a **router** takes away the mental load of finding the right process (the model decides from the "when to use it", with a deterministic floor, simple but effective and extensible through adapters, for use with no model); even its honest abstention sends you back to the welcome rather than into the void;
- each process highlights what you must verify or decide, and flags the decision points (`[A VALIDER]`, `[ATTENTION]`) before a problem arises.

You should never have to dig to reach what matters.

## Going further

- [Co-thinking in practice](pratiques-co-pensee.md): the method, from the everyday gesture to the principles that ground it.
- [The interactive documentation](../reference/documentation-interactive.md): the docs locally, and BASE Studio to see and tend your processes, two optional local interfaces.
- [Public framework](../reference/framework-public.md): the abstractions, sovereignty around the models, interoperability.
- [BASE and your AI tools](../reference/base-et-vos-outils-ia.md): with your tools, not in their place.
- [Sovereignty and trust](../trust/souverainete-et-confiance.md): the honest bounding, and defending the choice before an IT department.
- [Manifesto](../../../MANIFESTO.md): the vision.
