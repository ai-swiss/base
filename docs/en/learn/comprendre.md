<!-- fr-synced: db4e1d11d1e69c12d64c8a50c098ba9cb719e1d7 -->
# Understanding BASE and shaping how you work with AI

Working seriously with AI means accepting that it produces fast but sometimes errs with confidence: what is at stake is keeping control of what you sign your name to, without giving up speed. This page shows how BASE structures that collaboration so quality holds over time, whether you are an independent professional, an SME, or a public service. You will see **why** this structure is necessary, **how** an agent works, and **how to build one** for your line of work.

> The technical terms on this page (broker, routing, mechanism, consigne, egress) are defined in the [glossary](../reference/glossaire.md).

---

## Why this approach?

BASE does not start from a preference for any one tool. It starts from an observation: generative AI produces easily, but lasting quality depends on what surrounds that production. What leads is sovereignty over your knowledge and the articulation of the whole: context, memory, process, permissions, and human decisions. Verification fits into that structure as a craft, never as a guarantee.

The approach is therefore institutional before it is technical. It seeks to make explicit what, in much AI usage, stays implicit: who knows what, who decides what, which data is used, which actions are allowed, and how to pick the work back up later.

The difficulty comes from the fact that this technology does not merely resemble classic digital software. Traditional software exposes screens, menus, buttons, forms, and rules coded in advance. A language model instead produces a behavior: it answers, rephrases, infers, imitates reasoning, sometimes follows a method, sometimes forgets a constraint, and often gives an impression of human continuity. That impression should not be mistaken for consciousness, intent, or guaranteed understanding. Yet it is enough to change how you work.

To work with this behavior, the most useful image is that of an **amnesiac colleague from elsewhere: a rich representation of the world, but not of yours**. On the representation side: it knows verifiable domains, more solid where training is dense, like code or math, and it can read, write, generalize, and propose. On the context side: it knows neither your terrain, nor your clients, nor your unwritten rules. This image is not a definition, it is a tool for deciding more cleanly: how to frame a design, where to place verification, how to structure the knowledge you hand it. Two traits, specific to the model, complete the picture. First, its memory is not shared by default: each conversation starts from scratch. Second, the language that drives it stays underspecified: the same consigne can be understood in several ways. These two traits are at once a strength (flexibility, the ability to generalize) and a weakness (forgetting, ambiguity). So you must give it a working memory, processes, verification criteria, and limits on its actions. This account, and the losses of control it helps you avoid, is developed in [Co-thinking with AI, why BASE](co-penser-avec-lia.md).

### The problem

Most people use AI as an interlocutor with no structure: you open a chatbot, ask a question, get an answer. That works for one-off questions, but it quickly hits its limits:

- **AI does not know your company.** Every conversation, you start from scratch.
- **The answers are generic.** AI guesses what you want instead of knowing it.
- **Nothing is capitalized on.** No history, no structure, no reuse.
- **You don't know when it is wrong.** AI produces fluent, confident answers even when they are false. With no structured context, you have no reference point to judge the quality of the result.

### The solution

Instead of forcing this collaboration into scattered configuration interfaces, you give AI a **structured knowledge base** and you work in a loop:

```
    ┌──────────────┐
    │  1. FRAME    │  Clearly state what you want,
    │              │  with the needed context
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  2. DELEGATE │  The AI generates within the defined frame,
    │              │  up to the next checkpoint
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  3. EVALUATE │  You check: is it correct?
    │              │  Does it match my reality?
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  4. ADJUST   │  You refine, correct, enrich
    │              │  → back to step 2
    └──────────────┘
```

This cycle is the method itself. The best results come from several turns through this loop, rarely from a single perfect request. This is what we call **human-AI co-thinking**.

**The fundamental principle**: an AI answer is a proposal to examine before turning it into a conclusion. Often it is right; sometimes it is confidently wrong. Your role is to frame, evaluate, and adjust, in a loop, until you get something reliable. The files are the source of truth.

To go deeper into the principles of this co-thinking: [Co-thinking in practice](pratiques-co-pensee.md).

---

## Why it works

Every BASE design choice rests on a structural necessity. Far from arbitrary conventions, these choices answer real constraints of coordinating between entities that do not work the same way. These constraints apply whatever the tool, the model, or the era.

### 1. What is not written down is forgotten

You spent a good while configuring your assistant yesterday. Today you open a new conversation. The assistant knows nothing anymore. All that work, lost.

