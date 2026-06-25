// The evaluator ("judge") — a LanguageModel that reads a finished transcript and the scenario goals,
// then returns a structured verdict. It never participates in the conversation (no leakage). Two
// different guarantees here, never conflate them. The verdict's SHAPE is code-enforced: it is
// normalized and validated against the closed taxonomy (schema.mjs), so an out-of-taxonomy or
// unparseable judgement is surfaced as an error, not silently accepted. The cited EVIDENCE (turn
// index + quote) is NOT machine-checked against the transcript — the judge can cite a quote that
// isn't there. So the verdict stays a "signal to verify" (see tools/eval/README.md), the judge's
// own fallible reading, never established truth.

import { systemMessage, userMessage } from "./llm.mjs";
import { FAILURE_MODES, normalizeVerdict, OUTCOMES, SEVERITIES, VerdictError } from "./schema.mjs";
import { completeJson, renderTranscript } from "./util.mjs";

export function createLlmEvaluator(model, { instructions = "", jsonMode = false } = {}) {
  if (!model?.complete) throw new Error("createLlmEvaluator requires a LanguageModel with .complete()");

  async function evaluate(scenario, turns, ctx = {}) {
    const sys = systemMessage(
      [
        "You are a strict, fair EVALUATOR of an AI assistant transcript. Judge only what the transcript shows.",
        "Decide whether the assistant achieved the user's goals, and if not, why — in BASE terms.",
        "",
        `outcome ∈ {${OUTCOMES.join(", ")}}.`,
        `severity ∈ {${SEVERITIES.join(", ")}} (omit when goal_met).`,
        "failureMode (omit when goal_met) ∈:",
        ...FAILURE_MODES.map((m) => `  - ${m}`),
        "",
        "Ground every judgement in evidence: cite the turn index and a short quote. Do not invent.",
        instructions,
        "",
        'Reply ONLY with JSON of shape:',
        '{"outcome": string, "failureMode": string|null, "severity": string|null, "confidence": number,',
        ' "evidence": [{"turn": number, "quote": string, "why": string}], "rationale": string, "fixHint": string|null}',
      ]
        .filter(Boolean)
        .join("\n"),
    );
    const user = userMessage(
      [
        "User goals:",
        ...scenario.goals.map((g, i) => `  ${i + 1}. ${g}`),
        "",
        "Transcript:",
        renderTranscript(turns),
        "",
        "Return the verdict JSON.",
      ].join("\n"),
    );

    const raw = await completeJson(model, [sys, user], { signal: ctx.signal }, { jsonMode });
    if (!raw) throw new VerdictError("evaluator did not return parseable JSON");
    return normalizeVerdict(raw);
  }

  return { evaluate };
}
