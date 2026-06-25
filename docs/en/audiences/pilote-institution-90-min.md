<!-- fr-synced: ba0e8142a129919bb0ab5e6d55ee783fa5528676 -->
# Institutional pilot, 90 minutes, no personal data

Before committing an institution to an AI tool, you want to judge for yourself, with nothing at risk: this pilot lets you see BASE with your own eyes, **with no citizen's personal data whatsoever**, and decide in full awareness whether to go further. Concretely, it is a **time-boxed pilot** (about 90 minutes) that a government office can run on real commands: not putting a service into production, but seeing what BASE does, what it refuses to do without you, and what stays local. All it requires is working on internal, non-personal procedures.

> **Note.** This page is **informational**, not legal or compliance advice. It does not replace your impact assessment (AIPD/DPIA) or your security policy. A pilot, even a successful one, **does not establish** the compliance of a future real-world processing operation: it gives you what you need to decide, in full awareness, whether to go further.

## What this pilot establishes, and what it does not

**It establishes:**

- that the default routing runs **locally** (lexical, zero network) and can **abstain** rather than guess;
- that a write is **proposed as a diff** and happens only after your validation;
- that `base validate` checks the consistency of your corpus;
- where the **boundary** lies between what stays on your machine and what a call to a model would send.

**It does not establish:**

- the compliance of a real-world processing operation (that falls to your AIPD/DPIA and your records);
- the quality or accuracy of a model's answers (the model is your choice, outside BASE);
- integration with your IAM, SSO, RBAC, DLP, SIEM, or your retention or legal archiving rules. BASE provides none of these components (see [Security and limits](../trust/securite-et-limites.md)).

## Mechanism and consigne: the distinction to keep in mind

Throughout the pilot, distinguish two things:

- a **mechanism** is enforced by the mediator (the broker): it happens whether or not the model "wants" it to. Examples: path confinement and refusal of symbolic links that point outside the perimeter (`tools/core/confine.mjs`), **mediated and atomic** writes after validation, tools in **dry-run by default**, egress control **before** the call to a remote model.
- a *consigne* is an instruction that the model follows (or does not): a tone, a format, a reminder to be careful.

When you ask "is this guaranteed?", the right answer always depends on that word: **mechanism** (yes, enforced) or *consigne* (followed, not guaranteed).

## Step 0: no personal data in the first assistant

Before any command, set the pilot's rule, in writing, for the team:

- **No citizen's personal data** enters this pilot. No names, no case files, no excerpts from real correspondence.
- You work only on **internal, non-personal templates and procedures**: a standard letter template, an intake procedure, an internal checklist, a scoping note.
- If a candidate document contains the slightest personal element, it is **out of pilot**.

This rule is an **organizational *consigne***, not a mechanism: BASE does not know, on your behalf, that a text contains personal data. It is up to you to filter upstream. BASE then helps keep the boundary visible (the `sensitivity` metadata, egress control), but the decision to bring content in is yours.

## Phase 1: see the shape of an assistant (15 min)

Open the Veytaux tourist office example to see, without installing anything new, what a BASE assistant looks like: an agent, processes, data, a template, scenarios.

- Open the `exemples/veytaux-tourisme/` folder in an AI tool able to read your files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code), **this folder**, not the repository root.
- Read `exemples/veytaux-tourisme/README.md`, then go through the agent and the two processes.
- On the command line, from this folder, watch how a request is routed:

  ```
  node .ai/base.mjs route "Quelles activités à faire cet après-midi ?" --root .
  ```

Goal of this phase: recognize the **shape** (agent, process, data, template) that you will reproduce with your own internal procedures. The Veytaux office is deliberately fictional and contains no personal data.

## Phase 2: start from a starter and import 1 to 2 internal, non-personal procedures (40 min)

Copy a starting folder, then bring in one or two of your internal **non-personal** procedures.

