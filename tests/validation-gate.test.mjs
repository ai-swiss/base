// Spec coverage: FR-VALID-001
// The validation gate must be FAIL-CLOSED, not theater: `base validate` exits non-zero on a
// non-conformant resource, so CI (ci.yml runs it on the root) genuinely blocks. This pins the
// exit-code contract a security reviewer relies on — a verifier that never fails is worse than none.

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const cli = path.resolve("tools/base.mjs");
let root;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "valgate-"));
  await mkdir(path.join(root, ".ai", "agents", "good"), { recursive: true });
  await writeFile(
    path.join(root, ".ai", "agents", "good", "AGENT.md"),
    "---\nschema_version: base.resource.v1\nid: good\ntype: agent\ntitle: Good\ndescription: ok\n---\n# Good\n",
  );
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("validation gate is fail-closed", () => {
  it("exits 0 on a conformant root", async () => {
    const { stdout } = await execFileAsync("node", [cli, "validate", "--root", root]);
    assert.match(stdout, /BASE valide/);
  });

  it("exits NON-ZERO on a planted resource that opts into the contract but omits id/type", async () => {
    // schema_version present => the contract applies; id+type missing => must fail.
    await writeFile(path.join(root, "bad.md"), "---\nschema_version: base.resource.v1\ntitle: Bad\n---\n# Bad\n");
    await assert.rejects(
      () => execFileAsync("node", [cli, "validate", "--root", root]),
      (error) => {
        assert.equal(error.code, 1, "validate must exit 1 on a non-conformant resource");
        assert.match(error.stdout + error.stderr, /champ requis manquant|id|type/);
        return true;
      },
    );
  });

  it("the shipped tutorial corpus itself is conformant (no schema_version-without-id pages)", async () => {
    // Guards against re-introducing the 34-error regression: a docs page may not opt into
    // base.resource.v1 without satisfying it. Checked against the real docs/tutoriel corpus.
    const { readdir, readFile } = await import("node:fs/promises");
    const dir = path.resolve("docs/tutoriel");
    for (const name of (await readdir(dir)).filter((n) => n.endsWith(".md"))) {
      const md = await readFile(path.join(dir, name), "utf8");
      const fm = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      if (/^schema_version:/m.test(fm)) {
        assert.match(fm, /^id:/m, `${name}: opts into base.resource.v1 but lacks id`);
        assert.match(fm, /^type:/m, `${name}: opts into base.resource.v1 but lacks type`);
      }
    }
  });
});
