// Tolerant JSON extraction + a robust JSON completion, over the base-llm port.
//
// These live HERE, not in base-eval, because `completeJson` is built on this package's own contract
// (`complete` + `getText`): it is a generic JSON helper of the LLM port, with nothing eval-specific.
// base-eval re-exports them (its public surface is unchanged) and the BASE engine's refiner imports
// them straight from here — one source of truth for "ask a model for JSON, robustly".

import { getText } from "./types.mjs";

// Ask a model for a JSON object, robustly. Uses temperature 0 (deterministic) and, if the reply does
// not parse, ONE corrective retry that feeds the bad reply back with a "JSON only" nudge — small local
// models routinely wrap JSON in prose or markdown. Returns the parsed object, or null if still
// unparseable after the retry (the caller decides whether that is fatal).
export async function completeJson(model, messages, ctx = {}, { jsonMode = false } = {}) {
  const base = jsonMode ? { temperature: 0, responseFormat: { type: "json_object" } } : { temperature: 0 };
  const first = await model.complete({ messages, ...base }, ctx);
  const raw = extractJson(getText(first.message));
  if (raw) return raw;
  const retry = await model.complete(
    {
      messages: [...messages, first.message, { role: "user", content: "Réponds UNIQUEMENT avec l'objet JSON demandé, sans aucun texte autour." }],
      ...base,
    },
    ctx,
  );
  return extractJson(getText(retry.message));
}

// Parse a JSON object from model output that may be wrapped in prose or a ```json fence. Returns the
// parsed object, or null if nothing parseable is found (callers decide how to handle null).
export function extractJson(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to brace-matching
  }
  const start = trimmed.indexOf("{");
  if (start === -1) return null;
  // Scan for the matching closing brace, respecting strings.
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(trimmed.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
