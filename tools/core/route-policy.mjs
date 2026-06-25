// tools/core/route-policy.mjs — the declarative routing policy: a per-node `deny` folded monotonically
// down the agent chain and enforced as a veto. Pure, zero-dependency. The policy is a MECHANISM
// (code-guaranteed), distinct from the route_text consigne (model-followed): `decideRoute` filters a
// denied target out of BOTH the decision and the returned candidate shortlist (upfront), so the
// deterministic floor and the embeddings never route to it and an LLM cannot pick it from the list —
// "a process can never route outside its agent's intent" holds for routing. (A process its agent
// denies, and an agent the root denies, are now omitted from the index; only direct resource loads
// remain deferred close-out.)

import { compareByCodePoint } from "./ordering.mjs";

/**
 * @typedef {{ deny?: string[] }} PolicyLayer
 * @typedef {{ deny: string[] }} EffectivePolicy
 */

/**
 * Fold a chain of policy layers (root → … → leaf) into one effective policy. MONOTONE: a descendant can
 * only TIGHTEN, never loosen. `deny` accumulates (union). The result is sorted, so the fold is
 * deterministic.
 * @param {PolicyLayer[]} [layers]
 * @returns {EffectivePolicy}
 */
export function resolveEffectivePolicy(layers) {
  const deny = new Set();
  for (const layer of layers ?? []) {
    for (const entry of layer?.deny ?? []) deny.add(entry);
  }
  return { deny: [...deny].sort(compareByCodePoint) };
}

/**
 * Is a target allowed under a deny list? A deny entry matches by exact id, by `type:id` (e.g.
 * `process:paie`, or `agent:*` for a whole class), or by a trailing `*` prefix glob (e.g.
 * `experimental-*`). Default-allow: nothing is denied unless a layer says so.
 * @param {string} targetId @param {string[]} [deny] @param {string} [targetType]
 * @returns {boolean}
 */
export function isAllowed(targetId, deny, targetType) {
  return !(deny ?? []).some((pattern) => matchesTarget(pattern, targetId, targetType));
}

function matchesTarget(pattern, targetId, targetType) {
  if (pattern.includes(":")) {
    const [type, id] = [pattern.slice(0, pattern.indexOf(":")), pattern.slice(pattern.indexOf(":") + 1)];
    return type === targetType && (id === "*" || matchesId(id, targetId));
  }
  return matchesId(pattern, targetId);
}

function matchesId(pattern, targetId) {
  return pattern.endsWith("*") ? targetId.startsWith(pattern.slice(0, -1)) : pattern === targetId;
}

/**
 * The shared deny PRE-FILTER, applied to the whole corpus upstream of EITHER strategy, so a denied target
 * never reaches the deterministic floor, the embedding recall, or the refiner's candidate list. Each
 * routable resource is judged under root ∪ its agent's policy — the same `resolveEffectivePolicy` fold
 * `decideRoute` uses, so a process can never escape its agent's deny. Non-routable resources pass through
 * untouched (they are not routing targets); a denied agent's processes are dropped with it.
 *
 * `rootDeny` is the project-level deny (base.config); per-agent deny is read from each agent's
 * `metadata.routing.deny`. Pure: no model, no I/O. Idempotent — re-running over already-filtered
 * resources is a no-op, so the lexical strategy's own internal deny in decideRoute stays behaviour-preserving.
 * @template {{ id: string, type: string, path: string, metadata?: any }} T
 * @param {T[]} resources
 * @param {{ rootDeny?: string[], routableKinds: Set<string>, agentDirOf: (path: string) => string | null }} ctx
 * @returns {T[]}
 */
export function denyFilterResources(resources, { rootDeny = [], routableKinds, agentDirOf }) {
  const agentByDir = new Map();
  for (const r of resources) {
    if (r.type === "agent") {
      const dir = agentDirOf(r.path);
      if (dir) agentByDir.set(dir, r);
    }
  }
  // A denied agent is dropped entirely, and with it every process under its directory.
  return resources.filter((r) => {
    if (!routableKinds.has(r.type)) return true;
    const dir = agentDirOf(r.path);
    const agent = dir ? agentByDir.get(dir) : null;
    const agentDeny = r.type === "process" ? (agent?.metadata?.routing ?? {}) : {};
    const deny = resolveEffectivePolicy([{ deny: rootDeny }, agentDeny]).deny;
    if (!isAllowed(r.id, deny, r.type)) return false;
    // A process whose agent is itself denied is unreachable — drop it too.
    if (r.type === "process" && agent && !isAllowed(agent.id, resolveEffectivePolicy([{ deny: rootDeny }]).deny, "agent")) return false;
    return true;
  });
}
