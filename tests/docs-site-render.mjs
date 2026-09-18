// Rendered-interaction checks against a real build: the metadata pills appear under the title, the
// links resolve (view source → repository blob, browse model → explorer), the frontmatter description
// is metadata only (never a visible pre-intro paragraph), and Pagefind builds the search index.
//
// Run via `npm run docs:test` (this file builds the site once). Kept out of the concurrent `npm test`
// glob on purpose: a full astro build inside the parallel unit suite contends for resources and
// flakes. Here it is a single, sequential step.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { before, describe, it } from "node:test";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);
// Where `docs build` writes when no `--out` is given: inside the ROOT, never inside the adapter.
const DIST = path.join(REPO, ".base-docs/static/site");
const PAGE = path.join(DIST, "resources/docs-tutoriel-decouverte-1-faites-le-parler/index.html");
let buildOutput;

before(async () => {
  const { stdout } = await execFileAsync("node", ["tools/base.mjs", "docs", "build"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 600000,
    maxBuffer: 10 * 1024 * 1024,
  });
  buildOutput = stdout;
});

// Spec coverage: FR-CLI-006
// End-to-end: a real `docs build` keeps Astro's stage lines and drops its ~829 per-route lines. The
// build runs ONCE here (sequential, not in the parallel suite) and also populates dist/ for the
// rendered-interaction checks below — so there is no second astro build.
describe("docs build output — stages kept, the per-route lines dropped (FR-CLI-006)", () => {
  it("drops every ├─ route line and the orphan timing lines", () => {
    assert.ok(!buildOutput.includes("├─"), "no per-route tree line leaks through");
    assert.doesNotMatch(buildOutput, /^\s*\(\+\d+m?s\)\s*$/m, "no orphan per-route timing line");
  });

  it("keeps Astro's real stage lines", () => {
    for (const stage of ["Syncing content", "Building search index", "page(s) built"]) {
      assert.match(buildOutput, new RegExp(stage.replace(/[()]/g, "\\$&")), `stage kept: ${stage}`);
    }
  });
});

describe("resource page rendered interactions (built site)", () => {
  let html;

  before(() => {
    assert.ok(existsSync(PAGE), "the shared docs build must render the resource page");
    html = readFileSync(PAGE, "utf8");
  });

  it("shows the metadata pills under the title", () => {
    assert.match(html, /class="bd-pill bd-pill-level"[^>]*>Débutant</);
    assert.match(html, /class="bd-pill bd-pill-role"/);
  });

  it("links «view source» to the repository blob, not an editor scheme that may not resolve", () => {
    assert.match(
      html,
      /href="https:\/\/github\.com\/ai-swiss\/base\/blob\/main\/docs\/tutoriel\/decouverte-1-faites-le-parler\.md"/,
    );
    assert.doesNotMatch(html, /vscode:\/\//);
  });

  it("links «browse the model» to the explorer", () => {
    assert.match(html, /href="\/explorer\/"/);
  });

  it("keeps the frontmatter description as metadata only, never a visible body paragraph", () => {
    assert.match(html, /<meta name="description" content="Ouvrez l/);
    assert.doesNotMatch(html, /<p[^>]*>\s*Ouvrez l['&]/);
  });

  it("generates the Pagefind index, so the search box returns results on the built site", () => {
    assert.ok(existsSync(path.join(DIST, "pagefind")), "dist/pagefind/ must exist for search to work");
  });
});
