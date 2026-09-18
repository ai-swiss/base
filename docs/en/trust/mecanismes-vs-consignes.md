<!-- fr-synced: c938d8a0ed32b3f45e1444d1508d9d4437a29023 -->
# Mechanisms vs consignes

## Why this distinction is at the heart of trustworthy AI governance

In most AI tools, a safety rule is nothing more than a sentence addressed to the model, something like "don't touch this file" or "never send this data to a remote service." It holds as long as the model cooperates, and gives way the moment the model gets it wrong, is hijacked, or an action bypasses the intended path. A rule like that is a *consigne*, not a guarantee.

The [glossary](../reference/glossaire.md) defines the distinction between a mechanism and a *consigne*. Here it applies property by property: scope is part of the guarantee. A broker control applies only to an action that goes through its entry point. A test gate applies only to the surfaces and criteria it covers. Outside that scope, the property is not guaranteed by that mechanism.

## A file's two worlds

There is nothing abstract about this boundary: it is written into the very structure of a BASE file, whose two parts each speak to a different world.

- A resource's **structured header** (the frontmatter: identity, scope, sensitivity, and the `confidential` flag) can be read by **tested code**. On mediated paths, the broker uses it to decide and enforce: confine access, withhold confidential data, and mediate a write. The root-wide `egress: local-only` policy lives in `base.config.json`, not in resource frontmatter. Those properties are **mechanisms** within their scope.
- The **text body** (the method, the know-how, the domain instructions) is read by the **AI**. It steers a cooperative model without constraining anything. This is the world of **consignes**, useful and fallible.

The same file thus links your expertise to the code. Metadata is not a mechanism merely because it is present: it becomes one for a precise property when tested code enforces it within a named scope.

## Property table

| Property | Scope of the mechanism | Outside that scope |
| --- | --- | --- |
| **Path confinement and refusal of symlink escape** (`tools/core/confine.mjs`) | When the read or write goes through the broker: any path outside the allowed root is refused, as is a symlink resolution that would leave that root. | When the model reads or writes through a direct harness tool, outside the broker: confinement remains an intention, nothing prevents access. |
| **Propose then commit, mediated and atomic writes** | When the write goes through the broker: the change is first proposed, then validated, then applied atomically and through mediation, which makes room for review before any effect. | When the write takes a direct tool: it is immediate and unmediated, with no proposal step and no atomicity guaranteed by BASE. |
| **Capabilities run in dry-run by default** | When a capability is run by the broker: it is simulated by default, and its real effect requires an explicit request. | When the model triggers an equivalent action outside the broker: nothing imposes dry-run, and the effect can be immediate. |
| **Routing and abstention** | The normal model path is to read the map and decide or abstain: that conduct remains a consigne. For callers without a model and for tests, the lexical router provides a deterministic floor that can return `out_of_scope`, `ambiguous`, or `needs_clarification`; code enforces this behavior and tests protect it. | A model can misread the map or guess. When a model is present, the lexical result is only a hint to verify. |
| **Egress control before the call** | The MCP server, Studio chat, and evaluation pass an egress context to the broker. The shipped Way 2 also applies its strategy gate regardless of caller, including `base route`: with remote models, a `local-only` root stays on the lexical floor and `confidential` resources are removed from the candidates that could reach the refiner. | A direct read, `base open` without an egress context, or copy-paste into an AI tool does not go through these controls. The default policy remains permissive for everything else. |
| **MCP read-only by default over HTTP** (bearer token option) | Over HTTP, write and execute tools are not registered by default. Local `stdio` exposes mediated `propose` then `commit` writes unless read-only mode is enabled. | Another server or direct access does not inherit these rules. Over `stdio`, "by default" does not mean read-only. |
| **Storing environment variable names, not raw keys** | When settings go through the broker: they record the NAME of the environment variable, not the value of the API key, which stays out of the file. | When the model writes a configuration some other way: nothing prevents writing a key in plaintext. |
| **Local trace log** (`.ai/trace`) | Instrumented points attempt to write a local trace that may contain paths and identifiers, but no business content by default. Writing is best-effort, and its failure does not interrupt the work. | The log is non-exhaustive: an action outside the broker, an uninstrumented point, or a write failure may leave no line. Absence therefore does not prove that no action occurred. |

## Closing note

Outside the broker's path, its controls fall back to the harness's native level. Metadata and consignes remain useful as guidance and signals for a cooperative model, but direct access to the shell, file system, or an external API escapes those controls. The full guarantee → function → test table is in [Verified mechanisms](mecanismes-verifies.md). Two measurement notes: the **session** journal (`.ai/journal/`, written by the agent at the end of a process) is an instruction, useful and fallible, distinct from the best-effort operational trace above; and tests freeze the **presence** of an instruction on projected surfaces, while the model's **obedience** remains a consigne followed with a margin of error and is measured today only for routing.

A reminder on scope: BASE is not an agent runtime, an orchestration engine, a RAG setup, a platform, or an IAM, DLP, SIEM, or RBAC system, nor a mechanism for retention or legal archiving. Nor does it guarantee the accuracy of a model's outputs. The choice of the model itself remains external to BASE.

This page is informational: it constitutes neither a compliance certification nor legal or security advice. An institution remains responsible for its own impact assessment (DPIA) and its own security policy.
