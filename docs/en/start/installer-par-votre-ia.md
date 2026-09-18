<!-- fr-synced: 37d3b14e5ebd6066e32a06f79029efb653f5a00e -->
# Have your AI install BASE

Installing BASE can fall to your AI rather than to you: you walk away with a ready-to-use
workspace without having typed a single command, as long as your tool knows how to run those
commands on your behalf and lets you review each step before it takes effect. In practice, you paste a
block into an AI tool that can run commands (for example GitHub Copilot, Antigravity, Claude Code
or Cowork, OpenCode, Kilo Code): it carries out the installation for you, then lets you know when your
workspace is ready.

## Before you paste the block

1. Create an empty folder for your work: for example, in your Documents, a folder
   `my-folder`.
2. Open that folder in your AI tool that can read your files: depending on the tool, this
   will be a *File → Open Folder*, or a `cd my-folder` followed by launching the tool in that
   folder.
3. Open the chat in **agent mode** (the one that knows how to run commands): depending on the tool,
   this is an *Agent* mode to enable in the chat panel, or simply the default mode.
4. Paste the block below and send it.

## The block to paste

```text
Mission: retrieve the BASE reference implementation and create my workspace in the current folder.

First, ask me: "Where do you want to install the BASE reference implementation?"
(suggest the "base" subfolder of my Documents, and call that path <BASE_DIR>).

Steps; check each output before continuing:
1. `node --version`: Node 18 or later is required. Otherwise, guide me to install it from
   nodejs.org. After installing, I close and reopen my tool, paste this prompt again,
   and you pick up here.
2. Install the reference implementation in <BASE_DIR> if it is not already there:
   `git clone https://github.com/ai-swiss/base.git <BASE_DIR>`
   If git is not available, download the latest published version,
   https://github.com/ai-swiss/base/releases/latest/download/base.zip, unzip it, and
   place its contents in <BASE_DIR>, then continue. (On Mac, typing git may open a
   developer-tools install dialog: that is normal, and the ZIP avoids it.)
3. Show me the files initialization intends to create HERE (my working folder, not <BASE_DIR>):
   `node <BASE_DIR>/tools/base.mjs init`
   The output presents the choices that are still missing: which AI tool will read this folder,
   what I do in one sentence, the language, and the egress rule. Ask me these questions, then,
   after my explicit approval, initialize the folder with my answers. The result may refine the initial preview:
   `node <BASE_DIR>/tools/base.mjs init --tool <my tool> --about "<my sentence>" --yes`
   (`--tool claude-code`, `cursor`, `agents-md` for Codex, Copilot, Windsurf, or `autre`.)
   `--egress local-only` declares that no resource in the folder is sent to a hosted model through
   the implementation's mediated paths. Direct file access or another execution path can bypass this control.
4. Verify: `node .ai/base.mjs whereis` shows <BASE_DIR>,
   and my tool's entry point now exists in my folder.
5. Tell me the exact phrase to send you to begin
   ("import my existing procedures" if I already have documents to convert).

Guardrails: NEVER overwrite an existing file; do not install anything else without
asking me; if a step fails, show me the exact error instead of improvising.
```

## What happens next

Your folder now contains an agent, its configuration, the `node .ai/base.mjs` launcher, and the file **your** tool
reads to become the **router** for your domain: a `CLAUDE.md` for Claude Code, a
`.cursor/rules/` rule for Cursor, an `AGENTS.md` for the editors that read it, a
`BASE_BOOTSTRAP.md` otherwise. The initialization tool writes only the entry point for the tool
you named. It does not install the short `base` command in your `PATH`. Talk to the router
normally: it directs each request to the right process, then your tool follows that process, without you having to
work out which one to pick.

- **Convert your existing documents**: say "importer mes procédures existantes". Each
  conversion is submitted to you as a diff; nothing is written without your approval.
- **The Studio**: before the first use, run `npm ci` in `<BASE_DIR>`, then
  `cd my-folder && node .ai/base.mjs studio --root .` to open BASE Studio.
- **Keep the reference implementation up to date**: `node .ai/base.mjs update`.
- **Where the reference implementation lives**: `node .ai/base.mjs whereis` (the location is also noted
  in `~/.config/base/config.json`, editable by hand).

**Next action:** create an empty folder named `my-folder`, open that exact folder in agent mode, then paste the block above.
