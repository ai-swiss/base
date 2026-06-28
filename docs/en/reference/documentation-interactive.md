<!-- fr-synced: 73aa5063cc02dd7b4f51370e56c4f9e7fbf67133 -->
# Generate and publish a documentation site from your canonical files

Read or publish your BASE's documentation without ever copying it elsewhere: BASE generates a site, local or public, directly from the repository. The Markdown, JSON, and spec files stay the sources of truth, and the site is only an interactive projection of them (navigation by section, learning paths, explorer, system map, routing lab, quality, and resource pages). This serves anyone who wants a navigable view of the corpus without maintaining a second set of documentation that drifts.

The site's interface is bilingual, French by default with a toggle to English. The French version of each page is authoritative; see [Languages](langues.md). Content keeps the language of its source, in line with [BASE's languages](langues.md). The sidebar navigation is generated from `navigation.json`, the navigation projection of the documentation model: no list of pages is maintained by hand.

```mermaid
flowchart TD
    A[Canonical files (Markdown, JSON, specs)] --> B[Documentation model]
    B --> C[Interactive site]
    C --> D[View locally]
    C --> E[Internal static site]
    C --> F[Filtered public site]
    B --> G[Invariant validation]
    G --> F
```

## View locally

From the repository root:

```bash
npm run docs:serve
```

The command first generates the documentation model, then launches the Astro/Starlight site locally.

## Build a static site

To build an internal static site:

```bash
npm run docs:build
```

To build a public site, filtered to publishable resources:

```bash
npm run docs:build:public
```

To choose the deployable folder explicitly:

```bash
node tools/base.mjs docs build --public --out public-site
```

The resulting folder contains a static site. You can serve it with most hosts that support static HTML.

## Validate before publishing

```bash
node tools/base.mjs docs validate
```

Validation checks the model's invariants, in particular the exclusion of `.plans/` and `.temp/`, the public/internal separation, and local links.

## What the site shows

- the sidebar navigation: the corpus's sections (get started, understand, guides, profiles, trust, examples, reference), projected from the model;
- the resource pages: a rendering of the canonical sources, content first, with metadata and backlinks in a collapsible panel; the Markdown's internal links are rewritten to the site's pages;
- `Guided paths`: reading paths by need;
- `Concepts`: a visual explanation of route -> process -> validation -> write;
- `Guided examples`: a step-by-step tour of the copyable examples;
- `Explorer`: a structured, filterable inventory of the resources;
- `System map`: the repository's families and relationships;
- `Routing lab`: routing fixtures with requests and expectations;
- `Evidence`: promises tied to mechanisms, tests, and limits;
- `Quality`: errors, warnings, and inclusion policy;
- full-text search (Pagefind), built at static build time.

## Maintenance discipline

Do not write prose describing BASE directly into the site. Put it in the appropriate canonical file, then let the model project it. The site's pages must stay adapters, not a second set of documentation.
