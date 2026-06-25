// Pure routing computation, extracted from the base-core facade. Given an already-inventoried
// corpus it derives a routing signal per routable resource, scores candidates with the SAME Ranker
// contract as discovery, applies the structural decision rules, and attaches an honest help
// fallback to an abstention. No filesystem, no trace side effects: the traced wrappers
// (routeRequest, runRouteTests) stay in base-core and call computeRoute over one inventory. Imports
// only leaf core modules, so base-core depends on this module, never the reverse.

import { normalize, lexicalRanker, composeRankers } from "./rankers.mjs";
import { compareByCodePoint } from "./ordering.mjs";
import { deriveRoutingSignals, decideRoute, ROUTING_DEFAULTS, ROUTABLE_KINDS } from "./routing.mjs";

// Stopwords for routing and keyword term extraction: articles, fillers, and greetings must not
// carry a route. Shared with base-core's keyword derivation (imported from here).
export const STOPWORDS = new Set([
  "a",
  "all",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "avec",
  "au",
  "aucun",
  "aucune",
  "be",
  "by",
  "dans",
  "de",
  "du",
  "pour",
  "des",
  "les",
  "le",
  "la",
  "un",
  "une",
  "est",
  "et",
  "en",
  "il",
  "je",
  "qui",
  "que",
  "quoi",
  "sur",
  "par",
  "aux",
  "mes",
  "mon",
  "nous",
  "nos",
  "notre",
  "ou",
  "for",
  "from",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "our",
  "the",
  "that",
  "this",
  "to",
  "son",
  "ses",
  "vos",
  "vous",
  "veux",
  "veut",
  "want",
  "with",
  "votre",
  "base",
  "skill",
  "agent",
  "readme",
  // Greetings and contentless small-talk fillers: these must not carry a route. Without this, the
  // 2-char "ca"/"va" (from "ça va") substring-match inside real words (publiCAtion, éVAluer) and a
  // greeting like "Bonjour comment ça va ?" mis-routes to a business process. Dropping them lets a
  // greeting abstain honestly and land on the help fallback.
  "bonjour",
  "bonsoir",
  "salut",
  "coucou",
  "hello",
  "hi",
  "hey",
  "ca",
  "va",
  "comment",
  "merci",
]);

export function routeTerms(request) {
  return [...new Set(
    normalize(request)
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 2 && !STOPWORDS.has(word)),
  )];
}

export function routeAvoidReasons(avoidText, terms) {
  if (!avoidText || terms.length === 0) return [];
  // A short term (≤ 3 chars) must match a WHOLE avoid word — otherwise «ma» fires on
  // «manger» and «ur» (from «sœur») on «sur». Longer terms keep substring recall, so
  // «calcule» still matches «calculer» (morphology without a stemmer).
  const hay = normalize(avoidText);
  const avoidTokens = new Set(routeTerms(avoidText));
  const hits = terms.filter((term) => (term.length <= 3 ? avoidTokens.has(term) : hay.includes(term)));
  const minimumHits = terms.length === 1 ? 1 : 2;
  return hits.length >= minimumHits ? hits.map((term) => `route_avoid:${term}`) : [];
}

// Router orchestration: derive a routing signal per routable resource, score candidates with the
// SAME Ranker contract as discovery (ctx.mode="route" + an enriched `route_text` field), then apply
// the structural decision rules. Returns { status, reason_code, agent, process, candidates,
// explanation, next_question } — a route or an honest abstention, never a fabricated confidence.
export async function computeRoute(root, request, resources, cfg, { limit, signal } = /** @type {{ limit?: number, signal?: AbortSignal }} */ ({})) {
  const terms = routeTerms(request);
  const thresholds = { ...ROUTING_DEFAULTS, ...(cfg.routing ?? {}) };
  if (typeof limit === "number" && limit > 0) thresholds.max_candidates = limit;
  const ctx = { root, mode: "route", query: request, signal };
  const rankers = [lexicalRanker, ...(cfg.rankers ?? [])];
  const { ranked, agentsByDir } = await rankResources(resources, terms, composeRankers(rankers), ctx);
  const decision = decideRoute(ranked, agentsByDir, thresholds);
  const fallback = resolveFallback(cfg.routing?.fallback, resources, decision);
  return fallback ? { ...decision, fallback } : decision;
}