1. Copy a starter into a working folder of your own, for example from `exemples/starter-perso/`. Work in this copy, never in the original repository.
2. Choose **one or two** internal, non-personal procedures (a standard letter template, an intake procedure).
3. Import them via a **proposal shown as a diff**: nothing is written without you. The mechanism is "propose then commit".

   ```
   node .ai/base.mjs propose <chemin-cible> --from <votre-fichier> --root .
   ```

   The proposal shows you the change. **Until you validate, no file is written.** When the diff suits you, you confirm the mediated, atomic write:

   ```
   node .ai/base.mjs commit <id-du-changement> --root . --confirmed
   ```

What you observe here is a **mechanism**: the import goes through a proposal step, the write is deferred until you agree, then applied atomically. Mediated operations are logged locally in the `.ai/trace` journal (operation, resource, status, duration), with no domain content by default.

## Phase 3: prove that it works, validate and route (15 min)

Check the consistency of the corpus, then route two or three realistic requests.

- Validate the corpus:

  ```
  node .ai/base.mjs validate --root .
  ```

  `base validate` checks consistency (frontmatter, schema, references). It is the same command the CI runs (with `npm audit`, dev excluded, high threshold).

- Route a few requests matching your imported procedures:

  ```
  node .ai/base.mjs route "rediger une lettre type d'accuse de reception" --root .
  ```

  Note two possible behaviors, both **mechanisms**:
  - the router proposes the relevant agent and process, **locally** (lexical, zero network by default);
  - or it **abstains** (out of scope, ambiguous, clarification needed) rather than giving a false certainty. Abstention is an **intended** outcome, not a failure.

> To go further, the repository provides a replayable set of expected routes (`route-test`). The test contract is documented in [`specs/TESTING.md`](../../../specs/TESTING.md).

## Phase 4: what stayed local, what a model call would send (20 min)

Take stock, explicitly, of the data boundary.

- **Stays local with no model call at all:** the default routing (lexical), `base validate`, the diff-based import, the `.ai/trace` journal. Advanced semantic ranking sends text to an embeddings provider **only if you enable it**, and a local option (Ollama) exists (see [Security of routing data](../trust/securite-donnees-routage.md)).
- **What a call to a model would send:** as soon as an assistant calls a generative model, the projected context leaves for that model. The provider is **your choice** and it lives **outside BASE**.
- **BASE's guardrail:** the **egress** control verifies, **before** the call, that a confidential resource or a root declared local-only is **not** sent to a remote model. This is a **mechanism**, not a *consigne*. The MCP is read-only by default (bearer-token option), the Studio is local-loop only, and the settings store keeps environment variable **names**, not API keys in clear text.

To understand this boundary in detail, read the reference page: [Egress perimeters and governance](../tutoriel/equipe-2-perimetres-et-egress.md), rounded out by [Data protection](../trust/protection-des-donnees.md).

## End-of-pilot checklist

- [ ] Step 0 rule set in writing: no personal data, internal procedures only.
- [ ] Veytaux tourist office example opened and routing observed (Phase 1).
- [ ] Starter copied into a working folder, 1 to 2 internal procedures imported by diff, nothing written without validation (Phase 2).
- [ ] `base validate` passes; `base route` proposes or abstains as expected (Phase 3).
- [ ] Local / model-call boundary reviewed, egress control understood (Phase 4).
- [ ] Mechanism / *consigne* distinction clear for the team.
- [ ] Limits noted: BASE provides neither IAM, SSO, RBAC, DLP, SIEM, retention, legal archiving, nor any accuracy guarantee.

## Before any real data: the AIPD/DPIA

This pilot stops **before** the slightest piece of real personal data. To cross that step, your institution must conduct its impact assessment (AIPD/DPIA) and keep its records of processing. BASE provides a **reusable skeleton** to fill in, the [DPIA impact assessment template](dpia-modele.md), but it **does not perform** the assessment for you and does not constitute legal advice. The institutional scoping (classification, legal basis, authorized model provider, retention) is detailed, on the decisions side, in the [Government and public sector kit](kit-administration-secteur-public.md) and the [Data protection](../trust/protection-des-donnees.md) page.

Reminder: this page is informational. Responsibility for the AIPD/DPIA and the security policy remains your institution's.

## Contact

For an institutional conversation (evaluation, pilot, compliance questions), contact **AI Swiss** via [a-i.swiss](https://a-i.swiss).
