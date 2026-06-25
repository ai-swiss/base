# 10 · Egress (model-locality control)

> **For developers and maintainers.** The security differentiator: a confidential resource, or any resource of a `local-only` root, never reaches a remote model — and every withholding is **said**, never silent. Implements FR-EGRESS-*, NFR-EGRESS-*. Source: `tools/core/egress.mjs`, the chokepoint threading in `tools/base-core.mjs` + `tools/core/writes.mjs`, and `mcpEgress` in `mcp/src/base-core-adapter.ts`.
>
> Owns: FR-EGRESS-*, NFR-EGRESS-*

## Why egress is its own control (not policy)

`PolicyEnforcer` (`policy.md`) gates by **sensitivity** for any action that passes through the broker door. EGRESS is orthogonal: it gates by **where the model runs**. A resource may be perfectly readable locally yet must never travel to a third-party model provider. The two compose — policy decides *whether the broker acts*, egress decides *whether the result may reach a remote model*.

## The one rule (FR-EGRESS-001)

`checkEgress({modelLocality, rootPolicy, resources})` is the single decision — zero-dependency, no taxonomy, no policy engine:

- a `local` model receives **everything** — `{allowed: resources, withheld: []}`;
- a `remote` model is denied every resource of a `local-only` root (reason `root_local_only`), then every resource with `confidential === true` (reason `confidential`), and allowed the rest.

It returns `{allowed, withheld: [{resource, reason}]}`. `rootPolicy` defaults to `any`. Only the exact string `"remote"` triggers withholding; any other locality is fully permissive, so a caller must pass `"remote"` to get protection.

`rootEgressPolicy(rootDir)` reads `egress` from `base.config.json` and returns `"local-only"` only when the value is exactly that, else `"any"` (a missing, unreadable, or malformed config → `"any"`). It is a **dedicated reader** because `resolveConfig`/`mergeConfig` drop the `egress` key — reading `cfg.egress` would silently leave a local-only root unprotected.

## Withholding is announced, never silent (FR-EGRESS-002)

`egressNotice(withheld)` returns `""` when nothing is held, else one human-readable line stating the count, splitting `confidential` documents from `local-only` documents, and giving the remedy (choose a local model). Every surface that withholds **substitutes or appends** this notice, so a partial context is always visible to the user and the model.

## The chokepoint (FR-EGRESS-003)

When a caller threads an `egress` context, the broker enforces the rule at every model-facing surface through the single `egressWithheld(resource, egress)` wrapper:

| Surface | Behaviour when withheld |
|---|---|
| `openResource` / `accessResource` | `content` becomes the notice; the result's `resource` sibling is reduced to `{id, type, path, withheld:true}` (no `content`/`body`/`description`/`title`/`metadata` leaks); the trace records `egress_withheld` |
| `inventoryResources` / `searchResources` / `routeRequest` / `listMarkers` | the resource's **existence** is hidden — absent from listings, candidates, scores, the route explanation, `next_question`, and marker output |
| `invokeTool` | refuses a confidential / local-only tool **before** resolving its entrypoint, so a dry-run cannot reveal the on-disk path |
| `proposeChange` / `promoteResource` | the diff (which embeds current content) is withheld; promote treats the resource as not-found, never revealing its id/path/scope |

The local CLI passes **no** `egress` context — the human at the terminal is trusted — so terminal reads are unchanged. The context is opt-in per call surface; the surface that makes it default-on is the MCP server.

## MCP defaults to remote (FR-EGRESS-004)

The MCP server cannot know whether its connecting client is a local or a cloud model, so it assumes the riskier case. `mcpEgress(broker, rootDir)` returns `modelLocality: "remote"` **unless** `BASE_MCP_ALLOW_CONFIDENTIAL=1` (the operator asserting a local client), and `rootPolicy` from `rootEgressPolicy`. Every MCP broker entry threads it, so a connecting cloud model is treated as remote by default — confidential and local-only resources are withheld until the operator opts in.

## One control point (NFR-EGRESS-001)

The decision lives **only** in `tools/core/egress.mjs` and the broker's `egressWithheld` wrapper. The three model-facing consumers — the Studio chat pack, the eval harness, and the MCP read surface — import the same rule rather than re-implementing it, so the guarantee cannot diverge by surface. The chat surface refuses a confidential edit with `BAD_REQUEST` and reports `egress.withheld`/`egress.notice`; the eval harness expurgates the context pack and says so in the system prompt.

## How it's proven

- The pure rule, the notice, and `rootEgressPolicy` (`tests/base-egress.test.mjs`).
- The read/write chokepoint — open/access withhold + sibling stripping, discover/inventory hide existence, a local-only root withholds even non-confidential resources, invoke refuses without leaking the entrypoint, propose withholds the diff, promote treats withheld as not-found (`tests/base-core.test.mjs`).
- The MCP remote-by-default posture and the `BASE_MCP_ALLOW_CONFIDENTIAL` release (`mcp/tests/index.test.ts`).
- The one-control-point invariant end-to-end through the harness and chat (`tests/base-egress.test.mjs`).

## Connected

- `policy.md` — the sensitivity gate egress composes with.
- `validator.md` — `confidential` (human-set boolean) and the `base.confidential.egress_hint` warning (FR-ONTOLOGY-002).
- `30_schemas/base.config.v1.json`, `base.workspace.v1.json` — the `egress: local-only|any` field.
