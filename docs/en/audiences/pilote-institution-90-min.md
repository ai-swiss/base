<!-- fr-synced: 16d3eeb239d497989b7a3d6b4c392ae3fe4a01df -->
# Institutional pilot, 90 minutes, no personal data

Before committing an institution to an AI tool, you want to examine the evidence: this pilot lets you observe the files, router, and commands **with no citizen's personal data whatsoever**. It is time-boxed to about 90 minutes and does not put a service into production. There is only one condition: working on internal, non-personal procedures.

> **Note.** This page is **informational**: it is neither legal advice nor compliance advice. It does not replace your impact assessment (AIPD/DPIA) or your security policy. A pilot, even a successful one, **does not establish** the compliance of a future real-world processing operation: it gives you what you need to decide, in full awareness, whether to go further.

## What this pilot establishes, and what it does not

**It establishes:**

- that the default routing runs **locally** (lexical, zero network) and can **abstain** rather than guess;
- that the mediated path produces a **diff** before writing and requires the confirmation set by its policy;
- that the validator checks the structural consistency of your corpus;
- where the **boundary** lies between what stays on your machine and what a call to a model would send.

**It does not establish:**

- the compliance of a real-world processing operation (that falls to your AIPD/DPIA and your records);
- the quality or accuracy of a model's answers (the model is your choice, outside the document structure);
- integration with your IAM, SSO, RBAC, DLP, SIEM, or your retention or legal archiving rules. The files, router, and mediation component (broker) provide none of these components (see [Security and limits](../trust/securite-et-limites.md)).

## Mechanism and instruction

The [audience map diagnosis](pour-qui.md) distinguishes method, structure, approved reference, and execution. For this pilot, also distinguish:

- a **mechanism** is enforced by the mediator (the broker): it happens whether or not the model "wants" it to. Examples: path confinement and refusal of symbolic links that point outside the perimeter (`tools/core/confine.mjs`), **mediated and atomic** writes after validation, tools in **dry-run by default**, egress control **before** the call to a remote model.
- an **instruction** is something the model follows (or does not): a tone, a format, a reminder to be careful.

When you ask "is this guaranteed?", check the execution path: a mechanism protects only operations that pass through it. Separating instructions from content supports review, but does not prevent prompt injection by itself.

## Executable prerequisites

Install Node 18 or later, obtain the BASE repository, then define its location. Each command below must succeed before you continue:

```bash
node --version
export BASE_DIR="$HOME/base"
test -f "$BASE_DIR/tools/base.mjs"
```

If the last check fails, follow [Get BASE](../start/obtenir-base.md).

## Step 0: no personal data in the first assistant

Before any command, set the pilot's rule, in writing, for the team:

- **No citizen's personal data** enters this pilot. No names, no case files, no excerpts from real correspondence.
- You work only on **internal, non-personal templates and procedures**: a standard letter template, an intake procedure, an internal checklist, a scoping note.
- If a candidate document contains the slightest personal element, it is **out of pilot**.

This rule is an **organizational instruction**, not a mechanism: neither the router nor the model knows, on your behalf, that a text contains personal data. Screening upstream is your job. Metadata and egress control make some decisions visible, but the decision to bring content in is yours.

## Phase 1: see the shape of an assistant (15 min)

Open the Veytaux tourist office example to see, without installing anything new, what a BASE assistant looks like: an agent, processes, data, a template, scenarios.

- Open the `exemples/veytaux-tourisme/` folder in an AI tool able to read your files, **this folder**, not the repository root.
- Read `exemples/veytaux-tourisme/README.md`, then go through the agent and the two processes.
- On the command line, from this folder, watch how a request is routed:

  ```
  cd "$BASE_DIR/exemples/veytaux-tourisme"
  node .ai/base.mjs route "Quelles activités à faire cet après-midi?" --root .
  ```

Goal of this phase: recognize the **shape** (agent, process, data, template) that you will reproduce with your own internal procedures. The Veytaux office is deliberately fictional and free of any personal data.

## Phase 2: initialize a folder and import 1 to 2 internal, non-personal procedures (40 min)

Create an empty folder, initialize it from the framework, then bring in one or two internal **non-personal** procedures.

1. Initialize a working folder. The first call shows the plan without writing; the second applies the plan after your approval:

   ```bash
   export PILOT_DIR="$HOME/pilote-base-institution"
   mkdir -p "$PILOT_DIR"
   node "$BASE_DIR/tools/base.mjs" init --root "$PILOT_DIR"
   node "$BASE_DIR/tools/base.mjs" init --root "$PILOT_DIR" --tool agents-md --language en --about "Pilot for internal non-personal procedures" --egress local-only --yes
   cd "$PILOT_DIR"
   test -f .ai/base.mjs
   node .ai/base.mjs whereis
   ```

