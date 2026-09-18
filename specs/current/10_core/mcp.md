# 10 · MCP server (MCP)

> **For developers and maintainers.** The MCP adapter. Implements FR-MCP-001..008, FR-FEEDBACK-*. Source: `mcp/src/index.ts`, `mcp/src/base-core-adapter.ts`, `mcp/src/knowledge.ts`, `mcp/src/exposure.ts`. Unlike the core, the MCP layer **has dependencies** (`@modelcontextprotocol/sdk`, `express`, `zod`).
>
> Owns: FR-MCP-*, FR-FEEDBACK-*

## Role
An **adapter**, not an orchestrator (vision plane "MCP = exposure"). It exposes broker primitives to any MCP-capable platform (ChatGPT, Claude Desktop, Cursor…) plus one compatibility bootstrap. Business thinking stays in the LLM.

**The routing discipline reaches the pure-MCP client** from the ONE canonical source (core
`bootstrap.mjs`): `createServer` (async — it preloads the guidance from the dynamically-loaded core)
passes `renderMcpInstructions()` as the server `instructions`, and the `route_request` **description**
— the primary bearer, re-received by every client on every list/call, whatever it does with the
optional `instructions` field — carries the route discipline (open `agent.path` then `process.path`;
on abstention ask `next_question`, never guess; load `fallback` when present; route at task
boundaries) and the continuity rule (can no longer cite the active process path → re-open the files
before acting). `MCP_READ_DISCIPLINE` carries the other journey, the one to a FACT rather than to a
process, and names the cheapest move for each shape of question: a known address opens directly
(`open_resource`, `id` or `id#anchor`); a factual question searches at section grain and opens the
one or two passages that answer it; exploring what exists reads the map, not the bodies; several
opens in one turn cost less than one open of a whole document; a citation is `id#section`, and a
quotation is only ever text the caller opened. Without it a client knows how to reach a process and
reads whole documents to answer a question one passage would have answered. The constants are pinned
VERBATIM by tests on both sides (core + MCP), so the English guidance and the French body cannot
drift apart silently.

## Tools (baseline - verified)

