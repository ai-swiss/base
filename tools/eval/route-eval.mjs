// tools/eval/route-eval.mjs — the LABELED routing eval. An HONEST STRUCTURAL SIGNAL, never a
// model-performance target.
//
// WHAT THIS MEASURES, AND WHAT IT DOES NOT. The eval answers one structural question: over the
// deny-filtered corpus, does embedding retrieval SURFACE the right candidate for a real user phrasing?
// That headline — `recall@k` — is MODEL-INDEPENDENT in the sense that matters: it is the property of
// the embeddings + `route_text`, with no small LLM in the loop to decide. It is the signal to trust.
//
// What this is NOT: a score to lift. The final route-or-abstain in production runs on the USER'S OWN
// AI (Claude Code reading the index), far stronger than any local model used here; the embedding
// strategy's small refiner is only a fallback for headless scale. We measured the proof directly: two
// small refiners gave OPPOSITE failures on the SAME structure — one over-routes (abstains too little),
// one over-asks (says needs_clarification on clear hits) — a ~26-point accuracy swing from the MODEL
// alone. So the refiner's final accuracy % is model-dependent, not a structural truth. We keep it as a
// per-model DIAGNOSTIC (the over-routes-vs-over-asks SHAPE is genuinely useful), never as a target.
// Do NOT tune prompts or structure to lift a small model's score.
//
// The pieces, in order of trust:
//   • recall@k (summarizeRecall) — model-independent, the headline. Pure over the retrieved candidates.
//   • the refiner diagnostic (summarizeRefiner) — per-model, the over-routes/over-asks failure shape.
//   • the per-case scorer (scoreCase/summarizeEval) — grades any route function; used by the diagnostic.
//
// Every scorer is PURE over data (like report.mjs's summarizeRuns): no I/O, no models, trivially tested
// and the exact shape a report renders. The runner injects the route function, so the SAME scorer
// grades a lexical route, a refiner route, or a stub.

import * as fs from "node:fs/promises";

// --- the labels ---------------------------------------------------------------------------------

/**
 * @typedef {"route" | "abstain_ambiguous" | "abstain_out_of_scope"} ExpectedOutcome
 * @typedef {{ query: string, category: string, outcome: ExpectedOutcome, agent?: string, process?: string }} GoldenCase
 */

/** Load and validate a golden set file. Throws clearly on a malformed set (a bad eval is not run). */
export async function loadGoldenSet(filePath) {
  let parsed;
  try {
    parsed = JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Invalid golden set JSON (${filePath}): ${String(error?.message ?? error)}`);
  }
  return validateGoldenSet(parsed, filePath);
}

const VALID_OUTCOMES = new Set(["route", "abstain_ambiguous", "abstain_out_of_scope"]);

/** Validate the golden set shape. A `route` case MUST name an agent and a process; an abstention need not. */
export function validateGoldenSet(parsed, label = "golden set") {
  const cases = Array.isArray(parsed?.cases) ? parsed.cases : null;
  if (!cases) throw new Error(`${label}: expected an object with a non-empty \`cases\` array.`);
  if (cases.length === 0) throw new Error(`${label}: \`cases\` is empty.`);
  cases.forEach((c, i) => {
    if (typeof c?.query !== "string" || !c.query.trim()) throw new Error(`${label}: case ${i} has no \`query\`.`);
    if (!VALID_OUTCOMES.has(c.outcome)) throw new Error(`${label}: case ${i} (${c.query}) has invalid \`outcome\` ${JSON.stringify(c.outcome)}.`);
    if (typeof c.category !== "string" || !c.category) throw new Error(`${label}: case ${i} (${c.query}) has no \`category\`.`);
    if (c.outcome === "route" && (!c.agent || !c.process)) throw new Error(`${label}: case ${i} (${c.query}) is a \`route\` but names no agent/process.`);
  });
  return { corpus: parsed.corpus ?? null, cases };
}

// --- the scorer (PURE) --------------------------------------------------------------------------

const ABSTENTION_STATUSES = new Set(["ambiguous", "needs_clarification", "out_of_scope"]);

