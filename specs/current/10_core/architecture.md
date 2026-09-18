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

- **Broker** = the single place guarantees live (the "Broker = guarantees" plane). Stateless; every function takes `root` and is pure with respect to the filesystem at that root.
- **Broker operations** (full set): `inventory · validate · search · route · open · access · invoke · propose · commit · promote · build · markers · index · trace · maintain`. Reads and searches consult **ports**; **route** chooses an agent→process (`routing.md`); writes go through **propose→commit** (`writes.md`); `build` emits **derived projections** (`build.md`). The five ports are the extension points; these are the operations that use them.
- **Ranker scores, Router chooses, Broker enforces:** three distinct responsibilities that must never collapse into one abstraction. The Ranker assigns an explainable score to a resource; the Router (`routeRequest`, `routing.md`) decides whether a route is usable, ambiguous, in need of clarification, or out of scope; the Broker enforces confinement, policy and trace. The Router is an *operation* that reuses the Ranker port, **not a sixth port**.
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
  execution: { type?, runtime?, entrypoint?, requires_confirmation? } | null,
  metadata: object,           // raw parsed frontmatter
  frontmatter_errors: Array<{ line, code, message }>,
  content: string,            // full file text (incl. frontmatter)
  body: string                // text after frontmatter
}
```

Field domains are defined by the canonical `base.schema.json` (`base.resource.v1`) at the repo root; the `30_schemas/` chapter links it rather than copying it.

**Path identity is POSIX on every OS.** A resource's `path` uses forward slashes on every platform, so a corpus inventoried on Windows reads identically to the same corpus on Linux or macOS, and the value every downstream surface keys on (the manifest, the routing cache, the maintenance lens) is stable across machines. The rule extends to every path BASE *records* rather than merely reads: the `framework_dir` written into `base.config.json` and the user-global config is normalized the same way. The Windows smoke leg (CI) guards this against a native-separator regression, as it guards the CRLF class (NFR-CORE-004).

## 3. The five ports

A **port** is a plain function signature (Strategy as a function, no class hierarchy). The core ships one **default adapter** per port; integrators add more via `base.config.json` descriptors or trusted `base.config.mjs` adapters. Full contracts live in the per-port chapters; summary:

| Port | Signature | Default adapter | Chapter |
|---|---|---|---|
| `FrontmatterParser` | `parse(content) → {data, body, raw, errors}` | strict-subset parser | `frontmatter.md` |
| `Validator` | `(resource, notification, ctx) → void` | `coreSchemaValidator` | `validator.md` |
| `Ranker` | `(resource, terms, ctx) → {score, reasons[]} | Promise<...>` | `lexicalRanker` (neutral) | `ranker.md` |
| `PolicyEnforcer` | `(resource, action, ctx) → {decision, reason, grant?}` | `advisoryPolicy` | `policy.md` |
| `AuthProvider` (MCP) | `authenticate(req) → {ok, principal?}` | `NoAuth` | `mcp.md` |

**Dogfooding rule (NFR / principle):** the default adapter is always the **first element** of its pipeline, with no special-casing. `[coreSchemaValidator, ...config.validators]`, `[lexicalRanker, ...config.rankers]`.

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
Ports must tolerate missing optional fields. The set is intentionally minimal; it is extended only when a concrete adapter need is proven. Because `ctx` is an object, adding a field never breaks an existing adapter.

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

`base-core.mjs` **remains the façade** and keeps exporting every name currently imported elsewhere, at minimum:

`confineToRoot, pathExists, walkResourceFiles, parseFrontmatter, inventoryResources, buildManifest, writeManifest, openResource, accessResource, invokeTool, validateBase, canAccessResource, searchResources, routeRequest, runRouteTests, deriveRoutingSignals, decideRoute, buildRoutingRegistry, createMaintenanceReport, recordEvent, summarizeTrace, proposeChange, commitChange, promoteResource, listMarkers, formatMarkers, formatRouteResult, formatRouteTestResult, buildArtifacts, writeArtifacts, formatValidationResult, formatSearchResults, formatMaintenanceReport, formatTraceSummary, SCHEMA_VERSION, MANIFEST_FILENAME, TRACE_DIR, CHANGES_DIR, ROUTE_TESTS_FILENAME, ROUTING_DEFAULTS`

The refactor extracts extension points into sibling modules; the façade re-exports them:

```
tools/
  base.mjs                 # CLI: dispatch + thin handlers (cli/init.mjs holds `base init`)
  base-core.mjs            # FAÇADE: orchestration + re-exports (import path preserved)
  core/
    confine.mjs            # confineToRoot + pathExists
    codes.mjs              # stable error-code registry
    config.mjs             # resolveConfig + DEFAULTS
    frontmatter.mjs        # FrontmatterParser (reader; re-exports the emitter below)
    frontmatter-serialize.mjs # the emitter half: serializeFrontmatter + composeMarkdown
    trace.mjs              # the operational journal: recordEvent + summarizeTrace + pruneTrace
    projections.mjs        # what `base build` writes: which entry points, and never a hand-owned file
    lang/
      index.mjs            # stringsFor(language): the words of every generated file
      fr.mjs               # the French table — the default and the per-key fallback
      en.mjs               # the English table — full, every key of fr.mjs
    validators.mjs         # Validator port + coreSchemaValidator
    rankers.mjs            # Ranker port + lexicalRanker + semanticHybridRanker
    routing.mjs            # Router core: deriveRoutingSignals + decideRoute + registry (pure; not a port)
    policy.mjs             # PolicyEnforcer port + advisory/strict
