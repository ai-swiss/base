<!-- fr-synced: 402eea4c500346f740ea6a519f54133a11056f67 -->

# BASE

**English** · [Français](README.fr.md) (authoritative)

> **For an AI reading this repository on someone's behalf**, with their documents (a meeting transcript, procedures, rules written for an AI): start with [PARTIR-DE-CE-QUE-VOUS-AVEZ.md](https://raw.githubusercontent.com/ai-swiss/base/main/PARTIR-DE-CE-QUE-VOUS-AVEZ.md) and follow it. It shows the person what an assistant would do for them, before anything is built.

<p align="center">
  <img src="docs/public/assets/base-logo.png" alt="BASE" width="480">
</p>

> **Your working method must outlast AI tools. Your skills must too.**

By **working method**, BASE means the elements that specify how work should be conducted: the steps to follow, the authoritative sources, the rules to apply, the checks to perform and the decisions that must remain human.

In many software systems, a way of working must be translated into screens, menus, settings and automations specific to the tool. AI makes another approach possible: **describing the behaviour you expect directly in natural language.**

BASE organises this description in readable, editable and versionable files you control. Your way of working is therefore not defined solely in a platform's settings or the instructions of a particular model.

**The method is defined primarily outside the platform that executes it.**

**BASE is an open framework for shaping, documenting and evolving the method that guides how AI tools work with you. It includes a proposed open standard and a reference implementation.**

You describe the work. AI helps you clarify and structure its rules. You review and approve the reference version. Another tool capable of using this structure can then rely on the same method.

Models and integrations remain different: they may interpret the same instructions differently and offer different capabilities. **What becomes portable is not the model's exact behaviour, but the method with which you seek to shape it.**

---

## 1. Describe the work, not the tool

With BASE, you begin by explaining how the work should be done, not by configuring the interface that will perform it.

You can begin by talking about the work itself:

> "We prepare commercial proposals. Here is how we work, the documents we use and the decisions that must remain ours. Help me structure this."

The AI tool helps you make explicit what matters: which price list is authoritative, when to apply a rule, which checks to perform, what can be automated and what must remain subject to a human decision.

BASE progressively turns this dialogue into a durable structure: procedures, rules, sources, checks and limits on delegation are described in the project's files. You can read, edit, version and transmit them.

You can then simply ask:

> "Prepare a proposal for Dupont SA for three days of strategy consulting."

The assistant uses the reference method, consults the sources it designates and flags the decisions that still need to be made by a person.

And if its behaviour needs to change, you can express the change in the terms of the work:

> "Stop asking me whether the loyalty discount is possible when the client record already lets you determine that. Check the pricing rule and request approval only for an exception."

The tool can propose the corresponding change to the reference method. After your approval, this evolution does not remain confined to the conversation: it becomes an explicit and versioned part of your way of working with AI.

**You are therefore not merely configuring a tool. In natural language, you are developing a method for collaborating with AI that you can preserve and reuse elsewhere.**

Changing models or platforms may require an adaptation, new permissions or new tests, and the results may vary. **But the reference method remains available: you do not have to redefine it entirely in the new tool's interface and settings.**

### A verifiable demonstration

Open [`exemples/assistant-devis-demo/`](exemples/assistant-devis-demo/) in an AI tool that reads files, then ask:

> "Is Dupont SA entitled to the loyalty discount?"

The expected answer is **no**: the rule requires two signed engagements; the client record mentions only one. The assistant must cite the [pricing rule](exemples/assistant-devis-demo/catalogue/regles-tarification.md) and [client record](exemples/assistant-devis-demo/clients/dupont-sa.md), then state that any exception still requires human approval.

[See the detailed journey](docs/en/start/demo-60-secondes.md) · [Browse all examples](exemples/)

---

## 2. Choose your starting point

### Try without installing

