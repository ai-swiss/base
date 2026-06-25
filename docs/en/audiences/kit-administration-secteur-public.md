<!-- fr-synced: 4a00a506695e067660b55b061e7c1422eddec1a0 -->
# Evaluating and using BASE responsibly in the public sector

Deploying BASE in a public institution puts citizen data, a legal basis, and public procurement on the line: deciding whether and how to do it without taking on needless risk calls for clear bearings. This checklist provides them, in operational terms, and flags the decisions that remain yours (legal counsel, data protection officer, archives, procurement); it is not a substitute for legal advice.

> **Important.** BASE is a local-first **component**, not a compliance platform. On its own it does not provide IAM, SSO, RBAC, DLP, SIEM, legal archiving, or regulatory retention (see [Security and limits](../trust/securite-et-limites.md)). What it does provide: domain knowledge in files you own, and honest mediation of sensitive actions.

## 1. Classify the data scope

- List the data an assistant will touch, and its classification (public, internal, confidential).
- A prudent starting rule: no personal citizen data in a first assistant. Begin with internal workflows (templates, procedures, drafting).
- BASE maintains a sensitivity boundary in the metadata (`sensitivity`) and can, if you configure a validator, **refuse** resources that are too sensitive (see the [enterprise kit](kit-enterprise.md), `forbidSensitivity` validator).

> **Institutional decision:** the applicable internal classification and the legal basis (for example the nLPD and relevant cantonal/communal law).

## 2. Citizen data and data protection

- If personal data is involved, the browser tier alone is not enough: use the CLI or the MCP, which mediate actions and keep traces.
- Routing stays **100% local** by default (lexical, zero network). Advanced semantic routing sends text to an embeddings provider only if you explicitly enable it, and a local option (Ollama) exists (see [Security of routing data](../trust/securite-donnees-routage.md)).

> **Institutional decision:** an impact assessment (AIPD/DPIA) where required, and the record of processing activities.

## 3. Model provider policy

- The model (the generative execution) remains **your choice** and lives outside BASE. BASE structures the knowledge the model executes; it ties you to no provider.
- To stay sovereign, you can run local models (for example via Ollama); BASE imposes no cloud service.
- **Locality does not settle everything: the host's jurisdiction matters as much as where the model runs.** A host subject to a foreign law (for example the U.S. CLOUD Act) can be compelled even for data stored in Switzerland. See the CLOUD Act section of [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

> **Institutional decision:** the list of authorized model providers and the contractual clauses (data location, subcontracting, retention period on the provider's side).

## 4. Accessibility

- BASE resources are readable Markdown: compatible with screen readers and suited to accessible publications.
- For any derived public interface, aim for the applicable accessibility standards.

> **Institutional decision:** the accessibility standard applicable to your institution.

## 5. Archiving and retention

- BASE versions by files (Git recommended): the history of decisions and content is traceable.
- The traces of mediated actions are minimal (operation, resource, status, duration), with no business content by default.

> **Institutional decision:** the retention periods and legal archiving rules for your content and logs.

## 6. Public procurement and reuse

- Dual license: **Apache-2.0** for the code (patent clause included) and **CC BY 4.0** for the content (see [License](../trust/licence.md)).
- A **zero-dependency** core (Node 18 or higher): an auditable surface, no heavy supply chain. The MCP server and Studio have their own dependencies, isolated and optional.
- The essentials are local and inspectable: code, schemas, specs (`specs/`), and a reproducible test contract (see [`specs/TESTING.md`](../../../specs/TESTING.md)).

> **Institutional decision:** the procurement criteria (sovereignty, reversibility, support) and the contract clauses.

## 7. Human validation and traceability

- A propose-then-commit discipline: a diff is shown, you validate, then the write happens. Tools run in dry-run by default.
- The markers (`[A VALIDER]`, `[DECISION]`) are searchable bearings, readable by a person as well as by an algorithmic process: they keep the state of a case visible, even months later.

## 8. Keep the limits visible

Display what BASE does not enforce mechanically (especially in browser-only mode), and what falls to your own systems (IAM, DLP, retention). See [Security and limits](../trust/securite-et-limites.md) and [Sovereignty and trust](../trust/souverainete-et-confiance.md). And for the map of the guarantees the code actually enforces, each with its function and its test, see [Verified mechanisms](../trust/mecanismes-verifies.md).

## Contact

For an institutional conversation (evaluation, pilot, compliance questions), write to AI Swiss at [info@a-i.swiss](mailto:info@a-i.swiss): we aim for a first reply within about ten business days. See also [a-i.swiss](https://a-i.swiss).

The same address points you to the right person for the terms of support for a pilot.
