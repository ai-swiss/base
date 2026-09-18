// Spec coverage: FR-DOCS-002
// How `base docs build` FINDS the documentation site adapter, and what it refuses.
//
// The adapter is an optional companion package, so the only thing BASE owns here is a decision:
// which two places are asked, in what order, and what a runtime below Astro's floor is told. Those
// are pinned pure below; Node's own resolution is not ours to test. The user-facing refusal on a
// root that has NOT installed the adapter is pinned end to end by the pack smoke (tests/smoke-pack.mjs),
// the only place where the package is genuinely absent.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  docsSiteCandidates,
  engineFloorError,
  resolveDocsSite,
  resolveDocsSiteOutput,
} from "../tools/docs/site.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = path.join(REPO, "packages", "base-docs-site");
const manifest = JSON.parse(readFileSync(path.join(SITE_DIR, "package.json"), "utf8"));

describe("docs site adapter — where it is looked for", () => {
  it("asks the engine first, then the routed root, and nowhere else", () => {
    const candidates = docsSiteCandidates("/tmp/some-root");

    assert.equal(candidates.length, 2, "exactly two places: the engine, then the root");
    assert.equal(candidates[0], path.join(REPO, "tools", "docs", "site.mjs"), "first: the engine executing this code");
    assert.equal(candidates[1], path.join("/tmp/some-root", "package.json"), "second: the routed root's own node_modules");
  });

  it("resolves a relative root to an absolute one, so the second place is unambiguous", () => {
    assert.equal(docsSiteCandidates(".")[1], path.join(process.cwd(), "package.json"));
  });

  it("anchors a relative output in the selected root, independently of cwd", () => {
    const root = path.join(path.parse(REPO).root, "teams", "research");

    assert.equal(
      resolveDocsSiteOutput(root, ".temp/review", ".base-docs/private/site"),
      path.join(root, ".temp", "review"),
    );
    assert.equal(
      resolveDocsSiteOutput(root, undefined, ".base-docs/private/site"),
      path.join(root, ".base-docs", "private", "site"),
    );
    assert.equal(
      resolveDocsSiteOutput(root, path.join(path.parse(REPO).root, "srv", "base-docs"), "unused"),
      path.join(path.parse(REPO).root, "srv", "base-docs"),
      "an absolute destination remains the caller's explicit choice",
    );
  });

  it(
    "finds the workspace adapter from this checkout, through its declared entry point",
    { skip: engineFloorError(process.versions.node, manifest.engines?.node) ? "the adapter requires a newer Node than the core" : false },
    async () => {
      const site = await resolveDocsSite(REPO);

      assert.equal(site.dir, SITE_DIR, "the workspace link resolves to the package in packages/");
      assert.equal(site.bin, path.join(SITE_DIR, "scripts", "base-docs-site.mjs"));
      assert.equal(existsSync(site.bin), true, "the declared entry point exists");
      assert.equal(site.id, `@ai-swiss/base-docs-site@${manifest.version}`, "the launch names the adapter that answered");
    },
  );
});

describe("docs site adapter — the Node floor it declares", () => {
  it("refuses a runtime below the declared floor, naming both versions and the fix", () => {
    const message = engineFloorError("20.11.0", ">=22.12");

    assert.match(message ?? "", /Node 22\.12\.0 ou plus \(vous avez 20\.11\.0\)/);
    assert.match(message ?? "", /nodejs\.org/);
  });

  it("accepts the floor itself and anything above it", () => {
    assert.equal(engineFloorError("22.12.0", ">=22.12"), null);
    assert.equal(engineFloorError("22.12.3", ">=22.12"), null);
    assert.equal(engineFloorError("24.0.0", ">=22.12"), null);
  });

  it("compares minors as numbers, never as text", () => {
    assert.notEqual(engineFloorError("22.9.0", ">=22.12"), null, "22.9 is below 22.12; a text compare would wave it through");
    assert.equal(engineFloorError("22.120.0", ">=22.12"), null, "22.120 is above 22.12; a text compare would refuse it");
  });

  it("preflights nothing rather than guessing an unfamiliar range", () => {
    assert.equal(engineFloorError("18.0.0", ">=22.12 <25"), null);
    assert.equal(engineFloorError("18.0.0", "^22.12"), null);
    assert.equal(engineFloorError("18.0.0", undefined), null);
  });

  it("reads the floor from the adapter's own manifest, so the two never drift", () => {
    assert.equal(engineFloorError("18.0.0", manifest.engines?.node) !== null, true, "the declared floor is above Node 18");
    assert.equal(engineFloorError("999.0.0", manifest.engines?.node), null, "a future runtime remains above the declared floor");
  });
});

describe("docs site adapter — publishable surface", () => {
  it("is a public package with a license, an entry point and an engine floor", () => {
    assert.equal(manifest.private, undefined, "a private package can never reach the team that installed BASE");
    assert.equal(manifest.license, "Apache-2.0");
    assert.equal(manifest.bin["base-docs-site"], "./scripts/base-docs-site.mjs");
    assert.match(manifest.engines.node, /^>=/);
  });

  it("requires the core as a peer, and links it in the checkout without shipping that link", () => {
    assert.equal(manifest.peerDependencies["@ai-swiss/base"], "1.x");
    assert.equal(manifest.peerDependenciesMeta, undefined, "the adapter renders the core's model: the core is REQUIRED, not optional");
    assert.equal(
      manifest.devDependencies["@ai-swiss/base"],
      "file:../..",
      "the workspace link that makes `@ai-swiss/base/docs-model` resolve in a checkout; a devDependency, so it never reaches a consumer",
    );
  });

  it("packs everything the adapter needs to render, and nothing else", () => {
    assert.deepEqual(manifest.files, ["astro.config.mjs", "scripts", "src", "README.md", "LICENSE"]);
  });

  it("keeps the CLI and `npm run` on the same launch path", () => {
    for (const command of ["dev", "build", "preview"]) {
      assert.equal(manifest.scripts[command], `node scripts/base-docs-site.mjs ${command}`);
    }
  });
});
