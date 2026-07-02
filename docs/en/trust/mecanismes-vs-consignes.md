<!-- fr-synced: a8eea22718e978a73451232f1f7166b892cbfde9 -->
# Mechanisms vs consignes

## Why this distinction is at the heart of trustworthy AI governance

In most AI tools, a safety rule is nothing more than a sentence addressed to the model, something like "don't touch this file" or "never send this data to a remote service." It holds as long as the model cooperates, and gives way the moment the model gets it wrong, is hijacked, or an action bypasses the intended path. A rule like that is a *consigne*, not a guarantee.

BASE distinguishes two levels, and that distinction is the basis of its honesty:

- a **mechanism** is enforced by the broker (the `base` CLI, the core in `tools/`, or the MCP server when it delegates to the broker). It steps in before or during the action, which it can block, mediate, or refuse. It does not rest on the model's goodwill.
- a *consigne* is an instruction set down in the metadata or the context. It steers a cooperative model and serves as an audit signal, without constraining anything mechanically. A consigne is not code that runs, even if a model sometimes follows it faithfully enough to create the illusion: there is always a margin of error, varying by domain. A rule that has to be strict is never entrusted to a model; it demands a mechanism.

The condition that flips a property from consigne to mechanism is always the same: **the action goes through the broker's path** (CLI, core, or MCP delegating to the broker). Let it take another path (direct access to the shell, the file system, or an external API, without going through BASE), and the same property falls back to a mere consigne.

## A file's two worlds

There is nothing abstract about this boundary: it is written into the very structure of a BASE file, whose two parts each speak to a different world.

- The **structured header** (the frontmatter: identity, scope, sensitivity, egress policy) is read by **tested code**. The broker uses it to decide and to enforce: confine an access, hold back confidential data, mediate a write. This is the world of **mechanisms**, which do not rest on the model's goodwill.
- The **text body** (the method, the know-how, the domain instructions) is read by the **AI**. It steers a cooperative model without constraining anything. This is the world of **consignes**, useful and fallible.

The same file thus links your expertise to the code: what must be guaranteed lives in the header the broker enforces; what is a matter of judgment lives in the text the AI follows. A property becomes a mechanism only when the action goes through the broker, where that header is read.

## Property table

| Property | Enforced by the broker (mechanism) | Only a consigne (the model's goodwill) |
| --- | --- | --- |
| **Path confinement and refusal of symlink escape** (`tools/core/confine.mjs`) | When the read or write goes through the broker: any path outside the allowed root is refused, as is a symlink resolution that would leave that root. | When the model reads or writes through a direct harness tool, outside the broker: confinement remains an intention, nothing prevents access. |
| **Propose then commit, mediated and atomic writes** | When the write goes through the broker: the change is first proposed, then validated, then applied atomically and through mediation, which makes room for review before any effect. | When the write takes a direct tool: it is immediate and unmediated, with no proposal step and no atomicity guaranteed by BASE. |
| **Capabilities run in dry-run by default** | When a capability is run by the broker: it is simulated by default, and its real effect requires an explicit request. | When the model triggers an equivalent action outside the broker: nothing imposes dry-run, and the effect can be immediate. |
| **Routing abstention rather than false certainty** | When routing goes through BASE's router: it can return `out_of_scope`, `ambiguous`, or `needs_clarification` rather than imposing a default agent. | When the model picks an agent itself without calling the router: nothing guarantees abstention, and it can guess. |
| **Egress control before the call** (the control lets traffic through by default, but blocks upstream the sending of a confidential resource, or one marked local-only, to a remote model, when the call goes through the broker) | When the call goes through the broker (MCP server, Studio chat, evaluation): the check precedes the send, and dispatching a confidential resource or a local-only root to a remote model is blocked upstream. | When the call to a remote model is made outside the broker (for example, directly on the command line, or in an AI tool outside BASE): no prior check takes place, and the data can leave. |
| **MCP read-only by default** (bearer token option) | When access goes through BASE's MCP server: it is read-only by default over HTTP, writing requires an explicit activation, and it can be protected by a bearer token. | When one turns to another server or a direct access: neither read-only by default nor the token applies. |
| **Storing environment variable names, not raw keys** | When settings go through the broker: they record the NAME of the environment variable, not the value of the API key, which stays out of the file. | When the model writes a configuration some other way: nothing prevents writing a key in plaintext. |
| **Local trace log** (`.ai/trace`) | When the operation is mediated by the broker: it is logged locally in the trace log, which provides an audit trail. | When the action bypasses the broker: it does not appear in the log, and the audit stays blind to that operation. |

## Closing note

Outside the broker's path, everything falls back to the harness's native level. Metadata and consignes keep their usefulness as a guide and as a signal for a cooperative model, but they constrain nothing: direct access to the shell, the file system, or an external API escapes these properties. The practical rule fits in one sentence: a guarantee is real only if the action goes through the `base` CLI, through the core, or through the MCP delegating to the broker.

A reminder on scope: BASE is not an agent runtime, an orchestration engine, a RAG setup, a platform, or an IAM, DLP, SIEM, or RBAC system, nor a mechanism for retention or legal archiving. Nor does it guarantee the accuracy of a model's outputs. The choice of the model itself remains external to BASE.

This page is informational: it constitutes neither a compliance certification nor legal or security advice. An institution remains responsible for its own impact assessment (DPIA) and its own security policy.
