# @ai-swiss/base-docs-site

Official **optional** documentation site adapter for BASE — it renders the `base.docs_model.v2`
projection of YOUR BASE root as a static Astro/Starlight site, **without becoming a dependency of the
BASE core**.

## Why it is a separate package

The core is zero-dependency: `base validate` must run on bare Node, offline, forever. This adapter
needs Astro, Starlight and Pagefind, a closure of a few hundred packages and roughly 180 MB once
installed. Nobody should pay that to validate a corpus, so the site travels as a package you install
the day you want HTML, and never before. That is also why the CLI resolves it **by package name**:
a team that installed `@ai-swiss/base` gets exactly the same command as a contributor working in the
repository.

## Install and build

```bash
npm install @ai-swiss/base-docs-site
base docs build --root . --out public-site        # or: node .ai/base.mjs docs build --out public-site
base docs build --public --root . --out public-site   # public-filtered target
```

`base docs build` writes the documentation model first, then hands it to this adapter; the result is a
deployable folder of static HTML, with the Pagefind search index built in. Without `--out`, the site
lands in `.base-docs/<target>/site` inside your root. `base docs serve` runs the same adapter in
development mode on the loopback interface.

Requires Node **>= 22.12** (Astro's own floor; the BASE core supports >= 18). The CLI checks this
before launching and says so in one line.

## The contract with the CLI

The adapter reads no repository path of its own. Everything it needs arrives as environment, which is
what makes it installable anywhere:

| Variable | What it carries |
| --- | --- |
| `BASE_DOCS_ROOT` | the BASE root whose canonical files the resource pages render |
| `BASE_DOCS_MODEL_DIR` | the written model projections (`model.json`, `navigation.json`, …) |
| `BASE_DOCS_DIST` | where the built site is written |
| `BASE_DOCS_SITE` | the public site URL for canonical links and the sitemap |

`base docs build|serve|preview` sets them. Setting them by hand and calling `base-docs-site build`
works too; nothing else is hidden.

## Boundary

The site is an **adapter over the model, never a second documentation**. The model lives in the core
(`tools/docs/model.mjs`) and stays usable by the CLI, the tests, Studio and any future presentation
surface. Prose about BASE belongs in the canonical file it describes; the site only projects it.

Licensed under Apache-2.0. Part of [BASE](https://a-i.swiss).