This is why BASE rests on **files**, not conversations. A conversation vanishes when you close the tool. A file stays. A session journal extends that memory from one conversation to the next.

*What happens when you ignore it:* every session starts over from scratch. The user repeats themselves. The agent asks questions it already had answers to. Work does not accumulate.

### 2. What is not searchable is lost

You have 50 quotes, 30 clients, 6 months of work. A client calls back about a pending proposal. What is pending?

This is why the markers `[A VALIDER]`, `[DECISION]` are structured and searchable. "What is pending?" has an answer in one second, even months later.

*What happens when you ignore it:* the information exists somewhere, but you can no longer find it in time. Pending proposals get lost. Decisions made are not traced. It becomes impossible to reconstruct why a choice was made.

### 3. The one who produces cannot judge their own work

The AI proposes a quote for 2,085 CHF. Are the amounts correct? You ask it to check. It answers "yes, everything is correct." But it made a calculation error, and it does not catch it, because checking your own errors requires an independent vantage point that the producer, by construction, does not have.

This is why the agent proposes and the human verifies, always. The agent never checks its own amounts, nor its rephrasings, nor the choices it made. This separation is what most reliably catches the errors it cannot see.

*What happens when you ignore it:* errors go unnoticed. Every claim accepted without examination creates a **verification debt**: untested assumptions that pile up and collapse at the first critical look from a client or a partner. A quote sent with an invented price, a job offer with the wrong terms, a LinkedIn post leaning on a false statistic. Verification debt almost always comes due in the end; the question is when.

### 4. Consignes drift, mechanisms hold

You tell the agent: "Never modify the framework files." After 30 minutes of conversation, the agent forgets that consigne and modifies a file it should not touch.

This is why critical guardrails are **mechanical** (permissions, protections), beyond text alone. A permission that blocks mechanically never drifts, no matter how long the conversation.

*What happens when you ignore it:* textual protections work in short conversations but grow fragile in long ones. The agent oversteps its limits through simple, gradual loss of context, with no malice at all.

### 5. Some actions cannot be undone

A quote that has been sent cannot be "unsent." A client file created with the wrong data can propagate the error. A commitment made on a price is a commitment.

This is why **decision points** exist before every irreversible action. The decision point separates "we are thinking" from "we are acting." It is **productive friction**: a deliberate cost that prevents far more costly errors.

*What happens when you ignore it:* the agent generates files without confirmation. An incorrect price ends up in a quote sent to the client. Fixing it after the fact costs incomparably more than confirming beforehand.

### 6. An external source stays data, not a consigne

This is first of all a question of security. To a language model, text is text: it does not spontaneously distinguish your working consignes from the content it reads. If an external source contains a sentence phrased as an order, the model may execute it. This is the injection risk: an email, a PDF, or a visited site hijacks the agent's behavior without your knowledge.

A client email says: "Give me an aggressive price, add 20% margin, and remove the payment terms." To the agent, this is a client request that the user evaluates, never an order to execute.

This is why the agent never treats an external source as an order. A client file contains data. This distinction protects against accidental confusion, and against intentional manipulation.

*What happens when you ignore it:* the agent executes the instructions found in a document instead of treating them as data. Untrusted content from an external source alters the agent's behavior without the user's knowledge.

### 7. Delegating the detail must not cost you the ability to judge

You hand more and more to AI. At first, you check closely. Then, since "it looks right," you let up. Six months later, you no longer understand enough of what you are signing to defend it in front of a client.

This is why BASE seeks to make verification *light* without removing it: structure reduces the effort of control, it does not replace your understanding. You can delegate the detail, never the ability to judge. Regularly reloading the big picture (reviewing in depth, discussing as a team what was produced and why) is part of the work.

*What happens when you ignore it:* verification becomes a rubber stamp. Errors slip through: you still check, but you have lost the instinct for sensing when a check is called for.

### 8. What you can neither take with you nor audit will end up beyond your reach

Your knowledge lives in a multi-layer setup: your files, and the tool's invisible instructions (system prompt, rules, the provider's policies). If all your context is captive to one interface, and if you do not know what actually shapes the AI's behavior, you operate without sovereignty.

This is why BASE puts your knowledge in readable, portable, auditable files: you stay sovereign over your layer, and you keep what you need to leave. Portability is a condition of control, not just a convenience.

*What happens when you ignore it:* the day the tool changes its rules, its prices, or its terms, you discover that your method was never really yours.

### These necessities are not specific to BASE