// Score the routable corpus with a Ranker, returning the sorted candidates + the agent-dir index
// (signals, avoid veto, sort).
async function rankResources(resources, terms, rank, ctx) {
  const agentsByDir = new Map();
  const ranked = [];
  for (const resource of resources) {
    if (!ROUTABLE_KINDS.has(resource.type)) continue;
    // A deprecated (or archived) resource is never a routing candidate — the corpus ages,
    // the router respects it. Discovery (searchResources) still finds it; routing does not.
    if (resource.status === "deprecated" || resource.status === "archived") continue;
    const signals = deriveRoutingSignals(resource);
    if (resource.type === "agent" && signals.agent_path) agentsByDir.set(signals.agent_path, resource);
    const { score, reasons } = await rank({ ...resource, body: "", route_text: signals.route_text }, terms, ctx);
    const avoidReasons = routeAvoidReasons(signals.avoid_text, terms);
    ranked.push({
      resource,
      score: avoidReasons.length ? 0 : score,
      reasons: [...new Set([...signals.reasons, ...reasons, ...avoidReasons])],
      route_scope: signals.route_scope,
      agent_path: signals.agent_path,
    });
  }
  ranked.sort((a, b) => b.score - a.score || compareByCodePoint(a.resource.path, b.resource.path));
  return { ranked, agentsByDir };
}

// Attach a configured help fallback to an HONEST abstention — never to a routed result, so analytics
// and route tests stay truthful. Eligible: out_of_scope (nothing above the floor), or a
// needs_clarification with no useful question. Target ids are resolved against the live inventory; a
// missing/typo'd target yields no fallback (graceful degradation), which `validateBase` warns about.
export function resolveFallback(configured, resources, decision) {
  if (!configured) return null;
  const eligible =
    decision.status === "out_of_scope" ||
    (decision.status === "needs_clarification" && !decision.next_question);
  if (!eligible) return null;
  const agent = resources.find((r) => r.type === "agent" && r.id === configured.agent);
  const process = resources.find((r) => r.type === "process" && r.id === configured.process);
  if (!agent || !process) return null;
  return { agent: { id: agent.id, path: agent.path }, process: { id: process.id, path: process.path } };
}

export function compareRoute(expect, actual) {
  const mismatches = [];
  const checks = [
    ["status", expect.status, actual.status],
    ["reason_code", expect.reason_code, actual.reason_code],
    ["agent", expect.agent, actual.agent?.id ?? null],
    ["process", expect.process, actual.process?.id ?? null],
  ];
  for (const [field, want, got] of checks) {
    if (want === undefined) continue;
    if (want !== got) mismatches.push(`${field}: attendu ${JSON.stringify(want)}, obtenu ${JSON.stringify(got)}`);
  }
  if (expect.fallback !== undefined) {
    const wantAgent = expect.fallback?.agent ?? null;
    const wantProcess = expect.fallback?.process ?? null;
    const gotAgent = actual.fallback?.agent?.id ?? null;
    const gotProcess = actual.fallback?.process?.id ?? null;
    if (wantAgent !== gotAgent) mismatches.push(`fallback.agent: attendu ${JSON.stringify(wantAgent)}, obtenu ${JSON.stringify(gotAgent)}`);
    if (wantProcess !== gotProcess) mismatches.push(`fallback.process: attendu ${JSON.stringify(wantProcess)}, obtenu ${JSON.stringify(gotProcess)}`);
  }
  return mismatches;
}

export function summarizeRoute(actual) {
  return {
    status: actual.status,
    reason_code: actual.reason_code,
    agent: actual.agent?.id ?? null,
    process: actual.process?.id ?? null,
    fallback: actual.fallback ? { agent: actual.fallback.agent?.id ?? null, process: actual.fallback.process?.id ?? null } : null,
  };
}