| Tool | Purpose | Delegates to |
|---|---|---|
| `load_agent` | Lazy bootstrap: list agents (no name) or return one agent's `AGENT.md` + resource catalogue + data references | `discoverAgents` + `bundleAgentBootstrap` |
| `discover_resources` | Explainable search at resource grain, or at **section grain** (`grain: "section"`, optional `scope`): passages with their heading path and the ref `id#anchor`. Content stays behind `open_resource`/`access_resource` | broker `searchResources` |
| `route_request` | Returns a compact `routing_map` (agents → processes with use_when + avoid) for the MODEL to decide from, plus `next_actions` and (on the lexical hint's routed result) `guidance`; the deterministic lexical decision is a labelled hint, not the router on the model path | broker `routeRequest` + `buildRoutingRegistry` |
| `get_routing_map` | The same `routing_map`, without status, candidates or score, plus the reading discipline and the configured help target; for a client whose model routes by itself (read-only, registered in every mode) | broker `buildRoutingRegistry` + `routingFallback` |
| `open_resource` | Open by id, path or `id#anchor`, confined, projected (`metadata`, `instructions`, `full`, **`outline`**, **`source`**), optionally narrowed to one `section` and to one `lang` edition | broker `openResource` |
| `get_context_pack` | Plan a process's preload: declared references as paths + notes, never bodies; read-only | broker `brokerContextPack` |
| `access_resource` | Read a confined file/resource | broker `accessResource` |
| `invoke_tool` | Dry-run (default) or confirmed execution | broker `invokeTool` |
| `propose_change` | Stage a write; return a diff, write nothing | broker `proposeChange` |
| `commit_change` | Apply a staged write (re-checked, verified); returns a receipt with `content_hash` | broker `commitChange` |
| `promote_resource` | Propose a scope promotion | broker `promoteResource` |
| `list_markers` | List typed open markers | broker `listMarkers` |
| `list_pending_changes` | List staged-but-uncommitted writes (read-only, registered in every mode) | broker `listPendingChanges` |
| `get_change_status` | Report a `change_id` as pending / absent / invalid (read-only, registered in every mode) | broker `getChangeStatus` |
| `report_friction` | Field feedback: append a dated, creation-only friction entry under `.ai/feedback/` (write-gated: absent on read-only servers) | broker `reportFriction` |

**The adapter carries the read options (`base-core-adapter.ts`).** The adapter is the only door to the broker, so an option the broker understands reaches no tool until the adapter carries it. `brokerSearchResources` takes the broker's `grain` (`resource` | `section`) and `scope` (a root-relative folder), and returns whole resources or `BrokerSectionHit`s accordingly; `brokerOpenResource` takes `section` and `lang`, and accepts the `outline` and `source` projections beside the three body projections. An anchor may also ride on the identifier as `id#anchor`: the broker splits it itself, so the adapter never takes a citation apart. `BrokerOpenResult` names the siblings the broker attaches beside the content (`section`, `outline`, `edition`, `source`, `images`), so a consumer reads a contract instead of casting. The adapter re-decides nothing: grain, ranking, anchor resolution and the edition fallback stay in the core, and the MCP surface discovers and opens exactly as the CLI does.

**FR-MCP-002 - lazy by design.** `load_agent` never bulk-loads skills/templates/data; it returns a catalogue and the platform fetches only what it needs via the other tools. `include_data` is not a parameter of this tool; a call that carries it behaves identically because Zod drops the unknown field before the handler sees it.

**Server-led sequencing (remote-executor robustness).** So a stateless remote client follows the protocol without external scaffolding, the server leads at each step. `route_request` returns a compact `routing_map` (agents → processes, each with its use_when + avoid) for the MODEL to decide from: the deterministic lexical decision is a labelled hint, authoritative only for no-model/headless callers, never the router on the model path. It also returns `next_actions` (the next legal steps) and, on a routed hint, `guidance` (the chosen process's own body, inlined so a client that skips `open_resource` still follows the author's instructions; withheld under egress for a confidential process). When an honest abstention instead carries a help target from the framework (FR-ROUTE-009, `fallback.source: "framework"`), that process is inlined as `guidance` from the framework root the fallback names: its file lies outside the routed root, and a remote client has no filesystem of the server's to open it with. Both are framework-derived and carry no authored process text of their own. Two read-only tools, `list_pending_changes` and `get_change_status`, let a caller verify what is staged and whether a claimed write landed against server truth (the authoritative proof is the `commit_change` receipt, `{ written, target, content_hash }`). None of this requires editing authored process text.

**Agent discovery.** Scans the configured root and nested BASE project roots. A loadable project root is any non-skipped directory containing `.ai/agents/*/AGENT.md`; each discovered agent keeps that directory as its `projectRoot`, so resources are not merged across projects. Agent directories starting with `_` are skipped.

## Knowledge access at section grain (FR-MCP-006)
A whole document is the wrong unit at both ends of a read, too much to send and too vague to quote. The core cuts a body at its headings and names every passage `id#anchor` (FR-CORE-008); what the MCP layer adds around that answer lives in `mcp/src/knowledge.ts`, so `index.ts` keeps only its registrations.

- **Discover.** `discover_resources` takes `grain` (`resource` by default, or `section`) and `scope`. A section hit names the passage, its heading path, a preview and the ref `id#anchor`, and never carries a body: a shortlist is where to look, not what to quote.
- **Open.** `open_resource` takes `section`, `lang`, and the `outline` and `source` projections beside the three body projections. `id#anchor` opens the passage a ref names, so a ref copied out of a hit works where an id works. A call that names two DIFFERENT passages (one on the id, one in `section`) is **refused**: the broker's rule that the explicit option wins is right for a program that built both halves on purpose, and wrong for a client that would then quote one passage under the ref of another.
- **Siblings and citation.** An opened resource carries what the broker attached beside the content (`section`, `outline`, `edition`, `source`, `images`) plus `citation`, the author's own `cite_as`. Nothing is invented: a resource that declares no citation carries none.
- **Originals.** Under `projection: "source"` a printed page comes back as an MCP `image` block and its bytes leave the JSON text, the page number, path and size staying behind. A model should look at a scan, not read a base64 field to reach the two values it wanted.

## A routing map without a verdict (FR-MCP-008)
`route_request` answers two callers at once: one that has no model and needs a deterministic decision, and one whose model routes by itself and needs only the map. `get_routing_map` serves the second without making it ask for a verdict it will discard.

- It returns the **same** `routing_map` (agents with their `use_when`, processes with `use_when`, `avoid` and `path`, egress-filtered and narrowed by `mcp.agents`), **minus** `status`, `reason_code`, `candidates` and every score.
- It adds `next_actions`, the reading discipline for a reader holding a map and nothing else: choose on `use_when` while honouring `avoid`, open the agent then the process, route at task boundaries, and never invent an id or a path.
- It adds `fallback` when the deployment configures a help target. That target is resolved by the ENGINE's own root-then-framework resolution (`routingFallback` in `tools/base-core.mjs`, over `resolveFallback` + `frameworkCorpus`), exposed through one adapter call. A second raw read of `routing.fallback` would report a root that borrows the framework's welcome process (FR-ROUTE-009) as having no fallback at all, and a typo'd target as having one that opens nothing.
- Read-only, and registered in every mode: routing metadata already belongs to the read-only surface.

## What a deployment exposes (FR-MCP-007)
A server that promises a narrow surface has to be able to prove it from its configuration. The `mcp` section of the root's `base.config.json` says what this deployment exposes, and it is resolved by `mergeConfig` (`tools/core/config.mjs`) like every other key, never read raw by the server.

- `mcp.tools` and `mcp.agents` are **allow-lists**: absent, the whole surface; present, only what they name. `mcp.attribution_prefix` (boolean) makes every read return the `attribution` line declared on the nearest folder `README.md` card, so a collection's rule of use travels with its content into any client.
- **It fails closed.** A malformed section, or a tool name matching nothing, stops the server at startup. A config read raw and swallowed would answer «expose everything» to exactly the file an operator wrote to expose less; an ignored tool name is indistinguishable from a tool that quietly stopped being registered.
- **Registration is gated by an explicit predicate at each site** (`if (expose("open_resource")) server.tool(…)`), not by a proxied server object. A proxy returns `undefined` where the SDK returns a registered-tool handle, and intercepts only the one method it was written for.
- The vocabulary of `mcp.tools` is `MCP_TOOL_NAMES` in `tools/core/config.mjs`, pinned against the server's own registrations by `mcp/tests/exposure.test.ts`, so the validator and the surface cannot drift apart.
- The attribution lookup is memoised **per server instance** (`attributionReader`, `mcp/src/exposure.ts`). A module-level cache outlives every root and every edit: a long-lived server would keep serving the line a folder card carried before someone corrected it. Under the stateless HTTP transport, where a server is built per request, the memo lives for one request.

## Transports (FR-MCP-003)
- `stdio` (default) - for local desktop clients. **All logs go to stderr** (stdout is reserved for the protocol).
- `http` - `StreamableHTTPServerTransport`, stateless (fresh server+transport per request). Binds `127.0.0.1:3100` by default. `GET`/`DELETE` on `/mcp` → 405.

CLI flags: `--root`, `--workspace`, `--root-id`, `--transport {stdio,http}`, `--port`, `--host`, `--read-only`, `--read-write`, `--log-level {debug,info,warn,error}`. Without an explicit root/workspace, startup uses the same nearest-root/workspace resolver as the CLI.

Tool responses include the selected scope, either as a `scope` object in JSON payloads or as a short text prefix for human-readable bootstrap/file responses. Operators can still inspect logs, but clients need not read logs to know which root is active.

The publishable package name is `@ai-swiss/base-mcp`; the executable remains `base-mcp`.

Security posture by transport:
- `stdio` keeps the full broker surface by default for local desktop clients.
- `http` is read-only by default. Write and execute tools are not registered unless the operator explicitly passes `--read-write` or sets `BASE_MCP_READ_ONLY=0`. Note that `discover_resources`, `route_request` and `get_routing_map` **remain registered even when read-only** (they are reads).
  On a **read-write** server, `route_request` additionally journals every honest abstention (`out_of_scope` / `ambiguous` / `needs_clarification`)
  to `.ai/feedback/abstentions.jsonl`: adapter-side telemetry (the broker stays pure), shared verbatim with the CLI `base route`.
  A **read-only** server journals nothing. The line holds the request TEXT, which on a shared or public server is a
  stranger's question; a server that promises to write nothing must not keep it. Read-only is the single signal (no
  second switch), so a deployment's posture follows from how it was launched. The operational trace remains: operation,
  path, duration and a HASH of the arguments, never the text. `route_request` returns the `routing_map` (agent/process metadata with use_when + avoid) and the deterministic hint's identifiers, paths and candidate scores; this routing metadata is part of the read-only surface by design. Content still stays behind `open_resource`/`access_resource`.
