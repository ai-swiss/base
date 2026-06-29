<!-- fr-synced: f36992497208c1e7e8391e25754323403491ca6e -->
# Connect your AI tool

Plugging BASE into the AI tool you already use means keeping the method legible and **validating at the right moment** instead of delegating without watching: you remain the person who decides, the tool executes before your eyes. It does take an AI tool that can read your files (GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code, to name a few); BASE grafts onto it.

In most cases, two levels are enough. Start with the simplest.

## The simplest: open the folder

No installation. You open an example folder (or your own BASE) in a tool that reads project files. The projected artifacts (`CLAUDE.md`, `.cursor/rules/`) pass the BASE context and the routing rule along to the tool. They still do not designate a domain assistant: it falls to your first request to carry an intent.

| Tool | What you do |
|-------|--------------------|
| **Cursor** | Open the folder. The `.cursor/rules/assistant.mdc` rule loads the BASE context. Say, for example, "Hello, I'd like to set up my business." |
| **Claude Code** | Open the folder. `CLAUDE.md` loads the BASE context. Say, for example, "Hello, I'd like to set up my business." |
| **Claude Desktop / ChatGPT (no MCP)** | Paste a browser pack (see [Get BASE](../start/obtenir-base.md)) and phrase a concrete request. *Consigne* mode, no mechanical guarantees. |
| **Other editor that reads `AGENTS.md`** | Open the folder; the projected `AGENTS.md` describes the agent. |

This is the tier of the browser and the file: the model follows the method, and you keep your hand on the wheel to review it.

## For a team: BASE's MCP server

When you set store by the **mechanical guarantees** (deterministic routing by default, mediated writing that proposes then commits, guarded execution), plug in BASE's MCP server. It is the same broker as in the CLI, this time exposed to your tool.

| Tool | Procedure |
|-------|-----------|
| **Claude Desktop** | Add an `mcpServers` entry pointing to the BASE server. Exact detail: [`mcp/README.md`](../../../mcp/README.md). |
| **Cursor** | MCP settings, add the BASE server. Detail: [`mcp/README.md`](../../../mcp/README.md). |
| **VS Code (MCP)** | The extension's MCP configuration, server over `stdio`. Detail: [`mcp/README.md`](../../../mcp/README.md). |
| **ChatGPT** | Developer mode, authenticated HTTPS endpoint. Procedure and security: [`mcp/README.md`](../../../mcp/README.md). |

Minimal form of a local server over `stdio` (adapt the paths):

```json
{
  "mcpServers": {
    "base": {
      "command": "node",
      "args": ["/chemin/vers/mcp/dist/index.js", "--root", "/chemin/vers/votre/projet"]
    }
  }
}
```

For read-only access, add `--read-only`. The full reference (modes, remote, authentication, security) is set out in [`mcp/README.md`](../../../mcp/README.md), which is authoritative.

## Which tier for which need

| Need | Tier |
|--------|--------|
| Try, explore, individual workstation | Open the folder |
| Paste an assistant into a browser | Browser pack |
| Mechanical guarantees, team, mediated writing | MCP server |

## Your tool isn't listed

The principle holds for most tools that read project files or converse over MCP. Load the welcome agent (`concierge-base`) and ask "help me connect BASE to my tool": it reads your tool's documentation and guides you, never once loosening the validation seam. See also [BASE and your AI tools](../reference/base-et-vos-outils-ia.md).
