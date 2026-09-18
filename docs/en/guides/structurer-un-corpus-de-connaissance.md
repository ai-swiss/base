<!-- fr-synced: 2851e8e6bccb7312dbea1853b63546fa3f5e8eeb -->
# Structuring a body of knowledge

This page is for whoever writes or inherits a set of documents and wants an AI tool to be able to use it. It describes mechanisms that exist in this version and can be checked with one command. Routing a request to a process is a different gesture, described in [Writing for the router](ecrire-pour-le-routeur.md).

## The question this page answers

A set of documents is not yet a body of knowledge an AI tool can use. Two properties make the difference.

The first: a question must be able to reach the passage that answers it, without loading the whole document. The second: what comes back must carry a reference another person can reopen and read at the same place.

A whole document is the wrong size at both ends of a read. Too long to send, too vague to quote. So the body is cut where the person who wrote it already cut it, at the headings.

## Cite a precise passage without loading the whole document: headings are addresses {#headings-are-addresses}

Every heading gets an anchor derived from its text: Unicode decomposition, accents folded, punctuation dropped, spaces turned into hyphens. "Délai de paiement" gives `delai-de-paiement`. Fenced code is never split, so a `# comment` line in a shell example invents no section. An anchor repeated in one document takes the suffix `-2`, `-3`, and so on: a reference that could designate two passages designates none.

One derivation serves every surface, so `id#anchor` means the same thing everywhere. A document's outline reads like this:

```bash
base open ecrire-pour-le-routeur --projection outline
```

```text
# Écrire pour le routeur  #ecrire-pour-le-routeur
  ## Comment le routeur lit vos fichiers  #comment-le-routeur-lit-vos-fichiers
  ## Formuler un bon `use_when`  #formuler-un-bon-use-when
```

The full reference opens unchanged, in the CLI as in the MCP tool `open_resource`:

```bash
base open "ecrire-pour-le-routeur#une-limite-honnete"
```

The heading is put back on top of the returned passage: a body quoted without its title reads as an assertion from nowhere.

### Fixing an anchor by hand

A heading can fix its own anchor with the `{#slug}` syntax, in lowercase and hyphens. Two cases justify it: a heading that repeats inside the document, and a heading you expect to reword.

```markdown
## Délai de paiement à trente jours {#delai-paiement}
```

### When a heading changes its name

Rewording a heading moves its anchor, while the citations already written elsewhere keep the old name. The card then says where that name went, with a `superseded_anchors` map:

```yaml
---
schema_version: base.resource.v1
id: tarifs
type: document
title: Tarifs de Dupont SA
description: Les tarifs horaires et les conditions de paiement de Dupont SA.
superseded_anchors:
  prix-horaire: tarif-horaire
---
```

Resolution is one hop. Each entry must name an anchor the document still has. An entry whose target is gone, like an alias nobody declared, reads as a section not found, with the list of the ones that do exist:

```text
Section not found: tarifs#prix-horaire. Known sections: tarifs-de-dupont-sa, tarif-horaire.
```

Returning some other passage under the requested reference would produce a quote that looks sourced and is not. Nothing checks these entries for you: reread them whenever you reorganise a document.

## Find and open the passage that answers a factual question: two grains {#two-grains-two-questions}

A task goes through routing and arrives at a process. A fact goes through section search and arrives at a passage.

```bash
base route "je dois préparer un devis client"
base discover "contre-exemple qui annule un score" --grain section --scope docs/guides --limit 2
```

The first command answers "what should be done now". The second answers "where is this written". Every result of the second carries its heading path, a preview and the citable reference:

```text
- ecrire-pour-le-routeur#ecarter-les-demandes-voisines [score 9.44; text:contre, text:exemple, text:annule, text:score]
  Écrire pour le routeur › Écarter les demandes voisines
  `routing.avoid_when` recense les contre-exemples: des demandes voisines qui doivent aboutir ailleurs. …
```

`--scope` narrows the search to one folder, which helps as soon as a corpus holds several collections. Two families of files stay out of the results at this grain. A file without a card, so without `schema_version`, stays findable at resource grain and openable by its path, but it carries no identity chosen at writing time, so it is not quotable as `id#anchor`. A generated projection, such as the routing map, is left out of the search: it summarises the resources it lists and competes with them on their own words.

The order in which an AI tool reads a folder, from the root to the final gesture, is described in [Progressive discovery](../reference/decouverte-progressive.md).

## What makes a passage findable

