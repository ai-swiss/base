<!-- fr-synced: 8964d66d011024684f4011941a56e7f9c3a23104 -->
# Verifying BASE's promises, and its limits

Before you hand real work to BASE, you need to be able to verify its promises rather than take them on faith: for each major promise, you'll find here the mechanism, the test, or the example that backs it, along with the limit you should know. This is what anyone who has to audit BASE before relying on it needs: developer, maintainer, institution, enterprise. A visionary phrase is worth nothing unless it points to a file, a test, an example, a limit, or an explicit decision.

## Structure for validation

**Claim.** BASE makes working with AI more verifiable because the intent, the context, the process, the resources, and the expected outputs are written down.

**Mechanisms.**

- `docs/reference/routage-process-et-ressources.md` explains the agent -> process -> resources chain.
- `specs/current/10_core/writes.md` defines the propose -> commit discipline.
- `tests/base-routing.test.mjs` protects the expected abstentions, ambiguities, and routes.
- `tests/base-core.test.mjs` protects validation, links, inventory, and public guardrails.
- `specs/current/10_core/requirements-matrix.md` ties each requirement (UR/FR/NFR) to the test files that cite it; the matrix is generated (`npm run spec:matrix`) and its freshness is checked by the test suite.

**Limit.** BASE makes the verification path more explicit, but that does not guarantee that an answer is true.

## Local by default

**Claim.** BASE can run as a local, readable, portable structure ahead of any platform.

**Mechanisms.**

- `tools/base.mjs` exposes the local commands.
- `docs/guides/connecter-votre-outil.md` shows how to connect different tools.
- `docs/guides/modeles-souverains.md` documents local or sovereign model options.
- `mcp/README.md` shows integration without moving the source of truth.

**Limit.** Organizations still have to define IAM, DLP, retention, logging, and legal review around BASE.

## Optional layers

**Claim.** BASE can stay simple for small-scale use and add layers when the need is real.

**Mechanisms.**

- `docs/learn/comprendre-echelle.md` explains when the local index becomes useful.
- `packages/base-index-local/README.md` documents the optional index.
- `packages/base-ranker-semantic/README.md` documents the optional semantic ranking.
- `packages/base-eval/README.md` documents evaluation.

**Limit.** Adding a layer increases the maintenance surface. Simplicity by default remains a design rule.

## Evaluating your assistant, without making it a proof

**A tool, not an argument.** BASE provides `base eval`: a simulated user talks to your assistant through the real broker, and an independent judge scores the conversation against the goals of a scenario. It's an instrument to explore in order to assess *your* assembly (your agent, your model, your scenarios), never a proof of BASE's quality: what it measures depends on your model, your example, and your hardware, not on BASE.

**Mechanisms.**

- `tools/eval/README.md` documents the command and the judge's role.
- `exemples/assistant-devis/.ai/experiments/scenarios/` contains versioned, reproducible scenarios you can pick up.

**Limit.** The results are yours, not ours. A weak judge produces weak verdicts; the numbers depend on the model, its version, and the hardware. Only the protocol and the scenarios are stable, and BASE publishes no evaluation result as proof of its quality.

## Documentation as projection

**Claim.** Interactive documentation can be beautiful without becoming a second source of truth.

**Mechanisms.**

- `specs/current/10_core/docs.md` defines the documentation model.
- `tools/docs/model.mjs` builds the model from the sources.
- `packages/base-docs-site/` renders the site as an adapter.
- `tests/base-docs.test.mjs` protects determinism, public filtering, and a deployable build.

**Limit.** Presentation pages must stay restrained. If a lasting explanation is needed, it should live in `docs/` or `specs/`.

## Field loop, egress, and corpus health

- **Egress control**: a single rule, a single checkpoint, `tools/core/egress.mjs`
  (`checkEgress`, a pure function tested across the locality × policy × confidentiality matrix in
  `tests/base-egress.test.mjs`). The chat refuses to edit a confidential document with a remote
  model. The context pack holds back the affected references ("held back" badge on screen) and the
  evaluation trace logs the redacted documents.
- **Friction log**: `.ai/feedback/` is create-only, the MCP tool
  `report_friction` never modifies an entry (collision = suffix; verified by
  `tests/base-feedback.test.mjs` and `mcp/tests/index.test.ts`). "Mark resolved" goes back through the
  propose → diff → commit gate like any write.
- **Router abstentions**: each `out_of_scope` / `ambiguous` / `needs_clarification` is
  logged by the adapters (CLI and MCP) in `.ai/feedback/abstentions.jsonl`; the broker
  stays side-effect-free. Both gates go through the same write function.
- **`base doctor`**: a pure projection over existing data (inventory, link graph,
  runs, feedback), with no state of its own. Six checks, two severities, one mandatory
  remediation lead per signal (`tests/base-doctor.test.mjs`). Two gates for a single
  function: CLI `base doctor [--json]` and `GET /api/doctor` (Studio banner).
