<!-- fr-synced: 5c4b8bab645ea889e7d7dc3a07130e2165464668 -->
# Getting BASE: choosing your installation path

How you get BASE decides what you can do with it next: just try out an assistant, start from your own data, or follow updates and contribute. The options below are **independent**, not steps to run in sequence: read them, then pick the one that matches your need. To simply try an assistant, the ZIP or a copied example is enough; the Git clone becomes useful if you want to follow updates or contribute.

> **Fastest, and no terminal on your side:** let your AI tool do it. Paste a single block into an AI tool that can read your files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code) and it installs BASE, creates your workspace, and tells you when it's ready: see [Have your AI install BASE](installer-par-votre-ia.md).

## 1. Without installing anything (browser only)

If you just want to experiment with the method in ChatGPT or Claude, with no technical tool, follow [Try BASE without installing anything](essayer-sans-installer.md). It's the minimum tier: *consignes* followed by the model, without the mechanical guarantees of the tiers that follow.

## 2. Download the repository as a ZIP (the simplest)

1. Open the project page on GitHub: `https://github.com/ai-swiss/base`.
2. Green **Code** button, then **Download ZIP**.
3. Unzip the folder.
4. Open an **example** folder (for example `exemples/assistant-devis-demo/`) in an AI tool that can read your files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code), not the root of the repository.

Each example is self-contained: it's a complete assistant that you open in your AI tool, then state your request.

## 3. Copy a single example

You don't need the whole repository. A folder under `exemples/` can be copied wherever you like and works on its own. This is the recommended way to start from your own data: copy the example closest to your domain, rename it, replace the content.

## 4. Clone with Git (to follow updates)

```bash
git clone https://github.com/ai-swiss/base.git
cd base
```

You can then open an example in your AI tool, or use the local CLI (team tier) described in the [installation guide](installer.md). The CLI requires no dependencies for the core (Node 18 or higher is enough); see `README.md` for the commands.

## 5. Browser pack (a single file to paste)

For someone who has only a browser, you can prepare **a single Markdown file** that bundles an agent and all its skills, ready to paste into ChatGPT or Claude web. From the repository (Node required to generate, not to use):

```bash
npm run browser-pack -- --root exemples/assistant-devis-demo --out assistant-devis.md
```

Share `assistant-devis.md`: the person pastes it into their conversation, then writes "Hello, I'd like to set up my business." In browser mode, the model simply follows these consignes: it doesn't offer the mechanical guarantees of the CLI or the MCP (see [Try BASE without installing anything](essayer-sans-installer.md)).

## 6. npm distribution and Releases

Distribution via npm packages (`@ai-swiss/base` and the optional packages) and via GitHub **Releases** archives is planned as the public surface stabilizes (see [Versions and stability](../reference/versions-et-stabilite.md)). In the meantime, the ZIP, the example copy, and the Git clone above are the official paths.

## What's next?

- First success in 5 minutes: [Quickstart](quickstart.md).
- Connect your tool (an AI tool that can read your files, for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code; or ChatGPT, Claude and the MCP): [Connect your AI tool](../guides/connecter-votre-outil.md).
- Which path for your profile: [What to read in what order](lire-dans-quel-ordre.md).
- Stuck in an example: ask for help. With the CLI, the MCP, or a harness that follows routing, BASE steers you mechanically to the configured welcome; in browser-only mode, it's a consigne followed by the model.
