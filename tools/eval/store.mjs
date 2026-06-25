// App-layer persistence for the eval engine: load scenario specs, write run results and reports as
// owned files under `.ai/experiments/`. Kept OUT of @ai-swiss/base-eval so the package stays pure
// (no filesystem) and the I/O lives at the edge.
//
//   .ai/experiments/scenarios/*.json   — scenario specs (committed; { id, seedInput, goals, persona? })
//   .ai/experiments/runs/*.json        — per-scenario run results (gitignored, derived)
//   .ai/experiments/reports/*.json     — aggregated experiment reports (gitignored, derived)

import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// Load one scenario file (a single object or an array) or every *.json in a directory.
export async function loadScenarios(target) {
  const info = await stat(target);
  if (info.isDirectory()) {
    const names = (await readdir(target)).filter((n) => n.endsWith(".json")).sort();
    const all = [];
    for (const name of names) all.push(...(await loadScenarioFile(path.join(target, name))));
    return all;
  }
  return loadScenarioFile(target);
}

async function loadScenarioFile(file) {
  const data = JSON.parse(await readFile(file, "utf8"));
  const scenarios = Array.isArray(data) ? data : [data];
  // A scenario IS a user message to replay: without `seedInput`, the simulated user has nothing to
  // say and there is nothing to evaluate. Fail clearly, naming the file, the scenario and the reason.
  scenarios.forEach((s, i) => {
    if (!s || typeof s !== "object") throw new Error(`${path.basename(file)}: le scénario ${i + 1} est invalide (un objet est attendu).`);
    if (typeof s.seedInput !== "string" || !s.seedInput.trim()) {
      throw new Error(`${path.basename(file)}: le scénario «${s.id ?? i + 1}» doit définir «seedInput», le premier message de l'utilisateur simulé. Sans ce message, il n'y a rien à jouer.`);
    }
  });
  return scenarios;
}

export async function persistRun(root, result, stamp) {
  const dir = path.join(root, ".ai", "experiments", "runs");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${result.scenarioId}-${stamp}.json`);
  await writeFile(file, `${JSON.stringify(result, null, 2)}\n`);
  return file;
}

export async function persistReport(root, report, stamp) {
  const dir = path.join(root, ".ai", "experiments", "reports");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `report-${stamp}.json`);
  await writeFile(file, `${JSON.stringify(report, null, 2)}\n`);
  return file;
}
