<!-- fr-synced: 03e15ba6754ae50c6db6851dd7629d40a5d8398c -->
# Keeping an expertise alive after deployment

An assistant in service is not a fixed deliverable. Its sources age, its uses reveal gaps, and its execution environment changes. A useful lifecycle connects these signals to a correction owned by a person.

The durable object is not a perfect configuration on launch day. It is maintained expertise: sources, ways of working, checks, and decisions that field use continues to test.

```text
import → edit → evaluate → execute
  ↑                              ↓
doctor ← review ← govern ← field feedback
```

## 1. Import and edit

The [`importer-l-existant`](../../../.ai/agents/createur-agent/skills/processes/importer-l-existant/SKILL.md) process proposes turning useful documents into ways of working, knowledge, and document templates. In the mediated flow, each proposal targets one specific file and is not yet applied; its corresponding commit applies it only after confirmation and after checking that the target has not changed.

[BASE Studio](../../../tools/studio/ui/README.md) presents files and proposed changes. This visibility helps spot editorial debt without proving that the content is correct.

Importing does not mean mechanically dividing the whole corpus into agents. Authoritative sources are preserved, knowledge is distinguished from ways of working, and entry points are created for observed intents. Editing then refines these relationships without duplicating the same rule everywhere.

## 2. Evaluate what matters

The [evaluation harness](../../../tools/eval/README.md) replays scenarios through the intended MCP surface and has a separate invocation score the conversation. This separation reduces some biases, but the verdict still depends on the judge model, rubric, and test cases.

Not every use warrants the same evaluation depth. Tasks promoted to team or institutional scale, and high-risk outputs, deserve scenarios tracked over time. A step the harness cannot execute is reported as a limitation instead of being simulated.

The most useful scenarios represent real journeys: a common intent, the expected sources, a decision point, and an output that the rubric can distinguish from a merely plausible answer. When the reference changes, they help reveal whether important behavior has drifted.

## 3. Execute in an explicit environment

The assistant runs in the chosen AI tool. The BASE broker can enforce confinement, access policy, mediated writing, and tracing only for actions that pass through its entry points. Direct access to disk, shell, or an API bypasses these controls. See [Security and limits](../trust/securite-et-limites.md).

Changing tools or models preserves the textual reference, but may require adapters, different permissions, and new tests before equivalent behavior is restored.

## 4. Collect field feedback

A friction is recorded through `report_friction` when that write tool is available, or through the [`signaler-une-friction`](../../../.ai/agents/concierge-base/skills/processes/signaler-une-friction/SKILL.md) process. It describes what cost time, created risk, or prevented the task.

A friction is not only a defect to fix. It may reveal an ambiguous source, an intent without an entry point, a missing check, or a step that needlessly requests a decision. A recurring unrouted request may justify a new way of working. A single incident does not always do so.

Abstentions are not journaled everywhere. On a single root, the `base route` CLI and a read-write MCP server record honest abstentions. Multi-root branches do not, and a read-only MCP server writes nothing because the request may contain a third party's text. The core router remains side-effect free.

Studio and `base doctor` can then surface open frictions and recurring abstentions that were actually recorded. Their absence from this work stack therefore does not prove that no abstention occurred.

## 5. Review and govern

The `status`, `review_by`, `valid_from`, and `valid_until` fields make aging explicit. `base doctor` reports dead links, orphaned resources, stale evaluations, overdue reviews, and open frictions, among other findings.

Broker egress rules apply only to mediated paths that provide it with an egress context. The MCP server treats reads as remote by default; direct reading by an AI tool or the CLI can bypass this holdback. The complete policy, including operator choices, is canonical in [Data protection](../trust/protection-des-donnees.md) and [Security and limits](../trust/securite-et-limites.md).

Review connects each finding to a decision: correct, replace, deprecate, accept temporarily, or remove. A named owner and date keep monitoring from becoming a list of problems with no follow-up.

## 6. Accumulate without freezing

Field feedback should change the reference only after review. A local correction may enrich a source, way of working, or scenario. A broader evolution may change the entry point itself. In both cases, version history makes it possible to understand why the expertise evolved.

This accumulation does not promise identical behavior across models. It preserves what can be preserved, the intent, sources, rules, checks, and decisions, then requires execution to be reevaluated when a tool or environment changes.

The cycle closes when a field finding becomes a verified, assigned, and dated improvement. It begins again as soon as uses or sources produce a new signal.

## Next action

From the root of your folder, run `node .ai/base.mjs doctor --root .`, choose the open finding with the greatest business risk, and assign its correction to a person with a review date.
