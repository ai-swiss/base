// The simulated user ("runner") — a LanguageModel that role-plays a person pursuing the scenario's
// goals, turn by turn. It is NOT the agent under test; it drives the conversation and decides when its
// goals are met or it gives up. A `persona` knob lets you test cooperative / terse / confused /
// adversarial users against the same process.

import { systemMessage, userMessage } from "./llm.mjs";
import { completeJson, renderTranscript } from "./util.mjs";

const DEFAULT_PERSONA = "A cooperative, realistic professional user. Concise. Answers questions the assistant asks.";

/**
 * @param {{ complete: Function }} model  a LanguageModel-shaped object
 * @param {{ persona?: string, jsonMode?: boolean }} [opts]
 * @returns {{ respond: (scenario, turns, ctx?) => Promise<{text?:string, done?:boolean, reason?:string}> }}
 */
export function createSimulatedUser(model, { persona = DEFAULT_PERSONA, jsonMode = false } = {}) {
  if (!model?.complete) throw new Error("createSimulatedUser requires a LanguageModel with .complete()");

  async function respond(scenario, turns, ctx = {}) {
    const sys = systemMessage(
      [
        "You are role-playing a USER talking to an assistant. Stay in character; never act as the assistant.",
        // A per-scenario persona (scenario.persona) takes precedence over the runner's default.
        `Persona: ${scenario.persona ?? persona}`,
        "Your goals for this conversation:",
        ...scenario.goals.map((g, i) => `  ${i + 1}. ${g}`),
        scenario.context ? `Context you can reveal if asked: ${scenario.context}` : "",
        "",
        'Reply ONLY with JSON: {"message": string, "status": "continue" | "satisfied" | "give_up"}.',
        '- "continue": send `message` as your next line to the assistant.',
        '- "satisfied": your goals are met; `message` may be a brief closing line.',
        '- "give_up": the assistant cannot help; `message` may say why.',
      ]
        .filter(Boolean)
        .join("\n"),
    );
    const user = userMessage(
      turns.length === 0
        ? "The conversation has not started. Provide your opening message (it should match the scenario's intent)."
        : `Conversation so far:\n\n${renderTranscript(turns)}\n\nProvide your next move as JSON.`,
    );

    const parsed = (await completeJson(model, [sys, user], { signal: ctx.signal }, { jsonMode })) ?? {};
    const status = parsed.status;
    if (status === "satisfied") return { done: true, reason: "satisfied", text: str(parsed.message) };
    if (status === "give_up") return { done: true, reason: "gave_up", text: str(parsed.message) };
    return { done: false, text: str(parsed.message) };
  }

  return { respond };
}

const str = (v) => (typeof v === "string" ? v : "");
