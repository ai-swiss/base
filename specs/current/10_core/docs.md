# 10 · Documentation Model (DOCS)

The documentation system is a projection over the repository, not a second source of truth.

Owns: FR-DOCS-*

## Contract

`base docs model` builds a deterministic `base.docs_model.v2` projection from the current BASE root.

The model includes:

- human documentation from `README.md`, `docs/`, `specs/` and example READMEs;
- operational Markdown from `.ai/agents/**` when it is useful for a local portal;
- route fixtures and selected schema/package JSON files;
- a resource list, graph, navigation model, search documents, warnings and errors.
- incoming backlinks and build-time route results for route fixtures.

Each structured resource exposes its authored `id` as semantic identity. A resource without authored
metadata uses its path-derived `site_key` as its fallback `id`. Every resource also exposes a
deterministic, globally unique `site_key`: the readable path slug when that slug is unique, otherwise
the slug plus an injective base64url encoding of the source path. Site routes, navigation links,
backlinks, search document keys and graph node/edge keys use `site_key`, never semantic `id`.
`source_id` is not a resource field. Backlinks retain `source_id` as the referring resource's semantic
identity and add `source_site_key` as their unambiguous route key.

`resource_aliases` contains `{ id, site_key }` entries only for authored IDs that occur exactly once
in the target model and do not collide with a canonical site key. The site emits
`/resources/<id>/` as a permanent redirect to `/resources/<site_key>/` for those entries. Repeated
authored IDs are legitimate across nested roots and never receive an ambiguous alias.

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

The static site is provided by the optional `@ai-swiss/base-docs-site` package. The core resolves
that package by name, first beside the running engine and then from the target root. It never relies
on a contributor-repository path. If the companion is absent, the command refuses before reading
the corpus and names the installation command. Relative output paths resolve inside the target root;
no generated model or site is written into an installed package.

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

### Translation and typography gates

Two documentation gates read the language of the content they judge instead of assuming French.

`check-translations` requires a fresh `fr-synced` marker on every translation of a French source: the locale mirrors under `docs/en|de|it/`, hashed against the page they shadow, and the per-language word tables `tools/core/lang/{en,de,it}.mjs`, hashed against `tools/core/lang/fr.mjs`. A word table is a translation in the same sense as a mirror (every key of the French table, only the words changed), so a reworded `fr.mjs` must fail the gate rather than leave the tables silently stale. The marker is spelled `<!-- fr-synced: <hash> -->` in Markdown and `// fr-synced: <hash>` in a source file, which has no HTML comments. A locale this build carries no table for is absent, never a failure.

`check-punctuation` applies Swiss-romand typography to French content only. A nested root met while walking `docs/`, `exemples/` and `.ai/agents/` (a directory carrying its own `base.config.json`) is skipped whole when that config declares a language other than French, and the run names it with the declared language: BASE writes such a root's files in its own language (`core/lang/`), and judging a German example root by French rules flags correct typography. The walk starts in French and only a nested root changes that, since `docs/` is the framework's own documentation, authoritative French by policy whatever this repository's `language` key says.

### Sidebar contract

`navigation.json` is the final navigation authority. It contains the ordered bilingual tree consumed
by presentation adapters, including group order, pinned page order, nesting, collapsed state,
generated links and reasoned exclusions. A modeled resource must occur exactly once in that tree or
exactly once in `exclusions`; an unclaimed or multiply claimed resource fails model validation. The
site adapter holds no page membership, pin or exclusion list. It only reads this tree, supplies a
translated item title when a locale mirror exists, disambiguates colliding display labels and emits
Starlight's shape. The sidebar is navigation, not inventory:

