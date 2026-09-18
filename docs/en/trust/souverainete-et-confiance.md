<!-- fr-synced: 84393f6933bb09d5b2b36696869249a14b1d23ca -->
# Making the case for BASE: sovereignty, trust, compliance

Adopting BASE often means winning someone over first: a client worried about their data, an IT department, a compliance officer. Here, in one place, is what you need to defend that choice without dodging the hard questions: data sovereignty, data protection, security, license, and governance. Written for any organization evaluating BASE, from the freelancer to the institution, this page points to the reference documents rather than replacing them.

## In one sentence

BASE is a **local-first** and **open** framework for structuring work with AI: your knowledge stays in text files you own, and you decide explicitly what leaves, if anything, for an AI tool.

BASE's sovereignty rests on its architecture, not on a label. Local-first, the framework runs on your machine and keeps knowledge in text files you own. Its core contacts no remote provider by default, but the AI tool used on top of BASE may transmit what you show it. Two points need clarifying, though. A local model is not a Swiss model: locality says where it runs, not where it comes from. And a Swiss model is not thereby confidential if it is hosted on infrastructure subject to a foreign jurisdiction. Depending on the provider, its structure, and the data concerned, extraterritorial rules such as the US CLOUD Act may apply. A Swiss provider may likewise be compelled to disclose data under applicable law. No location therefore offers absolute confidentiality on its own. What leaves depends on your configuration and on the contract: data residency, use for training, subprocessors, and jurisdiction. The framework and expertise remain under your control; the model remains an external choice for you to assess.

Beyond this hosting sovereignty, the one that matters over the long run is **cognitive sovereignty**: owning how your way of thinking is articulated with AI, in readable, portable text that you can review, correct, and take with you. This layer remains on your side, whatever the model. See [Co-thinking with AI](../learn/co-penser-avec-lia.md).

## Data sovereignty

- The BASE core is **local**: it contacts **no remote service by default**.
- In an AI tool, the model normally routes by reading the local map. The lexical router is the deterministic floor for callers without a model and for tests.
- The shipped Way 2 transmits only the query and the necessary routing text when enabled. A direct integration of the semantic package may have a broader scope; a local option with Ollama is documented.
- Your files stay portable (Markdown): you can switch AI tools without losing your structure.

Details: [Routing security and data](securite-donnees-routage.md) and [The boundary: local by default](frontiere-local-vs-sortant.md).

## Data protection (nLPD / revLPD, GDPR)

BASE on its own **does not make you compliant** with Swiss data protection law (nLPD/revLPD) or with the GDPR: compliance depends on your organization, your processing activities, and the AI tool you connect. What BASE concretely brings:

- a **local-by-default** operation that limits, by design, what leaves your machine;
- an **explicit boundary** between what stays local and what is entrusted to a third party, yours to decide;
- **auditable** files and a **best-effort operational log**, useful as a clue but non-exhaustive.

What you provide yourself: legal basis, record of processing activities, handling of data subjects' rights, and the assessment of the AI provider you use. See [Security and limits](securite-et-limites.md), the "What BASE does not protect on its own" section.

You do not have to settle these questions alone: they are well-charted topics, and **AI Swiss can answer them or point you to established experts**.

## Security

- An **honest** stance: the [glossary](../reference/glossaire.md) defines the distinction between *consigne* and **mechanism**; [Mechanisms vs consignes](mecanismes-vs-consignes.md) shows how it applies to BASE's guardrails.
- The integration server (MCP) is **read-only by default on the network** (HTTP transport), and any non-local exposure is refused without authentication. In **local** access (stdio, from a tool on your machine), writing is exposed by default, to be restricted as needed via `BASE_MCP_READ_ONLY=1`; every write goes through the mediated propose-then-commit flow anyway, never in a single move.
- Threat model and limits: [Security and limits](securite-et-limites.md). Vulnerability reporting: [`SECURITY.md`](../../../SECURITY.md).

## License and reuse

- **Code** under **Apache-2.0**; **documentation, agents, skills, and examples** under **CC BY 4.0**.
- You can use, adapt, and redistribute it, including internally. Readable details: [License](licence.md).

## Governance and longevity

- **Created by Charles-Edouard Bardyn** (Chief Scientific Officer, VP, and cofounder of **[AI Swiss](https://a-i.swiss)**, an independent Swiss nonprofit association whose mission is to promote AI through the concrete, the human, and the fundamentals), and today **maintained by a lead maintainer** under the stewardship of AI Swiss, open to contribution and co-maintenance.
- **[Innovaud](https://innovaud.ch)** is a project partner: the agency helped seed the domain examples aimed at SMEs.
- **Continuity through reversibility.** Beyond AI Swiss's stewardship, the strongest guarantee of longevity is structural: code and content under a dual open license (Apache-2.0 / CC BY 4.0), a zero-dependency core, Markdown files you own. You can **fork and take over the project** at any time, without depending on any single maintainer.
- A stable public surface under a documented compatibility policy: [Versions and stability](../reference/versions-et-stabilite.md). Decisions documented in the `CHANGELOG` and the `specs/`.

## Going further

- Local and Swiss models: [Sovereign and local models](../guides/modeles-souverains.md).
- Overview: [Public framework](../reference/framework-public.md).
- Implementation status: [Implementation status](../reference/etat-implementation.md).
- Organization deployment: [Enterprise kit](../audiences/kit-enterprise.md).
- Public institutions: [Government and public sector kit](../audiences/kit-administration-secteur-public.md).
- Technical integration: [`mcp/README.md`](../../../mcp/README.md).
