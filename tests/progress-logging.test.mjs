// Spec coverage: FR-CLI-006
// Progress logging at the right level — which stage, roughly how far; never noise, never silence.
// Every case asserts BOTH halves: the progress is on STDERR (and silent when it should be), AND the
// RESULT stream (stdout) stays clean. The one convention is `reportProgress`; these tests pin it pure,
// then pin each wiring (the Ollama eval legs, the embedding precompute, validate, the Studio launch,
// the docs build) through the seam each exposes.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { reportProgress } from "../tools/core/progress.mjs";
import { precomputeRoutingVectors } from "../tools/core/routing-vectors.mjs";
import { validateBase } from "../tools/base-core.mjs";
import { runOllamaEval } from "../tools/eval/route-eval-ollama.mjs";
import { filterAstroBuildOutput } from "../packages/base-docs-site/scripts/build.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

// A stand-in for a write stream: the helper touches only `.isTTY` and `.write`, so this is enough to
// drive both branches without a real terminal.
function fakeStream(isTTY) {
  const writes = [];
  return { isTTY, write: (s) => writes.push(s), writes, text: () => writes.join("") };
}

// --- the helper: the one convention ------------------------------------------------------------

describe("reportProgress — the one progress convention", () => {
  it("is silent on a pipe unless BASE_PROGRESS is set (a pipe/CI stays clean)", () => {
    const piped = fakeStream(false);
    reportProgress("recall", { stream: piped, env: {} })(1, 3);
    assert.equal(piped.text(), "", "no BASE_PROGRESS, no TTY → nothing written");

    const opted = fakeStream(false);
    reportProgress("recall", { stream: opted, env: { BASE_PROGRESS: "1" } })(1, 3, "q1");
    assert.equal(opted.text(), "[1/3] recall · q1\n", "piped-and-opted-in → one plain line per step");
  });

  it("rewrites in place on a TTY and terminates the line when done", () => {
    const tty = fakeStream(true);
    const report = reportProgress("embedding", { stream: tty, env: {} });
    report(1, 2, "a");
    report(2, 2, "b");
    assert.equal(tty.writes[0], "\r[1/2] embedding · a\x1b[K", "mid-progress rewrites, no newline");
    assert.equal(tty.writes[1], "\r[2/2] embedding · b\x1b[K\n", "the final tick ends the line");
  });

  it("omits the label separator when no label is given", () => {
    const tty = fakeStream(true);
    reportProgress("validating", { stream: tty })(5, 10);
    assert.equal(tty.writes[0], "\r[5/10] validating\x1b[K", "no ` · ` when label is absent");
  });
});

// Capture process.stderr while a body runs, with BASE_PROGRESS forced on (so the piped-test sees the
// per-step lines the wiring writes through its own internal reportProgress).
async function captureStderr(body) {
  const original = process.stderr.write.bind(process.stderr);
  const chunks = [];
  const had = process.env.BASE_PROGRESS;
  process.env.BASE_PROGRESS = "1";
  process.stderr.write = (chunk) => {
    chunks.push(typeof chunk === "string" ? chunk : chunk.toString());
    return true;
  };
  try {
    const result = await body();
    return { result, stderr: chunks.join("") };
  } finally {
    process.stderr.write = original;
    if (had === undefined) delete process.env.BASE_PROGRESS;
    else process.env.BASE_PROGRESS = had;
  }
}

// --- A1: the Ollama eval's three legs, plus the embedder-pull line --------------------------------

