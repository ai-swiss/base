// Spec coverage: UR-CORE-001
// writing run/report artefacts under .ai/experiments/. Exercised against a real temp BASE root so the
// file shapes and round-trips are real, with no network and no real provider.

import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { loadScenarios, persistReport, persistRun } from "../tools/eval/store.mjs";

describe("eval store — scenarios + run/report persistence", () => {
  let root;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-eval-store-"));
  });

  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("loadScenarios reads a single-object scenario file as a one-element array", async () => {
    const file = path.join(root, "one.json");
    const scenario = { id: "s1", seedInput: "hello", goals: ["g"] };
    await writeFile(file, JSON.stringify(scenario));
    const loaded = await loadScenarios(file);
    assert.deepEqual(loaded, [scenario]);
  });

  it("loadScenarios reads an inline array file as-is", async () => {
    const file = path.join(root, "arr.json");
    const scenarios = [
      { id: "a", seedInput: "x", goals: ["g1"] },
      { id: "b", seedInput: "y", goals: ["g2"] },
    ];
    await writeFile(file, JSON.stringify(scenarios));
    const loaded = await loadScenarios(file);
    assert.deepEqual(loaded, scenarios);
  });

  it("loadScenarios merges every *.json in a directory, sorted by name, flattening arrays", async () => {
    const dir = path.join(root, "scenarios");
    await mkdir(dir, { recursive: true });
    // Out-of-order filenames + a non-json file that must be ignored.
    await writeFile(path.join(dir, "02-second.json"), JSON.stringify({ id: "second", seedInput: "2", goals: [] }));
    await writeFile(
      path.join(dir, "01-first.json"),
      JSON.stringify([
        { id: "first-a", seedInput: "1a", goals: [] },
        { id: "first-b", seedInput: "1b", goals: [] },
      ]),
    );
    await writeFile(path.join(dir, "notes.txt"), "ignored, not JSON");

    const loaded = await loadScenarios(dir);
    assert.deepEqual(
      loaded.map((s) => s.id),
      ["first-a", "first-b", "second"], // 01-* before 02-*, array flattened
    );
  });

  it("loadScenarios rejects when the target is missing", async () => {
    await assert.rejects(() => loadScenarios(path.join(root, "does-not-exist.json")), /ENOENT/);
  });

  it("persistRun writes <scenarioId>-<stamp>.json under .ai/experiments/runs and round-trips", async () => {
    const result = { scenarioId: "scn-1", verdict: { outcome: "goal_met" }, turns: [{ text: "hi" }] };
    const file = await persistRun(root, result, "2026-06-09T00-00-00-000Z");

    assert.equal(
      file,
      path.join(root, ".ai", "experiments", "runs", "scn-1-2026-06-09T00-00-00-000Z.json"),
    );
    const raw = await readFile(file, "utf8");
    assert.ok(raw.endsWith("\n"), "file should end with a trailing newline");
    assert.deepEqual(JSON.parse(raw), result);
  });

  it("persistReport writes report-<stamp>.json under .ai/experiments/reports and round-trips", async () => {
    const report = { total: 2, passRate: 0.5, outcomes: { goal_met: 1 }, byFailureMode: {}, fixHints: [] };
    const file = await persistReport(root, report, "2026-06-09T00-00-00-000Z");

    assert.equal(
      file,
      path.join(root, ".ai", "experiments", "reports", "report-2026-06-09T00-00-00-000Z.json"),
    );
    const raw = await readFile(file, "utf8");
    assert.ok(raw.endsWith("\n"));
    assert.deepEqual(JSON.parse(raw), report);
  });

  it("persist* create their parent directories when absent (fresh root)", async () => {
    const fresh = await mkdtemp(path.join(tmpdir(), "base-eval-store-fresh-"));
    try {
      const runFile = await persistRun(fresh, { scenarioId: "x" }, "stamp");
      const reportFile = await persistReport(fresh, { total: 0 }, "stamp");
      assert.deepEqual(JSON.parse(await readFile(runFile, "utf8")), { scenarioId: "x" });
      assert.deepEqual(JSON.parse(await readFile(reportFile, "utf8")), { total: 0 });
    } finally {
      await rm(fresh, { recursive: true, force: true });
    }
  });
});
