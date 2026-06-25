<!-- fr-synced: a5aee6f04a1af3c7e131f033545cd33018f40750 -->
# Install Cursor for your BASE agents

To put your BASE agents to work, you need a workstation where the AI reads your files, writes files, and runs commands under your control: this page sets one up with Cursor, ready to go. By the end, you will have opened an example, made your first request, and you will know what to do if something gets stuck. This means installing software and creating an account with the vendor. Cursor is just one entry point: other AI tools that can read your files work too (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code); pick the one that suits you.

Cursor is an AI workspace with a graphical interface.

## 1. Install Cursor

**Download:** [cursor.com](https://cursor.com)

| OS | Instructions |
| --- | --- |
| **Windows** | Download `.exe`, run the installer |
| **macOS** | Download `.dmg`, open it, drag into Applications (ARM64 version for M chips) |
| **Linux** | Download the AppImage, make it executable (`chmod +x`), run it |

**On first launch:**

1. Create an account or sign in (required to access the AI models)
2. Choose a theme (can be changed later)
3. Import existing VS Code settings (optional)

## 2. Configure privacy

1. Open **Settings** (gear icon, top right)
2. Go to **General**, **Privacy** section
3. Select **Privacy Mode**

This setting aims to limit the use of your data for training models, subject to the tool's terms, which you should verify yourself. It offers partial protection: for personal, customer, or regulated data, have the usage cleared by a legal or security review.

## 3. Open a BASE example

1. Copy an example folder (for instance `exemples/assistant-devis/`) into your workspace
2. Open it in Cursor (File → Open Folder)
3. The file `.cursor/rules/assistant.mdc` gives Cursor the rules for loading the agent

Don't have the repository yet? See [Get BASE](obtenir-base.md).

## 4. First request

Say this in the chat:

> "Hello, I'd like to set up my business"

The assistant guides you, proposes files, and waits for your approval on the important decisions. The rest of the journey (first quote, `[A VALIDER]` markers) is in the [quickstart](quickstart.md).

## 5. Read your PDF, Word, and Excel files (optional)

The AI reads text natively (Markdown, TXT, code). PDF, Word, and Excel are binary formats that require a tool. The **Office Viewer** extension (Extensions panel, `Cmd/Ctrl + Shift + X`) already lets you view them in Cursor. To have the AI read them, two options that can coexist:

**Option A, convert to Markdown with [Docling](https://docling-project.github.io/docling/)** (reference documents, frequent use):

```bash
pip install docling   # or: uv tool install docling
docling --to md --output "/chemin/sortie/" "/chemin/document.pdf"
```

The generated `.md` file keeps headings and tables. To automate it, add the command as an example in `Cursor Settings > General > Rules and Commands`, then simply say "Convert this file [path]".

**Option B, the [Document Loader](https://awslabs.github.io/mcp/servers/document-loader-mcp-server) MCP server** (one-off reading, on-the-fly extraction):

1. Install `uv`: `curl -LsSf https://astral.sh/uv/install.sh | sh` (macOS/Linux) or `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` (Windows). Verify with `uvx --version`.
2. In `Cursor Settings > MCP`, click "Add MCP Server" and add:

```json
{
  "mcpServers": {
    "awslabs.document-loader-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.document-loader-mcp-server@latest"],
      "env": { "FASTMCP_LOG_LEVEL": "ERROR" }
    }
  }
}
```

3. Enable only `read_document`. The `read_image` tool interferes with the LLMs' native image reading.
4. Test it: "Read this PDF [path] and summarize it." On macOS, if `uvx` isn't found, give its full path (`/usr/local/bin/uvx` or `~/.local/bin/uvx`).

## Basic troubleshooting

| Symptom | What to try |
| --- | --- |
| The explorer is empty | Reopen the right folder (File → Open Folder) |
| The AI can't find a file | Right-click the file → **Copy Path**, paste the exact path into the chat |
| A PDF stays unreadable | Go back to option A or B above |
| Stuck on a technical step | Ask the AI itself: "I'm getting this error: [paste the error]. What's going on?" State your level if needed. |

Chat tips: `Cmd/Ctrl + V` pastes a URL as context (if the AI has web access); `Cmd/Ctrl + Shift + V` pastes the URL's text content, useful when the site blocks bots.

To check the install: drag a `.md` file into the chat and ask for a summary, then "Create a file test.md with Hello", then "List my files with the ls command in a terminal". If all of that works, the AI can see, read, write, and run. Full reference: [docs.cursor.com](https://docs.cursor.com).

Cursor excels at iterative work on files. For deep web research (Deep Research, Perplexity), image generation (Midjourney, Ideogram), or video generation (Veo, Runway), use specialized tools.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
