// @ai-swiss/base-eval — run BASE processes against a simulated user and score them with an independent
// judge. Decoupled by dependency injection: it consumes LanguageModel-shaped objects (from
// @ai-swiss/base-llm or any adapter) for the three roles — agent-under-test (SUT), simulated user
// (runner), evaluator — and a HarnessProfile for the SUT's system context + tool surface. Headless,
// deterministic with faux models, zero dependencies.

export {
  OUTCOMES,
  SEVERITIES,
  FAILURE_MODES,
  normalizeVerdict,
  assertScenario,
  VerdictError,
} from "./src/schema.mjs";

export { baseNativeHarness } from "./src/harness.mjs";
export { runConversation } from "./src/conversation.mjs";
export { createSimulatedUser } from "./src/runner.mjs";
export { createLlmEvaluator } from "./src/evaluator.mjs";
export { runScenario, runExperiment } from "./src/experiment.mjs";
export { summarizeRuns } from "./src/report.mjs";
export { extractJson, renderTranscript } from "./src/util.mjs";
