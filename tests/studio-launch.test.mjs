// Spec coverage: FR-CLI-001
// `base studio` is a thin shell over a PURE decision: first launch installs (announced),
// every launch hands over to dev.mjs — the single Studio launcher.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { studioLaunchPlan } from "../tools/studio/launch.mjs";

describe("studioLaunchPlan — the decision behind `base studio`", () => {
  it("first launch: announced install, then dev.mjs with the root", () => {
    const steps = studioLaunchPlan({ uiDir: "/fw/tools/studio/ui", hasNodeModules: false, root: "/work/mon-base" });
    assert.deepEqual(steps.map((s) => s.type), ["install", "dev"]);
    assert.match(steps[0].announce, /Premier lancement/);
    assert.deepEqual(steps[0].command, ["npm", "install"]);
    assert.equal(steps[0].cwd, "/fw/tools/studio/ui");
    assert.deepEqual(steps[1].command, ["node", "dev.mjs", "/work/mon-base"]);
  });

  it("warm launch: no install step, nothing announced", () => {
    const steps = studioLaunchPlan({ uiDir: "/fw/tools/studio/ui", hasNodeModules: true, root: "/work/mon-base" });
    assert.deepEqual(steps.map((s) => s.type), ["dev"]);
    assert.equal(steps[0].announce, undefined);
  });
});
