// Spec coverage: FR-ROUTE-007
// paraphrases, near-duplicate processes and counter-examples. Its fixtures are protected here so a
// scoring change that breaks the showcase fails CI, not a demo.

import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { runRouteTests } from "../tools/base-core.mjs";

const examplesDir = path.resolve(fileURLToPath(new URL("../exemples", import.meta.url)));
const exampleRoot = path.join(examplesDir, "routage-pme");

describe("example: routage-pme", () => {
  it("routes every fixture as expected (paraphrases, counter-examples, out of scope)", async () => {
    const result = await runRouteTests(exampleRoot);
    assert.equal(result.ok, true, JSON.stringify(result.failures, null, 2));
    assert.equal(result.passed, result.total);
    assert.ok(result.total >= 6, `expected the example to carry several fixtures, got ${result.total}`);
  });
});

// Every SHIPPED example must route its OWN declared `routing.examples` the way its frontmatter
// claims — otherwise the corpus that teaches the standard contradicts the standard. `npm run check`
// replays `--examples` on the framework root only; this closes that gap for the example roots, so an
// example whose declared phrasing drifts fails CI instead of shipping silently.
const exampleRoots = readdirSync(examplesDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(examplesDir, e.name))
  .filter((dir) => {
    try {
      return readdirSync(path.join(dir, ".ai", "agents")).length > 0;
    } catch {
      return false;
    }
  });

describe("every example root replays its own declared routing.examples", () => {
  for (const root of exampleRoots) {
    it(`${path.basename(root)} routes every declared example as its frontmatter claims`, async () => {
      const result = await runRouteTests(root, { examples: true });
      assert.equal(result.ok, true, JSON.stringify(result.failures, null, 2));
      assert.ok(result.total > 0, "an example root with agents must declare routing.examples to guard");
    });
  }
});