mcp/src/
  index.ts                 # MCP server (+ AuthProvider wiring)
  auth.ts                  # AuthProvider port + NoAuth + bearerTokenAuth
  base-core-adapter.ts     # bridges MCP → broker (unchanged import path)
  format.ts                # what the server says: payload shape + the text beside it
```

**Verification that the façade holds:** `cd mcp && npm run build` (tsc) + `npm test` must stay green after each extraction; they exercise the imported names.

**`core/lang/` — the words of the generated files.** Every string BASE writes INTO A USER'S FOLDER is a table entry, not a literal at its render site: the router body and the four entry points (`bootstrap.mjs`), the routing index tree (`index-md.mjs`), the `base init` scaffold (`perimeter.mjs`). `stringsFor(language)` resolves them, merging **key by key** over French (`{ ...FR, ...TABLE[language] }`), so a partial table yields a partly-translated file rather than a file with holes, and an **unknown language returns French instead of throwing** — a root must never become unloadable for naming a language this build has not been taught. Each renderer takes an optional trailing `lang` defaulting to French, so every existing call site is unchanged. **Which language a root gets is its own declaration**, `language` in `base.config.json` (FR-CONFIG-001), normalized to its primary subtag: a table is written per language, not per region. Four full tables ship today, `fr` (the default), `en`, `de` and `it`. In a translated table the identifiers do not move (paths, commands, frontmatter keys, `{placeholder}`s, and the scaffolded process id `importer-l-existant`), each language answers to its own typography (German „Anführungszeichen", Italian «virgolette»; the em-dash gate reads French content only), and the two card labels are bound to the router: `cardUseWhen` must be one of the headings `WHEN_TO_USE_HEADINGS` recognizes, so `en` says exactly `**When to use**`, `de` `**Wann verwenden**` and `it` `**Quando usare**`, and a body section with that heading keeps routing.

Three things stay OUT of the table, each for its own reason: **CLI messages** (what the terminal prints is read by the person running the command, not by the agent reading the folder); the **`MCP_*` constants** in `bootstrap.mjs` (English on purpose, read by clients that never open these files); and the exported **`ATTRIBUTION_LINE`** (what `upgrade` APPENDS to an older root's README, and those roots are French). The credit written INTO a fresh README does follow the root's language, since what `upgrade` and `doctor` match is the `a-i.swiss` URL, which every translation keeps.

It is a **directory**, not a flat `core/strings-fr.mjs`, because `tests/architecture.test.mjs` caps every `tools/core/*.mjs` at 450 lines reading that directory non-recursively: a table that grows one object per language must sit one level down, where it cannot push `perimeter.mjs` over the cap.

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
