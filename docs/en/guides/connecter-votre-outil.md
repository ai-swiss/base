<!-- fr-synced: ee0499d96aefb2aded077d221ef39d7bf0fe9f69 -->
# Connect your AI tool

Plugging BASE into the AI tool you already use means keeping the method legible and **validating at the right moment** rather than delegating without watching: you stay the person who decides, the tool executes under your eye. This assumes an AI tool that can read your files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code); BASE grafts onto it.

Two levels are enough in most cases. Start with the simplest.

## The simplest: open the folder

No installation. You open an example folder (or your own BASE) in a tool that reads project files. The projected artifacts (`CLAUDE.md`, `.cursor/rules/`) give the tool the BASE context and the routing rule. They do not automatically choose a domain assistant: your first request must carry an intent.

| Tool | What you do |
|-------|--------------------|
| **Cursor** | Open the folder. The `.cursor/rules/assistant.mdc` rule loads the BASE context. Say, for example, "Hello, I'd like to set up my business." |
| **Claude Code** | Open the folder. `CLAUDE.md` loads the BASE context. Say, for example, "Hello, I'd like to set up my business." |
| **Claude Desktop / ChatGPT (no MCP)** | Paste a browser pack (see [Get BASE](../start/obtenir-base.md)) and phrase a concrete request. *Consigne* mode, no mechanical guarantees. |
| **Other editor that reads `AGENTS.md`** | Open the folder; the projected `AGENTS.md` describes the agent. |

This is the browser-and-file tier: the model follows the method, and you keep your hand on the wheel to review it.

## For a team: BASE's MCP server

When you want the **mechanical guarantees** (deterministic routing by default, mediated writing that proposes then commits, guarded execution), plug in BASE's MCP server. It is the same broker as in the CLI, exposed to your tool.

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

For read-only, add `--read-only`. The full reference (modes, remote, authentication, security) lives in [`mcp/README.md`](../../../mcp/README.md), the source of truth.

## Which tier for which need

| Need | Tier |
|--------|--------|
| Try, explore, individual workstation | Open the folder |
| Paste an assistant into a browser | Browser pack |
| Mechanical guarantees, team, mediated writing | MCP server |

## Your tool isn't listed

The principle holds for most tools that read project files or speak MCP. Load the welcome agent (`concierge-base`) and ask "help me connect BASE to my tool": it reads your tool's documentation and guides you, keeping the validation seam intact. See also [BASE and your AI tools](../reference/base-et-vos-outils-ia.md).
