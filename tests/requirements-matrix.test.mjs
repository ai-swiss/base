// Spec coverage: UR-CORE-004
// The requirements → tests matrix is a derived artifact: this suite is its freshness gate, the
// guard against phantom citations (a test citing a requirement ID that does not exist), and the
// proof of the proof-strength logic (skip-aware strength, weak reasons, de-scoped status, ratchet).

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  buildMatrix,
  extractCitedIds,
  extractDefinedIds,
  extractDescopedIds,
  extractHeaderIds,
  extractSkippedIds,
  extractWeakCitations,
  extractWeakCitedIds,
  parseCounts,
  ratchetVerdict,
  renderMatrix,
} from "../tools/spec/requirements-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Fixture IDs are built at runtime so this file's own source never contains literals that the
// repository-wide citation scanner would treat as (phantom) citations.
const id = (/** @type {string} */ suffix) => ["FR", suffix].join("-");
const nfr = (/** @type {string} */ suffix) => ["NFR", suffix].join("-");

describe("requirements matrix", () => {
  it("extracts defined IDs from table rows only, in file order, without duplicates", () => {
    const md = [
      `Canonical list: **${nfr("X-001")}** inline mention (not a row).`,
      "| ID | Requirement |",
      "|---|---|",
      `| ${id("A-001")} | First. |`,
      `| ${id("A-002")} | Second, references ${id("A-001")}. |`,
      `| ${id("A-001")} | Duplicate row stays single. |`,
    ].join("\n");
    assert.deepEqual(extractDefinedIds(md), [id("A-001"), id("A-002")]);
  });

  it("extracts cited IDs from headers and test titles alike", () => {
    const source = `// Spec coverage: ${id("A-001")} ${nfr("B-002")}\nit("honours ${id("C-003")}", () => {});\n`;
    assert.deepEqual(extractCitedIds(source).sort(), [id("A-001"), id("C-003"), nfr("B-002")]);
  });

  it("renders deterministically: a proof column, every id a row, an honest gaps section", () => {
    const matrix = renderMatrix(
      [id("A-001"), id("A-002")],
      new Map([[id("A-001"), ["tests/a.test.mjs", "tests/b.test.mjs"]], [id("A-002"), []]]),
    );
    assert.match(matrix, /1 of 2 requirements proven by a test — 0 weak, 1 gap\./);
    assert.ok(matrix.includes(`| ${id("A-001")} | ✅ | \`tests/a.test.mjs\`<br>\`tests/b.test.mjs\` |`));
    assert.ok(matrix.includes(`| ${id("A-002")} | ❌ no test — GAP | — |`), "every id gets a proof row");
    assert.ok(matrix.includes(`- ${id("A-002")}`), "gaps section lists the uncited requirement");
  });

  it("renders ⚠️ weak (with reason) when a requirement's only proof is flagged weak", () => {
    const matrix = renderMatrix(
      [id("A-001")],
      new Map([[id("A-001"), ["tests/a.test.mjs"]]]),
      {
        statusById: new Map([[id("A-001"), "weak"]]),
        weakReasons: new Map([[id("A-001"), new Set(["snapshot-only"])]]),
      },
    );
    assert.ok(matrix.includes(`| ${id("A-001")} | ⚠️ weak | \`tests/a.test.mjs\` |`));
    assert.match(matrix, /1 of 1 requirements proven by a test — 1 weak, 0 gap\./);
    assert.match(matrix, /## Weak proofs/);
    assert.ok(matrix.includes(`- ${id("A-001")} — snapshot-only`), "weak section names the reason");
  });

  it("renders ⊘ de-scoped and excludes it from the denominator and from GAPs", () => {
    const matrix = renderMatrix(
      [id("A-001"), id("A-002")],
      new Map([[id("A-001"), ["tests/a.test.mjs"]], [id("A-002"), []]]),
      { descopedIds: new Set([id("A-002")]) },
    );
    // A-002 is retired: 1 active requirement, fully proven, zero gap.
    assert.match(matrix, /1 of 1 requirements proven by a test — 0 weak, 0 gap, 1 de-scoped\./);
    assert.ok(matrix.includes(`| ${id("A-002")} | ⊘ de-scoped | — |`));
    assert.match(matrix, /## De-scoped \(retired, ID preserved\)/);
  });

  it("extracts weak-flagged citations (ID~weak[reason]) with the required reason", () => {
    const source = `// Spec coverage: ${id("A-001")} ${id("B-002")}~weak[snapshot-only]\n`;
    assert.deepEqual(extractCitedIds(source).sort(), [id("A-001"), id("B-002")]);
    assert.deepEqual([...extractWeakCitedIds(source)], [id("B-002")]);
    assert.deepEqual(extractWeakCitations(source), [{ id: id("B-002"), reason: "snapshot-only" }]);
  });

  it("a de-scoped requirement row is recognised by its [DE-SCOPED: …] marker", () => {
    const md = ["| ID | Requirement |", "|---|---|", `| ${id("A-009")} | Retired. [DE-SCOPED: folded into A-001] |`].join("\n");
    assert.deepEqual([...extractDescopedIds(md)], [id("A-009")]);
  });

  it("a skipped/todo test title proves nothing (extractSkippedIds), headers are the deliberate claim", () => {
    const skipped = `it.skip("${id("A-001")} not yet", () => {});\n`;
    assert.deepEqual([...extractSkippedIds(skipped)], [id("A-001")]);
    const header = `// Spec coverage: ${id("A-001")} ${nfr("B-002")}\n`;
    assert.deepEqual([...extractHeaderIds(header)].sort(), [id("A-001"), nfr("B-002")]);
  });

  it("parseCounts reads the headline, ratchetVerdict fails only when weak or gap rises", () => {
    const counts = parseCounts("**98 of 98 requirements proven by a test — 2 weak, 0 gap.**");
    assert.deepEqual(counts, { proven: 98, total: 98, weak: 2, gap: 0, descoped: 0 });
    assert.equal(ratchetVerdict({ weak: 2, gap: 0 }, { weak: 2, gap: 0 }).ok, true);
    assert.equal(ratchetVerdict({ weak: 2, gap: 0 }, { weak: 1, gap: 0 }).ok, true, "improving is fine");
    assert.equal(ratchetVerdict({ weak: 2, gap: 0 }, { weak: 3, gap: 0 }).weakRose, true);
    assert.equal(ratchetVerdict({ weak: 2, gap: 0 }, { weak: 2, gap: 1 }).gapRose, true);
  });

  it("the committed matrix is fresh (regenerate-and-diff gate)", async () => {
    const committed = await fs.readFile(path.join(ROOT, "specs/current/10_core/requirements-matrix.md"), "utf8");
    assert.equal(committed, await buildMatrix(), "run `node tools/spec/requirements-matrix.mjs` to refresh");
  });

  it("every citation in the suites points to a real requirement; every ~weak carries a reason", async () => {
    await assert.doesNotReject(buildMatrix());
  });
});
