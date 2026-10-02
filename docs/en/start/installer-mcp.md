<!-- fr-synced: 0f8ad17a2205fc516f68496d71ec715297822836 -->
# Installing the BASE MCP server

Use the MCP (Model Context Protocol) server when your AI tool cannot read your files directly or when you want to share an agent beyond your machine. It connects BASE agents to compatible platforms, including ChatGPT and Claude Desktop, without manual copying. In return, you expose a project folder to a third-party tool, so the safeguards below matter.

## Prerequisites

- [Node 18.14.1 or later](https://nodejs.org), with `node` and `npm` available in your `PATH` (`node --version` and `npm --version` check this). The BASE core supports Node 18 or later; the MCP server requires at least 18.14.1.
- A terminal open on your workstation.
- The BASE reference implementation, locally. Don't have the repository yet? See [Get BASE](obtenir-base.md).

## 1. Build the server

```bash
cd <BASE_DIR>/mcp
npm install
npm run build
```

## 2. Start the server

```bash
npm start -- --root /path/to/your/project
```

Without `--root`, the server detects the nearest BASE root from its launch directory. For regular use, specify the root explicitly.

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

Other MCP-compatible AI tools use the same configuration: add this block to their MCP settings.

Consumer MCP-compatible tools, such as ChatGPT (via its developer mode), can likewise connect to this server, provided they reach it through a web address: ChatGPT does not start a local process, so it needs the HTTP transport behind a tunnel, with a token (see "Depuis ChatGPT, concrètement" in [`mcp/README.md`](../../../mcp/README.md)). Enabling it, along with whatever conditions apply at the time, is a matter for the tool and its official documentation: BASE neither makes it a guided journey nor depends on it.

### First request

Once the platform is connected, ask:

> "What agents do I have?"

then "Load my assistant-devis agent" and finally "Hello, I'd like to set up my business." The rest of the journey is in the [quickstart](quickstart.md).

## Security: read-only and authentication

Two guardrails are active by default on requests that pass through this server:

- **HTTP is read-only by default; `stdio` exposes the full mediated surface.** Over HTTP, write and execution tools are not registered by default. `--read-write` explicitly expands that surface and should be reserved for authenticated deployments. Over `stdio` (local use), the mediation component, called the broker, exposes its full mediated surface, including writes.
- **Network exposure refused without authentication.** The server refuses to bind a non-loopback interface (`--host 0.0.0.0` or a LAN IP) without authentication. For a trusted network or controlled tunnel, `mcp/README.md` documents the explicit `BASE_MCP_ALLOW_INSECURE_REMOTE=1` escape hatch. For a team, set `BASE_MCP_BEARER_TOKEN` to require a bearer token:

```bash
BASE_MCP_BEARER_TOKEN=a-long-random-secret npm start -- --transport http --host 0.0.0.0 --root /path/to/your/project
```

For custom authentication (OAuth, mTLS), supply an `AuthProvider` via `base.config.mjs`, or place the server behind an authenticated reverse proxy.

Read-only access still carries risk: the read tools expose resources and files confined to the project. These protections do not cover direct file access or another execution path. Do not expose a folder over MCP if it contains secrets or data outside the connected client's scope.

## Basic troubleshooting

| Symptom | What to check |
| --- | --- |
| `npm: command not found` | Install Node 18.14.1 or later from [nodejs.org](https://nodejs.org) |
| The server refuses to start on the network | Expected behavior without authentication: set `BASE_MCP_BEARER_TOKEN` |
| The platform sees no agents | Check the path passed to `--root` and that the project contains `.ai/agents/*/AGENT.md` |
| Stuck on a technical step | Ask your AI: "I have this error: [paste the error]. What's going on?" |

## Going further

[mcp/README.md](../../../mcp/README.md) details the exposed tools (`load_agent`, `route_request`, `propose_change`, etc.), the multi-root mode (`--workspace`), team deployment behind a reverse proxy, as well as the limits of the setup: MCP replaces neither IAM, nor DLP, nor archiving.

**Next action:** connect your platform as described in step 3, then verify the connection with the suggested first request.

---

BASE is an open framework carrying a proposed standard and a reference implementation, maintained by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
