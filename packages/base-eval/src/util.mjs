// Small shared utilities for base-eval.
//
// The JSON helpers (extractJson, completeJson) are generic over the @ai-swiss/base-llm port (its
// `complete` + `getText` contract), so they live in @ai-swiss/base-llm and are re-exported here —
// base-eval keeps a single import surface and its public API (index.mjs) is unchanged. Only
// renderTranscript is eval-specific and defined here.

export { completeJson, extractJson } from "@ai-swiss/base-llm";

// Render the conversation for a judge/runner prompt, including tool calls and results (so the
// evaluator can see missing tools, skipped gates, etc.).
export function renderTranscript(turns) {
  return turns
    .map((t) => {
      const lines = [`Turn ${t.index}`, `  User: ${t.user}`, `  Assistant: ${t.assistant || "(no text)"}`];
      for (const c of t.toolCalls ?? []) {
        const args = safeJson(c.args);
        const flag = c.denied ? " [DENIED by harness]" : "";
        lines.push(`  [tool ${c.name}(${args})${flag} -> ${truncate(c.result, 400)}]`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

function safeJson(v) {
  try {
    return JSON.stringify(v ?? {});
  } catch {
    return "{}";
  }
}

function truncate(s, n) {
  const str = String(s ?? "");
  return str.length > n ? `${str.slice(0, n)}…` : str;
}