- `--read-only` or `BASE_MCP_READ_ONLY=1` force a read-only surface.
- HTTP still refuses non-loopback exposure without auth, because even a read-only MCP surface can expose project data, and operators may enable write/execute explicitly.
- On a loopback bind (the default), `/mcp` also refuses cross-origin / DNS-rebinding requests (a non-loopback `Host`, or a foreign `Origin`) with 403 *before* auth (`crossOriginError`, transport.ts), mirroring the Studio's guard. A local MCP client (no `Origin`, loopback `Host`) passes; on a deliberate non-loopback bind, auth is the control and the guard is skipped.

Policy context:
- `open_resource`, `access_resource`, `invoke_tool`, `propose_change` and `commit_change` accept the confirmation or grant context needed by policy adapters (`confirmed`, and `grant_token` where relevant).
- `propose_change` may require `confirmed: true` before staging sensitive or restricted proposed content; if policy returns `deny`, the broker must not persist the proposal.

## Path confinement
`confineToProject` delegates to the broker's `confineToRoot` (traversal + outward-symlink refusal), with MCP-friendly error messages. Verified by tests (`../../etc/passwd` rejected).

## FR-MCP-004 - no bulk-dump tool
The only agent loader is the lazy `bundleAgentBootstrap`; there is **no** bulk `bundleAgent`/`bundleData`/`bundleDirectory` tool. A whole-agent export, if ever needed, is an explicit `export_agent` tool with a confined recursive walk, not a default surface.