/**
 * Score ONE actual RouteDecision against its label. The verdict is graded by the kind of expectation,
 * so an abstention is judged on whether it abstained correctly (it does not have to name a process),
 * while a route is judged strictly on the agent+process it picked.
 *   • route                  → correct iff status === "routed" AND agent/process match the label.
 *   • abstain_ambiguous      → correct iff the strategy did NOT confidently route (it asked/clarified).
 *   • abstain_out_of_scope   → correct iff it abstained (out_of_scope, or a needs_clarification with no route).
 * @param {GoldenCase} expected @param {import("../core/router.mjs").RouteDecision} actual
 * @returns {{ correct: boolean, kind: "true_positive" | "true_negative", detail: string }}
 */
export function scoreCase(expected, actual) {
  const status = actual?.status ?? null;
  const gotAgent = actual?.agent?.id ?? null;
  const gotProcess = actual?.process?.id ?? null;

  if (expected.outcome === "route") {
    // A positive: routing SHOULD fire. Correct only on an exact agent+process match.
    const correct = status === "routed" && gotAgent === expected.agent && gotProcess === expected.process;
    return {
      correct,
      kind: "true_positive",
      detail: correct ? `routed → ${gotAgent}/${gotProcess}` : `expected ${expected.agent}/${expected.process}, got ${status} ${gotAgent ?? "-"}/${gotProcess ?? "-"}`,
    };
  }

  // A negative: routing should NOT confidently fire — it should ask or abstain. `abstain_out_of_scope`
  // is the strictest (no real candidate exists); `abstain_ambiguous` accepts any honest non-route.
  const abstained = ABSTENTION_STATUSES.has(status) && gotProcess === null;
  const correct =
    expected.outcome === "abstain_out_of_scope"
      ? status === "out_of_scope" || (status === "needs_clarification" && gotProcess === null)
      : abstained;
  return {
    correct,
    kind: "true_negative",
    detail: correct ? `abstained (${status})` : `expected an abstention, got ${status} ${gotAgent ?? "-"}/${gotProcess ?? "-"}`,
  };
}

/**
 * Aggregate per-case verdicts into a report — the per-case grader behind the refiner diagnostic
 * (summarizeRefiner). PURE over data (no I/O, no model), so it is trivially tested. TP/TN are reported
 * separately because they fail differently: a missed route is under-routing, a wrong abstention is
 * over-routing — exactly the over-asks/over-routes split the diagnostic surfaces. Per-category accuracy
 * surfaces WHERE a model is weak (e.g. multilingual).
 * @param {Array<{ category: string, verdict: { correct: boolean, kind: string } }>} graded
 */
export function summarizeEval(graded) {
  const byCategory = {};
  const tally = { total: graded.length, correct: 0, tp_total: 0, tp_correct: 0, tn_total: 0, tn_correct: 0 };

  for (const g of graded) {
    const cat = (byCategory[g.category] ??= { total: 0, correct: 0 });
    cat.total++;
    if (g.verdict.correct) {
      cat.correct++;
      tally.correct++;
    }
    if (g.verdict.kind === "true_positive") {
      tally.tp_total++;
      if (g.verdict.correct) tally.tp_correct++;
    } else {
      tally.tn_total++;
      if (g.verdict.correct) tally.tn_correct++;
    }
  }

  const rate = (a, b) => (b ? a / b : 1);
  return {
    total: tally.total,
    accuracy: rate(tally.correct, tally.total),
    truePositiveRate: rate(tally.tp_correct, tally.tp_total), // recall: routes it should take, that it took
    trueNegativeRate: rate(tally.tn_correct, tally.tn_total), // abstentions it should make, that it made
    byCategory: Object.fromEntries(
      Object.entries(byCategory)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([cat, c]) => [cat, { total: c.total, correct: c.correct, accuracy: rate(c.correct, c.total) }]),
    ),
  };
}

// --- recall@k: the model-INDEPENDENT structural signal -----------------------------------------

/**
 * Score one retrieval against a `route` label: was the EXPECTED process surfaced in the retrieved
 * candidates? No refiner, no decision — this grades the embeddings + `route_text` alone, the property
 * that does not move when the small LLM does. PURE over the candidate ids the retriever returned.
 * @param {{ process?: string }} expected @param {string[]} retrievedProcessIds the candidate process ids, in rank order
 * @returns {{ hit: boolean, rank: number | null }} rank is 1-based position of the expected process, null if absent
 */
