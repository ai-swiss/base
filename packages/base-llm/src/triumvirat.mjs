// Triumvirat orchestrator meta-model (implements the TRINITY architecture).
//
// Implements the inference-time architecture of Sakana Fugu / TRINITY
// (arXiv:2512.04695) as a base-llm meta-model conforming to the LanguageModel
// port ({ id, complete }), so a coordinated pool of models is usable anywhere a
// single model is.
//
// Each turn a coordinator picks one model from a swappable pool and assigns it
// one of three roles, looping until the Verifier accepts or a turn budget hits:
//   - Thinker  — plans/decomposes (no tools, no final answer)
//   - Worker   — executes; the ONLY role that receives the request's tools
//   - Verifier — judges the current draft, returns { accepted, feedback }
//
// What this is NOT: TRINITY's contribution is a ~0.6B coordinator trained with
// separable CMA-ES. We can't reproduce that training, so the default coordinator
// is *prompted* (an LLM asked to choose model+role+stop), with a deterministic
// Thinker -> Worker -> Verifier cadence as the fallback. The `coordinator.decide`
// seam lets a heuristic or trained coordinator drop in later with no API change.

import { LlmConfigError, LlmResponseError, LlmAbortError } from "./errors.mjs";
import { assertValidRequest, getText, systemMessage } from "./types.mjs";
import { extractJson } from "./json.mjs";

const ROLES = new Set(["thinker", "worker", "verifier"]);

export const DEFAULT_ROLE_PROMPTS = {
  thinker:
    "You are the THINKER. Decompose the task and outline an approach. Do not write " +
    "the final answer and do not call tools. Keep it short and concrete.",
  worker:
    "You are the WORKER. Produce or improve the answer to the user's request, using " +
    "the shared scratchpad and any verifier feedback. If tools are available, use them. " +
    "Output the answer itself, nothing else.",
  verifier:
    "You are the VERIFIER. Judge whether the latest draft fully and correctly answers " +
    "the user's request. Respond ONLY with JSON: " +
    '{"accepted": boolean, "feedback": string}. ' +
    "Set accepted=true only if it is complete and correct; otherwise give specific, " +
    "actionable feedback for the next worker turn.",
};

function isModel(m) {
  return Boolean(m) && typeof (/** @type {any} */ (m)).complete === "function";
}

// Sum numeric usage fields without assuming a fixed shape.
// (Duplicated from moa.mjs on purpose to keep this PR self-contained; a shared
// internal/ensemble.mjs is a follow-up once both have landed.)
function addUsage(acc, usage) {
  if (!usage) return acc;
  for (const [key, value] of Object.entries(usage)) {
    if (typeof value === "number") acc[key] = (acc[key] ?? 0) + value;
  }
  return acc;
}

function withSystem(preamble, messages) {
  const [first, ...rest] = messages;
  return first && first.role === "system"
    ? [systemMessage(`${getText(first)}\n\n${preamble}`), ...rest]
    : [systemMessage(preamble), ...messages];
}

/**
 * @param {{transcript: Array<{turn:number,model:string,role:string,text:string}>, verdict: any}} state
 */
function buildScratchpad(state) {
  if (state.transcript.length === 0 && !state.verdict) return "Shared scratchpad: (empty)";
  const lines = state.transcript.map(
    (t) => `- turn ${t.turn} [${t.role} via ${t.model}]: ${t.text}`,
  );
  if (state.verdict && !state.verdict.accepted && state.verdict.feedback) {
    lines.push(`- verifier feedback to address: ${state.verdict.feedback}`);
  }
  return `Shared scratchpad so far:\n${lines.join("\n")}`;
}

function coordinatorPrompt(poolKeys, state) {
  return (
    "You are the COORDINATOR of a pool of models. Each turn, choose which model " +
    "answers next and in which role.\n" +
    `Pool (choose one key): ${poolKeys.join(", ")}\n` +
    "Roles: thinker (plan), worker (produce/fix the answer), verifier (judge the draft).\n" +
    "Pick worker before verifier; use verifier to gate completion.\n" +
    'Respond ONLY with JSON: {"model": <pool key>, "role": <role>, "stop": <bool>}.\n\n' +
    `Turn: ${state.turn}. Draft exists: ${Boolean(state.lastDraft)}. ` +
    `Last verdict: ${state.verdict ? JSON.stringify(state.verdict) : "none"}.\n` +
    buildScratchpad(state)
  );
}

/**
 * Create a Triumvirat orchestrator model (implements the TRINITY architecture).
 *
 * @param {object} [options]
 * @param {Record<string, {complete: Function}>} [options.pool]
 *        Non-empty map of pool models, keyed by name. Order cheapest-first: the
 *        default coordinator uses the first entry.
 * @param {{complete: Function} | {decide: Function}} [options.coordinator]
 *        A dedicated model (prompted coordinator) or a custom `{ decide(state, ctx) }`.
 *        Defaults to a prompted coordinator over the cheapest (first) pool model.
 * @param {number} [options.maxTurns=6] Hard turn budget; guarantees termination.
 * @param {string} [options.id="triumvirat"]
 * @returns {{id: string, complete: Function}}
 */
