// Spec coverage: FR-CLI-001
// `base update` is a thin shell over pure decisions: on the stable channel (default) it
// fast-forwards TO the latest release tag — what "1.0.0" means for an operator must not change
// with every merge; `--channel main` follows the branch head; a ZIP install gets an honest
// re-download message. Artifacts drifting from their render are reported, never judged.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { latestVersionTag, staleArtifacts, updatePlan } from "../tools/core/update.mjs";

describe("updatePlan", () => {
  it("stable channel (default) fast-forwards to the latest release tag", () => {
    assert.deepEqual(
      updatePlan({ frameworkDir: "/fw", hasGit: true, latestTag: "v1.2.0" }),
      { type: "ff-tag", dir: "/fw", tag: "v1.2.0" },
    );
  });

  it("stable channel without any visible tag falls back to the branch, saying so", () => {
    const plan = updatePlan({ frameworkDir: "/fw", hasGit: true, latestTag: null });
    assert.equal(plan.type, "pull");
    assert.match(plan.note, /aucun tag/);
  });

  it("the main channel follows the branch head, no tag involved", () => {
    assert.deepEqual(
      updatePlan({ frameworkDir: "/fw", hasGit: true, channel: "main", latestTag: "v1.2.0" }),
      { type: "pull", dir: "/fw" },
    );
  });

  it("a ZIP install gets an honest manual message pointing at the latest RELEASE, not a branch", () => {
    const plan = updatePlan({ frameworkDir: "/fw", hasGit: false });
    assert.equal(plan.type, "manual");
    assert.match(plan.message, /releases\/latest/);
    assert.doesNotMatch(plan.message, /refs\/heads\/main/);
  });
});

describe("latestVersionTag", () => {
  it("picks the highest version numerically, not lexicographically (v1.10.0 beats v1.9.0)", () => {
    assert.equal(latestVersionTag("v1.0.0\nv1.10.0\nv1.9.0\n"), "v1.10.0");
  });

  it("ignores non-release tags and returns null when none qualify", () => {
    assert.equal(latestVersionTag("v1.0.0-rc.1\nnightly\nv2.0\n"), null);
    assert.equal(latestVersionTag(""), null);
    assert.equal(latestVersionTag("v1.0.0\nv1.0.0-rc.1\n"), "v1.0.0");
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
