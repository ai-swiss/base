// Locale-independent ordering helpers. Stable projections and audit results must not depend on the
// host ICU/locale configuration. The historical public name is compareByCodePoint, but JavaScript's
// `<` / `>` operators compare strings by UTF-16 code units.
//
// Public as `@ai-swiss/base/ordering`. `@ai-swiss/base-index-local` carries a deliberate copy
// (it keeps zero runtime imports from the core); tests/base-core-modules.test.mjs enforces parity.

export function compareByCodePoint(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
