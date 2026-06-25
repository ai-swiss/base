// tools/eval/route-eval-agent.mjs — the AGENT-IN-THE-LOOP routing eval: a faithful simulation of the
// path that actually dominates in practice. The harness LLM (Claude Code) reads the generated index and
// chooses; this measures THAT, on a configurable model, as a DIAGNOSTIC of the real experience.
//
// WHAT THIS MEASURES, AND WHY IT IS NOT A SCORE. The deterministic floor is gone and the embedding path
// (recall@k + the refiner diagnostic) measures retrieval, not the lived route. The lived route is the
// harness reading the index: it gets the routing consigne (the bootstrap's ROUTER_BODY) as its system
// instruction, the generated index content (root → agents → processes, each with «Quand l'utiliser» /
// «Éviter si»), and the user query — then picks a process or abstains honestly. This module gives an LLM
// EXACTLY that and scores its decision against the same golden set, through the same PURE scorers
// (scoreCase / summarizeEval / summarizeRefiner) the refiner rides — so the grading is identical and the
// measurements are comparable.
//
// It is a DIAGNOSTIC, model-dependent by construction: a small local model is only INDICATIVE; the REAL
// routing runs on the user's OWN far-stronger AI (Claude Code). It earns the same NOT_A_TARGET header as
// the rest. Do NOT tune the consigne or the index to lift a small model's number — that would be tuning
// the lived router (the consigne) to a probe it is not run on.
//
// Two pure pieces, model-free and unit-tested:
//   • renderAgentRoutingPrompt — assemble the consigne + the index content + the query into the system
//     and user messages, exactly what the harness reads (no model, no I/O — the index is rendered upstream).
//   • interpretAgentReply — map the model's structured JSON to a RouteDecision over the navigable corpus,
//     accepting a route ONLY to a process that exists in the index (an off-list id abstains, never routes).
// The `complete` injection (makeAgentRoute) binds a real model; the corpus/index rendering binds upstream.

import { completeJson } from "@ai-swiss/base-llm";
import { ROUTER_INTRO, ROUTER_BODY } from "../core/bootstrap.mjs";

// The task framing that turns the harness consigne into a measurable single-shot decision. In the live
// harness, the consigne tells the LLM to CONFIRM its read with the deterministic router (MCP/CLI) and to
// surface the abstention it returns; here the LLM has no such tool, so it must emit the decision the
// router would otherwise confirm. The judgement rule is UNCHANGED — it is the consigne's own «descends
// racine → agent → process; retiens le process dont le «Quand l'utiliser» couvre la demande, en
// respectant «Éviter si»; si aucun ne la couvre, abstiens-toi» — only the OUTPUT is pinned to JSON so the
// parse is trivial. Swiss-romand punctuation throughout.
const AGENT_TASK = [
  "Tu effectues ce routage toi-même: lis l'index ci-dessous et rends ta décision. Il n'y a ni outil MCP",
  "ni CLI à appeler dans cet exercice; tu produis directement la décision que le routeur confirmerait.",
  "",
  "Applique la règle de l'index sans la durcir ni l'assouplir: route vers un process seulement si son",
  "«Quand l'utiliser» couvre clairement la demande et qu'aucun «Éviter si» ne s'y applique; sinon",
  "abstiens-toi (ne devine pas).",
  "",
  "Trois issues, jamais une fausse certitude:",
  "  • route — un process couvre clairement la demande. Donne son `agent` et son `process` (les ids",
  "    exacts tels qu'écrits dans l'index, entre crochets [..]).",
  "  • needs_clarification — plusieurs process plausibles, ou demande trop vague pour trancher. Pose UNE",
  "    question courte qui permette de choisir.",
  "  • out_of_scope — aucun agent ni process de l'index ne couvre la demande.",
  "",
  "Contraintes dures: `agent` et `process` doivent être des ids présents dans l'index, copiés à",
  "l'identique. Pour `route`, les deux sont obligatoires. Pour `needs_clarification`, `next_question` est",
  "obligatoire.",
  "",
  "Réponds UNIQUEMENT avec un objet JSON de cette forme:",
  '{"decision": "route" | "needs_clarification" | "out_of_scope", "agent": string | null, "process": string | null, "next_question": string | null}',
].join("\n");