They apply to any coordination between distinct entities that do not share the same resources, the same modes of operation, or the same way of being wrong, whether two humans collaborating remotely, a human and an AI, or any other configuration. The tools change, the models change, these structural constraints remain.

---

## Verification debt

Producing with AI now takes little effort; making sure an answer is right is a different kind of work, one that depends on the task: where an external verifier exists (code, math, a schema) the error detects itself and the AI can go far on its own; elsewhere, the verifier is you, and a strong structure keeps that verification light rather than heavy (otherwise, verification debt piles up). This asymmetry between producing and verifying is the observation that founds BASE, and it is what makes the structure indispensable.

Every claim accepted without examination is a debt: an untested assumption sleeping in your files. A quote whose price "looks right," a client record whose address is "probably correct," a job offer with terms deemed "standard."

The debt accumulates silently. It surfaces at the worst moment: when a client disputes an amount, when a candidate spots an inconsistency, when a partner points out an error.

**Strong structure upstream → light verification downstream.** This is why BASE structures before generating: up-to-date domain files, precise knowledge, explicit markers. The stronger the structure, the lighter the verification. The weaker the structure, the more verification debt explodes.

---

## Anatomy of an agent

An agent is made of 3 main elements, plus optional extensions:

```
AGENT.md                          The role file: who it is, what to do per request
    │
    ├── skills/
    │   ├── processes/            The processes: how to do X step by step
    │   └── competences/          The expertise files: what it knows about the work
    │
    ├── templates/                The templates: what the documents look like
    │
    └── tools/                    The toolbox: scripts, connectors (optional)
```

> **Why "agents" and "skills"?** These are the most widespread names today, and AI models recognize them natively: BASE reuses them out of **pragmatism**. What matters is what sits behind the vocabulary:
> - **Intelligence in text.** An agent is a set of Markdown files that are readable, versionable, portable from one AI tool to another, with no code or proprietary platform. You stay the owner of the structure.
> - **Know-how separated from knowledge.** BASE deliberately distinguishes *processes* (how to do something, step by step) from *competences* (what it knows, reusable). This is first of all a question of security: *processes* are consignes the agent executes, while *competences* and domain data are content it consults without executing. This separation, not the word "skill," is the real contribution.

### The job description (AGENT.md)

The only file an AI tool needs to load. It contains:
- **Who it is**: its role and identity
- **Its interaction philosophy**: propose, verify, confirm before acting
- **What to do depending on the request**: a routing table (intent → skill)
- **Which files it knows**: the list of domain data
- **Its guardrails**: what it never does

You will come across files named `assistant-devis` or `assistant-rh` that are in fact agents: this is intentional. The file carries the name of the assistant whose job description it is. The agent is the file you keep; the assistant is what it becomes once brought to life by a model.

### Skills: workflows and knowledge

All skills are text files in the SKILL.md format. This format is readable by every model and recognized natively by some AI tools; in the others, the agent can open the files explicitly. Each skill has metadata in its header (YAML frontmatter) and content in Markdown.

BASE distinguishes two kinds of skills:

**Processes** (invocable workflows): structured conversations that the user triggers. "Create a quote" → the agent follows the process step by step, with rephrasings (to check understanding) and decision points (before every irreversible action).

**Competences** (reusable knowledge): expertise sheets the agent consults when the workflow or the request calls for it. Quoting terminology, VAT rules, communication conventions. Competences are reused across several processes: that is their whole point.

Three competences ship with every agent:
- **Markers**: conventions for making the state of the work searchable (`[A VALIDER]`, `[DECISION]`, etc.)
- **Journal**: memory between sessions, entries written at the end of each workflow
- **Communication**: rules for communicating with non-technical users

### Rephrasings and decision points

Two distinct mechanisms pace the workflows:

**Rephrasing** (light, low friction): the agent summarizes what it understood. The user corrects or confirms. Being wrong has no consequence: you adjust and move on. Frequent.

**Decision point** (critical, productive friction): the agent is ready to create a file or modify data. The user confirms explicitly. Acting without confirmation could create incorrect data that is hard to fix. Rare and important.

The distinction is essential. If every step is a decision point, attention thins out and the mechanism loses its protective power. Rephrasings are light and frequent. Decision points are rare, explicit, and reserved for the moments that count.

### Markers

