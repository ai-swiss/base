// Pure routing computation, extracted from the base-core facade. Given an already-inventoried
// corpus it derives a routing signal per routable resource, scores candidates with the SAME Ranker
// contract as discovery, applies the structural decision rules, and attaches an honest help
// fallback to an abstention. No filesystem, no trace side effects: the traced wrappers
// (routeRequest, runRouteTests) stay in base-core and call computeRoute over one inventory. Imports
// only leaf core modules, so base-core depends on this module, never the reverse.

import { normalize, lexicalRanker, composeRankers } from "./rankers.mjs";
import { compareByCodePoint } from "./ordering.mjs";
import { deriveRoutingSignals, decideRoute, ROUTING_DEFAULTS, ROUTABLE_KINDS, agentDirOf } from "./routing.mjs";

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
  // The measured closed class of French function words (calibrated on a 600-process corpus, 604
  // queries at 3 scales: exactly the non-content words that scored, and the list that keeps every
  // real fixture green). Verb forms that carry signal (faire/fait, pouvoir forms) stay OUT:
  // stripping them breaks real requests like «Que fait le MCP ?».
  // Negations — «ça ne marche pas» must not credit a use_when for containing «ne … pas»:
  "ne",
  "pas",
  "jamais",
  "rien",
  "plus",
  "non",
  "ni",
  "sans",
  // Interrogatives and subordinators — every use_when starts with «Quand», so «quand ?» scored 100 % of a corpus:
  "quand",
  "quel",
  "quelle",
  "quels",
  "quelles",
  "lorsque",
  "si",
  "comme",
  "dont",
  "qu",
  // Demonstratives and pronouns:
  "ce",
  "cet",
  "cette",
  "ces",
  "elle",
  "elles",
  "ils",
  "tu",
  "te",
  "se",
  "sa",
  "ta",
  "ma",
  "moi",
  "toi",
  "lui",
  "leur",
  "leurs",
  // Conjunction adverbs:
  "mais",
  "donc",
  "alors",
  "encore",
  "deja",
  // Prepositions:
  "vers",
  "sous",
  "chez",
  "entre",
  // Degree adverbs:
  "tres",
  "bien",
  "tout",
  "toute",
  "tous",
  "trop",
  "peu",
  "assez",
  "aussi",
  "meme",
  // An impersonal modal («il faut») alone must not clear the routing floor (70 > 30):
  "faut",
  "faudrait",
  // Polite request formulas — they express THAT one asks, never WHAT:
  "besoin",
  "envie",
  "aimerais",
  "voudrais",
  "voudrait",
  "souhaite",
  "stp",
  "svp",
  "please",
  "juste",
  "vraiment",
]);

export function routeTerms(request) {
  return [...new Set(
    normalize(request)
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 2 && !STOPWORDS.has(word)),
  )];
}

export function routeAvoidReasons(avoidEntries, terms) {
  const entries = (Array.isArray(avoidEntries) ? avoidEntries : [avoidEntries]).filter((e) => typeof e === "string" && e.trim());
  if (entries.length === 0 || terms.length === 0) return [];
  // The veto is judged per counter-example, never across their concatenation: «créer un nouveau
  // devis» plus «un problème vague avec un client» must not combine into a veto on «relancer le
  // client qui n'a pas répondu au devis» that neither entry justifies alone — a process whose
  // counter-examples share its own nouns would otherwise veto itself out of every request.
  const minimumHits = terms.length === 1 ? 1 : 2;
  const hits = new Set();
  for (const entry of entries) {
    // A short term (≤ 3 chars) must match a WHOLE avoid word — otherwise «ma» fires on
    // «manger» and «ur» (from «sœur») on «sur». Longer terms keep substring recall, so
    // «calcule» still matches «calculer» (morphology without a stemmer).
    const hay = normalize(entry);
    const entryTokens = new Set(routeTerms(entry));
    const entryHits = terms.filter((term) => (term.length <= 3 ? entryTokens.has(term) : hay.includes(term)));
    if (entryHits.length >= minimumHits) for (const term of entryHits) hits.add(term);
  }
  return [...hits].map((term) => `route_avoid:${term}`);
}

// A counter-example written with the process's OWN words vetoes the requests the process exists for.
// The veto zeroes a candidate's score (see rankResources), so «éviter si: pas pour l'intégration
// d'une personne, la procédure le décrit» removes «transformer notre intégration en procédure» from
// the race — the author's own avoid line beats their own use_when, and the user hears "no process
// covers this".
//
// The check replays the author's DECLARED phrasings (routing.examples: real requests, in their
// words) through the SAME veto the router applies, so a warning states what will happen, never a
// resemblance. A process without declared examples raises nothing here: there is no phrasing to
// judge, and inventing one from the use_when sentence would flag well-written cards (a sentence
// carries far more words than a request, and two shared words are enough to veto).
/**
 * @param {any} resource
 * @returns {{ phrasing: string, terms: string[] }[]} the declared phrasings this resource's own
 * `avoid_when` would discard, each with the shared words that cause it.
 */
export function selfVetoedPhrasings(resource) {
  const declared = resource?.metadata?.routing?.examples;
  if (!Array.isArray(declared) || declared.length === 0) return [];
  const signals = deriveRoutingSignals(resource);
  if (!signals.avoid_entries?.length) return [];
  const vetoed = [];
  for (const phrasing of declared) {
    if (typeof phrasing !== "string" || !phrasing.trim()) continue;
    const reasons = routeAvoidReasons(signals.avoid_entries, routeTerms(phrasing));
    if (reasons.length) vetoed.push({ phrasing, terms: reasons.map((r) => r.replace(/^route_avoid:/, "")) });
  }
  return vetoed;
}

