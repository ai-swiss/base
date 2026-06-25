# @ai-swiss/base-eval

Run a BASE process against a **simulated user** and score the conversation with an **independent judge** — to answer *does this process actually achieve its goal when a real-ish user drives it?*

Decoupled by dependency injection: the engine consumes `LanguageModel`-shaped objects (from `@ai-swiss/base-llm` or any adapter) for the three roles, and a `HarnessProfile` for the SUT's system context + tool surface. Headless, **deterministic with `faux` models**, zero dependencies.

## The three roles (independently configured)

- **SUT** — the agent under test (executes the process, calls tools).
- **Runner** — `createSimulatedUser(model, { persona })`, role-plays the user pursuing the scenario goals; decides when it is satisfied or gives up.
- **Evaluator** — `createLlmEvaluator(model)`, reads the finished transcript and returns a **structured, evidence-grounded verdict**.

## Harness = the fidelity / enforcement seam

`baseNativeHarness({ systemPrompt, toolset, beforeToolCall })` builds the SUT. `beforeToolCall` is where harness fidelity and enforcement live: in `base-native` the SUT's write tool *is* propose→commit, so a denied write exercises the real gate. Real harnesses differ in controllable ways (tool surface, mediation, agency) — modelled explicitly, not pretended.

## Verdict (multi-dimensional, closed taxonomy)

```
{ outcome: "goal_met" | "partially_met" | "not_met",
  failureMode: null | "process_not_followed" | "missing_tool" | "decision_gate_skipped"
             | "unverified_claim" | "wrong_routing" | "non_termination" | "context_loss"
             | "format_violation" | "refused" | "off_goal",
  severity: "blocker" | "major" | "minor" | null,
  confidence: 0..1,
  evidence: [{ turn, quote, why }],   // every judgement grounded in the transcript
  rationale: string,
  fixHint: string | null }            // closes the loop → a proposed process edit
```

`failureMode` maps to BASE's own concepts (decision gates, verification debt, routing, process adherence), so a result tells you what to fix. `normalizeVerdict` rejects out-of-taxonomy or unparseable judgements — the judge is held to BASE's own verification discipline.

## Example (deterministic, faux)

```js
import { createFauxModel } from "@ai-swiss/base-llm";
import { baseNativeHarness, createSimulatedUser, createLlmEvaluator, runScenario } from "@ai-swiss/base-eval";

const harness = baseNativeHarness({ systemPrompt: "Tu prépares des devis. N'invente pas de prix.", toolset });
const result = await runScenario({
  sut,                                    // a LanguageModel (production model in real use)
  runner: createSimulatedUser(runnerModel),
  evaluator: createLlmEvaluator(judgeModel),
  harness,
  scenario: { id: "devis", seedInput: "Je veux un devis…", goals: ["Devis chiffré et justifié"] },
});
// result: { scenarioId, turns, messages, stopReason, verdict }
```

A `RunResult` is plain data — persist it as JSONL, diff it, replay it.
