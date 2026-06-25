# BASE

> This is a translation. The [French version](README.md) is authoritative.

[![CI](https://github.com/ai-swiss/base/actions/workflows/ci.yml/badge.svg)](https://github.com/ai-swiss/base/actions/workflows/ci.yml)
[![License: Apache-2.0 + CC BY 4.0](https://img.shields.io/badge/license-Apache--2.0%20%2B%20CC%20BY%204.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A518-43853d.svg)](https://nodejs.org)

**Build Assistants with Structured Expertise**
*Bâtir des Assistants avec une Structure d'Expertise*

🇫🇷 [Version française](README.md)

> **Take back control of your work with AI.** BASE keeps you sovereign over how you structure and articulate that collaboration: what the AI must know, what it may do, what you expect, the instructions you give it. All of it lives in files you own and carry from one tool to the next. The sovereignty that matters is **around the models**, not just inside your servers.

**Where to start:** [Try it now](#try-it-now) · [Why BASE](#why-base-exists) · [For your profile](#who-is-it-for) · [Read in the right order](#read-in-the-right-order)

## What BASE gives you

Articulate, freely and portably, the way you think and work with AI. An assistant for your line of work follows from that.

What BASE puts in your hands is the **structure of your working intelligence**: what the assistant knows, what it can do, what it must verify, your rules, your instructions. That structure is laid down in readable text, mostly Markdown, alongside your data in whatever formats suit you. You read and edit it like a plain note, and the power comes from how it is structured, not from a platform.

The challenge is not adopting a big AI product. It is **organizing human-AI collaboration**: what the AI must know, what it may do, what must be verified, what must stay portable, and what must stay under your control. That is what BASE structures.

## What an assistant looks like

To grasp what you are building, one picture is enough. A BASE assistant comes down to a few readable pieces:

- **a role file**: who it is, and what to do depending on the request;
- **its know-how and its knowledge, kept separate**: the *processes* (how to do something, step by step) on one side, the *competences* (what it knows about your line of work) on the other;
- **your data**, alongside, in simple folders that it reads and proposes to update.

It is this separation of know-how from knowledge, far more than the word "skill," that makes the difference. The full detail is further down, in [How it works](#how-it-works).

## The simplest way in: talk to it

Whether you want to **understand, use, or contribute**, the most direct path is to talk to BASE. Two steps.

1. **Download the repository contents** to your computer (the ZIP, or a clone). It is all text files, local.
2. **Open that folder in an AI tool that reads your local files**, one that sees the whole repository, not just a message you paste. For example Claude Code, Cursor, Antigravity, GitHub Copilot, or OpenCode. A plain web chat does not browse a local folder (ChatGPT reaches it only in developer mode, via MCP). Tell it to load `AGENTS.md`, then ask what you are after: "explain BASE to me," "help me get started for my line of work," "where do I contribute?"

It then has access to everything, points you in the right direction, and raises the useful questions for you. And for a concrete first win in two minutes, here is where to start.

## Your first win, in 2 minutes

1. **Open an example folder and look at what is inside.** Take **`exemples/assistant-devis-demo/`** (this folder, not the repository root) in any AI tool that can read the files on your computer. Browse `catalogue/regles-tarification.md` and `clients/dupont-sa.md`: you see the material the assistant feeds on.
2. **Ask, word for word:** "Is Dupont SA entitled to the loyalty discount?"
3. **Watch.** The assistant draws on what you just saw, answers **no** (the loyalty discount requires two mandates; Dupont SA is on its first). As instructed, it names the files that justify it and leaves an `[A VALIDER]` marker. Without your rules, a generic assistant would have served a plausible "yes." Here, it proposed and flagged what remains to be validated; it changed nothing on your behalf.

Want a finished document? Then ask "Show me quote DEV-2026-001." Nothing to install on the BASE side; stuck? say "help."

> **Tools.** Any AI tool that can read the files on your computer will do, for example Claude Code, Cursor, Antigravity, GitHub Copilot, or OpenCode. Not every platform is compatible, and BASE favors none.

<details>
<summary><strong>Other ways in</strong>: depending on your situation</summary>

- **Learn by building** (30 min, every step verified): the [tutorial](docs/en/tutoriel/index.md), a village tourist office from scratch.
- **Without a code editor**: if you have an AI that lets you upload files, that is one way to test. See [Try BASE with nothing installed](docs/en/start/essayer-sans-installer.md): open an example in a web AI chat and attach its files.
- **Ask BASE questions**: open the repository contents in an AI, load `AGENTS.md` (the entry point), and ask it to explain BASE and to raise, for you, every useful question.
- **Let your AI install it for you** (without touching a terminal yourself): [Have your AI install BASE](docs/en/start/installer-par-votre-ia.md).
- **Even shorter**: [see BASE in action](docs/en/start/demo-60-secondes.md), in under a minute.

The repository root is the framework (the router and the tools to build or audit a BASE), not a ready-to-use assistant. Always open an example folder.
</details>

---

## The essentials

AI has made production nearly effortless. But it does not remove the need for context, method, verification, responsibility and memory: the easier it becomes to produce, the more important it becomes to structure what guides the production.

That is where the sovereignty that matters is decided. Not just "where are my servers?" but **around the models**: who owns the articulation of the way you think with AI, you or your provider? Your instructions, your knowledge, your processes form the layer of interactions. This is cognitive sovereignty, and no one hands it back to you once you give it up. BASE keeps it in files you own, independent of the model: keep your AI suite for execution, own the intelligence it executes.

Concretely, BASE helps you avoid four losses of control:

- **sovereignty**: operating without owning;
- **understanding**: delivering without intuition;
- **durability**: deploying without knowing how to maintain;
- **verification**: producing without control.

Verification, precisely, is not a guarantee BASE would hand you: it is a skill you keep, and one the structure makes tenable. A *process* opens only the resources useful to a task (less noise, lower cost, a lighter review); important decisions stay visible (an `[A VALIDER]` marker, a proposal shown before any write); and BASE honestly distinguishes an *instruction* (followed by the model) from a *mechanism* (actually enforced by code).

**What BASE changes, and why: [Why BASE](docs/en/learn/co-penser-avec-lia.md).** BASE is not just a file format: it carries documentation on how to interact with AI, the applied science of human-AI collaboration that makes the difference in real use.

> **Learn by doing?** Build an assistant for a village tourist office in 30 minutes, with nothing installed on the BASE side: [the step-by-step tutorial](docs/en/tutoriel/index.md).

---

## Routing: BASE finds the right process

A misrouted request loads everything, mixes everything, and drowns the decisions that matter under a wall of instructions. BASE avoids this by routing to **your** processes. Three gestures, depending on what you already know:

- **pick an assistant** directly, if you know which one;
- **make one central request**: BASE routes to the right process when several are possible;
- **open directly** the assistant or the sub-files you want to use.

The router can also abstain honestly, with a readable reason, rather than guess. If nothing matches, it points you to a welcome desk instead of leaving you hanging. See [Routing, processes and resources](docs/en/reference/routage-process-et-ressources.md).

## See and tend your work: Studio and the documentation

Day to day, you work in your AI tool, on your files. As your processes accumulate, you will want to **see and edit them at a glance**, rather than dig through sub-folders. Two local interfaces are there for that, as a convenience, never a requirement:

- **BASE Studio** (`npm run studio -- <folder>`, at `http://127.0.0.1:5174`, loopback only): browse and edit your resources with the same propose-then-commit barrier, run an evaluation and read the verdicts, and converse with a co-thinking panel. See [BASE Studio](tools/studio/ui/README.md).
- **The documentation, locally** (`npm run docs:serve`): an interface to browse the whole documentation. You can also ask your AI to run the command for you.

---

## Why BASE exists

This technology does not behave like classic digital software. You do not use it only by clicking buttons or filling in fields. You interact with a system capable of producing linguistic behaviors close to those of a conversation partner: it rephrases, generalizes, infers, proposes, gets things wrong with confidence, and can follow a method if you give it one. The conclusion is not that it thinks like a human. The conclusion is that it calls for a practical **method** of collaboration: knowing when, what and how to verify. That is the purpose of [Why BASE](docs/en/learn/co-penser-avec-lia.md).

A useful image is that of a **colleague from elsewhere, amnesiac**: they have a rich representation of the world, but not of yours. They understand language, spot patterns, are stronger where they were trained most, like code or math, and can help quickly. But they do not have coffee with you every morning: they do not know your clients, your constraints, your habits, your risk threshold, or the history of your files, and every conversation starts from scratch. If nothing is written down, they improvise. If everything is scattered across an interface, things become hard to maintain. Give them structured context, and they can finally work within your reality.

The reflex inherited from the digital world is often to squeeze this collaboration into complex interfaces: hand-configured agents, instructions spread across several screens, scattered permissions, fragile combinations. BASE takes the opposite path: a simple conversational entry point, and the durable structure in readable, versionable, portable files. The goal is not to replace AI platforms, but to make you the owner of the structure that makes them useful. This foundation is also a cornerstone: you can build on top of it, all the way to a solid enterprise platform, without touching the core.

> **The launch context.** BASE was presented publicly on June 25, 2026 (Innovaud × AI Swiss). The framing presentation is available as a context document: [Launching BASE, the presentation](docs/public/2026-06-25-lancement-base.pdf) (in French only).

---

## The Monday-morning scenario

Monday morning. A client asks you for a quote. On a standard AI web platform, you re-explain your business for the umpteenth time, get an approximate answer, then correct, rephrase, correct again, and end up a good while later with something more or less usable.

With files that articulate your know-how, structured ahead of time, you simply say: "New quote for Dupont SA, 3 days of strategy consulting." Your processes already know your prices, your terms, your document template. The matching assistant proposes a complete quote; it can even challenge you, prompt you to validate, push you to iterate. And if, over your exchanges, you build something that works and has the right granularity, you hold a powerful asset.

This structure does not fall from the sky. You **build it as you go**: each time you touch a piece of information, you file it at the right granularity, so it is at hand next time. It is an asset you refine, and that you draw on at any moment. Along the way, you can ask BASE to keep it tidy.

---

## Quick demo and assistants ready to configure

BASE ships a set of examples: ways to structure different lines of work. They are only examples, deliberately so. They show concretely that these structures are simple and intuitive, text files with little rigidity. Above all, for another need, you do not have to rebuild them by hand: ask BASE to articulate something similar for your case, and it proposes an efficient structure, the kind that makes the AI genuinely useful for what you want to do. Copy a folder, open it, and make your request, for example "help me prepare a quote for a new client."

| Example                                                          | What it does for you                                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **[Pre-filled quote demo](exemples/assistant-devis-demo/)**      | Shows a complete quote in under a minute, with fictitious data already in place |
| **[Reflection assistant](exemples/assistant-reflexion/)**        | Structures a decision or a personal question to make the assumptions verifiable |
| **[Quote assistant](exemples/assistant-devis/)**                 | Prepares professional quotes from a client request: prices, VAT, terms, optional export |
| **[Communication assistant](exemples/assistant-communication/)** | Writes your LinkedIn posts and newsletters in your tone of voice                           |
| **[Correspondence assistant](exemples/assistant-courrier/)**     | Writes and answers your client letters and emails, in the right register                   |
| **[HR assistant](exemples/assistant-rh/)**                       | Publishes job offers, prepares interviews, evaluates candidates                            |
| **[Project assistant](exemples/assistant-projet/)**              | Structures, plans and tracks your projects with milestones and progress reviews            |
| **[Meeting assistant](exemples/assistant-reunion/)**             | Turns your notes into structured minutes and tracks decisions and actions                  |
| **[Teaching assistant](exemples/assistant-enseignant/)**         | Prepares teaching sequences and assessments from your curriculum                           |
| **[Personal starter](exemples/starter-perso/)**                  | A personal starting point whose role you define as you use it                              |
| **[Tourist office (Veytaux)](exemples/veytaux-tourisme/)**       | An end-to-end territorial example, the thread of the step-by-step tutorial                 |
| **[SME routing](exemples/routage-pme/)**                         | Demonstrates the Router: similar processes, ambiguities, counter-examples and fixtures |
| **[Multi-client agency](exemples/agence-multi-clients/)**        | A multi-root workspace, one BASE per client                                                |

Each assistant is **ready to configure** and built to keep you in control: it asks you questions about your activity, your services, your rules, proposes, and stops wherever you asked to validate. The level of friction is the one you write into its instructions.

*Need an assistant for another line of work?* Open the BASE folder and say "Read `.ai/agents/createur-agent/AGENT.md`." The assistant creator guides you from A to Z, through conversation. [More ideas →](docs/en/guides/idees-agents.md)

> On the AI-tool side, the technical word for what you call an assistant is "agent" (hence `AGENT.md` and `.ai/agents/`). BASE reuses it pragmatically, so the tools find their footing, without making it the mental model of the work.

---

## What changes versus a standard AI web platform

| On a standard AI web platform                         | With a BASE assistant                                      |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| You re-explain your context in every conversation     | The assistant relies on your up-to-date business files |
| Answers are generic and approximate                   | Answers draw on your processes, on what you expect, on the data you pointed to and the tools you allow |
| Your exchanges stay captive, neither portable nor yours | Your documents live in your folders, readable, versionable, portable from one tool to the next |
| The AI guesses what you want                          | The AI follows your processes, step by step                |

## Why verification matters

On some terrains, a verifier exists outside you: a compiler for code, a proof in mathematics. There, the AI can go far on its own, because the error detects itself. But for most everyday tasks, in most lines of work, the only possible verifier is you. As with that amnesiac colleague from elsewhere, you have to keep interacting: to reframe, to verify, to keep your intuition of what is taking shape. To be part of the process, so the verification debt does not pile up and you stay able to judge, because it is by working with the AI that you build the intuition of what it produces.

Treat every AI answer as a **hypothesis**, more or less solid depending on what you gave it: with clear instructions and information, it often holds faithfully to them; without them, it improvises. Accepting without verifying means accumulating **verification debt**: untested claims that collapse at the first critical look from a client or a partner.

You are the one who sets the level of friction. BASE lets you place **decision points** before writes, sensitive executions and hard-to-undo actions, and encourages you to do so in the right place. To judge where to put them and at what intensity, BASE carries precisely the articulation of this applied science of human-AI interaction. Their mechanical enforcement then depends on the tool and on going through the broker, the CLI, the MCP or a controlled connector; the router picks the workflow, it does not enforce permissions. The **markers** (`[A VALIDER]`, `[DECISION]`) make the state of your work searchable in one second, even months later. And when it helps, you keep a trace of the exchanges, not a complete one but set at the right level: a few big steps, just enough to pick the work back up later. You improve these processes over time, while staying sovereign. This is [human-AI co-thinking](docs/en/learn/pratiques-co-pensee.md): you test what the AI produces before relying on it.

## Tried-and-tested principles for working with AI

Collaborating well with AI is not a new intuition. It rests on long-established ideas about how to articulate communication and cooperation with an entity that is not another self, human or not. Three examples that still hold:

- **compatible terms** to exchange without loss (Shannon, 1948);
- **clear objectives**, without which collaboration fails even when the other side is brilliant (Locke & Latham, 1990);
- **correction loops**, like a meeting that puts things back on track (Wiener, 1948).

BASE puts these principles to work with AI. The detail, principle by principle: [co-thinking in practice](docs/en/learn/pratiques-co-pensee.md).

## Why BASE, and not…?

BASE is not yet another AI product. It is the **layer you own** underneath the tool you use.

| Instead of… | What you gain with BASE |
| ----------- | ----------------------- |
| **A generic chat, raw** | Your context no longer gets re-explained every session: it lives in your files, carried over from one time to the next. |
| **A platform's custom assistant** | You are not a tenant of a platform: your knowledge is articulated in portable, versionable files that work from one AI tool to the next and outlast any single one. |
| **A set of agents to configure** | You maintain neither plumbing nor configuration screens: orchestration stays with the model, and BASE structures the *what* (your texts, your processes, your guardrails) that you own, not machinery to maintain. |
| **One big `CLAUDE.md`** | The router injects only the right process, not everything all the time; and it **separates know-how from knowledge**, instead of a wall of instructions that turns into an unmanageable tangle. |
| **The `SKILL.md` / `AGENTS.md` format alone** | "Agent," "skill": these are just names, the grammar today's big AI providers have settled on. The real point lies elsewhere: a **free, portable articulation** that follows *your* train of thought, where a piece of know-how draws on as many files and texts as you like. You do not bend your thinking to a rigid grammar of one skill per task; you structure just enough to find, articulate, and route your knowledge. That is BASE's method, the applied science of human-AI interaction: everything is said in text files, as your thinking unfolds. And on top, you graft tested routing, validation, mediated writes, evaluation. |
| **Semantic search (RAG) alone** | Access to information is a **tool** for the AI: a model does not run a costly search on its own, it needs an engine, and semantic search serves that (BASE can use it). But it does not replace the articulation of your knowledge or what you expect from the AI. |

Details in [Understanding BASE](docs/en/learn/comprendre.md) and [the public framework](docs/en/reference/framework-public.md).

---

## Who is it for?

| Level | What BASE brings | What remains your responsibility |
| ----- | ---------------- | -------------------------------- |
| **Private / personal life** | Take back control to organize, with AI, your personal projects, documents, paperwork, learning or recurring tasks, from simple files. | Choosing what you entrust to the AI tool, reviewing, deciding, keeping your files up to date. |
| **Start-up** | A solid base for making AI your own: start from your personal processes, surface the ones that serve the team, experiment fast and create new workflows that generate value. | Stabilizing what becomes repeatable, avoiding unverified promises, protecting sensitive data. |
| **SME / team** | Shared workflows, discoverable resources, lightweight validation, regular maintenance and a Personal → Team promotion. | Defining who validates, versioning the files, handling sensitive data. |
| **Large enterprise** | A portable, durable core, around which your requirements graft easily: knowledge, processes, resources, connectors, and compliance. | Adding IAM, SSO, RBAC, audit, retention, DLP, SIEM and regulatory requirements through your enterprise systems. |

> **Not sure where to start?** Do not read a manual: ask BASE. Open the project, then "I am [an individual, an SME, a developer, someone from the public sector, just curious], where do I start?" The welcome desk leads you to the door that matches you.

BASE is turnkey for starting locally, extensible to grow, and a large organization can refine it without changing the underlying abstractions: the same abstractions serve from the complete beginner to the large enterprise. It replaces neither the security policy, IAM, legal archiving, nor the document governance of a large organization.

---

## What it costs

BASE is free and open (code under Apache-2.0, content under CC BY 4.0). What you pay for is the **AI tool that executes it**, and you have a choice:

- **Free and local.** A good part of everyday knowledge work (conversing, drafting, rephrasing, following a framed process) already runs on an **open model on a good laptop**: no subscription, and nothing leaving for a third party.
- **More comfortable with a frontier model** (open or proprietary): the experience is smoother, generally pay-per-use or by subscription.

You do not have to decide alone: to choose a model and a configuration suited to your line of work and your data constraints, **ask BASE to guide you**, or open the documentation (`npm run docs:serve`), which covers these questions of choice and configuration.

---

## Read in the right order

You do not need to understand everything before starting. **Whatever your profile, start with [Why BASE](docs/en/learn/co-penser-avec-lia.md).** This compass gives the first steps; the complete journey per profile lives in [What to read, in what order](docs/en/start/lire-dans-quel-ordre.md), the source of truth.

| If you are... | Start with | Skip at first |
| ------------- | ---------- | ------------- |
| **An individual, freelancer or private user** | `README.md`, `docs/learn/co-penser-avec-lia.md`, `docs/start/quickstart.md` (or `docs/start/essayer-sans-installer.md` if all you have is a browser), then a folder in `exemples/` | `mcp/`, `tools/`, `tests/`, `base.schema.json`, `base.manifest.json` |
| **An SME or small team** | `README.md`, `docs/learn/co-penser-avec-lia.md`, `docs/start/quickstart.md`, `docs/audiences/kit-demarrage-pme-suisse.md` | `docs/reference/specification-v0.md` as long as you are not designing an integration |
| **A large enterprise** | `docs/learn/co-penser-avec-lia.md`, `docs/reference/framework-public.md`, `docs/audiences/kit-enterprise.md`, `docs/reference/etat-implementation.md` | The business examples as proof of use, not as final architecture |
| **A public institution** | `docs/trust/souverainete-et-confiance.md`, `docs/audiences/kit-administration-secteur-public.md`, `docs/trust/securite-et-limites.md` | Browser-only mode for personal or sensitive data |

Simple rule: to try, start from `exemples/`. To adapt, look at `.ai/agents/`. To integrate or audit, look at `tools/`, `mcp/`, `tests/` and the specification.

The `CLAUDE.md` files and `.cursor/rules/` are not the core of BASE: they are adapters so that Claude Code and Cursor find the right assistant automatically. For another tool, **ask BASE how to connect it to your system**. The portable core stays in `.ai/agents/`, the Markdown documents, the schemas and the local commands.

### A note on language

The documentation of BASE exists in French and in English (the French version is authoritative; see [Languages](docs/en/reference/langues.md)); German and Italian are welcome as contributions. And **the assistants you build work in any language**: routing compares the words of a request to those of your own assistants, with no grammar or lexicon of any given language. Build your assistant with French, German, Italian or English keywords, and it routes, and answers, in that language. Sovereignty is linguistic too.

---

## Try it now

Each example is a self-contained folder in `exemples/`. Download it, open it in your AI tool, then make your request, for example "help me prepare a quote for a new client."

| Tool | How to start |
| ---- | ------------ |
| **Cursor** | Open an example folder as a project, then say your request in the chat. `.cursor/rules/` loads the assistant. |
| **Claude Code** | Run `claude` in an example folder, then say your request. `CLAUDE.md` provides the context. |
| **ChatGPT, Claude Desktop and other apps** | Through the [MCP server](mcp/). To install it, open the documentation (`npm run docs:serve`) or simply ask BASE to guide you; it then exposes the local resources you choose to connect. |
| **Codex, Windsurf, Antigravity, GitHub Copilot, OpenCode…** | Load `AGENT.md` as context. Automatic competence discovery depends on the tool. |

Not every platform is compatible, and BASE favors none: choose the one you prefer. [Get BASE (ZIP, clone, example copy) →](docs/en/start/obtenir-base.md) · [Installation guide →](docs/en/start/installer.md) · [Quickstart →](docs/en/start/quickstart.md) · [Step-by-step tutorial →](docs/en/tutoriel/index.md)

**Are you an SME or a small team?** Before sharing an assistant, read the [Swiss SME starter kit](docs/en/audiences/kit-demarrage-pme-suisse.md): allowed data, human validation, simple versioning and monthly maintenance.

**Already have a base structured the BASE way?** Say "Run maintenance on my base." The assistant checks links, open markers, missing descriptions and resources to promote, then waits for your validation before any change.

---

## How it works

Let us take the structure seen above, in detail. An assistant brings together a role file, its know-how and its knowledge kept separate, and your data alongside.

```
AGENT.md                          The role file: who it is, what to do per request
    │
    ├── skills/
    │   ├── processes/            The know-how: how to do X, step by step
    │   └── competences/          The knowledge: what it knows about your line of work
    │
    ├── templates/                The forms: what the documents look like
    │
    └── tools/                    The toolbox: scripts (optional)
```

This skeleton is deliberately minimal: everything else is free. Around it, you place whatever files you want as context (a Word document, a PowerPoint, a spreadsheet, whatever you already work with), as material to draw on in the steps you articulate with the AI. You can even give access to specific tables of a database, provided the matching tool exists (in a company, IT often provides it). BASE structures the steps; the material itself stays yours, in its own formats.

The business data (your activity, your clients, your documents) lives **alongside**, in simple folders. The assistant reads it and proposes to create or update it. Sensitive actions go through a decision point; strict guarantees require a tool or connector that actually mediates the action.

Know-how and knowledge are written in the **SKILL.md** format: a readable Markdown file, increasingly recognized by AI tools. Some harnesses discover them natively, others require pointing the assistant to the relevant files; the format stays portable even when the integration varies. The distinction matters: a list of competences does not say which process to follow or which knowledge to open to execute it well. So BASE routes to a process first; competences, tools, templates and data are then referenced or discovered as context resources.

## Local CLI

BASE includes a lightweight CLI for Personal/SME use and first team checks. These commands are optional for trying an example, but useful for maintaining a reliable BASE.

By default, the CLI detects the nearest BASE root from the current folder (`.ai/` or `base.manifest.json`) and shows it, for example `BASE root: .`. For scripts, CI and ambiguous folders, keep `--root <folder>`. For several explicit roots, use a `base.workspace.json`.

At the repository root (framework maintenance):

```bash
npm install
npm run validate                 # repository structure and links
npm run index                    # (re)generate base.manifest.json (derived projection)
npm run entretien                # maintenance report (open markers, missing descriptions)
node tools/base.mjs route-test --root .   # replay the repository's expected routes
```

On an assistant (here the quote demo; `--root` targets any assistant folder):

```bash
ex=exemples/assistant-devis-demo
node tools/base.mjs discover "devis client" --root $ex
node tools/base.mjs route "Je dois préparer une proposition commerciale pour un prospect" --root $ex
node tools/base.mjs open calculer-devis --projection metadata --root $ex
node tools/base.mjs invoke calculer-devis devis/DEV-2026-001.json --root $ex   # dry-run by default
```

`base invoke` does a dry-run by default: it shows the planned action before any execution. `base propose` shows a diff without writing anything; `base commit` applies after your validation (confirmation by default, configurable per resource). The Router picks an assistant and a process, or abstains with a readable reason; it does not load all the instructions.

> **Data sovereignty.** By default, routing is **100% local** (lexical, zero network). Optional semantic routing can, **if you explicitly enable it**, send text to an embeddings provider, never by default, and you choose what to send (a local Ollama option is available). Details: [Routing data security](docs/en/trust/securite-donnees-routage.md).

For harder corpora, the official `@ai-swiss/base-ranker-semantic` package adds a real-embeddings ranker, without weighing down the core. For very large corpora, `@ai-swiss/base-index-local` provides a derived, deletable index (see `docs/guides/routage-semantique-quickstart.md` and `docs/learn/comprendre-echelle.md`).

## Evaluating an assistant

Evaluation (`base eval`) measures an assistant in real conditions: a simulated user (a model) converses with the process through the real broker, then an independent judge (another model) grades the conversation against the scenario's objectives. The verdict is structured (outcome, failure mode, severity, evidence, suggested fix) and runs locally with Ollama, no key needed. See [tools/eval/README.md](tools/eval/README.md).

```bash
npm run eval -- --root exemples/assistant-devis --agent assistant-devis \
  --process nouveau-devis --scenarios exemples/assistant-devis/.ai/experiments/scenarios/ \
  --ollama --model qwen3.5:9b-q4_K_M --json-mode
npm run studio -- exemples/assistant-devis    # http://127.0.0.1:5174 (Evaluations tab)
```

## Portable across AI tools

| Platform | How it works |
| -------- | ------------ |
| **Cursor** | Open the folder as a project. `.cursor/rules/` loads the assistant according to the project rules. |
| **Claude Code (terminal)** | Run `claude` in the folder. `CLAUDE.md` provides the starting context. |
| **Claude Code (extension)** | Open a chat and point to the path of `AGENT.md`. |
| **ChatGPT, Claude Desktop** | Through the [MCP server](mcp/). To install it, open the documentation (`npm run docs:serve`) or ask BASE to guide you; it then exposes the local resources you choose to connect. |
| **Codex, Windsurf, Antigravity, GitHub Copilot, OpenCode…** | Load `AGENT.md` as context. Automatic competence discovery depends on the tool. |

No mandatory database. Text files, mostly Markdown, that stay readable everywhere. Your assistant is **portable**: switch tools whenever you want, your files remain.

---

## Going further

| What you want | Where to go |
| --- | --- |
| The reason BASE exists | [Why BASE](docs/en/learn/co-penser-avec-lia.md) |
| Learn by doing | [Step-by-step tutorial](docs/en/tutoriel/index.md) |
| The principles of co-thinking | [Co-thinking in practice (16 principles)](docs/en/learn/pratiques-co-pensee.md) |
| Know what to read for your profile | [What to read, in what order](docs/en/start/lire-dans-quel-ordre.md) |
| Trust, security and evidence | [Security and limits](docs/en/trust/securite-et-limites.md) · [Evidence](docs/en/trust/evidence.md) |
| Sovereignty and compliance | [Sovereignty, trust and compliance](docs/en/trust/souverainete-et-confiance.md) |
| Evaluate and tend your assistants | [BASE Studio](tools/studio/ui/README.md) · [Evaluation](tools/eval/README.md) |
| The interactive documentation | [Interactive documentation](docs/en/reference/documentation-interactive.md) |
| Deploy in an organization or administration | [Enterprise kit](docs/en/audiences/kit-enterprise.md) · [Public sector kit](docs/en/audiences/kit-administration-secteur-public.md) |
| The public framework and layers | [BASE public framework](docs/en/reference/framework-public.md) |
| The vision and contribution | [Manifesto](MANIFESTO.en.md) · [Contribute](CONTRIBUTING.md) |

The rest is found by profile in [What to read, in what order](docs/en/start/lire-dans-quel-ordre.md), or by browsing the [documentation](docs/).

### Project structure

Non-exhaustive tree (the full detail is in the [documentation](docs/)):

```
base/
│
├── docs/                              Learn the approach
│   ├── start/                         First steps, installation, quickstart, reading paths
│   ├── learn/                         Concepts, philosophy, principles and scaling up
│   ├── guides/                        Practical guides: routing, providers, distribution, business ideas
│   ├── audiences/                     SME, enterprise, public institution, usage profiles
│   ├── reference/                     Public framework, CLI/docs, compatibility, versioning, languages
│   ├── trust/                         Security, sovereignty, evidence, limits and license
│   ├── public/                        Press, public materials and launch presentation
│   └── en/                            English translation of the documentation
│
├── BASE_BOOTSTRAP.md                   Generic bootstrap for AI harnesses
├── base.schema.json                    Progressive schema of BASE resources
├── LICENSE                             Dual license: code Apache-2.0, content CC BY 4.0
├── SECURITY.md                         Reporting policy and security scope
├── CONTRIBUTING.md                     Adapt and reuse without bloat
├── tools/                             Local CLI, Studio, evaluation, doc generation
├── tests/                             Public-contract and guardrail tests
├── specs/                             Engineering specification (UR/FR/NFR/AD, schemas)
├── packages/                          Optional official packages (semantic ranker, local index)
├── base.manifest.json                  Index generated by `base index`, regenerable
│
├── exemples/                          Self-contained examples (copy and use)
│   ├── assistant-devis-demo/          Pre-filled demo with a quote already generated
│   ├── assistant-devis/               Quote generator for SMEs
│   ├── assistant-communication/       LinkedIn, newsletters, communication writing
│   ├── assistant-courrier/            Client letters and emails: writing and replying
│   ├── assistant-rh/                  Recruitment, job offers, interviews
│   ├── assistant-projet/              Project management
│   ├── assistant-reflexion/           Personal reflection: structure to validate
│   ├── assistant-reunion/             Meeting minutes, tracking decisions and actions
│   ├── assistant-enseignant/          Teaching sequences and assessments
│   ├── starter-perso/                 Personal starting point, refined as you use it
│   ├── veytaux-tourisme/              Village tourist office (the tutorial's thread)
│   ├── routage-pme/                   Deterministic routing: close processes, counter-examples, fixtures
│   └── agence-multi-clients/          Multi-root workspace, one BASE per client
│
├── mcp/                               MCP server (connect to ChatGPT, Claude Desktop, etc.)
├── CLAUDE.md                           Claude Code adapter, not the framework core
├── .cursor/rules/                      Cursor adapter, not the framework core
│
└── .ai/agents/                        The framework
    ├── concierge-base/               BASE welcome and help (the router's fallback target)
    ├── createur-agent/                Build your own assistant through conversation
    │   └── skills/
    │       ├── processes/             /creer-agent, /ameliorer-agent, /diagnostic
    │       └── competences/           architecture, examples, known tools
    └── _template/                     Copy base for new assistants
        └── skills/
            ├── processes/             Workflow templates
            └── competences/           Markers, journal, communication (standard)
```

---

BASE is a framework **created by Charles-Edouard Bardyn** (Chief Scientific Officer, VP and co-founder of [AI Swiss](https://a-i.swiss), an independent Swiss non-profit association) and currently **maintained by a lead maintainer** under AI Swiss stewardship, open to contribution and co-maintenance. [Innovaud](https://innovaud.ch) is a partner of the project and helped seed the business examples for SMEs.

BASE is designed as a **starting seed**: a point of departure that you **fork, adapt and grow** in the direction it traces. It is built to serve as the foundation of a sovereign, portable AI architecture. The dual license (Apache-2.0 for code, CC BY 4.0 for content) gives you full permission to do so: use it to start any number of projects, personal or collective, and keep your files your own.

License: code under Apache-2.0; documentation, agents, skills and examples under CC BY 4.0. See `LICENSE`.
