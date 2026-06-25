// tools/core/routing.mjs — the Router core. Zero dependencies (pure functions only).
//
// The Router *chooses* (which agent, which process, or abstain); the Ranker *scores*; the Broker
// *enforces*. These stay separate (see specs/current/10_core/architecture.md). This module holds
// the pure parts: derive a routing signal from a resource, and decide a route from already-ranked
// candidates with INSPECTABLE structural rules — never an opaque confidence. The broker orchestrates
// (inventory → enrich → rank → decide) in base-core.mjs.
//
// Routing ≠ retrieval: the Router selects among a small, closed set of agents/processes derived from
// the files. Finding the many context resources afterwards is retrieval (search/index), kept apart.

import { normalize } from "./rankers.mjs";
import { compareByCodePoint } from "./ordering.mjs";
import { resolveEffectivePolicy, isAllowed } from "./route-policy.mjs";

// Default decision thresholds. Not probabilities — explainable, configurable sort rules
// (override via base.config `routing`). floor: minimum score to be a real candidate;
// margin: how close the runner-up must be to count as "too close"; max_candidates: shortlist size.
export const ROUTING_DEFAULTS = { floor_score: 30, top2_margin: 0.2, max_candidates: 5, workspace_margin: 0.4 };

export const ROUTABLE_KINDS = new Set(["agent", "process"]);

// The single margin rule, named once. The agent, process and workspace-root decisions all ask the
// same question — is the runner-up close enough to the leader that we cannot pick a clear winner?
// Extracted at the third real call site (Rule of Three); before, it was inlined three times.
/** @param {number} bestScore @param {number} secondScore @param {number} margin */
export function isTooClose(bestScore, secondScore, margin) {
  return secondScore >= bestScore * (1 - margin);
}

// Decide among ranked entries (sorted desc by `score`) with the shared floor + margin rule. The one
// place those thresholds are applied; each caller maps the kind to its own status and reason_code
// (`competing_intents`, `two_close_candidates`, `competing_roots` share this shape):
//   { kind: "none" }                  nothing clears the floor
//   { kind: "clear", top }            a clear leader (alone, or runner-up below the margin)
//   { kind: "close", top, runnerUp }  leader and runner-up within the margin — abstain and ask
// The generic keeps each caller's entry type through `top`/`runnerUp`, so `.dir`/`.resource`/`.attempt`
// stay typed at the call site.
/**
 * @template {{ score: number }} T
 * @param {T[]} ranked
 * @param {{ floor_score?: number, top2_margin: number }} thresholds
 * @returns {{ kind: "none" } | { kind: "clear", top: T } | { kind: "close", top: T, runnerUp: T }}
 */
export function decideAmong(ranked, thresholds) {
  const { floor_score = 0, top2_margin } = thresholds;
  const top = ranked[0];
  if (!top || top.score < floor_score) return { kind: "none" };
  const runnerUp = ranked[1];
  if (runnerUp && isTooClose(top.score, runnerUp.score, top2_margin)) {
    return { kind: "close", top, runnerUp };
  }
  return { kind: "clear", top };
}
export const ROUTING_REGISTRY_SCHEMA = "base.routing.v1";

export function routeScopeOf(type) {
  if (type === "agent") return "agent";
  if (type === "process") return "process";
  return "resource";
}

