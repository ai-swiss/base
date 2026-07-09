# BASE

> This is a translation. The [French version](README.md) is authoritative.

> **Who owns the articulation of the way you think with AI, you or your provider?**

**Articulate the way you think with AI, in your own words, in files you own, readable by anyone, usable by AI.**

<sub>BASE = **Build Assistants with Structured Expertise** · *Bâtir des Assistants avec une Structure d'Expertise*</sub>

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](CHANGELOG.md)
[![CI](https://github.com/ai-swiss/base/actions/workflows/ci.yml/badge.svg)](https://github.com/ai-swiss/base/actions/workflows/ci.yml)
[![License: Apache-2.0 + CC BY 4.0](https://img.shields.io/badge/license-Apache--2.0%20%2B%20CC%20BY%204.0-blue.svg)](LICENSING.md)

🇫🇷 [Version française](README.md)

![BASE: take back control over AI. A person works calmly under a transparent dome amid a constant flow of new tools and information. The sovereignty that matters is above all cognitive: articulating your interactions with AI in files you own.](docs/public/assets/base-cognitive-sovereignty.png)

> **In brief.** BASE is a free and open **framework** to articulate your knowledge and your know-how with AI, in text files you own: a small [**open standard we propose**](docs/en/reference/le-standard.md) (the `base.resource.v1` format and its conventions), with its **reference implementation** (command-line tools, a visual interface, a connection to AI applications). **For whom:** first the independents and SMEs structuring their line of work with AI (the AI Swiss and Innovaud workshops are its first community of practice); the same files carry from the curious individual all the way to the enterprise. **What it costs:** BASE itself is free; you need an AI tool to run it (free or paid, see [§4](#4-your-base-in-2-minutes)). **What it does not do:** it does not make AI infallible and it does not replace your security systems; it helps you take back control over the way you think with AI. *The more technical passages are there for those who want them; you can skip them.*

**Getting started, two doors, depending on whether your AI tool reads your files or not:**

- **If it does not read your files** (a simple web chat like ChatGPT): you will be able to try by copying your files into it, but it will be limited: the assistant will not be able to open the other files yours point to, run a calculation, or save anything on your side. [**Talk to BASE by dragging your files in**](#without-a-terminal-the-simplest) → §9.
- **If it reads your files** (the real foundation): [**Your base in 2 minutes**](#4-your-base-in-2-minutes) → §4.

> **What it looks like.** You ask your question in plain language: "Is Dupont SA entitled to the loyalty discount?" The assistant reads *your* files and follows what they describe: it answers by citing the files the information comes from, and leaves you to validate what it must not decide on its own. It is the example of [a base you open in two minutes](#4-your-base-in-2-minutes); the same idea serves for a letter, a class or a municipality.

<sub>Also: [Examples](#3-take-over-an-existing-base) · [Why BASE exists](#5-why-base-exists) · [BASE vs a chat or a platform](#6-base-vs-a-chat-or-a-platform) · [Who it is for](#7-who-it-is-for) · [Install](#9-try-install-connect)</sub>
<br><sub>Built by [AI Swiss](https://a-i.swiss) (a Swiss non-profit association) · free and open (Apache-2.0 + CC BY 4.0, irrevocable licenses) · files you own and can take with you ([governance](GOVERNANCE.md)).</sub>

---

## 1. BASE at a glance

BASE is a **framework**: a way to articulate your knowledge and your know-how with AI, in text files you own. Not a product, not a platform: an [open standard we propose](docs/en/reference/le-standard.md), and its reference implementation. What the standard fixes is not the knowledge an AI consults, but the articulation of the work: which assistant, which process, which data, which verification. Whether you are an individual organizing your thinking or a company structuring its processes, what is at stake is your **everyday interactions with AI**, not just your work. An SME owner or a teacher knows their craft inside out; what is missing is a simple way to put that knowledge in a shape AI can work with. That is what BASE provides.

**What is at stake.** The sovereignty that matters is not material (where the models, the chips, the servers run) but **cognitive**, what we call **cognitive sovereignty**: who structures your interactions with AI, who injects information on your behalf, who nudges you to delegate rather than verify. Its consequence is verifiable: with BASE, you can **open and read yourself** the files that carry your know-how. You take back control, and what you build becomes **essentially independent of the model** that runs it. BASE is not strictly model-independent: one model stays better here than there, more or less elegant to write for, more or less faithful at following instructions over long contexts. But at the level of **procedures**, today's advanced models follow well-expressed instructions in comparable ways; your procedures hold across them, and strong structure upstream lowers the level of model capability needed to follow them reliably. **Tools come and go, the context remains.**

**In concrete terms.** You externalize your knowledge and your know-how into a **base that you own**, organized along two axes:

- **your instructions**, on one side, made up of a **role file** (who the assistant is, what to do depending on the request), its **processes** (the **know-how**: how to do something, step by step) and its **competences** (the **knowledge**: what it knows about your line of work);
- **your data**, on the other side, kept separate from the instructions: the assistant reads it and proposes updates.

These are text files that you open and read like a note: the files on your computer are enough, no other database is required (you can plug one in, on a shared drive for example, but nothing demands it), and no developer expertise is needed.

You hear a lot about agents. Here, agents are nothing more than your **trains of thought**: plain text files that you dictate yourself, as your needs require. The power comes from **two axes of separation**:

- **Axis 1, your instructions kept separate from your data.** This is the security border: a piece of data that is read must not be able to pass itself off as an instruction. This is what makes the work readable, maintainable, and more resistant to injection from an external piece of data (a design principle, see [§5](#5-why-base-exists)).
- **Axis 2, the know-how kept separate from the knowledge,** inside the instructions.

You also hear a lot about the word "skill": here, a skill is nothing more than a piece of knowledge or know-how that you articulate yourself, as your needs require, in a plain text file, with one important distinction: the know-how kept separate from the knowledge. (These two axes are laid down once, cleanly, in [ARCHITECTURE.md](ARCHITECTURE.md); the README is the readable view of it.)

> **An honest limit.** BASE keeps your *files* local; it does not control what the AI tool you plug in then transmits to its provider. "Your files stay local" is not "your data stays local": talking to a remote model sends content outside, to a provider whose jurisdiction (e.g. CLOUD Act) is not necessarily that of your machine. That is where data extraction is to be watched, then, and not at the BASE layer.

### The Monday-morning scenario

Monday morning, a client asks for a quote. On a standard AI web platform, you may re-explain your business yet again; you may carry the mental load of hunting for specific instructions in a menu, of finding a past conversation, of locating an assistant lost somewhere in the interface. The answer can be approximate.

With a base that articulates your know-how, you write as you would to a colleague, in natural language: "I need to prepare a quote for Dupont SA, three days of strategy consulting." The assistant loads your processes, starts following them and works **with you**: it prepares a **draft** and leaves an `[A VALIDER]` marker. Nothing goes out without you. You carefully calibrate the effort to the nature of the task, and in particular to the risk-benefit balance that is yours to set: this is a collaboration you build, not a delegation.

Above all, you are now holding a **base in a coherent format**, which can become your standard and guarantees consistency across all the knowledge and know-how you structure: to have visibility over it, to maintain it, to evaluate it, and, eventually in a large company, to build a whole governance around it. You move from little pieces patched together on the fly to a **solid base** that you own and refine at any moment.

You do not launch the AI to come back the next day when "it is done": you **observe, reframe, iterate**. The AI proposes, you decide; you are the one running the loop, at every exchange.

---

## 2. The framework, building block by building block

BASE produces a **deliberately minimal** starting base that contains only the **key building blocks**, the ones that become decisive as your usage grows.

> **Two registers in BASE.** A *mechanism* is enforced by code when the action goes through BASE: the result is deterministic. An *instruction* is read by the model: useful, but fallible, and the result can vary. Each building block makes clear which one it is. An instruction is never a guarantee.

The building blocks, and why they matter as you grow:

- **Your texts, with a standard of organization.** Everything starts from text files written in your own words, laid out in a readable folder structure. It is this shared standard ([the BASE standard](docs/en/reference/le-standard.md), `base.resource.v1`) that makes your base navigable and consistent, for you as for the AI, from the first notes all the way to a large organization.
- **Metadata that let you activate mechanisms.** Small, simple headers above your files (a few lines) are enough to activate code behaviors: marking a sensitive resource, flagging a process, framing an access. The same file thus speaks to two worlds: the header is read by tested code (the world of mechanisms), the body by the model (the world of instructions). You drive these behaviors through text. → [detail](docs/en/trust/mecanismes-vs-consignes.md)
- **A separation of instructions and data, and of know-how and knowledge.** The two axes laid down in [§1](#1-base-at-a-glance): your instructions on one side, your data on the other (Axis 1, the security border); and, inside the instructions, the know-how kept separate from the knowledge (Axis 2). It is this double separation that makes a base maintainable, auditable, and more resistant to injection from an external piece of data. → [§8](#8-how-it-works)
- **Progressive routing from your intentions to your process files.** Starting from what you ask, the assistant descends step by step, from the root toward the right agent and then the right process, by reading a generated index of your base (`.ai/routing/index.md`). It is a **progressive discovery**, led by the model but guaranteed by a **deterministic floor**: the code (`base route`), with no model, ensures that for a given request you get the same answer, the same route or a reasoned abstention, with inspectable reasons. That floor compares words, it does not interpret meaning: it serves as a reproducible, testable bedrock (`route-tests.json`), while fine-grained understanding stays with the model reading the index. This base routing does not require anything beyond an AI tool able to read your files; an optional semantic mode (by embeddings) remains possible for very large catalogs. → [detail](docs/en/reference/routage-process-et-ressources.md)
- **The Studio: see and edit your objects on a page.** A web page, opened only on your own computer, that lets you **see at a glance** everything you have created, your processes and your resources, centrally, and **edit them directly on a page** rather than hunting for them in your files. `base studio --root <folder>` → [detail](tools/studio/ui/README.md)
- **Evaluation and monitoring: tracking the quality of your processes over time.** As you grow, it becomes important to track the quality of your processes and their evolution over time. You can run a judge-model that tries to execute your processes and records the failures or difficulties. These evaluations do not faithfully reproduce the behavior of your own AI tool (the judge-model differs from the model you actually use), and the judge itself is fallible (to be calibrated); they serve as an alarm of **relative regression** between two versions of your processes, not as an absolute grade, but they deliver enough useful information to monitor quality and surface problems. In an organization, a **monitoring** role can track all the shared processes, with real or fictitious users.
- **An applied science of human-AI interaction, and verification mechanisms.** BASE embeds an interface onto a whole body of documentation about how to work well with AI, and mechanisms to make this interaction more solid, including searchable markers (`[A VALIDER]`, `[DECISION]`). A reminder of the fundamentals: **a language model never verifies, it generates.** Depending on the risk-benefit balance you are aiming for, you equip this verification: a **building block** you own and keep in hand, not an imposed axis. → [§5](#5-why-base-exists)
- **A control over outgoing data (egress), to show governance through metadata.** When a remote call goes **through BASE**, a resource marked `confidential` is held back before the call and then replaced by an explicit notice, never silently dropped: it is a **mechanism**, not an instruction. By default nothing is held back: the holding back triggers on the explicit `confidential` flag or a `local-only` root, not on the mere level of sensitivity. It is neither a firewall nor a DLP around third-party tools. And egress is only one example: this metadata is extensible, and that short block of text at the top of your files can activate as many other governance mechanisms as you design. → [detail](docs/en/trust/frontiere-local-vs-sortant.md)

> **Verifiable in one command (code invariants).** Zero runtime dependencies (`package.json` has no `dependencies` field), the Studio refuses any non-loopback binding at startup, egress is a single pure function shared by all surfaces. `git clone … && npm run check`. Detail and links to the `FR-*` in [§8](#8-how-it-works).

<details>
<summary><strong>Compatibility aspects (a bit more technical): MCP, multi-root workspaces, CLI, Studio confinement</strong></summary>

- **The MCP server (the most important here).** MCP **exposes the same intelligence**, the one you have structured in BASE, to any compatible tool. Where common practice piles many tools into the MCP, BASE makes the opposite choice: it exposes above all the **routing**, the one structured, portable door that matters. And today the vast majority of AI tools accept MCP: you plug in the server and you find the intelligence of your base inside that tool, whether it is a consumer tool or your own enterprise ERP. On the safety side: locally, it exposes the same primitives as the CLI, through the same write path; **read-only by default over HTTP**, and any non-local exposure requires a **bearer token**. → [mcp/](mcp/)
- **Multi-root workspaces.** Several folders loaded side by side in BASE, isolated from one another: you avoid putting everything in the same folder on your computer. A nested root stays isolated.
- **The CLI.** `base <command>` lets you, but above all the AI and your AI tools, do structured things by reading a few simple commands: build, route, audit, evaluate.
- **Studio confinement.** The Studio listens only on `127.0.0.1` (loopback) and refuses any non-local binding at startup, except with the explicit override `BASE_STUDIO_ALLOW_INSECURE_REMOTE` (at your own risk, which does not add authentication), with protection against DNS rebinding. It is this confinement, not authentication, that makes it safe in this setting.
- **Egress control, in practice.** A single pure function decides, shared across all surfaces, so the rule cannot diverge. Outside the path that goes through BASE, you are the egress authority. (Mechanism and default described in the building-block list above.) → [detail](docs/en/trust/frontiere-local-vs-sortant.md)
- **Monitoring, by example.** When a model gets stuck on a process, the incident is surfaced in an interface; the responsible person triages and routes toward the right fixes. For example: "users cannot connect their emails because a connector is missing," which leads to making that connector available.
</details>

> **Light, independent layers.** You take what you need, and nothing more. You can run the documentation UI or the Studio, or not. You can run the MCP server, or not. You can stick to working a little with structured files and a few metadata, or build up the whole machinery toward a solid enterprise structure. On the code-guarantee side (same invariants as above, detail and links to the `FR-*` in [§8](#8-how-it-works)): no runtime `dependencies` field in `package.json` (only build `devDependencies` and optional `peerDependencies`), the core imports only the Node standard library; a single write path for CLI, Studio and MCP; egress is a single shared pure function; everything is checked by `npm run check`.

---

## 3. Take over an existing base

People talk a lot about agents, but an agent does not need to constrain the grammar of our interactions with AI. An agent can simply be a **train of thought** organized in a text file: either a particular procedure, or a certain personality you infuse into the AI. Agents are not things to collect, nor employees to recruit; seeing them that way mainly creates the mental load of finding them again and guessing which one applies to which problem. What matters is the articulation of your thinking, laid down in text files in your own words. The formalism is minimal and owned: a few versioned header lines (the [`base.resource.v1` standard](docs/en/reference/le-standard.md)) when you want to activate mechanisms, nothing as long as you don't; the content itself is written freely, in your own words. The finesse of today's models, able to follow nuanced instructions, is exactly what leaves us this freedom: to articulate as we see fit.

Each of the examples below is a **base that you own**, your knowledge and your know-how articulated in your own words, kept separate from your data. You copy one as a beachhead, you grow it, it stays yours, essentially independent of the model.

| Example | What it helps you do |
| --- | --- |
| [Reflection base](exemples/assistant-reflexion/) | Structure your thinking, your sources and your positions on a topic, so you follow your own train of thought |
| [Personal starter](exemples/starter-perso/) | Start from a base to organize your personal knowledge: notes, projects, tracking |
| [Quote assistant](exemples/assistant-devis/) | Prepare professional quotes: prices, VAT, terms, optional export |
| [HR assistant](exemples/assistant-rh/) | Publish job offers, prepare interviews, evaluate candidates |
| [Communication assistant](exemples/assistant-communication/) | Write LinkedIn posts and newsletters in your tone of voice |
| [Correspondence assistant](exemples/assistant-courrier/) | Write and answer your client letters and emails |
| [Project assistant](exemples/assistant-projet/) | Structure, plan and track your projects with milestones |
| [Teaching assistant](exemples/assistant-enseignant/) | Prepare teaching sequences and assessments |
| [Multi-client agency](exemples/agence-multi-clients/) | Keep a multi-root workspace, one BASE per client |

[See all the examples →](exemples/) · *For another need, simply describe it to BASE: it knows how to build with you a simple structure that makes your interaction with AI durable, by anchoring it in files you own.*

---

## 4. Your base in 2 minutes

See your structured knowledge being put to work by any model you plug in. First, a distinction that changes everything: there are AI tools capable of **reading your local files**, and the others.

Today, the point is to externalize your knowledge and your know-how **by owning it**, available on your computer (or your shared drive, or any file you have access to). For that, the real foundation is an AI tool that can **read and edit local files you own**. A browser is not the simplest path: it is a way in, to test and understand the structure, but with immediate limits.

First, get the `exemples/assistant-devis-demo/` example folder, by cloning the repository or with the green **Code** button → **Download ZIP** (on Windows, "Extract All"; double-clicking the ZIP is not enough). Then, depending on your tool:

**(a) With an AI tool that reads your files (the real foundation).** Open that folder (**not** the repository root) in the tool, then ask the question, word for word: **"Is Dupont SA entitled to the loyalty discount?"**

**(b) With a simple web chat (to test).** Drag the files from `catalogue/` and `clients/` into the chat (or attach `regles-tarification.md` and `dupont-sa.md`), then ask the same question. You will quickly see the limits: you have to **upload** the files, with no continuous synchronization with your local files, and you are injecting whole files onto a platform. It is good for understanding; but the basic condition to be truly free in your interactions is to be able, at the very least, to read and edit text files you own. → [Try with nothing installed](docs/en/start/essayer-sans-installer.md)

> **Honesty about the demo.** This example folder routes **directly to a single agent** (its `CLAUDE.md` points to the quote agent): it does not ship a routing index. To see **progressive routing** itself, run `base route "<request>" --root exemples/assistant-devis-demo` (which regenerates the index `.ai/routing/index.md` and shows the route). The demo therefore does not claim to embed an index it does not contain.

**What you should observe.** An assistant that follows the instruction **typically answers no** (the loyalty discount requires two mandates, and `dupont-sa.md` says "Client (1st mandate)"), cites `dupont-sa.md` and `regles-tarification.md`, leaves an `[A VALIDER]` marker, and changes nothing on your behalf.

> **Switch the model, observe.** The same base, repointed to another model, redoes the task: your know-how does not depend on the model of the moment. Repoint and observe the difference for yourself.

> **The verification mechanisms are visible.** The assistant cites its sources and leaves `[A VALIDER]`: these are markers that you see go by. They are also *instructions* that depend on the instructions you have given, and over which you remain sovereign and free: you can require them on any tool. If your model does not cite, that is living proof it is an instruction: open both files yourself (they are in the ZIP, or ask the AI to show them to you) and see the "1st mandate."

> **Tools.** Any AI tool that can read and edit your files works, e.g. Claude Code, Cursor, Antigravity, GitHub Copilot or OpenCode; BASE favors none of them.
> **Using a different AI tool?** BASE depends on no particular tool: most editors already read the instruction file BASE generates (`AGENTS.md`) and work as is. For a tool with a different format, the link to add is short (tell the tool "read this base and follow it"): ask BASE to help you write it, or add that small adapter by hand, following the examples.

> **Cost.** **BASE itself is free; you need an AI tool to run it, free or paid.** Many everyday uses are already possible with a free option, all the more so since strong structure upstream lowers the model capacity needed; a paid option (pay-per-use or by subscription) stays more comfortable for the hardest reasoning. On the BASE side, no network egress in the base routing; what goes out afterward depends on the AI tool you choose. Nothing to pay per seat, no subscription imposed by BASE: the recurring cost stays that of the AI tool you choose, and it is yours to negotiate.

*Reminder: the repository root is the framework. For actual use, open an example folder.*

---

## 5. Why BASE exists

> **Who owns the articulation of the way you think with AI, you or your provider?**

BASE is neither one more AI product (ChatGPT, Copilot, Claude Code…), nor a discourse of concepts (critical thinking, transparency). It is a **third way**: learning, in a **scientific and sovereign** manner, to lead your interaction with AI and to build a base that is yours. BASE does not just provide tooling: it **ships the documentation** of this applied science of human-AI interaction.

Working with AI exposes you to many **potential losses of control**: over sovereignty, over understanding, over time, over verification. The sections below take up the main ones.

### Cognitive sovereignty, not just material

The sovereignty that matters is not decided in your servers alone, but in these questions:

> **Who structures my interactions with AI? Who injects information on my behalf? Who nudges me to delegate rather than verify? Where is my cognitive sovereignty?**

BASE answers with three anchors: (a) you articulate your interactions, in your own words, in files you own, readable by anyone, usable by AI; (b) it is you who injects your knowledge and your know-how, not a third party on your behalf: what is put into the context comes from *your* information bases, not from commands or instructions slipped in without your knowledge; (c) your know-how becomes **essentially independent of the model** that runs it, you switch models without starting over.

> **Honest bounding (no sovereign-washing).** Locality says *where* a model runs, not its origin or its jurisdiction: the CLOUD Act exists, and a model running locally is not necessarily a Swiss model. What goes out depends on your configuration and your contract. BASE keeps the expertise layer sovereign; the choice of model stays yours, to be verified. → [Sovereignty and trust](docs/en/trust/souverainete-et-confiance.md)

### The shift of value

Models improve, far more slowly than the quantity of tools that draw on them explodes across society, but they do improve. And as they progress, what we expect of them is that they follow the instructions we give them **ever more finely**, and that they become ever more effective in collaborating with us: acting as if they shared enough of our view of the world to be talking about the same thing; drawing out, in the exchange itself, the clarifications and back-and-forth needed to align. In other words, we expect models to become **experts of human-AI interaction**, set on the fundamentals of any interaction between different entities, human or not, according to the risk-benefit balance we want (if there were no risk at all, we could delegate everything, but that is not the goal here).

That is why value shifts. In most of today's discourse, it hinges on the model or the product of the moment; with BASE, it hinges on the **articulation of your know-how**, in a base that you own. Two assets compound: your **context** and your **tools**. The risk is to bind everything into a box you do not own; BASE keeps the context layer (and the routing, and the index) yours and **separable from the model**, so that a change of provider becomes a **matter of configuration, not a migration** (depending on the task, re-tuning may take a little work, but you do not rewrite the base). Tools come and go, the context remains.

### Why it is durable, and not a stopgap

This need does not depend on model power. A more powerful core generates better and reasons better, but it still does not guess your context nor verify itself: that is why structure is **durable**, not a stopgap while we wait for better models. Whatever the architecture to come, two things do not change: a model does not know your context by default, and its generative core does not verify itself. However powerful it is, a model cannot guess information it never received: as long as your reality is recorded nowhere (your context, your files), it stays invisible to it.

### Co-thinking with AI

AI **does not behave like classic digital software**. The most workable mental shortcut is perhaps a **colleague from elsewhere**, a little amnesiac, who has a rich representation of the world but not of yours; who never shares a coffee with you and does not know your full context. The generative core starts **every conversation** with an empty context window. The key is not a setting you do once: it is to **structure information so it is available at the right granularity, at the right moment**, across all your interactions with AI. For example, from the rawest to the most refined:

- the **raw transcripts** of your meetings and your exchanges;
- the **notes** you derive from them;
- the **project articulations** you build on top.

BASE makes this gesture fast and reliable by keeping this memory in your files, ready to be re-supplied, and targeted by routing. Two distinct constraints impose this: the generative core is **stateless** (each call restarts empty, nothing is carried over from one call to the next), *and* its context window is of **finite size**. The first requires re-supplying the context; the second requires **targeting** it, hence the point of putting back the **right** information, not all the information.

This method rests on tried-and-tested principles: a channel reliably conveys only what its capacity and a **shared code** allow (Shannon, 1948), hence the point of **compatible terms**; **clear objectives**, without which collaboration fails even when the other side is brilliant (by analogy with goal-setting theory, Locke & Latham); **correction loops**, like a meeting that puts things back on track (Wiener, 1948). The bottleneck of human-AI collaboration is **shared understanding**, not power. → [Co-thinking with AI](docs/en/learn/co-penser-avec-lia.md) · [Co-thinking in practice, 16 principles](docs/en/learn/pratiques-co-pensee.md)

### Verification, a non-optional building block

The generative core generates, but it **never verifies**; and since generating now costs almost nothing, it is verification that carries the value. A large share of uses fail for lack of true verification engineering. Treat every answer as a **hypothesis**: verification falls to you. For most everyday work, the only verifier is you, except on formal terrains where an automatic external verification is possible, such as code or math (a compiler, a proof). The reliability of an output is a property of the workflow that produced it, not of the model alone. The good news is not only that strong structure upstream lightens verification downstream: it is also that **the structure can include verification itself**, in the form of iteration, review, re-anchoring in reliable data. BASE provides this engineering with elements you own (markers, write gate, evaluation), enough to make the output reliable to deliver, without thereby guaranteeing that an answer is true.

> **What you truly own.** Markdown files, with no proprietary format and no captive dependency: versionable, readable by humans and by AI, freely reusable. What you do not own: the model, its jurisdiction, and what goes out once in conversation.

<details>
<summary><strong>A note of honesty: what BASE is not</strong></summary>

BASE does not make AI infallible. It replaces neither IAM/SSO (identity management and single sign-on), nor RBAC (role-based access), nor DLP/SIEM (leak prevention and monitoring), nor legal archiving, nor nFADP/GDPR compliance, and ticking a regulatory box is not the same as being compliant. It plugs in **upstream** of those systems, without changing their core. Resistance to injection follows from the separation of instructions/data ([§1](#1-base-at-a-glance)); it is a design principle, not a mechanism. An external security review is planned, not yet done. Threat model: [Security and limits](docs/en/trust/securite-et-limites.md).
</details>

---

## 6. BASE vs a chat or a platform

The real alternative is not "one product rather than another": it is *consuming an AI product* or *reciting concepts* on one side, *learning to lead the interaction and owning your base* on the other. BASE does not replace platforms; it makes you the owner of the layer that makes them useful.

| | A generic chat | An AI platform | With BASE |
| --- | --- | --- | --- |
| Ownership | captive exchanges | tenant | your files |
| Model independence, compounding | no | sometimes (choice of model) | yes: you switch models without rewriting your base |
| Structuring the interaction | partly, with no transparency on what is injected | partly, with no transparency on what is injected | yes, and you see what is injected |
| Maintenance | redone every time | screens to tend | versionable text files |
| Verification (the core never verifies) | possible, on you | possible, on you | yes, with extra mechanisms *and* the documentation of the applied science |
| Exit cost, reversibility | all lost | high | free copy, at any time |
| What it asks of you | nothing, but everything is redone | learning the tool | a bit of structure, and a tool that reads your files |

"Verification engineering," not "truth": BASE makes verification *tenable*, it does not guarantee that an answer is true. You can verify in a chat or elsewhere; BASE adds mechanisms to it and, above all, the documentation that tells you *what* to put into the human-AI interaction according to your level of risk-benefit.

| Instead of… | What you gain with BASE |
| --- | --- |
| **One big `CLAUDE.md`** | Rather than a single wall where everything is injected in one block, a **progressive routing**: the assistant descends a generated index of your base (`.ai/routing/index.md`) toward the right process, separates know-how / knowledge *and* keeps your data distinct from the instructions, instead of a wall where instructions and data mix (and where injection thrives). |
| **The `SKILL.md` / `AGENTS.md` format alone** | "Agent," "skill": these are just names, and these open formats are shared ground that BASE reads and writes (a BASE's `CLAUDE.md`, `AGENTS.md` and Cursor rules are generated adapters from the source you own). The [BASE standard](docs/en/reference/le-standard.md) adds what they leave aside: deterministic routing of a whole agent and process, the double separation of instructions / data and know-how / knowledge, mediated writes; a piece of know-how draws on as many files as you like. |
| **A set of agents to configure** | You maintain neither plumbing nor screens: orchestration stays with the model, and BASE structures the *what* (your texts, your processes, your guardrails) that you own. |
| **Semantic search (RAG) alone** | Semantic search is a mathematical match: it finds nearby passages, but without always the finesse to carry *your* intentions. Better to supply it the relevant information up front, or let a model dig, often at the cost of wasted resources. The choice of what matters must stay yours. |

---

## 7. Who it is for

Anyone who interacts with AI, from the curious individual to the enterprise. The same abstractions serve everywhere: turnkey to start, extensible to grow.

Concretely, it is the same file that climbs the ladder. The `AGENT.md` that organizes your personal notes can become, without changing format, the one a team shares and then an organization governs: you add header lines as the need arises (a sensitivity that activates egress control, routing signals, an evaluation that tracks quality), and nothing has to be migrated.

| Profile | What BASE brings | What remains your responsibility |
| --- | --- | --- |
| **Individual / curious / student** | A structure to work with AI and follow your own train of thought: organize what you know as your needs arise, freely but structured enough to grow your base. | Choosing what you entrust to the tool, reviewing, deciding, keeping your base up to date. |
| **Professional / freelancer** | A base for your line of work, from your rules and data, kept whatever the tool. | Reviewing, deciding, keeping your files up to date. |
| **Executive** | Sovereignty and durability: you compound the collective know-how, and switching models becomes a simple setting, not a migration (see [§6](#6-base-vs-a-chat-or-a-platform)). | Access governance, compliance, and the choice of model / provider. |
| **Security / compliance / public sector** | Auditable core, tested mechanisms, local routing by default. BASE plugs in **upstream** of your systems (IAM/SSO/RBAC/DLP/SIEM), it does not replace them; bounded egress on its own surfaces. | IAM/SSO/RBAC/DLP/SIEM via your systems. The impact assessment (DPIA) remains your responsibility: processing personal data via a remote model is a transfer to be assessed. Read [Security and limits](docs/en/trust/securite-et-limites.md) and [The local / outbound border](docs/en/trust/frontiere-local-vs-sortant.md). |
| **Developer / contributor** | Core with no runtime dependency, everything tested and specified. | See the dedicated block in [§8](#8-how-it-works). |
| **Skeptic / journalist** | Open the files, check the claims; instruction vs mechanism owned up to. | No prior trust required. → [Evidence](docs/en/trust/evidence.md) (claim → mechanism/test → limit). |

### Risk, continuity, exit (for the decision-maker)

- **Model independence = risk control:** your know-how survives any change of model; a change of provider is a matter of configuration, not a migration. The danger is not "using a provider," it is binding your context *and* your tooling in a box you can neither copy nor grow. BASE keeps the context layer and the routing yours and separable.
- **Lock-in:** files that you own, portable from one tool to the next, that you can copy and grow freely at any moment.
- **Continuity:** BASE is designed to be **easy to take over**. Irrevocable licenses (Apache-2.0 / CC BY 4.0) and a core with no external dependency make it resumable by anyone: `git clone + npm ci + npm run check` (zero runtime dependencies) is enough to get it running end to end, with everything tested and specified. Governance and its continuity guarantees are detailed in [GOVERNANCE](GOVERNANCE.md).
- **Stewardship:** AI Swiss, a non-profit association, neutral toward models; no exclusive vendor tie.

To defend the choice of BASE before an IT department or compliance: [Sovereignty, trust and compliance](docs/en/trust/souverainete-et-confiance.md).

---

## 8. How it works

### The structure, in detail

An assistant brings together, **on one side**, its instructions (role file + know-how + knowledge, kept separate), and **on the other**, your data, kept as separate as possible, because a piece of data that is read must not be able to pass itself off as an instruction (see the border invariant in [ARCHITECTURE.md](ARCHITECTURE.md)).

```
INSTRUCTIONS (what you write)                 DATA (separate)
AGENT.md             The role file            data/        Your business files
  └── skills/                                 sources/     Your reference sources
        ├── processes/   The know-how ┐
        │                  (know-how ⟂ knowledge, Axis 2)
        └── competences/ The knowledge ┘      (read by the assistant,
  templates/          The forms (opt.)         updated via propose→commit)
  tools/              Scripts (opt.)

  Axis 1 (security border):  data ──read──▶ never executed as instructions
```

These two separations are the two minimal axes that suffice: one separates what is true of your world (knowledge, data) from how to act on it (know-how, instructions); the other separates what **you** assert (instructions) from what is read and could be adversarial (data). That is why the skeleton is minimal without missing anything. Everything else is optional and extensible: templates, scripts, or any file an AI can use, added to fit your own structure; the essential is to frame the know-how and the knowledge, the rest is yours. The know-how and the knowledge are written in the **SKILL.md** format, a readable Markdown: some tools discover it natively, others ask you to point to the files; the integration varies, the format stays yours.

### Routing, in detail

Three gestures, from the most guided to the most direct, depending on what you already know: **formulate your request** and let BASE route it to the right process; **choose the assistant yourself** when you know which one; **open directly the file** you want when you know where to go. By default, routing is **progressive**: the assistant reads a generated index of your base (`.ai/routing/index.md`) and descends step by step, from the root toward the agent and then the process. A **deterministic floor**, the code alone with no model (`base route` / `route_request`), confirms and serves as fallback: for a given request, the same route, *or* a reasoned abstention. Honest abstention holds when this BASE floor is called (deterministic), not when the model guesses on its own (instruction). An optional semantic mode (embeddings, opt-in) remains possible for very large catalogs. A process opens only the resources useful to a task: targeted context rather than exhaustive, so more useful information per token in a bounded window.

You do not need to reconfigure anything as your base grows. BASE directs each request toward whatever your folder contains, as is: if there is only a "quote" assistant, everything goes to it; add a "support" assistant, and BASE takes both into account, without you changing anything. Conversely, limiting BASE to a part of your work simply means putting only that part in a folder.

### Evaluating and observing your base

When you want to (nothing runs automatically), you can **evaluate your processes**, and not just the output of a model: a judge-model (fallible, to be calibrated) flags **relative regressions** between two versions of your processes, useful as an alarm, not as an absolute grade. You launch it on demand, from the Studio or via `npm run eval` (locally, on Ollama by default). This is what makes an owned base **maintainable** over time, and not a mere heap of files. → [detail](docs/en/learn/cycle-de-vie-expertise.md)

### For the contributor

Actively maintained by a lead maintainer under AI Swiss stewardship, and designed to be easily taken over: irrevocable licenses, core with no dependency, everything tested and specified. Continuity is detailed in [GOVERNANCE](GOVERNANCE.md).

```bash
git clone https://github.com/ai-swiss/base.git && cd base && npm ci && npm run check
```

`npm ci` first (duration varies with the network), then `npm run check` (typically 1 to 2 minutes); the invariants are *gate-enforced*, not aspirational (`npm run check` checks spec, typecheck, validate, route-test, doc hygiene, the full suite, the coverage ratchet). To change a behavior, find its `FR-*` in `specs/current/10_core/` (the map is [ARCHITECTURE.md](ARCHITECTURE.md)), read the test, change code + spec + test together. Where to start: [CONTRIBUTING](CONTRIBUTING.md). Whether you work with or without AI, the approach is the same.

<details>
<summary><strong>Linguistic sovereignty, and the three planes</strong></summary>

**Language.** The assistants work in any language: progressive routing, led by the model, descends your index whatever the language of the request, with no per-language grammar. Sovereignty is linguistic too. (For whoever writes the routing signals: [Writing for the router](docs/en/guides/ecrire-pour-le-routeur.md) says how to serve several languages.)

**Three planes** so a current state is never confused with a plan: truth = specs + code; change = decisions + CHANGELOG; draft = `.plans` + `.reviews`. Detail in [ARCHITECTURE.md](ARCHITECTURE.md).
</details>

---

## 9. Try, install, connect

### Without a terminal (the simplest)

**Talk to it.** Download the folder (green **Code** button → **Download ZIP**; on Windows, "Extract All," double-clicking is not enough), open it in an AI tool that reads your local files *or* attach the files in a web chat. Ask "explain BASE to me," "help me start a base for my line of work" or "where do I contribute?," and let the AI lead the setup with you.

→ [Try with nothing installed](docs/en/start/essayer-sans-installer.md) · [Have your AI install it](docs/en/start/installer-par-votre-ia.md) · [Getting BASE](docs/en/start/obtenir-base.md) · [Quickstart](docs/en/start/quickstart.md) · [Install a workspace](docs/en/start/installer.md)

What to read, in what order, for your profile: [What to read in what order](docs/en/start/lire-dans-quel-ordre.md), the source of truth for the reading paths.

*The repository root is the framework itself. For actual use, open a folder under `exemples/`, or run `base init` on your own folder.*

<details>
<summary><strong>The command-line alternative</strong> (optional, for the technically comfortable)</summary>

```bash
base studio --root <folder>       # the graphical workshop, loopback http://127.0.0.1:5174
npm run docs:serve                # the documentation, locally
base route "<request>"            # route a request (deterministic floor, local)
base validate                     # check structure and links
npm run eval                      # evaluate your processes (local, Ollama by default)
```

Connect the MCP server to an AI tool: [mcp/](mcp/). Contributor quickstart: `git clone … && npm ci && npm run check`.

*Reminder: the root is the framework; for actual use, open an example.*
</details>

---

## 10. Going further

**Learn** (BASE ships the documentation of the applied science of human-AI interaction): [What to read in what order](docs/en/start/lire-dans-quel-ordre.md) (your path for your profile) · [Step-by-step tutorial](docs/en/tutoriel/index.md) (a tourist office, from A to Z) · [Co-thinking with AI](docs/en/learn/co-penser-avec-lia.md) · [Co-thinking in practice, 16 principles](docs/en/learn/pratiques-co-pensee.md) · [Adoption in an organization](docs/en/learn/adoption-organisation.md) · [The lifecycle of an expertise](docs/en/learn/cycle-de-vie-expertise.md) · [Routing, processes and resources](docs/en/reference/routage-process-et-ressources.md)
<br><sub>Along the way, you build your <strong>AI literacy</strong> by practicing it: co-thinking, verification reflexes, the instruction / mechanism distinction. It is an intended effect, not a side effect.</sub>

**Contribute:** [CONTRIBUTING](CONTRIBUTING.md) (where to start) · [DEVELOPING](DEVELOPING.md) (the forge, the single command) · [ARCHITECTURE](ARCHITECTURE.md) (the map of the code) · [specs/](specs/README.md) (the contract, the `FR-*`)

**Trust and security:** [Evidence](docs/en/trust/evidence.md) (claims → tests → limits) · [Security and limits](docs/en/trust/securite-et-limites.md) (threat model, external review to come) · [The local / outbound border](docs/en/trust/frontiere-local-vs-sortant.md) · [Sovereignty and trust](docs/en/trust/souverainete-et-confiance.md) (defending the choice before an IT department)

**Report, discuss, ask for help:** [issues](https://github.com/ai-swiss/base/issues/new/choose) (templates provided) · [Discussions](https://github.com/ai-swiss/base/discussions) for open questions · vulnerabilities privately via [SECURITY](SECURITY.md)

**Governance and durability:** [GOVERNANCE](GOVERNANCE.md) (continuity, co-maintenance)

**Context:** [Launching BASE](docs/public/2026-06-25-lancement-base.pdf), context document (Innovaud × AI Swiss, 25.06.2026, in French).

---

## License and attribution

Code under **Apache-2.0**; documentation, agents, skills and examples under **CC BY 4.0** (dual license detailed in [LICENSING.md](LICENSING.md), full texts in [LICENSES/](LICENSES/)). See [GOVERNANCE](GOVERNANCE.md) · [Code of conduct](CODE_OF_CONDUCT.md) · [CONTRIBUTING](CONTRIBUTING.md).

Created by **Charles-Edouard Bardyn** at AI Swiss (a non-profit association, model-neutral stewardship). Innovaud is a partner in articulating the enterprise use-case examples.

BASE is a **primer** you copy, adapt, and grow; the dual license fully allows it. You build on top, all the way to an enterprise platform, without touching the core.
