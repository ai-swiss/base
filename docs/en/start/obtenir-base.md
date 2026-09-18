<!-- fr-synced: f96aa910032d1a8c88a50669f2f0cd2ebba7c565 -->
# Getting BASE: choosing your installation path

How you get BASE decides what you can do with it next: just try out an assistant, start from your own data, or follow updates and contribute. The options below are **independent**, not steps to run in sequence: read them, then keep the one that matches your need. To try an assistant, the ZIP or a copied example is enough; the Git clone becomes useful the moment you want to follow updates or contribute.

> **Fastest, and no terminal on your side:** let your AI tool do it. Paste a single block into an AI tool that can read your files and it installs BASE, creates your workspace, and tells you when it's ready. See [Have your AI install BASE](installer-par-votre-ia.md).

> **Have you just pointed your AI tool at the repository?** Tell it "apply BASE to my folder." From your working folder, it first runs `node <BASE_DIR>/tools/base.mjs init` to preview the intended files without writing and collect your choices. After your approval, a second invocation with `--yes` initializes the folder using your answers; the initial preview is not guaranteed to remain identical. The folder launcher is then `node .ai/base.mjs`; neither path installs the short `base` command. The tool subsequently proposes each conversion as a diff and waits for your approval before applying it. The [AI-led installation guide](installer-par-votre-ia.md) gives the complete commands when the BASE folder and your working folder are separate.

## 1. Without installing anything (browser only)

If you just want to put the method to the test in ChatGPT or Claude, with no technical tool, follow [Try BASE without installing anything](essayer-sans-installer.md). It's the minimum tier: instructions the model merely follows, without the mechanical guarantees of the tiers that follow.

## 2. Download the repository as a ZIP (the simplest)

1. Open the project page on GitHub: `https://github.com/ai-swiss/base`.
2. Green **Code** button, then **Download ZIP**.
3. Unzip the folder.
4. Open an **example** folder (for example `exemples/assistant-devis-demo/`) in an AI tool that can read your files, not the root of the repository.

Each example is self-contained: it's a complete assistant that you open in your AI tool to make your request.

To use the CLI from the archive, install [Node 18 or later](https://nodejs.org), open a terminal, check that `node --version` works in your `PATH`, then run `node <BASE_DIR>/tools/base.mjs <command>`, where `<BASE_DIR>` is the extracted folder. The archive does not install the short `base` command in your `PATH`.

## 3. Copy a single example

You don't need the whole repository. Each folder under `exemples/` is self-contained and can be copied anywhere. To start from your own data, copy the example closest to your work, rename it, then replace its content.

## 4. Clone with Git (to follow updates)

```bash
git clone https://github.com/ai-swiss/base.git
cd base
```

You can then open an example in your AI tool or use the local CLI described in the [installation guide](installer.md). For the CLI, install [Node 18 or later](https://nodejs.org), open a terminal, check that `node --version` works in your `PATH`, then run `node <BASE_DIR>/tools/base.mjs <command>`, where `<BASE_DIR>` is the clone. The clone does not install the short `base` command in your `PATH`; see [`README.fr.md`](../../../README.fr.md) for the authoritative commands.

## 5. Browser pack (a single file to paste)

For someone who has only a browser, you can prepare **a single Markdown file** that brings together an agent and all its skills, ready to paste into ChatGPT or Claude web. From the repository (Node required to generate, not to use):

```bash
npm run browser-pack -- --root exemples/assistant-devis-demo --out assistant-devis.md
```

Share `assistant-devis.md`: the person pastes it into their conversation, then writes "Hello, I'd like to set up my business." In browser mode, the model only follows these instructions: it doesn't offer the mechanical guarantees of the CLI or the MCP (see [Try BASE without installing anything](essayer-sans-installer.md)).

## 6. npm distribution and Releases

Every published version carries its files on the GitHub **Releases** page: the stable-name source archive ([base.zip](https://github.com/ai-swiss/base/releases/latest/download/base.zip), always the latest published version) and the browser packs of the flagship examples. A published version number identifies a dated, frozen state, not the moving head of a branch. Distribution via npm packages (`@ai-swiss/base` and the optional packages) will come as the public surface stabilizes (see [Versions and stability](../reference/versions-et-stabilite.md)); until then, the Release, the example copy, and the Git clone above remain the official paths.

## What's next?

**Next action:** choose one of options 1 to 4 above and complete its first step; to begin without installing anything, open [Try BASE without installing BASE](essayer-sans-installer.md).
