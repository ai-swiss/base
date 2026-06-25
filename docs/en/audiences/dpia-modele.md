<!-- fr-synced: ffa337024debda686c2369c8cf42343d3ce4f15b -->
# Impact assessment template (DPIA)

Before you put an assistant in your teams' hands, you need to be able to justify what it does with the data, to your institution and to your data protection officer (DPO). This skeleton gives you a defensible outline for that assessment, and draws a clean line between what BASE guarantees technically and what remains your responsibility: you know exactly what you are committing to.

> **Informative page, not legal advice.** This document is a reusable starting point. It does not replace a data protection impact assessment (DPIA under the GDPR, AIPD under the nLPD/nFADP). The actual assessment, its validation, and keeping it up to date are the responsibility of your institution and its data protection officer (DPO). BASE provides neither IAM, nor DLP, nor SIEM, nor regulatory retention (see [Security and limits](../trust/securite-et-limites.md)).

## How to use this skeleton

Copy this structure into your records. Replace each `[A COMPLETER]` marker with the elements specific to your processing. The structure follows an outline compatible with the nLPD/nFADP and the GDPR, but whether it fits your exact legal framework is for your DPO to verify.

One distinction runs through the entire document, because it is at the heart of BASE's honesty:

- **Mechanism**: a rule enforced by BASE's mediator (the code), so it is enforceable and verifiable.
- **Consigne**: an instruction followed by the model, so useful but not guaranteed.

A measure is a guarantee only if it rests on a mechanism. Do not credit a *consigne* as a technical control in your risk analysis.

## 1. Description of the processing

- **Title of the processing:** [A COMPLETER]
- **Data controller:** [A COMPLETER]
- **Department or business unit:** [A COMPLETER]
- **Functional description:** [A COMPLETER] (for example: an assistant for drafting internal correspondence, structuring procedures, helping respond to requests).
- **Role of BASE:** BASE structures domain knowledge into files you own and mediates sensitive actions. BASE is not an agent runtime, an orchestration engine, a RAG system, or a compliance platform.
- **Role of the model:** generative execution (the model) is your choice and lives outside BASE. The model can be local (for example via Ollama) or remote (API). This choice is decisive for the assessment (see section 5).

## 2. Data categories

BASE itself stores only what you put into it:

- the **resource files** you deposit (the domain knowledge, in Markdown);
- a **local trace log** (`.ai/trace`) that records mediated operations: operation, resource, status, duration, with no business content by default.

Default routing is **100% local** (lexical, zero network). Advanced semantic routing sends text to an embeddings provider only if you explicitly enable it, and a local option exists (see [Routing data security](../trust/securite-donnees-routage.md)).

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

By default, everything stays local. The point to analyze first is **egress**: the call to the remote model, if it happens. See the tutorial [Perimeters and egress governance](../tutoriel/equipe-2-perimetres-et-egress.md).

Mechanism enforced by BASE: a resource marked `confidential: true`, or an entire root marked `egress: local-only`, **is not sent to a remote model**. The check happens **before** the call, so the data does not leave the machine; the refusal is shown, never silent. This is a mechanism, not a *consigne*.

Caveat: the local/remote determination relies on the declared or deduced provider locality (`tools/core/model-settings.mjs`), which a misconfigured proxy placed in front of a remote service could misrepresent; it is therefore an honest control, not an absolute proof.

To fill in for your processing:

- **Flow mapping:** [A COMPLETER] (who enters what, where the files are stored, which flows leave the machine).
- **Location of file storage:** [A COMPLETER].
- **Location of the trace log:** local, on the machine where BASE runs (`.ai/trace`).
- **Model chosen:** [A COMPLETER] (local or remote). If remote, describe the network call to the provider as the egress flow to evaluate.
- **Data marked `confidential: true` / roots set to `egress: local-only`:** [A COMPLETER].

## 6. Recipients and processors

- **Internal recipients:** [A COMPLETER].
- **Main processor to evaluate:** the provider of the remote model chosen, where applicable. BASE ties you to no provider; if you run a local model, there is no transfer to a third party on that count.
- **Contractual clauses to verify (if remote model):** [A COMPLETER] (data location, onward processing, retention period on the provider's side, use for training, security).
- **Transfers outside the country / outside the applicable zone:** [A COMPLETER].
- **Jurisdiction of the host and extraterritorial exposure:** [A COMPLETER]. The location of execution does not settle jurisdiction: a host subject to a foreign law, such as the U.S. CLOUD Act, can be compelled to hand over data wherever it is stored, whereas a Swiss actor remains bound by Swiss law. See [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

Note: BASE stores **names** of environment variables, not API keys in plaintext, in its settings. Actual secrets management remains your responsibility.

## 7. Retention and deletion

- **Retention period for resource files:** [A COMPLETER] (defined by your archiving policy).
- **Retention period for the trace log:** [A COMPLETER]. The `.ai/trace` log is local and can be purged according to your policy. Describe the purge procedure you adopt.
- **Deletion procedure / right to erasure:** [A COMPLETER].

Reminder: BASE does not provide automatic regulatory retention or legal archiving. These obligations fall to your systems and your procedures.

## 8. Risks and mitigation measures

For each risk, distinguish what is covered by a BASE **mechanism** from what falls to a **consigne** or to your own systems.

| Risk | Measure | Type |
|---|---|---|
| Leak of confidential data to a remote model | Egress refusal before the call (resource `confidential: true` or root `egress: local-only`) | Mechanism |
| Writing outside the authorized perimeter | Path confinement and refusal of symlink escapes (`tools/core/confine.mjs`) | Mechanism |
| Unvalidated modification of a file | Propose-then-commit discipline; mediated, atomic writes; a diff is shown before writing | Mechanism |
| Unintended execution of an action | Tools in dry-run by default | Mechanism |
| Answer invented by the router | Abstention rather than false certainty (`out_of_scope`, `ambiguous`, `needs_clarification`) | Mechanism |
| Uncontrolled access to the MCP server | MCP HTTP read-only by default, bearer-token option | Mechanism |
| Network exposure of Studio | Studio on loopback only | Mechanism |
| Lack of action traceability | Local log of mediated operations (`.ai/trace`) | Mechanism |
| Entry of sensitive data into an assistant | Resource classification, handling consignes | Consigne / organization |
| Accuracy of the model's outputs | Human validation (propose then commit); review | Consigne / organization |
| Authentication, RBAC, DLP, SIEM | Outside BASE: to be covered by your systems | Out of scope |

Additional measures to document: [A COMPLETER].

## 9. Residual risk

- **Assessment of residual risk after measures:** [A COMPLETER] (low / medium / high, with justification).
- **Risks not covered by BASE:** [A COMPLETER] (for example: authentication, data leak prevention in the DLP sense, centralized logging, regulatory retention).
- **Decision:** [A COMPLETER] (processing acceptable as is, subject to conditions, or to be reviewed).

## 10. Validation

- **Assessment written by:** [A COMPLETER], on [A COMPLETER].
- **Opinion of the data protection officer (DPO):** [A COMPLETER].
- **Consultation of the supervisory authority if required:** [A COMPLETER].
- **Approval of the data controller:** [A COMPLETER], on [A COMPLETER].
- **Planned review date:** [A COMPLETER].

---

Your institution's DPO owns the actual DPIA. This skeleton only makes it easier to write. For the public threat model and the limits of the local core, see [Security and limits](../trust/securite-et-limites.md) and [Sovereignty and trust](../trust/souverainete-et-confiance.md).
