<!-- fr-synced: 407776c357103f235e2fc97c0c2916ed7de1c47e -->
# Impact assessment template (DPIA)

Before you put an assistant in your teams' hands, you need to be able to justify what each person, tool, and model does with the data. This skeleton separates technical controls from institutional responsibilities.

> **Informative page, not legal advice.** This document is a reusable starting point. It does not replace a data protection impact assessment (DPIA under the GDPR, AIPD under the nLPD/nFADP). The actual assessment, its validation, and keeping it up to date are the responsibility of your institution and its data protection officer (DPO). The files and tools provide neither IAM, DLP, SIEM, nor regulatory retention (see [Security and limits](../trust/securite-et-limites.md)).

## Use this skeleton without confusing an instruction with a technical control {#how-to-use-this-skeleton}

Copy this structure into your records. Replace each `[A COMPLETER]` marker with the elements specific to your processing. The structure follows an outline compatible with the nLPD/nFADP and the GDPR, but whether it fits your exact legal framework is for your DPO to verify.

The [audience map diagnosis](pour-qui.md) distinguishes method, structure, approved reference, and execution. A second distinction runs through this document:

- **Mechanism**: a rule enforced by BASE's mediation component (the broker) on the mediated path, and therefore verifiable on that path.
- **Instruction**: a direction followed by the model, so useful but not guaranteed.

A measure is a guarantee only if it rests on a mechanism. Do not credit an *instruction* as a technical control in your risk analysis.

## 1. Description of the processing

- **Title of the processing:** [A COMPLETER]
- **Data controller:** [A COMPLETER]
- **Department or business unit:** [A COMPLETER]
- **Functional description:** [A COMPLETER] (for example: an assistant for drafting internal correspondence, structuring procedures, helping respond to requests).
- **Role of the files and broker:** the files structure domain knowledge; the broker mediates actions that pass through it. The structure is not an agent runtime, an orchestration engine, a RAG system, or a compliance platform.
- **Role of the model:** generative execution is your choice and sits outside the document structure. The model can be local (for example via Ollama) or remote (API). This choice is decisive for the assessment (see section 5).

## 2. Data categories

The folder contains what you put into it:

- the **resource files** you deposit (the domain knowledge, in Markdown);
- a **local trace log** (`.ai/trace`) that records mediated operations: operation, resource, status, duration, with no business content by default.

Default routing **makes no network calls** (lexical). Advanced semantic routing sends text to an embeddings provider only if you explicitly enable it, and a local option exists (see [Routing data security](../trust/securite-donnees-routage.md)).

To fill in for your processing:

- **Categories of data processed:** [A COMPLETER] (internal data, personal data, data sensitive under the law, etc.).
- **Data subjects:** [A COMPLETER] (employees, citizens, clients, etc.).
- **Estimated volume and frequency:** [A COMPLETER].
- **Any sensitive personal data:** [A COMPLETER]. A cautious recommendation: no sensitive personal data in a first assistant.

## 3. Purposes

- **Primary purpose:** [A COMPLETER].
- **Secondary purposes:** [A COMPLETER].
- **Minimization:** [A COMPLETER] (justify that only the data necessary for the purposes is processed).
- **Storage limitation:** see section 7.

## 4. Legal basis

Determining the legal basis is the responsibility of your institution and its DPO.

- **Legal basis chosen:** [A COMPLETER] (for example: consent, performance of a contract, legal obligation, public-interest mission, legitimate interest, depending on the applicable framework).
- **Reference legal framework:** [A COMPLETER] (nLPD/nFADP, relevant cantonal or communal law, GDPR if applicable).
- **Informing data subjects:** [A COMPLETER].

## 5. Data flows and the boundary

Files may remain local while a tool sends a remote model the context it projects from them. The first point to analyze is this **egress**. See the tutorial [Perimeters and egress governance](../tutoriel/equipe-2-perimetres-et-egress.md).

On surfaces that pass through the broker, a resource marked `confidential: true`, or an entire root marked `egress: local-only`, **is not sent to a remote model**. The check happens before the call. This is a mechanism, not an *instruction*.

Scope to frame in your assessment: this control applies to model calls mediated by the broker (chat, evaluation, MCP read), not as a network firewall around your machine. The default policy is permissive (`egress: any`): nothing is withheld until you mark a resource `confidential: true` or a root `egress: local-only`. The broker cannot stop a human, or another tool reading the files directly on disk, from sending that data elsewhere. The mechanism guarantees the mediated path, not your whole environment.

The `sensitivity` metadata classifies a resource and can feed validators. It does not trigger egress withholding. Never present a classification as a technical prohibition on sending.

