// Spec coverage: FR-CLI-005
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  WORKSPACE_FILENAME,
  readWorkspace,
  selectWorkspaceRoot,
  findNearestBaseRoot,
  findNearestWorkspace,
  resolveBaseContext,
} from "../tools/core/roots.mjs";

let tmpDir;
let wsCounter;
beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-roots-test-"));
  wsCounter = 0;
});
afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// Each workspace gets its own directory so distinct fixtures never overwrite each other.
async function writeWorkspace(value) {
  const dir = path.join(tmpDir, `ws${wsCounter++}`);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, WORKSPACE_FILENAME);
  await fs.writeFile(file, typeof value === "string" ? value : JSON.stringify(value), "utf8");
  return file;
}

describe("readWorkspace — validation fails loudly", () => {
  it("brands a missing workspace file", async () => {
    await assert.rejects(() => readWorkspace(path.join(tmpDir, "nope", WORKSPACE_FILENAME)), /not found at:/);
  });

  it("brands invalid JSON", async () => {
    const file = await writeWorkspace("{ not json");
    await assert.rejects(() => readWorkspace(file), /is not valid JSON/);
  });

  it("rejects a non-object / empty-roots document", async () => {
    const arrayDoc = await writeWorkspace("[]");
    const noRoots = await writeWorkspace({});
    const emptyRoots = await writeWorkspace({ roots: [] });
    await assert.rejects(() => readWorkspace(arrayDoc), /must contain a JSON object|non-empty roots/);
    await assert.rejects(() => readWorkspace(noRoots), /non-empty roots array/);
    await assert.rejects(() => readWorkspace(emptyRoots), /non-empty roots array/);
  });

  it("rejects a root without an id or without a path", async () => {
    const noId = await writeWorkspace({ roots: [{ path: "a" }] });
    const noPath = await writeWorkspace({ roots: [{ id: "a" }] });
    await assert.rejects(() => readWorkspace(noId), /must define an id/);
    await assert.rejects(() => readWorkspace(noPath), /must define a path/);
  });

  it("rejects duplicate root ids (after trimming)", async () => {
    const file = await writeWorkspace({ roots: [{ id: "a", path: "x" }, { id: " a ", path: "y" }] });
    await assert.rejects(() => readWorkspace(file), /Duplicate workspace root id: a/);
  });
});

describe("readWorkspace — normalization", () => {
  it("trims ids/paths, resolves paths against the workspace dir, and preserves declaration order", async () => {
    const file = await writeWorkspace({
      roots: [
        { id: " zeta ", path: " projects/z " },
        { id: "alpha", path: "projects/a", label: "Alpha", type: "client" },
      ],
    });
    const dir = path.dirname(file);
    const ws = await readWorkspace(file);
    assert.equal(ws.schema_version, "base.workspace.v1");
    assert.deepEqual(ws.roots.map((r) => r.id), ["zeta", "alpha"]); // declaration order, NOT sorted
    assert.equal(ws.roots[0].path, path.join(dir, "projects/z"));
    assert.equal(ws.roots[1].label, "Alpha");
    assert.equal(ws.roots[1].type, "client");
    assert.equal(ws.roots[0].label, "zeta"); // defaults to id
    assert.equal(ws.roots[0].type, "project"); // default type
  });
});

describe("selectWorkspaceRoot", () => {
  const ws = (roots) => ({ roots });

  it("selects by explicit id", () => {
    assert.equal(selectWorkspaceRoot(ws([{ id: "a", path: "/a" }, { id: "b", path: "/b" }]), "b").id, "b");
  });

  it("throws a helpful error listing available ids for an unknown id", () => {
    assert.throws(
      () => selectWorkspaceRoot(ws([{ id: "a", path: "/a" }, { id: "b", path: "/b" }]), "zzz"),
      /Unknown workspace root "zzz".*a, b/s,
    );
  });

  it("uses the single default:true root when no id is given", () => {
    assert.equal(selectWorkspaceRoot(ws([{ id: "a", path: "/a" }, { id: "b", path: "/b", default: true }])).id, "b");
  });

  it("falls back to the first DECLARED root when no default is marked", () => {
    assert.equal(selectWorkspaceRoot(ws([{ id: "zeta", path: "/z" }, { id: "alpha", path: "/a" }])).id, "zeta");
  });

  it("throws when several roots are marked default", () => {
    assert.throws(
      () => selectWorkspaceRoot(ws([{ id: "a", path: "/a", default: true }, { id: "b", path: "/b", default: true }])),
      /multiple default roots: a, b/,
    );
  });
});

describe("findNearestBaseRoot / findNearestWorkspace / resolveBaseContext", () => {
  it("walks up to the nearest directory carrying a .ai marker", async () => {
    const project = path.join(tmpDir, "p");
    const deep = path.join(project, "a", "b", "c");
    await fs.mkdir(path.join(project, ".ai"), { recursive: true });
    await fs.mkdir(deep, { recursive: true });
    const found = await findNearestBaseRoot(deep);
    assert.equal(path.basename(found), "p"); // stable regardless of /tmp symlink normalization
  });

  it("locates a base.workspace.json walking up", async () => {
    await fs.writeFile(path.join(tmpDir, WORKSPACE_FILENAME), JSON.stringify({ roots: [{ id: "a", path: "." }] }), "utf8");
    const deep = path.join(tmpDir, "x", "y");
    await fs.mkdir(deep, { recursive: true });
    assert.equal(path.basename(await findNearestWorkspace(deep)), WORKSPACE_FILENAME);
  });

  it("resolves an explicit root in 'root' mode", async () => {
    const ctx = await resolveBaseContext({ cwd: tmpDir, explicitRoot: "." });
    assert.equal(ctx.mode, "root");
    assert.equal(ctx.routeAcrossRoots, false);
  });

  it("throws a helpful no-context error when nothing is found", async () => {
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), "base-noctx-"));
    try {
      await assert.rejects(
        () => resolveBaseContext({ cwd: isolated }),
        /No BASE root or workspace found|base validate --root/,
      );
    } finally {
      await fs.rm(isolated, { recursive: true, force: true });
    }
  });
});
