// Spec coverage: FR-CLI-001
// `base update` is a thin shell over pure decisions: pull when it's a git clone, tell the user
// to re-download when it isn't; and report (never judge) artifacts that drift from their render.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { staleArtifacts, updatePlan } from "../tools/core/update.mjs";

describe("updatePlan", () => {
  it("a git clone fast-forwards", () => {
    assert.deepEqual(updatePlan({ frameworkDir: "/fw", hasGit: true }), { type: "pull", dir: "/fw" });
  });

  it("a ZIP install gets an honest manual message (no fake git pull)", () => {
    const plan = updatePlan({ frameworkDir: "/fw", hasGit: false });
    assert.equal(plan.type, "manual");
    assert.match(plan.message, /re-téléchargez|ZIP/);
  });
});

describe("staleArtifacts", () => {
  it("reports only files that differ from their render; an absent file is never flagged", () => {
    const stale = staleArtifacts([
      { path: "CLAUDE.md", onDisk: "old", render: "new" },     // differs → stale
      { path: "AGENTS.md", onDisk: "same", render: "same" },    // identical → fresh
      { path: ".ai/tools.md", onDisk: null, render: "x" }, // absent → not our concern
    ]);
    assert.deepEqual(stale, ["CLAUDE.md"]);
  });
});
