<!-- fr-synced: f2998e607113b1b51703841c7c773c2eacd933fa -->
# Try BASE without installing BASE

Before handing a real folder to an AI, try BASE on an example whose answer you can check. This page offers two paths with nothing to install on the BASE side. A single AI tool is all you need: the one you already use.

Both ways show the same example: the prefilled quote assistant, with a question that calls for checking rather than guessing.

## The simplest way: an AI chat in the browser

If you already have an AI tool in a browser, such as ChatGPT or Claude, there is nothing to install. The goal here is to see how a BASE assistant is built, and how it behaves. The pack gathers the assistant's role, processes, and conventions into a single document.

1. Download the example's ready-to-paste pack: **[assistant-devis-demo.pack.md](https://github.com/ai-swiss/base/releases/latest/download/assistant-devis-demo.pack.md)**.
2. Open it in a text editor to observe its structure, then attach it to a new conversation. If your tool cannot attach a file, paste its contents.
3. Ask the question: "What must you have me validate before creating or changing a quote?"

Check that the reply separates what the assistant can prepare from what you must decide. The loyalty discount, for its part, crosses two sources absent from the pack, a pricing rule and a client record: it is tested further down, in a tool that opens the folder.

A web chat maintains no folder structured by BASE on your computer. The files give it the context of this conversation, but the corrections do not come back into your folder automatically. To generate a pack from the project root: `npm run browser-pack -- --root exemples/assistant-devis-demo --out assistant-devis-demo.pack.md`.

## The fullest way: an AI tool that opens the folder

To read the files separately and keep your changes in the folder, use an AI tool able to open a folder, for example Claude Code, Codex, Cursor, GitHub Copilot, or OpenCode. Some run in a window, others in the terminal. BASE favors none of them.

1. Install the tool you chose from its official site and sign in. The available models, their costs, and their limits depend on that tool.
2. Download the BASE project in one click, **[base.zip](https://github.com/ai-swiss/base/releases/latest/download/base.zip)** (the latest published version), then unzip it (Windows: right-click the file, **Extract All**, a double-click is not enough; Mac: double-click). You get a folder named **`base`**.
3. Open the folder **`base/exemples/assistant-devis-demo`** in it (often *File → Open Folder*), in **Agent mode** so it reads the files.
4. Ask it to read the instructions, then to present the folder structure and the role of the main files to you.
5. Ask the question that calls for checking: "Is Dupont SA entitled to the loyalty discount?" This is a trick question: the record says "Client (1er mandat)," while the loyalty rule requires two contracts. The expected answer is "no." Check the conclusion, the two cited sources, and the `[A VALIDER]` marker; carry on with the [step-by-step tutorial](../tutoriel/index.md).

> If the assistant talks to you about "routing" or "BASE" instead of the quote, you have probably opened the `base` root, which contains the framework itself. Reopen the `exemples/assistant-devis-demo` subfolder.

## Your own folder

To start from your data: copy `base/exemples/starter-perso` wherever you like (your Documents), rename it, then reopen that folder in your tool. Or ask your AI tool: "Copy the starter-perso folder to my Documents." To create your own quote assistant from a template to customize, copy `exemples/assistant-devis` instead and say: "Set up my business."

## What this trial does not guarantee

In this trial, the model follows the instructions in `CLAUDE.md` or the editor's rules; it can be wrong. To use BASE's mechanisms, such as model-free routing or mediated writes, go through [the letter to your AI](installer-par-votre-ia.md), then see [Install](installer.md) and [Security and limits](../trust/securite-et-limites.md). A guarantee holds only when the action passes through the component that enforces it.
