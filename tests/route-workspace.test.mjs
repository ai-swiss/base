// Spec coverage: FR-ROUTE-003
// The shared margin rule (isTooClose / decideAmong) and the workspace routing margin. Before this,
// `routeAcrossWorkspace` reported `ambiguous` the instant two roots routed, ignoring the margin — so
// "Dupont SA", with one root scoring far above the others, abstained wrongly (the G1 bug). The
// decision now goes through the SAME primitive as intra-root routing, with a wider cross-root margin.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decideAmong, isTooClose, ROUTING_DEFAULTS } from "../tools/core/routing.mjs";
import { decideWorkspaceRoute } from "../tools/core/route-workspace.mjs";

describe("isTooClose — the single margin rule (Rule of Three: agent, process, workspace-root)", () => {
  it("a dominant leader is NOT too close", () => {
    assert.equal(isTooClose(945, 70, ROUTING_DEFAULTS.workspace_margin), false); // Dupont SA: clear winner
  });

  it("a genuine near-tie IS too close", () => {
    assert.equal(isTooClose(160, 105, ROUTING_DEFAULTS.workspace_margin), true); // ratio 0.66 under a 0.4 margin
  });

  it("is exact at the boundary `second >= best * (1 - margin)`", () => {
    assert.equal(isTooClose(100, 80, 0.2), true);  // 80 >= 80
    assert.equal(isTooClose(100, 79, 0.2), false); // 79 <  80
  });
});

describe("decideAmong — floor + margin → an explainable kind", () => {
  const top2_margin = ROUTING_DEFAULTS.workspace_margin;

  it("`none` when empty or below the floor", () => {
    assert.equal(decideAmong([], { floor_score: 30, top2_margin: 0.2 }).kind, "none");
    assert.equal(decideAmong([{ score: 10 }], { floor_score: 30, top2_margin: 0.2 }).kind, "none");
  });

  it("`clear` when a single candidate is above the floor", () => {
    const choice = decideAmong([{ score: 50, ref: "a" }], { top2_margin });
    assert.equal(choice.kind, "clear");
    assert.equal(choice.top.ref, "a");
  });

  it("`clear` when the leader dominates the runner-up (the workspace G1 case)", () => {
    const choice = decideAmong([{ score: 945, ref: "dupont" }, { score: 70, ref: "martin" }], { top2_margin });
    assert.equal(choice.kind, "clear");
    assert.equal(choice.top.ref, "dupont");
  });

  it("`close` on a genuine near-tie — abstains upstream (competing_roots / two_close_candidates)", () => {
    const choice = decideAmong([{ score: 160, ref: "a" }, { score: 105, ref: "b" }], { top2_margin });
    assert.equal(choice.kind, "close");
    assert.equal(choice.top.ref, "a");
    assert.equal(choice.runnerUp.ref, "b");
  });

  it("defaults the floor to 0 — pre-qualified candidates (e.g. already-routed roots) never fall to `none`", () => {
    assert.equal(decideAmong([{ score: 5 }], { top2_margin }).kind, "clear");
  });
});

describe("decideWorkspaceRoute — the pure cross-root decision", () => {
  const workspaceScope = { mode: "workspace", workspace: { id: "ws" } };
  const attempt = (id, status, score, extra = {}) => ({
    root: { id, label: id, type: "root", path: `/roots/${id}` },
    result: { status, explanation: `${id} says so`, candidates: score == null ? [] : [{ resource: { id: `${id}-c` }, score }], ...extra },
  });

  it("routes to the clearly dominant root (the Dupont SA case) — no longer ambiguous", () => {
    const out = decideWorkspaceRoute(
      [attempt("dupont", "routed", 945, { agent: { id: "a" }, process: { id: "p" } }), attempt("martin", "routed", 70)],
      { request: "...", workspaceScope },
    );
    assert.equal(out.status, "routed");
    assert.equal(out.scope.root.id, "dupont");
  });

  it("abstains as competing_roots on a genuine near-tie", () => {
    const out = decideWorkspaceRoute(
      [attempt("a", "routed", 160), attempt("b", "routed", 105)],
      { request: "...", workspaceScope },
    );
    assert.equal(out.status, "ambiguous");
    assert.equal(out.reason_code, "competing_roots");
  });

  it("out_of_scope when no root routes, surfacing unreachable roots", () => {
    const out = decideWorkspaceRoute(
      [attempt("a", "out_of_scope", 0)],
      { request: "...", workspaceScope, unreachable: [{ id: "b", error: "boom" }] },
    );
    assert.equal(out.status, "out_of_scope");
    assert.equal(out.reason_code, "no_workspace_route");
    assert.deepEqual(out.unreachable_roots, [{ id: "b", error: "boom" }]);
  });
});
