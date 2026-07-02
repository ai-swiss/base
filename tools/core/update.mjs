// `base update` decides here, runs git in the CLI shell. Offline-first: no network check ever
// lives in doctor; updating is a deliberate, honest command. Pure decisions, injected facts.

/**
 * What `base update` should do, given where the framework lives, whether it is a git clone, the
 * chosen channel, and the latest version tag visible in the clone.
 * Channels: `stable` (default) fast-forwards TO the latest release tag — what «1.0.0» means for an
 * operator must not change with every merge; `main` follows the branch head (the pre-1.0 behaviour,
 * for contributors). → { type: "ff-tag", dir, tag } | { type: "pull", dir, note? } |
 * { type: "manual", dir, message } (a ZIP install — re-download is the only honest path).
 * @param {{ frameworkDir: string, hasGit: boolean, channel?: "stable" | "main", latestTag?: string | null }} facts
 */
export function updatePlan({ frameworkDir, hasGit, channel = "stable", latestTag = null }) {
  if (!hasGit) {
    return {
      type: "manual",
      dir: frameworkDir,
      message:
        "Installé sans git (ZIP) : re-téléchargez la dernière version publiée " +
        "(https://github.com/ai-swiss/base/releases/latest, «Source code (zip)») et remplacez ce dossier.",
    };
  }
  if (channel === "main") return { type: "pull", dir: frameworkDir };
  if (!latestTag) {
    // No version tag visible (shallow clone, or a fork without tags): following the branch is the
    // only move left — said out loud, never silently.
    return { type: "pull", dir: frameworkDir, note: "aucun tag de version visible: suivi de la branche (équivalent --channel main)" };
  }
  return { type: "ff-tag", dir: frameworkDir, tag: latestTag };
}

/**
 * The latest release tag in a `git tag --list 'v*'` output: highest `vMAJOR.MINOR.PATCH`, or null.
 * Pure string work, so the ordering is testable without git (numeric, not lexicographic: v1.10.0
 * beats v1.9.0).
 * @param {string} tagListOutput
 */
export function latestVersionTag(tagListOutput) {
  const tags = String(tagListOutput ?? "")
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
  const key = (t) => t.slice(1).split(".").map(Number);
  tags.sort((a, b) => {
    const [aMaj, aMin, aPat] = key(a);
    const [bMaj, bMin, bPat] = key(b);
    return aMaj - bMaj || aMin - bMin || aPat - bPat;
  });
  return tags.at(-1) ?? null;
}

/**
 * Which committed artifacts differ from their fresh render — a content comparison, never mtime
 * (creation-only means a user may have personalised a file; we report the difference, we do not
 * judge it). → the list of relative paths that differ.
 * @param {{ path: string, onDisk: string | null, render: string }[]} pairs
 */
export function staleArtifacts(pairs) {
  return pairs.filter((p) => p.onDisk !== null && p.onDisk !== p.render).map((p) => p.path);
}
