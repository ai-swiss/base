// Spec coverage: UR-CORE-001 FR-INIT-005 RC-INIT-002 FR-STUDIO-001 FR-STUDIO-004 FR-STUDIO-005

import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { resolveStudioContext } from "../tools/studio/api.mjs";
import { createStudioServer, crossOriginError, isLoopbackHost, remoteExposureError, startStudioServer } from "../tools/studio/server.mjs";

const EX = "exemples/assistant-devis";
const WS = "exemples/agence-multi-clients";

const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

describe("studio server — loopback enforcement", () => {
  it("recognises loopback hosts", () => {
    for (const h of ["127.0.0.1", "::1", "localhost", "LOCALHOST", "::ffff:127.0.0.1"]) assert.equal(isLoopbackHost(h), true);
    for (const h of ["0.0.0.0", "192.168.1.10", "example.com"]) assert.equal(isLoopbackHost(h), false);
  });

  it("allows loopback, refuses non-loopback unless explicitly overridden", () => {
    assert.equal(remoteExposureError("127.0.0.1", {}), null);
    assert.equal(remoteExposureError("localhost", {}), null);
    assert.match(remoteExposureError("0.0.0.0", {}), /Refusing to bind non-loopback/);
    assert.match(remoteExposureError("192.168.1.10", {}), /no authentication/);
    assert.equal(remoteExposureError("0.0.0.0", { BASE_STUDIO_ALLOW_INSECURE_REMOTE: "1" }), null);
  });

  it("startStudioServer refuses to bind a non-loopback host (the guard is on the launch path)", async () => {
    await assert.rejects(() => startStudioServer(EX, { host: "0.0.0.0", port: 0, watch: false }), /Refusing to bind non-loopback/);
    const server = await startStudioServer(EX, { host: "127.0.0.1", port: 0, watch: false });
    assert.ok(server.address().port > 0);
    server.close();
  });

  it("rejects with a friendly message (not a cryptic crash) when the port is already in use", async () => {
    const first = await startStudioServer(EX, { host: "127.0.0.1", port: 0, watch: false });
    const taken = first.address().port;
    try {
      await assert.rejects(
        () => startStudioServer(EX, { host: "127.0.0.1", port: taken, watch: false }),
        (error) => {
          assert.match(error.message, /tourne probablement deja/);
          assert.match(error.message, new RegExp(String(taken)));
          return true;
        },
      );
    } finally {
      first.close();
    }
  });

  it("crossOriginError guards state-changing requests against DNS-rebinding and cross-origin POSTs", () => {
    const req = (headers) => ({ headers });
    // Local UI: loopback Host, loopback Origin (even across ports) — allowed.
    assert.equal(crossOriginError(req({ host: "127.0.0.1:4319" })), null);
    assert.equal(crossOriginError(req({ host: "127.0.0.1:4319", origin: "http://127.0.0.1:5173" })), null);
    assert.equal(crossOriginError(req({ host: "[::1]:4319" })), null);
    // DNS-rebinding: the victim loaded attacker.com, which now resolves to 127.0.0.1.
    assert.match(crossOriginError(req({ host: "attacker.com" })), /non-loopback Host/);
    // Cross-site page POSTing to the predictable local port.
    assert.match(crossOriginError(req({ host: "127.0.0.1:4319", origin: "https://evil.example" })), /cross-origin/);
  });
});

