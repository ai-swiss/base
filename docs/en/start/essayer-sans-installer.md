<!-- fr-synced: ca9a05b8a4f5f34ad21f5041f5993e7265ce8ec9 -->
# Try BASE without installing anything new

The fastest way to grasp BASE is not to install it, it's to read it: [Why BASE](../learn/co-penser-avec-lia.md) shows its method and its depth in a few minutes. When you want to see it work, this page gives two ways to try a real assistant without installing anything on the BASE side. All you need is an AI tool, the one you already use.

Both start from the same example folder. Download the repository in one click, **[base-main.zip](https://github.com/ai-swiss/base/archive/refs/heads/main.zip)**, then unzip it (Windows: right-click the file, **Extract All**, a double-click is not enough; Mac: double-click). You get a folder named **`base-main`**; the example to open is **`base-main/exemples/veytaux-tourisme`**, the Veytaux tourist office, a toy project.

## The simplest way: an AI chat in the browser

If you already have an AI assistant in a browser (ChatGPT, Claude, or another), there's nothing to install: a BASE assistant is a set of text files that structures your collaboration (know-how, knowledge, data), not mere documentation, and that you give it as context.

1. In the `veytaux-tourisme` folder, find the Markdown files: the `AGENT.md` (under `.ai/agents/...`) and the ones in `skills/`.
2. In your tool, create a space that keeps these files on hand throughout the conversation (depending on the tool: a Project, a custom assistant, a workspace).
3. Paste the contents of the `AGENT.md` into the instructions, and attach the other Markdown files.
4. Talk to it: "Hello, I'd like to set up my business."

The one thing to know: a web chat doesn't browse a folder on its own, you give it the files once. This is the most accessible path for seeing the method in action.

## The fullest way: an AI tool that opens the folder

For the assistant to work from the inside, reading the whole folder and acting under your watch, you need an AI tool able to open a folder and read its files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code; some run in a window, others in the terminal, like [Claude Code](installer-claude-code.md)). Pick the one you're already comfortable with.

1. Install it from its official site and sign in; a free model is enough to try it out.
2. Open the folder **`base-main/exemples/veytaux-tourisme`** in it (often *File → Open Folder*), in **Agent mode** so it reads the files.
3. Ask "What activities are you offering this afternoon?". The assistant follows the method described in the files; continue with the [step-by-step tutorial](../tutoriel/index.md).

> **Common snag**: if the assistant talks to you about "routing" or "BASE" instead of Veytaux, you've opened the `base-main` root, which is the framework. Reopen the `exemples/veytaux-tourisme` subfolder.

## Your own folder

To start from YOUR data: copy `base-main/exemples/starter-perso` wherever you like (your
Documents), rename it, and reopen THAT folder in your tool. Or ask your assistant:
"copy the starter-perso folder to my Documents".

## The honest ceiling, and the next step

Here, it's the **model** that routes by following consignes (`CLAUDE.md`,
`.cursor/rules/assistant.mdc`): handy, but it can overstep. For **mechanical
guarantees** (deterministic routing, validated writes, confinement), go through
[the letter to your AI](installer-par-votre-ia.md) (5 minutes), or see
[Install](installer.md) and [Security and limits](../trust/securite-et-limites.md) for the
boundary between *consigne* (followed) and *mechanism* (enforced).
