// The shared eval orchestration, used by BOTH the CLI (run.mjs) and the Studio server. It lives in
// the app layer (touches the broker harness + filesystem), and exists so neither caller duplicates
// "validate the providers, build the models + harness, run the experiment, persist". Two small,
// independent steps: validateRun (may hit the network) and runEvaluation (assumes a valid config).

import { createOllamaModel, createOpenAICompatibleModel } from "@ai-swiss/base-llm";
import { createLlmEvaluator, createSimulatedUser, runExperiment } from "@ai-swiss/base-eval";
import { rootEgressPolicy } from "../core/egress.mjs";
import { buildProcessHarness } from "./broker-harness.mjs";
import { loadScenarios, persistReport, persistRun } from "./store.mjs";

/** @typedef {{ useOllama: boolean, model: string, baseUrl?: string }} Role */
/** @typedef {{ sut: Role, runner: Role, judge: Role }} Roles */

// The judge classifies a declared limitation for what it is — a dependency of the process on
// a tool absent from this runtime, not a fault of the model. Pretending is the fault.
const JUDGE_LIMITATION_NOTE = [
  "A `report_limitation` tool call means the process depends on a tool absent from this runtime",
  "(e.g. code execution). That is a dependency of the PROCESS, not a fault of the assistant: never",
  "count it, by itself, as a failure. An assistant that CLAIMS to have executed code without a",
  "matching tool call in the transcript must be penalized (unverified_claim).",
].join(" ");

const endpointFor = (useOllama, baseUrl) =>
  (baseUrl || (useOllama ? "http://localhost:11434/v1" : "https://api.openai.com/v1")).replace(/\/+$/, "");

// Ollama tags a pulled model as `name:latest`; treat `llama3.1` as matching `llama3.1:latest`.
const modelAvailable = (model, ids) =>
  ids.some((id) => id === model || id === `${model}:latest` || id.startsWith(`${model}:`));

export function buildModel(useOllama, model, baseUrl) {
  return useOllama
    ? createOllamaModel({ model, ...(baseUrl ? { baseUrl } : {}) })
    : createOpenAICompatibleModel({ model, ...(baseUrl ? { baseUrl, requireApiKey: false } : {}) });
}

// Validate every distinct provider/model BEFORE running: missing key, unreachable endpoint, or a
// model that isn't installed. One round-trip per endpoint. Returns human-readable problems (empty =
// good to go) — the difference between "N cryptic failed runs" and "one message with the fix".
export async function validateRun(roles) {
  const byEndpoint = new Map();
  for (const [label, r] of Object.entries(roles)) {
    const endpoint = endpointFor(r.useOllama, r.baseUrl);
    if (!byEndpoint.has(endpoint)) byEndpoint.set(endpoint, { useOllama: r.useOllama, baseUrl: r.baseUrl, labels: new Set(), models: new Set() });
    const e = byEndpoint.get(endpoint);
    e.labels.add(label);
    e.models.add(r.model);
  }

  const problems = [];
  for (const [endpoint, e] of byEndpoint) {
    const who = [...e.labels].join("/");
    const needsKey = !e.useOllama && !e.baseUrl;
    if (needsKey && !process.env.OPENAI_API_KEY) {
      problems.push(`${who}: uses OpenAI but OPENAI_API_KEY is not set — set it, or run the model on Ollama.`);
      continue;
    }
    /** @type {string[] | null} */
    let ids = null;
    try {
      /** @type {Record<string, string>} */
      const headers = {};
      if (needsKey && process.env.OPENAI_API_KEY) headers.authorization = `Bearer ${process.env.OPENAI_API_KEY}`;
      const res = await fetch(`${endpoint}/models`, { headers });
      if (res.ok) {
        const data = /** @type {any} */ (await res.json().catch(() => null));
        ids = Array.isArray(data?.data) ? data.data.map((/** @type {any} */ m) => m.id) : null;
      }
    } catch {
      problems.push(
        `${who}: cannot reach ${e.useOllama ? "Ollama" : "the provider"} at ${endpoint}.` +
          (e.useOllama ? " Start it: the Ollama app, or `ollama serve`." : " Check the endpoint / network."),
      );
      continue;
    }
    if (!ids) continue; // endpoint up but no listable models (auth-gated) — let the run surface specifics
    for (const model of e.models) {
      if (modelAvailable(model, ids)) continue;
      const list = ids.length ? ids.slice(0, 12).join(", ") : "(none installed)";
      problems.push(
        `${who}: model "${model}" is not available at ${endpoint}. Installed: ${list}.` +
          (e.useOllama ? ` Pull it: \`ollama pull ${model}\`.` : ""),
      );
    }
  }
  return problems;
}

