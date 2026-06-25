// Route a request using the index, with parity to BASE's in-memory `routeRequest`.
//
// By default, correctness wins: every routable indexed document is scored, so arbitrary semantic
// rankers see the same closed set as the in-memory broker. Callers that know their rankers are lexical
// can opt into `candidateMode:"lexical"` to score only postings matches. The scoring and decision are
// BASE's own, injected: `rank` = composeRankers([lexicalRanker, ...config.rankers]), `decide` =
// decideRoute, `routeTerms`/`routeAvoidReasons` = core tokenizer and negative signal.

import { candidateDocIndices } from "./search.mjs";
import { compareByCodePoint } from "./ordering.mjs";

export async function routeWithIndex(index, request, deps = {}) {
  const { rank, decide, routeTerms, routeAvoidReasons, thresholds = {}, signal, root, candidateMode = "all" } = deps;
  if (typeof rank !== "function" || typeof decide !== "function" || typeof routeTerms !== "function") {
    throw new TypeError(
      "routeWithIndex needs { rank, decide, routeTerms } injected from @ai-swiss/base "
        + "(composeRankers([lexicalRanker, ...]), decideRoute, routeTerms).",
    );
  }

  const terms = routeTerms(request);

  // Every agent is known to the Router even if it scores nothing (so a clear agent can still be named).
  const agentsByDir = new Map();
  for (const doc of index.documents) {
    if (doc.type === "agent" && doc.agent_path) agentsByDir.set(doc.agent_path, slimAgent(doc));
  }

  const ranked = [];
  for (const docIndex of candidateIndices(index, terms, candidateMode)) {
    const doc = index.documents[docIndex];
    if (!doc.routable) continue;
    const { score, reasons } = await rank(toResource(doc), terms, { root, mode: "route", query: request, signal });
    const avoidReasons = typeof routeAvoidReasons === "function" ? routeAvoidReasons(doc.avoid_text, terms) : [];
    ranked.push({
      resource: slimResource(doc),
      score: avoidReasons.length ? 0 : score,
      reasons: [...new Set([...reasons, ...avoidReasons])],
      route_scope: doc.route_scope,
      agent_path: doc.agent_path,
    });
  }
  ranked.sort((a, b) => b.score - a.score || compareByCodePoint(a.resource.path, b.resource.path));

  return decide(ranked, agentsByDir, thresholds);
}

function candidateIndices(index, terms, mode) {
  if (mode === "all") return index.documents.map((_doc, index) => index);
  if (mode === "lexical") return candidateDocIndices(index, terms);
  throw new TypeError(`candidateMode must be "all" or "lexical", received ${mode}.`);
}

// Reconstruct the fields BASE's routing Ranker reads. Body is deliberately empty: routeRequest also
// scores a derived routing projection, not the full instruction body.
function toResource(doc) {
  return {
    id: doc.id,
    type: doc.type,
    title: doc.title,
    description: doc.description,
    keywords: doc.keywords,
    path: doc.path,
    route_text: doc.route_text,
    body: "",
    embedding: doc.embedding ?? undefined,
  };
}

function slimResource(doc) {
  return { id: doc.id, type: doc.type, title: doc.title, path: doc.path };
}

function slimAgent(doc) {
  return { id: doc.id, type: "agent", title: doc.title, path: doc.path };
}