describe("studio server — HTTP routes", () => {
  let server;
  let base;

  before(async () => {
    server = createStudioServer(EX, { watch: false }); // route tests don't need (and CI can't open) a watcher
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => server.close());

  it("GET /api/resources?type=process returns process cards", async () => {
    const res = await fetch(`${base}/api/resources?type=process`);
    assert.equal(res.status, 200);
    const cards = await res.json();
    assert.ok(Array.isArray(cards) && cards.length > 0);
    assert.ok(cards.every((c) => c.type === "process"));
  });

  it("GET /api/search?q=devis returns scored results", async () => {
    const res = await fetch(`${base}/api/search?q=devis`);
    assert.equal(res.status, 200);
    const results = await res.json();
    assert.ok(results.length > 0);
    assert.ok(results[0].score > 0 && Array.isArray(results[0].reasons));
  });

  it("GET /api/facets returns counts", async () => {
    const f = await (await fetch(`${base}/api/facets`)).json();
    assert.ok(f.total > 0 && f.type.process >= 1);
  });

  it("GET /api/resource?id=nouveau-devis returns data + body", async () => {
    const r = await (await fetch(`${base}/api/resource?id=nouveau-devis`)).json();
    assert.equal(r.id, "nouveau-devis");
    assert.equal(r.data.type, "process");
  });

  it("maps errors: 404 unknown route, 404 missing resource, 400 bad propose", async () => {
    assert.equal((await fetch(`${base}/api/nope`)).status, 404);
    assert.equal((await fetch(`${base}/api/resource?id=does-not-exist`)).status, 404);
    const bad = await fetch(`${base}/api/propose`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: {}, body: "x" }), // no `path`
    });
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).code, "BAD_REQUEST");
  });

  it("GET /api/context reports single-root mode with the perimeter label", async () => {
    const ctx = await (await fetch(`${base}/api/context`)).json();
    assert.equal(ctx.mode, "root");
    assert.equal(typeof ctx.label, "string");
    assert.ok(ctx.label.length > 0);
  });

  it("GET /api/tree returns the annotated disk tree", async () => {
    const t = await (await fetch(`${base}/api/tree`)).json();
    assert.equal(t.path, "");
    assert.ok(t.dirs.some((d) => d.name === ".ai"));
    // Markdown files are inventoried resources; non-Markdown files are plain (resource: null).
    assert.ok(t.files.some((f) => f.name === "README.md" && f.resource?.type === "document"));
    assert.ok(t.files.some((f) => f.name === "base.config.json" && f.resource === null));
  });

  it("GET /api/file reads a non-resource file and refuses escapes", async () => {
    const ok = await fetch(`${base}/api/file?path=README.md`);
    assert.equal(ok.status, 200);
    assert.match((await ok.json()).content, /./);
    assert.equal((await fetch(`${base}/api/file?path=../../package.json`)).status, 400);
    assert.equal((await fetch(`${base}/api/file?path=missing.txt`)).status, 404);
  });

  it("GET /api/resources honours under + types; unknown root id is a 400 in single-root mode", async () => {
    const res = await fetch(`${base}/api/resources?under=.ai/agents/assistant-devis&types=process,tool`);
    const cards = await res.json();
    assert.ok(cards.length > 0);
    assert.ok(cards.every((c) => c.path.startsWith(".ai/agents/assistant-devis/")));
    assert.ok(cards.every((c) => c.type === "process" || c.type === "tool"));
    assert.equal((await fetch(`${base}/api/resources?root=nope`)).status, 400);
  });

  it("GET /api/events opens an SSE stream", async () => {
    const ac = new AbortController();
    const res = await fetch(`${base}/api/events`, { signal: ac.signal });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/event-stream/);
    ac.abort();
    await res.body?.cancel?.().catch(() => {});
  });
});

