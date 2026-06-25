// tools/core/refine.mjs — the Refiner adapter (the embedding strategy, stage 2: precision by a small LLM).
//
// A `Refiner` port implementation (tools/core/router.mjs): `(query, candidates) => RouteDecision`.
// The retriever hands it the few candidates; the refiner reads each one's «Quand l'utiliser» /
// «Éviter si» and the query, asks the model for ONE structured decision, and maps it to the same
// `RouteDecision` the deterministic floor returns — so the caller compares one type across both strategies.
//
// Ports & Adapters: the model is injected as `complete` (a base-llm LanguageModel's `.complete`),
// invoked through the SAME mechanism the eval judge uses — `completeJson`: temperature 0, optional
// json-mode, one corrective "JSON only" retry, brace-matched extraction. This module imports no model
// client; it tests with a stub `complete` and no network (see tests/refine.test.mjs).
//
// Hallucination is structurally impossible, by MECHANISM not by consigne: the model returns a
// `process_id`, and the refiner accepts it ONLY if it is one of the candidate ids it was given. A
// fabricated or off-list id is not "trusted then checked" — it abstains (needs_clarification), so the
// model can never route to a target outside the retrieved, deny-filtered set.

import { completeJson } from "@ai-swiss/base-llm";
import { agentDirOf } from "./routing.mjs";

// The refiner prompt — the locus of routing quality. Authored, not assembled ad hoc: it states the
// one-sentence rule (pick the single best fit, or abstain), names the two signals it must weigh
// («Quand l'utiliser» pour, «Éviter si» contre), and pins the output to a closed structured shape so
// the parse is trivial and an off-list id cannot slip through. Swiss-romand punctuation throughout.
const REFINER_SYSTEM = [
  "Tu es le ROUTEUR de précision de BASE. On te donne une demande d'utilisateur et une courte liste",
  "de process candidats, chacun avec son «Quand l'utiliser» (ce qu'il couvre) et son «Éviter si» (ce",
  "qu'il ne couvre pas). Choisis le SEUL process qui répond le mieux à la demande.",
  "",
  "Règle, en une phrase: route vers un process seulement si son «Quand l'utiliser» couvre clairement",
  "la demande et qu'aucun «Éviter si» ne s'y applique; sinon abstiens-toi et pose une question.",
  "",
  "Trois issues, jamais une fausse certitude:",
  "  • select — un candidat couvre clairement la demande. Donne son id (exactement tel qu'écrit).",
  "  • needs_clarification — plusieurs candidats plausibles, ou demande ambiguë. Pose UNE question",
  "    courte qui permette de trancher.",
  "  • out_of_scope — aucun candidat ne couvre la demande.",
  "",
  "Contraintes dures: `process_id` doit être l'un des ids listés, copié à l'identique — n'en invente",
  "jamais. Pour `select`, `process_id` est obligatoire. Pour `needs_clarification`, `next_question`",
  "est obligatoire.",
  "",
  "Réponds UNIQUEMENT avec un objet JSON de cette forme:",
  '{"decision": "select" | "needs_clarification" | "out_of_scope", "process_id": string | null, "next_question": string | null}',
].join("\n");

/**
 * Build a `Refiner` from an injected `complete` (a LanguageModel's `.complete` method).
 * @param {{ complete: (request: object, ctx?: object) => Promise<{ message: object }>, jsonMode?: boolean }} deps
 * @returns {(query: string, candidates: Array<object>) => Promise<import("./router.mjs").RouteDecision>}
 */
export function makeLlmRefiner({ complete, jsonMode = false }) {
  if (typeof complete !== "function") throw new TypeError("makeLlmRefiner requires a `complete` function");
  const model = { complete };

  return async function refine(query, candidates) {
    const list = Array.isArray(candidates) ? candidates : [];
    // An empty candidate set is an honest, model-free out_of_scope: the retriever found nothing to
    // route to, so there is no question to ask and no call to make.
    if (list.length === 0) {
      return decision("out_of_scope", null, null, [], "Aucun candidat pertinent pour cette demande.", null);
    }

    const byId = indexById(list);
    const messages = [
      { role: "system", content: REFINER_SYSTEM },
      { role: "user", content: renderPrompt(query, list) },
    ];
    const raw = await completeJson(model, messages, {}, { jsonMode });
    return interpret(raw, byId, list, query);
  };
}

