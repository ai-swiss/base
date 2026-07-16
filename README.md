<!-- fr-synced: 9d3a20733690bddaa79a07b03c6a4d67bff3bfbf -->

# BASE

**English** · [Français](README.fr.md)

> **Does your way of working with AI still belong to you when you switch tools?**

As you work with AI, you develop a method: how to frame a problem, what to give it to read, which corrections to make, what the AI can do and what remains to be decided. Part of it sometimes already lives in your files. The rest is scattered across settings, tool-specific instructions and past conversations. BASE gives your method a consistent structure, in text files you can read, correct and pass on.

**Already using an assistant built into your working environment, a coding agent or a platform that coordinates several agents?** BASE does not replace them. These tools handle execution; BASE describes the method they apply, in open, readable files that belong to you. You can then switch tools without rebuilding your method.

Some tools already record your instructions in files you can open and edit. BASE takes this principle and extends it to the whole organization of the work. The standard defines the role of each file, for example a procedure to follow, a piece of knowledge to consult or a piece of data to process, and specifies how they connect. You phrase your request in plain language; this structure helps the tool find the relevant procedure. BASE distinguishes instructions, useful but fallible, from the software mechanisms that enforce a rule independently of the model. Around this common core, it generates the compatibility files that different tools expect. Your method stays at the center; the adapter changes with the tool.

