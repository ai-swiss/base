<!-- fr-synced: 7b63c08db9716f99d3669ade98ab99d38aa759d7 -->
# Step 0: connect your AI tool

**You will** make your AI tool able to read a BASE folder and respond from it, proven by a simple
question at the end.
**You need** a computer, an internet connection, and the BASE folder on your machine. If you don't
have it yet, [Try it without installing anything](../start/essayer-sans-installer.md) shows the
simplest way to get it; examples like `veytaux-tourisme` are in there.

Before any module, your tool must be installed AND connected. Choose:

| Tool | First move | Terminal required? |
|-------|---------------|-------------------|
| **Cursor** | Download it from cursor.com, sign in, *File -> Open Folder*. Chat: Cmd/Ctrl+L, Agent mode. | No |
| **Claude Code** | Install it, then run `claude` in the folder. | Yes |
| **ChatGPT / Claude Desktop** | Via the MCP server (mechanical guarantees). | Yes (config) |
| **Another tool** | Ask the concierge: *help me connect BASE to my tool*. It reads your tool's docs and guides you. | Depends on the tool |

For the mechanical guarantees (deterministic routing, mediated writes), connect the MCP server: see
BASE's getting-started documentation.

✅ **Check**: open the `exemples/veytaux-tourisme` folder in your tool and ask *"who are you?"*. The
assistant should, in essence, introduce itself as the assistant for the Veytaux-les-Bains tourist
office (visitor information and group outings). If it talks about something else, see the failures
below.

🆘 **Common failures**:
- *The assistant talks about "routing" or "BASE" instead of the tourist office*: you opened the
  root of the repository, not the subfolder. Reopen `exemples/veytaux-tourisme`.
- *It doesn't respond with anything specific*: your tool isn't reading the project's files. Check
  that you opened the FOLDER (not a single file), and that the chat is in agent mode.

## The `base` command (Practitioner and Team paths)

These two paths use a terminal. When a module writes `base ...`, it means the launcher that every
BASE folder contains: run it with **`node .ai/base.mjs`** from the folder where you're working (the
repository, or your own project). It finds the engine on its own: nothing to install, nothing to put
on the PATH (the `base` package isn't published; this launcher replaces it).

To type less, create a session shortcut:

- macOS / Linux: `alias base='node .ai/base.mjs'`
- Windows (PowerShell): `function base { node .ai/base.mjs @args }`

Then `base route "..."` works as is.

✅ **Check (before the Practitioner path)**: from `exemples/veytaux-tourisme`,
`node .ai/base.mjs --help` displays the list of commands.

→ **What's next**: go back to the [index](index.md) and start module 1 of your path.
