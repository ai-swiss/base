<!-- fr-synced: 9695aebc013ecf6b35330f4278d7a704d6e9b518 -->
# Data protection

When you use BASE, where does the data go? The answer determines your compliance with the Swiss Federal Act on Data Protection (nLPD) and the GDPR, and how much trust you can place in the tool. For the DPO, the compliance officer, or the prudent executive who carries this question, this summary consolidates what is documented elsewhere and points back to it.

## What data BASE processes

- **Your local files.** BASE structures text files (Markdown, JSON) that live in your folders and belong to you. It reads and writes them locally: the only copies are local (a proposed-change snapshot in `.ai/changes/`, and the local journal `.ai/trace/` that records identifiers and paths, not content). Nothing is sent elsewhere without an action on your part.
- **Minimal technical traces.** Actions that go through BASE write a local JSONL line in `.ai/trace/`: resource identifiers and paths of mediated operations (locally), decisions, durations, never the file content. These traces serve local maintenance and auditing, not surveillance, and are managed with `base trace prune`.

## What leaves your machine, and when

Nothing, by default. The core of BASE makes no network calls: the default routing is local and lexical. Any data leaving the machine corresponds to an explicit choice on your part, never to a hidden setting.

| Possible egress | When | Who decides | Where it's documented |
| --------------- | ----- | ---------- | ------------------ |
| The AI tool you use on top of BASE | In every conversation where you entrust content to it | You, by choosing the tool and what you show it | [Security and limits](securite-et-limites.md), section "Data and AI providers" |
| An embeddings provider | Only if you enable the optional semantic ranker | You, through explicit configuration; a local option (Ollama) exists | [Routing security and data](securite-donnees-routage.md) |
| The MCP server | Only if you expose it to a chat app | You, through explicit configuration; read-only by default | [`mcp/README.md`](../../../mcp/README.md) |

For each row, the rule is the same: egress is disabled by default, enabled by you, and documented at the indicated place.

## What BASE does not do

- **No telemetry.** BASE sends no usage statistics, to anyone.
- **No account.** No sign-up, no identifier, no user profile.
- **No BASE cloud.** There is no BASE server that would receive your files: the project is a local framework that you own.

## Your remaining responsibilities

BASE does not make you compliant with the nLPD or the GDPR on its own. By design, it limits what leaves your machine, and it makes the boundary explicit. The rest remains organizational:

- the legal bases for your processing activities;
- the record of processing activities;
- the rights of data subjects (access, rectification, erasure);
- the assessment of the AI provider you connect on top of BASE (terms, retention, location of processing).

This is the same honesty as for security: BASE strengthens local control, but a data protection policy remains indispensable.

## Going further

- Overview to justify the choice: [Sovereignty, trust, and compliance](souverainete-et-confiance.md).
- The details of semantic routing and embeddings: [Routing security and data](securite-donnees-routage.md).
- The full security model and its limits: [Security and limits](securite-et-limites.md).
- For an SME: [Swiss SME starter kit](../audiences/kit-demarrage-pme-suisse.md).
- For a public institution: [Public administration and public sector kit](../audiences/kit-administration-secteur-public.md).

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