describe("studio server — workspace mode (multi-root)", () => {
  let server;
  let base;

  before(async () => {
    server = createStudioServer(await resolveStudioContext(WS), { watch: false });
    await listen(server);
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => server.close());

  it("GET /api/context lists the workspace roots, default flagged", async () => {
    const ctx = await (await fetch(`${base}/api/context`)).json();
    assert.equal(ctx.mode, "workspace");
    assert.deepEqual(ctx.roots.map((r) => r.id), ["dupont-conseil", "martin-digital"]);
    assert.equal(ctx.roots.find((r) => r.id === "dupont-conseil").default, true);
  });

  it("scopes resources and tree to the requested root; defaults to the default root", async () => {
    const martin = await (await fetch(`${base}/api/resources?root=martin-digital`)).json();
    assert.ok(martin.length > 0);
    assert.ok(martin.some((c) => c.id === "assistant-support"));

    const fallback = await (await fetch(`${base}/api/resources`)).json();
    assert.ok(fallback.some((c) => c.id === "assistant-devis"));

    const t = await (await fetch(`${base}/api/tree?root=martin-digital`)).json();
    assert.ok(t.dirs.some((d) => d.name === ".ai"));

    assert.equal((await fetch(`${base}/api/resources?root=unknown`)).status, 400);
  });

  it("GET /api/search?root=* fans out over all roots and stamps rootId", async () => {
    const hits = await (await fetch(`${base}/api/search?root=*&q=assistant`)).json();
    assert.ok(hits.length > 0);
    const roots = new Set(hits.map((h) => h.rootId));
    assert.ok(roots.has("dupont-conseil") || roots.has("martin-digital"));
    assert.ok(hits.every((h) => typeof h.rootId === "string"));
  });
});

describe("studio server — edit over HTTP (temp BASE)", () => {
  let dir;
  let server;
  let base;
  const rel = ".ai/agents/demo/skills/processes/p/SKILL.md";

  before(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "base-studio-http-"));
    await mkdir(path.join(dir, path.dirname(rel)), { recursive: true });
    await writeFile(
      path.join(dir, rel),
      "---\nschema_version: base.resource.v1\nid: p\ntype: process\ntitle: P\ndescription: Original.\nscope: team\nstatus: active\nsensitivity: internal\n---\n# P\n\nBody.\n",
    );
    server = createStudioServer(dir, { watch: false });
    await listen(server);
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    server.close();
    await rm(dir, { recursive: true, force: true });
  });

  it("propose → commit round-trips a metadata edit over HTTP", async () => {
    const doc = await (await fetch(`${base}/api/resource?id=p`)).json();
    const data = { ...doc.data, description: "Edited over HTTP." };

    const proposed = await (
      await fetch(`${base}/api/propose`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: doc.path, data, body: doc.body }),
      })
    ).json();
    assert.ok(proposed.changeId.startsWith("chg_"));
    assert.match(proposed.diff, /Edited over HTTP/);

    const committed = await fetch(`${base}/api/commit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ changeId: proposed.changeId }),
    });
    assert.equal(committed.status, 200);
    assert.equal((await committed.json()).written, true);

    const after = await (await fetch(`${base}/api/resource?id=p`)).json();
    assert.equal(after.data.description, "Edited over HTTP.");
  });

  it("returns 422 when a metadata field is not representable", async () => {
    const doc = await (await fetch(`${base}/api/resource?id=p`)).json();
    const res = await fetch(`${base}/api/propose`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: doc.path, data: { ...doc.data, "bad key": "x" }, body: doc.body }),
    });
    assert.equal(res.status, 422);
  });

  it("names the active settings file and its scope (root here)", async () => {
    const s = await (await fetch(`${base}/api/settings`)).json();
    assert.match(s.file, /\.ai[/\\]studio\.settings\.json$/); // the exact file in play, not a hint
    assert.equal(s.scope, "root");
  });
});

describe("studio server — experiments (Monitor data)", () => {
  let dir;
  let server;
  let base;

  before(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "base-studio-exp-"));
    await mkdir(path.join(dir, ".ai/experiments/reports"), { recursive: true });
    await mkdir(path.join(dir, ".ai/experiments/runs"), { recursive: true });
    await writeFile(
      path.join(dir, ".ai/experiments/reports/report-1.json"),
      JSON.stringify({ total: 2, passRate: 0.5, outcomes: { goal_met: 1, partially_met: 0, not_met: 1 }, bySeverity: { blocker: 1, major: 0, minor: 0 }, byFailureMode: { missing_tool: 1 }, fixHints: [{ scenarioId: "s2", failureMode: "missing_tool", fixHint: "add tool" }], scenarios: [] }),
    );
    await writeFile(
      path.join(dir, ".ai/experiments/runs/s2-1.json"),
      JSON.stringify({ scenarioId: "s2", sutId: "faux", stopReason: "runner_gave_up", turns: [{ index: 0, user: "go", assistant: "blocked", toolCalls: [{ name: "open_crm", args: {}, result: "ERROR: no such tool", denied: false }] }], verdict: { outcome: "not_met", failureMode: "missing_tool", severity: "blocker", confidence: 0.8, evidence: [{ turn: 0, quote: "no such tool", why: "missing" }], rationale: "blocked", fixHint: "add tool" } }),
    );
    server = createStudioServer(dir, { watch: false });
    await listen(server);
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    server.close();
    await rm(dir, { recursive: true, force: true });
  });

  it("GET /api/experiments returns the latest report + run summaries", async () => {
    const o = await (await fetch(`${base}/api/experiments`)).json();
    assert.equal(o.latestReport.passRate, 0.5);
    assert.equal(o.reports.length, 1);
    assert.equal(o.runs.length, 1);
    assert.equal(o.runs[0].outcome, "not_met");
    assert.equal(o.runs[0].failureMode, "missing_tool");
  });

  it("GET /api/experiments/run returns the full run (transcript + verdict)", async () => {
    const run = await (await fetch(`${base}/api/experiments/run?name=s2-1.json`)).json();
    assert.equal(run.scenarioId, "s2");
    assert.equal(run.turns[0].toolCalls[0].name, "open_crm");
    assert.equal(run.verdict.evidence[0].turn, 0);
  });

  it("returns empty overview when there are no experiments, and 404/400 for bad run names", async () => {
    // A FRESH temp root with no .ai/experiments — not the shared example dir, which a real eval run
    // would populate (and the resulting failure would leak this server and hang the suite).
    const clean = await mkdtemp(path.join(tmpdir(), "base-studio-empty-"));
    const empty = createStudioServer(clean, { watch: false });
    try {
      await listen(empty);
      const eb = `http://127.0.0.1:${empty.address().port}`;
      const o = await (await fetch(`${eb}/api/experiments`)).json();
      assert.equal(o.latestReport, null);
      assert.deepEqual(o.runs, []);
      assert.equal((await fetch(`${eb}/api/experiments/run?name=nope.json`)).status, 404);
      assert.equal((await fetch(`${eb}/api/experiments/run?name=../escape`)).status, 400);
    } finally {
      empty.close();
      await rm(clean, { recursive: true, force: true });
    }
  });

  it("GET /api/experiments carries the eval run status (idle)", async () => {
    const o = await (await fetch(`${base}/api/experiments`)).json();
    assert.equal(o.eval.running, false);
  });

  it("POST /api/experiments/run validates before launching: 400 on missing fields and when no scenarios exist", async () => {
    const post = (body) =>
      fetch(`${base}/api/experiments/run`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

    assert.equal((await post({})).status, 400); // missing agentId/processId

    // Missing model ref → 400 before anything else is attempted.
    const noRef = await post({ agentId: "a", processId: "p" });
    assert.equal(noRef.status, 400);
    assert.match((await noRef.json()).error, /utilisateur simulé/);

    // This temp root has reports/ and runs/ but no scenarios/ — so a real launch is refused upfront,
    // with a clear French reason the user can act on.
    const noScenarios = await post({ agentId: "a", processId: "p", userModel: "prov/m" });
    assert.equal(noScenarios.status, 400);
    assert.match((await noScenarios.json()).error, /Aucun scénario/);
  });
});