- the editorial corpus is regrouped into reader-journey sections by canonical path, not by folder, one menu per reading mode: a pinned Home link, then Discover BASE (see and try), Understand BASE (the conceptual pages), Get started (a compass page then three profile sub-sections: Solo or SME, Install your tool, Organisation and public sector), Learn by doing (nested by palier: Discovery, Practitioner, Team), Build your assistants (with Scale up nested as its advanced tail), Examples, Trust and evidence. Each section's pages come from the model; an empty section is dropped. Reference, the generated model pages ("Explore the corpus"), the specifications and the package front doors follow, in that order;
- machine files are excluded from the sidebar (JSON files outside `specs/`, repository templates); they remain reachable through the Explorer and the search index. JSON schemas under `specs/` stay, as part of the published contract;
- pages whose sidebar presence would mislead rather than guide are excluded (Explorer and search keep them): the README variants, whose front-door role the landing pages already serve; the manifesto translations, because the French manifesto is canonical and links them from its header; the raw `LICENSE` text, which `docs/trust/licence.md` explains; and the generated harness artifacts (`AGENTS.md`, `CLAUDE.md`, `BASE_BOOTSTRAP.md`, `.ai/tools.md`), which are written for AI tools, not for readers;
- the `operations` section (every `AGENT.md`/`SKILL.md`, local target only) is excluded as a whole; the Explorer serves it with filtering;
- the catch-all `reference` section is split by reading intent into: reference docs (`docs/reference/`), project pages (repository root, `.ai/` reference files and press), current specifications (`specs/`), and package front doors (`README.md` files only; a package's ancillary files belong to its README and the Explorer);
- the generated, model-driven pages (Explorer, system map, routing lab, evidence, quality, learning paths, concepts, example walkthroughs) plus the interactive-documentation page form an "Explore the corpus" group;
- the canonical generator may pin a reading order by canonical path; pinned pages come first in pinned order, every other claimed page follows in model order. It may also nest sub-groups by explicit membership or prefix: the start section's three profile sub-sections and its installer group, the tutorial's three paliers, and the «Scale up» tail under Build. In the examples section each example nests as one group labelled by its front door, with the section hub at the top level;
- the previous/next reading rail on every page follows the sidebar order, so the pinned reading order is also the page-to-page path through the corpus;
- long-tail groups are collapsed by default; entry groups stay expanded;
- every label inside a group must identify its page on its own: colliding titles are disambiguated with the owning example, package or agent, then with the trailing path if still ambiguous.

### Resource page contract

A resource page renders the canonical source file, content first. The shell renders the page title once (from the frontmatter); the source file's own leading H1 is stripped from the rendered page, so no page shows its title twice (the source keeps its H1, for raw reading and the tutorial's measured-duration marker). The frontmatter description is metadata (search, cards, link previews) and is not rendered as an on-page subtitle, so the page's visible lead is its first body paragraph, which must be stakes-first. The site header is an endorsement lockup matching Studio: the AI Swiss mark, a hairline divider, «BASE» in the brand red, «Documentation» in slate. Metadata (role, type, sensitivity, level, audience, source path), backlinks and route examples sit in a collapsible panel after the content, with the projection note. Heading anchors must equal the model's heading slugs so the page outline and deep links stay aligned. Internal Markdown links are rewritten to the matching resource page when the target is part of the model, and to the repository URL otherwise; relative images resolve to repository URLs.

The reader-journey grouping, the single-title shell, the brand lockup, the front-page «ask your AI» entry and the editorial law (stakes first, never an audience or self-presentation opening; tool and vendor neutrality; and one clear title whose lead is the first body paragraph, the description kept as preview metadata) hold across the docs site. Durable documentation decisions are recorded as ADRs under `decisions/`. Private `.plans/` notes may inform those decisions, but are not documentation sources.

The editorial doctrine distinguishes four objects without using one as shorthand for another:

- the method is how work is conducted, including its steps, authoritative sources, rules, controls and human decisions;
- the BASE structure is the resources and relations that describe the method;
- the reference is the approved, versioned description of the method at a given point;
- execution is what one model, tool or integration actually does from that reference in a given context.

A structure is not the method itself, and a reference is not an execution or a guarantee of behavior.
French operational prose names the object responsible for each claim. Mechanical vocabulary checks
lock only exact, previously observed dangerous claims; they do not ban a word merely because that word
can occur in an overclaim.

The repository front door begins with the person's intent, not the file format or the project itself.
Its first screen must make the complete capability understandable without prior vocabulary: describe
known work, let the AI tool propose a structure, approve it, then use, verify and improve the method.
It recognizes the same underlying need for an individual, an educator, an organization and an AI
practitioner, then asks whether their method can be examined, improved and passed on outside the
product that executes it.
It names the distinct roles of procedures, knowledge, authoritative sources, controls and human
decisions before introducing their technical representation. The explanation then establishes why
structured information changes model use and presents AI literacy as the practical ability to choose
context, authority, delegation and verification. It must distinguish BASE from the model and harness,
and place meaningful limits beside the mechanisms they bound.
The complete README is a compact, self-contained map rather than an encyclopedia. It must answer what
BASE changes, show one verifiable example, provide executable starts for trying, creating and importing,
explain why documents alone are insufficient, summarize roles and boundaries, then route by reader
intent to the canonical pages for learning, knowledge structure, organizational adoption, integration,
security, evidence, implementation status and contribution. Link labels describe the destination.
Removing detail from the README is valid only when one useful sentence and a direct canonical link
preserve its discoverability. An AI tool that receives only the public README URL must be able to answer
the first-contact question from that page and follow a bounded link for a more specific question.
At organizational scale, the README presents BASE as a proposed open convention for the methods,
knowledge, authoritative sources, controls and human decisions that AI must mobilize. One reference
structure may serve a bounded AI layer in an ERP, a more capable harness or an MCP integration, while
each context retains its own permissions, tools and results. Neutrality applies to the owned reference
method, never to the entire execution stack or to identical behavior across models.
