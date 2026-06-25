// Spec coverage: FR-ROUTE-005
// so the CI promise can never again exceed what the repo actually verifies (audit P0-1).

import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

async function ciRouteRoots() {
  const ci = await readFile(".github/workflows/ci.yml", "utf8");
  return new Set([...ci.matchAll(/route-test --root (\S+)/g)].map((m) => m[1]));
}

// Every directory (at ANY depth) that ships a route-tests fixture. Recursive on purpose: nested
// multi-root examples (exemples/agence-multi-clients/clients/<x>) carry their fixtures below the
// top level, and the inverse guard must see them too, or a nested example could slip through unrouted.
async function fixtureRootsOnDisk(dir = "exemples") {
  const roots = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const child = path.join(dir, entry.name);
    const fixture = path.join(child, ".ai", "routing", "route-tests.json");
    if (await access(fixture).then(() => true, () => false)) roots.push(child.split(path.sep).join("/"));
    roots.push(...await fixtureRootsOnDisk(child));
  }
  return roots;
}

describe("CI route-test targets are backed by fixtures", () => {
  it("every `route-test --root <dir>` in the workflow has a route-tests.json", async () => {
    const roots = [...await ciRouteRoots()];
    assert.ok(roots.length >= 3, `expected CI to enumerate route-test roots, found ${roots.length}`);

    for (const root of roots) {
      const fixture = path.join(root, ".ai", "routing", "route-tests.json");
      await assert.doesNotReject(access(fixture), `CI runs route-test on "${root}" but ${fixture} is missing`);
    }
  });

  it("conversely, every example fixture is exercised by CI — no forgotten example, nested ones included", async () => {
    // The inverse guard: any directory with routing fixtures (top-level OR nested under a multi-root
    // example) MUST appear in the workflow, so coverage can never silently lag behind the corpus.
    const ciRoots = await ciRouteRoots();
    const onDisk = await fixtureRootsOnDisk();
    assert.ok(onDisk.length >= 3, `expected to find example route fixtures on disk, found ${onDisk.length}`);
    for (const root of onDisk) {
      assert.ok(
        ciRoots.has(root),
        `${root} has route fixtures but CI never runs route-test on it — add it to .github/workflows/ci.yml`,
      );
    }
  });
});
