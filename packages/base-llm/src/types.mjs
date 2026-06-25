// The OWNED LanguageModel port — BASE's small, stable seam for chat + tool-calling.
//
// This is deliberately narrow and provider-neutral. Adapters (faux, OpenAI-compatible, Ollama, or a
// pi-ai bridge) translate between this normalized shape and a provider's wire format. Callers depend
// on THIS, never on a provider's types — so swapping a provider never ripples into the engine.
//
// Message model (normalized):
//   system : { role:"system",    content: string }
//   user   : { role:"user",      content: string }
//   assistant: { role:"assistant", content: AssistantPart[] }   // text and/or toolCall parts
//   tool   : { role:"tool",      toolCallId: string, content: string }
// AssistantPart:
//   { type:"text", text: string }
//   { type:"toolCall", id: string, name: string, arguments: object }
//
// A LanguageModel is `{ id, complete(request, ctx?) => Promise<Completion> }`.
//   request : { messages: Message[], tools?: ToolDef[], temperature?, maxTokens?, toolChoice? }
//   ctx     : { signal?: AbortSignal }
//   Completion : { message: AssistantMessage, usage: {input,output}, finishReason, raw? }
// Optional port extension: `listModels(ctx?) => Promise<string[]>` — model discovery for catalogs
// (openai-compatible: GET /v1/models; ollama: GET /api/tags; anthropic: GET /v1/models; google:
// GET /v1beta/models; faux: a scripted list). Callers must feature-test (`model.listModels?.()`).
//
// JSON Schema (NOT typebox) is used for tool `parameters`: the BASE core already speaks JSON Schema,
// so the port adds no new schema dependency.

import { LlmConfigError } from "./errors.mjs";

const ROLES = new Set(["system", "user", "assistant", "tool"]);

// --- Builders (ergonomic, validated where cheap) ---------------------------

export function systemMessage(content) {
  return { role: "system", content: String(content ?? "") };
}

export function userMessage(content) {
  return { role: "user", content: String(content ?? "") };
}

/** assistantMessage("text") or assistantMessage([textPart(...), toolCallPart(...)]) */
export function assistantMessage(content) {
  if (typeof content === "string") return { role: "assistant", content: [textPart(content)] };
  return { role: "assistant", content: Array.isArray(content) ? content : [] };
}

export function toolMessage(toolCallId, content) {
  if (!toolCallId) throw new LlmConfigError("toolMessage requires a toolCallId");
  return { role: "tool", toolCallId: String(toolCallId), content: String(content ?? "") };
}

export function textPart(text) {
  return { type: "text", text: String(text ?? "") };
}

export function toolCallPart(id, name, args = {}) {
  if (!id) throw new LlmConfigError("toolCallPart requires an id");
  if (!name) throw new LlmConfigError("toolCallPart requires a name");
  return { type: "toolCall", id: String(id), name: String(name), arguments: args ?? {} };
}

// --- Accessors -------------------------------------------------------------

/** Concatenated text of an assistant message (or "" for non-assistant / no text). */
export function getText(message) {
  if (!message || message.role !== "assistant" || !Array.isArray(message.content)) {
    return typeof message?.content === "string" ? message.content : "";
  }
  return message.content
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/** Tool-call parts of an assistant message (or []). */
export function getToolCalls(message) {
  if (!message || message.role !== "assistant" || !Array.isArray(message.content)) return [];
  return message.content.filter((p) => p.type === "toolCall");
}

// --- Validation (used by adapters before hitting the wire) -----------------

export function assertValidRequest(request) {
  if (!request || typeof request !== "object") throw new LlmConfigError("request must be an object");
  const { messages, tools } = request;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new LlmConfigError("request.messages must be a non-empty array");
  }
  for (const [i, m] of messages.entries()) {
    if (!m || !ROLES.has(m.role)) throw new LlmConfigError(`messages[${i}] has an invalid role`);
    if (m.role === "assistant") {
      if (!Array.isArray(m.content)) throw new LlmConfigError(`messages[${i}] (assistant) content must be an array of parts`);
    } else if (m.role === "tool") {
      if (!m.toolCallId) throw new LlmConfigError(`messages[${i}] (tool) requires a toolCallId`);
    } else if (typeof m.content !== "string") {
      throw new LlmConfigError(`messages[${i}] (${m.role}) content must be a string`);
    }
  }
  if (tools !== undefined) {
    if (!Array.isArray(tools)) throw new LlmConfigError("request.tools must be an array when provided");
    for (const [i, t] of tools.entries()) assertValidToolDef(t, i);
  }
}

// Internal: validated only via assertValidRequest. Not part of the public surface until a caller
// outside this package needs it (YAGNI).
function assertValidToolDef(tool, index = 0) {
  if (!tool || typeof tool !== "object") throw new LlmConfigError(`tools[${index}] must be an object`);
  if (!tool.name || typeof tool.name !== "string") throw new LlmConfigError(`tools[${index}].name is required`);
  if (tool.parameters !== undefined && (typeof tool.parameters !== "object" || tool.parameters === null)) {
    throw new LlmConfigError(`tools[${index}].parameters must be a JSON Schema object`);
  }
}