export function createTriumviratModel(options = {}) {
  const {
    pool,
    coordinator,
    maxTurns = 6,
    id = "triumvirat",
  } = options;

  if (!pool || typeof pool !== "object" || Array.isArray(pool)) {
    throw new LlmConfigError("createTriumviratModel requires a `pool` object of models");
  }
  // Bind the validated pool so it reads as defined inside the closures below.
  const poolMap = pool;
  const poolKeys = Object.keys(poolMap);
  if (poolKeys.length === 0) {
    throw new LlmConfigError("createTriumviratModel requires a non-empty `pool`");
  }
  for (const key of poolKeys) {
    if (!isModel(poolMap[key])) throw new LlmConfigError(`createTriumviratModel pool["${key}"] is not a model`);
  }
  if (!Number.isInteger(maxTurns) || maxTurns < 1) {
    throw new LlmConfigError("createTriumviratModel `maxTurns` must be an integer >= 1");
  }

  // ponytail: "cheapest" = first pool entry. Order the pool cheapest-first, or
  // pass an explicit coordinator model, to control which model coordinates.
  /** @type {{complete: Function}} */
  const coordinatorModel = isModel(coordinator)
    ? /** @type {{complete: Function}} */ (coordinator)
    : /** @type {{complete: Function}} */ (poolMap[poolKeys[0]]);

  // Deterministic fallback policy: thinker on turn 0, then alternate worker/verifier.
  function deterministic(state) {
    if (state.turn === 0) return { model: poolKeys[0], role: "thinker" };
    return state.turn % 2 === 1
      ? { model: poolKeys[0], role: "worker" }
      : { model: poolKeys[0], role: "verifier" };
  }

  /** @type {{decide: Function}} */
  const decider =
    coordinator && typeof (/** @type {any} */ (coordinator)).decide === "function"
      ? /** @type {{decide: Function}} */ (coordinator)
      : {
          async decide(state, ctx) {
            const messages = withSystem(coordinatorPrompt(poolKeys, state), state.request.messages);
            let resp;
            try {
              resp = await coordinatorModel.complete({ messages, temperature: 0 }, ctx);
            } catch {
              return deterministic(state); // coordinator failed: keep the loop moving
            }
            const d = extractJson(getText(resp.message));
            if (d && poolMap[d.model] && ROLES.has(d.role)) {
              return { model: d.model, role: d.role, stop: d.stop === true, usage: resp.usage };
            }
            return { ...deterministic(state), usage: resp.usage };
          },
        };

  function roleRequest(role, state) {
    const preamble = `${DEFAULT_ROLE_PROMPTS[role]}\n\n${buildScratchpad(state)}`;
    const messages = withSystem(preamble, state.request.messages);
    const req = { ...state.request, messages, tools: role === "worker" ? state.request.tools : undefined };
    if (role !== "worker") req.temperature = 0;
    return req;
  }

  async function complete(request, ctx = {}) {
    assertValidRequest(request);
    /** @type {Record<string, number>} */
    const usage = {};
    /**
     * @type {{
     *   request: any,
     *   transcript: Array<{turn:number, model:string, role:string, text:string}>,
     *   lastDraft: any,
     *   verdict: {accepted:boolean, feedback:string} | null,
     *   turn: number,
     * }}
     */
    const state = { request, transcript: [], lastDraft: null, verdict: null, turn: 0 };

    while (state.turn < maxTurns) {
      if (ctx.signal?.aborted) throw new LlmAbortError("triumvirat: aborted");

      const decision = await decider.decide(state, ctx);
      if (decision.usage) addUsage(usage, decision.usage);
      const model = poolMap[decision.model] ?? /** @type {{complete: Function}} */ (poolMap[poolKeys[0]]);
      const role = ROLES.has(decision.role) ? decision.role : "worker";

      let resp;
      try {
        resp = await model.complete(roleRequest(role, state), ctx);
      } catch (error) {
        if (error instanceof LlmAbortError) throw error;
        const message = error instanceof Error ? error.message : String(error);
        state.transcript.push({ turn: state.turn, model: decision.model, role, text: `ERROR: ${message}` });
        state.verdict = { accepted: false, feedback: `Previous ${role} turn failed: ${message}` };
        state.turn += 1;
        continue;
      }
      addUsage(usage, resp.usage);
      const text = (getText(resp.message) ?? "").trim();

      if (role === "verifier") {
        const obj = extractJson(text);
        state.verdict = {
          accepted: obj?.accepted === true,
          feedback: typeof obj?.feedback === "string" ? obj.feedback : "",
        };
        state.transcript.push({
          turn: state.turn,
          model: decision.model,
          role,
          text: `accepted=${state.verdict.accepted}${state.verdict.feedback ? ` (${state.verdict.feedback})` : ""}`,
        });
        if (state.verdict.accepted) {
          state.turn += 1;
          break;
        }
      } else {
        state.transcript.push({ turn: state.turn, model: decision.model, role, text });
        if (role === "worker") state.lastDraft = resp.message;
      }

      state.turn += 1;
      if (decision.stop && state.lastDraft) break;
    }

    if (!state.lastDraft) {
      throw new LlmResponseError("triumvirat: no answer produced within the turn budget");
    }
    const accepted = state.verdict?.accepted === true;
    return {
      message: state.lastDraft,
      usage,
      finishReason: accepted ? "stop" : "incomplete",
      raw: {
        turns: state.turn,
        accepted,
        verdictFeedback: state.verdict?.feedback ?? null,
        transcript: state.transcript,
      },
    };
  }

  return { id, complete };
}
