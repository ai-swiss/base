<!-- fr-synced: 218128215df7174b7067e7a3cd5dc5a0981e753f -->
# Where BASE sits in the AI tooling landscape

Choosing an AI tool means deciding what you own and what holds you: does BASE replace your tools, or add to them? For anyone evaluating it alongside other solutions, here is its place, a sovereign layer of expertise for human-verifiable AI work, and an honest list of what it does not do.

> Thesis in one sentence: BASE owns the articulation (portable Markdown agents, deterministic routing, mediated actions, reviewable expertise) that your execution tools run, without becoming an execution engine itself.

This distinction is the backbone of the document. A tool that **executes** (a model, an orchestrator, a connector) runs the computation. BASE **owns** the way that work is articulated: which agent, which process, which targeted resources, with what validation. Most of the tools compared below are layers that BASE plugs into, not competitors.

A recurring point of vocabulary in BASE: a **mechanism** is enforced by the broker (code verifies it), a *consigne* is an instruction the model follows (so, fallible). Wherever a guarantee matters, we spell out which of the two is in play.

## Comparison by category

The 2026 landscape of tools for building or running AI assistants comes down to a few broad categories. Here is where BASE stands against each one, and the relationship in every case: **differentiated** (it moves articulation off the platform), **complementary** (the category executes, BASE owns what it executes), **port** (BASE speaks the protocol), **shared ground** (BASE extends the format). The products named are only examples of a category, never the category itself.

| Tool category (2026) | What it does | What BASE does differently | Relationship |
| --- | --- | --- | --- |
| **Hosted customizable assistants** (for example custom GPTs, Gemini Gems, Claude Projects) | Freezes a consigne and a few context files in your account at the provider, tied to a model and its interface, no code. | Moves articulation off the platform: Markdown agents you own and version, portable from one model to another, with routing that picks the agent instead of an assistant you select by hand. | **Differentiated** |
| **Copilots embedded in office suites** (for example Microsoft 365 Copilot, Gemini in Workspace) | Weaves AI into productivity tools and draws on your data (documents, email, calendar) as context, within one suite and one provider. | Makes articulation explicit and owned (processes and agents in text, outside the suite), attached to the **task** rather than to whichever tool is open that morning, so it is reusable whatever the suite. | **Differentiated** |
| **Retrieval and memory pipelines** (RAG, vector indexing, agent memory; for example Qdrant, Cohere Rerank, Mem0) | Retrieves fragments by similarity, or recalls a past state, and injects them into the model's context at inference time. | Does no RAG and has no opaque state to recall: routes to a whole unit of work (an **agent and its process**) deterministically and lexically, and keeps its memory explicit and versioned. A pipeline can be a tool that a process draws on. | **Differentiated** |
| **Governed enterprise agent platforms** (no/low-code; for example Copilot Studio, Gemini Enterprise) | Assembles, grounds via RAG, connects, and publishes governed agents within its own perimeter: a category of execution and orchestration. | Does not execute; owns the articulation (which agent, which process, which mediated propose-then-commit actions) in portable text, which can feed these platforms instead of being locked inside them. | **Complementary** |
| **Agent orchestration frameworks** (state graph, roles, durable execution; for example LangGraph, CrewAI, Temporal) | Runs the loop: branches, retries, merges a state, coordinates several agents, replays after a failure. This is the execution engine. | Does none of that; owns the upstream articulation (deterministic lexical routing to an agent and a process) and stays cautious about autonomous multi-agent setups: its loop is propose-then-commit, verified by the human. A BASE agent can become a node in the graph. | **Complementary** |
| **Model providers' agent SDKs** (for example Claude Agent SDK, OpenAI Agents SDK, Google ADK) | Runs the agentic loop on the provider side (tools, handoffs between agents, machine access, guardrails), anchored to a specific model. | Adds owned articulation and egress mediation on top: the action is proposed then committed under control, not run continuously. Provider-independent. | **Complementary** |
| **Workspace coding agents** (terminal, IDE, background; for example Claude Code, Cursor, Codex, Devin) | Reads your files, reasons, edits, runs commands, and loops until the task is done, under adjustable approval, on your machine or a sandbox. | Does not run the loop; lives inside that tool and supplies the upstream articulation (deterministic choice of a whole agent and process) and propose-then-commit mediation, which keeps the human at the point of action. | **Complementary** |
| **Interoperability protocols** (agent-tool and agent-to-agent; for example MCP, A2A) | Standardizes the plumbing by which an agent discovers and calls tools and data, or coordinates other agents, independent of the tool. | A port that BASE speaks: its server exposes routing and resources (`route_request`, `load_agent`, `propose_change`, `commit_change`) over MCP. The protocol carries; BASE provides what travels through it. | **Port** |
| **Open agent-configuration formats** (for example AGENTS.md, Agent Skills, CLAUDE.md) | Describes in open files the instructions, competences, and commands that guide an agent at runtime, independent of the tool. | BASE structures this knowledge into owned agents and processes, with deterministic routing that picks a whole agent and process instead of injecting an undifferentiated block of instructions. It reads and writes these formats. | **Shared ground** |

