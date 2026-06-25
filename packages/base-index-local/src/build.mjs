// Build a derived, deletable index from BASE resources.
//
// The index is a PROJECTION, never a source of truth: it is reconstructed deterministically from the
// inventory + derived routing signals. Deleting it loses nothing — rebuild from the files. The build
// is timestamp-free (unless you pass `now`) and fully sorted, so two builds of the same inputs are
// byte-identical: CI can gate freshness.
//
// `deriveSignals` is injected (pass BASE's `deriveRoutingSignals`) so the route_text fallback chain is
// shared with the core, not re-implemented here. `embed` is optional; when given, route_text is
// embedded (batched) and stored, so a semantic ranker can score against precomputed vectors with no
// resource text leaving at query time.

import { fieldTokens } from "./tokenize.mjs";
import { compareByCodePoint } from "./ordering.mjs";

export const INDEX_SCHEMA = "base.index.v1";

// Field weights mirror BASE's lexical Ranker so the standalone `searchIndex` ranks like the core.
// Routing (`routeWithIndex`) does not rely on these — it reuses the injected Ranker for exact parity.
export const FIELD_WEIGHTS = Object.freeze({
  id: 80,
  route_text: 70,
  title: 50,
  description: 30,
  keywords: 25,
  path: 10,
});

const ROUTABLE = new Set(["agent", "process"]);

export async function buildIndex(resources, options = {}) {
  const { deriveSignals, embed, now = null, signal } = options;
  if (typeof deriveSignals !== "function") {
    throw new TypeError("buildIndex requires `deriveSignals` (pass deriveRoutingSignals from @ai-swiss/base).");
  }

  const documents = resources
    .map((resource) => projectDocument(resource, deriveSignals(resource)))
    .sort((a, b) => compareByCodePoint(a.path, b.path));

  if (typeof embed === "function") await attachEmbeddings(documents, embed, signal);

  const postings = buildPostings(documents);

  return {
    schema_version: INDEX_SCHEMA,
    built_at: now,
    field_weights: { ...FIELD_WEIGHTS },
    has_embeddings: documents.some((doc) => Array.isArray(doc.embedding)),
    document_count: documents.length,
    documents,
    postings,
  };
}

function projectDocument(resource, signals) {
  const fields = {
    id: resource.id ?? "",
    route_text: signals.route_text ?? "",
    title: resource.title ?? "",
    description: resource.description ?? "",
    keywords: Array.isArray(resource.keywords) ? resource.keywords.join(" ") : "",
    path: resource.path ?? "",
  };
  return {
    id: resource.id,
    type: resource.type,
    title: resource.title ?? null,
    description: resource.description ?? null,
    keywords: Array.isArray(resource.keywords) ? resource.keywords : [],
    path: resource.path,
    routable: ROUTABLE.has(resource.type),
    route_scope: signals.route_scope ?? null,
    agent_path: signals.agent_path ?? null,
    route_text: signals.route_text ?? "",
    avoid_text: signals.avoid_text ?? "",
    fields,
    embedding: null,
  };
  // NB: `body` is intentionally not stored. The index is a projection of routing *signals*, not a
  // content store. BASE's Router also scores a derived routing projection with an empty body; full body
  // text belongs to discovery/retrieval after the route is chosen.
}

// token -> sorted array of [docIndex, weight], where weight sums the field weights of fields that
// contain the token. This is both the candidate generator and the standalone lexical scorer.
function buildPostings(documents) {
  const postings = new Map();
  documents.forEach((doc, docIndex) => {
    const weightByToken = new Map();
    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      for (const token of fieldTokens(doc.fields[field])) {
        weightByToken.set(token, (weightByToken.get(token) ?? 0) + weight);
      }
    }
    for (const [token, weight] of weightByToken) {
      const list = postings.get(token) ?? [];
      list.push([docIndex, weight]);
      postings.set(token, list);
    }
  });

  // Sorted keys + sorted posting lists → deterministic serialization.
  const sorted = {};
  for (const token of [...postings.keys()].sort()) {
    sorted[token] = postings.get(token).sort((a, b) => a[0] - b[0]);
  }
  return sorted;
}

async function attachEmbeddings(documents, embed, signal) {
  const texts = documents.map((doc) => doc.route_text || doc.fields.title || doc.id);
  const vectors = await embed(texts, { signal });
  if (!Array.isArray(vectors) || vectors.length !== documents.length) {
    throw new Error(`embed returned ${vectors?.length} vectors for ${documents.length} documents.`);
  }
  documents.forEach((doc, index) => {
    const vector = vectors[index];
    doc.embedding = Array.isArray(vector) && vector.length > 0 ? vector : null;
  });
}
