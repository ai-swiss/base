// @ai-swiss/base-llm — the owned, provider-agnostic chat/tool-calling port for BASE.
//
// BASE owns this small, stable seam; adapters serve it. The package ships a faux test double and
// four REST-direct adapters — OpenAI-compatible (which Ollama also speaks), Ollama, Anthropic
// (Messages API) and Google (Gemini API) — each translating its provider's tool-calling format to
// the single port contract. Adapters may also expose the optional `listModels()` extension for
// model discovery. Zero dependencies; uses platform `fetch`.

export {
  LlmError,
  LlmConfigError,
  LlmTimeoutError,
  LlmAbortError,
  LlmResponseError,
  LlmAuthError,
  LlmRateLimitError,
  LlmNetworkError,
} from "./src/errors.mjs";

export {
  systemMessage,
  userMessage,
  assistantMessage,
  toolMessage,
  textPart,
  toolCallPart,
  getText,
  getToolCalls,
  assertValidRequest,
} from "./src/types.mjs";

export { completeJson, extractJson } from "./src/json.mjs";

export { createOpenAICompatibleModel, createOllamaModel } from "./src/openai.mjs";
export { createAnthropicModel } from "./src/anthropic.mjs";
export { createGoogleModel } from "./src/google.mjs";
export { createFauxModel } from "./src/faux.mjs";
export { createMoaModel, DEFAULT_SYNTHESIS_PROMPT } from "./src/moa.mjs";
export { createTriumviratModel, DEFAULT_ROLE_PROMPTS } from "./src/triumvirat.mjs";
export { createLangfuseModel } from "./src/langfuse.mjs";
export { collectStream } from "./src/streaming.mjs";
