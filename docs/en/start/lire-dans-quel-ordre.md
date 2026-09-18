<!-- fr-synced: 54db325eda173e5ddb4e7065d241377409ed5f3a -->
# Where to start

At first glance, the repository can look dense because it combines three things: an open convention with its reference implementation, domain examples, and a verifiable technical foundation. This page gives you the reading order for your situation, whether you are on your own, in an SMB, in a large enterprise, or in the public sector.

This is the reference page for the reading paths. Other documents may summarize them, but this page keeps the complete order for each profile.

## If you are on your own

Goal: try it quickly, understand enough, follow your own train of thought with AI, and keep your files readable.

Read in this order:

1. **See BASE work once**, before any theory: open the [`exemples/assistant-devis-demo/`](../../../exemples/assistant-devis-demo/) demo (ask the question about Dupont's loyalty discount), or follow [See BASE in action](demo-60-secondes.md). The goal is to see an `[A VALIDER]` first.
2. **Try it or keep using it**, depending on your tool: follow [Shape your first assistant](quickstart.md) for a short start (or [Try BASE without installing BASE](essayer-sans-installer.md) if all you have is a browser); start from your own data with [`exemples/assistant-devis/`](../../../exemples/assistant-devis/).
3. **Grow it:** follow the [Learn by doing](../tutoriel/index.md) tutorial, step by step and verified at each stage (Discovery with nothing installed, Practitioner, Team).
4. **Understand why**, when you want to: read [`README.md`](../../../README.md) (the English presentation; [`README.fr.md`](../../../README.fr.md) is authoritative), then [Co-thinking with AI](../learn/co-penser-avec-lia.md) (the method) and [Co-thinking practices](../learn/pratiques-co-pensee.md) (the day-to-day method, 16 principles).
5. Read [Understand BASE](../learn/comprendre.md) only if you want to go deeper into the method.
6. Read [Evidence](../trust/evidence.md) if you want to check the claims and their limits.

You can skip at first:

- `mcp/`;
- `tools/`;
- `tests/`;
- `base.schema.json`;
- `base.manifest.json`;
- `docs/reference/specification-v0.md`.

At this level, BASE can stay very simple: one assistant, a few Markdown files, explicit human decisions.

If you are lost, just say "Help" or "I'm lost". With routing enabled, the router selects the `concierge-base` welcome instead of leaving you with no answer; otherwise, load `.ai/agents/concierge-base/AGENT.md`.

## If you are an SMB or a small team

Goal: move from individual use to a shared working memory.

Read in this order:

1. [`README.md`](../../../README.md) for the English presentation of the intuition and examples; [`README.fr.md`](../../../README.fr.md) is authoritative.
2. [Co-thinking with AI](../learn/co-penser-avec-lia.md) for the rationale: cognitive sovereignty, loss of control (including verification), and the method.
3. [Shape your first assistant](quickstart.md) for local setup and commands.
4. [Beyond agents](../learn/au-dela-des-agents.md) to understand why intent, rather than a fixed partition between agents, should guide how work is organized.
5. [Swiss SMB starter kit](../audiences/kit-demarrage-pme-suisse.md) to set team rules for data, validation, versioning, and upkeep.
6. [Who BASE is for](../audiences/pour-qui.md) to identify your adoption level.
7. [Public framework](../reference/framework-public.md) to understand the stable abstractions.
8. [Routing, processes, and resources](../reference/routage-process-et-ressources.md) to understand the agent -> process -> resources chain.
9. [Semantic routing quickstart](../guides/routage-semantique-quickstart.md) to understand how the router chooses an agent and a process.
10. [Co-thinking practices](../learn/pratiques-co-pensee.md) to avoid ineffective uses of AI.
11. [Interactive documentation](../reference/documentation-interactive.md) if you want to publish or deploy living documentation without duplicating sources.
12. [Organizational adoption](../learn/adoption-organisation.md) for the adoption path: how an individual practice becomes a team process, who promotes it, and who is accountable for it.
13. [Expertise lifecycle](../learn/cycle-de-vie-expertise.md) for long-term upkeep: operational friction, validity dates, evaluation, and what `node .ai/base.mjs doctor` monitors after initialization.

At this level, the important files are:

- `.ai/agents/` for the agents and skills;
- `exemples/` to copy a domain base;
- `tools/` to validate, index, discover, and maintain;
- `base.schema.json` to stabilize the shared metadata.

If you manage **several BASE roots** (for example several clients), a `base.workspace.json` declares them: after initialization, `node .ai/base.mjs route --workspace <file>` lets the router search across them and `--root-id <id>` targets a specific root (every read and write that passes through this path stays confined to the chosen root). The launcher does not install the short `base` command. See [Routing, processes, and resources](../reference/routage-process-et-ressources.md) and `specs/current/10_core/cli.md`.

You do not need a heavy platform, but clear conventions, local validation, readable descriptions, and regular upkeep.

## If you are a large enterprise

Goal: evaluate BASE as a structuring language and an integration foundation, not as a full compliance platform.

Read in this order:

1. [Co-thinking with AI](../learn/co-penser-avec-lia.md) for the rationale shared across profiles: verification, loss of control, and the method.
2. [The `base.resource.v1` convention](../reference/le-standard.md) for its citable page (format, separations, routing conventions, stability), then the [public framework](../reference/framework-public.md) for the public model.
3. [BASE and your AI tools](../reference/base-et-vos-outils-ia.md) to understand how BASE coexists with AI tools and platforms (and how to integrate a scheduled agent), then [Positioning](../reference/positionnement.md) to place BASE in the 2026 tool landscape.
4. [Implementation status](../reference/etat-implementation.md) to distinguish shipped, planned, and out-of-scope capabilities.
5. [Choosing an embedding provider](../guides/choisir-provider-embeddings.md) to compare local, cloud, gateway, and internal models.
6. [Data security and routing](../trust/securite-donnees-routage.md) to govern data sent to providers.
7. [Understanding scale](../learn/comprendre-echelle.md) and [Scale benchmarks](../guides/benchmarks-echelle.md) to assess the optional index.
8. [Engineering specification](../reference/specification-v0.md) for the current engineering specification.
9. [MCP server](../../../mcp/README.md) for integration with AI platforms.
10. [Security and limitations](../trust/securite-et-limites.md) for the security model and its limits.
11. [Enterprise kit](../audiences/kit-enterprise.md) for deployment modes, strict configuration, and enterprise limits.
12. [Sovereignty and trust](../trust/souverainete-et-confiance.md) for a one-page rationale covering sovereignty, nFADP, licensing, and governance.
13. [`base.schema.json`](../../../base.schema.json) to inspect the machine contract.
14. [`tests/`](../../../tests/) to see what is verified.

At this level, BASE has to be integrated with the organization's systems: IAM, SSO, RBAC, DLP, SIEM, retention, classification, legal review, secrets management, and environment separation. [Organizational adoption](../learn/adoption-organisation.md) describes the path from individual use to established workflows.

So the right way to read it is:

```text
BASE public = open convention + reference implementation + readable structure + local mediation component + MCP + tests
Enterprise = governance, security, and integration around that structure
```

## If you are a public institution

Goal: evaluate BASE without conflating a local-first component, institutional compliance, and provider policy.

Read in this order:

1. [Co-thinking with AI](../learn/co-penser-avec-lia.md) for the rationale: human verification, accountability, and memory.
2. [Sovereignty and trust](../trust/souverainete-et-confiance.md) for the nFADP, licensing, security, and governance summary.
3. [Public administration kit](../audiences/kit-administration-secteur-public.md) to govern citizen data, classification, accessibility, archiving, and public procurement.
4. [Security and limitations](../trust/securite-et-limites.md) to keep visible what the reference implementation does not enforce on its own.
5. [Enterprise kit](../audiences/kit-enterprise.md) for strict configuration and deployment modes.
6. [MCP server](../../../mcp/README.md) if the institution wants to connect BASE to an AI platform.
7. [`specs/current/README.md`](../../../specs/current/README.md), [`base.schema.json`](../../../base.schema.json), and [`tests/`](../../../tests/) for the technical audit.

At this level, BASE is an auditable component. Compliance, for its part, rests with your institutional decisions: legal basis, register of processing activities, IAM, DLP, archiving, procurement, model provider, and legal review.

## What each folder means

| Item | Role | Read when |
| ------- | ---- | ------------ |
| [`README.md`](../../../README.md) | English entry point; [`README.fr.md`](../../../README.fr.md) is authoritative | Always |
| `BASE_BOOTSTRAP.md` | Generic routing bootstrap for AI harnesses | When you integrate BASE into an AI tool |
| `.ai/agents/` | Portable core of the assistants | When you adapt BASE |
| `.ai/agents/concierge-base/` | BASE welcome and help (the router's fallback target) | When you are lost or have a question about BASE |
| `exemples/` | Assistants ready to copy | When you want to try |
| `docs/` | Explanations, principles, architecture | Depending on your profile |
| `docs/start/demo-60-secondes.md` | See BASE in action: it draws on a file, names its source, and sets a validation point | When you want to see BASE before reading |
| `docs/audiences/kit-demarrage-pme-suisse.md` | Practical rules for a small Swiss team | When you share an assistant in an SMB |
| `docs/audiences/kit-enterprise.md` | Strict configuration, deployment modes, and enterprise limits | When you evaluate BASE in an organization |
| `docs/audiences/kit-administration-secteur-public.md` | Checklist for public institutions | When citizen data, procurement, or archiving enter the scope |
| `docs/reference/documentation-interactive.md` | Local, public, deployable documentation generated from the sources | When you want to learn, publish, or audit BASE in a portal |
| `docs/trust/evidence.md` | Promises, mechanisms, tests, and limits | When you want to audit BASE's claims |
| `docs/reference/glossaire.md` | Definitions of the terms (broker, routing, mechanism, consigne, egress) | When a technical word is unclear |
| `docs/reference/le-standard.md` | The citable page of the `base.resource.v1` standard: format, separations, conventions, stability | When you cite, compare, or reimplement the format |
| `docs/reference/routage-process-et-ressources.md` | The agent -> process -> resources doctrine | When you enable routing or structure several workflows |
| `tools/` | Local CLI and mediation component | When you want to verify or automate |
| `mcp/` | Adapter to MCP-compatible AI tools | When you want to integrate |
| `tests/` | Verifiable guarantees | When you audit or contribute |
| `specs/` | Engineering specification (`UR/FR/NFR/AD`, schemas) | When you integrate or audit in depth |
| `packages/` | Optional official packages (semantic ranker, local index) | At scale, for hard or large corpora |
| `base.config.json` | Local config: extensions and help fallback (`routing.fallback`) | When you enable routing or a fallback |
| `base.workspace.json` | Several declared BASE roots (multi-client) | When you manage several BASE roots |
| `base.schema.json` | The metadata contract | When you share or govern |
| `base.manifest.json` | Generated index | When you inspect discovery |
| `SECURITY.md` | Reporting policy | When you evaluate or report a risk |
| `CHANGELOG.md` | Notable changes | When you track versions |
| [`LICENSING.md`](../../../LICENSING.md) | Dual-license allocation | When you reuse or publish |
| `docs/trust/licence.md` | Readable explanation of the license | When you want to understand reuse |
| `CLAUDE.md` | Claude Code adapter | Only for this harness |
| `.cursor/rules/` | Cursor adapter | Only for Cursor |

## What is not the core

`CLAUDE.md` and `.cursor/rules/` exist to help specific tools load the right context. They do not define BASE.

`base.manifest.json` is generated by `base index`. It makes discovery easier, but does not replace the source files.

`mcp/` is an integration. It demonstrates portability, but an MCP server is optional.

`tests/` and `tools/` make the reference implementation verifiable and maintainable. Anyone who only wants to try an assistant can set them aside.

**Next action:** identify your profile above and open the first document in its list.
