// Spec coverage: UR-CORE-001
// server: buildModel (ollama vs openai-compatible branches), validateRun (provider/model preflight,
// driven by a stubbed global fetch — never the real network), and runEvaluation end to end against a
// real temp BASE root with a wire-level fake provider (so buildModel + runExperiment + persistence all
// run for real, deterministically and offline).

import assert from "node:assert/strict";
import { cp, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { buildModel, runEvaluation, validateRun } from "../tools/eval/orchestrate.mjs";
import { loadScenarios } from "../tools/eval/store.mjs";

const realFetch = globalThis.fetch;
const realKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  globalThis.fetch = realFetch;
  if (realKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = realKey;
});

describe("orchestrate — buildModel", () => {
  it("builds an Ollama-backed model (openai-compatible wire, no key required)", () => {
    const m = buildModel(true, "llama3.1");
    assert.equal(m.id, "ollama:llama3.1");
    assert.equal(typeof m.complete, "function");
    assert.equal(typeof m.stream, "function");
  });

  it("builds an OpenAI-compatible model when a baseUrl is given (no key required)", () => {
    // No OPENAI_API_KEY needed because orchestrate passes requireApiKey:false alongside a baseUrl.
    delete process.env.OPENAI_API_KEY;
    const m = buildModel(false, "gpt-4o-mini", "https://gateway.internal/v1");
    assert.equal(m.id, "openai-compatible:gpt-4o-mini");
    assert.equal(typeof m.complete, "function");
  });

  it("the OpenAI branch without a baseUrl requires an API key", () => {
    delete process.env.OPENAI_API_KEY;
    assert.throws(() => buildModel(false, "gpt-4o-mini"), /apiKey/i);
  });
});

describe("orchestrate — validateRun (stubbed fetch)", () => {
  const ollamaRole = { useOllama: true, model: "llama3.1" };
  const openaiRole = { useOllama: false, model: "gpt-4o-mini" }; // no baseUrl → needs OPENAI_API_KEY

  it("flags a missing OpenAI API key without any network call", async () => {
    delete process.env.OPENAI_API_KEY;
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      throw new Error("should not be reached");
    };
    const problems = await validateRun({ sut: openaiRole, runner: openaiRole, judge: openaiRole });
    assert.equal(called, false, "must short-circuit before fetching");
    assert.equal(problems.length, 1);
    assert.match(problems[0], /OPENAI_API_KEY is not set/);
  });

  it("reports an unreachable provider when fetch rejects", async () => {
    globalThis.fetch = async () => {
      throw new Error("ECONNREFUSED");
    };
    const problems = await validateRun({ sut: ollamaRole, runner: ollamaRole, judge: ollamaRole });
    assert.equal(problems.length, 1);
    assert.match(problems[0], /cannot reach Ollama/);
    assert.match(problems[0], /ollama serve/);
  });

  it("reports a model that is not installed at a reachable endpoint", async () => {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ data: [{ id: "other-model" }, { id: "mistral:latest" }] }),
    });
    const problems = await validateRun({ sut: ollamaRole, runner: ollamaRole, judge: ollamaRole });
    assert.equal(problems.length, 1);
    assert.match(problems[0], /model "llama3.1" is not available/);
    assert.match(problems[0], /ollama pull llama3.1/);
  });

  it("returns no problems when the model is installed (latest-tag tolerant)", async () => {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ data: [{ id: "llama3.1:latest" }] }), // matches "llama3.1"
    });
    const problems = await validateRun({ sut: ollamaRole, runner: ollamaRole, judge: ollamaRole });
    assert.deepEqual(problems, []);
  });

  it("stays silent when the endpoint is up but lists no models (auth-gated): let the run surface specifics", async () => {
    // res.ok but no `data` array → ids is null → no per-model check, no problem reported.
    globalThis.fetch = async () => ({ ok: true, json: async () => ({}) });
    const problems = await validateRun({ sut: ollamaRole, runner: ollamaRole, judge: ollamaRole });
    assert.deepEqual(problems, []);
  });

  it("treats a non-200 /models response as 'no listable models' (no false model-missing problem)", async () => {
    globalThis.fetch = async () => ({ ok: false, status: 403, json: async () => ({}) });
    const problems = await validateRun({ sut: ollamaRole, runner: ollamaRole, judge: ollamaRole });
    assert.deepEqual(problems, []);
  });

  it("uses the OPENAI_API_KEY auth header and reports an OpenAI model not installed", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    let seenAuth = null;
    globalThis.fetch = async (_url, init) => {
      seenAuth = init?.headers?.authorization ?? null;
      return { ok: true, json: async () => ({ data: [{ id: "gpt-4o" }] }) };
    };
    const problems = await validateRun({ sut: openaiRole, runner: openaiRole, judge: openaiRole });
    assert.equal(seenAuth, "Bearer sk-test");
    assert.equal(problems.length, 1);
    assert.match(problems[0], /model "gpt-4o-mini" is not available/);
    assert.doesNotMatch(problems[0], /ollama pull/); // OpenAI branch: no pull hint
  });
});