<sub>BASE = **Build Assistants with Structured Expertise** · *Bâtir des Assistants avec une Structure d'Expertise*</sub>

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](CHANGELOG.md)
[![CI](https://github.com/ai-swiss/base/actions/workflows/ci.yml/badge.svg)](https://github.com/ai-swiss/base/actions/workflows/ci.yml)
[![License: Apache-2.0 + CC BY 4.0](https://img.shields.io/badge/license-Apache--2.0%20%2B%20CC%20BY%204.0-blue.svg)](LICENSING.md)

![BASE: take back control over AI. A person works calmly under a transparent dome amid a constant flow of new tools and information. The sovereignty that matters is above all cognitive: articulating your interactions with AI in files you own.](docs/public/assets/base-cognitive-sovereignty.png)

**Understand it in one minute.** If your AI tool can read a GitHub page, give it the address of this repository and ask how BASE can structure the way you work with AI. Otherwise, go straight to the demonstration. The documentation is designed to be readable by a human as well as by a model.

**Where to start:**
- **See it concretely.** → [Get started](#2-get-started)
- **Understand the idea.** → [The idea, one Monday morning](#1-the-idea-one-monday-morning), then [Why it matters](#4-why-it-matters)
- **Decide, review the security, or contribute.** → [Who it is for](#6-who-it-is-for) · [The building blocks](#7-the-building-blocks-as-you-need-them) · [Contribute](#for-the-contributor)

<sub>Stewarded by [AI Swiss](https://a-i.swiss) (a Swiss non-profit association) · free and open (Apache-2.0 + CC BY 4.0) · built on open files you can keep, copy and adapt ([governance](GOVERNANCE.md)).</sub>

---

## 1. The idea, one Monday morning

BASE offers an [open standard](docs/reference/le-standard.md), together with a reference implementation, to describe your working method in files you control. The structure can stay simple or grow more detailed as the need arises.

Knowing your trade is usually not the difficulty. You can explain how to prepare an offer, which rules must always be respected and where a person must decide. The work consists of putting this know-how into a form you can reread and a model can use. With BASE, you build that shape directly in natural language, rather than scattering it across menus, settings and conversations tied to a particular tool.

Monday morning, a client asks for a quote. You may already have configured an assistant, kept a good conversation or written a few rules. Still, you have to find these elements again and know which of them are authoritative.

Once this know-how is structured with BASE, you simply ask: "I have a quote to prepare for Dupont SA, three days of strategy consulting." The procedure, called a *process* in BASE, tells the assistant which files to consult, which rules to apply and which points require your validation. It asks the assistant to prepare a draft, to cite its sources and to flag the points that call for your decision with `[A VALIDER]`. The method stays in your files: you can reread it, correct it and reuse it.

As the work goes on, you can observe and reframe the method, then fold the useful corrections into your files rather than let them disappear with the conversation.

---

## 2. Get started

Choose the door that matches your situation.

**Door 0: understand it in one question.** If your AI tool can read a web page, give it the address of the repository and ask: "Concretely, what does BASE do and how can it structure the way I work with AI?" Do you want to evaluate BASE for your organization? Ask for an analysis from the point of view of an executive or a compliance officer, then read [Sovereignty, trust and compliance](docs/trust/souverainete-et-confiance.md). Do you want to see the code? Start with [ARCHITECTURE.md](ARCHITECTURE.md), which presents the architecture, the main abstractions and their limits.

**Door 1: see it without installing.** The goal: to see how a BASE assistant is made, and how it behaves. In a web chat such as ChatGPT or Claude, download the [quote assistant pack](https://github.com/ai-swiss/base/releases/latest/download/assistant-devis-demo.pack.md). This single text file, in Markdown format, gathers its role, its procedures and its conventions: browse it to observe the structure. Then attach it to a new conversation and ask: "What must you have me validate before creating or modifying a quote?" Check that the answer distinguishes what the assistant can prepare from what you must decide. To test the loyalty discount itself, which cross-references two sources absent from the pack (a pricing rule and a client record), move on to Door 2.

**Door 2: work with your own files.** Use an AI tool that can open a folder on your computer, for example Claude Code, Codex, Cursor, GitHub Copilot or OpenCode. BASE favors none of them. Download the example and open `exemples/assistant-devis-demo/`, not the repository root. First ask the tool to read the instructions, then to show you the folder structure and the role of the main files. Then ask the question: "Is Dupont SA entitled to the loyalty discount?" The expected answer is "no": the discount requires two mandates, whereas the record indicates "1st mandate." Check that the assistant cites both sources and that the `[A VALIDER]` marker appears.

**You do not have to write this structure on your own.** BASE is designed so that you articulate your method in conversation, without having to know the format. Your AI tool follows a procedure that asks the useful questions, proposes a structure and submits the changes to you before writing them. The decision stays with you.

**Create your folder in the BASE format.** For the quote example, copy `exemples/assistant-devis/`, a complete template to personalize, then say: "Configure my business." The procedure asks you one question at a time and fills in, with your agreement, the company identity, the commercial terms, the catalog and the pricing rules.

To start from another folder, the command-line interface (CLI) and Studio offer the same starting structure. `base init` first shows the files it plans to create; `base init --yes` creates them with your agreement. `base studio --root <folder>` installs the interface dependencies on first launch and opens BASE Studio, the graphical workshop, in your browser. If the folder is not yet structured by BASE, the welcome screen shows the exact content of the proposed files before they are created. Browsing and editing the files requires no model configuration; the chat and the evaluations require you to choose a provider in the settings. → [Install](docs/start/installer.md) · [Studio](tools/studio/ui/README.md)

> **Cost.** BASE is free. The AI tool and the model you choose can be free or paid; their costs and their limits depend on the services you select.

> **Limit of the controls.** BASE's controls apply only to the actions that go through its components. A tool with direct access to the files, the terminal or an API can bypass them. BASE replaces neither access management, nor a data-leak prevention system (DLP), nor your compliance obligations.

---

## 3. Start from an example

You can start from an example or from work you already do. Describe to your AI tool what you want to accomplish, the documents available and the decisions that must rest with you. First discuss with it how the work should unfold. It can then translate that exchange into the BASE format, show you the proposed files and help you refine them. You do not need to know the standard to begin.

In the resulting folder, an agent defines a role and serves as the entry point. The processes describe the way of working; the competences gather the necessary knowledge; the sources provide the reference information. The metadata of the [`base.resource.v1` standard](docs/reference/le-standard.md) then let the code recognize these roles and activate, as you need them, the routing, the validations or access rules.

The examples below organize know-how, knowledge and data in open, distinct files. You can copy them and adapt them freely to your needs.

| Example | What it helps you do |
| --- | --- |
| [Reflection assistant](exemples/assistant-reflexion/) | Structure your thinking, your sources and your positions on a topic, so you follow your own train of thought |
| [Personal starter](exemples/starter-perso/) | Start from a folder structured by BASE to organize your personal knowledge: notes, projects, tracking |
| [Quote assistant](exemples/assistant-devis/) | Prepare professional quotes: prices, VAT, terms, optional export |
| [HR assistant](exemples/assistant-rh/) | Publish job offers, prepare interviews, evaluate candidates |
| [Communication assistant](exemples/assistant-communication/) | Write LinkedIn posts and newsletters in your tone of voice |
| [Correspondence assistant](exemples/assistant-courrier/) | Write and handle your client letters and emails |
| [Project assistant](exemples/assistant-projet/) | Structure, plan and track your projects with milestones |
| [Teaching assistant](exemples/assistant-enseignant/) | Prepare teaching sequences and assessments |
| [Multi-client agency](exemples/agence-multi-clients/) | Keep a multi-folder workspace, with one folder structured by BASE for each client |

[See all the examples →](exemples/) · *For another need, simply say: "Here is what I would like to do with AI. Help me clarify the work, then structure it with BASE." You can then discuss the proposed files and refine them.*

---

## 4. Why it matters

> "When AI can have real consequences, transparency is the condition of responsibility. An organization should be able to see and to show, in plain language and in a single place, how it has articulated its work with AI."
> <br>*Charles-Edouard Bardyn*

Working with AI risks a loss of control on several fronts at once: over your method, over how much you still understand of the work produced, over what survives when the tool changes, over what you actually verify. The sections below take these fronts one by one, and what BASE changes for each.

### Turning every correction into a lasting gain

A correction in a conversation can improve the answer at hand. Written into a rule, an example or a procedure, it becomes reusable for the requests that follow. Some tools already keep instructions or a memory, but this content often accumulates over conversations without staying fully visible or offering fine control over what is kept, changed or deleted. BASE places these elements in files you can reread, modify, delete, version and take with you.

### Reducing what the model has to guess

Language models remain important and are not all equal. For many real-world tasks, however, the model's capability is not enough. The result depends above all on the structure of the work, the relevant facts and the required controls. When the steps, the context and the criteria are explicit, the model no longer has to reconstruct the intended organization on its own at each request. Smaller or local models can then be suitable for some tasks, not because they equal the most powerful models, but because they are asked to guess less.

This structure stays in your files when you change model or tool. You will sometimes have to adapt the compatibility files, the available tools or the execution parameters, but you will not have to rebuild your way of working from memories, settings, proprietary instructions and old conversations.

### Keeping control of the method

In BASE, the expression **cognitive sovereignty** designates a precise capacity: staying in control of how you work and decide with AI. The method you follow, what you delegate, what you keep for yourself are written in files you own, that you can reread and correct. This capacity promises neither total independence nor identical results from one model to the next.

Material sovereignty, by contrast, concerns where the model runs and where the data is processed. The two dimensions complement each other. The fact that the files remain on your device does not prevent a cloud tool from transmitting their content to a remote service; that depends on your configuration and on your contracts with one or more providers. → [Sovereignty and trust](docs/trust/souverainete-et-confiance.md)

### Preserving the overall view

When working with generative AI, a mistake is sometimes visible right away. The loss of understanding is more insidious: answers and documents accumulate, while rereading becomes more superficial. You nonetheless remain responsible for work you understand less and less. BASE does not preserve your judgment for you. It encourages a readable way of working, with assumptions and decision points that help you see what you delegate and what you approve.

Working with BASE also makes transmissible the criteria and the decisions that guide the work. A new colleague can read them, apply them, question them and propose a correction. The point of AI literacy, then, is not to learn the interface of the month. Would we teach computing by limiting it to a spreadsheet? In the same way, a durable AI literacy is about objectives, context, delegation, verification and responsibility.

### Structuring interaction and verification

A language model produces the most probable continuation of what it is given to read; it does not follow rules fixed in advance. So it does not work like ordinary software, and two traits change how you work with it. First, it knows many general regularities but not your organization: even if it can access a database, emails or a set of documents, you still have to tell it what to look for, which sources are authoritative and when to consult them. Second, its core generates, it does not verify: verification is up to you.

BASE organizes not only access to information, but its use. In each process, you can specify which resources to consult, at which step and with what level of detail. Knowledge, sources and business data stay distinct so as to provide the relevant information, at the right granularity and at the right moment, rather than piling up all the available context.

With generative AI, verifying always requires a reference point outside the generation itself: a source, a rule, a calculation, a test or the judgment of a responsible person. Asking the same model to reread its answer with no reference element produces a new generation, not an independent verification. BASE lets you write into the way of working the sources to consult, the controls to run and the decisions to keep visible. On its own, it does not guarantee that an answer is true.

The repository also documents applied research on human-AI interaction. This work is at the heart of the approach to AI literacy that AI Swiss develops and promotes with its education partners: explicit objectives, chosen context, correction loops, a level of delegation and verifications, both adapted to the risk. These pages do not turn any of this into established laws or guarantees. They make the assumptions, the practices and the corrections explicit, transmissible and revisable. → [Co-thinking with AI](docs/learn/co-penser-avec-lia.md) · [Co-thinking in practice, 16 principles](docs/learn/pratiques-co-pensee.md)

> **What you control.** The reference copy of your method stays in Markdown files that you can version and take with you. The BASE conventions are public and the reference implementation is open. BASE determines neither the legal ownership of your data, nor its hosting, nor the processing carried out by the AI tool you choose.

<details>
<summary><strong>Limits of BASE</strong></summary>

BASE does not make AI infallible. On its own it provides neither IAM/SSO (identity management and single sign-on), nor RBAC (role-based access), nor DLP/SIEM (leak prevention and monitoring), nor legal archiving, nor nFADP/GDPR compliance. Meeting an isolated requirement does not amount to compliance.

The standard is nonetheless designed to be built upon. Its metadata can in particular designate an owner, a review date, a sensitivity level or a policy; validators and extension points then let you connect this information to access controls, to authentication or to other layers of governance. BASE thus provides coherent foundations, not turnkey compliance. Each integration must be implemented and verified in its context. → [Public framework and extensions](docs/reference/framework-public.md) · [The standard](docs/reference/le-standard.md)

The separation of instructions and data ([§7](#7-the-building-blocks-as-you-need-them)) helps limit certain confusions, but it does not on its own constitute a mechanism resistant to injection. An external security review is planned, but has not yet been carried out. Threat model: [Security and limits](docs/trust/securite-et-limites.md).
</details>

---

## 5. What BASE adds

BASE complements the layers that already exist:

- a **language model** provides generation and reasoning capabilities;
- a **harness** provides the interface, the tools, the execution memory and the orchestration;
- a **format or a knowledge layer** organizes the information the AI can consult, for example a document corpus, a catalog, a glossary or a business ontology;
- **BASE extends this principle to the whole articulation of the work with AI**: processes, knowledge, sources, data, controls and human decisions each receive a distinct role.

In other words, BASE occupies the least-tooled layer: how the work is described, verified and preserved.

The metadata that the code recognizes connect this structure to mechanisms. They can signal a review, route a request or underpin an access policy. The standard also accepts additional fields: an organization can enrich its schema, then connect these fields to its own validators, policies and controls without locking its files into a particular platform.

Concretely, you can keep the model and the harness you already use. You connect your documents, your data or your knowledge layer, if you have one, to BASE, then you describe how to mobilize them over the course of the work. Without a particular knowledge format, simple files are enough. BASE replaces neither the model, nor the harness, nor document search; it makes their articulation readable, editable and durable. → [The map of the 2026 landscape](docs/reference/positionnement.md)

From the same core of files, BASE can generate the adapters expected by different harnesses, for example `CLAUDE.md`, `AGENTS.md` or the Cursor rules. These files let each tool find the same structure without making its proprietary format the source of truth. → [The standard](docs/reference/le-standard.md) · [Compatibility](docs/reference/compatibilite-harnesses.md)

Multiplying agents does not, in itself, constitute a better structure. Several agents can be useful when tasks can genuinely be isolated, carried out in parallel or evaluated separately. They also introduce a cost of coordination and of context handoff. When work follows a single line of reasoning or depends on a largely shared context, splitting it across several agents mainly adds losses and complexity; a single agent guided by an explicit process then often does just as well, without the coordination cost. BASE imposes no architecture: a process can be followed by a single agent, split across several, or run by another harness. Multiplying agents replaces neither a clear decomposition of the work, nor a verification external to the model.

---

## 6. Who it is for

A provider can shut down a service or change its terms. Your files, though, stay with you.

BASE becomes useful as soon as you want to develop your own working method with AI: to maintain it, version it, improve it, pass it on and preserve it across changes of models or tools. For a one-off question, a chat is often enough. As soon as the work accumulates, files you control let you keep the decisions, the procedures and the corrections without depending on the lifecycle of an interface or a provider.

You can start from an existing task or folder. Tell your AI tool: "Here is what I would like to do. What is possible and how would you structure the work?" The discussion can clarify the steps, the necessary information, the human decisions and the verifications. The tool then applies the BASE standard to the proposed files; you reread and refine them without having to design the format yourself.

A folder that starts light can then be enriched with governance devices: owners, review dates, sensitivity levels, routing, controls and evaluations. The format can stay the same; the access, security and compliance requirements grow as the deployment expands.

| Profile | What BASE brings | What remains your responsibility |
| --- | --- | --- |
| **Individual / student** | Keep a method for research, writing or organization beyond a single conversation. | Choose the data entrusted to the model, reread and maintain the files. |
| **Teacher / professional / freelancer** | Reuse rules, sources and steps specific to the activity. | Validate the business content and decide what can be delegated. |
| **Team / SME** | Share and improve a common method, with visible responsibilities. | Organize access, reviews and the transmission of know-how. |
| **Executive / public sector** | Keep an inspectable source of the method, independent of the execution interface. | Choose the providers, frame the uses, demonstrate and maintain compliance. |
| **Security / compliance** | Distinguish instructions from mechanisms, document the flows and verify the stated limits. | Integrate BASE with IAM, RBAC, DLP, SIEM systems and impact assessments. |
| **Developer / contributor** | Use or extend an open specification and its reference implementation. | Verify the requirements, the tests and the limits before deployment. |

Before launching a pilot in an organization, check four points: which work needs to be structured; which data the AI tool can read; who validates the results; which external controls remain necessary? BASE helps decompose and document the work; it does not bring turnkey compliance. → [Adoption](docs/learn/adoption-organisation.md) · [Sovereignty and trust](docs/trust/souverainete-et-confiance.md) · [Evidence](docs/trust/evidence.md)

---

## 7. The building blocks, as you need them

A folder structured by BASE can start with an agent, a process and a few files. The following functions are added when the need appears.

At first glance the standard can look heavy; it is in fact lean. Each building block stays optional and is added only when it earns its keep, and you do not have to build and maintain the structure alone: your AI tool builds it with you in conversation, and can take your existing setup and translate it into this format. The framework itself takes on part of the upkeep, with its own guardrails and checks (`base doctor` flags a process with no example, a routable resource with no description, a dormant marker; the generated adapters and index regenerate; evaluation lets you track quality). The structure is meant to lighten the mental load, not add to it.

> **Two registers, never to be confused.** A *mechanism* is enforced by code when the action goes through the BASE component concerned. An *instruction* is interpreted by the model: useful, but fallible. Each building block makes clear its register. An instruction is not a guarantee.

- **Organized texts.** The files are written in your words, by you or with the help of your AI tool, following a readable structure. The shared [`base.resource.v1`](docs/reference/le-standard.md) standard makes the folder navigable, for you as much as for the AI.
- **Metadata that activate mechanisms.** A few header lines can signal a process, mark a sensitive resource or define an access rule. Code can interpret this metadata to enforce a control; it does not guarantee how the model interprets the text. → [detail](docs/trust/mecanismes-vs-consignes.md)
- **The double separation.** Instructions are separated from data; know-how is separated from the information used to do the work. This structure clarifies authority and eases maintenance. It reduces accidental confusions, but is not enough to eliminate prompt injection. → [§8](#8-how-it-works)
- **Progressive routing, from your request to the right process.** You phrase your intention in plain language; your AI tool goes through a generated index (`.ai/routing/index.md`) to find the relevant role and procedure. The conversation remains the entry point. For tests and integrations, the CLI also offers lexical routing, more rudimentary, but independent of the model and reproducible. → [detail](docs/reference/routage-process-et-ressources.md)
- **A connector for tools that do not open your files directly.** BASE's MCP server gives a compatible tool controlled access to the project's resources and functions. Locally, it can read the files and propose changes subject to confirmation; over HTTP, it stays read-only by default. BASE can thus graft itself onto a chat or an interface that cannot browse your folder on its own. → [detail](mcp/)
- **The Studio.** A web application lets you see and edit the resources without browsing the folders by hand. By default, it listens only on the local network interface. `base studio --root <folder>` → [detail](tools/studio/ui/README.md)
- **Evaluation.** A simulated user talks with the assistant, then a judge-model evaluates the transcript against versioned scenarios. You can compare several versions; the result serves as a regression signal, not as an absolute grade.
- **A control over outgoing data (egress).** BASE's broker is the component that filters the resources before they are sent. When a remote call goes through it, a resource carrying `confidential: true` or located under a `local-only` root is held back and replaced by an explicit notice. By default, the policy is permissive. Text entered directly and actions outside the broker are not filtered. This mechanism is neither a firewall nor a DLP. → [detail](docs/trust/frontiere-local-vs-sortant.md)

> **Repository controls.** `npm run check` runs the verifications planned by the project. The security claims and the `FR-*` requirements point to their mechanisms, their tests and their limits in [§8](#8-how-it-works) and in [Evidence](docs/trust/evidence.md).

<details>
<summary><strong>Compatibility and deployment: MCP, multi-folder workspaces, CLI, Studio confinement</strong></summary>

- **The MCP server.** The *Model Context Protocol* (MCP) is the protocol that here connects the AI tool to BASE's resources and functions. The server exposes to it, in particular, discovery, routing, reading and, in local mode, mediated writing. Its HTTP interface is read-only by default; a non-local binding is refused without authentication, except for a derogation explicitly flagged as dangerous. → [mcp/](mcp/)
- **Multi-folder workspaces.** Several folders loaded side by side, isolated from one another. A nested root remains isolated.
- **The CLI.** `base <command>` exposes to humans and to tools commands to build, route, audit and evaluate a folder structured by BASE.
- **Studio confinement.** It listens only on `127.0.0.1` by default and protects against *DNS rebinding*, an attack that tries to bypass the local network border. This reduces network exposure; it is not authentication and it does not protect against a malicious local process.
- **Independent layers.** You can stick to the structured files or add the documentation, the Studio and the MCP server. An organizational deployment requires the access controls, the integration and the governance suited to its context.
</details>

---

## 8. How it works

### The structure, in detail

BASE assigns distinct roles to files. The agent describes the role; the processes carry the know-how; the competences bring the useful knowledge; the sources provide the reference information; business data stays in its own folders. This separation clarifies what gives an instruction and what provides information. It helps design controls; it does not on its own prevent a piece of data that has been read from influencing the model.

```
METHOD AND EXPERTISE                         BUSINESS CONTENT
AGENT.md             The role                data/        Your business files
  └── skills/                                sources/     Your reference sources
        ├── processes/   The know-how
        └── competences/ The knowledge
  templates/          Forms (opt.)
  tools/              Scripts (opt.)

  Intended border: the method holds the authority;
  the business content provides the information.
```

Two distinctions structure this classification: the method is separated from the information used to do the work; instructions are separated from potentially adversarial data. Templates, scripts and other files stay optional. The processes and the competences follow the **SKILL.md** convention, in readable Markdown files. Some tools discover them natively; others ask for an adapter or an explicit link.

### Routing, in detail

Three modes of access are possible, from the most guided to the most direct: **formulate your request** and let your tool find its way in BASE; **choose the agent yourself**; **directly open the file** you want. By default, the tool reads a generated index (`.ai/routing/index.md`) and descends from the root toward the agent, then toward the process. For tests and integrations, `base route` and the MCP tool `route_request` use a more rudimentary lexical routing, with no model. With the same corpus, the same configuration, the same version and the same request, this mechanism produces the same result: a route or a reasoned abstention. This reproducibility makes it testable; it makes its choice neither finer nor necessarily right. When the deterministic router and the model disagree on a route, that flags a case to clarify; on its own, it does not settle which routing is right. For large catalogs, an optional mode can add *embeddings*, numerical representations used to bring similar requests closer together, then a refinement by the model.

The index is regenerated when the folder changes. With a single "quote" agent, the choice is simple; adding a "support" agent introduces a new route to describe and to test.

### Evaluating and observing your folder

In an evaluation, a simulated user talks with the assistant under test, then a judge-model evaluates the transcript against versioned scenarios. The verdict depends on the models and must be reread; it can signal a regression, not prove an absolute quality. You run it on an agent and scenarios, for example `npm run eval -- --root . --agent <agent> --process <process> --scenarios <file>`. By default, it calls an OpenAI-compatible provider; `--ollama` switches to local. → [detail](tools/eval/README.md)

At scale, this evaluation also measures the portability of your processes. Replay the same scenarios across different models, both as the simulated user and as the judge, and you get a signal, weak but real, of how much your results vary from one model to the next. It is a matter of sovereignty: some recent models are tuned for their own environment and follow a structure designed for another tool less faithfully; quantifying that gap reveals which models adapt best to your method, rather than imposing their own conventions on you.

### For the contributor

BASE today has a lead maintainer and remains under the stewardship of AI Swiss. The licenses allow others to take over the project. The CLI core uses the Node.js standard library; the MCP and the optional interfaces have their own dependencies.

```bash
git clone https://github.com/ai-swiss/base.git && cd base && npm ci && npm run check
```

`npm run check` verifies the specifications, the typing, the schemas, the recorded test cases for routing, the documentation hygiene and the associated test suites. Coverage and some publication checks run separately in CI. To change a behavior, find its `FR-*` requirement in `specs/current/10_core/`, read the corresponding tests, then modify code, specification and tests together. → [ARCHITECTURE](ARCHITECTURE.md) · [CONTRIBUTING](CONTRIBUTING.md)

<details>
<summary><strong>Languages and sources of truth</strong></summary>

**Language.** You can write the method in the languages the chosen model understands. Routing by the model can work in these languages; lexical routing without a model, by contrast, depends on the signals present in the index. → [Writing for the router](docs/guides/ecrire-pour-le-routeur.md)

**Sources of truth.** The expected state is defined in the specifications; the code implements it and the tests provide the elements of proof. The decisions and the `CHANGELOG` track the changes; `.plans` and `.reviews` stay drafts. Any divergence between specification and code is a defect. → [ARCHITECTURE](ARCHITECTURE.md)
</details>

---

## 9. Going further

**Learn:** [What to read in what order](docs/start/lire-dans-quel-ordre.md) · [Step-by-step tutorial](docs/tutoriel/index.md) · [Co-thinking with AI](docs/learn/co-penser-avec-lia.md) · [Co-thinking in practice, 16 principles](docs/learn/pratiques-co-pensee.md) · [Adoption in an organization](docs/learn/adoption-organisation.md) · [The lifecycle of an expertise](docs/learn/cycle-de-vie-expertise.md)
<br><sub>These paths develop a literacy that does not depend on a particular interface: choosing the context, distinguishing instruction from mechanism, verifying, then taking responsibility for the result.</sub>

**Contribute:** [CONTRIBUTING](CONTRIBUTING.md) · [DEVELOPING](DEVELOPING.md) · [ARCHITECTURE](ARCHITECTURE.md) · [specs/](specs/README.md)

**Trust and security:** [Evidence](docs/trust/evidence.md) · [Security and limits](docs/trust/securite-et-limites.md) · [The border between local and outbound data](docs/trust/frontiere-local-vs-sortant.md) · [Sovereignty and trust](docs/trust/souverainete-et-confiance.md)

**Report or discuss:** [issues](https://github.com/ai-swiss/base/issues/new/choose) · [Discussions](https://github.com/ai-swiss/base/discussions) · vulnerabilities privately via [SECURITY](SECURITY.md)

**Governance and durability:** [GOVERNANCE](GOVERNANCE.md)

**Context:** [Launching BASE](docs/public/2026-06-25-lancement-base.pdf) (Innovaud × AI Swiss, 25.06.2026, in French).

---

## Licence and attribution

Code under **Apache-2.0**; documentation, agents, skills and examples under **CC BY 4.0** (dual license detailed in [LICENSING.md](LICENSING.md), full texts in [LICENSES/](LICENSES/)). See [GOVERNANCE](GOVERNANCE.md) · [Code of conduct](CODE_OF_CONDUCT.md) · [CONTRIBUTING](CONTRIBUTING.md).

Created by **Charles-Edouard Bardyn** within AI Swiss, a non-profit association that ensures a stewardship neutral toward models. Innovaud contributes to the design of the examples devoted to enterprise uses.

BASE provides a **starting point** that you can copy and adapt. The dual license also allows the creation of complementary tools and services. Their use in an enterprise must be evaluated with regard to the necessary integrations, controls and governance.
