// Official BASE semantic ranker adapter.
//
// Zero npm dependencies: callers bring the model/provider they trust. The public surface is small —
// a ranker, three provider/batcher builders, a similarity helper, and the typed-error taxonomy.
//
//   createSemanticRanker          — an async BASE Ranker backed by real embeddings
//   createOpenAICompatibleEmbedder — OpenAI / Azure-style / internal-gateway provider (platform fetch)
//   createOllamaEmbedder           — optional simple local provider
//   createBatchingEmbedder         — coalesce concurrent calls into bounded, batched requests
//   cosineSimilarity, textForResource — small pure helpers
//   SemanticError + subclasses     — branch on `.code`, not on message strings

export { createSemanticRanker, textForResource } from "./src/ranker.mjs";
export { createOpenAICompatibleEmbedder, createOllamaEmbedder } from "./src/providers.mjs";
export { createBatchingEmbedder } from "./src/batching.mjs";
export { cosineSimilarity, vectorFrom } from "./src/vectors.mjs";
export {
  SemanticError,
  SemanticConfigError,
  EmbeddingTimeoutError,
  EmbeddingAbortError,
  EmbeddingResponseError,
  EmbeddingAuthError,
  EmbeddingRateLimitError,
  EmbeddingNetworkError,
  VectorDimensionError,
} from "./src/errors.mjs";
