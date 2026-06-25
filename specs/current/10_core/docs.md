# 10 · Documentation Model (DOCS)

The documentation system is a projection over the repository, not a second source of truth.

Owns: FR-DOCS-*

## Contract

`base docs model` builds a deterministic `base.docs_model.v1` projection from the current BASE root.

The model includes:

- human documentation from `README.md`, `docs/`, `specs/` and example READMEs;
- operational Markdown from `.ai/agents/**` when it is useful for a local portal;
- route fixtures and selected schema/package JSON files;
- a resource list, graph, navigation model, search documents, warnings and errors.
- incoming backlinks and build-time route results for route fixtures.

The model excludes:

- `.plans/` and `.temp/`;
- `.git/`, `node_modules/`, build outputs and test reports;
- local traces, pending changes and generated experiment runs;
- nested generated BASE roots used by tests.

## Commands

```bash
base docs validate
base docs model
base docs serve
base docs build
base docs build --public
```

`base docs serve` writes the local model and launches the documentation site adapter.

`base docs build` writes a static-site model suitable for private deployment.

`base docs build --public` writes a public-filtered model. Public output must contain only resources publishable as public documentation.

`base docs build --out <dir>` writes the static site to a deployable directory. With `--public`, this is the public website artifact.

## Metadata Discipline

Documentation metadata must remain small. A field belongs in the baseline only when it drives at least one concrete mechanism:

- navigation;
- search or filtering;
- public/internal export;
- quality gates;
- learning paths;
- operational rendering.

Baseline documentation fields:

- `doc_role`
- `audience`
- `learning_level`
- `related`
- `expose_in_docs`

Do not add a broad topic-ownership field by default. If duplicate ownership becomes a real maintenance problem, introduce a narrow, tested mechanism then.

## Presentation Boundary

The Astro/Starlight site is an adapter over the docs model. The docs model lives in `tools/docs/` and must remain usable by CLI, tests, Studio and future presentation surfaces.

Studio may link to or embed the read-only documentation surface, but write behavior remains Studio's responsibility and goes through propose -> commit.

The site adapter exposes model-backed surfaces:

- a landing page with value proposition, quick-start doors and audience doors;
- learning paths;
- resource explorer with client-side filtering;
- system map;
- routing lab from route fixtures, with client-side filtering;
- example walkthroughs;
- concept explanation;
- evidence page;
- quality page from warnings, errors and family inclusion policy;
- resource pages that render canonical source files at build time;
- a full-text search index built over all rendered pages at static build time.

Route fixtures are not only displayed as static examples. The model also stores the route result computed at build time, so the Routing Lab has receipts from the real router while remaining static-deployable.

### Chrome languages

The site chrome (navigation labels, page headings of generated pages, UI strings) is bilingual: French is the default locale at the site root, English is served under `/en/` with a language switcher. Rendered content keeps the language of its source file, per the corpus language policy (`docs/reference/langues.md`): the method corpus is French, the engineering specs are English.

### Sidebar contract

The sidebar is generated from the model's navigation projection (`navigation.json`). No hand-maintained page list is allowed in the site adapter. The sidebar is navigation, not inventory:

- the editorial corpus is regrouped into reader-journey sections by canonical path, not by folder, one menu per reading mode: a pinned Home link, then Discover BASE (see and try), Understand BASE (the conceptual pages), Get started (a compass page then three profile sub-sections: Solo or SME, Install your tool, Organisation and public sector), Learn by doing (nested by palier: Discovery, Practitioner, Team), Build your assistants (with Scale up nested as its advanced tail), Examples, Trust and evidence. Each section's pages come from the model; an empty section is dropped. Reference, the generated model pages ("Explore the corpus"), the specifications and the package front doors follow, in that order;
- machine files are excluded from the sidebar (JSON files outside `specs/`, repository templates); they remain reachable through the Explorer and the search index. JSON schemas under `specs/` stay, as part of the published contract;
- pages whose sidebar presence would mislead rather than guide are excluded (Explorer and search keep them): the README variants, whose front-door role the landing pages already serve; the manifesto translations, because the French manifesto is canonical and links them from its header; the raw `LICENSE` text, which `docs/trust/licence.md` explains; and the generated harness artifacts (`AGENTS.md`, `CLAUDE.md`, `BASE_BOOTSTRAP.md`, `.ai/tools.md`), which are written for AI tools, not for readers;
- the `operations` section (every `AGENT.md`/`SKILL.md`, local target only) is excluded as a whole; the Explorer serves it with filtering;
- the catch-all `reference` section is split by reading intent into: reference docs (`docs/reference/`), project pages (repository root, `.ai/` reference files and press), current specifications (`specs/`), and package front doors (`README.md` files only; a package's ancillary files belong to its README and the Explorer);
- the generated, model-driven pages (Explorer, system map, routing lab, evidence, quality, learning paths, concepts, example walkthroughs) plus the interactive-documentation page form an "Explore the corpus" group;
- a section may pin a reading order by canonical path; pinned pages come first in pinned order, every other page follows in model order, so new pages still appear without touching the adapter. A section may also nest sub-groups by membership (`nestMembership`, paths or prefix, top pins then sub-groups in declared order): the start section's three profile sub-sections and its installer group, the tutorial's three paliers, and the «Scale up» tail under Build. In the examples section each example nests as one group labelled by its front door, with the section hub at the top level;
- the previous/next reading rail on every page follows the sidebar order, so the pinned reading order is also the page-to-page path through the corpus;
- long-tail groups are collapsed by default; entry groups stay expanded;
- every label inside a group must identify its page on its own: colliding titles are disambiguated with the owning example, package or agent, then with the trailing path if still ambiguous.

### Resource page contract

A resource page renders the canonical source file, content first. The shell renders the page title once (from the frontmatter); the source file's own leading H1 is stripped from the rendered page, so no page shows its title twice (the source keeps its H1, for raw reading and the tutorial's measured-duration marker). The frontmatter description is metadata — search, cards, link previews — and is not rendered as an on-page subtitle, so the page's visible lead is its first body paragraph, which must be stakes-first. The site header is an endorsement lockup matching Studio: the AI Swiss mark, a hairline divider, «BASE» in the brand red, «Documentation» in slate. Metadata (role, type, sensitivity, level, audience, source path), backlinks and route examples sit in a collapsible panel after the content, with the projection note. Heading anchors must equal the model's heading slugs so the page outline and deep links stay aligned. Internal Markdown links are rewritten to the matching resource page when the target is part of the model, and to the repository URL otherwise; relative images resolve to repository URLs.

The reader-journey grouping, the single-title shell, the brand lockup, the front-page «ask your AI» entry and the editorial law (stakes first — never an audience or self-presentation opening — tool and vendor neutrality, and one clear title whose lead is the first body paragraph, the description kept as preview metadata) hold across the docs site. Durable documentation decisions are recorded as ADRs under `decisions/`. Private `.plans/` notes may inform those decisions, but are not documentation sources.
