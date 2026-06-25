// Serve a precomputed embedding for a resource (by object, id, or path) from the index — the intended
// `getResourceEmbedding` for a semantic Ranker, so resource text never transits at query time.
//
// O(1) per lookup: an (id|path) -> embedding map is built once and cached on the index object (the
// index is immutable after build). This matters because routing over a large corpus calls this once
// per scored document; a linear scan here would make the documented scale path quadratic.

export function vectorFor(index, resourceOrId) {
  const key = typeof resourceOrId === "string" ? resourceOrId : resourceOrId?.id ?? resourceOrId?.path;
  if (key == null) return null;
  const vector = embeddingByKey(index).get(key);
  return Array.isArray(vector) ? vector : null;
}

function embeddingByKey(index) {
  if (!index.__embeddingByKey) {
    const map = new Map();
    for (const doc of index.documents) {
      if (!Array.isArray(doc.embedding)) continue;
      // `id` wins over `path` on the (practically impossible) collision, matching a find that tests id first.
      if (doc.path != null && !map.has(doc.path)) map.set(doc.path, doc.embedding);
      if (doc.id != null) map.set(doc.id, doc.embedding);
    }
    Object.defineProperty(index, "__embeddingByKey", { value: map, enumerable: false, configurable: true });
  }
  return index.__embeddingByKey;
}
