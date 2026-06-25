#!/usr/bin/env node
// tools/eval/route-eval-ollama.mjs — the Ollama-gated leg of the labeled routing eval. NEVER part of
// the default suite: it needs a running Ollama with a real embedder and a small refiner. It SKIPS
// cleanly when Ollama (or a model) is absent — a clear "skipped: no Ollama" — so it runs locally on
// demand. It produces two things, in order of trust:
//   • recall@k — the model-INDEPENDENT structural signal (embeddings + `route_text` surface the right
//     candidate?). This is the headline. Per category, multilingual called out.
//   • the refiner DIAGNOSTIC — per-model, the over-routes vs over-asks failure shape. NOT a score.
//
// It produces a THIRD, in the same spirit:
//   • the AGENT-IN-THE-LOOP diagnostic — the LLM reads the generated index (consigne + root → agents →
//     processes) and routes, exactly as Claude Code does. The lived route, on a configurable model. NOT a
//     score: a small local model is only INDICATIVE; the real routing runs on the user's far-stronger AI.
//
// Defaults: qwen3-embedding:0.6b (multilingual, the embedder recall@k rides on) + qwen2.5:3b for both the
// refiner and the agent-in-the-loop model (non-reasoning, fast, Qwen-family — consistent with the
// embedder). NB the plan's qwen3:4b is a THINKING model (slow, wrong for a fast routing pick); and treat
// NO model as "the answer" — both LLM legs are diagnostics, their accuracy is model-dependent. Override
// with env or flags.

import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { createOllamaModel } from "@ai-swiss/base-llm";
import { createOllamaEmbedder } from "@ai-swiss/base-ranker-semantic";
import {
  loadGoldenSet,
  runRouteEval,
  runRecallEval,
  summarizeRefiner,
  printRecall,
  printRefinerDiagnostic,
  printAgentDiagnostic,
  recallMissesOf,
  failuresOf,
  NOT_A_TARGET_HEADER,
} from "./route-eval.mjs";
import { makeRecallProbe, makeEmbeddingRoute, makeAgentRouteForCorpus } from "./route-eval-strategies.mjs";
import { reportProgress } from "../core/progress.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const OLLAMA_DEFAULTS = {
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  embeddingModel: process.env.ROUTE_EVAL_EMBED_MODEL || "qwen3-embedding:0.6b",
  refinerModel: process.env.ROUTE_EVAL_REFINER_MODEL || "qwen2.5:3b",
  // The agent-in-the-loop model defaults to the refiner's, so a single `ollama pull` runs both LLM legs;
  // overridable to point the lived-route diagnostic at a stronger local model than the refiner.
  agentModel: process.env.ROUTE_EVAL_AGENT_MODEL || process.env.ROUTE_EVAL_REFINER_MODEL || "qwen2.5:3b",
  k: Number(process.env.ROUTE_EVAL_K) || 10,
};

/**
 * Probe a local Ollama and report whether the eval can run. Returns `{ ok: true }` when Ollama answers
 * AND both configured models are pulled, else `{ ok: false, reason }` with a human reason the smoke
 * test prints as its skip message. A short deadline so an absent Ollama fails fast, not hangs.
 * @param {{ baseUrl?: string, embeddingModel?: string, refinerModel?: string, agentModel?: string, fetch?: typeof globalThis.fetch, timeoutMs?: number }} [opts]
 */
