<!-- fr-synced: 20184440bb40c6770ddabc9490396894b578559b -->
# Security and limits

Before you trust BASE with data or actions, know what the local core actually protects and what you still have to add for your context: rely on it too much and you leave exposed what you believed was protected. Whether you are deciding for yourself or for a public administration, here is where the boundary runs. BASE strengthens your control over working with AI, but it does not raise a general-purpose AI tool to the security level of a large organization.

## Core principle

The [glossary](../reference/glossaire.md) defines the distinction between mechanism and *consigne*. Here it bounds each guardrail to the component and path that enforce it.

**An instruction addressed to a model is not a security boundary.** A model interprets text; it can neither revoke a permission granted by the system nor prevent its host tool from bypassing a rule. A guarantee arises from an executable mechanism placed on the path of the action: operating-system permissions, isolation, a broker, an egress policy, validation, or confirmation.

BASE acts on both planes without conflating them. Its files steer the model by describing the expected work. On mediated paths, its code can also allow, deny, or confine certain actions. BASE is therefore not a sandbox: if an agent also has direct access to the shell, filesystem, or an external API, that access remains governed by the rights of the tool and its environment.

For public BASE's runtime controls, that scope most often goes through the `base` CLI, the broker in `tools/base-core.mjs`, or the MCP server when it delegates to the broker. Test gates can also constitute a mechanism in their own scope, such as the automated accessibility check for Studio's covered views.

**Concrete consequence, with no technical team:** in the browser alone, reading the map and rules steers a cooperative model. This is the normal model-routing path, but it remains a consigne. Confinement, egress control, and preview before writing require the component that enforces the relevant control. The details, level by level, appear in [Try BASE without installing anything](../start/essayer-sans-installer.md).

A process can declare that it needs to read a source or run a tool. That declaration expresses a work need; it grants no permission. The real rights stay with the OS, the shared folder, the Drive, the connector, the API, the token, or the harness in use.

## Actions that pass through BASE

An action passes through BASE when it uses the CLI, the broker, or the MCP server to ask BASE to act. Typical examples:

- `base open <id>` or `open_resource`: open an inventoried resource, with projection and policy;
- `base access <path>` or `access_resource`: read a file confined within the project root;
- `base invoke <tool>` or `invoke_tool`: prepare a command in dry-run, then run it only if it is confirmed;
- `base propose` then `base commit`, or `propose_change` then `commit_change`: write through a proposed, confirmed, and verified change.

In these cases, BASE can enforce confinement, `allow` / `deny` / `needs_approval` decisions, dry-run, and confirmation. Instrumented points also attempt to write a minimal, best-effort, non-exhaustive trace. If the action bypasses these entry points, it depends on the native rights of the tool or the environment.

## Three doors, three levels of guarantee

A BASE folder is reached through three doors. The same promise does not hold the same way behind each, and the difference is not written in the files: it comes from what sits on the path of the action.

### Door 1: your AI tool reads the files directly

Claude Code, Cursor, an editor opened on the folder: nothing sits between the model and the disk.

The tool receives the whole written method. It reads the generated entry point (`CLAUDE.md`, `AGENTS.md`, the Cursor rule), then the routing index `.ai/routing/index.md`, each agent's index and the process text, with their "when to use" and "avoid if", the recommended reading order, the abstention guideline, and the frontmatter as a signal. These steer a cooperative model: they are guidelines the tool follows by convention.

Two controls, however, are absent from this path. A direct file read supplies no egress context: nothing stops the tool from opening a resource marked `confidential`, or from sending it to its model's provider. The mediated write path (`tools/core/writes.mjs`) applies only to writes that go through it: the tool may rewrite the same file with its own editing tool, with no proposal and no prior diff. The best-effort trace offers no exhaustive coverage of such an operation.

### Doors 2 and 3: the MCP server

A chat client connected to the MCP server (door 2), or your own AI layer calling that same server (door 3), both go through the broker.

**The read surface is treated as remote by default.** The server cannot know whether the model that will read the contents runs locally or at a provider, so it assumes the riskier case: `mcpEgress` builds a `modelLocality: "remote"` context that every MCP entry threads to the broker (`mcp/src/base-core-adapter.ts`). A resource marked `confidential`, and every resource of a root declared `egress: local-only` in `base.config.json`, is withheld. On open, the content gives way to the withholding notice and the attached record is reduced to its identifiers. In discovery, search, routing, and the marker listing, a withheld resource is absent from the results: its existence is hidden, not just its content.

Every control that withholds a resource is tested on a real root, inventoried by the engine, never on a card written by hand for the test. A control verified on a fabricated card can look for the field where a real resource does not carry it: it then lets through what it claims to withhold, and nothing reports it.

**One variable lifts that withholding: `BASE_MCP_ALLOW_CONFIDENTIAL=1`.** Setting it amounts to asserting that the model that will read these contents runs on a machine you control. A local client is not enough: an application connected over `stdio` can pass every opened content to a hosted model. Egress withholds nothing toward a local model, so that assertion releases, in one move, both `confidential` resources and `local-only` roots. The server announces it at startup with a warning. BASE cannot verify the assertion: it commits the operator.

**Writing goes through `propose` then `commit`.** `propose_change` writes nothing: it records the change, returns an id and a readable diff. `commit_change` applies that change, refuses if the target moved since the proposal, verifies the written state, and returns a receipt. The default policy refuses a commit that carries no explicit confirmation, unless the target resource declared `requires_confirmation: false`; a `sensitive` or `restricted` target can never waive the confirmation. When the target is confidential or belongs to a `local-only` root, the diff itself is withheld, since it carries the file's current content. One precision about that confirmation: `confirmed: true` is a parameter set by the calling client. The mechanism guarantees that an unconfirmed write is refused; whether the confirmation comes from a person depends on the client, which has to show the diff before setting it.

