import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { searchResources } from "../tools/base-core.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixturePath = path.join(repoRoot, "tests", "fixtures", "section-retrieval-real-corpus.json");

describe("real French questions retrieve their canonical passages", () => {
  it("keeps every audited answer in the top five and at least 80% in the top three", async (t) => {
    const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
    assert.equal(fixture.cases.length, 30);

    const ranks = [];
    const misses = [];
    for (const testCase of fixture.cases) {
      const hits = await searchResources(repoRoot, testCase.query, { grain: "section", limit: 5 });
      const rank = hits.findIndex(({ ref }) => ref === testCase.ref) + 1;
      ranks.push(rank);
      if (rank === 0) {
        misses.push({
          query: testCase.query,
          expected: testCase.ref,
          received: hits.map(({ ref }) => ref),
        });
      }
    }

    const distribution = Object.fromEntries(
      [1, 2, 3, 4, 5].map((rank) => [rank, ranks.filter((value) => value === rank).length]),
    );
    const top3 = ranks.filter((rank) => rank > 0 && rank <= 3).length;
    t.diagnostic(`rank distribution ${JSON.stringify(distribution)}; top3=${top3}/30`);

    assert.deepEqual(misses, []);
    assert.ok(top3 >= 24, `expected at least 24/30 canonical passages in the top three, received ${top3}/30`);
  });
});
