<!-- fr-synced: 5d7847cb57d8c8b5808db44c06f87f260c6f625f -->
# The boundary: local by default

Knowing what stays on your machine and what may leave for a remote service is knowing what you can entrust to BASE with your eyes open. This page draws that boundary, for the use of an institution that needs to know what to expect. Its purpose is informational: it is neither legal advice nor a compliance opinion, and the institution remains responsible for its own data protection impact assessment (DPIA) and security policy.

The [glossary](../reference/glossaire.md) defines "mechanism" and *consigne*. This page applies that distinction to the boundary between local processing and remote transmission.

## 1. What is local by default

In its default configuration, the BASE core contacts no remote service. The AI tool used on top of BASE retains its own network policy.

- **The model routes by reading the local map.** This is the normal path in an AI tool: the model reads "When to use" and "Avoid if", then decides or abstains. The local lexical router provides the deterministic floor for callers without a model and for tests; when a model is present, its result is only a hint to verify.
- **BASE keeps resources locally.** The core does not call a provider on its own. An AI tool that opens these files may nevertheless transmit them under its own configuration.
- **The `.ai/trace` log is local and best-effort.** Instrumented points attempt to write a line with no domain content by default. This log is not an exhaustive trail. See the section devoted to it below.

That your files stay local does not mean that everything you then entrust to an AI tool stays local too. The content of a conversation, or of a file opened in an AI tool, may be transmitted to that tool's provider. That is the subject of the next two sections.

## 2. What can leave for an AI provider, only by explicit choice {#2-what-can-only-leave-on-explicit-choice}

Two paths can transmit text to a remote service, each under a distinct authority.

- **The shipped Way 2, if you enable it.** It may send the query and only the candidates' routing text to configured models. A custom integration of the semantic package has a broader default scope that may include resource bodies. Running locally with Ollama avoids transmission to a remote provider. [Routing security and data](securite-donnees-routage.md) gives the exact scope of both paths.
- **The call to the model itself.** The call to the language model is made by the AI tool you use (the CLI, the extension, or the application), to the provider the institution has chosen. This call takes place **outside BASE**: the choice of model and provider, like any processing on the provider's side, falls beyond BASE's scope. Before processing personal, customer, HR, financial, medical, or regulated data, check that tool's terms of use, retention options, contractual guarantees, and where the processing takes place.

## 3. Is a confidential record blocked before a remote model? `sensitivity` or `confidential` {#3-under-whose-authority}

The boundary is guarded in two places, by two distinct authorities.

- **The institution chooses the model and the provider.** This choice is external to BASE. BASE does not select a model, does not impose a provider, and does not stand in for the institution's policy.
- **The broker's egress control withholds confidential or strictly local resources before a call to a remote model.** A resource marked confidential, or a root declared local-only, is not transmitted through this path. The mechanism controls neither what the user types directly into an AI tool outside BASE, nor what the provider then does with the data it receives.

A concrete example. A customer record contains an IBAN; you mark it `confidential`. You ask your assistant, connected through the broker, to draft a payment reminder with a remote model. Before the call, the control detects the flag and withholds the record: its content is not transmitted to the provider through this path. The assistant then works without that source.

**Exact scope of the mechanism.** The MCP server, Studio chat, and evaluation pass an egress context to the broker. The shipped Way 2 adds a strategy gate regardless of caller, including from `base route`: if its models are remote, a `local-only` root stays on the lexical floor, and `confidential` resources are removed from the candidates that could reach the refiner. By contrast, a direct read, `base open` without an egress context, or copy-paste into an AI tool does not trigger this withholding. Withholding depends on a resource's **explicit `confidential` flag** or a local-only root, not on the `sensitivity` taxonomy: data classified `restricted` or `sensitive`, but not marked `confidential`, is not withheld. Finally, the **default is permissive**: unless declared otherwise, a root falls under the `any` egress policy.

In short, the institution decides where the data goes at the provider level; on mediated paths, the broker withholds an explicitly confidential or local resource before the remote-model call.

## The trace log

The `.ai/trace` log provides a local operational clue that is best-effort and non-exhaustive. It is neither a complete audit log nor proof that no activity occurred.

- **What it attempts to record.** Instrumented points may write a minimal JSONL line: paths, identifiers, decisions, durations. By default, **no domain content** is recorded.
- **What may be missing.** An action outside the broker, an uninstrumented point, or a write failure may leave no line. Trace writing never interrupts the work if it fails.
- **Where it lives.** The log is local, in the project's `.ai/trace/` folder. BASE transmits it to no remote service, and that folder is ignored by git.
- **How to purge it.** You can empty the log with `base trace clear`, keep only the last N days with `base trace prune --keep-days N`, or, as a last resort, delete the `.ai/trace/` folder by hand.

Retention of this log does not fall to BASE. It rests with the operator or the institution: setting its retention period, the purge, and, where applicable, archiving fall under your internal policy. BASE provides neither regulatory retention nor legal archiving.

## Limits to keep in mind

- BASE is not an agent runtime, not an orchestration engine, not a RAG system, not a platform, and not an IAM, DLP, SIEM, or RBAC. It provides neither regulatory retention nor legal archiving.
- BASE does not guarantee the accuracy of the model's answers, nor the processing carried out by the AI provider.
- The egress and confinement mechanisms apply to actions mediated by the broker. An action that bypasses BASE depends on the native rights of the tool and the environment.

For the full security model and the limits by adoption level, see [Security and limits](securite-et-limites.md). For the details of the strings sent during semantic routing, see [Routing security and data](securite-donnees-routage.md).
