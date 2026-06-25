// Files BASE writes for itself at run time. They are MACHINE state, never knowledge: the
// inventory skips them, so they never become cards, counters or doctor findings. One list,
// one reason to change — every consumer (inventory, and whatever reads the inventory) inherits
// an addition here without touching its own code.

export const RUNTIME_ARTIFACT_FILES = new Set([".ai/studio.settings.json"]);

/** @param {string} relPath root-relative POSIX path */
export function isRuntimeArtifact(relPath) {
  return RUNTIME_ARTIFACT_FILES.has(relPath);
}
