// Spec coverage: UR-CORE-002
// The one user-global config: where the framework lives. Reads are tolerant (missing/corrupt →
// null + reason, never a throw); writes are best-effort (a read-only home returns the manual
// fallback instead of failing). Everything injected — no real home, no real disk.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readUserConfig, USER_CONFIG_VERSION, userConfigPath, writeUserConfig } from "../tools/core/userconfig.mjs";

const HOME = "/home/u";
const CONFIG = userConfigPath(HOME);

function fakeFs(initial = {}) {
  const files = { ...initial };
  return {
    files,
    readFile: async (p) => {
      if (!(p in files)) throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
      return files[p];
    },
    writeFile: async (p, c) => { files[p] = c; },
    mkdir: async () => {},
  };
}

describe("readUserConfig — tolerant by contract", () => {
  it("absent file → null with reason, never a throw", async () => {
    const { readFile } = fakeFs();
    const r = await readUserConfig(HOME, readFile);
    assert.deepEqual(r, { config: null, path: CONFIG, reason: "absent" });
  });

  it("corrupt JSON → null with reason, never a throw", async () => {
    const { readFile } = fakeFs({ [CONFIG]: "{ not json" });
    const r = await readUserConfig(HOME, readFile);
    assert.equal(r.config, null);
    assert.match(r.reason, /illisible/);
  });

  it("valid file → the parsed config", async () => {
    const { readFile } = fakeFs({ [CONFIG]: JSON.stringify({ schema_version: USER_CONFIG_VERSION, framework_dir: "/fw" }) });
    const r = await readUserConfig(HOME, readFile);
    assert.equal(r.config.framework_dir, "/fw");
  });
});

describe("writeUserConfig — best-effort, idempotent", () => {
  it("writes the framework dir and reports changed", async () => {
    const io = fakeFs();
    const r = await writeUserConfig(HOME, "/fw", io);
    assert.deepEqual(r, { ok: true, path: CONFIG, changed: true });
    assert.match(io.files[CONFIG], /"framework_dir": "\/fw"/);
  });

  it("same value twice → no needless rewrite (changed:false), no write call", async () => {
    const io = fakeFs();
    await writeUserConfig(HOME, "/fw", io);
    let writes = 0;
    const wrapped = { ...io, writeFile: async (p, c) => { writes += 1; return io.writeFile(p, c); } };
    const r = await writeUserConfig(HOME, "/fw", wrapped);
    assert.equal(r.changed, false);
    assert.equal(writes, 0); // the value was already there: nothing rewritten
  });

  it("a read-only home never fails: ok:false + the content to write by hand", async () => {
    const io = fakeFs();
    io.writeFile = async () => { throw new Error("EACCES: read-only file system"); };
    const r = await writeUserConfig(HOME, "/fw", io);
    assert.equal(r.ok, false);
    assert.match(r.reason, /EACCES/);
    assert.match(r.content, /"framework_dir": "\/fw"/);
    assert.equal(r.path, CONFIG);
  });
});
