// The evaluation domain: scenarios in, structured verdicts out.
//
// A verdict is multi-dimensional (outcome × failure-mode × severity), not just a pass/fail or a
// severity. The failure-mode taxonomy is CLOSED and mapped to BASE's own concepts (decision gates,
// verification debt, routing, process adherence) so results are actionable in BASE terms. Every
// verdict must be grounded in transcript evidence — the evaluator is held to BASE's own verification
// discipline.

export const OUTCOMES = Object.freeze(["goal_met", "partially_met", "not_met"]);
export const SEVERITIES = Object.freeze(["blocker", "major", "minor"]);

// Closed taxonomy. Each maps to a BASE concept so a result tells you what to fix.
export const FAILURE_MODES = Object.freeze([
  "process_not_followed", //   deviated from the SKILL's steps
  "missing_tool", //     needed a tool/connector not available  ← "blocked by tool"
  "decision_gate_skipped", //  wrote/acted without a required [A VALIDER] point
  "unverified_claim", //       invented a fact/price/date  ← verification debt
  "wrong_routing", //          wrong process selected / failed to route
  "non_termination", //        looped / never delivered
  "context_loss", //           lost earlier constraints across turns
  "format_violation", //       ignored the template/output contract
  "refused", //                declined a legitimate task / over-cautious
  "off_goal", //               solved the wrong problem
]);

const OUTCOME_SET = new Set(OUTCOMES);
const SEVERITY_SET = new Set(SEVERITIES);
const FAILURE_SET = new Set(FAILURE_MODES);

export class VerdictError extends Error {
  constructor(message) {
    super(message);
    this.name = "VerdictError";
  }
}

/**
 * Normalize and validate a raw verdict object (e.g. parsed from an evaluator's JSON) into the
 * canonical shape. Throws VerdictError on anything it cannot coerce safely — we never silently accept
 * an out-of-taxonomy judgement.
 *
 * Canonical verdict:
 *   { outcome, failureMode|null, severity|null, confidence(0..1), evidence:[{turn,quote,why}],
 *     rationale, fixHint|null }
 */
export function normalizeVerdict(raw) {
  if (!raw || typeof raw !== "object") throw new VerdictError("verdict must be an object");

  const outcome = raw.outcome;
  if (!OUTCOME_SET.has(outcome)) {
    throw new VerdictError(`verdict.outcome must be one of ${OUTCOMES.join(", ")} (got ${JSON.stringify(outcome)})`);
  }

  const met = outcome === "goal_met";

  // failureMode: required when not fully met, must be null when met.
  let failureMode = raw.failureMode ?? null;
  if (met) {
    failureMode = null;
  } else if (!FAILURE_SET.has(failureMode)) {
    throw new VerdictError(`verdict.failureMode is required for ${outcome} and must be one of ${FAILURE_MODES.join(", ")}`);
  }

  // severity: null when met, else default to "major" if missing/invalid.
  let severity = raw.severity ?? null;
  if (met) severity = null;
  else if (!SEVERITY_SET.has(severity)) severity = "major";

  const confidence = clamp01(raw.confidence);

  const evidence = Array.isArray(raw.evidence)
    ? raw.evidence.map((e, i) => normalizeEvidence(e, i))
    : [];

  const rationale = typeof raw.rationale === "string" ? raw.rationale : "";
  const fixHint = typeof raw.fixHint === "string" && raw.fixHint.trim() ? raw.fixHint : null;

  return { outcome, failureMode, severity, confidence, evidence, rationale, fixHint };
}

function normalizeEvidence(e, index) {
  if (!e || typeof e !== "object") throw new VerdictError(`evidence[${index}] must be an object`);
  const turn = Number.isInteger(e.turn) ? e.turn : null;
  const quote = typeof e.quote === "string" ? e.quote : "";
  const why = typeof e.why === "string" ? e.why : "";
  return { turn, quote, why };
}

function clamp01(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0.5; // neutral default when the judge omits/garbles it
  return Math.min(1, Math.max(0, n));
}

/**
 * A Scenario drives one experiment run.
 *   { id, seedInput, goals: string[], context?: string, persona?: string }
 */
export function assertScenario(scenario) {
  if (!scenario || typeof scenario !== "object") throw new VerdictError("scenario must be an object");
  if (!scenario.id) throw new VerdictError("scenario.id is required");
  if (typeof scenario.seedInput !== "string" || !scenario.seedInput.trim()) {
    throw new VerdictError("scenario.seedInput (first user message) must be a non-empty string");
  }
  if (!Array.isArray(scenario.goals) || scenario.goals.length === 0) {
    throw new VerdictError("scenario.goals must be a non-empty array");
  }
  return scenario;
}