// The system instruction is the harness's own routing consigne, sourced from the canonical bootstrap
// (ROUTER_INTRO + ROUTER_BODY) so the eval and the lived harness can never drift — the eval feeds EXACTLY
// what the harness is told. The task framing follows, then the index is the user turn.
const CONSIGNE_SYSTEM = [`${ROUTER_INTRO}`, "", ROUTER_BODY, "", "---", "", AGENT_TASK].join("\n");

/**
 * Assemble the two messages the agent-in-the-loop sees: the routing consigne (the harness's own
 * bootstrap, plus the JSON task framing) as the system turn, and the rendered index content followed by
 * the query as the user turn. PURE — the index markdown is rendered upstream (the exact `.ai/routing`
 * tree the harness reads), so this assembles text and calls no model and touches no disk.
 * @param {string} query @param {string} indexContent the concatenated root + agent index markdown
 * @returns {Array<{ role: "system" | "user", content: string }>}
 */
export function renderAgentRoutingPrompt(query, indexContent) {
  const user = [
    "Voici l'index de routage généré (racine, puis chaque agent et ses process):",
    "",
    indexContent,
    "",
    "---",
    "",
    `Demande de l'utilisateur: ${String(query ?? "").trim()}`,
    "",
    "Rends la décision JSON.",
  ].join("\n");
  return [
    { role: "system", content: CONSIGNE_SYSTEM },
    { role: "user", content: user },
  ];
}

/**
 * Map the agent's parsed JSON reply to a RouteDecision over the navigable corpus. Every branch is honest:
 * an unparseable reply, an unknown `decision`, a `route` whose agent/process is not in the index, or a
 * `needs_clarification` with no question all collapse to an abstention rather than a guessed route.
 * MECHANISM (mirrors refine.mjs): a `route` is accepted ONLY when both ids resolve to real index targets
 * AND the process belongs to the named agent — an off-list or mismatched id never routes, so the model
 * cannot route outside what the index actually navigates.
 * @param {unknown} raw the parsed JSON object @param {NavigableCorpus} corpus the index's agents+processes
 * @returns {import("../core/router.mjs").RouteDecision}
 */
export function interpretAgentReply(raw, corpus) {
  if (!raw || typeof raw !== "object") {
    return decision("needs_clarification", null, null, "L'agent n'a pas rendu de décision exploitable.", "Pouvez-vous préciser votre demande ?");
  }

  const reply = /** @type {{ decision?: unknown, agent?: unknown, process?: unknown, next_question?: unknown }} */ (raw);
  if (reply.decision === "out_of_scope") {
    return decision("out_of_scope", null, null, "Aucun agent ni process de l'index ne couvre cette demande.", null);
  }

  if (reply.decision === "route") {
    const agentId = typeof reply.agent === "string" ? reply.agent : null;
    const processId = typeof reply.process === "string" ? reply.process : null;
    const resolved = agentId && processId ? corpus.resolve(agentId, processId) : null;
    // MECHANISM: a target the index does not navigate can never be routed to. An off-list (or mismatched)
    // pair is an abstention, never a route — the structural guarantee against an invented route.
    if (!resolved) {
      return decision("needs_clarification", null, null, "L'agent a proposé un agent/process absent de l'index; aucune route n'est prise.", "Pouvez-vous préciser votre demande ?", "off_list_selection");
    }
    return decision("routed", resolved.agent, resolved.process, `Route: ${resolved.agent.title || resolved.agent.id} → ${resolved.process.title || resolved.process.id}.`, null);
  }

  // needs_clarification (or any unrecognised decision → abstain rather than invent a route).
  const next = reply.next_question;
  const question = typeof next === "string" && next.trim() ? next.trim() : "Pouvez-vous préciser votre demande ?";
  return decision("needs_clarification", null, null, "Plusieurs process plausibles, ou demande ambiguë.", question);
}

