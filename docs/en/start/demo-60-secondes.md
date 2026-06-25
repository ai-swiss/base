<!-- fr-synced: a2ceba8213fa64543dce6cda779153a8cb7c5f05 -->
# See BASE in action

Before handing a real case to an AI, you want to know whether you can trust it. This demo shows it in under a minute: a BASE assistant that draws on your files, names the rule that justifies it, and flags a `[A VALIDER]` rather than deciding on its own, where a generic chat would tend to improvise. Then it is up to you to judge whether that honesty changes anything for your work.

This demo uses `exemples/assistant-devis-demo/`, already filled with a fictional company, a service catalog, a client, and a quote.

Don't have the repository on hand yet? [Try it without installing anything](essayer-sans-installer.md) shows the simplest paths to grab the folder and hand it to your AI, from the lightest option to the most complete.

## 1. Open the demo

In an AI tool that can read your files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code), open the folder (this folder, not the root of the repository):

```text
exemples/assistant-devis-demo/
```

## 2. Ask a question that requires checking

In the chat, type:

```text
Dupont SA a-t-il droit à la remise fidélité?
```

This is a trick question. Dupont SA's file says "Client (1er mandat)," while the loyalty rule requires two contracts. A generic chat, which knows neither your client nor your rules, may invent a plausible answer.

## 3. Read the reply

The assistant should go read two of your files and answer in this spirit:

> According to `catalogue/regles-tarification.md`, the loyalty discount (-5%) applies to clients who have already signed two contracts. The file `clients/dupont-sa.md` says "Client (1er mandat)." So Dupont SA is not yet entitled to it. **[A VALIDER]** confirm the client's status before applying a discount.

Three things just happened. The assistant read your files instead of guessing. It told you the truth, even when disappointing, rather than an accommodating "yes." And it handed the decision back to you with a searchable marker.

## What you just saw

- **It reads your reality.** The reply cites `regles-tarification.md` and `dupont-sa.md`, your files, not a generic memory.
- **It doesn't flatter.** When the honest answer is "no," it says "no" and shows the rule that justifies it.
- **It stops at the right moment.** The `[A VALIDER]` leaves the decision to you and stays findable with a single search, even six months from now.
- **It proves rather than promises.** On a quote, the amounts are not "roughly right": the `calculer-devis` tool recomputes the VAT and totals deterministically, and the assistant flags a discrepancy instead of asserting it.
- **Nothing moved.** No file written, nothing sent by BASE (your AI tool, for its part, processes the conversation under its own terms). You stay in control.

## The second round: what a generic chat cannot do

The first round showed honesty. The second shows a guarantee that a model's good will cannot provide. Mark a resource `confidential` (for example a discount grid) and have the assistant work **through the broker** (MCP server or Studio chat): if it has to call a remote model, BASE **checks before sending** and holds back that resource. It does not leave. This is not a *consigne* the model could forget, it is a **mechanism**, verified by tested code (`tools/core/egress.mjs`, `tests/base-egress.test.mjs`).

The scope is precise: this hold operates **through the broker** (MCP, Studio, evaluation); in a direct editor agent, the same confinement is only a consigne. The example `exemples/agence-multi-clients/` shows the scale: one agency, several clients, each assistant confined to its root, the confidential grid consulted to set the price without ever being copied into the offer.

## Going further

- **See a finished document:** ask "Show me quote DEV-2026-001." It already exists in `devis/DEV-2026-001.md`.
- **Create your own:** copy `exemples/assistant-devis/`, then say "Hello, I'd like to set up my business." This version starts empty and guides you.
- **Know what to read next:** follow [Where to start](lire-dans-quel-ordre.md).