**The HTTP transport is read-only by default.** In that mode the write and execute tools are not registered at all: no exposed tool leads to a write. What remains is discovery, routing, reading, the context pack, and the review of pending changes. The local `stdio` transport does expose mediated writing, unless you ask otherwise (`--read-only`, or `BASE_MCP_READ_ONLY=1`). Listening on a non-local address is refused without authentication, save for an override explicitly flagged as dangerous.

One reservation for door 3: an integrated layer that reads directly or calls `base open` without an egress context ends up in the situation of door 1. `base route` is the exception when the shipped Way 2 selects the embedding strategy: its strategy gate derives the locality of the configured models regardless of caller, including the CLI. With remote models, it keeps a `local-only` root on the lexical floor and removes `confidential` resources from the candidates that could reach the refiner.

The model normally routes by reading the map. The lexical result supplied by the CLI or MCP serves as a deterministic floor for callers without a model and as a hint to verify when a model is present. The strongest guarantees are the ones a mechanism enforces, and which mechanism sits on the path depends on the door. The property-by-property detail is in [Mechanisms vs consignes](mecanismes-vs-consignes.md); the data boundary, in [The boundary: local by default](frontiere-local-vs-sortant.md).

## What public BASE protects

Public BASE provides local guardrails:

- path confinement within the project root;
- refusal of path traversals;
- refusal of symlinks that leave the project;
- validation of identifiers, relative links, local sources, and entrypoints;
- opening resources through `metadata`, `instructions`, or `full` projection;
- explainable access decisions for sensitive resources;
- tool invocation in dry-run by default;
- explicit confirmation before real execution;
- local JSONL traces that are best-effort and non-exhaustive, with no business content by default.

These protections make BASE auditable and maintainable for local, personal, SMB, or integration-prototype use.

For semantic routing with embeddings, see [Routing security and data](securite-donnees-routage.md), which distinguishes the shipped Way 2 from direct integration of the semantic package.

## What public BASE does not protect on its own: compliance, IAM, DLP, and archiving {#what-public-base-does-not-protect-on-its-own}

Public BASE does not provide:

- identity management;
- SSO;
- full enterprise RBAC;
- DLP;
- SIEM;
- regulatory retention;
- legal archiving;
- mandatory document classification;
- centralized secrets management;
- a full sandbox;
- a guarantee that the model's answers are accurate;
- a guarantee about the processing carried out by the AI provider;
- transparency about the instructions the AI tool injects on top of your files (system prompt, rules, provider policies).

These belong to the organization, its technical environment, and its contracts with providers.

**External security review: planned, not yet done.** The core is designed for auditing (no dependencies, with mechanisms tested and documented), but BASE has not yet undergone an independent security review.

## Data and AI providers

BASE keeps your files local. That does not mean everything you give an AI tool stays local.

Depending on the tool used, the content of a conversation, an open file, or a prompt may be transmitted to the model provider. Before processing personal, customer, HR, financial, medical, or regulated data, check:

- the AI tool's terms of use;
- the retention options;
- the contractual guarantees;
- where the processing takes place;
- your organization's internal rules.

For highly sensitive data, turn to a suitable environment or keep the AI out of the loop.

## Reading by adoption level

| Level | Reasonable expectation | What you still have to add |
| ------ | ------------------- | ---------------------- |
| Personal | Readable files, human decisions, caution with sensitive data | Choosing what you trust the AI tool with |
| SMB | Local validation, upkeep, sensitivity conventions, best-effort trace clues | Team rules, human review, folder access management |
| Large enterprise | A foundation for structuring and integration | IAM, SSO, RBAC, DLP, SIEM, retention, secrets, audit, compliance |

## Typical threats

| Risk | Public BASE response | Limit |
| ------ | ------------------- | ------ |
| Malicious path | Local confinement and refusal of traversals | Only for mediated access |
| Outbound symlink | Refusal of symlinks outside the project | Depends on the connector used |
| Sensitive data opened for no reason | Metadata and explainable access decision | Does not block direct access outside BASE |
| Irreversible action | Dry-run by default and confirmation | Does not protect actions outside the broker |
| False but plausible answer | Decision points, markers, human verification | The model can always be wrong |
| Prompt injection via external data | Design principle: an instruction is intended for the model, while external data remains content to examine | This textual separation remains fallible; it requires technical controls suited to the execution path |
| Invisible instructions from the AI tool | Sovereignty over your layer: readable, portable, auditable files | BASE cannot see what the harness injects on top of your files |

The `sensitivity` taxonomy advises caution and can require write confirmation. It does not block egress on its own. On mediated paths, withholding depends on the `confidential` flag or a root declared `local-only`.

## Responsibility rule

BASE helps you structure and verify; its operational trace remains best-effort and non-exhaustive. The human keeps responsibility for the decisions; the organization keeps responsibility for security, compliance, and access.

So the right promise is:

```text
BASE increases local control.
BASE does not replace a security policy.
```

## Compliant does not mean useful

Being in order and being useful are two distinct requirements. Compliance (a register of processing activities, an impact assessment, and depending on the jurisdiction the GDPR, the Swiss nFADP, or the European AI Act) governs what you are allowed to do with AI. It does not, however, make the work useful or verifiable: ticking the boxes of a regulatory framework does not structure the interaction, does not target the relevant information, and does not close the verification loop. That is precisely what BASE adds, alongside compliance and never in its place. This pointer is informational and does not constitute compliance advice.