The passage ranking weighs each term by how rare it is across the corpus. A word present almost everywhere earns little. A word that names a subject earns much. A match in a heading counts three times a match in the body. A match in the parent card's own signals, its title, its `use_when` and its routing examples, counts twice and benefits every section of that document. Matching is on whole words, with a prefix match from five letters up, so "priorisation" reaches "prioriser" without a stemmer.

Two consequences for whoever writes.

A heading names its subject in the words the person searching would use. "Step 2" carries nothing. "Payment term for an invoice" carries the subject and the vocabulary.

A first paragraph answers rather than introduces. The preview shown in the results is the start of the section, cut at a word boundary after a few hundred characters. A section that opens on "this part presents the applicable rules" shows that sentence and nothing else.

The rules for wording `use_when`, `routing.examples` and `avoid_when` are different and live in [Writing for the router](ecrire-pour-le-routeur.md). They serve the routing of a task, not the search for a fact.

## Translated documents and transcribed documents

An edition declares its language with `lang`, as an ISO 639-1 code. Failing that, the file-name suffix answers, for example `tarifs.de.md`. A resource with no language, such as a folder card, declares nothing: announcing an invented language would be worse.

A translation names its canonical resource with `translation_of`, on the translation's side only. The family resolves from either end.

```yaml
---
schema_version: base.resource.v1
id: tarifs-de
type: document
title: Tarife der Dupont SA
description: Die Stundensätze und die Zahlungsfristen der Dupont SA.
lang: de
translation_of: tarifs
---
```

Opening with a language returns the matching edition when one exists. Otherwise the canonical comes back flagged as a fallback, with the list of the languages that do exist. That report travels in the `edition` field, which the CLI shows with `--json`:

```bash
base open tarifs --lang it --json
```

```json
{ "requested": "it", "language": "fr", "fallback": true, "available": ["de", "fr"],
  "note": "No it edition of tarifs; the fr edition is returned." }
```

A silent fallback would make one language's wording get quoted as another's.

For a document converted from a scan, the sentence a reader wants to check often lives in the image. The card then declares the citation the passage must travel with, and the printed pages behind the text:

```yaml
cite_as: "Tarifs Dupont SA (2026), p. 2"
source:
  connector: scan
  pages: [2]
  page_images: "scans/tarifs-{page:03}.png"
```

`{page}` and `{page:03}`, the second form zero-padded, are resolved for each entry of `pages`. The `source` projection returns the source record, the citation and the pages:

```bash
base open tarifs --projection source
```

```text
Citation: Tarifs Dupont SA (2026), p. 2
Source: {"connector":"scan","pages":[2],"page_images":"scans/tarifs-{page:03}.png"}
page 2: scans/tarifs-002.png (not present in this deployment)
```

Every page is named, including the one that is not attached, with the reason: absent from the deployment, over the result's image budget, or of a type the server does not attach. A deployment that ships the text without the scans is a normal case.

## What stays out of the corpus

Three distinct declarations, for three distinct questions.

`inventory.exclude`, in `base.config.json`, takes path prefixes out of the inventory: no routing, no search, no checks. It is the answer for bulk archives, raw data or fictional text. The files stay on disk and your tools reach them normally. Detail in [Routing a request to the right process](../reference/routage-process-et-ressources.md).

`confidential: true`, on a resource's card, withholds it from a remote model. On the MCP surface, treated as remote by default, such a resource is absent from discovery and from routing: its existence is hidden, not only its content. This field is set by a human, never inferred. What each door guarantees is detailed in [Security and limits](../trust/securite-et-limites.md).

The `mcp` section of `base.config.json` says what a deployment exposes. `mcp.tools` and `mcp.agents` are allow-lists: absent, the whole surface; present, only what they name. `mcp.attribution_prefix` makes every read carry the `attribution` line of the nearest folder card, so a rule of use travels with the content into the client that receives it.

## How to check your work

Four commands, from the fastest to the most demanding.

```bash
base discover "quel est le délai de paiement" --grain section --limit 5
base open "tarifs#tarif-horaire"
base doctor
base route-eval --ollama
```

The first shows what a question actually returns, with the reasons that produced each score. Ask the questions your audience asks, not the ones your headings invite.

The second reads the passage a citation would produce. That is the exact text a model will quote.

The third returns the corpus's structural signals: dead links, orphan resources, overdue reviews, a document whose declared source has changed, stale projections. A healthy corpus returns no signal.

The fourth measures search recall over a labelled set, placed in `.ai/routing/route-eval-golden.json` or passed with `--golden <file>`. It needs a real embedding model, so a local Ollama, and stays a maintainer's tool, outside `npm run check`. The report names the set and the corpus measured, so a number is never read as being about something else.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
