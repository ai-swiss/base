// id-grammar.mjs — the single source of BASE's stable-identifier grammar.
//
// Stable identifiers are the joints of the spec: grep an ID and you reach its requirement row,
// its proving test, and its history. Every spec gate must agree on what an ID *is*, so the prefix
// sets live here once and both gates (requirements-matrix.mjs, check-ids.mjs) import them — two
// hand-kept copies would silently diverge.
//
// Grammar: {PREFIX}-{DOMAIN}-{NNN}. Two families of prefix:
//   - PROVABLE (UR, NFR, FR, RC): behaviour, qualities and risk controls — each carries a proof row
//     in the requirements matrix.
//   - DECISION (AD): an architecture decision — recorded in decisions/, never "proven".
// STABLE = PROVABLE + DECISION: every ID whose immutability is gate-enforced (never renumbered,
// reused, or deleted). The matrix proves PROVABLE; the immutability gate guards STABLE.

export const PROVABLE_PREFIXES = ["UR", "NFR", "FR", "RC"];
export const DECISION_PREFIXES = ["AD"];
export const STABLE_PREFIXES = [...PROVABLE_PREFIXES, ...DECISION_PREFIXES];

const group = (/** @type {string[]} */ prefixes) => `(?:${prefixes.join("|")})`;

/** The `{PREFIX}-{DOMAIN}-{NNN}` body for the given prefix family (no anchors, no capture). */
export const idBody = (/** @type {string[]} */ prefixes) => `${group(prefixes)}-[A-Z]+-\\d{3}`;

/** A full-form ID mentioned anywhere, word-bounded (capture group 1 = the ID). */
export const idPattern = (prefixes = PROVABLE_PREFIXES, flags = "g") =>
  new RegExp(`\\b(${idBody(prefixes)})\\b`, flags);

/** An ID defined as a table row (first column). Capture group 1 = the ID. */
export const rowIdPattern = (prefixes = STABLE_PREFIXES, flags = "gm") =>
  new RegExp(`^\\|\\s*(${idBody(prefixes)})\\s*\\|`, flags);

/**
 * A forbidden letter-suffixed row ID (e.g. `FR-VALID-003a`): invisible to the plain grammar, so it
 * would silently carry no proof row and no immutability protection. Capture group 1 = the bad ID.
 */
export const suffixedRowIdPattern = (prefixes = STABLE_PREFIXES, flags = "gm") =>
  new RegExp(`^\\|\\s*(${idBody(prefixes)}[a-z]+)\\s*\\|`, flags);
