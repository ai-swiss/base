// The local freshness gate for EVERY committed generated projection.
//
// One canonical source (tools/core/bootstrap.mjs and the build projections) is committed at several
// places: the root entry points (CLAUDE.md, AGENTS.md, BASE_BOOTSTRAP.md, the Cursor rule), the tool
// matrix (.ai/tools.md), the routing index tree (.ai/routing/index.md + per-agent index.md), and the
// shape-B example projections (exemples/routage-pme). CI regenerates and diffs the ROOT copies
// (ci.yml); the example copies were gated only for CLAUDE.md/.cursor (exemples-conformity.test.mjs).
// This test closes the local gap: edit the canonical source without regenerating, and it fails HERE,
// before a push — naming the stale file.
//
// Discovery is by PROVENANCE, never by a hand-kept list: a committed file participates iff its head
// carries the machine banner («<!-- Généré par `base build …`» — line 3 in the bootstrap family, after
// the title; line 6 in the Cursor rule, after its frontmatter; line 1 in the index tree), the same
// provenance idea the doctor uses (a hand-personalised surface without the banner opts out; an absent
// file is an opt-in not taken). A floor on the matched count keeps the walk honest: deleting a
// projection cannot silently pass.

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildArtifacts } from "../tools/base-core.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const exemplesDir = path.join(repoRoot, "exemples");

// The full spelled target list: "all" collapses to DEFAULT_BUILD, which deliberately EXCLUDES the
// opt-in routing-index — the very projection whose staleness bites hardest (the map harnesses read).
const TARGETS = ["agents-md", "tools", "bootstrap", "routing-index"];

// The machine banner, in the file's head (first 8 lines: line 1 for the index tree, line 3 for the
// bootstrap family after the title, line 6 for the Cursor rule after its frontmatter).
const BANNER = /^<!-- Généré par `base build/;

async function bannered(file) {
  try {
    const content = await fs.readFile(file, "utf8");
    const head = content.split("\n", 8);
    return head.some((line) => BANNER.test(line)) ? content : null;
  } catch {
    return null; // absent → the opt-in was not taken for this root
  }
}

async function candidateRoots() {
  const roots = [repoRoot];
  for (const entry of (await fs.readdir(exemplesDir, { withFileTypes: true })).filter((e) => e.isDirectory())) {
    const root = path.join(exemplesDir, entry.name);
    roots.push(root);
    // Workspace examples nest real BASE roots one level down (clients/<name>).
    const clientsDir = path.join(root, "clients");
    try {
      for (const client of (await fs.readdir(clientsDir, { withFileTypes: true })).filter((e) => e.isDirectory())) {
        roots.push(path.join(clientsDir, client.name));
      }
    } catch {
      // no clients/ — a plain example root
    }
  }
  return roots;
}

describe("projections freshness — every committed banner-carrying file equals its in-memory render", () => {
  it("regenerates each root and diffs the committed projections (provenance-scoped walk)", async () => {
    const stale = [];
    let matched = 0;
    for (const root of await candidateRoots()) {
      let artifacts;
      try {
        artifacts = await buildArtifacts(root, { targets: TARGETS });
      } catch {
        continue; // not a BASE root (no inventory) — nothing generated to gate
      }
      for (const artifact of artifacts) {
        const committed = await bannered(path.join(root, artifact.path));
        if (committed === null) continue; // absent or hand-personalised (no banner) — opted out
        matched++;
        if (committed !== artifact.content) {
          stale.push(path.relative(repoRoot, path.join(root, artifact.path)));
        }
      }
    }
    assert.deepEqual(
      stale,
      [],
      `stale generated projection(s) — regenerate with \`base build --write\` (bootstrap/tools/agents-md) or \`base build routing-index --write\` at the owning root: ${stale.join(", ")}`,
    );
    // The floor that keeps the walk honest: the root commits 9 projections (4 bootstrap-family +
    // tools.md + the 4-file routing-index tree given 3 agents) and routage-pme commits 2. Deleting
    // one would otherwise shrink the walk silently.
    assert.ok(matched >= 11, `expected ≥ 11 gated projections across the repo, matched only ${matched}`);
  });
});
