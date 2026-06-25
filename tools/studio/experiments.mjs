// Studio API handlers for the Monitor page: read the eval runs and reports that base-eval persists
// under .ai/experiments/ (written by tools/eval/run.mjs). Read-only; tolerant of a missing directory
// (no experiments yet → empty overview). App layer, like the rest of tools/studio.

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "./api.mjs";

async function readJsonDir(dir) {
  let names;
  try {
    names = (await readdir(dir)).filter((n) => n.endsWith(".json"));
  } catch {
    return []; // directory absent → no items
  }
  const out = [];
  for (const name of names) {
    try {
      const full = path.join(dir, name);
      const [text, info] = await Promise.all([readFile(full, "utf8"), stat(full)]);
      out.push({ name, mtimeMs: info.mtimeMs, data: JSON.parse(text) });
    } catch {
      /* skip unreadable/corrupt file */
    }
  }
  out.sort((a, b) => b.mtimeMs - a.mtimeMs); // newest first
  return out;
}

/**
 * Overview for the Évaluations screen: run summaries carry the card metadata (process,
 * verdict, failure mode, origin, model, date, turns, limitations) and the list is filterable
 * server-side (`process`, `verdict`, `failure`, `origin`, `q` full-text on transcripts) and
 * sortable (`sort: "date" | "score"`). Aggregates are computed CLIENT-side on the filtered
 * selection — filtering on a process shows the health of THAT process.
 */
export async function experimentsOverview(root, { q } = /** @type {{ q?: string }} */ ({})) {
  const reports = await readJsonDir(path.join(root, ".ai", "experiments", "reports"));
  const runs = await readJsonDir(path.join(root, ".ai", "experiments", "runs"));

  // The transcript search is the ONE thing the server filters (the transcripts live here).
  // It returns the matched names NEXT TO the full list: the client intersects, and the chips
  // keep counting on the whole selection (Drive facet semantics need both).
  const needle = q && String(q).trim() ? String(q).toLowerCase() : null;
  const matched = needle === null
    ? null
    : runs.filter((f) => JSON.stringify(f.data.turns ?? []).toLowerCase().includes(needle)).map((f) => f.name);

  return {
    latestReport: reports[0]?.data ?? null,
    reports: reports.map((f) => ({ name: f.name, total: f.data.total ?? 0, passRate: f.data.passRate ?? 0 })),
    matched,
    runs: runs.map((f) => ({
      name: f.name,
      scenarioId: f.data.scenarioId ?? null,
      process: f.data.process ?? null,
      agentId: f.data.agentId ?? null,
      outcome: f.data.verdict?.outcome ?? null,
      failureMode: f.data.verdict?.failureMode ?? null,
      severity: f.data.verdict?.severity ?? null,
      stopReason: f.data.stopReason ?? null,
      origin: f.data.origin ?? "simulation",
      model: f.data.model ?? f.data.sutId ?? null,
      at: f.data.at ?? new Date(f.mtimeMs).toISOString(),
      turns: Array.isArray(f.data.turns) ? f.data.turns.length : 0,
      // Declared tool gaps (report_limitation): a badge, distinct from failures.
      limitations: Array.isArray(f.data.limitations) ? f.data.limitations : [],
    })),
  };
}

export async function getRun(root, name) {
  if (!name || name.includes("/") || name.includes("\\") || name.includes("..")) {
    throw new ApiError("invalid run name", "BAD_REQUEST");
  }
  const file = path.join(root, ".ai", "experiments", "runs", name);
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    throw new ApiError(`run not found: ${name}`, "NOT_FOUND");
  }
}
