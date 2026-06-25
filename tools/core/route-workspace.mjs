// tools/core/route-workspace.mjs — the cross-root routing decision, pure. Given each declared root's
// in-root route result, pick the root whose best candidate clearly dominates, or abstain on a genuine
// near-tie. It reuses the SAME margin primitive as intra-root routing (`decideAmong`), with a wider
// margin because cross-root scores are less commensurable. Kept out of base.mjs so the CLI orchestrator
// stays thin (architecture fitness) and this decision is unit-testable in isolation.

import { decideAmong, ROUTING_DEFAULTS } from "./routing.mjs";
import { compareByCodePoint } from "./ordering.mjs";

/**
 * @typedef {{ id: string, label?: string, type?: string, path: string }} WorkspaceRoot
 * @typedef {{ root: WorkspaceRoot, result: any }} RootAttempt
 */

/**
 * Decide a single workspace route (or abstention) from each root's in-root result. Pure: the caller
 * (base.mjs) does the per-root routing I/O and the scope plumbing.
 * @param {RootAttempt[]} attempts
 * @param {{ request: string, workspaceScope: any, unreachable?: Array<{ id: string, error: string }>, margin?: number }} ctx
 */
export function decideWorkspaceRoute(attempts, { request, workspaceScope, unreachable = [], margin = ROUTING_DEFAULTS.workspace_margin }) {
  const withUnreachable = (result) => (unreachable.length ? { ...result, unreachable_roots: unreachable } : result);

  // Decide across the routed roots with the SAME margin rule as intra-root routing, not an
  // unconditional "2 routed ⇒ ambiguous" (the prior G1 bug: "Dupont SA", one root scoring far above
  // the others, abstained wrongly). A clearly dominant root wins; only a genuine near-tie abstains.
  const routed = attempts.filter((attempt) => attempt.result.status === "routed");
  if (routed.length >= 1) {
    const ranked = routed
      .map((attempt) => ({ attempt, score: attempt.result.candidates?.[0]?.score ?? 0 }))
      .sort((a, b) => b.score - a.score || compareByCodePoint(a.attempt.root.id, b.attempt.root.id));
    const choice = decideAmong(ranked, { top2_margin: margin });

    if (choice.kind === "clear") {
      const { root, result } = choice.top.attempt;
      return withUnreachable({
        ...result,
        scope: { mode: "workspace", workspace: workspaceScope.workspace, root: routeRootScope(root) },
        explanation: `Route in root "${root.id}": ${result.explanation}`,
      });
    }

    return withUnreachable({
      request,
      status: "ambiguous",
      reason_code: "competing_roots",
      agent: null,
      process: null,
      candidates: ranked.map(({ attempt }) => workspaceRouteCandidate(attempt.root, attempt.result)),
      explanation: `Several workspace roots can handle this request: ${ranked.map(({ attempt }) => attempt.root.id).join(", ")}.`,
      next_question: "Which root should BASE use?",
      scope: workspaceScope,
    });
  }

  return withUnreachable({
    request,
    status: "out_of_scope",
    reason_code: "no_workspace_route",
    agent: null,
    process: null,
    candidates: attempts
      .map((attempt) => workspaceRouteCandidate(attempt.root, attempt.result))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score || compareByCodePoint(a.resource.id, b.resource.id)),
    explanation: unreachable.length && !attempts.length
      ? `No workspace root was reachable: ${unreachable.map((u) => u.id).join(", ")}.`
      : "No declared workspace root produced a route.",
    next_question: null,
    scope: workspaceScope,
  });
}

function workspaceRouteCandidate(root, result) {
  const best = result.candidates?.[0];
  return {
    resource: {
      id: best?.resource?.id ? `${root.id}/${best.resource.id}` : root.id,
      type: "workspace_root",
      title: root.label,
      path: root.path,
    },
    score: best?.score ?? 0,
    reasons: [
      `root:${root.id}`,
      result.status,
      ...(result.agent?.id ? [`agent:${result.agent.id}`] : []),
      ...(result.process?.id ? [`process:${result.process.id}`] : []),
    ],
    route_scope: "root",
  };
}

function routeRootScope(root) {
  return { id: root.id, label: root.label, type: root.type, path: root.path };
}
