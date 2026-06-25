// `base studio` decides here, spawns in the CLI shell. dev.mjs stays the SINGLE launcher
// (ports, Node preflight, URL, browser): this module only answers "what must run, in what
// order, with what announcement" — pure, so the decision is testable without spawning.

/**
 * @param {{ uiDir: string, hasNodeModules: boolean, root: string }} input
 * @returns {{ type: "install" | "dev", cwd: string, command: string[], announce?: string }[]}
 */
export function studioLaunchPlan({ uiDir, hasNodeModules, root }) {
  /** @type {{ type: "install" | "dev", cwd: string, command: string[], announce?: string }[]} */
  const steps = [];
  if (!hasNodeModules) {
    steps.push({
      type: "install",
      cwd: uiDir,
      command: ["npm", "install"],
      announce: "Premier lancement: installation de l'atelier (une fois, ~1 min)…",
    });
  }
  steps.push({ type: "dev", cwd: uiDir, command: ["node", "dev.mjs", root] });
  return steps;
}
