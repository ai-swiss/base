// Spec coverage: FR-SCALE-004
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const bin = fileURLToPath(new URL("../bin/base-index-local.mjs", import.meta.url));
let dir;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-index-cli-"));
  await fs.mkdir(path.join(dir, ".ai/agents/sales/skills/processes/devis"), { recursive: true });
  await fs.writeFile(
    path.join(dir, ".ai/agents/sales/AGENT.md"),
    "---\nid: sales\ntype: agent\ndescription: Ventes.\n---\n# Ventes\n",
  );
  await fs.writeFile(
    path.join(dir, ".ai/agents/sales/skills/processes/devis/SKILL.md"),
    "---\nid: nouveau-devis\ntype: process\ndescription: Créer un devis client.\nuse_when: Quand l'utilisateur veut créer un devis.\n---\n# Devis\n",
  );
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("base-index-local CLI", () => {
  it("does not include flag values in the route request", async () => {
    const indexPath = path.join(dir, "devis-index.json");
    await execFileAsync("node", [bin, "build", dir, "--out", indexPath]);

    const { stdout } = await execFileAsync("node", [bin, "route", dir, "zzqq", "--index", indexPath]);
    const routed = JSON.parse(stdout);

    assert.equal(routed.status, "out_of_scope");
  });
});
