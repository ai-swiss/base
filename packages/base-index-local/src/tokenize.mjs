// Build-time tokenizer for indexing document fields. It mirrors BASE's `normalize` (NFD, diacritics
// stripped, lowercased) so indexed tokens agree with query tokens. The *query* side of routing should
// reuse BASE's own `routeTerms` (injected) so routing tokenization is shared, not duplicated; this
// tokenizer only decides which tokens a stored field contributes to the postings list.

export function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function tokenize(value) {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2);
}

// Unique tokens of a field, preserving nothing but membership (postings are a set, not a bag).
export function fieldTokens(value) {
  return [...new Set(tokenize(value))];
}