## FR-MCP-005 - `AuthProvider` port
Networking is an MCP-only concern, so the port lives in `mcp/src/auth.ts`: `AuthProvider` type, `noAuth` default, `bearerTokenAuth(token)` reference, `resolveAuthProvider(config, env)`, and `authMiddleware`. `createHttpApp(root, provider)` mounts the middleware on `/mcp`; `main()` resolves project config via the broker, then resolves the provider and **lifts the non-loopback refusal once auth is configured** (`config.auth` fn/descriptor, or `BASE_MCP_BEARER_TOKEN`). The safe-by-default refusal (`isLoopbackHost`/`remoteExposureError`) remains for the no-auth case. On success, `authMiddleware` attaches the provider's `principal` to `res.locals`; the HTTP handler wraps request handling in `withTraceActor(principal, …)`, so a deployment with per-person credentials gets per-person trace attribution (FR-TRACE-001).

```ts
// authenticate(req) => { ok: boolean, principal?: unknown }
export type AuthProvider = (req: express.Request) => Promise<{ ok: boolean; principal?: unknown }>;
```

Behaviour:
- **Default `NoAuth`** + bind `127.0.0.1` → zero friction for the local case.
- **Refuse accidental exposure:** a non-loopback `--host` (e.g. `0.0.0.0`) → `main()` exits before binding, unless `BASE_MCP_ALLOW_INSECURE_REMOTE=1` or an AuthProvider is configured. Protects the naive user without blocking the expert.
- **Reference adapter `bearerTokenAuth(token)`** - a 5-minute "good enough for a team" option between nothing and full OAuth. OAuth 2.1 remains a documented extension (`mcp/README.md` already sketches the reverse-proxy/OAuth production setup).

`auth` is supplied via `base.config.{json,mjs}` (resolved by the broker config resolver), via `BASE_MCP_BEARER_TOKEN`, or an MCP-local equivalent; consumed as Express middleware in `createHttpApp`.

## Cancellation (forward-compatible)
`searchResources` and `routeRequest` accept an optional `signal` (AbortSignal) threaded into the Ranker
`ctx` and on to async embedding providers (`@ai-swiss/base-ranker-semantic`). The MCP adapter does not
bind a per-request signal today, but the broker contract is ready: a host that wants to cancel a slow
embedding-backed route can pass one without a core change.

## How it's proven
- `tsc --noEmit` is clean; the lazy `bundleAgentBootstrap` is the only agent loader (no bulk `bundle*`).
- The published package embeds a copy of the broker (`scripts/bundle-core.mjs`); the copy is **stamped** (`dist/core-version.json`: root package version + commit) and the unauthenticated health route reports the stamp, so a drifted server/core pairing is visible from one curl, never invisible. `SERVER_VERSION` is read from the package's own `package.json`, not hardcoded.
- AuthProvider: `isLoopbackHost`, `remoteExposureError` (refusal lifted when auth configured), `bearerTokenAuth` (rejects/accepts), `resolveAuthProvider` (config fn/descriptor > env bearer > NoAuth), `authMiddleware` (401/next) - all tested.
- The tools (incl. the registered `route_request` handler) keep their behaviour and remain backward-compatible (NFR-CORE-002), with scope added to structured responses. Every root-scoped follow-up tool (`discover_resources`, `get_context_pack`, `open_resource`, `access_resource`, `invoke_tool`, `propose_change`, `commit_change`, `promote_resource`, `list_markers`) accepts one **optional, additive** `root_id` parameter in workspace mode. Read/write/execute/promote/list operations stay confined to the selected root; an undeclared `root_id` is rejected, and omitting `root_id` is rejected when several roots are visible.
