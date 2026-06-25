<!-- fr-synced: 86b4a62cddb75aab9ef25365a895578a40f33061 -->
# Where to start

The repository can look dense at first glance, because it brings together three things at once: a usable framework, domain examples, and a verifiable technical foundation. This page saves you from reading everything by giving you the reading order suited to your situation, whether you are on your own, in an SMB, in a large enterprise, or in the public sector.

It is also the source of truth for the reading paths. Other documents may carry a short compass, but this one keeps the full hierarchy by profile.

## If you are on your own

Goal: try it quickly, understand enough, keep your files readable.

Read in this order:

1. `README.md` to grasp the general idea.
2. `docs/learn/co-penser-avec-lia.md` to understand *why* BASE is necessary (the method, in brief).
3. **`docs/tutoriel/index.md`**, the "Learn by doing" tutorial: the recommended path, step by step and verified at each stage (Discovery with nothing installed, Practitioner, Team).
4. `docs/start/quickstart.md` to try it in a few minutes (or `docs/start/essayer-sans-installer.md` if all you have is a browser, with nothing to install).
5. The `exemples/assistant-devis-demo/` demo, then the `exemples/assistant-devis/` folder if you want to start over from your own data.
6. `docs/learn/comprendre.md` only if you want to go deeper into the method.
7. `docs/trust/evidence.md` if you want to check the promises and their limits.

You can skip at first:

- `mcp/`;
- `tools/`;
- `tests/`;
- `base.schema.json`;
- `base.manifest.json`;
- `docs/reference/specification-v0.md`.

At this level, BASE can stay very simple: one assistant, a few Markdown files, explicit human decisions.

If you are lost, just say "Help" or "I'm lost". With routing enabled, BASE welcomes you (`concierge-base`) instead of leaving you without a next step; otherwise load `.ai/agents/concierge-base/AGENT.md`.

## If you are an SMB or a small team

Goal: move from individual use to a shared working memory.

Read in this order:

1. `README.md` for the intuition and the examples.
2. `docs/learn/co-penser-avec-lia.md` for the why: verification, the four losses, the method.
3. `docs/start/quickstart.md` for the local setup and the commands.
4. `docs/audiences/kit-demarrage-pme-suisse.md` to set the team rules: data, validation, versioning, upkeep.
5. `docs/audiences/pour-qui.md` to place your level of adoption.
6. `docs/reference/framework-public.md` to understand the stable abstractions.
7. `docs/reference/routage-process-et-ressources.md` to understand the agent -> process -> resources chain.
8. `docs/guides/routage-semantique-quickstart.md` to understand how BASE chooses agent and process.
9. `docs/learn/pratiques-co-pensee.md` to avoid the bad uses of AI.
10. `docs/reference/documentation-interactive.md` if you want to expose or deploy living documentation without duplicating the sources.

At this level, the important files are:

- `.ai/agents/` for the agents and skills;
- `exemples/` to copy a domain base;
- `tools/` to validate, index, discover, and maintain;
- `base.schema.json` to stabilize the shared metadata.

If you manage **several BASE roots** (for example several clients), a `base.workspace.json` declares multiple roots: `base route --workspace <file>` searches across them and `--root-id <id>` targets a specific root (each read and write stays confined to the chosen root). See [Routing, processes, and resources](../reference/routage-process-et-ressources.md) and `specs/current/10_core/cli.md`.

You do not need a heavy platform. You need clear conventions, local validation, readable descriptions, and regular upkeep.

## If you are a large enterprise

Goal: evaluate BASE as a structuring language and an integration foundation, not as a full compliance platform.

Read in this order:

1. `docs/learn/co-penser-avec-lia.md` for the *why* (common to every profile): verification, the four losses, the method.
2. `docs/reference/framework-public.md` for the public model.
3. `docs/reference/base-et-vos-outils-ia.md` to understand how BASE coexists with your AI tools and platforms (and how to integrate a scheduled agent into them), then `docs/reference/positionnement.md` to place BASE category by category in the 2026 tool landscape.
4. `docs/reference/etat-implementation.md` to tell apart shipped, planned, and out of scope.
5. `docs/guides/choisir-provider-embeddings.md` to compare local, cloud, gateway, and an internal model.
6. `docs/trust/securite-donnees-routage.md` to frame the data sent to providers.
7. `docs/learn/comprendre-echelle.md` and `docs/guides/benchmarks-echelle.md` to judge the optional index.
8. `docs/reference/specification-v0.md` for the long-term architecture.
9. `mcp/README.md` for integration with AI platforms.
10. `docs/trust/securite-et-limites.md` for the security model and its limits.
11. `docs/audiences/kit-enterprise.md` for the deployment modes, the strict configuration, and the enterprise limits.
12. `docs/trust/souverainete-et-confiance.md` to justify the choice (sovereignty, nFADP, license, governance) in one page.
13. `base.schema.json` to inspect the machine contract.
14. `tests/` to see what is verified.

At this level, BASE has to be wired into the organization's systems: IAM, SSO, RBAC, DLP, SIEM, retention, classification, legal review, secrets management, and environment separation.

So the right way to read it is:

```text
BASE public = readable structure + local broker + MCP + tests
Enterprise = governance, security, and integration around that structure
```

## If you are a public institution

Goal: evaluate BASE without conflating a local-first component, institutional compliance, and provider policy.

Read in this order:

1. `docs/learn/co-penser-avec-lia.md` for the *why*: human verification, accountability, and memory.
2. `docs/trust/souverainete-et-confiance.md` for the nFADP, license, security, and governance summary.
3. `docs/audiences/kit-administration-secteur-public.md` to frame citizen data, classification, accessibility, archiving, and public procurement.
4. `docs/trust/securite-et-limites.md` to keep visible what BASE does not enforce on its own.
5. `docs/audiences/kit-enterprise.md` for the strict configuration and the deployment modes.
6. `mcp/README.md` if the institution wants to connect BASE to an AI platform.
7. `specs/current/README.md`, `base.schema.json`, and `tests/` for the technical audit.

At this level, BASE is an auditable component. Compliance stays in your institutional decisions: legal basis, register of processing activities, IAM, DLP, archiving, procurement, model provider, and legal review.

## What each folder means

| Item | Role | Read when |
| ------- | ---- | ------------ |
| `README.md` | Entry point | Always |
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
| `docs/reference/routage-process-et-ressources.md` | The agent -> process -> resources doctrine | When you enable routing or structure several workflows |
| `tools/` | Local CLI and broker | When you want to verify or automate |
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
| `LICENSE` | Dual license | When you reuse or publish |
| `docs/trust/licence.md` | Readable explanation of the license | When you want to understand reuse |
| `CLAUDE.md` | Claude Code adapter | Only for this harness |
| `.cursor/rules/` | Cursor adapter | Only for Cursor |

## What is not the core

`CLAUDE.md` and `.cursor/rules/` exist to help specific tools load the right context. They do not define BASE.

`base.manifest.json` is generated by `base index`. It makes discovery easier, but it is not the source of truth.

`mcp/` is an integration. It proves portability, but you can use BASE without an MCP server.

`tests/` and `tools/` make the framework credible and maintainable. Someone who only wants to try an assistant can skip them.