export function scoreRecall(expected, retrievedProcessIds) {
  const idx = retrievedProcessIds.indexOf(expected.process ?? "");
  return idx >= 0 ? { hit: true, rank: idx + 1 } : { hit: false, rank: null };
}

/**
 * Aggregate per-case recall verdicts into a recall report. Only `route` cases count — recall is undefined
 * for an abstention (there is no process to surface). Reports BOTH recall@k (hit anywhere in the top-k)
 * AND recall@1 (the expected process ranked FIRST) overall and per category. recall@1 is the
 * discriminating signal: recall@k is vacuous when `k` ≥ the corpus's process count (the top-k then holds
 * every candidate), so on a small demo corpus it is necessarily 100%; the rank is what separates a good
 * retriever from a lucky one. PURE over data, the exact shape printRecall renders. Per category surfaces
 * WHERE retrieval bridges (multilingual EN→FR especially: does the embedder rank the FR `route_text`
 * first for an EN query?).
 * @param {Array<{ category: string, recall: { hit: boolean, rank: number | null } }>} graded
 */
export function summarizeRecall(graded) {
  const byCategory = {};
  const tally = { total: graded.length, hits: 0, top1: 0 };
  for (const g of graded) {
    const cat = (byCategory[g.category] ??= { total: 0, hits: 0, top1: 0 });
    cat.total++;
    if (g.recall.hit) {
      cat.hits++;
      tally.hits++;
      if (g.recall.rank === 1) {
        cat.top1++;
        tally.top1++;
      }
    }
  }
  const rate = (a, b) => (b ? a / b : 1);
  return {
    total: tally.total,
    recall: rate(tally.hits, tally.total),
    recallAt1: rate(tally.top1, tally.total),
    byCategory: Object.fromEntries(
      Object.entries(byCategory)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([cat, c]) => [cat, { total: c.total, hits: c.hits, top1: c.top1, recall: rate(c.hits, c.total), recallAt1: rate(c.top1, c.total) }]),
    ),
  };
}

/**
 * Run the `route` cases of a golden set through an injected `retrieveProcessIds(query) => string[]`
 * (the retriever's candidate process ids, in rank order) and grade recall@k for each. Abstention cases
 * are skipped — recall is a property of routes only. Sequential and deterministic (a fixed embedder is
 * deterministic at the vector level). Returns the graded route cases and the recall report.
 * @param {{ cases: GoldenCase[] }} goldenSet
 * @param {(query: string) => Promise<string[]>} retrieveProcessIds
 * @param {{ onCase?: (graded: object, done: number, total: number) => any, signal?: AbortSignal }} [opts]
 */
export async function runRecallEval(goldenSet, retrieveProcessIds, { onCase, signal } = {}) {
  const routeCases = goldenSet.cases.filter((c) => c.outcome === "route");
  const graded = [];
  for (const expected of routeCases) {
    if (signal?.aborted) break;
    const retrieved = await retrieveProcessIds(expected.query);
    const recall = scoreRecall(expected, retrieved);
    const row = { query: expected.query, category: expected.category, expected: expected.process ?? null, recall };
    graded.push(row);
    if (onCase) await onCase(row, graded.length, routeCases.length);
  }
  return { graded, report: summarizeRecall(graded) };
}

// --- the refiner diagnostic (per-model, NOT a score) --------------------------------------------

/**
 * Reshape a refiner's graded run into a per-MODEL diagnostic — the over-routes vs over-asks failure
 * SHAPE, not a quality score. `forced_routes` are abstentions the refiner instead routed (the
 * over-routing failure of an `llama3.1`-shaped model); `forced_clarifications` are routes the refiner
 * instead asked to clarify (the over-asking failure of a `qwen2.5:3b`-shaped model). Two small models
 * swing this ~26 points on the SAME structure, so the accuracy here is a property of the model, not of
 * the routing — it is reported, explicitly labeled model-dependent, never floored.
 * @param {Array<{ category: string, outcome: string, verdict: { correct: boolean, kind: string } }>} graded the rows runRouteEval produces
 */