Reading across. BASE is **differentiated** against the categories of ownership and perimeter, where the articulation of the work stays captive to an account, a suite, or an index of fragments. It is **complementary** to the execution categories, which run the loop where BASE does not. It is a **port** to the interoperability protocols, which it speaks rather than competes with, and **shared ground** with the open formats, which it extends by adding the routing and the choice that the format alone does not provide. The dividing line is sharp: anything that executes, indexes, or hosts composes with BASE or differs from it by perimeter; BASE itself owns the deterministic choice of the agent and the process, and the mediation that keeps the human at the point of action.

## An integrated product, or a framework you own

Most enterprise AI offerings are **integrated products**: an assistant, its model, its interface, and your data brought together in one service. It is effective right away, and it is often a good starting point. But a product and a framework are not judged on the same timescale. Four structural differences hold for any reader.

- **Ownership.** In a product, the articulation of your work (your rules, your processes, the way you break tasks down) lives in the provider's account and format. In a framework, it is a folder of text files you own, version, and take with you. The day the offering changes its price or its terms or disappears, one starts from scratch, the other keeps everything.
- **The model stays a choice.** A product ties you to its model and its pace. A framework makes the model an external, replaceable building block: you follow the model frontier instead of marrying a single provider's calendar. The best-placed model today will not be the one next year; a framework lets you switch without rebuilding everything, where a product tied to its model forces you to.
- **Verifiability.** A product's guarantees are, for the most part, instructions given to its model, inside a closed box: you take them on faith. An open framework can make its guarantees mechanisms, code you read and test. You audit a framework; you trust a product.
- **Durability.** Files in open formats outlive any product. Your expertise accumulates in a medium that does not depend on a provider's decisions. That is what makes a framework far more rewarding over time: it turns AI into an asset you own, rather than a subscription that holds you.

These products are genuinely useful, and BASE plugs into them gladly (see the comparison above). These differences simply say where the durable value lives: less in the infrastructure or the tool that executes than in the owned articulation, the part you keep when the rest changes.

## Open knowledge formats

Major players are converging in 2026 toward open standards for agentic AI: interoperability protocols (MCP for agent-tool, A2A for agent-to-agent) and open formats for describing an agent's knowledge and configuration in Markdown, Google's **Open Knowledge Format (OKF)** or the `AGENTS.md` files being recent examples, several of them now carried under open, shared governance (the Linux Foundation hosts some). This is good news. Every step that helps people keep their knowledge in open, portable, owned files goes in the direction BASE has defended from the start: sovereignty, down to the format.

BASE goes further along the same path. A BASE resource is already a plain Markdown file with frontmatter, readable by these formats, and adds what they leave out: deterministic routing, egress control, mediated writing, and the human-verification loop. These first steps move toward ground that BASE already explores in depth, and we are glad to see other players advancing there.

## What BASE does NOT claim to be

To stay honest, here is what BASE is not and does not provide on its own.

- **Not an agent runtime** nor an orchestration, workflow, or DAG engine. BASE does not run agents in a loop; it owns the articulation that others run.
- **Not RAG** nor a general-purpose document index. Routing picks an agent and a process, it does not retrieve passages.
- **Not a platform**: no compute, no storage, no managed connectors provided by default.
- **Not an IAM, DLP, SIEM, RBAC, retention, or legal-archiving system.** Those functions belong to your organization and its tools.
- **Not a guarantee of accuracy** for the outputs a model produces. BASE structures human verification, it does not replace it.

## Three proofs for the skeptic

**1. Enforced mechanisms, not just consignes.** Several guarantees are verified by code, independent of what the model decides:

- path confinement and refusal of outbound symlinks (`tools/core/confine.mjs`);
- two-step writing, propose then apply, mediated and atomic;
- tools executed in dry-run by default;
- routing abstention (`out_of_scope`, `ambiguous`, `needs_clarification`) rather than a false certainty;
- MCP server in read-only HTTP by default, with a bearer-token option;
- Studio on loopback only;
- settings store **names** of environment variables, never API keys in the clear;
- egress control: a confidential resource or a root declared local is not sent to a remote model, the check made **before** the call;
- the `.ai/trace` log records mediated operations locally.

These are mechanisms (broker), to be distinguished from consignes (instructions to the model), which remain fallible.

**2. Routing chooses, it does not retrieve.** Default routing is 100% local and lexical (no network); it returns an agent and a process, or abstains. Its stability is tested: `base route-test` reads fixtures and fails at the slightest drift. A similarity retrieval, by contrast, would not be reproducible identically fixture by fixture. Semantic ranking stays optional and can run locally (for example via Ollama); the **model** is the user's choice, outside BASE's perimeter.

**3. Claims are wired to proofs and to tests.** The real state is documented (`docs/reference/etat-implementation.md`) and coverage is maintained and verified in CI: the test architecture (static, unit, contract, Studio components, end-to-end, accessibility) is described in `specs/TESTING.md`, and the requirements-to-tests proof in the generated matrix. CI runs `base validate` and `npm audit` (excluding dev dependencies, high threshold). Where BASE does not provide a function, this document says so plainly rather than asserting it.

## License and scope

The code is under Apache-2.0, the documentation under CC-BY-4.0.

This page is **informational**: it constitutes neither legal advice nor compliance advice. An institution remains responsible for its own impact assessment (DPIA) and its security policy. See also `docs/reference/base-et-vos-outils-ia.md` and `docs/reference/etat-implementation.md`.
