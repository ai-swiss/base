// Spec coverage: UR-CORE-001 FR-FEEDBACK-001 FR-FEEDBACK-002~weak[adapter call-sites not asserted end-to-end] FR-FEEDBACK-004 FR-FEEDBACK-005 RC-FEEDBACK-001
// The field loop: friction reports are conform and append-only, CLI and MCP
// abstentions produce the SAME journal line (one shared writer), the pile aggregates recurring
// asks, and «Marquer résolu» goes through the ordinary propose→commit gate.

import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { parseFrontmatter } from "../tools/base-core.mjs";
import { appendAbstention, isAbstention, normalizeQuery, readFeedback, reportFriction } from "../tools/core/feedback.mjs";
import { commitEdit } from "../tools/studio/api.mjs";
import { resolveFriction } from "../tools/studio/feedback.mjs";

describe("feedback — friction reports (append-only)", () => {
  let root;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-feedback-"));
  });
  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("writes a conform entry and NEVER overwrites (collision → suffix)", async () => {
    const now = new Date("2026-06-11T08:32:00Z");
    const first = await reportFriction(root, {
      process: "devis/SKILL.md",
      summary: "le barème cité n'est plus le bon",
      detail: "l'utilisateur a dû corriger le taux à la main (7.7 → 8.1)",
      via: "assistant",
      now,
    });
    assert.match(first.path, /^\.ai\/feedback\/2026-06-11T0832_skill\.md$/);

    const parsed = parseFrontmatter(await readFile(path.join(root, first.path), "utf8"));
    assert.equal(parsed.data.process, "devis/SKILL.md");
    assert.equal(parsed.data.via, "assistant");
    assert.equal(parsed.data.status, "open");
    assert.equal(parsed.data.reported, "2026-06-11");
    assert.match(parsed.body, /^# le barème cité n'est plus le bon/);
    assert.match(parsed.body, /7\.7 → 8\.1/);

    const second = await reportFriction(root, { process: "devis/SKILL.md", summary: "autre souci", now });
    assert.notEqual(second.path, first.path);
    assert.match(second.path, /-2\.md$/);
    // The first file is untouched.
    assert.match(await readFile(path.join(root, first.path), "utf8"), /barème/);
  });

  it("refuses a report without process or summary", async () => {
    await assert.rejects(() => reportFriction(root, { summary: "x" }), /process/);
    await assert.rejects(() => reportFriction(root, { process: "p" }), /summary/);
  });
});

describe("feedback — abstention journal (one writer for every adapter)", () => {
  it("CLI and MCP write through the SAME function → the same JSONL line shape", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "base-abst-"));
    try {
      // The CLI adapter call…
      await appendAbstention(root, { query: "résilier le bail du local", verdict: "out_of_scope", at: "2026-06-11T08:00:00Z" });
      // …and the MCP adapter call (same function, same contract).
      await appendAbstention(root, { query: "résilier le bail du local", verdict: "out_of_scope", suggestion: null, at: "2026-06-11T09:00:00Z" });

      const lines = (await readFile(path.join(root, ".ai/feedback/abstentions.jsonl"), "utf8")).trim().split("\n").map((l) => JSON.parse(l));
      assert.equal(lines.length, 2);
      assert.deepEqual(Object.keys(lines[0]), Object.keys(lines[1])); // identical shape
      assert.deepEqual(lines[0], { at: "2026-06-11T08:00:00Z", query: "résilier le bail du local", verdict: "out_of_scope" });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("only honest abstentions are journalled; queries normalize for aggregation", () => {
    assert.equal(isAbstention("out_of_scope"), true);
    assert.equal(isAbstention("ambiguous"), true);
    assert.equal(isAbstention("needs_clarification"), true);
    assert.equal(isAbstention("routed"), false);
    assert.equal(normalizeQuery(" Résilier le BAIL, du local ! "), "resilier le bail du local");
  });
});

describe("feedback — the pile and the gated resolution", () => {
  let root;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-pile-"));
    await reportFriction(root, { process: "devis/SKILL.md", summary: "taux faux", detail: "corrigé à la main", now: new Date("2026-06-11T10:00:00Z") });
    await appendAbstention(root, { query: "Résilier le bail", verdict: "out_of_scope", at: "2026-06-01T00:00:00Z" });
    await appendAbstention(root, { query: "résilier le bail !", verdict: "out_of_scope", at: "2026-06-02T00:00:00Z" });
    await appendAbstention(root, { query: "relancer un client", verdict: "ambiguous", at: "2026-06-03T00:00:00Z" });
  });
  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("aggregates abstentions by normalized query with counters, frictions newest-first", async () => {
    const pile = await readFeedback(root);
    assert.equal(pile.frictions.length, 1);
    assert.equal(pile.frictions[0].summary, "taux faux");
    assert.equal(pile.frictions[0].status, "open");

    assert.equal(pile.abstentions.length, 2);
    assert.equal(pile.abstentions[0].query, "Résilier le bail"); // ×2 first
    assert.equal(pile.abstentions[0].count, 2);
    assert.equal(pile.abstentions[1].count, 1);
  });

  it("«Marquer résolu» is an ordinary gated edit: propose → diff → commit, then it leaves the open pile", async () => {
    const open = await readFeedback(root, { status: "open" });
    const target = open.frictions[0].path;

    const proposed = await resolveFriction(root, target);
    assert.ok(proposed.changeId.startsWith("chg_"));
    assert.match(proposed.diff, /status: resolved/);
    // Nothing changed yet.
    assert.equal((await readFeedback(root, { status: "open" })).frictions.length, 1);

    await commitEdit(root, proposed.changeId);
    assert.equal((await readFeedback(root, { status: "open" })).frictions.length, 0);
    const resolved = await readFeedback(root, { status: "resolved" });
    assert.equal(resolved.frictions.length, 1);
    assert.equal(resolved.frictions[0].status, "resolved");
  });

  it("resolve refuses paths outside .ai/feedback/", async () => {
    await assert.rejects(() => resolveFriction(root, "devis/SKILL.md"), (e) => e.code === "BAD_REQUEST");
  });
});
