// Mixture-of-Agents (MoA) meta-model.
//
// Wraps N "proposer" models plus one "aggregator" model and conforms to the same
// LanguageModel port as every other adapter ({ id, complete, stream? }), so it
// drops in anywhere a single model is expected — settings, Studio, the CLI.
//
// Flow (Wang et al. 2024 "Mixture-of-Agents", the shape Hermes' `moa` provider uses):
//   1. Every proposer answers the SAME request in parallel. Proposers see the request
//      with tools stripped — they produce text drafts, they do not act. This keeps
//      merging well-defined (you can synthesize prose; you cannot meaningfully merge
//      N independent tool-call sets) and keeps proposers cheap.
//   2. The aggregator receives the original conversation plus the drafts as private
//      guidance (folded into the system message, never shown to the user) and the
//      ORIGINAL tools intact, so tool-calling still works through the aggregator.
//   3. The aggregator's response is the result. Usage is summed across all models.
//
// There is no ground-truth judge here (unlike a compiler/benchmark loop), so the
// aggregator LLM is the selector — exactly Hermes' design for chat assistants.

import { LlmConfigError, LlmResponseError } from "./errors.mjs";
import { assertValidRequest, getText, systemMessage } from "./types.mjs";

export const DEFAULT_SYNTHESIS_PROMPT =
  "You have been given candidate responses from several assistant models for the " +
  "latest user request, labelled below. Synthesize them into a single, higher-quality " +
  "answer. Do not copy one verbatim: weigh them critically, correct mistakes, and keep " +
  "the strongest reasoning from each. Treat the candidates as advice, not fact — if they " +
  "conflict, decide which is right. Respond directly to the user and never mention that " +
  "multiple candidates existed.";

/**
 * @param {unknown} m
 * @returns {m is {complete: Function, stream?: Function}}
 */
function isModel(m) {
  return Boolean(m) && typeof (/** @type {any} */ (m)).complete === "function";
}

// Sum any numeric usage fields without assuming a fixed shape ({ input, output }
// today, but defensive against adapters that report extra counters).
function addUsage(acc, usage) {
  if (!usage) return acc;
  for (const [key, value] of Object.entries(usage)) {
    if (typeof value === "number") acc[key] = (acc[key] ?? 0) + value;
  }
  return acc;
}

/**
 * Create a Mixture-of-Agents model.
 *
 * @param {object} [options]
 * @param {Array<{complete: Function, stream?: Function}>} [options.proposers]
 *        Non-empty list of models that draft candidate responses in parallel.
 * @param {{complete: Function, stream?: Function}} [options.aggregator]
 *        Model that synthesizes the drafts into the final response.
 * @param {string} [options.id="moa"] Identifier reported as `model.id`.
 * @returns {{id: string, complete: Function, stream?: Function}}
 */
export function createMoaModel(options = {}) {
  const {
    proposers,
    aggregator,
    id = "moa",
  } = options;

  if (!Array.isArray(proposers) || proposers.length === 0) {
    throw new LlmConfigError("createMoaModel requires a non-empty `proposers` array");
  }
  proposers.forEach((p, i) => {
    if (!isModel(p)) throw new LlmConfigError(`createMoaModel proposers[${i}] is not a model (missing complete())`);
  });
  if (!isModel(aggregator)) {
    throw new LlmConfigError("createMoaModel requires an `aggregator` model with complete()");
  }
  // Bind the validated values so they read as defined inside the closures below.
  const panel = proposers;
  const merge = aggregator;

  async function gatherDrafts(request, ctx) {
    // Proposers draft prose only — strip tools so nobody tries to act.
    const proposerRequest = { ...request, tools: undefined };
    const settled = await Promise.all(
      panel.map((p) =>
        p.complete(proposerRequest, ctx).then(
          (c) => ({ ok: true, text: (getText(c.message) ?? "").trim(), usage: c.usage }),
          (error) => ({ ok: false, error }),
        ),
      ),
    );
    const drafts = settled.filter((s) => s.ok && s.text);
    if (drafts.length === 0) {
      const firstError = settled.find((s) => !s.ok)?.error;
      throw firstError ?? new LlmResponseError("moa: every proposer returned an empty response");
    }
    return { drafts, settled };
  }

  function aggregatorRequest(request, drafts) {
    const guidance =
      DEFAULT_SYNTHESIS_PROMPT +
      "\n\n" +
      drafts.map((d, i) => `### Candidate response ${i + 1}\n${d.text}`).join("\n\n");
    const [first, ...rest] = request.messages;
    const messages =
      first && first.role === "system"
        ? [systemMessage(`${getText(first)}\n\n${guidance}`), ...rest]
        : [systemMessage(guidance), ...request.messages];
    // Aggregator keeps the ORIGINAL tools so tool-calling survives.
    return { ...request, messages };
  }

  async function complete(request, ctx = {}) {
    assertValidRequest(request);
    const { drafts, settled } = await gatherDrafts(request, ctx);
    const final = await merge.complete(aggregatorRequest(request, drafts), ctx);
    const usage = addUsage({}, final.usage);
    for (const s of settled) if (s.ok) addUsage(usage, s.usage);
    return { ...final, usage };
  }

  async function* stream(request, ctx = {}) {
    const aggStream = merge.stream;
    if (typeof aggStream !== "function") {
      throw new LlmConfigError("moa: aggregator does not support streaming");
    }
    assertValidRequest(request);
    const { drafts } = await gatherDrafts(request, ctx);
    // Only the aggregator streams; proposers are gathered up front.
    yield* aggStream.call(merge, aggregatorRequest(request, drafts), ctx);
  }

  /** @type {{id: string, complete: Function, stream?: Function}} */
  const model = { id, complete };
  if (typeof merge.stream === "function") model.stream = stream;
  return model;
}