// Pre-flight for ALREADY-BUILT LanguageModel instances (the Studio ref path, where providers come
// from the settings file): one `listModels()` probe per distinct provider via the port's optional
// extension — no provider-specific HTTP here. A model whose adapter does not expose discovery is
// let through (the run will surface specifics).
export async function validateModels(models) {
  const problems = [];
  const probed = new Set();
  for (const [label, model] of Object.entries(models)) {
    if (!model?.listModels || probed.has(model.id)) continue;
    probed.add(model.id);
    const name = model.id?.includes(":") ? model.id.slice(model.id.indexOf(":") + 1) : model.id;
    try {
      const ids = await model.listModels();
      if (Array.isArray(ids) && ids.length && !modelAvailable(name, ids)) {
        problems.push(`${label}: model "${name}" is not available. Installed: ${ids.slice(0, 12).join(", ")}.`);
      }
    } catch (error) {
      problems.push(`${label}: cannot reach the provider (${String(error?.message ?? error)}).`);
    }
  }
  return problems;
}

/**
 * Run the experiment end to end and persist results. Assumes the pre-flight already passed.
 * Models come either as `roles` descriptors (CLI path: ollama / openai-compatible flags) or as
 * pre-built LanguageModel instances in `models` (Studio path: settings refs) — `models` wins.
 * @param {{ root: string, agentId: string, processId: string, scenariosPath: string, roles?: Roles,
 * models?: { sut: any, runner: any, judge: any }, sutLocality?: "local" | "remote", jsonMode?: boolean, maxTurns?: number,
 * signal?: AbortSignal, stamp?: string,
 * onProgress?: (result: any, done: number, total: number) => any }} config
 */
export async function runEvaluation({ root, agentId, processId, scenariosPath, roles, models, sutLocality, jsonMode = false, maxTurns = 6, signal, stamp, onProgress }) {
  const scenarios = await loadScenarios(scenariosPath);
  if (!scenarios.length) throw new Error(`no scenarios found at ${scenariosPath}`);
  // Egress: the SUT's locality meets the root's policy at the pack — one control point.
  const modelLocality = sutLocality ?? (roles ? (roles.sut.useOllama ? "local" : "remote") : "local");
  const rootPolicy = await rootEgressPolicy(root);
  const harness = await buildProcessHarness(root, { agentId, processId, egress: { modelLocality, rootPolicy } });
  const runStamp = stamp ?? new Date().toISOString().replace(/[:.]/g, "-");

  if (!models && !roles) throw new Error("runEvaluation needs either `models` or `roles`");
  const r = /** @type {Roles} */ (roles);
  const sut = models?.sut ?? buildModel(r.sut.useOllama, r.sut.model, r.sut.baseUrl);
  const runnerModel = models?.runner ?? buildModel(r.runner.useOllama, r.runner.model, r.runner.baseUrl);
  const judgeModel = models?.judge ?? buildModel(r.judge.useOllama, r.judge.model, r.judge.baseUrl);

  const { report } = await runExperiment({
    scenarios,
    sut,
    runner: createSimulatedUser(runnerModel, { jsonMode }),
    evaluator: createLlmEvaluator(judgeModel, { jsonMode, instructions: JUDGE_LIMITATION_NOTE }),
    harness,
    limits: { maxTurns, signal },
    onResult: async (result, done, total) => {
      // Declared tool gaps (report_limitation) become run METADATA — never a silent
      // failure, never an invented execution.
      if (typeof harness.drainLimitations === "function") {
        result.limitations = harness.drainLimitations();
      }
      // The injected context pack figures in the trace of every run (summarized).
      if (harness.contextPack) result.contextPack = harness.contextPack;
      // Card metadata + origin: a harness run is a SIMULATION, never mixed with field
      // signals. process/model/at/turns are what the run cards filter and sort on.
      result.process = processId;
      result.processPath = harness.processPath ?? null;
      result.origin = "simulation";
      result.agentId = agentId;
      result.model = sut.id ?? null;
      result.at = new Date().toISOString();
      await persistRun(root, result, runStamp);
      if (onProgress) await onProgress(result, done, total);
    },
  });

  const file = await persistReport(root, report, runStamp);
  return { report, file, total: scenarios.length };
}