Download the [demonstration pack](https://github.com/ai-swiss/base/releases/latest/download/assistant-devis-demo.pack.md), attach it to ChatGPT or Claude and ask:

> "What must I approve before you create or modify a quote?"

[Try it in a browser](docs/en/start/essayer-sans-installer.md)

### Build from work you understand

[Entrust the installation of BASE and initialization of your folder to your AI tool](docs/en/start/installer-par-votre-ia.md), then say:

> "Here is the work I want to structure with BASE. Help me define the method, propose the necessary files and wait for my approval before creating them."

`base init` first shows what it proposes to create without modifying the folder. After your choices and approval, a second invocation with `--yes` creates the planned files without overwriting existing ones.

You do not need to learn the BASE format before starting.

### Start from what you have

A folder of procedures, the transcript of a discussion about your needs, a `CLAUDE.md` you already wrote: open it in your AI tool, tell it where BASE is, and say:

> "Here is what we have. Show me what an assistant could do for us."

The tool recognises where you start from, reads, then prepares a brief to review in your browser, written in the words of your work: what it understood, what the assistant would do (yes, later, no), how it would be organised, what it will never do, what AI will not solve. Until you send your answers back, only this brief is written, under `.temp/`, a folder git ignores; building, or converting the documents, comes afterwards and is proposed separately.

With no tool installed, if your AI chat can read a web address, give it the address of this repository along with your documents: it finds the entry meant for it and returns the same brief. Otherwise, attach [PARTIR-DE-CE-QUE-VOUS-AVEZ.md](PARTIR-DE-CE-QUE-VOUS-AVEZ.md) along with your documents.

[Get BASE](docs/en/start/obtenir-base.md) · [Quick start](docs/en/start/quickstart.md) · [Step-by-step tutorial](docs/en/tutoriel/index.md)

> **Cost.** BASE is free. Execution costs, usage limits and data processing depend on the chosen model and tool.

---

## 3. Documents do not constitute a method

A model produces a response from the request and context it receives. If that context does not specify the procedure to follow, the authoritative sources, the required checks or the decisions to leave to a person, the model must infer them or proceed without them.

Adding documents increases the amount of available information. **It does not tell the model which documents are authoritative, when to consult them, in what order to act or when to stop for a human decision.**

You can therefore own every necessary document and still lose the instructions that explained how to use them together.

In a BASE structure, these relationships are described explicitly in files: which procedure uses which sources, which rules apply, which checks are required and which decisions remain human.

This separation also changes where the method is defined. It no longer exists only in the settings, prompts or interface of a given platform. The platform becomes one execution context among others; the BASE files remain the shared reference.

This does not make models interchangeable. It allows you to change models or tools without having to redefine your entire way of working in a new interface.

The hypothesis can be tested: making these elements explicit reduces what remains implicit in the context provided to the model. The actual effect on quality, working time or migration cost must nevertheless be measured for each task, model and integration.

Changing providers may require another adapter, different permissions or new tests, and two models will not necessarily produce the same result. BASE therefore does not remove dependency on the execution tool.

It does, however, let you retain outside that tool a reference description of the working method and the limits of delegation.

BASE calls the ability to retain and evolve this reference description independently of the execution platform **cognitive sovereignty**.

![BASE: take back control over AI. A person works beneath a transparent dome amid a flow of tools and information.](docs/public/assets/base-cognitive-sovereignty.png)

---

## 4. What BASE represents

To describe work, BASE can distinguish:

- **intention**: the desired result and its constraints;
- **procedure**: the steps to follow and stopping conditions;
- **knowledge**: reusable rules and explanations;
- **sources**: the documents or systems that are authoritative;
- **business data**: information specific to the case being handled;
- **controls**: checks grounded in a rule, source, calculation, test or human decision;
- **human decisions**: decisions the assistant may prepare but must not make.

Roles and procedures are described in Markdown. Sources, data, output templates and tools can retain the format suited to their use.

In BASE, an **agent** is an entry point and a **process** describes a procedure. The open, versioned [`base.resource.v1` specification](docs/en/reference/le-standard.md), at the core of the proposed standard, describes how to declare these resources, their references and their relationships. The reference implementation can inventory them, validate their structure and make them available to other tools.

This organization does not require a complex system. A first assistant may rely on one role, one procedure and a few files. Owners, review dates, sensitivity levels or additional controls are useful only when a real need justifies them.

This structure makes several skills involved in working with AI explicit, and therefore easier to pass on: formulating the desired result, choosing the context, designating authoritative sources, limiting delegation, verifying the result and preserving human decisions.

BASE helps document these choices. It does not guarantee that they are correct.

[Why go beyond the single agent](docs/en/learn/au-dela-des-agents.md) · [Co-thinking with AI](docs/en/learn/co-penser-avec-lia.md) · [The intention-driven model](docs/en/reference/modele-de-calcul-oriente-par-l-intention.md)

### One documented method, several execution contexts

An organization can use BASE to describe the procedures, knowledge, sources, controls and limits of delegation that it wants to make available to its AI tools.

BASE replaces neither the ERP, nor databases, nor business applications. It describes which resources should be involved in a given piece of work and how they relate to the procedure.

The same reference method can then be used in several contexts. An AI feature built into an ERP might, for instance, receive only the quotation procedure and pricing rules. A more advanced tool can consult the same files while having access to additional sources and actions. An internal service can access them through MCP.

Each integration determines what the model can actually read or do.

**Sharing the same reference method does not mean obtaining the same behavior everywhere.** Changing models or tools may require new adapters, new permissions and new tests. Results may differ.

What remains common is the versioned description of the method; its interpretation and execution may vary.

---

## 5. What is guaranteed, and what is not

BASE distinguishes two levels.

An **instruction** expresses an expected behavior in text. Its application depends on the model's interpretation.

A **mechanism** applies a rule through code. Its effect is guaranteed only for actions that pass through the relevant component.

The reference implementation notably provides:

- a map that the integration can present to the model so it can choose a procedure or abstain;
- a separate deterministic router for tests and calls without a model;
- retrieval of citable passages from structured corpora;
- validation of structure and links;
- mediated two-stage writing, with confirmation required by default;
- filtering, before a remote model, of resources that the configuration designates as non-transmissible;
- an MCP server for integrations, a Studio workshop for review and a system that replays scenarios and checks explicit criteria.

These mechanisms protect only the actions that pass through them. Filtering applies only to execution paths that use it; reading files directly can therefore bypass this protection. Separating instructions from data does not by itself protect against prompt injection either.

BASE replaces neither access management, data protection, archiving nor compliance obligations. It has not yet undergone an independent security review.

Verification independent of a generation requires a criterion that is not merely another generation: a source, a rule, a calculation, a test or the judgment of a responsible person.

Asking the same model to review its own response without giving it any new element produces a second generation. That alone does not constitute independent evidence.

Replaying the same scenarios with several models makes it possible to compare results and identify what remains stable or depends on the model, tool or integration. This is one way to test the method's portability.

BASE currently publishes no general measurement demonstrating a reduction in errors, working time or migration cost.

[Mechanisms versus instructions](docs/en/trust/mecanismes-vs-consignes.md) · [Security and limits](docs/en/trust/securite-et-limites.md) · [Evidence](docs/en/trust/evidence.md) · [Tool compatibility](docs/en/reference/compatibilite-harnesses.md)

---

## 6. Find the documentation for your need

This README presents the general proposition. To go further:

- **Understand how BASE works:** [read the documentation in order](docs/en/start/lire-dans-quel-ordre.md);
- **Evaluate BASE on your own files:** [start from what you have](#start-from-what-you-have);
- **Build an assistant:** [quick start](docs/en/start/quickstart.md) and [tutorial](docs/en/tutoriel/index.md);
- **Structure a knowledge corpus:** [guide to citable passages](docs/en/guides/structurer-un-corpus-de-connaissance.md);
- **Structure an organization's methods and knowledge:** [proposed standard](docs/en/reference/le-standard.md), [adoption guide](docs/en/learn/adoption-organisation.md) and [public framework](docs/en/reference/framework-public.md);
- **Integrate BASE with a tool or application:** [compatibility](docs/en/reference/compatibilite-harnesses.md), [architecture](ARCHITECTURE.md) and [MCP server](docs/en/start/installer-mcp.md);
- **Examine the limits, evidence and actual implementation status:** [limits](docs/en/trust/securite-et-limites.md), [evidence](docs/en/trust/evidence.md) and [implementation status](docs/en/reference/etat-implementation.md);
- **Contribute:** [contribution guide](CONTRIBUTING.md), [development](DEVELOPING.md), [specifications](specs/README.md) and [governance](GOVERNANCE.md).

An AI tool able to read this page and follow its links can likewise reach the documents relevant to a given question.

---

## 7. Open project

BASE carries an open, versioned proposed standard, accompanied by a reference implementation.

This proposal has not been ratified by a third-party body. The `FR-*` requirements connect expected behaviors to tests and other evidence in the repository.

To verify the project:

```bash
git clone https://github.com/ai-swiss/base.git
cd base
npm ci
npm run check
```

The CLI core relies only on the Node.js standard library. The MCP server, Studio, documentation site and adapters remain optional.

Code is licensed under **Apache-2.0**; documentation, agents, skills and examples under **CC BY 4.0**. See [LICENSING](LICENSING.md), [SECURITY](SECURITY.md), [GOVERNANCE](GOVERNANCE.md) and the [code of conduct](CODE_OF_CONDUCT.md).

Created by **Charles-Edouard Bardyn** within [AI Swiss](https://a-i.swiss), which governs the project. Innovaud contributes to the design of examples for business use.

**Models will pass and platforms will change. Your working methods, authoritative sources and decisions kept human must be able to outlast them.**