describe("runOllamaEval — progress over the three legs, report clean", () => {
  // A 3-case golden, all `route` so recall and route-eval both see exactly 3 (clean [1/3][2/3][3/3]).
  const golden = {
    cases: [
      { query: "q1", category: "clear_hit", outcome: "route", agent: "commercial", process: "nouveau-devis" },
      { query: "q2", category: "clear_hit", outcome: "route", agent: "commercial", process: "nouveau-devis" },
      { query: "q3", category: "clear_hit", outcome: "route", agent: "commercial", process: "nouveau-devis" },
    ],
  };
  const corpusRoot = path.join(ROOT, "exemples/routage-pme");
  // Deterministic, model-free: [length, word count]. The recall leg embeds for real over the corpus;
  // the agent/refiner legs are stubbed routes (we assert wiring, not model quality).
  const stubEmbed = async (text) => [text.length, text.split(/\s+/).filter(Boolean).length];
  const decision = { status: "abstain", reason_code: "stub", agent: null, process: null, candidates: [], explanation: "", next_question: null };
  const stubRoute = async () => /** @type {any} */ (decision);

  it("reports the embedder pull + [k/3] for each leg on stderr; the rendered report stays on stdout", async () => {
    const lines = [];
    // A progress factory that records each rendered line, decoupled from a real stream.
    const progress = (stage) => (done, total, label) => lines.push(`[${done}/${total}] ${stage}${label ? ` · ${label}` : ""}`);
    const run = await runOllamaEval(corpusRoot, golden, {
      progress,
      makeEmbedder: () => stubEmbed,
      makeAgentRoute: async () => stubRoute,
      makeRefinerRoute: async () => stubRoute,
    });

    // Progress present: the embedder pull, then [1/3][2/3][3/3] for each of recall, agent, refiner.
    assert.ok(lines.some((l) => l.startsWith("[1/1] embedder · ")), "the slow embedder pull is announced");
    for (const stage of ["recall", "agent", "refiner"]) {
      assert.deepEqual(
        lines.filter((l) => l.includes(`] ${stage}`)),
        [`[1/3] ${stage}`, `[2/3] ${stage}`, `[3/3] ${stage}`],
        `${stage} ticks once per case, 1..3`,
      );
    }
    // Result clean: the rendered block is the report only, with no progress brackets leaking in.
    assert.ok(run.text.includes("recall@k"), "the report is the real rendered block");
    assert.ok(!/\[\d+\/\d+\] (recall|agent|refiner|embedder)/.test(run.text), "no progress line leaked into the report");
  });
});

// --- A2: the embedding precompute --------------------------------------------------------------

describe("precomputeRoutingVectors — per-embed progress, silent when piped", () => {
  const resources = [
    { type: "process", path: "a/SKILL.md", use_when: "facturer un client", keywords: [], body: "" },
    { type: "process", path: "b/SKILL.md", use_when: "relancer un impayé", keywords: [], body: "" },
  ];
  const stubEmbed = async (text) => [text.length];

  it("calls onProgress [k/N] once per embedded resource", async () => {
    const ticks = [];
    await precomputeRoutingVectors(resources, stubEmbed, { onProgress: (d, t, label) => ticks.push([d, t, label]) });
    assert.equal(ticks.length, 2, "one tick per embeddable resource");
    assert.deepEqual(ticks.map(([d, t]) => `${d}/${t}`), ["1/2", "2/2"], "the count climbs to N");
  });

  it("is silent on a pipe with BASE_PROGRESS unset (the cache build stays clean)", async () => {
    const piped = fakeStream(false);
    const onProgress = reportProgress("embedding", { stream: piped, env: {} });
    await precomputeRoutingVectors(resources, stubEmbed, { onProgress });
    assert.equal(piped.text(), "", "no TTY, no BASE_PROGRESS → no progress noise");
  });
});

// --- A3: validate — stage line always, counter only above the threshold --------------------------

async function makeCorpus(count) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-progress-"));
  for (let i = 0; i < count; i++) await fs.writeFile(path.join(dir, `doc-${i}.md`), `# Doc ${i}\n\nContenu.\n`, "utf8");
  return dir;
}

