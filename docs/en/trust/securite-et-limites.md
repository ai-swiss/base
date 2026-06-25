<!-- fr-synced: 36c0c73d58c62decee49a18db64187d87a227d13 -->
# Security and limits

Before you trust BASE with data or actions, you need to know what the local core actually protects and what you still have to add for your context: trust it too much and you expose what you assumed was covered. Whether you are deciding for yourself or for a public administration, here is the boundary. BASE improves your control over human-AI collaboration, but it does not turn a general-purpose AI tool into an enterprise-grade security environment.

## Core principle

A guarantee is real only if the action passes through a mechanism able to enforce it.

In public BASE, those mechanisms are:

- the `base` CLI;
- the broker in `tools/base-core.mjs`;
- the MCP server when it delegates to the broker;
- a future controlled connector.

If an agent has direct access to the shell, the filesystem, or an external API without going through BASE, the YAML metadata remains useful as a guide and an audit signal, but it does not mechanically block the action.

**Concrete consequence, with no technical team:** in the browser alone, the guarantees are *consignes* followed by a cooperative model, not enforced mechanisms. To get real enforcement (confinement, preview before writing, validated routing), you need the broker through the CLI or MCP. The details, level by level, are in [Try BASE without installing anything](../start/essayer-sans-installer.md), useful in particular for a public administration that needs to know what is guaranteed at each level.

A process can declare that it needs to read a source or run a tool. That declaration expresses a work need. It does not grant a permission. The real rights stay with the OS, the shared folder, the Drive, the connector, the API, the token, or the harness in use.

## Actions that pass through BASE

An action passes through BASE when it uses the CLI, the broker, or the MCP server to ask BASE to act. Typical examples:

- `base open <id>` or `open_resource`: open an inventoried resource, with projection and policy;
- `base access <path>` or `access_resource`: read a file confined within the project root;
- `base invoke <tool>` or `invoke_tool`: prepare a command in dry-run, then run it only if it is confirmed;
- `base propose` then `base commit`, or `propose_change` then `commit_change`: write through a proposed, confirmed, and verified change.

In these cases, BASE can enforce confinement, `allow` / `deny` / `needs_approval` decisions, dry-run, confirmation, and a minimal trace. If the action bypasses these entry points, it depends on the native rights of the tool or the environment.

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
- minimal JSONL traces with no business content by default.

These protections make BASE auditable and maintainable for local, personal, SMB, or integration-prototype use.

For semantic routing with embeddings, see also `docs/trust/securite-donnees-routage.md`: that page
spells out which strings can leave for a provider, how to reduce exposure, and how to
log without business content.

## What public BASE does not protect on its own

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

These belong to the organization, its technical environment, and its provider contracts.

**External security review: planned, not yet done.** The core is designed for auditing (no dependencies, mechanisms tested and documented), but BASE has not yet undergone an independent security review.

## Data and AI providers

BASE keeps your files local. That does not mean everything you give an AI tool stays local.

Depending on the tool used, the content of a conversation, an open file, or a prompt may be transmitted to the model provider. Before processing personal, customer, HR, financial, medical, or regulated data, check:

- the AI tool's terms of use;
- the retention options;
- the contractual guarantees;
- where the processing takes place;
- your organization's internal rules.

For highly sensitive data, use a suitable environment or keep the AI out of the loop.

## Reading by adoption level

| Level | Reasonable expectation | What you still have to add |
| ------ | ------------------- | ---------------------- |
| Personal | Readable files, human decisions, caution with sensitive data | Choosing what you trust the AI tool with |
| SMB | Local validation, upkeep, sensitivity conventions, minimal traces | Team rules, human review, folder access management |
| Large enterprise | A foundation for structuring and integration | IAM, SSO, RBAC, DLP, SIEM, retention, secrets, audit, compliance |

## Typical threats

| Risk | Public BASE response | Limit |
| ------ | ------------------- | ------ |
| Malicious path | Local confinement and refusal of traversals | Only for mediated access |
| Outbound symlink | Refusal of symlinks outside the project | Depends on the connector used |
| Sensitive data opened for no reason | Metadata and explainable access decision | Does not block direct access outside BASE |
| Irreversible action | Dry-run by default and confirmation | Does not protect actions outside the broker |
| False but plausible answer | Decision points, markers, human verification | The model can always be wrong |
| Prompt injection via external data | Design principle (a *consigne*, not a code-enforced mechanism like confinement or the egress check): an instruction runs, external data stays content to be read | Requires discipline and technical mediation |
| Invisible instructions from the AI tool | Sovereignty over your layer: readable, portable, auditable files | BASE cannot see what the harness injects on top of your files |

## Responsibility rule

BASE helps you structure, verify, and trace. The human keeps responsibility for the decisions, and the organization keeps responsibility for security, compliance, and access.

So the right promise is:

```text
BASE increases local control.
BASE does not replace a security policy.
```

## Compliant does not mean useful

Being in order and being useful are two distinct requirements. Compliance (a register of processing activities, an impact assessment, and depending on the jurisdiction the GDPR, the Swiss nFADP, or the European AI Act) governs what you are allowed to do with AI. It does not, however, make the work useful or verifiable: ticking the boxes of a regulatory framework does not structure the interaction, does not target the relevant information, and does not close the verification loop. That is what BASE adds, alongside compliance and never in its place. This pointer is informational and does not constitute compliance advice.
