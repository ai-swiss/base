<!-- fr-synced: abf90266159c2550f827a635b37bb2473766dbe6 -->
# Installing the BASE MCP server

When your AI tool can't read your files directly, or when you want to share an agent beyond your own machine, the MCP server is the way to go: it makes your BASE agents reachable from any compatible platform, with no manual copying of your work. The trade-off is that you expose one folder of your project to a third-party tool, which calls for a few guardrails (see below). The MCP (Model Context Protocol) server connects your BASE agents to compatible platforms: ChatGPT, Claude Desktop, and the AI tools that can speak MCP (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code).

## Prerequisites

- Node 18 or later (`node --version` to check). It's the only dependency of the BASE core.
- The BASE repository, locally. Don't have it yet? See [Get BASE](obtenir-base.md).

## 1. Build the server

```bash
cd mcp/
npm install
npm run build
```

## 2. Start the server

```bash
npm start -- --root /path/to/your/project
```

Without `--root`, the server detects the nearest BASE root from its launch directory. For lasting use, prefer an explicit root.

## 3. Connect your platform

### Claude Desktop

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "base": {
      "command": "node",
      "args": ["/path/to/mcp/dist/index.js", "--root", "/path/to/your/project"]
    }
  }
}
```

The configuration is identical in the other AI tools that can speak MCP (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code): carry the same block over into their MCP settings.

Consumer MCP-compatible tools, such as ChatGPT (via its developer mode), can also connect to this local MCP server. Enabling it, along with whatever conditions apply at the time, is done inside the tool, following its official documentation: BASE neither makes it a guided journey nor depends on it.

### First request

Once the platform is connected, ask:

> "What agents do I have?"

then "Load my assistant-devis agent" and finally "Hello, I'd like to set up my business." The rest of the journey is in the [quickstart](quickstart.md).

## Security: read-only and authentication

Two guardrails are active by default:

- **Read-only over HTTP.** On the HTTP transport, the write and execution tools are not registered: the surface is therefore, verifiably, read-only. `--read-write` widens it explicitly, to be reserved for authenticated deployments. Over `stdio` (local use), the broker's full surface is available, mediated writes included.
- **Network exposure refused without authentication.** Binding a non-loopback interface (`--host 0.0.0.0`, a LAN IP) without authentication is refused at startup. If you accept the risk (trusted network, controlled tunnel), `mcp/README.md` documents the explicit escape hatch `BASE_MCP_ALLOW_INSECURE_REMOTE=1`. Set `BASE_MCP_BEARER_TOKEN` to require a bearer token, the recommended option for a team:

```bash
BASE_MCP_BEARER_TOKEN=a-long-random-secret npm start -- --transport http --host 0.0.0.0 --root /path/to/your/project
```

For custom authentication (OAuth, mTLS), supply an `AuthProvider` via `base.config.mjs`, or place the server behind an authenticated reverse proxy.

Read-only access is still sensitive: the read tools expose the resources and files confined to the project. Don't expose a folder over MCP if it contains secrets or data outside the scope of the connected client.

## Basic troubleshooting

| Symptom | Lead |
| --- | --- |
| `npm: command not found` | Install Node 18 or later from [nodejs.org](https://nodejs.org) |
| The server refuses to start on the network | Expected behavior without authentication: set `BASE_MCP_BEARER_TOKEN` |
| The platform sees no agents | Check the path passed to `--root` and that the project contains `.ai/agents/*/AGENT.md` |
| Stuck on a technical step | Ask your AI: "I have this error: [paste the error]. What's going on?" |

## Going further

[mcp/README.md](../../../mcp/README.md) details the exposed tools (`load_agent`, `route_request`, `propose_change`, etc.), the multi-root mode (`--workspace`), team deployment behind a reverse proxy, and the limits: MCP replaces neither IAM, nor DLP, nor archiving.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
