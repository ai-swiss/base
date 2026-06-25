# 10 · MCP server (MCP)

> **For developers and maintainers.** The MCP adapter. Implements FR-MCP-001..005, FR-FEEDBACK-*. Source: `mcp/src/index.ts`, `mcp/src/base-core-adapter.ts`. Unlike the core, the MCP layer **has dependencies** (`@modelcontextprotocol/sdk`, `express`, `zod`).
>
> Owns: FR-MCP-*, FR-FEEDBACK-*

## Role
An **adapter**, not an orchestrator (vision plane "MCP = exposure"). It exposes broker primitives to any MCP-capable platform (ChatGPT, Claude Desktop, Cursor…) plus one compatibility bootstrap. Business thinking stays in the LLM.

## Tools (baseline - verified)

| Tool | Purpose | Delegates to |
|---|---|---|
| `load_agent` | Lazy bootstrap: list agents (no name) or return one agent's `AGENT.md` + resource catalogue + data references | `discoverAgents` + `bundleAgentBootstrap` |
| `discover_resources` | Explainable metadata search; content stays behind `open_resource`/`access_resource` | broker `searchResources` |
| `route_request` | Route a request to agent → process, or abstain | broker `routeRequest` |
| `open_resource` | Open by id/path, confined, projected | broker `openResource` |
| `access_resource` | Read a confined file/resource | broker `accessResource` |
| `invoke_tool` | Dry-run (default) or confirmed execution | broker `invokeTool` |
| `propose_change` | Stage a write; return a diff, write nothing | broker `proposeChange` |
| `commit_change` | Apply a staged write (re-checked, verified) | broker `commitChange` |
| `promote_resource` | Propose a scope promotion | broker `promoteResource` |
| `list_markers` | List typed open markers | broker `listMarkers` |
| `report_friction` | Field feedback: append a dated, creation-only friction entry under `.ai/feedback/` (write-gated: absent on read-only servers) | broker `reportFriction` |

**FR-MCP-002 - lazy by design.** `load_agent` never bulk-loads skills/templates/data; it returns a catalogue and the platform fetches only what it needs via the other tools. The legacy `include_data` flag is a no-op kept for compatibility.

**Agent discovery.** Scans the configured root and nested BASE project roots. A loadable project root is any non-skipped directory containing `.ai/agents/*/AGENT.md`; each discovered agent keeps that directory as its `projectRoot`, so resources are not merged across projects. Agent directories starting with `_` are skipped.

## Transports (FR-MCP-003)
- `stdio` (default) - for local desktop clients. **All logs go to stderr** (stdout is reserved for the protocol).
- `http` - `StreamableHTTPServerTransport`, stateless (fresh server+transport per request). Binds `127.0.0.1:3100` by default. `GET`/`DELETE` on `/mcp` → 405.

CLI flags: `--root`, `--workspace`, `--root-id`, `--transport {stdio,http}`, `--port`, `--host`, `--read-only`, `--read-write`, `--log-level {debug,info,warn,error}`. Without an explicit root/workspace, startup uses the same nearest-root/workspace resolver as the CLI.

Tool responses include the selected scope, either as a `scope` object in JSON payloads or as a short text prefix for human-readable bootstrap/file responses. Operators can still inspect logs, but clients do not need logs to know which root is active.

The publishable package name is `@ai-swiss/base-mcp`; the executable remains `base-mcp`.

Security posture by transport:
- `stdio` keeps the full broker surface by default for local desktop clients.
- `http` is read-only by default. Write and execute tools are not registered unless the operator explicitly passes `--read-write` or sets `BASE_MCP_READ_ONLY=0`. Note that `discover_resources` and `route_request` **remain registered even when read-only** — they are reads.
  `route_request` additionally journals every honest abstention (`out_of_scope` / `ambiguous` / `needs_clarification`)
  to `.ai/feedback/abstentions.jsonl` — adapter-side telemetry (the broker stays pure), shared verbatim with the CLI `base route`. `route_request` returns agent/process identifiers, paths and candidate scores; this routing metadata is therefore part of the read-only surface by design. Content still stays behind `open_resource`/`access_resource`.
