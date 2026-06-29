<!-- fr-synced: 0d58186fa20e049497fd9ffa2752dc6824352129 -->
# Getting started with BASE in a Swiss SME

Getting a small Swiss team to work with AI without going off the rails or rolling out a heavyweight platform: that is the challenge. This kit pulls together the bare essentials to start cleanly with BASE and frame a first, controlled use. It stands in for neither legal advice, nor a security policy, nor document governance.

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

BASE keeps the files locally, but the AI tool you rely on may process the content of the conversation under its own terms. Under the nLPD, the GDPR, or sector-specific obligations, the organization remains responsible for the processing, the provider it selects, and the access rights.

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
- run `base validate` before sharing a new version.

As the team grows, move to Git, to change reviews, and to formalized access rights.

## 5. Set up the monthly ritual

Once a month, or before each important share, run these three commands. They run in a terminal and assume Node is installed (as it was at setup); if no one on the team is comfortable with the terminal, hand this ritual to whoever installed BASE, or ask your AI assistant to run them for you.

```bash
base validate --root <folder>
base entretien --root <folder>
base route-test --root <folder>
```

Then check as a team:

- the markers `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`. The report flags the ones that drag on: markers left open for months mean a review that has become decorative;
- broken links;
- missing descriptions;
- stale data;
- workflows that no longer match actual practice;
- personal resources to promote to the team.

## 6. Keep the limits visible

BASE helps an SME structure its work with AI. By itself, it does not provide:

- IAM, SSO, or RBAC;
- DLP;
- SIEM;
- legal archiving;
- regulatory retention;
- centralized secrets management;
- a guarantee that the model's answers are accurate.

If these needs come up, keep BASE as the structuring layer and add the technical controls all around it.

## 7. Decision rule

A BASE use is ready for the team when:

1. a first real workflow works;
2. the allowed data is written down;
3. a responsible person reviews the outputs;
4. `base validate` passes;
5. the team knows what to do when the assistant marks `[A VALIDER]` or `[ATTENTION]`.

If any one of these is missing, keep the use at the experimentation stage.