export function summarizeRefiner(graded) {
  const eval_ = summarizeEval(graded.map((g) => ({ category: g.category, verdict: g.verdict })));
  let forcedRoutes = 0; // an abstention case the refiner confidently ROUTED — over-routing
  let forcedClarifications = 0; // a route case the refiner asked to clarify / abstained — over-asking
  for (const g of graded) {
    if (g.verdict.correct) continue;
    if (g.outcome === "route") forcedClarifications++;
    else forcedRoutes++;
  }
  return { accuracy: eval_.accuracy, total: eval_.total, forcedRoutes, forcedClarifications, byCategory: eval_.byCategory };
}

// --- the runner ---------------------------------------------------------------------------------

/**
 * Run a labeled golden set through an injected `route(query) => RouteDecision` and grade every case.
 * Sequential and deterministic (the strategies are deterministic at temperature 0). Returns the graded
 * cases (with the actual decision and the verdict) and the aggregate report.
 * @param {{ cases: GoldenCase[] }} goldenSet
 * @param {(query: string) => Promise<import("../core/router.mjs").RouteDecision>} route
 * @param {{ onCase?: (graded: object, done: number, total: number) => any, signal?: AbortSignal }} [opts]
 */
export async function runRouteEval(goldenSet, route, { onCase, signal } = {}) {
  const cases = goldenSet.cases;
  const graded = [];
  for (const expected of cases) {
    if (signal?.aborted) break;
    let actual;
    try {
      actual = await route(expected.query);
    } catch (error) {
      // A thrown route is a failure of THAT case, not the run: record it as an empty decision so the
      // scorer marks it wrong and the suite finishes (one bad case never loses the whole report).
      actual = /** @type {any} */ ({ status: "error", reason_code: String(error?.message ?? error), agent: null, process: null, candidates: [], explanation: "", next_question: null });
    }
    const verdict = scoreCase(expected, actual);
    const row = {
      query: expected.query,
      category: expected.category,
      outcome: expected.outcome,
      expected: { agent: expected.agent ?? null, process: expected.process ?? null },
      actual: { status: actual?.status ?? null, agent: actual?.agent?.id ?? null, process: actual?.process?.id ?? null },
      verdict,
    };
    graded.push(row);
    if (onCase) await onCase(row, graded.length, cases.length);
  }
  return { graded, report: summarizeEval(graded) };
}

// --- the report renderers -----------------------------------------------------------------------

// The one line every eval render leads with — so a reader never mistakes a structural signal for a
// model-performance target, wherever the numbers surface.
export const NOT_A_TARGET_HEADER =
  "This is a STRUCTURAL SIGNAL, not a model-performance target. recall@k measures whether retrieval\n" +
  "surfaces the right candidate; the final route/abstain runs on the user's OWN AI (far stronger than\n" +
  "any local model here). Do NOT tune prompts or structure to lift a small model's score.";

/**
 * Render the recall report — the headline, model-independent signal. LEADS with recall@1 (the
 * discriminating number: did the embedder rank the right process FIRST?), then recall@k, both overall and
 * per category, with multilingual called out (the bridge an embedder is supposed to make: EN query → FR
 * `route_text`). Misses name the query whose expected process retrieval did not surface.
 *
 * Why recall@1 leads: recall@k is VACUOUS when `k` ≥ the number of processes (the top-k then holds every
 * candidate, so recall@k is necessarily 100% — the case on the 5-process demo corpus). recall@1 is the
 * rank signal that actually discriminates; recall@k is kept because at scale, where the catalogue dwarfs
 * `k`, it is the production "does the refiner even see the right candidate" signal.
 * @param {string} title @param {ReturnType<typeof summarizeRecall>} report @param {number} k
 * @param {{ misses?: Array<object> }} [opts]
 */
