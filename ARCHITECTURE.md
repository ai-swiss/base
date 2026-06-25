# Architecture

A bird's-eye map for contributors. It names the parts and the rules that hold them together, so a
newcomer can find their way without reading everything. It deliberately avoids line numbers (they
rot); names of modules and types are stable enough to grep. Revisit it a couple of times a year, not
on every change.

For *how to work* the repo (the workflow, the gates, the one command), read
[`DEVELOPING.md`](DEVELOPING.md). For *what BASE is and must do*, read [`specs/`](specs/README.md).
This file is the territory between them: the shape of the code.

## What BASE is, in one paragraph

BASE turns a folder of Markdown into AI assistants a team can read, verify and correct. A **resource**
is a Markdown (or JSON) file with a small typed frontmatter (`base.resource.v1`). The core **inventories**
those files, **routes** a request to the right agent and process, **packs** the context a run declares,
and **mediates every write** through a propose → human-reviewed diff → commit gate. Everything is local
and inspectable; nothing leaves the machine unless an explicit egress policy allows it. There is **no
runtime dependency** in the core — Node's standard library only.

## The three planes (where every fact lives)

Truth, change, and scratch never mix. The discipline is stated in
[`specs/current/00_overview/les-deux-plans.md`](specs/current/00_overview/les-deux-plans.md).

- **Truth** — what BASE *is*, stated statuslessly, with its proof: [`specs/`](specs/README.md), the code,
  and its tests. To learn the current state, read `specs/` first, then the code — never a plan.
- **Change** (tracked) — *why* it is so and what changed: [`decisions/`](decisions/index.md) (ADRs) and
  `CHANGELOG.md`.
- **Scratch** (personal, gitignored) — working plans and dated reviews: `.plans/`, `.reviews/`, `.temp/`.

## Codemap

- **`tools/core/`** — the functional core, dependency-free and pure where it can be: `rankers.mjs`
  (lexical routing), `context-pack.mjs` (resolve a process's declared references under a token budget),
  `egress.mjs` (the model-locality chokepoint), `frontmatter.mjs` (parse once), `roots.mjs` /
  `perimeter.mjs` (what a directory *is*: root, workspace, collection), `fswalk.mjs`, `confine.mjs`.
- **`tools/base-core.mjs`** — the broker façade over core: `inventoryResources`, discovery, routing,
  the propose/commit write path, tool invocation. The imperative shell around the pure core.
- **`tools/base.mjs`** — the CLI entry point (every `base <command>`).
- **`tools/spec/`** — the spec apparatus: the requirements→tests **matrix**, the id grammar and
  immutability/namespace gates. It proves the spec; it is not part of the shipped runtime.
- **`tools/docs/`** — the documentation model + hygiene gates (em-dash, lexique, tree, statusless).
- **`tools/studio/`** — the local workshop. `server.mjs` is a hand-rolled JSON-over-HTTP API (loopback
  only, no auth); `ui/` is a React/Vite app. Both write **only** through the same broker gate as the CLI.
  Spec'd by `FR-STUDIO-*`.
- **`mcp/`** — the Model Context Protocol server (TypeScript): the same broker primitives, exposed to
  AI tools. Spec'd by `FR-MCP-*`.
- **`packages/`** — optional, separately-publishable units (the semantic ranker, the local index, the
  docs site). Not dependencies of the core.
- **`exemples/`** — standalone sample BASE projects, each validated in isolation.
- **`specs/`** — the engineering truth: `current/10_core/requirements.md` (the IDs) and the generated
  `requirements-matrix.md` (the proof). `decisions/` holds the ADRs.

## Invariants (the rules a change must not break)

These are the "absence of" rules — the ones worth stating because they are easy to erode:

- **Zero runtime dependencies in the core.** The optional packages may have their own; the core may not.
- **The inventory is a fresh disk walk.** Nothing caches a projection of the corpus that could drift; the
  one derived artifact, `base.manifest.json`, is regenerated and diffed in CI.
- **One write path.** Every mutation (CLI, Studio, MCP) goes through propose → diff → commit. Nothing
  writes a file without a diff the human can refuse. Refusing writes nothing.
- **Egress withholds, never silently drops.** A confidential resource bound for a remote model is
  replaced by an explicit notice, in the trace and in front of the model — never quietly omitted.
- **One source of truth per piece of state.** Whatever can be derived is derived (kinds, routing signals,
  the matrix). Storing a copy schedules a divergence.
- **Truth lives in `specs/`, not in a change record.** Code and spec leaf change in the same PR, or the PR
  declares `[SPEC-NEUTRAL: reason]`.
- **A nested root is isolated.** A directory carrying `base.config.json`, the manifest, or
  `base.workspace.json` is its own root and never merges into a parent's inventory.

## The apparatus (what keeps it honest)

The discipline is gate-enforced, not trusted. One command runs everything before a push:

```bash
npm run check
```

It chains the spec gates (`spec:check` — matrix freshness + id immutability + namespace + leaf + markers
+ docs hygiene), the typecheck, `validate`, `route-test`, the docs model, and the full test suite. The
requirements matrix scans the backend, the optional packages, the MCP server, **and** the Studio UI/E2E
tests, so a requirement's proof is visible across every layer. The per-gate registry is
[`docs/reference/gates.md`](docs/reference/gates.md); the development workflow is in
[`DEVELOPING.md`](DEVELOPING.md) and [`specs/README.md`](specs/README.md).

## Where to start

When unsure of a shape, copy a working example rather than your memory: the `exemples/` projects are each
end-to-end and green. To change behavior, find its `FR-*` requirement in `specs/current/10_core/`, read
the test that proves it, then change code, spec, and test together.
