<!-- fr-synced: 023d9db022d05afb1c8244a7391313b2479d8335 -->
# Releasing BASE as open source

Releasing BASE as open source means letting others pick up and adapt a structure of work that stays theirs, without binding themselves to a vendor or a platform. The point is not to show off a finished product: it is to make this foundation reusable and honest about what it does, so anyone can try it, criticize it, and help it grow. This guide gathers what you need to decide, check, and write so that this public release keeps that promise.

BASE presents itself as a local-first framework for structuring human-AI collaboration: readable files, workflows, local controls, and possible extensions. It is deliberately a foundation, not a complete platform.

## Public positioning

Short message:

> BASE helps people and organizations structure their collaboration with AI: knowledge, processes, data, decisions, controlled actions, and durable memory.

Long message:

> Models change, interfaces change, vendors change. What must stay yours is the structure of your expertise: your domain files, your workflows, your models, your rules, your decisions, and the traces you need to resume the work. BASE provides an open, readable framework for organizing this structure.

Founding message:

> Generative AI is handled differently from conventional software: through language, context, examples, limits, and corrections. It masters verifiable domains, but it has two very real weaknesses: by default, it does not share its memory from one session to the next, and the language that drives it stays under-specified, which is the source of both its flexibility and its fragility. BASE turns this observation into a workable method: write down what matters, make processes explicit, keep human decisions visible, and use AI platforms without surrendering the structure of your work to them.

What BASE does not claim:

- that AI becomes reliable automatically;
- that permissions are guaranteed outside the mediated tools;
- that the public core replaces enterprise governance;
- that a specific interface or model is indispensable;
- that AI has consciousness, intent, or guaranteed understanding;
- that everything should be automated.

## What must be visible at first glance

- A concrete example in 5 minutes.
- Several domain assistants ready to try.
- A simple explanation of the difference between conversation and durable memory.
- A page for each level of adoption: personal, startup, SMB, large enterprise.
- A status page that separates implemented, planned extensions, and out of scope.
- Tests and local validation that prove the package is maintainable.

## Pre-release checklist

Documentation:

- `README.md` explains why BASE exists, how to try it, who it is for, and where to go next.
- `docs/start/obtenir-base.md` explains ZIP, Git clone, copying an example, and the browser pack.
- `docs/start/demo-60-secondes.md` lets you see a concrete result before reading the architecture.
- `docs/start/quickstart.md` allows a first try with no technical knowledge.
- `docs/tutoriel/index.md` walks a person through it step by step.
- `docs/audiences/pour-qui.md` speaks to the main audiences.
- `docs/audiences/kit-demarrage-pme-suisse.md` gives the minimum rules for a small team: data, validation, versioning, upkeep.
- `docs/audiences/kit-enterprise.md` frames the strict configuration and the deployment modes.
- `docs/audiences/kit-administration-secteur-public.md` frames the institutional decisions.
- `docs/public/presse.md` provides a publishable reference page for journalists and newsrooms.
- `docs/learn/comprendre.md` explains the mechanisms and the diagnosis.
- `docs/start/lire-dans-quel-ordre.md` helps each profile tell what to read, what to ignore, and what to audit.
- `docs/learn/pratiques-co-pensee.md` lays out the principles of human-AI co-thinking.
- `docs/reference/framework-public.md` frames the public core and the extensions.
- `docs/reference/etat-implementation.md` bounds the promises.
- `docs/trust/securite-et-limites.md` spells out the security model, the limits, and the responsibilities.
- `docs/trust/souverainete-et-confiance.md` brings together sovereignty, compliance, license, and governance.
- `docs/trust/licence.md` explains the dual license in plain language.
- `docs/reference/specification-v0.md` provides the architecture read.
- `mcp/README.md` explains the MCP adapter without confusing it with the broker.
- `SECURITY.md` explains how to report a problem.
- `CODE_OF_CONDUCT.md` defines the rules for public participation.
- `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md` guide contributions without promising heavyweight community governance.
- `specs/RELEASE.md` describes the reproducible release checklist.
- `CHANGELOG.md` makes public changes trackable.

Code and validation:

- `npm test` passes.
- `npm run validate` passes.
- `npm run entretien` reports no critical action.
- `npm test` and `npm run build` pass in `mcp/`.
- `npm run smoke:pack` passes.
- `base.manifest.json` is regenerated.
- `.ai/trace/` is ignored by git.
- `git status --short` is reviewed: every modified or untracked file is intentional.
- Derived artifacts are either regenerated and included, or explicitly left out of the release.
- No local draft (`.temp/`, `.plans/`, traces, test exports) enters the published package.

Examples:

- `exemples/assistant-devis-demo/` remains the immediate demo; the page `docs/start/demo-60-secondes.md` describes the exact path.
- `exemples/assistant-devis/` remains the main running example.
- `exemples/assistant-communication/`, `assistant-courrier/`, `assistant-rh/`, `assistant-projet/`, and `assistant-reunion/` are visible and consistent.
- Each example can be copied into a separate folder and opened in an AI tool.

License and attribution:

- The dual license is explicit in `LICENSE`: code under Apache-2.0; documentation, agents, skills, and examples under CC BY 4.0.
- The README mentions AI Swiss and the Innovaud use case.
- Derived uses must keep the attribution required by the license.

## How to present BASE

For a conference or a workshop:

1. Start with a concrete scene: making a quote, preparing an offer, organizing a project.
2. Show what plain chat is missing: context, memory, data, rules, validation.
3. Introduce files as durable memory.
4. Show the workflows and the competences.
5. Explain the decision points and the verification debt.
6. Show the router/broker only after the concrete need: rudimentary but effective, extensible through adapters, it lowers the mental load of finding the right process.
7. End on sovereignty: the durable capital is not the model, it is the structure of the expertise.

For a non-technical person:

- avoid the terms server, broker, schema, MCP at the start;
- say assistant, files, workflows, models, decisions;
- start by copying an example.

For a technical person:

- show `docs/reference/etat-implementation.md`;
- show `tools/base-core.mjs`;
- show the tests;
- explain that MCP is an adapter, not the router.

For an organization:

- present BASE as a structuring foundation;
- spell out what must be added around it: identity, rights, audit, DLP, retention;
- for an SMB, start with the starter kit rather than the enterprise architecture;
- stress the portability of resources and the separation between semantic YAML and technical details.

## The tone to keep

Strong, but bounded.

BASE can assert:

- that structure is necessary to collaborate durably with AI;
- that verification does not go away;
- that readable files make context portable;
- that mechanisms are more reliable than *consignes* alone;
- that the public framework is useful without claiming to replace an enterprise platform.

BASE must not assert:

- that models no longer make mistakes;
- that everything is secure by default;
- that AI replaces expertise;
- that all platforms behave the same;
- that adopting a tool is enough to transform an organization.

## Final criterion

A person should be able to look at BASE and understand three things:

1. They can try it now.
2. They can adapt it to their context.
3. They can grow with this structure without binding themselves to a single platform.
