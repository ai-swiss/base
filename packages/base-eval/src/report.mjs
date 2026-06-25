// Aggregate a set of RunResults into an experiment report. Pure function over data — no I/O, no
// models — so it is trivially testable and is the exact shape a Monitor dashboard renders (pass rate,
// outcome mix, severity histogram, failure-mode histogram, actionable fix hints).
//
// ExperimentReport:
//   { total, passRate, errors,
//     outcomes:   { goal_met, partially_met, not_met },
//     bySeverity: { blocker, major, minor },
//     byFailureMode: { <mode>: count, ... },     // only non-fully-met runs contribute
//     fixHints:   [{ scenarioId, failureMode, fixHint }],
//     scenarios:  [{ scenarioId, outcome, failureMode, severity, stopReason }] }
// `errors` counts runs with no verdict (a scenario that threw and was recorded by runExperiment).

export function summarizeRuns(results = []) {
  const outcomes = { goal_met: 0, partially_met: 0, not_met: 0 };
  const bySeverity = { blocker: 0, major: 0, minor: 0 };
  const byFailureMode = {};
  const fixHints = [];
  const scenarios = [];

  for (const r of results) {
    const v = r.verdict ?? {};
    if (v.outcome in outcomes) outcomes[v.outcome]++;
    if (v.severity && v.severity in bySeverity) bySeverity[v.severity]++;
    if (v.failureMode) byFailureMode[v.failureMode] = (byFailureMode[v.failureMode] ?? 0) + 1;
    if (v.fixHint) fixHints.push({ scenarioId: r.scenarioId, failureMode: v.failureMode ?? null, fixHint: v.fixHint });
    scenarios.push({
      scenarioId: r.scenarioId,
      outcome: v.outcome ?? null,
      failureMode: v.failureMode ?? null,
      severity: v.severity ?? null,
      stopReason: r.stopReason ?? null,
    });
  }

  const total = results.length;
  return {
    total,
    passRate: total ? outcomes.goal_met / total : 0,
    errors: results.filter((r) => !r.verdict).length,
    outcomes,
    bySeverity,
    byFailureMode,
    fixHints,
    scenarios,
  };
}
