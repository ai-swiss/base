// Spec coverage: FR-BUILD-002 FR-DOCS-001 FR-DOCS-002 FR-DOCS-004
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, it } from "node:test";
import { buildDocsModel, validateDocsModel, writeDocsModel } from "../tools/docs/model.mjs";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(repoRoot, "tools", "base.mjs");
let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-docs-test-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function write(relativePath, content) {
  const fullPath = path.join(tmpDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf8");
}

function paths(model) {
  return model.resources.map((resource) => resource.path).sort();
}

describe("docs model", () => {
  it("flags a broken #anchor (cross-page and same-page), accepts a valid one", async () => {
    await write("docs/guides/a.md", "---\ntitle: A\nsensitivity: public\n---\n# A\n\n## Une section\n\nVoir [B](b.md#sa-section), [interne](#une-section), [cassé](b.md#nope), [cassé local](#absent).\n");
    await write("docs/guides/b.md", "---\ntitle: B\nsensitivity: public\n---\n# B\n\n## Sa section\n");
    const model = await buildDocsModel(tmpDir);
    const anchors = model.errors.filter((e) => e.code === "base.docs.broken_anchor").map((e) => e.message);
    assert.equal(anchors.length, 2, `expected exactly the two bad anchors, got:\n${anchors.join("\n")}`);
    assert.ok(anchors.some((m) => m.includes("#nope")), "a cross-page anchor with no matching heading is flagged");
    assert.ok(anchors.some((m) => m.includes("#absent")), "a same-page anchor with no matching heading is flagged");
  });

  it("models docs, specs, examples and operational files while excluding private workspaces", async () => {
    await write("README.md", "# Demo\n\nFront door.");
    await write("docs/start/quickstart.md", "---\ntitle: Quickstart\nsensitivity: public\n---\n# Quickstart\n");
    await write("specs/current/10_core/docs.md", "# Docs Spec\n");
    await write("exemples/demo/README.md", "# Example\n");
    await write("exemples/demo/.ai/routing/route-tests.json", JSON.stringify([
      { request: "demo route", expect: { status: "routed", agent: "demo", process: "start" } },
    ]));
    await write(".ai/agents/demo/AGENT.md", "---\nid: demo\ntype: agent\n---\n# Agent\n");
    await write(".plans/private.md", "# Private plan\n");
    await write(".temp/private.md", "# Private temp\n");

    const model = await buildDocsModel(tmpDir);

    assert.deepEqual(paths(model), [
      ".ai/agents/demo/AGENT.md",
      "README.md",
      "docs/start/quickstart.md",
      "exemples/demo/.ai/routing/route-tests.json",
      "exemples/demo/README.md",
      "specs/current/10_core/docs.md",
    ]);
    assert.deepEqual(model.route_fixtures.map(({ actual, ...fixture }) => fixture), [
      {
        id: "exemples-demo-ai-routing-route-tests-1",
        root: "exemples/demo",
        source_path: "exemples/demo/.ai/routing/route-tests.json",
        request: "demo route",
        expect: { status: "routed", agent: "demo", process: "start" },
      },
    ]);
    assert.equal(typeof model.route_fixtures[0].actual.status, "string");
    assert.equal(model.families.find((family) => family.id === ".plans").included_in_docs_model, false);
    assert.equal(model.families.find((family) => family.id === ".temp").included_in_docs_model, false);
    assert.equal(model.errors.length, 0);
  });

  it("errors when two source paths collide on the same path-derived id (slug)", async () => {
    // slugifyPath collapses every non-alphanumeric run to "-", so these distinct paths both become
    // the id "docs-guide-a". Unguarded, the collision would make two pages share one route and
    // silently drop one; the model must surface it as an error instead.
    await write("docs/guide-a.md", "---\ntitle: A\nsensitivity: public\n---\n# A\n");
    await write("docs/guide/a.md", "---\ntitle: B\nsensitivity: public\n---\n# B\n");

    const model = await buildDocsModel(tmpDir, { target: "public" });
    const collisions = model.errors.filter((e) => e.code === "base.docs.duplicate_id");
    assert.equal(collisions.length, 1, `expected one duplicate_id error, got ${JSON.stringify(model.errors)}`);
  });

  it("adds backlinks and real route results to the docs model", async () => {
    await write("README.md", "# Demo\n\nSee [Quickstart](docs/start/quickstart.md).");
    await write("docs/start/quickstart.md", "# Quickstart\n\nStart here.");
    await write("exemples/demo/.ai/agents/sales/AGENT.md", "---\nid: sales\ntype: agent\ndescription: Gère les ventes et les devis clients.\n---\n# Sales\n");
    await write("exemples/demo/.ai/agents/sales/skills/processes/devis/SKILL.md", "---\nid: nouveau-devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis pour un client.\n---\n# Devis\n");
    await write("exemples/demo/.ai/routing/route-tests.json", JSON.stringify([
      { request: "créer un devis pour un client", expect: { status: "routed", agent: "sales", process: "nouveau-devis" } },
    ]));

    const model = await buildDocsModel(tmpDir);
    const quickstart = model.resources.find((resource) => resource.path === "docs/start/quickstart.md");

    assert.deepEqual(quickstart.incoming_links, [{ source_id: "readme", source_path: "README.md", label: "Quickstart" }]);
    assert.equal(model.route_fixtures[0].actual.status, "routed");
    assert.equal(model.route_fixtures[0].actual.agent.id, "sales");
    assert.equal(model.route_fixtures[0].actual.process.id, "nouveau-devis");

    const publicModel = await buildDocsModel(tmpDir, { target: "public" });
    assert.equal(publicModel.route_fixtures[0].actual.agent.path, null);
    assert.equal(publicModel.route_fixtures[0].actual.process.path, null);
  });

  it("classifies promoted design decisions as decisions", async () => {
    await write("README.md", "# Demo\n\nFront door.");
    await write("decisions/0001-docs.md", "# Docs Decision\n\nAccepted.");

    const model = await buildDocsModel(tmpDir);
    const decision = model.resources.find((resource) => resource.path === "decisions/0001-docs.md");

    assert.equal(decision.doc_role, "decision");
    assert.equal(model.navigation.sections.find((section) => section.id === "reference").items.some((item) => item.id === decision.id), true);
  });

  it("public target keeps public resources and excludes internal operational resources", async () => {
    await write("README.md", "# Demo\n\nFront door.");
    await write("docs/public.md", "---\ntitle: Public\nsensitivity: public\n---\n# Public\n");
    await write("exemples/demo/.ai/routing/route-tests.json", JSON.stringify([
      { request: "public route", expect: { status: "routed", agent: "demo", process: "start" } },
    ]));
    await write(".ai/agents/demo/AGENT.md", "---\nid: demo\ntype: agent\nsensitivity: internal\n---\n# Agent\n");

    const model = await buildDocsModel(tmpDir, { target: "public" });

    assert.deepEqual(paths(model), ["README.md", "docs/public.md", "exemples/demo/.ai/routing/route-tests.json"]);
    assert.equal(model.resources.every((resource) => resource.sensitivity === "public"), true);
    assert.equal(model.route_fixtures.length, 1);
    assert.equal(model.errors.length, 0);
  });

  it("is deterministic and writes the model projections", async () => {
    await write("README.md", "# Demo\n\nFront door.");
    await write("docs/a.md", "# A\n");
    await write("docs/b.md", "# B\n");

    const first = await buildDocsModel(tmpDir);
    const second = await buildDocsModel(tmpDir);
    assert.deepEqual(first, second);

    const { outputDir, model } = await writeDocsModel(tmpDir);
    assert.equal(model.schema_version, "base.docs_model.v1");
    assert.equal(await fs.stat(path.join(outputDir, "model.json")).then((stat) => stat.isFile()), true);
    assert.equal(await fs.stat(path.join(outputDir, "graph.json")).then((stat) => stat.isFile()), true);
    assert.equal(await fs.stat(path.join(outputDir, "navigation.json")).then((stat) => stat.isFile()), true);
    assert.equal(await fs.stat(path.join(outputDir, "search.json")).then((stat) => stat.isFile()), true);
    assert.equal(await fs.stat(path.join(outputDir, "route-fixtures.json")).then((stat) => stat.isFile()), true);
    assert.equal(await fs.stat(path.join(outputDir, "warnings.json")).then((stat) => stat.isFile()), true);
  });

  it("fails the model on a broken internal link (it is an error, not a warning)", async () => {
    await write("README.md", "# Demo\n\nSee [missing](missing.md).");
    const result = await validateDocsModel(tmpDir);

    assert.equal(result.ok, false, "a broken link fails the model so the on-PR docs gate blocks it");
    assert.equal(result.errors.some((error) => error.code === "base.docs.broken_link"), true);
    assert.equal(result.warnings.some((warning) => warning.code === "base.docs.broken_link"), false);
  });

  it("does not scan JSON resources for Markdown links (no phantom broken link from the manifest)", async () => {
    await write("README.md", "# Demo\n\nFront door.");
    await write("base.manifest.json", JSON.stringify({ schema_version: "base.manifest.v1", root_name: "demo", resources: [{ id: "x", description: "see [guide](../elsewhere/guide.md)" }] }));
    const result = await validateDocsModel(tmpDir);

    assert.equal(result.errors.some((error) => error.code === "base.docs.broken_link"), false, "a relative link quoted inside JSON is not a Markdown link");
  });

  it("exposes base docs model through the CLI", async () => {
    await write("README.md", "# Demo\n\nFront door.");
    await write("docs/start/quickstart.md", "# Quickstart\n");

    const { stdout } = await execFileAsync("node", [cliPath, "docs", "model", "--root", tmpDir]);

    assert.match(stdout, /Documentation model: local/);
    assert.match(stdout, /Resources:/);
    assert.equal(await fs.stat(path.join(tmpDir, ".base-docs", "local", "model.json")).then((stat) => stat.isFile()), true);
  });

  // The docs site is an optional package with its own engine floor: Astro requires Node >= 22.12,
  // while the core supports >= 18. Below that floor the build cannot run; skip honestly instead of
  // failing the zero-dependency core suite on a constraint that belongs to the optional layer.
  const [nodeMajor, nodeMinor] = process.versions.node.split(".").map(Number);
  const astroSupported = nodeMajor > 22 || (nodeMajor === 22 && nodeMinor >= 12);

  it(
    "builds a deployable public docs site into --out",
    { skip: astroSupported ? false : "Astro (base-docs-site) requires Node >= 22.12" },
    async () => {
      const deployDir = path.join(tmpDir, "public-site");
      const { stdout } = await execFileAsync("node", [cliPath, "docs", "build", "--public", "--root", repoRoot, "--out", deployDir]);

      assert.match(stdout, /Site output:/);
      assert.equal(await fs.stat(path.join(deployDir, "index.html")).then((stat) => stat.isFile()), true);
      assert.equal(await fs.stat(path.join(deployDir, "concepts", "index.html")).then((stat) => stat.isFile()), true);
      assert.equal(await fs.stat(path.join(deployDir, "evidence", "index.html")).then((stat) => stat.isFile()), true);
      assert.equal(await fs.stat(path.join(deployDir, "examples", "index.html")).then((stat) => stat.isFile()), true);
      assert.equal(await fs.stat(path.join(deployDir, "explorer", "index.html")).then((stat) => stat.isFile()), true);
      assert.equal(await fs.stat(path.join(deployDir, "quality", "index.html")).then((stat) => stat.isFile()), true);

      // Bilingual chrome: the English locale is a full route tree, not a stub.
      assert.equal(await fs.stat(path.join(deployDir, "en", "index.html")).then((stat) => stat.isFile()), true);
      assert.equal(await fs.stat(path.join(deployDir, "en", "learn", "index.html")).then((stat) => stat.isFile()), true);

      // Resource page contract (FR-DOCS-004): canonical content rendered with heading anchors,
      // internal links rewritten to resource pages, metadata in a collapsible panel after content.
      const readmePage = await fs.readFile(path.join(deployDir, "resources", "readme", "index.html"), "utf8");
      assert.match(readmePage, /<h2 id="[a-z0-9-]+">/);
      assert.match(readmePage, /href="\/resources\/[a-z0-9-]+\/"/);
      const aboutPanel = readmePage.indexOf('<details class="bd-about"');
      const firstContentHeading = readmePage.search(/<h2 id="[a-z0-9-]+">/);
      assert.equal(aboutPanel > firstContentHeading && firstContentHeading >= 0, true, "metadata panel must follow the rendered content");
    },
  );
});
