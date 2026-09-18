<!-- fr-synced: 8ea2935ebd5fde50c045b5b8f049e560f4e4d50b -->
# Verifying BASE's promises, and its limits

Before you hand real work to BASE, you are better off verifying its promises than taking them on faith: for each one, you'll find here the mechanism, the test, or the example that backs it, along with the limit you should know. That is what anyone who has to audit BASE before relying on it expects: developer, maintainer, institution, enterprise. A promise holds only if it points to a verifiable file, test, example, or limit.

## Structure for validation

**Claim.** BASE makes working with AI more verifiable because the intent, the context, the process, the resources, and the expected outputs are written down.

**Mechanisms.**

- `docs/reference/routage-process-et-ressources.md` explains the agent -> process -> resources chain.
- `specs/current/10_core/writes.md` defines the propose -> commit discipline.
- `tests/base-routing.test.mjs` protects the expected abstentions, ambiguities, and routes.
- `tests/base-core.test.mjs` protects validation, links, inventory, and public guardrails.
- `specs/current/10_core/requirements-matrix.md` ties each requirement (UR/FR/NFR) to the test files that cite it; the matrix is generated (`npm run spec:matrix`) and its freshness is checked by the test suite.

**Limit.** BASE makes the verification path more explicit, but that does not guarantee that an answer is right.

## Local by default

**Claim.** BASE can run as a local, readable, portable structure ahead of any platform.

**Mechanisms.**

- `tools/base.mjs` exposes the local commands.
- `docs/guides/connecter-votre-outil.md` shows how to connect different tools.
- `docs/guides/modeles-souverains.md` documents local or sovereign model options.
- `mcp/README.md` shows integration without moving the source of truth.

**Limit.** It still falls to organizations to define IAM, DLP, retention, logging, and legal review around BASE.

## Optional layers

**Claim.** BASE can stay simple for small-scale use and add layers when the need is real.

**Mechanisms.**

- `docs/learn/comprendre-echelle.md` explains when the local index becomes useful.
- `packages/base-index-local/README.md` documents the optional index.
- `packages/base-ranker-semantic/README.md` documents the optional semantic ranking.
- `packages/base-eval/README.md` documents evaluation.

**Limit.** Every layer you add widens the maintenance surface. Simplicity by default remains a design rule.

## An AI judge evaluation does not prove BASE's quality {#evaluating-your-assistant-without-making-it-a-proof}

**An instrument, not an argument.** BASE provides the evaluation (`npm run eval`): a simulated user converses with your assistant through the real broker, and a separate judge invocation scores the conversation against the goals of a scenario. This separation does not make the verdict independent of the model or rubric. It's an instrument built to assess *your* assembly (your agent, your model, your scenarios), not a proof of BASE's quality: what it measures comes down to your model, your example, and your hardware, not to BASE.

**Mechanisms.**

- `tools/eval/README.md` documents the command and the judge's role.
- `exemples/assistant-devis/.ai/experiments/scenarios/` contains versioned, reproducible scenarios you can pick up.

**Limit.** The results are yours, not ours. A weak judge returns weak verdicts; the numbers depend on the model, its version, and the hardware. Only the protocol and the scenarios are stable, and BASE publishes no evaluation result as proof of its quality.

## Documentation as projection

**Claim.** Interactive documentation can be beautiful without becoming a second source of truth.

**Mechanisms.**

- `specs/current/10_core/docs.md` defines the documentation model.
- `tools/docs/model.mjs` builds the model from the sources.
- `packages/base-docs-site/` renders the site as an adapter.
- `tests/base-docs.test.mjs` protects determinism, public filtering, and a deployable build.

**Limit.** Presentation pages must stay restrained. Any explanation meant to last should live in `docs/` or `specs/`.

## Field loop, egress, and corpus health

- **Egress control**: `tools/core/egress.mjs` exposes the pure `checkEgress` decision, protected by
  `tests/base-egress.test.mjs` across model locality, root policy, and the `confidential` flag
  (`FR-EGRESS-001`). Chat refuses a confidential edit with a remote model; the context pack and
  evaluation prompt withhold the affected references and announce the omission.
- **Field journal**: `reportFriction` creates Markdown cards under `.ai/feedback/` without
  overwriting, while `appendAbstention` appends lines to `abstentions.jsonl`. Resolving a friction
  later modifies its card through propose → commit: only card creation has the creation-only
  exemption (`FR-FEEDBACK-001/002/005`, `tests/base-feedback.test.mjs`).
- **Router abstentions**: adapters log `out_of_scope`, `ambiguous`, and `needs_clarification` to
  `.ai/feedback/abstentions.jsonl` only when one root is available or a `root_id` is explicitly selected.
  Multi-root routing and a read-only MCP server write nothing; the broker stays side-effect-free
  (`FR-FEEDBACK-002`, `mcp/tests/index.test.ts`).
- **`base doctor`**: a pure projection over existing data (inventory, link graph,
  runs, feedback), with no state of its own. `diagnoseData` produces 18 finding kinds, two
  severities, and a mandatory `fix_hint` per finding (`FR-DOCTOR-001`,
  `tests/base-doctor.test.mjs`). The CLI `base doctor [--json]` and `GET /api/doctor` call the same
  `diagnose` function.
