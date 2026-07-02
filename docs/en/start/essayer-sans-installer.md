<!-- fr-synced: caba3fef5448926764ca2ec75af4444e48c35b72 -->
# Try BASE without installing anything new

The fastest way to grasp BASE is not to install it, it's to read it: [Why BASE](../learn/co-penser-avec-lia.md) shows its method and its depth in a few minutes. When you want to see it at work, this page offers two ways to try a genuine assistant without installing anything on the BASE side. A single AI tool is all you need: the one you already use.

Both ways show the same example: the Veytaux tourist office, a textbook case.

## The simplest way: an AI chat in the browser

If you already have an AI assistant in a browser (ChatGPT, Claude, or another), there's nothing to install: a BASE assistant is a set of text files that structures your collaboration (know-how, knowledge, data); it is not mere documentation, and it is what you give as context.

1. Download the example's ready-to-paste pack: **[veytaux-tourisme.pack.md](https://github.com/ai-swiss/base/releases/latest/download/veytaux-tourisme.pack.md)**. The whole assistant fits in this single file: nothing to hunt for in hidden folders.
2. Open it with a text editor (Notepad, TextEdit), copy everything, and paste it into a new conversation. Better, if your tool allows it: create a space that keeps this context (a Project, a custom assistant).
3. Address it directly: "Hello, what activities are you offering this afternoon?"

The one thing to remember: a web chat doesn't browse a folder on its own, you hand it the pack once and for all. This is the most accessible path for seeing the method in action. Every example can have its own pack: `npm run browser-pack` generates one from any BASE folder.

## The fullest way: an AI tool that opens the folder

For the assistant to work from the inside, reading the whole folder and acting under your watch, you need an AI tool able to open a folder and read its files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code; some run in a window, others in the terminal, like [Claude Code](installer-claude-code.md)). Choose the one you're already comfortable with.

1. Install it from its official site and sign in; a free model is enough to try it out.
2. Download all of BASE in one click, **[base.zip](https://github.com/ai-swiss/base/releases/latest/download/base.zip)** (the latest published version), then unzip it (Windows: right-click the file, **Extract All**, a double-click is not enough; Mac: double-click). You get a folder named **`base`**.
3. Open the folder **`base/exemples/veytaux-tourisme`** in it (often *File → Open Folder*), in **Agent mode** so it reads the files.
4. Ask "What activities are you offering this afternoon?". The assistant follows the method described in the files; carry on with the [step-by-step tutorial](../tutoriel/index.md).

> **Common snag**: if the assistant talks to you about "routing" or "BASE" instead of Veytaux, you've opened the `base` root, which is the framework. Reopen the `exemples/veytaux-tourisme` subfolder.

## Your own folder

To start from YOUR data: copy `base/exemples/starter-perso` wherever you like (your
Documents), rename it, then reopen THAT folder in your tool. Or ask your assistant:
"copy the starter-perso folder to my Documents".

## The honest ceiling, and the next step

Here, it's the **model** that routes by following consignes (`CLAUDE.md`,
`.cursor/rules/assistant.mdc`): handy, but it can overstep. For **mechanical
guarantees** (deterministic routing, validated writes, confinement), go through
[the letter to your AI](installer-par-votre-ia.md) (5 minutes), or see
[Install](installer.md) and [Security and limits](../trust/securite-et-limites.md) for the
boundary between *consigne* (followed) and *mechanism* (enforced).
