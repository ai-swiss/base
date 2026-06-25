// Studio app-layer: launch an evaluation from the UI and track the single in-flight run. The actual
// orchestration lives in tools/eval/orchestrate.mjs (the same path the CLI uses); this module only
// maps the UI request (model REFS from the settings catalog) to LanguageModel instances,
// enforces one-run-at-a-time, and exposes the live status. The UI polls /api/experiments (which
// carries this status) and watches the runs land — no streaming protocol.

import { stat } from "node:fs/promises";
import path from "node:path";
import { runEvaluation, validateModels } from "../eval/orchestrate.mjs";
import { ApiError } from "./api.mjs";
import { readSettings, resolveModel } from "./settings.mjs";

const SCENARIOS_SUBPATH = path.join(".ai", "experiments", "scenarios");

// The single in-flight run, or null when idle. Process-global by design (one local server).
let current = null;

export function evalStatus() {
  if (!current) return { running: false };
  const { running, done, total, agentId, processId, batchIndex, batchCount, error } = current;
  return { running, done, total, agentId, processId, batchIndex, batchCount, error: error ?? null };
}

/**
 * Start a run (one at a time). The body carries model REFS (`userModel`, `judgeModel` as
 * "<providerId>/<model>"): the simulated user and the SUT share `userModel`, the judge uses
 * `judgeModel` (falling back to `userModel`). Secrets stay server-side: refs are resolved against
 * `.ai/studio.settings.json` + the server environment. Returns `{ started: true }`, or throws
 * ApiError (400 with `{ problems }`, or 409 CONFLICT). `run`/`validate`/`resolve` are injectable
 * so the route lifecycle is testable without a provider.
 */
export async function startEvaluation(
  root,
  body = {},
  { settingsDir = root, run = runEvaluation, validate = validateModels, resolve = resolveModel } = {},
) {
  if (current?.running) throw new ApiError("an evaluation is already running", "CONFLICT");

  // A flat list of (agentId, processId) targets — the engine runs them in sequence. The tree
  // launcher sends `targets` (possibly spanning several agents); the single-agent multi-select sends
  // `agentId` + `processIds`; the single-run and relaunch paths send `agentId` + `processId`.
  const targets = normalizeTargets(body);
  if (targets.length === 0) throw new ApiError("Aucun process sélectionné: cochez au moins un process à évaluer.", "BAD_REQUEST");

  const userRef = String(body.userModel ?? "").trim();
  if (!userRef) throw new ApiError("Choisissez le modèle qui jouera l'utilisateur simulé (sous la forme fournisseur/modèle) avant de lancer l'évaluation.", "BAD_REQUEST");
  const judgeRef = String(body.judgeModel ?? "").trim() || userRef;

  const scenariosPath = path.join(root, SCENARIOS_SUBPATH);
  try {
    await stat(scenariosPath);
  } catch {
    throw new ApiError(`Aucun scénario à évaluer. Une évaluation rejoue une conversation: il faut au moins un scénario (un message de départ pour l'utilisateur simulé, et les objectifs visés) dans un fichier .json sous ${SCENARIOS_SUBPATH}/.`, "BAD_REQUEST");
  }

  const userModel = await resolve(settingsDir, userRef);
  const judgeModel = judgeRef === userRef ? userModel : await resolve(settingsDir, judgeRef);
  const models = { sut: userModel, runner: userModel, judge: judgeModel };

  // Egress: the SUT's provider locality travels to the harness (the pack is the control point).
  const settings = await readSettings(settingsDir);
  const sutLocality = settings.providers.find((p) => p.id === userRef.split("/")[0])?.locality ?? "remote";

  const problems = await validate(models);
  if (problems.length) throw new ApiError("the providers/models need attention", "BAD_REQUEST", { problems });

  current = { running: true, done: 0, total: 0, agentId: targets[0].agentId, processId: targets[0].processId, batchIndex: 0, batchCount: targets.length, error: null };
  // Fire and forget: the UI polls status + sees runs land. The one-at-a-time engine becomes a
  // server-side queue here — each (agent, process) target runs to completion before the next; errors
  // stop the queue and are captured into the status. The UI watches `batchIndex/batchCount` advance.
  (async () => {
    for (let i = 0; i < targets.length; i += 1) {
      if (current) {
        current.agentId = targets[i].agentId;
        current.processId = targets[i].processId;
        current.batchIndex = i;
        current.done = 0;
        current.total = 0;
      }
      await run({
        root,
        agentId: targets[i].agentId,
        processId: targets[i].processId,
        scenariosPath,
        models,
        sutLocality,
        jsonMode: Boolean(body.jsonMode),
        onProgress: (_result, done, total) => {
          if (current) {
            current.done = done;
            current.total = total;
          }
        },
      });
    }
  })()
    .then(() => {
      if (current) current.running = false;
    })
    .catch((error) => {
      if (current) {
        current.running = false;
        current.error = String(error?.message ?? error);
      }
    });

  return { started: true };
}

// Three accepted input shapes collapse to one list of {agentId, processId}, newest first:
//   - `targets: [{agentId, processId}]`        — the agent→process tree launcher (may span agents)
//   - `agentId` + `processIds: [...]`          — single-agent multi-select
//   - `agentId` + `processId`                  — single run / relaunch
function normalizeTargets(body) {
  if (Array.isArray(body.targets)) {
    return body.targets
      .map((t) => ({ agentId: String(t?.agentId ?? "").trim(), processId: String(t?.processId ?? "").trim() }))
      .filter((t) => t.agentId && t.processId);
  }
  const agentId = String(body.agentId ?? "").trim();
  if (!agentId) return [];
  return (Array.isArray(body.processIds) ? body.processIds : body.processId != null ? [body.processId] : [])
    .map((p) => String(p ?? "").trim())
    .filter(Boolean)
    .map((processId) => ({ agentId, processId }));
}
