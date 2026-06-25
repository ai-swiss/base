// The guardrails must BITE. We mostly test the happy path; this suite plants deliberately broken
// corpora and asserts that validate / route-test / doctor FAIL with a non-zero exit. A gate that
// never fails is theater. (No literal requirement-id strings here on purpose: the matrix citation
// scanner would read them as proof links.)

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

const agentFile = (id, body = "") =>
  `---\nschema_version: base.resource.v1\nid: ${id}\ntype: agent\ntitle: ${id}\ndescription: ok\n---\n# ${id}\n${body}`;

async function writeAgent(id, body = "") {
  await mkdir(path.join(root, ".ai", "agents", id), { recursive: true });
  await writeFile(path.join(root, ".ai", "agents", id, "AGENT.md"), agentFile(id, body));
}

async function expectFail(args, check) {
  await assert.rejects(
    () => execFileAsync("node", [cli, ...args, "--root", root]),
    (error) => {
      assert.equal(error.code, 1, `${args.join(" ")} must exit 1 on a broken corpus`);
      check(error.stdout + error.stderr);
      return true;
    },
  );
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "neg-"));
  await writeAgent("alpha");
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("negative fixtures — the guardrails fail closed", () => {
  it("validate exits 1 on a duplicate id", async () => {
    // a second resource reusing alpha's id
    await mkdir(path.join(root, ".ai", "agents", "beta"), { recursive: true });
    await writeFile(path.join(root, ".ai", "agents", "beta", "AGENT.md"), agentFile("alpha"));
    await expectFail(["validate"], (out) => assert.match(out, /Erreur/i));
  });

  it("validate exits 1 on a dead internal link", async () => {
    await writeAgent("gamma", "\nSee [missing](docs/does-not-exist.md).\n");
    await expectFail(["validate"], (out) => assert.match(out, /Erreur/i));
  });

  it("route-test exits 1 when a fixture's expected route does not hold", async () => {
    await mkdir(path.join(root, ".ai", "routing"), { recursive: true });
    await writeFile(
      path.join(root, ".ai", "routing", "route-tests.json"),
      JSON.stringify([{ request: "totally unrelated xyz", expect: { status: "routed", agent: "impossible", process: "nope" } }]),
    );
    await expectFail(["route-test"], (out) => assert.match(out, /attendu|obtenu|impossible/i));
  });

  it("doctor exits 1 on a dead internal link", async () => {
    await writeAgent("delta", "\nSee [broken](specs/gone.md).\n");
    await expectFail(["doctor"], (out) => assert.match(out, /dead_link/));
  });
});