describe("studio server — welcome mode and /api/init (the bootstrap journey)", () => {
  let dir;
  let server;
  let base;

  before(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "studio-welcome-"));
    await writeFile(path.join(dir, "notes.md"), "# Mes notes");
    const context = await resolveStudioContext(dir);
    server = createStudioServer(context, { watch: false });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    server.close();
    await rm(dir, { recursive: true, force: true });
  });

  it("a non-BASE directory serves mode welcome, with the exact files init would create", async () => {
    const ctx = await (await fetch(`${base}/api/context`)).json();
    assert.equal(ctx.mode, "welcome");
    assert.equal(ctx.detection.type, "loose");
    assert.ok(ctx.plan.length >= 2);
    assert.ok(ctx.plan.every((e) => typeof e.content === "string" && e.reason));
  });

  it("POST /api/init creates the plan SERVER-SIDE and the server becomes a root, no restart", async () => {
    const res = await fetch(`${base}/api/init`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    assert.equal(res.status, 200);
    const out = await res.json();
    assert.ok(out.created.some((p) => p.endsWith("AGENT.md")));
    assert.equal(out.context.mode, "root");

    // The very same server now serves the new BASE…
    const ctx = await (await fetch(`${base}/api/context`)).json();
    assert.equal(ctx.mode, "root");
    const t = await (await fetch(`${base}/api/tree`)).json();
    assert.ok(t.dirs.some((d) => d.name === ".ai"));

    // …and a second init refuses: there is nothing left to bootstrap.
    const again = await fetch(`${base}/api/init`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    assert.equal(again.status, 409);
  });
});

describe("studio server — workspace editing (FR-STUDIO-005)", () => {
  let dir;
  let server;
  let base;

  before(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "base-studio-ws-"));
    for (const [name, id] of [["acme", "a"], ["globex", "g"]]) {
      await mkdir(path.join(dir, name, ".ai", "agents", id), { recursive: true });
      await writeFile(path.join(dir, name, ".ai", "agents", id, "AGENT.md"), `---\nid: ${id}\ntype: agent\ndescription: ${name}.\n---\n# ${name}\n`);
    }
    await writeFile(
      path.join(dir, "base.workspace.json"),
      JSON.stringify({ schema_version: "base.workspace.v1", id: "ws", label: "WS", roots: [{ id: "acme", label: "Acme", path: "acme", default: true }] }),
    );
    server = createStudioServer(await resolveStudioContext(dir), { watch: false });
    await listen(server);
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    server.close();
    await rm(dir, { recursive: true, force: true });
  });

  it("adds a root and re-resolves the served context in place (no restart)", async () => {
    const res = await fetch(`${base}/api/workspace`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        roots: [
          { id: "acme", label: "Acme", path: "acme", default: true },
          { id: "globex", label: "Globex", path: "globex" },
        ],
      }),
    });
    assert.equal(res.status, 200);
    const ctx = await res.json();
    assert.equal(ctx.mode, "workspace");
    assert.equal(ctx.roots.length, 2);
    assert.ok(ctx.roots.some((r) => r.id === "globex"));
    // The manifest on disk now carries both roots, paths relative to its directory.
    const onDisk = JSON.parse(await readFile(path.join(dir, "base.workspace.json"), "utf8"));
    assert.equal(onDisk.roots.length, 2);
    assert.equal(onDisk.roots[1].path, "globex");
  });

  it("refuses a path that is not a BASE root (400)", async () => {
    await mkdir(path.join(dir, "notabase"), { recursive: true });
    const res = await fetch(`${base}/api/workspace`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roots: [{ id: "x", label: "X", path: "notabase" }] }),
    });
    assert.equal(res.status, 400);
  });
});
