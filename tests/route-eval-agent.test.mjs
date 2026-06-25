// The AGENT-IN-THE-LOOP routing eval's PURE pieces (tools/eval/route-eval-agent.mjs) — proven with no
// model: this is the faithful simulation of the lived route (the harness LLM reading the generated index
// and choosing), so the grading must be pinned model-free, exactly as the refiner's is. What is proven:
//   • renderAgentRoutingPrompt — the model sees EXACTLY what the harness gets: the routing consigne (the
//     canonical bootstrap) as the system turn, then the rendered index + the query as the user turn.
//   • interpretAgentReply — the JSON reply maps to the same RouteDecision the scorers grade, and a route
//     is accepted ONLY to a real (agent, process) pair in the index (off-list / mismatched → abstain).
//   • navigableCorpus — resolves a route only when the process truly belongs to the named agent.
//   • makeAgentRoute — drives an injected `complete` end to end with a stub model (no network).
//
// Spec coverage: FR-ROUTE-016

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  renderAgentRoutingPrompt,
  interpretAgentReply,
  navigableCorpus,
  makeAgentRoute,
} from "../tools/eval/route-eval-agent.mjs";
import { ROUTER_BODY } from "../tools/core/bootstrap.mjs";

// A two-agent registry, the shape buildRoutingRegistry produces — the SAME `renderRoutingIndex` reads.
const registry = {
  agents: [
    {
      agent: { id: "commercial", title: "Commercial", path: ".ai/agents/commercial/AGENT.md" },
      processes: [
        { id: "nouveau-devis", title: "Nouveau devis", path: ".ai/agents/commercial/skills/processes/nouveau-devis/SKILL.md" },
        { id: "relance-client", title: "Relance client", path: ".ai/agents/commercial/skills/processes/relance-client/SKILL.md" },
      ],
    },
    {
      agent: { id: "support", title: "Support", path: ".ai/agents/support/AGENT.md" },
      processes: [{ id: "ticket-incident", title: "Ticket incident", path: ".ai/agents/support/skills/processes/ticket-incident/SKILL.md" }],
    },
    // An orphan group (no agent card) must not be navigable — it cannot be routed to.
    { agent: null, processes: [{ id: "orphan", title: "Orphan", path: ".ai/agents/(orphan)/SKILL.md" }] },
  ],
};

const corpus = navigableCorpus(registry);

describe("renderAgentRoutingPrompt — the model sees exactly what the harness reads", () => {
  it("puts the routing consigne in the system turn and the index + query in the user turn", () => {
    const messages = renderAgentRoutingPrompt("prépare un devis", "INDEX-CONTENT-HERE");
    assert.equal(messages.length, 2);
    assert.equal(messages[0].role, "system");
    assert.equal(messages[1].role, "user");
    // The system turn IS the canonical bootstrap consigne — not a paraphrase — so the eval cannot drift
    // from what the harness is told: a recognisable line of ROUTER_BODY must be present verbatim.
    assert.ok(messages[0].content.includes("Descends racine → agent → process"), "the consigne's own descent rule is the system instruction");
    assert.ok(ROUTER_BODY.split("\n").some((line) => line && messages[0].content.includes(line)), "a ROUTER_BODY line appears verbatim");
    // The user turn carries the rendered index and the query.
    assert.ok(messages[1].content.includes("INDEX-CONTENT-HERE"), "the index content is fed to the model");
    assert.ok(messages[1].content.includes("prépare un devis"), "the user query is fed to the model");
  });
});

describe("navigableCorpus — a route resolves only to a real (agent, process) pair", () => {
  it("resolves an agent/process that exist together, and rejects every mismatch", () => {
    assert.ok(corpus.resolve("commercial", "nouveau-devis"), "a real pair resolves");
    assert.equal(corpus.resolve("commercial", "ticket-incident"), null, "a process of another agent does not resolve");
    assert.equal(corpus.resolve("support", "nouveau-devis"), null, "a process of another agent does not resolve");
    assert.equal(corpus.resolve("inconnu", "nouveau-devis"), null, "an unknown agent does not resolve");
    assert.equal(corpus.resolve("commercial", "inconnu"), null, "an unknown process does not resolve");
    assert.equal(corpus.resolve(null, "orphan"), null, "an orphan process has no navigable agent");
  });
});

describe("interpretAgentReply — JSON → RouteDecision, off-list never routes", () => {
  it("a clean route to a real pair becomes a `routed` decision naming the agent and process", () => {
    const d = interpretAgentReply({ decision: "route", agent: "commercial", process: "nouveau-devis", next_question: null }, corpus);
    assert.equal(d.status, "routed");
    assert.equal(d.agent.id, "commercial");
    assert.equal(d.process.id, "nouveau-devis");
  });

  it("a route to an off-list or mismatched pair abstains — it never invents a route", () => {
    const offList = interpretAgentReply({ decision: "route", agent: "commercial", process: "inexistant" }, corpus);
    assert.equal(offList.status, "needs_clarification", "an off-list process cannot be routed to");
    assert.equal(offList.process, null);
    assert.equal(offList.reason_code, "off_list_selection");

    const mismatch = interpretAgentReply({ decision: "route", agent: "support", process: "nouveau-devis" }, corpus);
    assert.equal(mismatch.status, "needs_clarification", "a process of another agent cannot be routed to");
  });

  it("out_of_scope and needs_clarification abstain honestly", () => {
    assert.equal(interpretAgentReply({ decision: "out_of_scope" }, corpus).status, "out_of_scope");

    const ask = interpretAgentReply({ decision: "needs_clarification", next_question: "Devis ou relance ?" }, corpus);
    assert.equal(ask.status, "needs_clarification");
    assert.equal(ask.next_question, "Devis ou relance ?");
  });

  it("a malformed or unrecognised reply abstains rather than guessing", () => {
    assert.equal(interpretAgentReply(null, corpus).status, "needs_clarification");
    assert.equal(interpretAgentReply("not json", corpus).status, "needs_clarification");
    assert.equal(interpretAgentReply({ decision: "huh" }, corpus).status, "needs_clarification");
    // A needs_clarification with no question still abstains, with a default question (never silent).
    const noQ = interpretAgentReply({ decision: "needs_clarification" }, corpus);
    assert.equal(noQ.status, "needs_clarification");
    assert.ok(noQ.next_question, "an abstention always carries a question");
  });
});

describe("makeAgentRoute — drives an injected model end to end (no network)", () => {
  it("feeds the consigne + index to the stub and routes on its reply", async () => {
    let sawSystem = false;
    let sawIndex = false;
    const complete = async ({ messages }) => {
      sawSystem = messages[0].role === "system" && messages[0].content.includes("Descends racine → agent → process");
      sawIndex = messages[1].content.includes("ROOT-INDEX");
      return { message: { role: "assistant", content: '{"decision":"route","agent":"commercial","process":"relance-client","next_question":null}' } };
    };
    const route = makeAgentRoute({ complete, indexContent: "ROOT-INDEX", corpus });
    const d = await route("relance le client Martin");
    assert.ok(sawSystem, "the consigne reached the model as the system turn");
    assert.ok(sawIndex, "the index reached the model as the user turn");
    assert.equal(d.status, "routed");
    assert.equal(d.process.id, "relance-client");
  });

  it("rejects a non-function `complete` loudly (a bad wiring is not silently run)", () => {
    assert.throws(() => makeAgentRoute({ complete: null, indexContent: "", corpus }), /requires a `complete` function/);
  });
});
