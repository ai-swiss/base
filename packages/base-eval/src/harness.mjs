// HarnessProfile — constructs the System-Under-Test (SUT): the system context the agent sees and the
// tool surface it can call, plus the mediation hook where harness fidelity lives. Real harnesses
// differ in exactly these controllable ways, so they are an explicit, swappable abstraction (not a
// pretended clone of a closed harness).
//
// A HarnessProfile is:
//   { systemPrompt: string,
//     tools: ToolDef[],                                  // exposed to the SUT model
//     executeTool(name, args, ctx) => Promise<string>,   // run a tool, return a string result
//     beforeToolCall?(toolCall) => { allow, denyMessage? } }  // the fidelity/mediation seam
//
// `base-native` is the honest, enforced setup: the tools you pass are the real broker operations, and
// `beforeToolCall` is where a profile auto-confirms (or pauses at) decision points and mediates writes
// through propose→commit. This module is provider- and broker-agnostic: you inject the toolset, so it
// is unit-testable with fakes and wired to the real broker in production.

import { VerdictError } from "./schema.mjs";

/**
 * @param {Object} opts
 * @param {string} opts.systemPrompt
 * @param {Record<string, { def: object, run: (args, ctx) => Promise<any>|any }>} opts.toolset
 *        name → { def: ToolDef (JSON-Schema params), run: executor }
 * @param {(toolCall) => ({allow: boolean, denyMessage?: string})} [opts.beforeToolCall]
 */
export function baseNativeHarness({ systemPrompt, toolset = {}, beforeToolCall } = /** @type {any} */ ({})) {
  if (typeof systemPrompt !== "string" || !systemPrompt.trim()) {
    throw new VerdictError("baseNativeHarness requires a non-empty systemPrompt");
  }
  const tools = Object.values(toolset).map((t) => t.def);

  async function executeTool(name, args, ctx) {
    const entry = toolset[name];
    if (!entry) {
      // Surfaced to the SUT as a tool result; the evaluator can classify this as missing_tool.
      return `ERROR: no such tool "${name}".`;
    }
    try {
      const result = await entry.run(args, ctx);
      return typeof result === "string" ? result : JSON.stringify(result);
    } catch (error) {
      return `ERROR: tool "${name}" failed: ${error?.message ?? error}`;
    }
  }

  return { systemPrompt, tools, executeTool, beforeToolCall: beforeToolCall ?? null };
}
