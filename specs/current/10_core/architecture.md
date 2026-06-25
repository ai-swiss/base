# 10 · Architecture

> **For developers and maintainers.** The shape of BASE-the-tooling: the broker, the resource record, the five ports, the config resolver, and the façade/layout. Implements AD-CORE-001/002, AD-CONFIG-001.
>
> Owns: AD-* (architecture decisions)

## 1. Layers

```
        CLI (tools/base.mjs)          MCP server (mcp/src/index.ts)
                 │                              │
                 │            base-core-adapter.ts (imports ../../tools/base-core.mjs)
                 ▼                              ▼
        ┌───────────────────────────────────────────────┐
        │   BROKER  (tools/base-core.mjs — façade)        │
        │   inventory · validate · search · open ·        │
        │   access · invoke · propose · commit · build    │
        └───────────────┬─────────────────────────────────┘
                        │ depends on PORTS (interfaces), not concretions
   ┌──────────────┬─────┴──────┬──────────────┬───────────────┐
   ▼              ▼            ▼              ▼               ▼
FrontmatterParser Validator   Ranker      PolicyEnforcer   AuthProvider (MCP only)
core/frontmatter  core/        core/        core/            mcp/src/auth.ts
.mjs              validators   rankers      policy.mjs
                  .mjs         .mjs
```

- **Broker** = the single place guarantees live (the "Broker = guarantees" plane). Stateless; every function takes `root` and is pure w.r.t. the filesystem at that root.
- **Broker operations** (full set): `inventory · validate · search · route · open · access · invoke · propose · commit · promote · build · markers · index · trace · maintain`. Reads/searches consult **ports**; **route** chooses an agent→process (`routing.md`); writes go through **propose→commit** (`writes.md`); `build` emits **derived projections** (`build.md`). The five ports are the extension points; these are the operations that use them.
- **Ranker scores, Router chooses, Broker enforces** — three distinct responsibilities that must never collapse into one abstraction. The Ranker assigns an explainable score to a resource; the Router (`routeRequest`, `routing.md`) decides whether a route is usable, ambiguous, in need of clarification, or out of scope; the Broker enforces confinement, policy and trace. The Router is an *operation* that reuses the Ranker port — **not a sixth port**.
- **CLI** and **MCP** are thin adapters over the broker. The MCP additionally owns its own concern (`AuthProvider`), since networking is MCP-only.

## 2. Resource record (normative shape)

Every port receives a **resource record** produced by `inventoryResources` (FR-CORE-003). Ports must treat it as read-only:

```js
{
  id: string,                 // frontmatter id, else slug(path)
  type: string,               // frontmatter type, else deriveType(path)
  title: string,
  description: string,
  path: string,               // relative to root, POSIX separators
  schema_version: string|null,
  scope: "personal"|"team"|"org"|"public"|"enterprise-extension",   // default "personal"
  status: "draft"|"active"|"deprecated"|"archived",                 // default "active"
  sensitivity: "public"|"internal"|"confidential"|"sensitive"|"restricted", // default "internal"
  keywords: string[],
  requires: Array<{ ref: string, access?: "read"|"write"|"execute", purpose?: string }>,
  may_use: string[],
  use_when: string|null,      // optional routing signal: a sentence on WHEN to use this resource
  source: { connector?: string, locator?: string } | null,
  execution: { type?, runtime?, entrypoint?, dry_run?, requires_confirmation? } | null,
  metadata: object,           // raw parsed frontmatter
  frontmatter_errors: Array<{ line, code, message }>,
  content: string,            // full file text (incl. frontmatter)
  body: string                // text after frontmatter
}
```

Field domains are defined by the canonical `base.schema.json` (`base.resource.v1`) at the repo root - the `30_schemas/` chapter links it rather than copying it.

## 3. The five ports

A **port** is a plain function signature (Strategy as a function — no class hierarchy). The core ships one **default adapter** per port; integrators add more via `base.config.json` descriptors or trusted `base.config.mjs` adapters. Full contracts live in the per-port chapters; summary:

| Port | Signature | Default adapter | Chapter |
|---|---|---|---|
| `FrontmatterParser` | `parse(content) → {data, body, raw, errors}` | strict-subset parser | `frontmatter.md` |
| `Validator` | `(resource, notification, ctx) → void` | `coreSchemaValidator` | `validator.md` |
| `Ranker` | `(resource, terms, ctx) → {score, reasons[]} | Promise<...>` | `lexicalRanker` (neutral) | `ranker.md` |
| `PolicyEnforcer` | `(resource, action, ctx) → {decision, reason, grant?}` | `advisoryPolicy` | `policy.md` |
| `AuthProvider` (MCP) | `authenticate(req) → {ok, principal?}` | `NoAuth` | `mcp.md` |

**Dogfooding rule (NFR / principle):** the default adapter is always the **first element** of its pipeline — no special-casing. `[coreSchemaValidator, ...config.validators]`, `[lexicalRanker, ...config.rankers]`.

### The `ctx` object (passed to Validator / Ranker / PolicyEnforcer)
A small, explicit context. Minimum fields the core sets:

```js
ctx = {
  root: string,            // BASE root
  action?: "read"|"write"|"execute",   // policy only
  projection?: "metadata"|"instructions"|"full",
  purpose?: string,
  confirmed?: boolean,     // explicit human confirmation passed through CLI/MCP
  grantToken?: string,     // optional, for strict policy grants
  mode?: "discover"|"route",
  config: ResolvedConfig   // the resolved adapters (so ports can see siblings if needed)
}
```
Ports must tolerate missing optional fields. The set is intentionally minimal; it is extended only when a concrete adapter need is proven. Because `ctx` is an object, adding a field is additive and never breaks an existing adapter.

## 4. Config resolver & injection contract (AD-CONFIG-001)

### Resolution
`tools/core/config.mjs`:
```js
export const DEFAULTS = { rankers: [], validators: [], policy: null, auth: null, routing: null };

export async function resolveConfig(root, { configPath } = {}) {
  // 1. locate (configPath || root/base.config.json || root/base.config.mjs); confine via confineToRoot
  // 2. absent → return { ...DEFAULTS }
  // 3. JSON = declarative descriptors; MJS = trusted executable adapters
  // 4. instantiate and validate shape; on bad shape → throw base.config.invalid
  // 5. return { rankers:[...], validators:[...], policy, auth, routing } merged over DEFAULTS (always complete)
}
```

### Injection into existing functions — **no breaking change** (resolves the key ambiguity)

Existing broker functions keep their **current signatures**. They obtain config like this:

```js
export async function searchResources(root, query, { limit = 10, config } = {}) {
  const cfg = config ?? await resolveConfig(root);   // internal resolution by default
  const rank = composeRankers([lexicalRanker, ...cfg.rankers]);
  // …
}
```

- **Default path:** the function resolves config from `root` itself → callers (CLI, MCP adapter, existing tests) are unchanged.
- **Override path:** callers may pass `{config}` to inject a pre-resolved config (used by tests and by the CLI/MCP which resolve once and thread it to avoid re-reading the file per call).
- This satisfies NFR-CORE-002: no public signature changes; `{config}` is an additive optional field.

**Rule:** resolve config **once per top-level operation** (one CLI command, one MCP tool call) and pass it down via `{config}`; never resolve per resource in a loop.

## 5. Façade & file layout (AD-CORE-002)

`base-core.mjs` **remains the façade** and keeps exporting every name currently imported elsewhere — at minimum:

`confineToRoot, pathExists, walkResourceFiles, parseFrontmatter, inventoryResources, buildManifest, writeManifest, openResource, accessResource, invokeTool, validateBase, canAccessResource, searchResources, routeRequest, runRouteTests, deriveRoutingSignals, decideRoute, buildRoutingRegistry, createMaintenanceReport, recordEvent, summarizeTrace, proposeChange, commitChange, promoteResource, listMarkers, formatMarkers, formatRouteResult, formatRouteTestResult, buildArtifacts, writeArtifacts, formatValidationResult, formatSearchResults, formatMaintenanceReport, formatTraceSummary, SCHEMA_VERSION, MANIFEST_FILENAME, TRACE_DIR, CHANGES_DIR, ROUTE_TESTS_FILENAME, ROUTING_DEFAULTS`

The refactor extracts extension points into sibling modules; the façade re-exports them:

```
tools/
  base.mjs                 # CLI (unchanged contract; + --config)
  base-core.mjs            # FAÇADE: orchestration + re-exports (import path preserved)
  core/
    confine.mjs            # confineToRoot + pathExists
    codes.mjs              # stable error-code registry
    config.mjs             # resolveConfig + DEFAULTS
    frontmatter.mjs        # FrontmatterParser
    validators.mjs         # Validator port + coreSchemaValidator
    rankers.mjs            # Ranker port + lexicalRanker + semanticHybridRanker
    routing.mjs            # Router core: deriveRoutingSignals + decideRoute + registry (pure; not a port)
    policy.mjs             # PolicyEnforcer port + advisory/strict
mcp/src/
  index.ts                 # MCP server (+ AuthProvider wiring)
  auth.ts                  # AuthProvider port + NoAuth + bearerTokenAuth
  base-core-adapter.ts     # bridges MCP → broker (unchanged import path)
```

**Verification that the façade holds:** `cd mcp && npm run build` (tsc) + `npm test` must stay green after each extraction — they exercise the imported names.

## 6. Call flow (example: `base discover "devis"`)

```
CLI parse → searchResources(root, "devis", {})
  → cfg = resolveConfig(root)                 // loads base.config.json first, then base.config.mjs
  → inventoryResources(root)                  // parse frontmatter per file (FrontmatterParser)
  → rank = composeRankers([lexicalRanker, ...cfg.rankers])
  → score each resource, sort, slice(limit)
  → recordEvent(root, {op:"discover", ...})   // trace, never throws
  → formatSearchResults(...) → stdout
```

The same `resolveConfig → inventory → port → trace` skeleton underlies `validate` (Validator), `open`/`access` (PolicyEnforcer), and `invoke` (PolicyEnforcer + execution).
