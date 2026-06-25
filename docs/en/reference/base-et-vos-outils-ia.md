<!-- fr-synced: ca4181608f457081e35a170e8c64f7dc402c7127 -->
# Keep your AI tools, own the intelligence they run

> This page is for anyone already using an AI tool (an assistant, a platform, a suite) and wondering where BASE fits. In a nutshell: you keep your tools for execution, and you own in BASE the intelligence they run.

"BASE or my tool?" is a false choice: the two play different roles. A platform or a suite gives you execution: compute, storage, connectors, and increasingly assistants and automation on top. BASE provides something else: **the articulation, owned and portable, of how AI works on your domain**.

The real question is: **who owns that articulation, you or your vendor?**

To place BASE category by category across the 2026 tool landscape (hosted assistants, office copilots, RAG pipelines, governed agent platforms, orchestration frameworks, and the rest: where it is differentiated, complementary, or just a port), see [Where BASE fits](positionnement.md). This page gives the principle; that map gives the place.

## Where it really compares

Many tools today let you point AI at your files (custom assistants, source notebooks, memories). That is real and useful. The difference lies elsewhere.

"I already have an AI tool," you say. Which one? They don't all play the same role, and none of them plays BASE's.

| | Generic chat | AI office suite | Agent platform | BASE |
|---|---|---|---|---|
| **You own the files** | No | No | No | **Yes, readable, portable Markdown** |
| **Context scope** | The conversation | Per connected source | Per configured agent | **Per task: the process opens only what's useful** |
| **Egress control (mechanism)** | No | No | Varies | **Yes, before the call, through the broker** |
| **Propose then commit (a diff before the write)** | No | No | Varies | **Yes** |
| **Model choice** | Imposed | Often imposed | Depends on the platform | **Yours, external** |

The decisive point: scope is attached to the **task** rather than to the assistant. It is **text you own** rather than an object lodged in a platform, and it works with **the model of your choice**. From this come finer review, portable use, and sovereign intelligence.

And what BASE does not replace (IAM, DLP, legal archiving, governance): see [Security and limits](../trust/securite-et-limites.md).

## Four promises you were sold, and what they leave out

You've probably been hooked up with all of it: the assistant sees the inbox and the shared drive, you can build yourself a library of agents, the AI reaches into your carefully curated database, and the whole thing ticks the boxes, AI Act included. The impression takes hold that the structure is done. Read each claim again: what's missing is never the power, it's a structure you own and that replays.

**"My AI sees all my emails and my shared drive."** The "see-everything" default lets an opaque process decide on your behalf what it reads, and a model degrades when you drown it in off-topic information: it answers worse, costs more, is harder to review. These suites can in fact target. But there the targeting is manual and redone every time, never kept. The default stays "see-everything."

**"I can build a whole library of agents."** Yes. And with it, a burden: thinking in agents instead of following your train of thought, then having to figure out each time which one applies. The complexity hasn't disappeared, it has moved: from the task onto you.

**"My AI sees my entire carefully structured database."** Access is not useful access. Without telling the AI what to read and why, opening the whole database creates no value, just one more surface to watch.

**"My system ticks all the boxes, AI Act included."** Being compliant is necessary. It doesn't make the AI useful for all that: compliance bounds the risk, it doesn't produce the value.

None of these tools is at fault. The problem is the default setting, the one that leaves the structuring to an opaque process, or to you, without making it owned or replayable. BASE shifts that setting: it attaches scope to the **task**, writes it once, in text you keep, and replays it identically instead of redoing it from memory. You tell the process what to open and why, and that choice is kept instead of lost. The lesson fits in one sentence: **access is not useful access.**

## Complementarity: BASE lets itself be consumed by your tools

Being text plus an MCP server, BASE plugs into your tools rather than competing with them:

- **MCP** (an open standard): BASE exposes an MCP server; a compatible tool can call it to route, open, and read its resources.
- **Files**: your Markdown can live where your tool reads it and feed an existing assistant.
- **Open agent protocols**: a path forward for making agents defined in BASE cooperate with others; not implemented in BASE today.

### One door, not a clutter of tools

An MCP server can expose dozens of granular tools. That is a deceptive convenience: each added tool clutters the model's context, dilutes its attention, and multiplies the surfaces for error and permission. The more you tool up a model, the worse it chooses.

BASE takes the opposite stance, and it is a design choice, not a limitation. Its surface comes down mostly to one thing: a **semantic front door**, the router, which receives the intent in natural language and directs it to the right agent and the right process, opening only the resources useful to *this* task. Around that door, a few mediated operations (read a resource, propose then confirm a write, list the markers) under the broker's guarantees, rather than a swarm of capabilities. The model doesn't need to know twenty tools; it needs to step cleanly through one door, and to find behind it a context already framed.

In other words, keep your tools for compute, storage, and execution; own, in BASE, the intelligence layer. See also [The public framework](framework-public.md), section "Sovereignty around the models."

## Scheduled and autonomous agents

Want an agent that runs on a schedule (say, every Monday) from a process defined in BASE? That's a good case, on one condition: an agent that runs on its own for months is often the very place where review slackens the most. The rule fits in one sentence: **generation can be automatic, validation stays held.**

The recommended path, whatever the tool, governed and auditable:

1. A **scheduler** launches the run (a scheduled trigger, a job scheduler). It holds no business logic.
2. Your platform's **execution agent** calls **BASE's MCP server** to obtain the process and its targeted resources.
3. It **runs the generation** with the platform's model and connectors.
4. At the process's **decision points**, the agent **stops for human validation** (most recent platforms offer a "draft" or "require approval" mode).
5. After approval, the write is **applied**, and a trace keeps the memory of it (at the level of detail you choose).

On the BASE side, nothing is written blind: actions with consequences go through a **proposal** (a diff shown) before being applied; low-risk steps, verifiable by a rule, can be confirmed automatically. You calibrate, step by step, what is automatic and what waits for a human.

The centerpiece: the process is text **you own**. You can change scheduler, model, or platform without rewriting it.

> **If someone pitches you scheduling or autonomous agents:** keep the logic in BASE, have the platform call it, and keep the human at the validation point. Scheduling automates *production*, not *decision*.

## For your specific tool: ask BASE

This document describes the **principle**, valid for any tool. For the **concrete integration with your tool**, BASE can guide you:

- tell it which tool it is;
- give it the link to the tool's integration documentation (or let it search if your environment allows web browsing);
- BASE reads that documentation and guides you step by step, placing each step in the right plan (scheduler, call to BASE's MCP server, human validation, application), and preserving the review points.

In practice: load the BASE concierge and ask "help me integrate BASE with [my tool]" or "how do I schedule an agent with [my tool]." See the welcome agent in `.ai/agents/concierge-base/`.

---

*Third-party tool capabilities evolve quickly. This document describes structural differences and a principle meant to last, without depending on a specific product; for the details particular to your tool, lean on its up-to-date documentation (BASE can help you with that).*