- `--read-only` or `BASE_MCP_READ_ONLY=1` force a read-only surface.
- HTTP still refuses non-loopback exposure without auth, because even a read-only MCP surface can expose project data, and operators may enable write/execute explicitly.
- On a loopback bind (the default), `/mcp` also refuses cross-origin / DNS-rebinding requests — a non-loopback `Host`, or a foreign `Origin` — with 403 *before* auth (`crossOriginError`, transport.ts), mirroring the Studio's guard. A local MCP client (no `Origin`, loopback `Host`) passes; on a deliberate non-loopback bind, auth is the control and the guard is skipped.

Policy context:
- `open_resource`, `access_resource`, `invoke_tool`, `propose_change` and `commit_change` accept the confirmation or grant context needed by policy adapters (`confirmed`, and `grant_token` where relevant).
- `propose_change` may require `confirmed: true` before staging sensitive or restricted proposed content; if policy returns `deny`, the broker must not persist the proposal.

## Path confinement
`confineToProject` delegates to the broker's `confineToRoot` (traversal + outward-symlink refusal), with MCP-friendly error messages. Verified by tests (`../../etc/passwd` rejected).

## FR-MCP-004 - no bulk-dump tool
The only agent loader is the lazy `bundleAgentBootstrap`; there is **no** bulk `bundleAgent`/`bundleData`/`bundleDirectory` tool. A whole-agent export, if ever needed, is an explicit `export_agent` tool with a confined recursive walk — not a default surface.

## FR-MCP-005 - `AuthProvider` port
Networking is an MCP-only concern, so the port lives in `mcp/src/auth.ts`: `AuthProvider` type, `noAuth` default, `bearerTokenAuth(token)` reference, `resolveAuthProvider(config, env)`, and `authMiddleware`. `createHttpApp(root, provider)` mounts the middleware on `/mcp`; `main()` resolves project config via the broker, then resolves the provider and **lifts the non-loopback refusal once auth is configured** (`config.auth` fn/descriptor, or `BASE_MCP_BEARER_TOKEN`). The safe-by-default refusal (`isLoopbackHost`/`remoteExposureError`) remains for the no-auth case.

```ts
// authenticate(req) => { ok: boolean, principal?: unknown }
export type AuthProvider = (req: express.Request) => Promise<{ ok: boolean; principal?: unknown }>;
```

Behaviour:
- **Default `NoAuth`** + bind `127.0.0.1` → zero friction for the local case.
- **Refuse accidental exposure:** a non-loopback `--host` (e.g. `0.0.0.0`) → `main()` exits before binding, unless `BASE_MCP_ALLOW_INSECURE_REMOTE=1` or an AuthProvider is configured. Protects the naive user; doesn't block the expert.
- **Reference adapter `bearerTokenAuth(token)`** - a 5-minute "good enough for a team" option between nothing and full OAuth. OAuth 2.1 remains a documented extension (`mcp/README.md` already sketches the reverse-proxy/OAuth production setup).

`auth` is supplied via `base.config.{json,mjs}` (resolved by the broker config resolver), via `BASE_MCP_BEARER_TOKEN`, or an MCP-local equivalent; consumed as Express middleware in `createHttpApp`.

## Cancellation (forward-compatible)
`searchResources` and `routeRequest` accept an optional `signal` (AbortSignal) threaded into the Ranker
`ctx` and on to async embedding providers (`@ai-swiss/base-ranker-semantic`). The MCP adapter does not
bind a per-request signal today, but the broker contract is ready: a host that wants to cancel a slow
embedding-backed route can pass one without a core change.

## How it's proven
- `tsc --noEmit` is clean; the lazy `bundleAgentBootstrap` is the only agent loader (no bulk `bundle*`).
- AuthProvider: `isLoopbackHost`, `remoteExposureError` (refusal lifted when auth configured), `bearerTokenAuth` (rejects/accepts), `resolveAuthProvider` (config fn/descriptor > env bearer > NoAuth), `authMiddleware` (401/next) - all tested.
- The ten tools (incl. the registered `route_request` handler) keep their behaviour and remain backward-compatible (NFR-CORE-002), with scope added to structured responses. Every root-scoped follow-up tool (`discover_resources`, `open_resource`, `access_resource`, `invoke_tool`, `propose_change`, `commit_change`, `promote_resource`, `list_markers`) accepts one **optional, additive** `root_id` parameter in workspace mode. Read/write/execute/promote/list operations stay confined to the selected root; an undeclared `root_id` is rejected, and omitting `root_id` is rejected when several roots are visible.
