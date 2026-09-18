<!-- fr-synced: 387e55a71d4b07c27e0927aef19582dd50cb1c7c -->
# Data protection

When you use BASE, where does the data go? The answer determines your compliance with the Swiss Federal Act on Data Protection (nLPD) and the GDPR, as well as the trust you can place in BASE. For the DPO, the compliance officer, or the executive troubled by the question, this summary gathers what is documented elsewhere and points back to the sources.

## What data BASE processes

- **Your local files.** BASE structures text files (Markdown, JSON) that reside in your folders and belong to you. It reads and writes them in place. A proposed change is stored locally in `.ai/changes/`. An AI tool that opens these files may nevertheless transmit them under its own configuration.
- **Minimal technical traces.** Instrumented points attempt to write a local JSONL line in `.ai/trace/`: resource identifiers, paths, decisions, and durations. No business content appears there by default. This trace is best-effort and non-exhaustive: an action outside the broker, an uninstrumented point, or a write failure may leave no line. It supports local maintenance, not surveillance or a complete audit. You control retention with `base trace prune --keep-days <n>` and `base trace clear`.

## What can leave your computer, and when {#what-leaves-your-machine-and-when}

The BASE core contacts no remote service by default. In an AI tool, the model normally routes by reading the local map; the local lexical router provides the deterministic floor for callers without a model and for tests. The AI tool nevertheless retains its own network policy.

| Possible egress | When | Who decides | Where it's documented |
| --------------- | ----- | ---------- | ------------------ |
| The AI tool you use on top of BASE | In every conversation where you entrust content to it | You, by choosing the tool and what you show it | [Security and limits](securite-et-limites.md), section "Data and AI providers" |
| The shipped Way 2 models | Only if you enable `routing.embedding_model` and `refiner_model`; the query and necessary routing text may leave | You, through explicit configuration; a local option (Ollama) exists | [Routing security and data](securite-donnees-routage.md) |
| A direct integration of the semantic package | If you supply an embedder; its default scope may include resource bodies | The integrator, who chooses the embedder and `textOf` | [Routing security and data](securite-donnees-routage.md) |
| The MCP server | When a client requests a resource | You, by choosing the client and transport; HTTP is read-only by default, while `stdio` exposes mediated writes unless read-only mode is enabled | [`mcp/README.md`](../../../mcp/README.md) |

These paths do not share one authority. BASE configures its Way 2 and server; the AI tool and a custom integration retain their own authorities and settings.

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

This is the same honesty as for security: BASE strengthens local control, but it is no substitute for a genuine data protection policy.

## Going further

- Overview to justify the choice: [Sovereignty, trust, and compliance](souverainete-et-confiance.md).
- The details of semantic routing and embeddings: [Routing security and data](securite-donnees-routage.md).
- The full security model and its limits: [Security and limits](securite-et-limites.md).
- For an SME: [Swiss SME starter kit](../audiences/kit-demarrage-pme-suisse.md).
- For a public institution: [Public administration and public sector kit](../audiences/kit-administration-secteur-public.md).

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
