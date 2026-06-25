// Spec coverage: UR-CORE-001
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createFauxModel } from "../../base-llm/index.mjs";
import { baseNativeHarness, createLlmEvaluator, createSimulatedUser, runExperiment, summarizeRuns } from "../index.mjs";

const run = (scenarioId, verdict, stopReason = "runner_done") => ({ scenarioId, stopReason, verdict });

describe("base-eval — summarizeRuns (pure aggregation)", () => {
  it("computes pass rate, outcome/severity/failure-mode histograms and fix hints", () => {
    const results = [
      run("a", { outcome: "goal_met", failureMode: null, severity: null }),
      run("b", { outcome: "not_met", failureMode: "missing_tool", severity: "blocker", fixHint: "add a CRM connector" }),
      run("c", { outcome: "partially_met", failureMode: "non_termination", severity: "minor" }),
      run("d", { outcome: "not_met", failureMode: "missing_tool", severity: "major", fixHint: "expose the price tool" }),
    ];
    const r = summarizeRuns(results);

    assert.equal(r.total, 4);
    assert.equal(r.passRate, 0.25);
    assert.deepEqual(r.outcomes, { goal_met: 1, partially_met: 1, not_met: 2 });
    assert.deepEqual(r.bySeverity, { blocker: 1, major: 1, minor: 1 });
    assert.deepEqual(r.byFailureMode, { missing_tool: 2, non_termination: 1 });
    assert.equal(r.fixHints.length, 2);
    assert.deepEqual(r.fixHints[0], { scenarioId: "b", failureMode: "missing_tool", fixHint: "add a CRM connector" });
    assert.equal(r.scenarios.length, 4);
  });

  it("handles the empty case without dividing by zero", () => {
    const r = summarizeRuns([]);
    assert.equal(r.total, 0);
    assert.equal(r.passRate, 0);
    assert.deepEqual(r.byFailureMode, {});
  });
});

describe("base-eval — runExperiment (suite over scenarios)", () => {
  it("runs every scenario, reports progress, and aggregates into a report", async () => {
    const scenarios = [
      { id: "s1", seedInput: "go", goals: ["g"] },
      { id: "s2", seedInput: "go", goals: ["g"] },
      { id: "s3", seedInput: "go", goals: ["g"] },
    ];
    // Function-form faux so models work across multiple scenarios.
    const sut = createFauxModel(() => "voici le résultat.");
    const runner = createSimulatedUser(createFauxModel(() => '{"status":"satisfied","message":"ok"}'));
    // One distinct verdict per scenario (evaluator is called once per scenario, in order).
    const verdicts = [
      '{"outcome":"goal_met","confidence":0.9,"evidence":[],"rationale":"ok"}',
      '{"outcome":"not_met","failureMode":"off_goal","severity":"major","confidence":0.7,"evidence":[],"rationale":"x","fixHint":"clarify the goal"}',
      '{"outcome":"goal_met","confidence":0.8,"evidence":[],"rationale":"ok"}',
    ];
    const evaluator = createLlmEvaluator(createFauxModel((_req, i) => verdicts[i]));
    const harness = baseNativeHarness({ systemPrompt: "Assistant.", toolset: {} });

    const progress = [];
    const { results, report } = await runExperiment({
      scenarios, sut, runner, evaluator, harness,
      onResult: (r, done, total) => progress.push(`${done}/${total}:${r.verdict.outcome}`),
    });

    assert.equal(results.length, 3);
    assert.deepEqual(progress, ["1/3:goal_met", "2/3:not_met", "3/3:goal_met"]);
    assert.equal(report.total, 3);
    assert.equal(report.passRate, 2 / 3);
    assert.deepEqual(report.byFailureMode, { off_goal: 1 });
    assert.equal(report.fixHints[0].fixHint, "clarify the goal");
  });

  it("records a failed scenario as an error run and keeps the suite going", async () => {
    const scenarios = [
      { id: "s1", seedInput: "go", goals: ["g"] },
      { id: "s2", seedInput: "go", goals: ["g"] },
      { id: "s3", seedInput: "go", goals: ["g"] },
    ];
    const sut = createFauxModel(() => "ok");
    const runner = createSimulatedUser(createFauxModel(() => '{"status":"satisfied","message":"ok"}'));
    // The evaluator returns unparseable output for the 2nd scenario → evaluate throws → recorded.
    // The evaluator makes one corrective retry on bad JSON, so the failing scenario consumes two
    // calls (indices 1 and 2); scenario 1 = call 0, scenario 3 = call 3.
    const evaluator = createLlmEvaluator(
      createFauxModel((_req, i) => (i === 1 || i === 2 ? "no json here" : '{"outcome":"goal_met","confidence":0.9,"evidence":[],"rationale":"ok"}')),
    );
    const harness = baseNativeHarness({ systemPrompt: "Assistant.", toolset: {} });

    const { results, report } = await runExperiment({ scenarios, sut, runner, evaluator, harness });
    assert.equal(results.length, 3, "suite completes despite one failure");
    assert.equal(report.errors, 1);
    assert.equal(report.outcomes.goal_met, 2);
    const errored = results.find((r) => r.stopReason === "error");
    assert.equal(errored.scenarioId, "s2");
    assert.equal(errored.verdict, null);
  });

  it("stops between scenarios when the signal is aborted", async () => {
    const ac = new AbortController();
    const sut = createFauxModel(() => "ok");
    const runner = createSimulatedUser(createFauxModel((_req, i) => {
      if (i === 0) ac.abort(); // abort after the first scenario's runner turn
      return '{"status":"satisfied","message":"ok"}';
    }));
    const evaluator = createLlmEvaluator(createFauxModel('{"outcome":"goal_met","confidence":0.9,"evidence":[],"rationale":"ok"}'));
    const harness = baseNativeHarness({ systemPrompt: "Assistant.", toolset: {} });
    const scenarios = [
      { id: "a", seedInput: "go", goals: ["g"] },
      { id: "b", seedInput: "go", goals: ["g"] },
      { id: "c", seedInput: "go", goals: ["g"] },
    ];
    const { results } = await runExperiment({ scenarios, sut, runner, evaluator, harness, limits: { signal: ac.signal } });
    assert.ok(results.length < 3, "aborted before completing all scenarios");
  });

  it("rejects an empty scenario list", async () => {
    await assert.rejects(() => runExperiment({ scenarios: [] }), /non-empty/);
  });
});
