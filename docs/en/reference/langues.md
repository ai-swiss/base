<!-- fr-synced: dc9ea1407a2161c7220bf821619e22e2f723e725 -->
# Understanding which language BASE uses, and where

If you are wondering why the documentation is in French while the specifications are in English, this page explains it in a few lines. It is for anyone discovering the project, contributing to it, or wanting to build an assistant: it says which language governs what, and why your own assistants are bound to neither one.

## French for the method

The public documentation (`docs/`, [README](../../../README.md), [Manifesto](../../../MANIFESTO.md)) is in French. It is the language of the method: the one in which BASE explains why to structure collaboration with AI, how to verify, and how to keep sovereignty over your files. In a multilingual country, writing the method in a national language brings it closer to its readers.

## English for the technical contract

The engineering specifications ([`specs/`](../../../specs/current/README.md)) are in English, the language of the technical contract. The requirements, invariants, and architecture decisions are tied there to the code and the tests; they speak to contributors and maintainers, whose working language is English. The precision of an engineering contract suffers under loose translations: a single normative version, in English, prevents divergence.

## Your assistants speak the language of their users

Assistants built with BASE are not bound to any particular language. The default routing is lexical: it compares the normalized words of a request to those of your own files, without relying on the grammar or lexicon of any given language. An assistant declared with German, Italian, or English keywords routes in that language. The language of the framework's documentation imposes nothing on the language of your assistants.

## Who reads what

| Profile | Language | Entry point |
| ------ | ------ | -------------- |
| User, assistant creator, decision-maker | French | [README](../../../README.md), [What to read, in what order](../start/lire-dans-quel-ordre.md) |
| Compliance officer, institution | French | [Sovereignty, trust, and compliance](../trust/souverainete-et-confiance.md) |
| Developer, integrator, technical auditor | English | [Current specification](../../../specs/current/README.md) |
| Framework contributor | Both | [CONTRIBUTING](../../../CONTRIBUTING.md) |

## Translations

Already available: the [README in English](../../../README.en.md), the **full English mirror of the documentation** (`docs/en/`, every page synced to its French source through an `fr-synced` fingerprint verified in continuous integration), as well as the manifesto in [English](../../../MANIFESTO.en.md), [German](../../../MANIFESTO.de.md), and [Italian](../../../MANIFESTO.it.md). The other translations (a `README.de.md`, a `docs/de/` folder per language) are among the most welcome contributions of all. The convention is set out in [CONTRIBUTING](../../../CONTRIBUTING.md): keep the restraint of the original, do not translate technical identifiers, and note at the top of the file that **the French version is authoritative**.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