Caveat: the local/remote determination relies on the declared or deduced provider locality (`tools/core/model-settings.mjs`), which a misconfigured proxy placed in front of a remote service could misrepresent; it is therefore an honest control, not an absolute proof.

To fill in for your processing:

- **Flow mapping:** [A COMPLETER] (who enters what, where the files are stored, which flows leave the machine).
- **Location of file storage:** [A COMPLETER].
- **Location of the trace log:** local, on the machine where the tools run (`.ai/trace`).
- **Model chosen:** [A COMPLETER] (local or remote). If remote, describe the network call to the provider as the egress flow to evaluate.
- **Data marked `confidential: true` / roots set to `egress: local-only`:** [A COMPLETER].

## 6. Recipients and processors

- **Internal recipients:** [A COMPLETER].
- **Main processor to evaluate:** the provider of the remote model chosen, where applicable. The files tie you to no provider; if you run a local model, there is no transfer to a third party on that count.
- **Contractual clauses to verify (if remote model):** [A COMPLETER] (data location, onward processing, retention period on the provider's side, use for training, security).
- **Transfers outside the country / outside the applicable zone:** [A COMPLETER].
- **Jurisdiction of the host and extraterritorial exposure:** [A COMPLETER]. The location of execution does not settle jurisdiction: a host subject to a foreign law, such as the U.S. CLOUD Act, can be compelled to hand over data wherever it is stored, whereas a Swiss actor remains bound by Swiss law. See [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

Note: the settings store **names** of environment variables, not API keys in plaintext. Actual secrets management remains your responsibility.

## 7. Retention and deletion

- **Retention period for resource files:** [A COMPLETER] (defined by your archiving policy).
- **Retention period for the trace log:** [A COMPLETER]. The `.ai/trace` log is local and can be purged according to your policy. Describe the purge procedure you adopt.
- **Deletion procedure / right to erasure:** [A COMPLETER].

Reminder: the files and tools do not provide automatic regulatory retention or legal archiving. These obligations fall to your systems and procedures.

## 8. Risks and mitigation measures

For each risk, distinguish what is covered by a **broker mechanism** from what falls to an **instruction** or to your own systems.

| Risk | Measure | Type |
|---|---|---|
| Leak of confidential data to a remote model | Egress refusal before the call (resource `confidential: true` or root `egress: local-only`) | Mechanism |
| Writing outside the authorized perimeter | Path confinement and refusal of symlink escapes (`tools/core/confine.mjs`) | Mechanism |
| Unconfirmed modification of a file | The broker refuses to apply it without the confirmation required by policy and writes atomically | Mechanism |
| Diff not presented to a person | The client must present the diff before supplying confirmation; the confirmation parameter does not prove that presentation occurred | Integration / organization |
| Unintended execution of an action | Tools in dry-run by default | Mechanism |
| Answer invented by the router | Abstention rather than false certainty (`out_of_scope`, `ambiguous`, `needs_clarification`) | Mechanism |
| Uncontrolled access to the MCP server | MCP HTTP read-only by default, bearer-token option | Mechanism |
| Network exposure of Studio | Studio on loopback only | Mechanism |
| Lack of action traceability | Local log of mediated operations (`.ai/trace`) | Mechanism |
| Entry of sensitive data into an assistant | Resource classification, handling instructions | Instruction / organization |
| Prompt injection through external content | Readable separation of instructions and content, context reduction, source review | Instruction / organization unless a path-specific technical control enforces it |
| Inaccurate model output | Human review against approved sources and criteria; the propose-then-commit flow does not prove accuracy | Instruction / organization |
| Authentication, RBAC, DLP, SIEM | To be covered by your external systems | Out of scope |

Additional measures to document: [A COMPLETER].

## 9. Residual risk

- **Assessment of residual risk after measures:** [A COMPLETER] (low / medium / high, with justification).
- **Risks not covered by the files and broker:** [A COMPLETER] (for example: authentication, data leak prevention in the DLP sense, centralized logging, regulatory retention).
- **Decision:** [A COMPLETER] (processing acceptable as is, subject to conditions, or to be reviewed).

## 10. Validation

- **Assessment written by:** [A COMPLETER], on [A COMPLETER].
- **Opinion of the data protection officer (DPO):** [A COMPLETER].
- **Consultation of the supervisory authority if required:** [A COMPLETER].
- **Approval of the data controller:** [A COMPLETER], on [A COMPLETER].
- **Planned review date:** [A COMPLETER].

## Your next action

Copy this skeleton into your records and have the controller complete all ten sections with the DPO before any real personal data is used.