// Map the parsed model output to a RouteDecision. Every branch is defensive: an unparseable reply, an
// unknown `decision`, a `select` with no/off-list `process_id`, or a `needs_clarification` with no
// question all collapse to an HONEST abstention rather than a guessed or fabricated route.
function interpret(raw, byId, candidates, query) {
  const shortlist = candidates.map((c) => slimResource(c.resource));
  if (!raw || typeof raw !== "object") {
    return decision("needs_clarification", null, null, shortlist,
      "Le raffineur n'a pas rendu de décision exploitable.",
      "Pouvez-vous préciser votre demande ?");
  }

  const kind = raw.decision;
  if (kind === "out_of_scope") {
    return decision("out_of_scope", null, null, shortlist, "Aucun candidat ne couvre cette demande.", null);
  }

  if (kind === "select") {
    const picked = typeof raw.process_id === "string" ? byId.get(raw.process_id) : undefined;
    // MECHANISM: an id the refiner did not propose can never be routed to. An off-list (or absent) id
    // is treated as an abstention, never as a route — the structural guarantee against hallucination.
    if (!picked) {
      return decision("needs_clarification", "off_list_selection", null, shortlist,
        "Le raffineur a proposé un process hors de la liste des candidats; aucune route n'est prise.",
        "Pouvez-vous préciser votre demande ?");
    }
    const { agent, process } = resolveTargets(picked, candidates);
    return decision("routed", null, agent, shortlist,
      `Route: ${agent?.title || agent?.id || "agent"} → ${process?.title || process?.id}.`, null, process);
  }

  // needs_clarification (or any unrecognised decision → abstain rather than invent a route).
  const question = typeof raw.next_question === "string" && raw.next_question.trim()
    ? raw.next_question.trim()
    : "Pouvez-vous préciser votre demande ?";
  return decision("needs_clarification", null, null, shortlist,
    "Plusieurs process plausibles, ou demande ambiguë.", question);
}

// Resolve the chosen candidate into agent + process slims. A process's agent is the agent candidate
// sharing its `.ai/agents/<x>` directory, if it was retrieved too (else null — the route still names
// the process). An agent candidate routes as agent-only.
function resolveTargets(picked, candidates) {
  if (picked.resource.type === "agent") {
    return { agent: slimResource(picked.resource), process: null };
  }
  const dir = agentDirOf(picked.resource.path);
  const agentCandidate = candidates.find((c) => c.resource.type === "agent" && agentDirOf(c.resource.path) === dir);
  return { agent: agentCandidate ? slimResource(agentCandidate.resource) : null, process: slimResource(picked.resource) };
}

// Render the candidate list for the prompt: each as `[id] route_text (éviter: avoid_text)`, derived
// signals only (never a file body) — exactly the «Quand l'utiliser» / «Éviter si» the rule weighs.
function renderPrompt(query, candidates) {
  const lines = candidates.map((c) => {
    const avoid = c.avoid_text ? ` — Éviter si: ${c.avoid_text}` : "";
    return `- id: ${c.resource.id}\n  Quand l'utiliser: ${c.route_text || "(non précisé)"}${avoid}`;
  });
  return [
    `Demande: ${String(query ?? "").trim()}`,
    "",
    "Candidats:",
    ...lines,
    "",
    "Rends la décision JSON.",
  ].join("\n");
}

function indexById(candidates) {
  const map = new Map();
  for (const c of candidates) map.set(c.resource.id, c);
  return map;
}

function slimResource(resource) {
  if (!resource) return null;
  return { id: resource.id, type: resource.type, title: resource.title ?? null, path: resource.path };
}

// The one RouteDecision shape, identical to decideRoute's `outcome()` — both strategies speak it.
/**
 * @param {string} status @param {string | null} reason_code
 * @param {object | null} agent @param {Array<object>} candidates
 * @param {string} explanation @param {string | null} next_question @param {object | null} [process]
 * @returns {import("./router.mjs").RouteDecision}
 */
function decision(status, reason_code, agent, candidates, explanation, next_question, process = null) {
  return { status: /** @type {any} */ (status), reason_code, agent: /** @type {any} */ (agent), process: /** @type {any} */ (process), candidates, explanation, next_question };
}
