// `base update` decides here, runs git in the CLI shell. Offline-first: no network check ever
// lives in doctor; updating is a deliberate, honest command. Pure decisions, injected facts.

/**
 * What `base update` should do, given where the framework lives and whether it is a git clone.
 * → { type: "pull", dir } to fast-forward, or { type: "manual", dir, message } when there is no
 *   git (a ZIP install) — re-download is the only honest path.
 * @param {{ frameworkDir: string, hasGit: boolean }} facts
 */
export function updatePlan({ frameworkDir, hasGit }) {
  if (!hasGit) {
    return {
      type: "manual",
      dir: frameworkDir,
      message:
        "Installé sans git (ZIP) : re-téléchargez la dernière version " +
        "(https://github.com/ai-swiss/base/archive/refs/heads/main.zip) et remplacez ce dossier.",
    };
  }
  return { type: "pull", dir: frameworkDir };
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