2. Choose **one or two** internal, non-personal procedures (a standard letter template, an intake procedure).
3. Set the real path of one source file, then propose its import:

   ```bash
   export SOURCE_FILE="$HOME/intake-procedure.md"
   test -f "$SOURCE_FILE"
   mkdir -p sources
   cp "$SOURCE_FILE" "sources/intake-procedure.md"
   node .ai/base.mjs propose "documents/intake-procedure.md" --from "sources/intake-procedure.md" --root .
   ```

   The copy deliberately places the source file inside the pilot root because `--from` refuses to read outside that root. The proposal does not write the target file. Record the displayed identifier, review the diff, then supply that identifier only if you approve it:

   ```bash
   printf "Approved change identifier: "
   read -r CHANGE_ID
   node .ai/base.mjs commit "$CHANGE_ID" --root . --confirmed
   ```

The broker refuses an unconfirmed apply operation. It cannot prove, however, that the client showed the diff to a person before sending `--confirmed`. Mediated operations are logged locally in `.ai/trace` (operation, resource, status, duration), with no domain content by default.

## Phase 3: prove that it works, validate and route (15 min)

Check the consistency of the corpus, then route two or three realistic requests.

- Validate the corpus:

  ```
  node .ai/base.mjs validate --root .
  ```

  The validator checks consistency (frontmatter, schema, references). Repository CI runs this check separately. The production dependency audit belongs to release gates and is not a property of this command.

- Route a few requests matching your imported procedures:

  ```
  node .ai/base.mjs route "rediger une lettre type d'accuse de reception" --root .
  ```

  Observe two possible behaviors, both **mechanisms**:
  - the router proposes the relevant agent and process, **locally** (lexical, zero network by default);
  - or it **abstains** (out of scope, ambiguous, clarification needed) rather than giving a false certainty. Abstention is an **intended** outcome, not a failure.

> To go further, the repository provides a replayable set of expected routes (`route-test`). The test contract is documented in [`specs/TESTING.md`](../../../specs/TESTING.md).

## Phase 4: what stayed local, what a model call would send (20 min)

Take stock, explicitly, of the data boundary.

- **Stays local with no model call at all:** default lexical routing, `node .ai/base.mjs validate --root .`, the mediated import, and the `.ai/trace` journal. Advanced semantic ranking sends text to an embeddings provider **only if you enable it**, and a local option (Ollama) exists (see [Security of routing data](../trust/securite-donnees-routage.md)).
- **What a call to a model would send:** files may remain local while the tool sends the remote model the context it projects from them. The provider and processing terms belong to your setup.
- **The mediated guardrail to document:** this pilot makes no mediated model call, so it identifies the boundary without testing the control in execution. On a mediated path that calls a remote model, the **egress** check blocks a `confidential: true` resource or a `local-only` root before the call. The default policy is permissive (`any`). `sensitivity` metadata classifies a resource, but does not withhold it. A tool that reads files directly bypasses this check.

To understand this boundary in detail, read the reference page: [Egress perimeters and governance](../tutoriel/equipe-2-perimetres-et-egress.md), rounded out by [Data protection](../trust/protection-des-donnees.md).

## End-of-pilot checklist

- [ ] Step 0 rule set in writing: no personal data, internal procedures only.
- [ ] Veytaux tourist office example opened and routing observed (Phase 1).
- [ ] Working folder initialized; `.ai/base.mjs` exists and `node .ai/base.mjs whereis` succeeds (Phase 2).
- [ ] One or two internal procedures imported with `node .ai/base.mjs propose`, then `node .ai/base.mjs commit --confirmed` after the diff was reviewed (Phase 2).
- [ ] `node .ai/base.mjs validate --root .` passes; `node .ai/base.mjs route "draft a standard acknowledgement letter" --root .` proposes or abstains as expected (Phase 3).
- [ ] Local / model-call boundary documented, and absence of an executable egress-control test noted (Phase 4).
- [ ] Mechanism / instruction distinction clear for the team.
- [ ] Limits noted: the files, router, and broker provide neither IAM, SSO, RBAC, DLP, SIEM, retention, legal archiving, nor any accuracy guarantee.

## Before any real data: the AIPD/DPIA

This pilot stops **before** the slightest piece of real personal data. To cross that step, your institution must conduct its impact assessment (AIPD/DPIA) and keep its records of processing. The [DPIA impact assessment template](dpia-modele.md) provides a **reusable skeleton** to fill in; neither that document nor the tools perform the assessment for you. The institutional scoping (classification, legal basis, authorized model provider, retention) is detailed, on the decisions side, in the [Government and public sector kit](kit-administration-secteur-public.md) and the [Data protection](../trust/protection-des-donnees.md) page.

Reminder: this page is informational. Responsibility for the AIPD/DPIA and the security policy remains your institution's.

## Your next action

If the checklist is complete, give the pilot observations and the [DPIA template](dpia-modele.md) to your data protection officer before any decision involving real data.
