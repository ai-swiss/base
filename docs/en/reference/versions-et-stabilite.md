<!-- fr-synced: 41619cb8b164066a55f26983d1f6aefd92b652d5 -->
# Updating BASE without breaking your work

This page is for the people who build on BASE: a freelancer, a small business, a school, or a public agency. It says what version 1.x guarantees and what may still change, so you can adopt BASE and update it without fear that a new release will break what you have built.

## Versioning policy

Starting at **1.0**, BASE uses `MAJOR.MINOR.PATCH` versions with an explicit compatibility policy:

- **MAJOR** (`2.0.0`): an incompatible change to the stable public surface that did not follow the deprecation path below.
- **MINOR** (`1.1.0`): backward-compatible additions (new commands, new optional fields, new extension points) and, after their announced window, removal of explicitly deprecated elements.
- **PATCH** (`1.0.1`): backward-compatible fixes.

## What 1.x guarantees (stable surface)

These elements do not change in an incompatible way without a **major** increment, except after an explicit deprecation and its transition window:

- **The resource format, [the `base.resource.v1` standard](le-standard.md)**: the `schema_version: base.resource.v1` frontmatter, its fields, and its `type` values. A valid file stays valid across minor versions; the one owned exception, documented in the CHANGELOG: a value nothing consumes (no mechanism, no known file) may be removed in a minor version (1.2.0 did so for eleven speculative `type` values).
- **The existing CLI commands**: `validate`, `index`, `inventory`, `discover`, `route`, `route-test`, `open`, `access`, `invoke`, `propose`, `commit`, `promote`, `context`, `markers`, `trace`, `build`, and `doctor`, with their documented flags.
- **The existing MCP tools**: their names and their parameters.
- **The projection schemas**: `base.manifest.v1`, `base.routing.v1`.
- **The extension-point contract**: `base.config` (rankers, validators, policy, auth) is purely **additive**, so your configuration keeps working, save for a key explicitly **deprecated** (see below).

This is the **NFR-CORE-002** commitment, the "no breakage" promise: what already exists and is not deprecated keeps working from one version to the next, and no removal happens without a prior deprecation (see below).

## What may still change

- The **content** of derived projections (the details of a manifest, of a registry): these are regenerable projections, never a source of truth.
- The **ranking** of a router, since a better ranker can change the order of the candidates; the routing *contract* (statuses, abstention) stays stable.
- The optional **companion packages** follow their own versioning: `@ai-swiss/base-ranker-semantic` (embeddings), `@ai-swiss/base-index-local` (index at scale), `@ai-swiss/base-llm` (the LLM port, which Studio and evaluation rely on), `@ai-swiss/base-eval` (the evaluation engine), and `@ai-swiss/base-docs-site` (the HTML renderer). The core **requires none** of them: they are installed only when you use the relevant feature and add no third-party dependency to the core.
- The **examples** and the documentation may grow without notice.

## Runtime compatibility

- **Node.js >= 18.** The core is zero-dependency and tested in continuous integration on Node 18, 20, 22, and 24. The optional tools (evaluation, Studio) have their own dependencies, standard and isolated from the core.
- **Portable across tools.** The `CLAUDE.md`, `.cursor/rules/`, and `AGENTS.md` files are generated adapters; the portable core stays `.ai/`, the Markdown documents, and the local commands.
- **Portable across stacks.** From the specifications shipped with the framework (`specs/`), you can switch languages or libraries to rebuild equivalent features: an interface like Studio requires code, and therefore standard technical choices.

## Updating: `base update` and its two channels

`base update` updates the framework itself. By default it follows the **stable** channel: it advances your clone to the **latest version tag** (`v1.x.y`), never beyond; what you run only changes at a release, which gives the versioning above its concrete meaning. Contributors who want the development head choose `base update --channel main`. A ZIP install has no git history: the command then honestly names the path (re-download the [latest published version](https://github.com/ai-swiss/base/releases/latest/download/base.zip) and replace the folder). Before any major update, keep a copy of your folder: your files are the one thing BASE cannot regenerate.

## Deprecation before removal

This is the normal path by which a surface disappears. An element first **deprecated**, documented as such in the `CHANGELOG`, keeps working for the length of the announcement, then it is removed after that window, including in a minor version. Deprecation is the compatibility courtesy: no removal happens without it, but the removal that follows does not necessarily wait for a major version.

1.5.0 carries out the three removals announced in 1.3.0. The `entretien` command is removed: its signals live in `base doctor` (dormant markers, missing descriptions, weak routing) and the raw marker query in `base markers`. The MCP `include_data` flag on `load_agent` is removed: a call still carrying it works identically, the unknown field being dropped before the handler sees it. The `routing.embedder` configuration key is removed: it had been inert since its 1.3.0 deprecation, and a configuration still carrying it gets a message naming the reference that replaced it, `routing.embedding_model`.

Two surfaces are deprecated. `base docs preview` remains functional, but its warning asks you to run
`base docs build --out <directory>` and then serve the static directory it produces. The `name`
alias for `label` in `base.workspace.json` remains readable and emits a warning; removing it waits
for a workspace contract version that permits that break.

See the [CHANGELOG](../../../CHANGELOG.md) for the history and the detail, and [Security and limits](../trust/securite-et-limites.md) for the honest boundary of the guarantees.