Structured text, inserted into the generated documents, that makes the state of the work searchable. Their fixed form makes them landmarks a human spots at a glance and a script can process automatically: count them, list them, group them.
- `[A COMPLETER: ...]`: missing information
- `[A VALIDER: ...]`: proposal awaiting confirmation
- `[ATTENTION: ...]`: risk or alert
- `[DECISION: choix | raison]`: choice confirmed by the human

The markers map to the steps of the co-thinking loop: `[A COMPLETER]` appears during framing, `[A VALIDER]` when the agent hands over a proposal, `[ATTENTION]` during evaluation, `[DECISION]` after adjustment. After months of use, these markers let you instantly find everything that is pending, everything that has been decided, and why.

### The journal

Memory between sessions. The agent writes an entry at the end of each workflow in `.ai/journal/`. When you come back the next day, the agent reads the journal and knows where it left off. Without a journal, every session starts from scratch, and necessity 1 is violated.

### Forms (templates) and the toolbox (tools)

Document models the agent copies and fills in. Optional scripts and connectors. An agent works perfectly well without tools.

---

## Why files, and not something else?

Text files are a deliberate structural choice, not a technical reflex:

- **Readable by humans AND machines.** No special tool needed to read a Markdown file. No API needed to access your data. Open the file, it is all there.
- **Versionable.** With Git or simply with `_v1`, `_v2` copies. Every change is traceable. You cannot lose an earlier version.
- **Portable.** Switch tools tomorrow: your files stay. No migration, no export, no dependency.
- **Durable.** Databases change format. APIs disappear. Platforms shut down. A text file written in 2026 will still be readable in 2046.
- **Auditable.** An auditor, a partner, a colleague can open any file and understand what happened. No black box.

AI tools evolve fast. Models change. Interfaces are renewed. But your skills, your templates, and your domain data remain. **Your knowledge structure is your real capital.**

The SKILL.md format is above all a readable textual contract. If a tool supports it natively, the experience is smoother. If it does not, a SKILL.md is still a Markdown file the agent can read explicitly.

### Tool configuration

For your AI tool to load the agent and discover its skills with as little friction as possible, you need a tool-specific configuration. Some tools automate part of the loading, others ask you to point manually to `AGENT.md`. Every tool needs 5 things:

| Need | What it is | Why it is necessary |
|--------|-------------|--------------------------|
| **Permanent context** | Load AGENT.md every session | Without memory, the agent knows nothing (necessity 1) |
| **Discoverable skills** | The tool finds and invokes the SKILL.md | The user types `/nouveau-devis`, the tool knows what to load |
| **Per-path rules** | Reminders when the agent touches sensitive files | Consignes drift, automatic reminders don't (necessity 4) |
| **Permissions** | Control what the agent can do | Mechanical bounds, not textual ones (necessity 4) |
| **Framework protection** | Reduce or block modification of `.ai/` depending on the tool | The framework's instructions must not be modified by accident |

The assistant creator looks up the tool's current documentation to propose the right configuration. If the tool is not known, the agent guides the user through a manual configuration.

### Guardrails: two levels

**Level 1: textual.** "What you never do" in AGENT.md. Enough for short conversations and simple cases.

**Level 2: mechanical.** Permissions, protections, rules in the tool's configuration, or actions mediated through a BASE connector. When a guardrail is critical and the consequences of a slip are serious, the mechanical level is indispensable. Level 2 does not replace level 1: it reinforces it wherever the harness allows.

---

## Build it step by step

| Step | What you do | What you learn |
|-------|-------------------|---------------------|
| 1 | Try the `assistant-devis` example | How an agent works in practice |
| 2 | Read the example's `AGENT.md` | How a job description structures behavior |
| 3 | Read a workflow (SKILL.md in processes/) | How a structured conversation guides the agent |
| 4 | Create your own agent (with the assistant creator) | How to encode your domain expertise |
| 5 | Add a workflow to your agent | How to extend the capabilities |

Each step stands on its own. You can stop at any point.

---

## Create your own agent

### The guided way (recommended)

Open the BASE folder in your AI tool and say:

> "Read `.ai/agents/createur-agent/AGENT.md` and follow its instructions"

Or, if the skills are already discovered:

> `/creer-agent`

The assistant creator will:
1. Ask you questions about your line of work and your daily tasks
2. Identify your workflows → it will create the processes
3. Identify your domain knowledge → it will create the competences
4. Identify your standard documents → it will create the templates
5. Propose a complete architecture, which you validate
6. Create all the files for you
7. Configure your AI tool for the new agent

No technical skill required. It all happens through conversation.

### The manual way (for the self-reliant)

