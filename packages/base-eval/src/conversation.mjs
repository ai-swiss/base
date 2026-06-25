// The conversation loop: a simulated user (runner) drives the System-Under-Test (the agent executing
// a BASE process) toward the scenario goals, while the SUT may call tools. Produces a transcript of
// `turns` plus the raw `messages` (for replay) and a `stopReason`. Deterministic when the injected
// models are deterministic (e.g. faux), so experiments are reproducible data, not button-presses.
//
// Three roles, all injected as LanguageModel-shaped objects (anything with `.complete(req, ctx)`):
//   - sut    : the agent-under-test brain (executes the process, calls tools)
//   - runner : the simulated user (see runner.mjs) — `.respond(scenario, turns, ctx)`
//   - harness: the HarnessProfile (system prompt + tool surface + mediation hook)

import { getText, getToolCalls, systemMessage, toolMessage, userMessage } from "./llm.mjs";
import { assertScenario } from "./schema.mjs";

// Default budgets. A turn is one user message + the SUT's full response (incl. its tool exchanges);
// the tool-call cap bounds a single turn so a tool-looping SUT cannot run forever.
const DEFAULT_MAX_TURNS = 6;
const DEFAULT_MAX_TOOL_CALLS = 8;

/**
 * @typedef {{ id?: string, complete: (req: any, ctx?: any) => Promise<any> }} LanguageModel
 * @typedef {{ respond: (scenario: any, turns: any[], ctx?: any) => Promise<{ text?: string, done?: boolean, reason?: string }> }} Runner
 * @typedef {{ systemPrompt: string, tools: any[], executeTool: (name: string, args: any, ctx?: any) => Promise<string>, beforeToolCall?: ((call: any) => { allow: boolean, denyMessage?: string }) | null }} Harness
 * @typedef {{ evaluate: (scenario: any, turns: any[], ctx?: any) => Promise<any> }} Evaluator
 * @typedef {{ maxTurns?: number, maxToolCalls?: number, signal?: AbortSignal }} Limits
 */

/**
 * @param {{ sut: LanguageModel, runner: Runner, harness: Harness, scenario: any, limits?: Limits }} args
 */
export async function runConversation({ sut, runner, harness, scenario, limits = {} } = /** @type {any} */ ({})) {
  assertScenario(scenario);
  if (!sut?.complete) throw new Error("runConversation: `sut` must be a LanguageModel with .complete()");
  if (!runner?.respond) throw new Error("runConversation: `runner` must have .respond(scenario, turns, ctx)");
  if (!harness?.executeTool) throw new Error("runConversation: `harness` must be a HarnessProfile");

  const { maxTurns = DEFAULT_MAX_TURNS, maxToolCalls = DEFAULT_MAX_TOOL_CALLS, signal } = limits;
  const messages = [systemMessage(harness.systemPrompt)];
  const turns = [];
  let userText = scenario.seedInput;
  let stopReason = "max_turns";

  for (let i = 0; i < maxTurns; i++) {
    messages.push(userMessage(userText));
    const { assistantText, toolCalls } = await runSutTurn(sut, messages, harness, { maxToolCalls, signal });
    turns.push({ index: i, user: userText, assistant: assistantText, toolCalls });

    const reaction = await runner.respond(scenario, turns, { signal });
    if (reaction?.done) {
      stopReason = reaction.reason === "gave_up" ? "runner_gave_up" : "runner_done";
      break;
    }
    userText = String(reaction?.text ?? "");
    if (!userText.trim()) {
      stopReason = "runner_silent";
      break;
    }
  }

  return { turns, messages, stopReason };
}

// One SUT turn: complete → (execute any tool calls → feed results → complete again)* → final text.
async function runSutTurn(sut, messages, harness, { maxToolCalls, signal }) {
  let assistantText = "";
  const toolCalls = [];
  let used = 0;

  for (;;) {
    const completion = await sut.complete(
      { messages, tools: harness.tools?.length ? harness.tools : undefined },
      { signal },
    );
    messages.push(completion.message);
    assistantText += getText(completion.message);

    const calls = getToolCalls(completion.message);
    if (calls.length === 0) break; // a plain text reply ends the turn

    for (const call of calls) {
      if (used >= maxToolCalls) {
        const result = "ERROR: tool-call budget exhausted.";
        messages.push(toolMessage(call.id, result));
        toolCalls.push({ name: call.name, args: call.arguments, result, denied: true });
        continue;
      }
      used++;
      const decision = harness.beforeToolCall ? harness.beforeToolCall(call) : { allow: true };
      let result;
      let denied = false;
      if (decision?.allow === false) {
        denied = true;
        result = decision.denyMessage ?? `Tool "${call.name}" was not permitted by the harness.`;
      } else {
        result = await harness.executeTool(call.name, call.arguments, { signal });
      }
      messages.push(toolMessage(call.id, result));
      toolCalls.push({ name: call.name, args: call.arguments, result, denied });
    }

    if (used >= maxToolCalls) break; // guard against an unbounded tool loop
  }

  return { assistantText, toolCalls };
}
