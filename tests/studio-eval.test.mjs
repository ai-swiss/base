// Spec coverage: UR-CORE-001 FR-STUDIO-003
// failure capture — exercised with an injected fake run so no real provider is needed.

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { evalStatus, startEvaluation } from "../tools/studio/eval.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const okValidate = async () => [];
const fauxResolve = async (_dir, ref) => ({ id: `faux:${ref}`, complete: async () => ({}) });
const cfg = { agentId: "a", processId: "p", userModel: "prov/m" };
const deps = (over = {}) => ({ validate: okValidate, resolve: fauxResolve, ...over });

describe("studio eval — run lifecycle", () => {
  let root;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-studio-eval-"));
    await mkdir(path.join(root, ".ai", "experiments", "scenarios"), { recursive: true });
  });

  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("rejects when agentId/processId or the userModel ref is missing", async () => {
    await assert.rejects(() => startEvaluation(root, { userModel: "prov/m" }, deps()), /au moins un process/);
    await assert.rejects(() => startEvaluation(root, { agentId: "a", processId: "p" }, deps()), /utilisateur simulé/);
  });

  it("returns 400 with the problems list when validation fails", async () => {
    const validate = async () => ['judge: model "x" is not available'];
    await assert.rejects(
      () => startEvaluation(root, cfg, deps({ validate, run: async () => {} })),
      (e) => e.code === "BAD_REQUEST" && Array.isArray(e.details?.problems) && e.details.problems.length === 1,
    );
  });

  it("runs one at a time (409 while a run is in flight) and clears when it finishes", async () => {
    let release;
    const gate = new Promise((r) => (release = r));
    const run = async () => gate; // stays pending until released

    const started = await startEvaluation(root, cfg, deps({ run }));
    assert.deepEqual(started, { started: true });
    assert.equal(evalStatus().running, true);

    await assert.rejects(() => startEvaluation(root, cfg, deps({ run })), (e) => e.code === "CONFLICT");

    release();
    await tick();
    assert.equal(evalStatus().running, false);
  });

  it("tracks progress via onProgress", async () => {
    const run = async ({ onProgress }) => {
      onProgress(null, 1, 2);
      onProgress(null, 2, 2);
    };
    await startEvaluation(root, cfg, deps({ run }));
    await tick();
    const s = evalStatus();
    assert.equal(s.running, false);
    assert.equal(s.done, 2);
    assert.equal(s.total, 2);
  });

  it("captures a run failure into the status (does not throw to the caller)", async () => {
    const run = async () => {
      throw new Error("boom");
    };
    await startEvaluation(root, cfg, deps({ run })); // returns { started: true }
    await tick();
    const s = evalStatus();
    assert.equal(s.running, false);
    assert.match(s.error, /boom/);
  });

  it("runs a batch of processes in sequence (the server-side queue)", async () => {
    const seen = [];
    const run = async ({ processId, onProgress }) => {
      seen.push(processId);
      onProgress(null, 1, 1);
    };
    const started = await startEvaluation(root, { agentId: "a", processIds: ["p1", "p2"], userModel: "prov/m" }, deps({ run }));
    assert.deepEqual(started, { started: true });
    await tick();
    await tick();
    assert.deepEqual(seen, ["p1", "p2"]); // both ran, in order, one after the other
    const s = evalStatus();
    assert.equal(s.running, false);
    assert.equal(s.batchCount, 2);
  });

  it("queues (agent, process) targets across agents, each run under its own agent", async () => {
    const seen = [];
    const run = async ({ agentId, processId, onProgress }) => {
      seen.push(`${agentId}/${processId}`);
      onProgress(null, 1, 1);
    };
    const started = await startEvaluation(
      root,
      { targets: [{ agentId: "a1", processId: "p1" }, { agentId: "a2", processId: "p2" }], userModel: "prov/m" },
      deps({ run }),
    );
    assert.deepEqual(started, { started: true });
    await tick();
    await tick();
    assert.deepEqual(seen, ["a1/p1", "a2/p2"]); // each target ran under its OWN agent, in order
    assert.equal(evalStatus().batchCount, 2);
  });
});