The `.ai/agents/_template/` folder contains the base structure with a step-by-step guide.

### The key idea

What makes an AI assistant useful has less to do with the technology than with the **structure of the knowledge** you give it. A good AGENT.md with good skills turns any AI tool into a specialized assistant. Your expertise is the multiplier. AI amplifies it, but does not replace it.

---

## Best practices

### Verify

1. **Verify before validating.** An AI answer always remains to be checked, especially for facts, prices, and commitments: it can be false while looking certain. Every claim accepted without examination creates a verification debt.
2. **Watch out for three traps.** Ease (it is easy to ask, not to get a good result), appearance (well-written text is not necessarily correct), and vendors' overblown promises. See [Co-thinking in practice](pratiques-co-pensee.md).

### Structure

3. **The files are the truth.** If it is not in a file, the agent does not know it. Keep your files up to date: they are your assistant's memory.
4. **Start small.** An agent with 1 workflow that works well beats 5 untested ones. You can always add more.
5. **Version the resources.** `_v1`, `_v2`, etc. It lets you evolve without breaking what works.
6. **Copy, don't modify.** The templates stay intact in `.ai/`. The agent copies and adapts.

### Interact

7. **Discuss before acting.** The agent proposes, you validate. Never the other way around.
8. **One question at a time.** Good workflows move step by step, not all at once.
9. **Summarize regularly.** On long conversations, ask for a summary of progress to keep the thread.

---

## Going further

- **The principles of co-thinking**: [Co-thinking in practice](pratiques-co-pensee.md), 16 principles, 3 decision guides, everything a professional should know
- **Idea gallery**: [idees-agents.md](../guides/idees-agents.md), dozens of agent examples by line of work
- **Create your own assistant**: say "Read `.ai/agents/createur-agent/AGENT.md`"
- **Not sure where to start?** Say "Help me find where to start." The diagnostic guides you
- **Improve an existing assistant**: say "I'd like to improve the [name] assistant"

## The architecture blueprints

All of BASE fits into one compass, blueprints that must **never be conflated**:

> **Text = truth · Router = choice · Broker = guarantees · Index = scale · MCP = exposure · LLM = orchestration.**

- **Text = truth.** Your Markdown/JSON files are the source of truth: readable by a human, versioned, yours.
- **Router = choice.** The router chooses *which* agent and *which* process to follow, or abstains honestly. It takes off your shoulders the mental load of hunting for the right process. The mechanism stays rudimentary but effective, and extends through adapters. It classifies with inspectable rules; it enforces nothing and never invents a route.
- **Broker = guarantees.** The broker is the only place that enforces the invariants (confinement, policy, trace). **A guarantee is only real for an action that passes through it.**
- **Index = scale.** The manifest, the routing registry, the search index are **projections**, never an authority. They can always be regenerated from the text (or deleted).
- **MCP = exposure.** The MCP server exposes the broker's primitives to the platforms; it orchestrates no business logic.
- **LLM = orchestration.** Deciding *what to do next* falls to the model in the tool, guided by the text and the router's candidates; it is not hard-coded into the tooling.

**Design rule:** an extension point must protect a real boundary. Putting domain vocabulary in the index, or domain orchestration in the MCP, is a design error. This is why routing **lives with the text** (`use_when`, descriptions) rather than in a hand-maintained catalog: such a catalog would violate the "Text = truth" blueprint.

## Quick glossary

| Term | Meaning |
|-------|------|
| **Agent** | A file of instructions (`AGENT.md` plus its skills) that you write and own: the job description, portable from one AI tool to another. |
| **Assistant** | Your agent brought to life by a model, on the user side. You own the agent, you use the assistant, you rent the model. |
| **Skill** | A capability of the agent, in the `SKILL.md` format. Two kinds: **process** (a way of doing something, step by step) and **competence** (reusable knowledge: VAT, tone, markers, etc.). |
| **Template** | A document model (what a quote, an offer, etc. looks like). |
| **Tool** | An executable tool (script) the agent can invoke, in dry-run then with confirmation. |
| **Marker** | A text landmark in your documents: `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`. |
| **Journal** | The working memory between sessions, in files. |
| **Broker** | The local core that enforces the guarantees (confinement, validation, policy, trace); the CLI and the MCP pass through it. |
| **Harness** | The AI tool in which you open your BASE: a tool able to read your files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code), or an assistant connected through MCP. |

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use cases in partnership with [Innovaud](https://innovaud.ch).