export function printRecall(title, report, k, { misses } = {}) {
  const pct = (x) => `${(x * 100).toFixed(0)}%`;
  const hits = Object.values(report.byCategory).reduce((a, c) => a + c.hits, 0);
  const top1 = Object.values(report.byCategory).reduce((a, c) => a + c.top1, 0);
  const lines = [
    `\n${title}`,
    `  recall@1            : ${pct(report.recallAt1)}  (${top1}/${report.total} routes — expected process ranked FIRST) ← the discriminating signal`,
    `  recall@${k}            : ${pct(report.recall)}  (${hits}/${report.total} routes — expected process in the top ${k})`,
    `  NB: recall@k is vacuous when k ≥ the number of processes (the top-k then holds all of them); it earns its keep at scale, where k < corpus.`,
    `  Per category (recall@1 | recall@${k}):`,
  ];
  for (const [cat, c] of Object.entries(report.byCategory)) {
    lines.push(`    ${cat.padEnd(22)} ${pct(c.recallAt1).padStart(4)} | ${pct(c.recall).padStart(4)}  (${c.top1}/${c.hits}/${c.total} top1/hits/total)`);
  }
  if (misses?.length) {
    lines.push(`  Not surfaced (${misses.length}):`);
    for (const m of misses) lines.push(`    [${m.category}] «${m.query}» — expected ${m.expected} absent from top ${k}`);
  }
  return lines.join("\n");
}

/**
 * Render a per-model routing DIAGNOSTIC — explicitly not a score. Leads with the failure SHAPE
 * (over-routes vs over-asks), the diagnostic value; the accuracy follows, labeled model-dependent so it
 * is never read as a quality target. The refiner and the agent-in-the-loop produce the SAME `RouteDecision`
 * graded by the SAME scorers (summarizeRefiner), so they render through one shape; `note` is the only
 * difference — the one line that says which leg this is, and why its number is model-dependent.
 * @param {string} title @param {ReturnType<typeof summarizeRefiner>} diag
 * @param {{ misses?: Array<object>, note?: string }} [opts]
 */
function renderDiagnostic(title, diag, { misses, note } = {}) {
  const pct = (x) => `${(x * 100).toFixed(0)}%`;
  const lines = [
    `\n${title}  (per-model DIAGNOSTIC — model-dependent, NOT a score)`,
    ...(note ? [`  ${note}`] : []),
    `  Failure shape       : ${diag.forcedRoutes} over-routes (abstained-cases it routed), ${diag.forcedClarifications} over-asks (routes it asked to clarify)`,
    `  Accuracy            : ${pct(diag.accuracy)}  (${Math.round(diag.accuracy * diag.total)}/${diag.total}) — depends on THIS model, not on the routing`,
    `  Per category:`,
  ];
  for (const [cat, c] of Object.entries(diag.byCategory)) {
    lines.push(`    ${cat.padEnd(22)} ${pct(c.accuracy).padStart(4)}  (${c.correct}/${c.total})`);
  }
  if (misses?.length) {
    lines.push(`  Misses (${misses.length}):`);
    for (const f of misses) lines.push(`    [${f.category}] «${f.query}» — ${f.verdict.detail}`);
  }
  return lines.join("\n");
}

/** The refiner diagnostic (the embedding path's small LLM, on the retrieved shortlist). */
export function printRefinerDiagnostic(title, diag, opts = {}) {
  return renderDiagnostic(title, diag, opts);
}

/**
 * The AGENT-IN-THE-LOOP diagnostic — the LLM reads the generated index and routes, exactly as Claude Code
 * does. This is the path that DOMINATES in practice (the lived route), so it is the diagnostic most
 * representative of the real experience — and still model-dependent: a small local model is INDICATIVE,
 * the real routing runs on the user's far-stronger AI. It sees the full index (every «Éviter si»), not a
 * pre-narrowed shortlist, which is why it tends to abstain more honestly than the bare refiner.
 * @param {string} title @param {ReturnType<typeof summarizeRefiner>} diag @param {{ misses?: Array<object> }} [opts]
 */
export function printAgentDiagnostic(title, diag, { misses } = {}) {
  return renderDiagnostic(title, diag, {
    misses,
    note: "The lived route (what a Claude-Code user gets), on a configurable model — indicative here, the real run is on a far stronger AI.",
  });
}

/** The misses from a graded run, for the report's miss list. */
export function failuresOf(graded) {
  return graded.filter((g) => !g.verdict.correct);
}

/** The recall misses (expected process not surfaced) from a recall-graded run. */
export function recallMissesOf(graded) {
  return graded.filter((g) => !g.recall.hit);
}
