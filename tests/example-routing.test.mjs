// Spec coverage: FR-ROUTE-007
// paraphrases, near-duplicate processes and counter-examples. Its fixtures are protected here so a
// scoring change that breaks the showcase fails CI, not a demo.

import assert from "node:assert/strict";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { runRouteTests } from "../tools/base-core.mjs";

const exampleRoot = path.resolve(fileURLToPath(new URL("../exemples/routage-pme", import.meta.url)));

describe("example: routage-pme", () => {
  it("routes every fixture as expected (paraphrases, counter-examples, out of scope)", async () => {
    const result = await runRouteTests(exampleRoot);
    assert.equal(result.ok, true, JSON.stringify(result.failures, null, 2));
    assert.equal(result.passed, result.total);
    assert.ok(result.total >= 6, `expected the example to carry several fixtures, got ${result.total}`);
  });
});
