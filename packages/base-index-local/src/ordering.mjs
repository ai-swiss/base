// Locale-independent ordering for deterministic derived indexes and stable search ties.
// Uses JavaScript string order (UTF-16 code units), not host locale collation.
//
// Deliberate copy of `@ai-swiss/base/ordering`: this package keeps zero runtime imports from the
// core (everything is injected), so the 6-line helper is duplicated instead of imported. The
// equivalence is enforced by tests/base-core-modules.test.mjs in the repository root.

export function compareByCodePoint(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