// A wire-level fake OpenAI-compatible provider: returns deterministic completions keyed off the role's
// system prompt, so runEvaluation drives the REAL runExperiment + persistence with no network.
function fakeProvider() {
  return async (_url, init = {}) => {
    const body = JSON.parse(init.body ?? "{}");
    const sys = (body.messages ?? []).find((m) => m.role === "system")?.content ?? "";
    let content;
    if (sys.includes("role-playing a USER")) {
      content = JSON.stringify({ message: "Merci, c'est parfait.", status: "satisfied" });
    } else if (sys.includes("EVALUATOR")) {
      content = JSON.stringify({
        outcome: "goal_met",
        failureMode: null,
        severity: null,
        confidence: 0.9,
        evidence: [{ turn: 0, quote: "devis", why: "a répondu" }],
        rationale: "ok",
      });
    } else {
      // The SUT: a plain text reply (no tool calls) ends the turn deterministically.
      content = "Voici votre devis pour 3 jours de conseil.";
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      }),
    };
  };
}

describe("orchestrate — runEvaluation (real code, wire-faked provider)", () => {
  let root;
  let scenariosPath;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-orch-"));
    await cp("exemples/assistant-devis", root, { recursive: true });
    scenariosPath = path.join(root, "scenarios.json");
    const { writeFile } = await import("node:fs/promises");
    await writeFile(
      scenariosPath,
      JSON.stringify([
        { id: "s1", seedInput: "Je veux un devis.", goals: ["Préparer un devis"] },
        { id: "s2", seedInput: "Encore un devis.", goals: ["Préparer un devis"] },
      ]),
    );
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("runs every scenario, persists runs + a report, and returns the totals", async () => {
    globalThis.fetch = fakeProvider();
    const base = { useOllama: false, model: "fake", baseUrl: "http://fake.local/v1" };
    const progress = [];

    const { report, file, total } = await runEvaluation({
      root,
      agentId: "assistant-devis",
      processId: "nouveau-devis",
      scenariosPath,
      roles: { sut: base, runner: base, judge: base },
      stamp: "STAMP",
      maxTurns: 2,
      onProgress: (result, done, totalN) => progress.push([result.scenarioId, done, totalN]),
    });

    assert.equal(total, 2);
    assert.equal(report.total, 2);
    assert.equal(report.outcomes.goal_met, 2);
    assert.equal(progress.length, 2);

    // Report file is named by the stamp under reports/.
    assert.equal(file, path.join(root, ".ai", "experiments", "reports", "report-STAMP.json"));
    // Per-scenario run files were persisted under runs/ (the example tree may carry older runs too;
    // assert our two STAMP runs are present).
    const runs = await readdir(path.join(root, ".ai", "experiments", "runs"));
    assert.ok(runs.includes("s1-STAMP.json"));
    assert.ok(runs.includes("s2-STAMP.json"));

    // Every persisted run carries `limitations` (empty here: no report_limitation call) — the
    // limitation-aggregation seam, wired by the orchestrator.
    const { readFile } = await import("node:fs/promises");
    const persisted = JSON.parse(await readFile(path.join(root, ".ai", "experiments", "runs", "s1-STAMP.json"), "utf8"));
    assert.deepEqual(persisted.limitations, []);
  });

  it("throws when the scenarios source is empty", async () => {
    globalThis.fetch = fakeProvider();
    const { writeFile } = await import("node:fs/promises");
    const empty = path.join(root, "empty.json");
    await writeFile(empty, "[]");
    const base = { useOllama: false, model: "fake", baseUrl: "http://fake.local/v1" };
    await assert.rejects(
      () =>
        runEvaluation({
          root,
          agentId: "assistant-devis",
          processId: "nouveau-devis",
          scenariosPath: empty,
          roles: { sut: base, runner: base, judge: base },
        }),
      /no scenarios found/,
    );
  });

  it("a scenario without seedInput fails clearly (a scenario is a user message)", async () => {
    const { writeFile } = await import("node:fs/promises");
    const f = path.join(root, "bad.json");
    await writeFile(f, JSON.stringify([{ id: "no-msg", goals: ["x"] }]));
    await assert.rejects(() => loadScenarios(f), /seedInput/);
  });
});
