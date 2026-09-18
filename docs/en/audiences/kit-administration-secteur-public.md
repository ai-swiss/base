<!-- fr-synced: a28d963f9e35b10a65fe398e4bb3f622845a4d63 -->
# Evaluating and using BASE responsibly in the public sector

Deploying BASE in a public institution puts citizen data, a legal basis, and public procurement on the line: deciding whether and how to do it without taking on needless risk calls for clear bearings. This checklist provides those concrete bearings and flags the decisions that remain yours (legal counsel, data protection officer, archives, procurement); it is not a substitute for legal advice.

> **Important.** The BASE structure is a local-first **component**, not a compliance platform. The files, router, and BASE's mediation component (the broker) do not provide IAM, SSO, RBAC, DLP, SIEM, legal archiving, or regulatory retention (see [Security and limits](../trust/securite-et-limites.md)). Files can record domain knowledge; the broker can mediate actions that actually pass through it.

The [audience map diagnosis](pour-qui.md) distinguishes method, structure, approved reference, and execution. Keep that distinction in every institutional decision below.

## 1. Classify the data scope

- List the data an assistant will touch, and its classification (public, internal, confidential).
- A prudent starting rule: no personal citizen data in a first assistant. Begin with internal workflows (templates, procedures, drafting).
- The `sensitivity` metadata classifies a resource. It does not automatically withhold it from sending. A validator can reject a given classification during corpus validation; egress withholding instead depends on `confidential: true` or a `local-only` root on a mediated path (see the [enterprise kit](kit-enterprise.md)).

> **Institutional decision:** the applicable internal classification and the legal basis (for example the nLPD and relevant cantonal/communal law).

## 2. Citizen data and data protection

- If personal data is involved, the browser tier alone is not enough. The CLI or MCP mediate and trace only actions that pass through their commands; direct tool access to files remains outside that guarantee.
- Default routing **makes no network calls** (lexical, no data leaves). Advanced semantic routing sends text to an embeddings provider only if you explicitly enable it, and a local option (Ollama) exists (see [Security of routing data](../trust/securite-donnees-routage.md)).
- Files may remain on the workstation while a tool projects excerpts to a remote model. The egress policy is permissive by default (`any`) until you configure withholding.

> **Institutional decision:** an impact assessment (AIPD/DPIA) where required, and the record of processing activities.

## 3. Model provider policy

- The model remains **your choice** and sits outside the document structure. The files do not bind the institution to a provider. Changing models does not necessarily require rewriting the reference, but it does require reevaluating execution.
- To stay sovereign, you can run local models (for example via Ollama); the files and local commands require no cloud service.
- **Locality does not settle everything: the host's jurisdiction matters as much as where the model runs.** A host subject to a foreign law (for example the U.S. CLOUD Act) can be compelled even for data stored in Switzerland. See the CLOUD Act section of [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

> **Institutional decision:** the list of authorized model providers and the contractual clauses (data location, subcontracting, retention period on the provider's side).

## 4. Accessibility

- Resources are written in readable Markdown: the format is compatible with screen readers and suited to accessible publications.
- For any derived public interface, aim for the applicable accessibility standards.

> **Institutional decision:** the accessibility standard applicable to your institution.

## 5. Archiving and retention

- Git can version the files, making changes to decisions and content traceable.
- The traces of mediated actions are minimal (operation, resource, status, duration), with no business content by default.

> **Institutional decision:** the retention periods and legal archiving rules for your content and logs.

## 6. Public procurement and reuse

- Dual license: **Apache-2.0** for the code (patent clause included) and **CC BY 4.0** for the content (see [License](../trust/licence.md)).
- A **zero-dependency** core (Node 18 or higher): an auditable surface, no heavy supply chain. The MCP server and Studio have their own dependencies, isolated and optional.
- The essentials are local and inspectable: code, schemas, specs (`specs/`), and a reproducible test contract (see [`specs/TESTING.md`](../../../specs/TESTING.md)).

> **Institutional decision:** the procurement criteria (sovereignty, reversibility, support) and the contract clauses.

## 7. Human validation and traceability

- On the mediated path, the proposal command produces a diff and does not write the target file; the apply command requires confirmation under the policy. The client must actually show the diff to a person before supplying that confirmation. Tools run in dry-run by default.
- The markers (`[A VALIDER]`, `[DECISION]`) are searchable bearings, readable by a person as well as by an algorithmic process: they keep the state of a case visible, even months later.
- Separating instructions from content supports review, but does not prevent prompt injection by itself. Treat all external content as untrusted and add controls appropriate to the execution path.

## 8. Keep the limits visible

Display what the tools do not enforce mechanically (especially in browser-only mode), and what falls to your own systems (IAM, DLP, retention). See [Security and limits](../trust/securite-et-limites.md) and [Sovereignty and trust](../trust/souverainete-et-confiance.md). For the map of guarantees the code actually enforces, each with its function and test, see [Verified mechanisms](../trust/mecanismes-verifies.md).

## Your next action

Run the [institutional pilot without personal data](pilote-institution-90-min.md), then record with your data protection officer the conditions that would authorize, or prohibit, a next stage.
