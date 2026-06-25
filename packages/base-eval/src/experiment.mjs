// Orchestration: run one scenario end to end (drive the conversation, then judge it) into a RunResult.
// Deterministic when the injected models are deterministic. A RunResult is plain data — persist it as
// JSONL, diff it, replay it.
//
// RunResult: { scenarioId, sutId, turns, messages, stopReason, verdict }

import { runConversation } from "./conversation.mjs";
import { summarizeRuns } from "./report.mjs";

/**
 * @typedef {import('./conversation.mjs').LanguageModel} LanguageModel
 * @typedef {import('./conversation.mjs').Runner} Runner
 * @typedef {import('./conversation.mjs').Harness} Harness
 * @typedef {import('./conversation.mjs').Evaluator} Evaluator
 * @typedef {import('./conversation.mjs').Limits} Limits
 */

/**
 * @param {{ sut: LanguageModel, runner: Runner, harness: Harness, evaluator: Evaluator, scenario: any, limits?: Limits }} args
 */
export async function runScenario({ sut, runner, harness, evaluator, scenario, limits = {} } = /** @type {any} */ ({})) {
  if (!evaluator?.evaluate) throw new Error("runScenario requires an `evaluator` with .evaluate()");
  const { turns, messages, stopReason } = await runConversation({ sut, runner, harness, scenario, limits });
  const verdict = await evaluator.evaluate(scenario, turns, { signal: limits.signal });
  // sutId records which model produced the run — the start of a reproducibility block.
  return { scenarioId: scenario.id, sutId: sut.id ?? null, turns, messages, stopReason, verdict };
}

// Run a suite of scenarios against the SAME process/harness and aggregate. Sequential by design:
// deterministic, and the per-scenario `onResult` callback lets a caller stream progress (e.g. SSE)
// without this function knowing about transport. Concurrency can be added later if it earns its keep.
//
// Resilient: one scenario's failure (e.g. an evaluator that returns garbage) is recorded as an
// `error` run and the suite continues — a long run is never lost to a single bad scenario. Honours
// `limits.signal` between scenarios for responsive cancellation.
/**
 * @param {{ scenarios: any[], sut: LanguageModel, runner: Runner, harness: Harness, evaluator: Evaluator, limits?: Limits, onResult?: (result: any, done: number, total: number) => any }} args
 */
export async function runExperiment({ scenarios, sut, runner, harness, evaluator, limits = {}, onResult } = /** @type {any} */ ({})) {
  if (!Array.isArray(scenarios) || scenarios.length === 0) throw new Error("runExperiment requires a non-empty `scenarios` array");
  const results = [];
  for (const scenario of scenarios) {
    if (limits.signal?.aborted) break;
    let result;
    try {
      result = await runScenario({ sut, runner, harness, evaluator, scenario, limits });
    } catch (error) {
      result = {
        scenarioId: scenario?.id ?? null,
        sutId: sut?.id ?? null,
        turns: [],
        messages: [],
        stopReason: "error",
        error: String(error?.message ?? error),
        verdict: null,
      };
    }
    results.push(result);
    if (onResult) await onResult(result, results.length, scenarios.length);
  }
  return { results, report: summarizeRuns(results) };
}
