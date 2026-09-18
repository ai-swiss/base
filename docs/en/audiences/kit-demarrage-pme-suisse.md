<!-- fr-synced: e402f3758df9e11be6b2b71c136aba7fd26edcfc -->
# Getting started with BASE in a Swiss SME

Getting a small Swiss team to work with AI without going off the rails or rolling out a heavyweight platform: that is the challenge. This kit pulls together the bare essentials to start cleanly with BASE and frame a first, controlled use. It stands in for neither legal advice, nor a security policy, nor document governance.

For the distinction between method, structure, approved reference, and execution, see the [audience map diagnosis](pour-qui.md).

## 1. Choose a first workflow

Start with a repeatable, visible, low-risk task:

- preparing a quote;
- writing a newsletter;
- preparing an interview;
- structuring a project;
- handling a support request.

For a first use case, steer clear of legal, sensitive HR, medical, regulated financial, or irreversible decisions.

## 2. Define the allowed data

Before using an AI tool, the team writes a simple rule:

```text
You may enter: public information, fictional examples, non-sensitive internal templates, client data needed for the task and approved for this use.
You do not enter: secrets, passwords, medical data, sensitive HR data, client data that is not needed, confidential documents without approval or a suitable environment.
```

The files may remain in your local folder, but a tool may project their content to a remote model under its own terms. On mediated paths, egress is permissive by default: explicitly mark resources `confidential: true` or the root `local-only` for them to be withheld. A `sensitivity` value classifies content; it does not block sending by itself. Under the nLPD, the GDPR, or sector-specific obligations, the organization remains responsible for the processing, the provider it selects, and the access rights.

## 3. Name the responsibilities

For each shared assistant, decide:

- who keeps the domain files up to date;
- who reviews the outputs before they go out externally;
- who can change prices, terms, templates, and rules;
- who runs the monthly maintenance;
- who decides when the assistant flags an uncertainty.

The rule fits in one sentence: the AI proposes, the responsible person signs off.

## 4. Version simply

For a small team that has mastered it, Git is the ideal tool. Otherwise, start more modestly:

- keep the files in a shared folder kept firmly in hand;
- log the important changes, with dates;
- do not touch critical templates without review;
- keep a copy before any major change;
- run the validator before sharing a new version.

As the team grows, move to Git, to change reviews, and to formalized access rights.

## 5. Set up the monthly ritual

Once a month, or before each important share, run these three commands. They require Node 18 or later (`node --version`) and a folder initialized from the framework, containing the `.ai/base.mjs` launcher. Run them from the root of that folder. If the launcher is missing, return to the [installation guide](../start/installer.md) before continuing.

```bash
node .ai/base.mjs validate --root .
node .ai/base.mjs doctor --root .
node .ai/base.mjs route-test --root .
```

Then check as a team:

- the markers `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`. The report flags the ones that drag on: markers left open for months mean a review that has become decorative;
- broken links;
- missing descriptions;
- stale data;
- workflows that no longer match actual practice;
- personal resources to promote to the team.

## 6. Keep the limits visible

The files, router, and BASE's mediation component (the broker) help an SME structure its work with AI. They do not provide:

- IAM, SSO, or RBAC;
- DLP;
- SIEM;
- legal archiving;
- regulatory retention;
- centralized secrets management;
- a guarantee that the model's answers are accurate.

If these needs come up, keep the files as the structuring layer and add technical controls around their access and execution paths.

## 7. Decision rule

A use is ready for the team when:

1. a first real workflow works;
2. the allowed data is written down;
3. a responsible person reviews the outputs;
4. `node .ai/base.mjs validate --root .` passes;
5. the team knows what to do when the assistant marks `[A VALIDER]` or `[ATTENTION]`.

If any one of these is missing, keep the use at the experimentation stage.

## Your next action

Choose one repeatable, low-risk task today, then write the allowed-data rule with its owner before opening any document in the AI tool.
