// `faux` — a scripted, network-free LanguageModel for deterministic tests and offline development.
// It implements the SAME port as the real adapters (registered/used identically), so the eval engine
// and its tests run reproducibly without a provider. (Mirrors pi-ai's `faux` idea.)
//
// Script forms:
//   createFauxModel("hello")                         → always replies with that text
//   createFauxModel([resp1, resp2, ...])             → one scripted reply per call, in order
//   createFauxModel((request, callIndex) => resp)    → compute the reply from the request
// A `resp` may be: a string (assistant text), a full Completion ({message, usage, finishReason}),
// an assistant message ({role:"assistant", content:[...]}), or sugar {text?, toolCalls?: [{id,name,arguments}]}.
//
// The returned model exposes `.calls` (the requests it received) for assertions.

import { LlmAbortError, LlmConfigError } from "./errors.mjs";
import { assistantMessage, textPart, toolCallPart } from "./types.mjs";

export function createFauxModel(script, { id = "faux", models = [] } = {}) {
  const calls = [];

  function select(request) {
    const callIndex = calls.length;
    calls.push(request);
    if (typeof script === "function") return script(request, callIndex);
    if (Array.isArray(script)) {
      if (callIndex >= script.length) {
        throw new LlmConfigError(`faux: no scripted response for call #${callIndex} (scripted ${script.length})`);
      }
      return script[callIndex];
    }
    return script;
  }

  async function complete(request, ctx = {}) {
    if (ctx.signal?.aborted) throw new LlmAbortError("faux: aborted before call");
    return normalize(select(request));
  }

  // Deterministic streaming: emit the assistant text as word-sized deltas, then one tool-call event
  // per call, then `done` with the full Completion — mirroring the real adapter's event shape.
  async function* stream(request, ctx = {}) {
    if (ctx.signal?.aborted) throw new LlmAbortError("faux: aborted before call");
    const completion = normalize(select(request));
    for (const part of completion.message.content) {
      if (part.type === "text") {
        for (const piece of chunkText(part.text)) yield { type: "text-delta", text: piece };
      }
    }
    for (const part of completion.message.content) {
      if (part.type === "toolCall") yield { type: "tool-call", id: part.id, name: part.name, arguments: part.arguments };
    }
    yield { type: "done", completion };
  }

  // Scripted model discovery, mirroring the optional `listModels()` port extension.
  async function listModels() {
    return models;
  }

  return { id, complete, stream, listModels, calls };
}

function chunkText(text) {
  if (!text) return [];
  // Split into word-plus-space pieces so deltas concatenate back to the original exactly.
  return text.match(/\S+\s*|\s+/g) ?? [text];
}

function normalize(item) {
  if (typeof item === "string") return completion(assistantMessage(item), "stop");

  if (item && typeof item === "object") {
    if (item.message) {
      return {
        message: item.message,
        usage: item.usage ?? { input: 0, output: 0 },
        finishReason: item.finishReason ?? "stop",
        raw: item.raw,
      };
    }
    if (item.role === "assistant") return completion(item, "stop");
    if ("text" in item || "toolCalls" in item) {
      const parts = [];
      if (item.text) parts.push(textPart(item.text));
      for (const tc of item.toolCalls ?? []) parts.push(toolCallPart(tc.id, tc.name, tc.arguments ?? {}));
      const finish = item.toolCalls?.length ? "tool_calls" : "stop";
      return completion({ role: "assistant", content: parts }, finish, item.usage);
    }
  }
  throw new LlmConfigError("faux: could not interpret the scripted response");
}

function completion(message, finishReason, usage) {
  return { message, usage: usage ?? { input: 0, output: 0 }, finishReason };
}
