<!-- fr-synced: 6542bdf34420104d7e76c1b61c41528360c5f58e -->
# Updating BASE without breaking your work

This page is for the people who build on BASE: a freelancer, a small business, a school, or a public agency. It says what version 1.x guarantees and what may still change, so you can adopt BASE and update it without fear that a new release will break what you have built.

## Semantic versioning

Starting at **1.0**, BASE follows [Semantic Versioning](https://semver.org/lang/fr/):

- **MAJOR** (`2.0.0`): an incompatible change to the stable public surface (below).
- **MINOR** (`1.1.0`): backward-compatible additions (new commands, new optional fields, new extension points).
- **PATCH** (`1.0.1`): backward-compatible fixes.

## What 1.x guarantees (stable surface)

These elements do not change in an incompatible way without a **major** increment:

- **The resource format**: the `schema_version: base.resource.v1` frontmatter, its fields, and its `type` values. A file that is valid today stays valid.
- **The existing CLI commands**: `validate`, `index`, `inventory`, `discover`, `route`, `route-test`, `open`, `access`, `invoke`, `propose`, `commit`, `promote`, `markers`, `trace`, `build`, and `entretien`, with their documented flags.
- **The existing MCP tools**: their names and their parameters.
- **The projection schemas**: `base.manifest.v1`, `base.routing.v1`.
- **The extension-point contract**: `base.config` (rankers, validators, policy, auth) is purely **additive**, so your configuration keeps working.

This is the **NFR-CORE-002** commitment, the "no breakage" promise: what already exists keeps working from one version to the next.

## What may still change

- The **content** of derived projections (the details of a manifest, of a registry): these are regenerable projections, never a source of truth.
- The **ranking** of a router, since a better ranker can change the order of the candidates; the routing *contract* (statuses, abstention) stays stable.
- The optional **companion packages** follow their own versioning: `@ai-swiss/base-ranker-semantic` (embeddings), `@ai-swiss/base-index-local` (index at scale), `@ai-swiss/base-llm` (the LLM port, behind Studio and evaluation), and `@ai-swiss/base-eval` (evaluation). The core **requires none** of them: they are optional peers, installed only if you use the feature in question, and they add no third-party dependency to the core.
- The **examples** and the documentation may grow without notice.

## Runtime compatibility

- **Node.js >= 18.** The core is zero-dependency and tested in continuous integration on Node 18, 20, 22, and 24. The optional tools (evaluation, Studio) have their own dependencies, standard and isolated from the core.
- **Portable across tools.** The `CLAUDE.md`, `.cursor/rules/`, and `AGENTS.md` files are generated adapters; the portable core stays `.ai/`, the Markdown documents, and the local commands.
- **Portable across stacks.** From the specifications shipped with the framework (`specs/`), you can switch languages or libraries to rebuild equivalent features: an interface like Studio requires code, and therefore standard technical choices.

## Deprecations

When a stable element must go away, it is first **deprecated** (documented in the `CHANGELOG`, kept working for at least one minor version) before being removed in a **major** version.

See the [CHANGELOG](../../../CHANGELOG.md) for the history, and [Security and limits](../trust/securite-et-limites.md) for the honest boundary of the guarantees.
