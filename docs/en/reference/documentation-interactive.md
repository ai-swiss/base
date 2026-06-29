<!-- fr-synced: e06cdfab227d9faa1b5bec0c724cb42aebc78591 -->
# Generate and publish a documentation site from your canonical files

Read or publish your BASE's documentation without ever copying it elsewhere: BASE builds a site, local or public, straight from the repository. The Markdown, JSON, and spec files remain the sources of truth, and the site is merely an interactive projection of them (navigation by section, learning paths, explorer, system map, routing lab, quality, and resource pages). It serves anyone who wants a navigable view of the corpus without maintaining a second set of documentation, one bound to drift from the first.

The site's interface is bilingual: French by default, with a toggle to English. The French version of each page is authoritative; see [Languages](langues.md). Each piece of content keeps the language of its source, in line with [BASE's languages](langues.md). The sidebar navigation is generated from `navigation.json`, the navigation projection of the documentation model: no list of pages is kept by hand.

## View locally

From the repository root:

```bash
npm run docs:serve
```

The command first builds the documentation model, then launches the Astro/Starlight site locally.

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

The resulting folder contains a static site. You can serve it from most hosts that support static HTML.

## Validate before publishing

```bash
node tools/base.mjs docs validate
```

Validation checks the model's invariants, in particular the exclusion of `.plans/` and `.temp/`, the separation between public and internal, and the integrity of local links.

## What the site shows

- the sidebar navigation: the corpus's sections (get started, understand, guides, profiles, trust, examples, reference), projected from the model;
- the resource pages: a rendering of the canonical sources, content first, then metadata and backlinks in a collapsible panel; the Markdown's internal links are rewritten to the site's pages;
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

Never write prose describing BASE directly into the site. Put it in the appropriate canonical file, then let the model project it. The site's pages must stay adapters, and not a second set of documentation.
