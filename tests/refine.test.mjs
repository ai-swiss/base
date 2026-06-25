// The Refiner adapter (tools/core/refine.mjs): the embedding strategy, stage 2 — precision by a small LLM.
// The model is injected as `complete`; a stub returns scripted JSON so every mapping — select →
// routed, off-list id → abstain, needs_clarification → carries the question, empty → out_of_scope —
// is proven without a model. The hallucination guard is a MECHANISM, exercised here directly.
//
// Spec coverage: FR-ROUTE-012

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { makeLlmRefiner } from "../tools/core/refine.mjs";

// A `complete` stub: returns the given assistant text. Records the request for prompt assertions.
const completeWith = (text, sink = {}) => async (request) => {
  sink.request = request;
  return { message: { role: "assistant", content: [{ type: "text", text }] }, usage: { input: 0, output: 0 }, finishReason: "stop" };
};

const candidate = (id, route_text, avoid_text = "", extra = {}) => ({
  resource: { id, type: "process", title: id, path: `.ai/agents/sales/skills/processes/${id}/SKILL.md`, ...extra },
  route_text,
  avoid_text,
  similarity: 0.5,
});

const candidates = [
  candidate("devis", "Préparer un devis."),
  candidate("facture", "Émettre une facture."),
];

describe("makeLlmRefiner — select", () => {
  it("maps a select with a valid id to a routed RouteDecision", async () => {
    const refine = makeLlmRefiner({ complete: completeWith('{"decision":"select","process_id":"devis","next_question":null}') });
    const out = await refine("préparer un devis", candidates);

    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "devis");
    assert.equal(out.next_question, null);
    assert.equal(out.candidates.length, 2, "the shortlist travels for explainability");
  });

  it("resolves the agent when the agent candidate was retrieved alongside the process", async () => {
    const withAgent = [
      candidate("devis", "Préparer un devis."),
      { resource: { id: "sales", type: "agent", title: "Ventes", path: ".ai/agents/sales/AGENT.md" }, route_text: "Ventes.", avoid_text: "", similarity: 0.3 },
    ];
    const refine = makeLlmRefiner({ complete: completeWith('{"decision":"select","process_id":"devis"}') });
    const out = await refine("devis", withAgent);
    assert.equal(out.process.id, "devis");
    assert.equal(out.agent.id, "sales", "the sibling agent is resolved from the same agent directory");
  });

  it("tolerates JSON wrapped in prose or a markdown fence (mirrors completeJson)", async () => {
    const refine = makeLlmRefiner({ complete: completeWith('Voici ma décision:\n```json\n{"decision":"select","process_id":"facture"}\n```') });
    const out = await refine("facturer le client", candidates);
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "facture");
  });
});

describe("makeLlmRefiner — the hallucination guard (MECHANISM)", () => {
  it("abstains when the selected id is not one of the candidates — never a fabricated route", async () => {
    const refine = makeLlmRefiner({ complete: completeWith('{"decision":"select","process_id":"inventé"}') });
    const out = await refine("demande", candidates);

    assert.equal(out.status, "needs_clarification");
    assert.equal(out.reason_code, "off_list_selection");
    assert.equal(out.process, null, "no route is taken to an off-list target");
  });

  it("abstains when select carries no process_id", async () => {
    const refine = makeLlmRefiner({ complete: completeWith('{"decision":"select","process_id":null}') });
    const out = await refine("demande", candidates);
    assert.equal(out.status, "needs_clarification");
    assert.equal(out.process, null);
  });
});

describe("makeLlmRefiner — abstentions", () => {
  it("needs_clarification carries the model's question", async () => {
    const refine = makeLlmRefiner({ complete: completeWith('{"decision":"needs_clarification","next_question":"Devis ou facture ?"}') });
    const out = await refine("quelque chose de commercial", candidates);

    assert.equal(out.status, "needs_clarification");
    assert.equal(out.next_question, "Devis ou facture ?");
    assert.equal(out.process, null);
  });

  it("out_of_scope maps through", async () => {
    const refine = makeLlmRefiner({ complete: completeWith('{"decision":"out_of_scope","process_id":null,"next_question":null}') });
    const out = await refine("la météo", candidates);
    assert.equal(out.status, "out_of_scope");
  });

  it("an unparseable reply abstains rather than crashing", async () => {
    const refine = makeLlmRefiner({ complete: completeWith("je ne sais pas répondre en JSON") });
    const out = await refine("demande", candidates);
    assert.equal(out.status, "needs_clarification");
    assert.ok(out.next_question, "it asks a question rather than guessing");
  });

  it("an empty candidate list is out_of_scope WITHOUT calling the model", async () => {
    let called = false;
    const refine = makeLlmRefiner({ complete: async () => { called = true; return { message: { role: "assistant", content: [] } }; } });
    const out = await refine("rien à router", []);
    assert.equal(out.status, "out_of_scope");
    assert.equal(called, false, "no candidates → no model call");
  });
});

describe("makeLlmRefiner — the prompt is authored and cites the signals", () => {
  it("includes each candidate's id and «Quand l'utiliser» in the user prompt", async () => {
    const sink = {};
    const refine = makeLlmRefiner({ complete: completeWith('{"decision":"out_of_scope"}', sink) });
    await refine("préparer un devis", candidates);

    const userMsg = sink.request.messages.find((m) => m.role === "user").content;
    assert.ok(userMsg.includes("devis"), "candidate id is in the prompt");
    assert.ok(userMsg.includes("Préparer un devis."), "the «Quand l'utiliser» signal is cited");
    const sysMsg = sink.request.messages.find((m) => m.role === "system").content;
    assert.ok(sysMsg.includes("Quand l'utiliser") && sysMsg.includes("Éviter si"), "the rule names both signals");
  });

  it("requires a complete function", () => {
    assert.throws(() => makeLlmRefiner({}), /requires a `complete` function/);
  });
});
