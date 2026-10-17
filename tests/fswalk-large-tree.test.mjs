// [SPEC-NEUTRAL: preserve the disk walk's paths and order beyond the JS argument limit.]
import assert from "node:assert/strict";
import { test } from "node:test";
import { listFiles } from "../tools/core/fswalk.mjs";
import { diagnoseData } from "../tools/doctor/diagnose.mjs";

test("disk tree flattening preserves every path in a large child directory", () => {
  const files = Array.from({ length: 200_000 }, (_, i) => ({ name: `${i}.md`, path: `child/${i}.md` }));
  const tree = { files: [{ name: "README.md", path: "README.md" }], dirs: [{ files, dirs: [] }] };
  assert.deepEqual(listFiles(tree), ["README.md", ...files.map((file) => file.path)]);
});

test("doctor resolves directory links and missing links among many non-resource files", () => {
  const files = Array.from({ length: 200_000 }, (_, i) => `other/${i}.json`);
  files.push("assets/nested/proof.json");
  const inventory = [{ id: "p", type: "process", path: ".ai/agents/a/skills/processes/p/SKILL.md", body: "[directory](assets) [nested](assets/nested) [missing](absent)" }];
  const deadLinks = diagnoseData({ inventory, files }).filter((finding) => finding.type === "dead_link");
  assert.equal(deadLinks.length, 1);
  assert.match(deadLinks[0].message, /absent/);
});
