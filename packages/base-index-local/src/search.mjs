// Standalone lexical search over the index, and the candidate generator that feeds routing.
//
// BASE's lexical Ranker matches a term as a *substring* of a field (`field.includes(term)`), so a
// query term "facture" must still reach a document whose field has "facturation". Because a field
// tokenizes on non-alphanumerics and a term is alphanumeric, `field.includes(term)` holds iff some
// token of the field contains the term. So candidate generation = union of postings whose token
// contains the term. That set is exactly BASE's "score > 0" set — `routeWithIndex` then re-scores it
// with the real Ranker for exact parity, while only ever touching matched documents (the scale win).

import { tokenize } from "./tokenize.mjs";
import { compareByCodePoint } from "./ordering.mjs";

// Tokens of the vocabulary that contain `term` as a substring (the exact token included). The
// vocabulary is cached on the index object so repeated queries over a stable index don't rescan it.
function matchingTokens(index, term) {
  return vocabularyOf(index).filter((token) => token.includes(term));
}

function vocabularyOf(index) {
  if (!index.__vocabulary) {
    Object.defineProperty(index, "__vocabulary", { value: Object.keys(index.postings), enumerable: false, configurable: true });
  }
  return index.__vocabulary;
}

export function searchIndex(index, query, options = {}) {
  const { limit = 10 } = options;
  const terms = [...new Set(tokenize(query))];
  if (terms.length === 0) return [];

  const scoreByDoc = new Map();
  const reasonsByDoc = new Map();
  for (const term of terms) {
    const bestWeight = new Map(); // doc -> best matching-token weight for THIS term (avoid intra-term double count)
    for (const token of matchingTokens(index, term)) {
      for (const [docIndex, weight] of index.postings[token]) {
        bestWeight.set(docIndex, Math.max(bestWeight.get(docIndex) ?? 0, weight));
      }
    }
    for (const [docIndex, weight] of bestWeight) {
      scoreByDoc.set(docIndex, (scoreByDoc.get(docIndex) ?? 0) + weight);
      const reasons = reasonsByDoc.get(docIndex) ?? [];
      reasons.push(`index:${term}`);
      reasonsByDoc.set(docIndex, reasons);
    }
  }

  return [...scoreByDoc.entries()]
    .map(([docIndex, score]) => {
      const doc = index.documents[docIndex];
      return { id: doc.id, type: doc.type, path: doc.path, title: doc.title, score, reasons: reasonsByDoc.get(docIndex) };
    })
    .sort((a, b) => b.score - a.score || compareByCodePoint(a.path, b.path))
    .slice(0, limit);
}

// Candidate document indices for query terms: every document with a token containing any term.
// A superset-free, exact match for BASE's lexical "score > 0" set.
export function candidateDocIndices(index, terms) {
  const indices = new Set();
  for (const term of terms) {
    for (const token of matchingTokens(index, term)) {
      for (const [docIndex] of index.postings[token]) indices.add(docIndex);
    }
  }
  return [...indices].sort((a, b) => a - b);
}