describe("validateBase — one stage line always, [i/N] counter only above ~300", () => {
  it("a small corpus gets the announce line and NO per-resource counter (a counter would be noise)", async () => {
    const dir = await makeCorpus(5);
    try {
      const { stderr } = await captureStderr(() => validateBase(dir));
      assert.match(stderr, /\[1\/1\] validating · 5 resources/, "the announce line names the size");
      assert.ok(!/\[1\/5\] validating\b/.test(stderr.replace("· 5 resources", "")), "no per-resource counter below the threshold");
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it("a >300-resource corpus also emits the per-resource [i/N] counter", async () => {
    const dir = await makeCorpus(301);
    try {
      const { stderr } = await captureStderr(() => validateBase(dir));
      assert.match(stderr, /\[1\/1\] validating · 301 resources/, "the announce line still leads");
      assert.match(stderr, /\[1\/301\] validating/, "the counter starts at 1");
      assert.match(stderr, /\[301\/301\] validating/, "the counter reaches N");
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});

// --- A4: the Studio launch -----------------------------------------------------------------------

// Spawn the standalone server, wait for the ready line on stdout, collect stderr until then.
function spawnUntil(args, { readyRe, env = {}, cwd = ROOT, timeoutMs = 20_000 }) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env } });
    let out = "";
    let err = "";
    const done = (fn) => (v) => {
      clearTimeout(timer);
      try { child.kill("SIGKILL"); } catch {}
      fn(v);
    };
    const ok = done(resolve);
    const fail = done(reject);
    const timer = setTimeout(() => fail(new Error(`timeout; stdout=${out} stderr=${err}`)), timeoutMs);
    child.stdout.on("data", (d) => {
      out += d;
      if (readyRe.test(out)) ok({ stdout: out, stderr: err });
    });
    child.stderr.on("data", (d) => { err += d; });
    child.on("error", fail);
  });
}

describe("startStudioServer (standalone) — two stage lines on stderr before ready", () => {
  it("prints `resolving context` then `binding` before the API-ready line", async () => {
    // A high random port (the CLI maps 0 to the default; an explicit free-ish port keeps the test
    // independent of whatever else is listening), so the bind line carries a known value.
    const port = String(40000 + Math.floor(Math.random() * 20000));
    const { stdout, stderr } = await spawnUntil(
      [path.join(ROOT, "tools/studio/server.mjs"), "--root", ".", "--port", port],
      { readyRe: /BASE Studio API on/, env: { BASE_PROGRESS: "1" } },
    );
    assert.match(stderr, /\[1\/1\] resolving context · \./, "context resolution is announced");
    assert.match(stderr, new RegExp(`\\[1/1\\] binding · 127\\.0\\.0\\.1:${port}`), "the bind is announced with the host:port");
    assert.ok(stderr.indexOf("resolving context") < stderr.indexOf("binding"), "resolve precedes bind");
    assert.doesNotMatch(stdout, /\[1\/1\] (resolving context|binding)/, "stage lines never land on stdout");
  });
});

// --- B1: docs build — stage lines kept, per-route lines dropped ----------------------------------
// The filter that does it is pinned here, line by line (fast, model-/build-free). The end-to-end
// proof over a REAL astro build lives in tests/docs-site-render.mjs, where the build runs once and
// sequentially (a second astro build inside this parallel suite flakes — see that file's note).

describe("filterAstroBuildOutput — drops the per-route lines, keeps the real stages", () => {
  // A faithful slice of an astro build: stages around a tree of per-route lines (one with a wrapped
  // timing line, as the 404 entry produces).
  const sample = [
    "19:30:32 [content] Syncing content",
    " generating static routes ",
    "19:30:33   ├─ /404.htmlEntry docs → 404 was not found.",
    " (+9ms) ",
    "19:30:33   ├─ /concepts/index.html (+11ms) ",
    "19:30:33   ├─ /index.html (+2ms) ",
    "19:30:39 [starlight:pagefind] Building search index with Pagefind...",
    "19:30:40 [build] 829 page(s) built in 7.93s",
    "19:30:40 [build] Complete!",
  ].join("\n");

  it("removes every ├─ route line and the orphan (+Nms) timing line", () => {
    const out = filterAstroBuildOutput(sample);
    assert.ok(!out.includes("├─"), "no per-route tree line survives");
    assert.doesNotMatch(out, /^\s*\(\+\d+m?s\)\s*$/m, "no orphan per-route timing line survives");
  });

  it("keeps the real stage lines verbatim", () => {
    const out = filterAstroBuildOutput(sample);
    for (const stage of ["Syncing content", "generating static routes", "Building search index", "page(s) built", "Complete!"]) {
      assert.ok(out.includes(stage), `stage kept: ${stage}`);
    }
  });
});
