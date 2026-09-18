<!-- fr-synced: 3a25672798c7c99adc12485853d2e39741c4eb21 -->
# Environment variables

BASE is configured first through files (`base.config.json`, the user configuration) and through command flags. Nine environment variables complete that surface. The development and evaluation variables (`ROUTE_EVAL_*`, `STUDIO_*_PORT`, `BASE_DOCS_*`) are not product surface and are described in the contributor documentation.

None of these nine variables has to be set for BASE to work. Each row below says what BASE does when you set nothing.

## What a deployment exposes

These five variables change the behaviour of a server, the MCP server or Studio. Three of them lift a refusal; they are detailed just after the table.

| Variable | What it does | Absent | Read in |
|---|---|---|---|
| `BASE_MCP_READ_ONLY` | `1` forces read-only: the write and execute tools are not exposed, and nothing is written to the corpus. `0` allows writing over the HTTP transport, which forbids it by default. The `--read-only` and `--read-write` flags win over the variable. | The stdio transport is read-write, the HTTP transport read-only. | `mcp/src/transport.ts` |
| `BASE_MCP_BEARER_TOKEN` | The shared token for `Bearer` authentication. Its presence enables authentication, which in turn allows binding a host other than loopback. A configuration declaring `auth: bearer` requires this token and fails with `base.config.invalid` if it is missing. | No authentication. Binding then stays restricted to loopback. | `mcp/src/auth.ts` |
| `BASE_MCP_ALLOW_INSECURE_REMOTE` | `1` lifts the refusal to bind a non-loopback host without authentication. | The server logs the refusal and exits with code 1. | `mcp/src/transport.ts` |
| `BASE_MCP_ALLOW_CONFIDENTIAL` | `1` asserts that the connected client is local, which releases confidential resources and those of a `local-only` root to the read surface. Startup logs a warning naming the variable. | The client is treated as remote: those resources are withheld, including from the inventory and from search. | `mcp/src/base-core-adapter.ts`, `mcp/src/index.ts` |
| `BASE_STUDIO_ALLOW_INSECURE_REMOTE` | `1` lifts Studio's refusal to bind anything other than loopback. | Studio refuses to start on such an address, whether the bind comes from `startStudioServer` or from a direct `listen()`. | `tools/studio/server.mjs` |

### The three refusals, and what you accept by lifting them

- **`BASE_MCP_ALLOW_INSECURE_REMOTE=1`.** By default the MCP server refuses to bind a non-loopback host as long as no authentication is configured. By lifting this refusal without configuring `BASE_MCP_BEARER_TOKEN` or an authenticated reverse proxy, you accept that any machine able to reach that port reaches the MCP tools you expose.
- **`BASE_STUDIO_ALLOW_INSECURE_REMOTE=1`.** Studio refuses the same exposure, for a heavier reason: it has no authentication at all, it exposes write endpoints (`/api/propose`, `/api/commit`) and an evaluation launch that can call model providers with the server's own API keys. By lifting this refusal, you accept that whoever reaches that port writes to your files and spends your keys.
- **`BASE_MCP_ALLOW_CONFIDENTIAL=1`.** By default the MCP server does not know the locality of the client calling it, so it treats its read surface as a remote egress context: a resource marked confidential, or a resource of a root declared `local-only`, is neither opened, nor cited by routing, nor even listed by the inventory. By setting the variable you assert that the connected client is local, and those resources may then travel to the model.

## Your own machine

These four variables change nothing about what a deployment exposes. They adjust your working environment.

| Variable | What it does | Absent | Read in |
|---|---|---|---|
| `BASE_CONFIG_HOME` | Replaces the home directory used to find the user configuration (`<home>/.config/base/config.json`), the one `base init` writes and the launcher consults to locate the framework. Useful to isolate an installation or a test. | The system home directory. | `tools/cli/framework.mjs`, `tools/cli/init.mjs`, `tools/core/launcher.mjs` |
| `BASE_TRACE_ACTOR` | Fills the `actor` field of the events written to the local journal `.ai/trace/`, for a command-line session. An actor carried by the request, the one from MCP authentication, wins over the variable. | The `actor` field is simply omitted. | `tools/core/trace.mjs` |
| `BASE_PROGRESS` | Makes the progress lines visible on the error output when that output is not a terminal: one step per line, readable in a pipe or a CI log. Any non-empty value is enough. | Off a terminal, no progress line at all. On a terminal they show anyway, rewriting in place. | `tools/core/progress.mjs` |
| `STUDIO_CHAT_CONTEXT_TOKENS` | The estimated token budget of Studio's chat before older history is compacted. A positive integer. | 12,000 tokens. | `tools/studio/chat.mjs` |

## Going further

- MCP server exposure and its transports: [`mcp/README.md`](../../../mcp/README.md).
- What stays local and what may leave: [The boundary, local by default](../trust/frontiere-local-vs-sortant.md).
- The local journal and its retention: [Data protection](../trust/protection-des-donnees.md).
- The security model and its limits: [Security and limits](../trust/securite-et-limites.md).