// The agent a resource belongs to = the `.ai/agents/<agent>` directory on its path, or null.
// Works for the framework layout (`.ai/agents/x/...`) and example layout (`exemples/y/.ai/agents/x/...`).
export function agentDirOf(relativePath) {
  const normalized = String(relativePath ?? "").split("\\").join("/");
  const match = normalized.match(/(^|.*\/)\.ai\/agents\/([^/]+)\//);
  if (!match) return null;
  const agent = match[2];
  if (agent.startsWith("_")) return null; // scaffolding (e.g. _template) is not a routable agent
  return `${match[1]}.ai/agents/${agent}`;
}

// route_text = the highest-signal "when to use" text, derived from the file (never hand-maintained
// elsewhere). Fallback chain: use_when → description → title → keywords → "## Quand utiliser" → path.
// Optional `routing.examples` (real user phrasings) are appended to lift recall. Returns the text +
// which source carried it (for an explainable `route_text:<source>` reason).
export function routeText(resource) {
  const meta = resource.metadata ?? {};
  const routing = meta.routing && typeof meta.routing === "object" && !Array.isArray(meta.routing) ? meta.routing : {};
  const examples = Array.isArray(routing.examples) ? routing.examples.filter((s) => typeof s === "string" && s.trim()) : [];

  const primary = pickPrimarySignal(resource, meta);
  const text = [primary.text, ...examples].map((s) => s.trim()).filter(Boolean).join(" — ");
  return { text, source: primary.source, has_examples: examples.length > 0 };
}

function pickPrimarySignal(resource, meta) {
  const useWhen = stringOrEmpty(resource.use_when ?? meta.use_when);
  if (useWhen) return { text: useWhen, source: "use_when" };
  if (stringOrEmpty(resource.description)) return { text: resource.description.trim(), source: "description" };
  if (stringOrEmpty(resource.title)) return { text: resource.title.trim(), source: "title" };
  const keywords = (resource.keywords ?? []).filter(Boolean).join(" ").trim();
  if (keywords) return { text: keywords, source: "keywords" };
  const section = extractSection(resource.body ?? "", "quand utiliser");
  if (section) return { text: section, source: "section" };
  return { text: humanizePath(resource.path), source: "path" };
}

// Normalise a resource into the internal routing form. NOT a port: a plain function until a second
// real extractor exists (Rule of Three). Integrators enrich metadata; we reduce it to one shape.
export function deriveRoutingSignals(resource) {
  const { text, source, has_examples } = routeText(resource);
  const meta = resource.metadata ?? {};
  const routing = meta.routing && typeof meta.routing === "object" && !Array.isArray(meta.routing) ? meta.routing : {};
  const avoid = Array.isArray(routing.avoid_when) ? routing.avoid_when.filter((s) => typeof s === "string" && s.trim()) : [];
  return {
    route_text: text,
    avoid_text: avoid.join(" — "),
    route_scope: routeScopeOf(resource.type),
    agent_path: agentDirOf(resource.path),
    reasons: [`route_text:${source}`, ...(has_examples ? ["route_text:examples"] : [])],
  };
}

// Decide a route from ranked candidates. `ranked` = routable resources (agent|process) already
// scored & sorted desc, each `{ resource, score, reasons, route_scope, agent_path }`. `agentsByDir`
// resolves an agent directory to its agent resource (so a clear agent is returned even if it itself
// scored 0). Returns { status, reason_code, agent, process, candidates, explanation, next_question }.
//
// Four statuses, never a fake confidence:
//   routed              — one clear agent + one clear process
//   ambiguous           — two processes of the SAME agent too close       (two_close_candidates)
//   needs_clarification — agent clear, no clear process (no_clear_process) OR two different agents
//                         too close (competing_intents)
//   out_of_scope        — nothing above the floor                          (below_floor)
/**
 * @typedef {object} RankedCandidate
 * @property {{ id: string, type: string, title?: string, path: string }} resource
 * @property {number} score
 * @property {string[]} reasons
 * @property {string} route_scope
 * @property {string | null} agent_path
 */
export function decideRoute(ranked, agentsByDir, options = {}) {
  const { floor_score, top2_margin, max_candidates } = { ...ROUTING_DEFAULTS, ...options };
  const selectable = ranked.filter((c) => c.agent_path && agentsByDir.has(c.agent_path));

  // The deny veto (route-policy) applied ONCE, here, so a denied target is absent from BOTH the decision
  // AND the returned `candidates` shortlist — neither the structural rules nor an LLM reading that list
  // can reach it. Each target is judged under root ∪ its agent's policy (a process can never escape its
  // agent's deny); an agent under the root alone. Default-allow → behaviour-preserving with no policy.
  const rootPolicy = options.policy ?? {};
  const allowed = selectable.filter((c) => {
    const agentPolicy = c.route_scope === "process" ? (agentsByDir.get(c.agent_path)?.metadata?.routing ?? {}) : {};
    return isAllowed(c.resource.id, resolveEffectivePolicy([rootPolicy, agentPolicy]).deny, c.resource.type);
  });
  const candidates = allowed.filter((c) => c.score > 0).slice(0, max_candidates).map(slimCandidate);

  // Aggregate a score per agent: the best of the agent's own card and any of its processes.
  const agentScore = new Map();
  /** @type {Map<string, RankedCandidate[]>} */
  const processesByAgent = new Map();
  for (const c of allowed) {
    agentScore.set(c.agent_path, Math.max(agentScore.get(c.agent_path) ?? 0, c.score));
    if (c.route_scope === "process") {
      const list = processesByAgent.get(c.agent_path) ?? [];
      list.push(c);
      processesByAgent.set(c.agent_path, list);
    }
  }

  const rankedAgents = [...agentScore.entries()]
    .sort((a, b) => b[1] - a[1] || compareByCodePoint(a[0], b[0]))
    .map(([dir, score]) => ({ dir, score }));

  // Agent-level decision (aggregated best-of). Each agent dir is unique, so a close runner-up is
  // always a different agent — the former `secondDir !== bestDir` guard is structurally satisfied.
  const agentChoice = decideAmong(rankedAgents, { floor_score, top2_margin });
  if (agentChoice.kind === "none") {
    return outcome("out_of_scope", "below_floor", null, null, candidates,
      "Aucun agent ne couvre cette demande au-dessus du seuil.",
      "Pouvez-vous reformuler, ou faut-il créer un agent pour ce besoin ?");
  }
  if (agentChoice.kind === "close") {
    const a = agentLabel(agentsByDir, agentChoice.top.dir);
    const b = agentLabel(agentsByDir, agentChoice.runnerUp.dir);
    return outcome("needs_clarification", "competing_intents",
      slimResource(agentsByDir.get(agentChoice.top.dir)), null, candidates,
      `Deux agents plausibles couvrent des intentions différentes: ${a} et ${b}.`,
      `Votre demande concerne-t-elle ${a} ou ${b} ?`);
  }

  const bestDir = agentChoice.top.dir;
  const agent = agentsByDir.get(bestDir) ?? null;
  const agentName = agentLabel(agentsByDir, bestDir);
  const processes = (processesByAgent.get(bestDir) ?? [])
    .filter((p) => p.score >= floor_score)
    .sort((a, b) => b.score - a.score || compareByCodePoint(candidateId(a), candidateId(b)));

  // Process-level decision among the chosen agent's processes (already floor-filtered). Same margin
  // rule, mapped to this level's vocabulary: empty → no_clear_process, close → two_close_candidates.
  const processChoice = decideAmong(processes, { floor_score, top2_margin });
  if (processChoice.kind === "none") {
    return outcome("needs_clarification", "no_clear_process", slimResource(agent), null, candidates,
      `Agent clair (${agentName}) mais aucun process ne ressort.`,
      `Que voulez-vous faire avec ${agentName} ?`);
  }
  if (processChoice.kind === "close") {
    return outcome("ambiguous", "two_close_candidates", slimResource(agent), null, candidates,
      `Deux process proches dans ${agentName}.`,
      `Souhaitez-vous «${candidateTitle(processChoice.top)}» ou «${candidateTitle(processChoice.runnerUp)}» ?`);
  }

  return outcome("routed", null, slimResource(agent), slimResource(processChoice.top.resource), candidates,
    `Route: ${agentName} → ${candidateTitle(processChoice.top)}.`, null);
}

// Deterministic registry projection: agents, their processes, and the derived route_text. Holds
// derived signals only (no semantic scores, no file bodies, no hand-maintained mapping). Sorted and
// timestamp-free so `base build routing-registry` is idempotent and CI can gate its freshness.
export function buildRoutingRegistry(resources) {
  const byAgent = new Map();
  const weakSignals = [];

  for (const resource of resources) {
    if (!ROUTABLE_KINDS.has(resource.type)) continue;
    const signals = deriveRoutingSignals(resource);
    const dir = signals.agent_path ?? "(orphan)";
    const source = signals.reasons[0].split(":")[1];
    const card = { id: resource.id, path: resource.path, title: resource.title ?? null, route_text: signals.route_text, avoid_text: signals.avoid_text, signal: source };
    if (source !== "use_when" && source !== "description") weakSignals.push(resource.path);

    const entry = byAgent.get(dir) ?? { agent: null, deny: [], processes: [] };
    if (resource.type === "agent") {
      entry.agent = card;
      const deny = resource.metadata?.routing?.deny;
      if (Array.isArray(deny)) entry.deny = deny.filter((d) => typeof d === "string");
    } else entry.processes.push(card);
    byAgent.set(dir, entry);
  }

  const agents = [...byAgent.entries()]
    .sort((a, b) => compareByCodePoint(a[0], b[0]))
    .map(([agent_dir, entry]) => ({
      agent_dir,
      agent: entry.agent,
      deny: entry.deny,
      processes: entry.processes.sort((a, b) => compareByCodePoint(a.id, b.id)),
    }));

  return {
    schema_version: ROUTING_REGISTRY_SCHEMA,
    agents,
    diagnostics: { weak_signals: weakSignals.sort() },
  };
}

// CONTRACT (routing.md, FR-ROUTE-003): a `routed` result always carries a real agent AND process. The
// embedding strategy's refiner resolves the agent only from the retrieved shortlist, which may omit it
// (an agent's own route_text need not rank in the top-k). Fill it here from the FULL deny-filtered
// corpus, by the routed process's agent directory, so a process route is never agentless. A process
// whose agent is deny-filtered never reaches routing (route-policy drops it), so the agent is present.
export function withRoutedAgent(decision, resources) {
  if (!decision || decision.status !== "routed" || decision.agent || !decision.process) return decision;
  const dir = agentDirOf(decision.process.path);
  if (!dir) return decision;
  const agent = (resources ?? []).find((r) => r?.type === "agent" && agentDirOf(r.path) === dir);
  return agent ? { ...decision, agent: slimResource(agent) } : decision;
}

// --- internal helpers -------------------------------------------------------------------------

function outcome(status, reason_code, agent, process, candidates, explanation, next_question) {
  return { status, reason_code, agent, process, candidates, explanation, next_question };
}

function slimCandidate(c) {
  return { resource: slimResource(c.resource), score: c.score, reasons: c.reasons, route_scope: c.route_scope };
}

function slimResource(resource) {
  if (!resource) return null;
  return { id: resource.id, type: resource.type, title: resource.title, path: resource.path };
}

function candidateId(c) {
  return c.resource?.id ?? "";
}

function candidateTitle(c) {
  return c.resource?.title || c.resource?.id || "?";
}

function agentLabel(agentsByDir, dir) {
  const agent = agentsByDir.get(dir);
  if (agent) return agent.title || agent.id;
  const base = String(dir ?? "").split("/").pop();
  return base || "agent";
}

function stringOrEmpty(value) {
  return typeof value === "string" && value.trim() ? value : "";
}

function humanizePath(relativePath) {
  const normalized = String(relativePath ?? "").split("\\").join("/");
  const base = normalized.split("/").pop() ?? normalized;
  return base.replace(/\.(md|json)$/i, "").replace(/[-_]+/g, " ").trim();
}

// Extract the paragraph under a conventional `## <heading>` section (accent/case-insensitive).
function extractSection(body, heading) {
  const target = normalize(heading);
  const lines = String(body ?? "").split("\n");
  let capture = false;
  const collected = [];
  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.*)$/);
    if (headingMatch) {
      if (capture) break; // next heading ends the section
      if (normalize(headingMatch[1]).includes(target)) capture = true;
      continue;
    }
    if (capture && line.trim()) collected.push(line.trim());
  }
  return collected.join(" ").trim();
}