export async function probeOllama(opts = {}) {
  const { baseUrl, embeddingModel, refinerModel, agentModel } = { ...OLLAMA_DEFAULTS, ...opts };
  const fetchImpl = opts.fetch ?? globalThis.fetch;
  const timeoutMs = opts.timeoutMs ?? 1500;
  /** @type {{ models?: Array<{ name?: string }> }} */
  let tags;
  try {
    const res = await fetchImpl(`${baseUrl.replace(/\/+$/, "")}/api/tags`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return { ok: false, reason: `Ollama responded ${res.status} at ${baseUrl}` };
    tags = /** @type {any} */ (await res.json());
  } catch (error) {
    return { ok: false, reason: `no Ollama at ${baseUrl} (${String(error?.message ?? error)})` };
  }
  // Match a pulled model by prefix, so "qwen2.5:3b" matches the tag "qwen2.5:3b" and a digest variant. The
  // models are de-duplicated (the agent model defaults to the refiner's), so a single pull satisfies both.
  const have = new Set((tags?.models ?? []).map((m) => String(m.name)));
  const needed = [...new Set([embeddingModel, refinerModel, agentModel])];
  const missing = needed.filter((m) => ![...have].some((h) => h === m || h.startsWith(`${m}`)));
  if (missing.length) {
    return { ok: false, reason: `Ollama is up but these models are not pulled: ${missing.join(", ")} (run \`ollama pull <model>\`)` };
  }
  return { ok: true };
}

/** The real Ollama embedder (the model recall@k rides on). */
export function makeOllamaEmbedder(opts = {}) {
  const { baseUrl, embeddingModel } = { ...OLLAMA_DEFAULTS, ...opts };
  const embedder = createOllamaEmbedder({ baseUrl, model: embeddingModel });
  return (text) => embedder(text);
}

/**
 * Build the real refiner route function over Ollama (embedder + refiner). The refiner runs JSON-mode
 * (Ollama supports `format: json`) for a clean structured decision from a small model.
 * @param {string} corpusRoot @param {object} [opts]
 */
export function makeOllamaRefinerRoute(corpusRoot, opts = {}) {
  const { baseUrl, refinerModel, k } = { ...OLLAMA_DEFAULTS, ...opts };
  const embed = makeOllamaEmbedder(opts);
  const refinerLlm = createOllamaModel({ baseUrl: `${baseUrl.replace(/\/+$/, "")}/v1`, model: refinerModel });
  const complete = (req, ctx) => refinerLlm.complete({ ...req, responseFormat: { type: "json_object" } }, ctx);
  return makeEmbeddingRoute(corpusRoot, { embed, complete, k });
}

/**
 * Build the real AGENT-IN-THE-LOOP route function over Ollama: a model reads the generated index (the
 * consigne + root → agents → processes) and routes, exactly as Claude Code does. No embedder — this leg
 * is the LLM reading the index, not retrieval. JSON-mode for a clean structured decision from a small model.
 * @param {string} corpusRoot @param {object} [opts]
 */
export function makeOllamaAgentRoute(corpusRoot, opts = {}) {
  const { baseUrl, agentModel } = { ...OLLAMA_DEFAULTS, ...opts };
  const agentLlm = createOllamaModel({ baseUrl: `${baseUrl.replace(/\/+$/, "")}/v1`, model: agentModel });
  const complete = (req, ctx) => agentLlm.complete({ ...req, responseFormat: { type: "json_object" } }, ctx);
  return makeAgentRouteForCorpus(corpusRoot, { complete });
}

/**
 * Run the full Ollama eval: recall@k (the structural headline), then the agent-in-the-loop diagnostic
 * (the lived route — the LLM reads the index), then the refiner diagnostic (the embedding path's small
 * LLM). Returns the three reports as data plus a rendered text block. Errors are NOT swallowed — the eval
 * must see them. The recall + refiner legs share the SAME embedder; the agent leg uses no embedder.
 *
 * Progress (which leg, how many cases done) goes to STDERR so the rendered report on STDOUT stays clean —
 * silent unless a TTY or BASE_PROGRESS (`reportProgress`). The three leg builders are injectable so the
 * wiring is provable without a live Ollama; production passes nothing and they bind the real models.
 * @param {string} corpusRoot @param {{ cases: Array<object> }} golden
 * @param {object} [opts] @param {(stage: string) => (done: number, total: number, label?: string) => void} [opts.progress]
 * @param {(opts: object) => (text: string) => Promise<number[]>} [opts.makeEmbedder]
 * @param {(root: string, opts: object) => Promise<(query: string) => Promise<object>>} [opts.makeAgentRoute]
 * @param {(root: string, opts: object) => Promise<(query: string) => Promise<object>>} [opts.makeRefinerRoute]
 */
export async function runOllamaEval(corpusRoot, golden, opts = {}) {
  const { k, embeddingModel } = { ...OLLAMA_DEFAULTS, ...opts };
  const progress = opts.progress ?? reportProgress;
  const makeEmbedder = opts.makeEmbedder ?? makeOllamaEmbedder;
  const makeAgentRoute = opts.makeAgentRoute ?? makeOllamaAgentRoute;
  const makeRefinerRoute = opts.makeRefinerRoute ?? makeOllamaRefinerRoute;
  // `runRouteEval`/`runRecallEval` call `onCase(row, done, total)`; the reporter wants `(done, total)`.
  const onCase = (stage) => {
    const report = progress(stage);
    return (/** @type {object} */ _row, /** @type {number} */ done, /** @type {number} */ total) => report(done, total);
  };

  // Building the embedder loads (and, the first time, pulls) the model — announce it so the slowest,
  // most-silent step is not mistaken for a hang.
  const embed = makeEmbedder(opts);
  progress("embedder")(1, 1, embeddingModel);

  const probe = await makeRecallProbe(corpusRoot, { embed, k });
  const recall = await runRecallEval(golden, probe, { onCase: onCase("recall") });

  const agentRun = await runRouteEval(golden, await makeAgentRoute(corpusRoot, opts), { onCase: onCase("agent") });
  const agent = summarizeRefiner(agentRun.graded);

  const refinerRun = await runRouteEval(golden, await makeRefinerRoute(corpusRoot, opts), { onCase: onCase("refiner") });
  const refiner = summarizeRefiner(refinerRun.graded);

  const text = [
    printRecall("recall@k — structural signal (embeddings surface the right candidate?)", recall.report, k, { misses: recallMissesOf(recall.graded) }),
    printAgentDiagnostic("Agent-in-the-loop (LLM reads the index — the lived route)", agent, { misses: failuresOf(agentRun.graded) }),
    printRefinerDiagnostic("Refiner (embedding path's small LLM)", refiner, { misses: failuresOf(refinerRun.graded) }),
  ].join("\n");

  return { recall: recall.report, agent, refiner, text };
}

// CLI: run the eval over the golden set and print recall@k + the agent-in-the-loop + refiner diagnostics.
// Exits 0 when it ran (it is a measurement, not a gate); exits 2 when Ollama is unavailable (so a script
// can detect the skip), printing the same clear reason.
async function main() {
  const goldenPath = path.join(ROOT, "tests/fixtures/route-eval-golden.json");
  const golden = await loadGoldenSet(goldenPath);
  const corpusRoot = path.join(ROOT, golden.corpus ?? "exemples/routage-pme");

  const probe = await probeOllama();
  if (!probe.ok) {
    console.error(`route-eval: skipped — ${probe.reason}`);
    process.exitCode = 2;
    return;
  }

  console.log(NOT_A_TARGET_HEADER);
  console.log(`\nroute-eval: ${golden.cases.length} labeled cases over ${path.relative(ROOT, corpusRoot)}`);
  console.log(`  Ollama: embed=${OLLAMA_DEFAULTS.embeddingModel} agent=${OLLAMA_DEFAULTS.agentModel} refiner=${OLLAMA_DEFAULTS.refinerModel} @ ${OLLAMA_DEFAULTS.baseUrl}`);

  const run = await runOllamaEval(corpusRoot, golden);
  console.log(run.text);
}

// Only launch when run as a script (not when imported by the smoke test).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`route-eval failed: ${error?.stack ?? error}`);
    process.exit(1);
  });
}