// Replay corpus: the authors' OWN declared phrasings (metadata.routing.examples) as route-test
// cases — the drift guard for «formulations telles que vos utilisateurs les emploient», with a
// scope-aware expect (an agent example asserts the agent; a process example asserts the process).
// Pure corpus → cases; same comparator, same summary, zero new fixture format.
export function casesFromExamples(resources) {
  return resources.flatMap((resource) => {
    const declared = resource.metadata?.routing?.examples;
    if (!Array.isArray(declared)) return [];
    const expect = resource.type === "agent" ? { agent: resource.id } : { process: resource.id };
    return declared.filter((e) => typeof e === "string" && e.trim()).map((request) => ({ request, expect }));
  });
}

// A first fixtures file, drafted from the corpus. The blank page is what keeps most roots from
// having fixtures at all, and a root without fixtures has no guard on the routes it promises.
// One case per routable process: its first declared example when it has one (a real phrasing), else
// its «Quand utiliser» sentence, which the author then rewrites in their users' words. Pure: the
// caller writes the file.
/** @param {any[]} resources @returns {{ request: string, expect: { agent?: string, process: string } }[]} */
export function scaffoldRouteCases(resources) {
  const agentOf = new Map();
  for (const resource of resources) {
    if (resource.type === "agent") agentOf.set(agentDirOf(resource.path), resource.id);
  }
  const cases = [];
  for (const resource of resources) {
    if (resource.type !== "process") continue;
    if (resource.status === "deprecated" || resource.status === "archived") continue;
    const declared = resource.metadata?.routing?.examples;
    const example = Array.isArray(declared) ? declared.find((e) => typeof e === "string" && e.trim()) : null;
    const request = (example ?? deriveRoutingSignals(resource).route_text ?? "").trim();
    if (!request) continue;
    const agent = agentOf.get(agentDirOf(resource.path));
    cases.push({ request, expect: agent ? { agent, process: resource.id } : { process: resource.id } });
  }
  return cases;
}

// Router orchestration: derive a routing signal per routable resource, score candidates with the
// SAME Ranker contract as discovery (ctx.mode="route" + an enriched `route_text` field), then apply
// the structural decision rules. Returns { status, reason_code, agent, process, candidates,
// explanation, next_question } — a route or an honest abstention, never a fabricated confidence.
export async function computeRoute(root, request, resources, cfg, { limit, signal, framework } = /** @type {{ limit?: number, signal?: AbortSignal, framework?: { root: string, resources: any[] } | null }} */ ({})) {
  const terms = routeTerms(request);
  const thresholds = { ...ROUTING_DEFAULTS, ...(cfg.routing ?? {}) };
  if (typeof limit === "number" && limit > 0) thresholds.max_candidates = limit;
  const ctx = { root, mode: "route", query: request, signal };
  const rankers = [lexicalRanker, ...(cfg.rankers ?? [])];
  const { ranked, agentsByDir } = await rankResources(resources, terms, composeRankers(rankers), ctx);
  const decision = decideRoute(ranked, agentsByDir, thresholds);
  const fallback = resolveFallback(cfg.routing?.fallback, resources, decision, framework ?? null);
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
    const avoidReasons = routeAvoidReasons(signals.avoid_entries, terms);
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
//
// A root may name a target it does not own: the framework's welcome process is the obvious help for
// "I am lost", and copying it into every root would mean every root ages its own copy. So a second
// corpus may be passed, the FRAMEWORK's (see framework-root.mjs), searched only when the root's own
// corpus does not hold the target. Its paths are ABSOLUTE, because they lie outside the root and a
// root-relative path would be a lie; `source` says which corpus answered, so a caller can say where
// the process lives instead of pointing at a file the root does not have.
/**
 * @param {{ agent: string, process: string } | null | undefined} configured
 * @param {any[]} resources @param {{ status: string, next_question?: string | null }} decision
 * @param {{ root: string, resources: any[] } | null} [framework]
 */
export function resolveFallback(configured, resources, decision, framework = null) {
  if (!configured) return null;
  const eligible =
    decision.status === "out_of_scope" ||
    (decision.status === "needs_clarification" && !decision.next_question);
  if (!eligible) return null;
  return pickFallback(configured, resources, "root", null) ??
    (framework ? pickFallback(configured, framework.resources ?? [], "framework", framework.root) : null);
}

/** @param {any} configured @param {any[]} resources @param {"root" | "framework"} source @param {string | null} absoluteBase */
function pickFallback(configured, resources, source, absoluteBase) {
  const agent = resources.find((r) => r.type === "agent" && r.id === configured.agent);
  const process = resources.find((r) => r.type === "process" && r.id === configured.process);
  if (!agent || !process) return null;
  const at = (resource) => (absoluteBase ? `${absoluteBase}/${resource.path}` : resource.path);
  return {
    agent: { id: agent.id, path: at(agent) },
    process: { id: process.id, path: at(process) },
    source,
    // The BASE root these paths belong to, when it is not the root that was routed. A remote MCP
    // client has no access to the server's filesystem, so the server reads the help process from
    // here and inlines it; a local harness uses the absolute paths above.
    ...(absoluteBase ? { root: absoluteBase } : {}),
  };
}

/** Does this corpus hold both ends of the configured fallback? (Cheap pre-check before any I/O.) */
export function fallbackResolvesIn(configured, resources) {
  return Boolean(configured) && Boolean(pickFallback(configured, resources, "root", null));
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
    // WHY, not only WHAT: the slim shortlist (already capped at max_candidates by decideRoute) rides
    // along so a failing fixture shows the scores and reasons the author must act on — without
    // re-running `base route` case by case.
    candidates: (actual.candidates ?? []).map((c) => ({ id: c.resource?.id ?? null, score: c.score, reasons: c.reasons ?? [] })),
  };
}
