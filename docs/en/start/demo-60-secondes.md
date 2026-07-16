<!-- fr-synced: 1a983e7c25059311b6b5ddf334ecc9bc5989704c -->
# See BASE in action

Before handing a real folder to an AI, watch how it behaves on a case you can check. This demo shows, in under a minute, a BASE assistant that consults two files, cites the rule it applies, and marks `[A VALIDER]` instead of treating the decision as settled.

This demo draws on `exemples/assistant-devis-demo/`, already stocked with a fictional company, a service catalog, a client, and a quote.

Don't have the repository on hand yet? [Try it without installing anything](essayer-sans-installer.md) shows the simplest ways to try, on this same example; come back here once you have the repository.

## 1. Open the demo

In an AI tool that can read your files, open this specific folder, not the root of the repository:

```text
exemples/assistant-devis-demo/
```

Before asking the question, ask the tool to read the instructions, then to present the folder structure and the role of the main files to you.

## 2. Ask a question that requires checking

In the chat, type:

```text
Dupont SA a-t-il droit à la remise fidélité?
```

This is a trick question. Dupont SA's record says "Client (1er mandat)," while the loyalty rule requires two contracts. Without these two pieces of information, a model has no basis on which to decide.

## 3. Read the reply

The assistant should consult two of your files and answer in this spirit:

> According to `catalogue/regles-tarification.md`, the loyalty discount (-5%) applies to clients who have already signed two contracts. The file `clients/dupont-sa.md` says "Client (1er mandat)." So Dupont SA is not yet entitled to it. **[A VALIDER]** confirm the client's status before applying a discount.

Check what just happened: the reply draws on the two expected files, lays out the reasoning, and leaves the validation visible. This result does not prove that every future reply will be correct; it shows a method you can inspect.

## What you just saw

- **The sources are visible.** The reply cites `regles-tarification.md` and `dupont-sa.md`.
- **The conclusion can be checked.** You can reread the rule and verify the client's status.
- **The decision stays findable.** The `[A VALIDER]` marker turns up with a simple search.
- **The calculations can leave the model.** The `calculer-devis` tool recomputes the VAT and totals with code; the assistant can then flag a discrepancy.
- **The demo writes nothing.** No file is changed and no quote is sent to the client. The AI tool does, however, process the conversation and the files under its own terms.

## The second round: an instruction and a mechanism are not equivalent

The first round shows a readable method. The second shows a protection enforced by code. Mark a resource `confidential: true` (for example a discount grid) and have the assistant work **through the broker** (MCP server or Studio chat): before a remote call, BASE holds back that resource and replaces it with a notice. This protection does not depend on the model's good will; it is tested in `tools/core/egress.mjs` and `tests/base-egress.test.mjs`.

The scope is precise: this hold operates **through the broker** (MCP, Studio, evaluation). In a direct editor agent, asking for the same confinement stays an instruction. The example `exemples/agence-multi-clients/` shows how to separate several client folders. When the action passes through the broker, each assistant stays within its root and confidential resources are held back before the remote call.

## Going further

- **See a finished document:** ask "Show me quote DEV-2026-001." It already exists in `devis/DEV-2026-001.md`.
- **Create your own:** copy `exemples/assistant-devis/`, then say: "Hello, I'd like to set up my business." This template contains the structure to customize and guides you step by step.
- **Know what to read next:** follow [Where to start](lire-dans-quel-ordre.md).
