// The Ollama-gated leg of the labeled routing eval — a SMOKE, never a default-suite gate. It runs the
// SAME golden set against a REAL local Ollama (a real embedder + a real small refiner) and reports
// recall@k (the model-independent structural signal) plus the per-model refiner diagnostic.
//
// OPT-IN, by design and by hygiene: the eval does slow model round-trips, so it must NEVER run inside
// `npm test` / `npm run check`. It is double-gated: it self-skips in MILLISECONDS unless ROUTE_EVAL_OLLAMA
// is set (so the default suite never touches a model, even when a local Ollama is reachable), and then
// it still skips cleanly when Ollama or a model is absent. Run it on demand:
//   ROUTE_EVAL_OLLAMA=1 node --test tests/route-eval-ollama.smoke.test.mjs
// or, the standalone script the npm command runs: `npm run route-eval:ollama`.
//
// This is the measured RUN of the eval: the structural signal is recall@k, proven here end-to-end on
// real models; the agent-in-the-loop accuracy (the lived route — the LLM reads the index) and the
// refiner accuracy are reported as per-model diagnostics, never floored (model-dependent — see
// route-eval.mjs). It asserts only that the eval RAN and produced real reports. The PURE grading
// abstractions it rides on are pinned model-free by route-eval-scorer.test.mjs and route-eval-agent.test.mjs.
//
// Spec coverage: FR-ROUTE-015~weak[opt-in Ollama smoke, skipped by default unless ROUTE_EVAL_OLLAMA=1 and a local Ollama], FR-ROUTE-016

import assert from "node:assert/strict";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, before } from "node:test";
import { loadGoldenSet } from "../tools/eval/route-eval.mjs";
import { probeOllama, runOllamaEval, OLLAMA_DEFAULTS } from "../tools/eval/route-eval-ollama.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const goldenPath = path.join(root, "tests/fixtures/route-eval-golden.json");
const corpusRoot = path.join(root, "exemples/routage-pme");

// Opt-in gate: when unset (the default suite), we never probe Ollama and never call a model.
const OPTED_IN = Boolean(process.env.ROUTE_EVAL_OLLAMA);

describe("labeled routing eval — recall@k + refiner diagnostic over Ollama", () => {
  let probe = { ok: false, reason: "not opted in (set ROUTE_EVAL_OLLAMA=1)" };
  before(async () => {
    if (OPTED_IN) probe = await probeOllama();
  });

  it("runs the golden set through real embeddings + refiner and reports recall@k + the diagnostic", { timeout: 120_000 }, async (t) => {
    if (!OPTED_IN) {
      t.skip("opt-in only — set ROUTE_EVAL_OLLAMA=1 (the default suite does no model round-trips)");
      return;
    }
    if (!probe.ok) {
      t.skip(`no Ollama — ${probe.reason}`);
      return;
    }

    const golden = await loadGoldenSet(goldenPath);
    const run = await runOllamaEval(corpusRoot, golden);

    // Print the empirical answer: the structural signal first, then the per-model diagnostic.
    console.log(`\n  Ollama: embed=${OLLAMA_DEFAULTS.embeddingModel} refiner=${OLLAMA_DEFAULTS.refinerModel}`);
    console.log(run.text);

    // The smoke asserts the eval RAN end to end and produced real reports — not an absolute quality
    // number (the refiner accuracy is model-dependent, never floored). For recall@k the honest assertion
    // depends on the corpus: the routage-pme corpus has only 5 processes, so with the default k=10 the
    // top-k holds EVERY process and recall@k is necessarily 100% — vacuous as a quality signal, but a
    // real invariant: a retriever that drops a candidate (or a deny filter that eats one) breaks it. The
    // discriminating rank quality (recall@1 ≈ 97% on this corpus) is what matters at scale, where k <
    // corpus; this smoke proves the run, the scorer test pins the grading, the printed report is the answer.
    const routeTotal = golden.cases.filter((c) => c.outcome === "route").length;
    assert.equal(run.recall.total, routeTotal, "every route case was scored for recall@k");
    assert.equal(run.recall.recall, 1, "with k ≥ corpus size, every expected process must be retrieved");
    assert.ok(run.agent.total === golden.cases.length, "the agent-in-the-loop diagnostic scored every case");
    assert.ok(run.refiner.total === golden.cases.length, "the refiner diagnostic scored every case");
  });
});
