<!-- fr-synced: d57e98122ea6d17d2e9e619d84d756d388491341 -->
# Understanding which language BASE uses, and where

If you are wondering why the documentation is in French while the specifications are in English, this page explains it in a few lines. It is for anyone discovering the project, contributing to it, or wanting to build an assistant: it says which language governs what, which language BASE writes YOUR folder's files in, and why your own assistants are bound to neither one.

## French for the method

The public documentation (`docs/`, [Manifesto](../../../MANIFESTO.md)) is in French. It is the language of the method: the one in which BASE explains why to structure collaboration with AI, how to verify, and how to keep sovereignty over your files. In a multilingual country, writing the method in a national language brings it closer to its readers. The README is the exception: it is shown in English by default on GitHub, for international reach, and its authoritative French source lives in [README.fr.md](../../../README.fr.md).

## English for the technical contract

The engineering specifications ([`specs/`](../../../specs/current/README.md)) are in English, the language of the technical contract. The requirements, invariants, and architecture decisions are tied there to the code and the tests; they speak to contributors and maintainers, whose working language is English. The precision of an engineering contract suffers under loose translations: a single normative version, in English, prevents divergence.

## Your assistants speak the language of their users

Assistants built with BASE are not bound to any particular language. The default routing is lexical: it compares the normalized words of a request to those of your own files, without relying on the grammar or lexicon of any given language. An assistant declared with German, Italian, or English keywords routes in that language. The language of the framework's documentation imposes nothing on the language of your assistants.

One nuance, because lexical routing matches words: it routes in the language your signals are written in, and a request phrased in a language other than your files will not match. This is the **level zero**, deterministic and reproducible (no model, no network call): a testable floor and a confirmation, not the finest routing. As soon as a model reads your files, language stops being a constraint: in a harness, the assistant descends the index and the `AGENT.md`/`SKILL.md` files whatever the language of the request (and you can switch language along the way), and the optional semantic routing, via embeddings, crosses languages too. The language matching therefore weighs only on the deterministic lexical floor (`base route`, or the MCP tool `route_request` without embeddings), not on the model-led progressive discovery.

## The language of your folder

`base.config.json` carries a `language` key. It decides which language BASE writes the files it
generates for that folder in:

- the entry point of your tool (`CLAUDE.md`, `AGENTS.md`, `BASE_BOOTSTRAP.md` or `.cursor/rules/assistant.mdc`);
- the routing index, at the root and per agent (`.ai/routing/index.md`, `.ai/agents/<agent>/index.md`), with the "When to use" and "Avoid if" labels;
- the tool matrix (`.ai/tools.md`);
- the folder's `README.md` and its CC BY attribution line;
- the starter agent written by `base init`, its import process, and the `.gitignore` and `.gitattributes` that come with it.

Four word tables exist under `tools/core/lang/`: French (`fr.mjs`), English (`en.mjs`), German
(`de.mjs`), and Italian (`it.mjs`). `base init` announces only the languages this build actually
carries, the question being built from those tables.

French is the fallback, key by key. A table that translates only half the strings yields a file
translated where it translates and French elsewhere, rather than a file with holes in it.

### An unknown language is recorded, never fatal

The value is reduced to its primary subtag, lowercased: `de-CH` gives `de`, because a word table is
written per language and not per region. A language this build has no table for is recorded as it
stands in `base.config.json`, and the text comes out in French. The folder stays loadable.
`base init` says so in one line, printed in French like the rest of the CLI: it names the unknown
language, states that it is recorded in `base.config.json`, that the text is written in French, and
lists the languages this build carries.

A tool id decides which file is written, so an unknown id stops the load. A language decides only
the words inside the files, and a folder written against a newer BASE, one that knows more
languages, must stay readable by an older BASE.

### Setting it

When the folder is created:

```bash
base init --language en
```

On a folder already in service, the key is written into `base.config.json`, then the build
regenerates the files:

```json
{ "language": "en" }
```

```bash
base build --write
base build routing-index --write   # if your folder carries the routing indexes
```

`base build` re-reads `language` on every pass, so a translated folder does not revert to French at
its first rebuild. The language question is asked on a fresh folder only: on an existing one the
plan comes from `base build`, which reads the language the folder already declares, and `--language`
would change nothing there.

### The language of BASE and the language of your content are two choices

The lexical routing floor compares the words of a request to the words in your files. A corpus
written in German routes requests phrased in German, whether `language` says `de`, `fr`, or nothing
at all. `language` covers the sentences BASE writes; your cards carry the words that route. Routing
follows the second choice.

A folder whose processes are written in German and whose `language` is `fr` works: the index
introduces itself in French and lists German cards, and routing follows the German of the cards. The
reverse holds too. Declaring `language` makes the page readable; writing your cards in the language
of your users makes the routing right.

### What does not follow the folder's language

Two surfaces stay outside, by decision.

The CLI's own messages. What the terminal prints is read by the person running the command, not by
the agent that will open the folder afterwards. Those sentences live at their call site, outside the
tables.

The MCP instructions (the `MCP_*` constants in `tools/core/bootstrap.mjs`). They are English and
stay English: they are read by clients that never open these files, so the language declared in the
folder does not concern them.

## Who reads what

| Profile | Language | Entry point |
| ------ | ------ | -------------- |
| User, assistant creator, decision-maker | French | [README](../../../README.fr.md), [What to read, in what order](../start/lire-dans-quel-ordre.md) |
| Compliance officer, institution | French | [Sovereignty, trust, and compliance](../trust/souverainete-et-confiance.md) |
| Developer, integrator, technical auditor | English | [Current specification](../../../specs/current/README.md) |
| Framework contributor | Both | [CONTRIBUTING](../../../CONTRIBUTING.md) |

## Translations

Already available: the README, shown in English by default ([README.md](../../../README.md)) and sourced in French in [README.fr.md](../../../README.fr.md); the **full English mirror of the documentation** (`docs/en/`, every page synced to its French source through an `fr-synced` fingerprint verified in continuous integration); as well as the manifesto in [English](../../../MANIFESTO.en.md), [German](../../../MANIFESTO.de.md), and [Italian](../../../MANIFESTO.it.md). BASE maintains the normative documentation in French with its English mirror; the German and Italian tables support generated files inside roots without promising two additional documentation mirrors. Other translations, such as a `README.de.md` or a `docs/de/` folder, remain welcome. The convention is set out in [CONTRIBUTING](../../../CONTRIBUTING.md): keep the restraint of the original, do not translate technical identifiers, and note at the top of the file that **the French version is authoritative**.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
