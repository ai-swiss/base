// The semantic Ranker adapter. Still a BASE Ranker — `(resource, terms, ctx) => {score, reasons}` —
// only async, and backed by real embeddings. It raises *relevance*; it never makes the routing
// *decision* (the Router's structural rules still apply). Every score is one explainable reason.

import { SemanticConfigError, VectorDimensionError } from "./errors.mjs";
import { cosineSimilarity, vectorFrom } from "./vectors.mjs";

export function createSemanticRanker(options = {}) {
  const {
    embed,
    getResourceEmbedding,
    minSimilarity = 0.2,
    weight = 160,
    reason = "semantic:embedding",
    cache = new Map(),
    textOf = textForResource,
    onDimensionMismatch = "throw", // "throw": fail loud on a stale index/changed model · "skip": ignore
    onMetric,
  } = options;

  if (typeof embed !== "function" && typeof getResourceEmbedding !== "function") {
    throw new SemanticConfigError("createSemanticRanker requires `embed` or `getResourceEmbedding`.");
  }
  if (onDimensionMismatch !== "throw" && onDimensionMismatch !== "skip") {
    throw new SemanticConfigError(`onDimensionMismatch must be "throw" or "skip", received ${onDimensionMismatch}.`);
  }

  return async function semanticRanker(resource, terms, ctx = {}) {
    const queryText = String(ctx.query ?? (Array.isArray(terms) ? terms.join(" ") : "")).trim();
    if (!queryText) return noScore();

    const queryKey = `q:${queryText}`;
    const cacheHit = Boolean(cache?.has?.(queryKey));
    const queryVector = vectorFrom(ctx.queryEmbedding ?? ctx.query_embedding)
      ?? await cachedVector(cache, queryKey, () => embedOne(embed, queryText, ctx));
    if (!queryVector) return noScore();

    const resourceVector = vectorFromResource(resource)
      ?? await resolveResourceVector({ resource, ctx, embed, getResourceEmbedding, textOf, cache });
    if (!resourceVector) return noScore();

    if (queryVector.length !== resourceVector.length) {
      if (onDimensionMismatch === "throw") {
        throw new VectorDimensionError(
          `Query and resource embedding dimensions differ (${queryVector.length} vs ${resourceVector.length}) `
            + `for ${resource.path ?? resource.id ?? "a resource"}. This usually means a stale index or a changed `
            + `model — rebuild the index, or set onDimensionMismatch:"skip".`,
        );
      }
      return noScore();
    }

    const similarity = Math.max(0, cosineSimilarity(queryVector, resourceVector) ?? 0);
    onMetric?.({ provider: "semantic", cacheHit, similarity, dimension: queryVector.length });
    if (similarity < minSimilarity) return noScore();

    return { score: Math.round(weight * similarity), reasons: [`${reason}:${similarity.toFixed(3)}`] };
  };
}

// The text a resource is embedded as: the routing signal first, then title/description/keywords/body.
export function textForResource(resource) {
  return [
    resource.route_text,
    resource.title,
    resource.description,
    Array.isArray(resource.keywords) ? resource.keywords.join(" ") : "",
    resource.body,
  ].filter(Boolean).join("\n");
}

function noScore() {
  return { score: 0, reasons: [] };
}

async function resolveResourceVector({ resource, ctx, embed, getResourceEmbedding, textOf, cache }) {
  if (typeof getResourceEmbedding === "function") {
    const supplied = vectorFrom(await getResourceEmbedding(resource, ctx));
    if (supplied) return supplied;
  }
  if (typeof embed !== "function") return null;

  const text = String(textOf(resource) ?? "").trim();
  if (!text) return null;
  const cacheKey = `resource:${resource.path ?? resource.id ?? text}:${text.length}`;
  return cachedVector(cache, cacheKey, () => embedOne(embed, text, ctx));
}

// Store the in-flight promise (not just the resolved value) so concurrent calls for the same key
// share one provider request instead of racing.
async function cachedVector(cache, key, compute) {
  if (!cache || typeof cache.get !== "function" || typeof cache.set !== "function" || typeof cache.has !== "function") {
    return vectorFrom(await compute());
  }
  const cached = cache.get(key);
  if (cache.has(key) && cached !== undefined) return cached;
  {
    const pending = Promise.resolve(compute())
      .then(vectorFrom)
      .catch((error) => {
        // Transient provider failures must not poison a long-lived cache.
        if (typeof cache.delete === "function") cache.delete(key);
        else cache.set(key, undefined);
        throw error;
      });
    cache.set(key, pending);
  }
  return cache.get(key);
}

async function embedOne(embed, text, ctx) {
  if (typeof embed !== "function") return null;
  const result = await embed(text, ctx);
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
  return result;
}

function vectorFromResource(resource) {
  return vectorFrom(
    resource.embedding
      ?? resource.routing_embedding
      ?? resource.metadata?.embedding
      ?? resource.metadata?.routing_embedding
      ?? resource.metadata?.routing?.embedding,
  );
}
