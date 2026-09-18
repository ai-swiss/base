// Files BASE writes for itself at run time. They are MACHINE state, never knowledge: the
// inventory skips them, so they never become cards, counters or doctor findings. One list,
// one reason to change — every consumer (inventory, and whatever reads the inventory) inherits
// an addition here without touching its own code.

export const RUNTIME_ARTIFACT_FILES = new Set([".ai/studio.settings.json"]);

/** @param {string} relPath root-relative POSIX path */
export function isRuntimeArtifact(relPath) {
  return RUNTIME_ARTIFACT_FILES.has(relPath);
}

// A GENERATED PROJECTION is different from a runtime artifact: BASE writes it from other files and
// a reader is meant to open it (a routing index is the map a model descends). It stays in the
// inventory. What it must never be is a search RESULT: it is a summary of the resources it points
// at, so ranking it beside them puts a table of contents above the answer. It is also exempt from
// the orphan check, being reachable by convention rather than by a link.
//
// Provenance, not a path list, decides: the file carries a banner near the top. A file that took
// the same name with the banner removed is its author's, and is treated as a source in both
// checks. Only the first lines are scanned, so the documentation that explains this very
// convention is not mistaken for a projection.
// The marker is a MACHINE TOKEN, not a sentence: `BASE:generated`. The sentence beside it is for a
// human and will be written in the language of the root; the token is what every check reads, so
// translating the sentence can never blind them. Two banner forms are recognised: the machine
// token `BASE:generated`, and the French sentence «Généré par », which roots on disk carry.
// Provenance decides whether a build may overwrite a file; losing that answer would overwrite
// files nobody owns.
const PROVENANCE_BANNER = /^<!--\s*(?:BASE:generated\b|Généré par )/;
const BANNER_SCAN_LINES = 5;

/** @param {string} content the file's content, or a resource body */
export function isGeneratedProjection(content) {
  let seen = 0;
  for (const line of String(content ?? "").split("\n", BANNER_SCAN_LINES * 3)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (PROVENANCE_BANNER.test(trimmed)) return true;
    if ((seen += 1) >= BANNER_SCAN_LINES) return false;
  }
  return false;
}
