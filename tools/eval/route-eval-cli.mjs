// tools/eval/route-eval-cli.mjs — the `base route-eval` entry. Runs the labeled routing eval over a
// golden set and prints a readable report. The eval is an HONEST STRUCTURAL SIGNAL, not a target: its
// headline is `recall@1`/`recall@k` (does retrieval rank/surface the right candidate? — model-independent),
// alongside two per-model DIAGNOSTICS — the AGENT-IN-THE-LOOP (the LLM reads the index and routes, the
// lived route a Claude-Code user gets) and the embedding path's REFINER (the over-routes vs over-asks
// shape). All three need a real model, so the eval is Ollama-gated: with `--ollama` it runs over a local
// Ollama; without it (the default, CI-safe path) it prints the header and how to run, never a slow round-trip.
//
// Thin by design: the scoring, wiring and Ollama probe live in route-eval.mjs / route-eval-strategies.mjs /
// route-eval-ollama.mjs; this only resolves paths, runs, and renders. base.mjs dispatches here.

import * as path from "node:path";
import { loadGoldenSet, NOT_A_TARGET_HEADER } from "./route-eval.mjs";
import { loadCompanion } from "../core/companion.mjs";

const DEFAULT_GOLDEN = "tests/fixtures/route-eval-golden.json";

/**
 * Run the labeled routing eval. Returns the report(s) as data (so `--json` can print them) and the
 * text render. `withOllama` triggers the real run (recall@k + the refiner diagnostic over a local
 * Ollama, imported lazily so the default path pulls no model client). Without it, the default path
 * prints the header and the run instruction — never a model round-trip. `frameworkRoot` is the BASE
 * repo root the golden set + corpus resolve against.
 * @param {{ frameworkRoot: string, goldenPath?: string, withOllama?: boolean }} opts
 */
export async function runRouteEvalCli({ frameworkRoot, goldenPath, withOllama = false }) {
  const goldenFile = path.resolve(frameworkRoot, goldenPath || DEFAULT_GOLDEN);
  const golden = await loadGoldenSet(goldenFile);
  const corpusRoot = path.resolve(frameworkRoot, golden.corpus ?? "exemples/routage-pme");

  const sections = [NOT_A_TARGET_HEADER];
  const result = { corpus: golden.corpus, total: golden.cases.length };

  if (!withOllama) {
    sections.push(
      "\nThe eval is Ollama-gated (it needs a real embedder). Run it with `base route-eval --ollama`",
      "(or `npm run route-eval:ollama`) over a local Ollama with the embedding + refiner models pulled.",
    );
    return { result, text: sections.join("\n") };
  }

  // The --ollama path needs both optional companions (the embedder + the LLM port); check them first
  // so a missing one says "install it" instead of a raw module error from route-eval-ollama's imports.
  await loadCompanion("@ai-swiss/base-ranker-semantic", "L'évaluation de routage avec --ollama");
  await loadCompanion("@ai-swiss/base-llm", "L'évaluation de routage avec --ollama");
  const { probeOllama, runOllamaEval, OLLAMA_DEFAULTS } = await import("./route-eval-ollama.mjs");
  const probe = await probeOllama();
  if (!probe.ok) {
    sections.push(`\nSkipped — ${probe.reason}`);
    result.skipped = probe.reason;
    return { result, text: sections.join("\n") };
  }

  const run = await runOllamaEval(corpusRoot, golden);
  sections.push(`\n  Ollama: embed=${OLLAMA_DEFAULTS.embeddingModel} agent=${OLLAMA_DEFAULTS.agentModel} refiner=${OLLAMA_DEFAULTS.refinerModel}`, run.text);
  result.recall = run.recall;
  result.agent = run.agent;
  result.refiner = run.refiner;
  return { result, text: sections.join("\n") };
}
