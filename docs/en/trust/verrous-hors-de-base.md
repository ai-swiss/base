<!-- fr-synced: 80045783cdb3df07ee5f26cddd576d16e302c142 -->
# Locks outside BASE

A red line written in a process is an instruction. BASE applies its own mechanisms on the paths that go through it ([Mechanisms vs instructions](mecanismes-vs-consignes.md)). This page gathers what holds elsewhere: in the operating system, in the AI tool, in the systems the assistant touches. The level to aim for depends on what a single mistake would cost.

## From the strongest to the weakest

1. **Information out of reach.** A code or an IBAN that the assistant cannot reach by any path (the folder, the rest of the disk, a connector, an environment variable, the tool's memory) can neither leak nor be changed through it. This lock protects the data; it bounds no action.
2. **The control in the external system.** The bank requires two signatures, the mail account can only write drafts, the database user has read access only. The assistant can try anything: the other system refuses. This level holds as long as the access given to the assistant is itself limited, and a two-signature rule as long as the second person really reviews.
3. **The operating system sandbox.** The system refuses a forbidden write or connection, whatever command attempts it.
4. **The AI tool's permissions.** They govern its built-in tools (read, write, web search). Without a sandbox, a command gets around them: a small script writes where the write tool is denied.
5. **The instruction.** What the model is asked to do. It is enough when a mistake costs little.

## Remove one of the three conditions

An assistant that combines private data, untrusted content (an email, a web page, a received document) and a way to communicate outward can be led, by an instruction hidden in that content, to send the data to a third party. No instruction prevents this reliably. Remove one of the three conditions: no sensitive data within the assistant's reach, no external content submitted to the model (a human review does not see hidden text), or no way to communicate outward (network, connector, sending, synced folder, link or image rendered in the answer). A hidden instruction can still cause a misleading change or action: the locks above remain necessary.

## What to configure in the tool

When a tool offers a sandbox, it usually covers the commands it runs, not its own read and write tools. In Claude Code, for example, the sandbox wraps commands while file editing follows permissions: a solid lock configures both. Then:

- **Paths**: those the assistant must never modify, and those it must not read.
- **Network**: a list of allowed destinations that starts empty.
- **Escape hatches**: no command retried outside the sandbox, no start without it when it cannot be enabled, no mode that skips confirmations.
- **The configuration itself**: enforced at launch or by the organisation, so that a file in the folder cannot loosen it.

Without a sandbox, permissions hold for the built-in tools and a command gets around them: what remains is information out of reach (off the machine, or in an account the tool does not read) and the control in the external system. To isolate the whole job, a disposable container or a virtual machine without your credentials is the cleanest option.

## What a sandbox does not cover

- The tool's extensions (connector servers, scripts triggered automatically) often run outside the sandbox: each one opens another door.
- An allowed network destination remains an exit channel. An empty list beats a broad one.
- Secrets placed in environment variables follow the commands. Keep them out of the session.
- Someone can launch the tool without its settings. For a team, enforce them through the organisation's configuration.

## The safety nets that remain

- **Least-privilege access.** An access token limited to what the assistant does, short-lived and with a spending cap. Read access to exports rather than to the production database.
- **Reversibility.** A versioned folder, backups, a protected branch: a change can be undone. Data that has left, or a message already sent, cannot.
- **The trace.** A log of actions, kept by the system rather than by the model.

## Trying a lock

A lock you have never seen refuse counts as an instruction. Try each lock once, on a harmless target (a test file, a dummy account), through several paths: the built-in write tool, a script, a file copy, a network request. Note the refusal you observed, and try again after a tool update. A refusal closes the path you tried; it does not prove that no other exists.

## Next step

List your assistant's red lines, note for each what a single mistake would cost, then choose the highest level you can reach. The "Create an agent" process draws up this table with you when configuring the tool.
