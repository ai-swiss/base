// Spec coverage: FR-DOCS-001
// The documentation model must never carry generated fixtures, traces, dependency trees, or lock
// files — in EITHER target. The skip-rule was a fragile exact-prefix match that missed
// e2e/.run-loose and .run-ws; this pins the boundary so a leak fails CI, not a human's eyeballs.

import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { buildDocsModel } from "../tools/docs/model.mjs";

const FORBIDDEN = [
  [/node_modules\//, "node_modules"],
  [/\/e2e\//, "e2e fixtures"],
  [/\.run/, "e2e .run* run dirs"],
  [/\.ai\/trace\//, "trace journal"],
  [/\.ai\/changes\//, "change journal"],
  [/package-lock\.json$/, "lockfile"],
  [/\.lock$/, "lockfile"],
];

const root = path.resolve(".");

describe("docs model excludes generated/private artifacts (both targets)", () => {
  for (const target of ["local", "public"]) {
    it(`the ${target} model carries no forbidden paths`, async () => {
      const model = await buildDocsModel(root, { target });
      assert.ok(model.resources.length > 0, "model should have resources");
      for (const resource of model.resources) {
        for (const [pattern, label] of FORBIDDEN) {
          assert.ok(!pattern.test(resource.path), `${target} model leaked ${label}: ${resource.path}`);
        }
      }
    });
  }

  it("the public model is strictly smaller than the local model (internal pages excluded)", async () => {
    const local = await buildDocsModel(root, { target: "local" });
    const pub = await buildDocsModel(root, { target: "public" });
    assert.ok(pub.resources.length < local.resources.length, "public must exclude internal resources");
  });
});