/**
 * The navigable corpus the index materialises: the agents and their processes, with the lookup the
 * interpreter uses to accept a route only to a real (agent, process) pair. Built from the routing
 * registry — the SAME source `renderRoutingIndex` reads — so the ids the model sees in the index are
 * exactly the ids `resolve` accepts. PURE over the registry data.
 * @typedef {{ resolve: (agentId: string, processId: string) => { agent: TargetRef, process: TargetRef } | null }} NavigableCorpus
 * @typedef {{ id: string, type: string, title: string | null, path: string }} TargetRef
 *
 * @param {{ agents: Array<{ agent: { id: string, title?: string | null, path: string } | null, processes: Array<{ id: string, title?: string | null, path: string }> }> }} registry
 * @returns {NavigableCorpus}
 */
export function navigableCorpus(registry) {
  // Index processes by their agent's id → (process id → process), so a route is accepted only when the
  // process truly belongs to the named agent (the index never lists a process under a foreign agent).
  const byAgent = new Map();
  const agents = new Map();
  for (const entry of registry.agents) {
    if (!entry.agent) continue; // an orphan group has no navigable agent (mirrors renderRoutingIndex)
    const agent = { id: entry.agent.id, type: "agent", title: entry.agent.title ?? null, path: entry.agent.path };
    agents.set(agent.id, agent);
    const processes = new Map();
    for (const p of entry.processes) processes.set(p.id, { id: p.id, type: "process", title: p.title ?? null, path: p.path });
    byAgent.set(agent.id, processes);
  }
  return {
    resolve(agentId, processId) {
      const agent = agents.get(agentId);
      const process = byAgent.get(agentId)?.get(processId);
      return agent && process ? { agent, process } : null;
    },
  };
}

/**
 * Build the agent-in-the-loop route function from an injected `complete` (a LanguageModel's `.complete`),
 * the rendered index content, and the navigable corpus. The model reads the consigne + the index + the
 * query (via completeJson: temperature 0, one corrective retry, brace-matched extraction — the same
 * mechanism the refiner uses) and its reply is interpreted over the corpus. Errors are NOT swallowed (an
 * eval must see a failure); a thrown call is the runner's to record as one wrong case.
 * @param {{ complete: (request: object, ctx?: object) => Promise<{ message: object }>, indexContent: string, corpus: NavigableCorpus, jsonMode?: boolean }} deps
 * @returns {(query: string) => Promise<import("../core/router.mjs").RouteDecision>}
 */
export function makeAgentRoute({ complete, indexContent, corpus, jsonMode = false }) {
  if (typeof complete !== "function") throw new TypeError("makeAgentRoute requires a `complete` function");
  const model = { complete };
  return async function route(query) {
    const messages = renderAgentRoutingPrompt(query, indexContent);
    const raw = await completeJson(model, messages, {}, { jsonMode });
    return interpretAgentReply(raw, corpus);
  };
}

// The one RouteDecision shape, identical to refine.mjs's and decideRoute's — every strategy speaks it, so
// the same PURE scorers grade the agent-in-the-loop run and the refiner run alike.
/**
 * @param {string} status @param {TargetRef | null} agent @param {TargetRef | null} process
 * @param {string} explanation @param {string | null} next_question @param {string | null} [reason_code]
 * @returns {import("../core/router.mjs").RouteDecision}
 */
function decision(status, agent, process, explanation, next_question, reason_code = null) {
  return { status: /** @type {any} */ (status), reason_code, agent, process, candidates: [], explanation, next_question };
}
