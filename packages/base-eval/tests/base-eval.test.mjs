// Spec coverage: UR-CORE-001
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// base-eval is decoupled (DI); tests drive it with the faux model from the sibling base-llm package.
import { createFauxModel } from "../../base-llm/index.mjs";
import {
  baseNativeHarness,
  createLlmEvaluator,
  createSimulatedUser,
  extractJson,
  FAILURE_MODES,
  normalizeVerdict,
  runConversation,
  runScenario,
  VerdictError,
} from "../index.mjs";

const scenario = {
  id: "devis-conseil",
  seedInput: "Je veux un devis pour 3 jours de conseil.",
  goals: ["Obtenir un devis chiffré pour 3 jours de conseil", "Le montant doit être justifié, pas inventé"],
};

function priceToolset() {
  return {
    lookup_price: {
      def: { name: "lookup_price", description: "Daily rate for a service", parameters: { type: "object", properties: { item: { type: "string" } } } },
      run: (args) => `${args.item ?? "service"}: 100 CHF/jour`,
    },
  };
}

describe("base-eval — end-to-end happy path (faux SUT/runner/evaluator)", () => {
  it("drives a tool-using SUT, the runner ends satisfied, the judge returns goal_met", async () => {
    const sut = createFauxModel([
      { toolCalls: [{ id: "c1", name: "lookup_price", arguments: { item: "conseil" } }] },
      "Voici votre devis : 3 jours de conseil à 100 CHF/jour = 300 CHF HT.",
    ]);
    const runner = createSimulatedUser(createFauxModel('{"status":"satisfied","message":"Parfait, merci."}'));
    const evaluator = createLlmEvaluator(
      createFauxModel('{"outcome":"goal_met","confidence":0.92,"evidence":[{"turn":0,"quote":"300 CHF HT","why":"chiffré et justifié par le tarif"}],"rationale":"Devis chiffré à partir du tarif réel."}'),
    );
    const harness = baseNativeHarness({ systemPrompt: "Tu prépares des devis. Utilise lookup_price, n'invente pas de prix.", toolset: priceToolset() });

    const result = await runScenario({ sut, runner, harness, evaluator, scenario });

    assert.equal(result.turns.length, 1);
    assert.equal(result.stopReason, "runner_done");
    const tc = result.turns[0].toolCalls;
    assert.equal(tc.length, 1);
    assert.equal(tc[0].name, "lookup_price");
    assert.match(tc[0].result, /100 CHF/);
    assert.match(result.turns[0].assistant, /300 CHF/);
    assert.equal(result.verdict.outcome, "goal_met");
    assert.equal(result.verdict.failureMode, null);
    assert.equal(result.verdict.severity, null);
    assert.equal(result.verdict.evidence[0].turn, 0);
  });
});

describe("base-eval — missing tool is surfaced and classifiable", () => {
  it("a call to an unknown tool returns an error result the judge maps to missing_tool", async () => {
    const sut = createFauxModel([
      { toolCalls: [{ id: "c1", name: "open_crm", arguments: {} }] },
      "Je ne peux pas accéder au CRM.",
    ]);
    const runner = createSimulatedUser(createFauxModel('{"status":"give_up","message":"Tant pis."}'));
    const evaluator = createLlmEvaluator(
      createFauxModel('{"outcome":"not_met","failureMode":"missing_tool","severity":"blocker","confidence":0.8,"evidence":[{"turn":0,"quote":"no such tool","why":"outil indisponible"}],"rationale":"Bloqué par un outil manquant.","fixHint":"Fournir un connecteur CRM ou retirer l\'étape."}'),
    );
    const harness = baseNativeHarness({ systemPrompt: "Assistant.", toolset: priceToolset() }); // no open_crm

    const result = await runScenario({ sut, runner, harness, evaluator, scenario });
    assert.equal(result.stopReason, "runner_gave_up");
    assert.match(result.turns[0].toolCalls[0].result, /no such tool/);
    assert.equal(result.verdict.outcome, "not_met");
    assert.equal(result.verdict.failureMode, "missing_tool");
    assert.equal(result.verdict.severity, "blocker");
    assert.equal(result.verdict.fixHint, "Fournir un connecteur CRM ou retirer l'étape.");
  });
});

describe("base-eval — harness mediation (beforeToolCall) is the enforcement seam", () => {
  it("a denied write surfaces a deny message and is flagged denied (the propose→commit gate)", async () => {
    const calls = [];
    const harness = baseNativeHarness({
      systemPrompt: "Assistant.",
      toolset: {
        commit_change: { def: { name: "commit_change", parameters: { type: "object" } }, run: () => "WRITTEN" },
      },
      beforeToolCall: (call) => {
        calls.push(call.name);
        return call.name === "commit_change" ? { allow: false, denyMessage: "Refus: une écriture exige une validation humaine." } : { allow: true };
      },
    });
    const sut = createFauxModel([
      { toolCalls: [{ id: "c1", name: "commit_change", arguments: { target: "x.md" } }] },
      "Je propose la modification, en attente de validation.",
    ]);
    const runner = createSimulatedUser(createFauxModel('{"status":"satisfied","message":"ok"}'));
    const evaluator = createLlmEvaluator(createFauxModel('{"outcome":"goal_met","confidence":0.7,"evidence":[],"rationale":"a respecté le point de validation."}'));

    const result = await runScenario({ sut, runner, harness, evaluator, scenario });
    assert.deepEqual(calls, ["commit_change"]);
    assert.equal(result.turns[0].toolCalls[0].denied, true);
    assert.match(result.turns[0].toolCalls[0].result, /validation humaine/);
  });
});

describe("base-eval — limits", () => {
  it("stops at maxTurns when the runner never finishes", async () => {
    const sut = createFauxModel(() => "Je continue.");
    const runner = createSimulatedUser(createFauxModel(() => '{"status":"continue","message":"et ensuite ?"}'));
    const evaluator = createLlmEvaluator(createFauxModel('{"outcome":"partially_met","failureMode":"non_termination","severity":"minor","confidence":0.6,"evidence":[],"rationale":"n\'a pas conclu."}'));
    const harness = baseNativeHarness({ systemPrompt: "Assistant.", toolset: {} });

    const result = await runScenario({ sut, runner, harness, evaluator, scenario, limits: { maxTurns: 3 } });
    assert.equal(result.stopReason, "max_turns");
    assert.equal(result.turns.length, 3);
    assert.equal(result.verdict.outcome, "partially_met");
    assert.equal(result.verdict.failureMode, "non_termination");
  });

  it("caps tool calls within a turn (no unbounded tool loop)", async () => {
    let n = 0;
    const harness = baseNativeHarness({
      systemPrompt: "Assistant.",
      toolset: { ping: { def: { name: "ping", parameters: { type: "object" } }, run: () => "pong" } },
    });
    // SUT always asks for another tool call → must be capped by maxToolCalls.
    const sut = createFauxModel(() => {
      n++;
      return { toolCalls: [{ id: `c${n}`, name: "ping", arguments: {} }] };
    });
    const runner = createSimulatedUser(createFauxModel('{"status":"satisfied","message":"stop"}'));
    const evaluator = createLlmEvaluator(createFauxModel('{"outcome":"goal_met","confidence":0.5,"evidence":[],"rationale":"x"}'));

    const result = await runScenario({ sut, runner, harness, evaluator, scenario, limits: { maxTurns: 1, maxToolCalls: 4 } });
    const toolCalls = result.turns[0].toolCalls;
    assert.equal(toolCalls.length, 4, "tool calls should be capped at maxToolCalls");
  });
});

describe("base-eval — verdict normalization (judge held to the taxonomy)", () => {
  it("rejects an out-of-taxonomy outcome and a not_met without a failureMode", () => {
    assert.throws(() => normalizeVerdict({ outcome: "great" }), VerdictError);
    assert.throws(() => normalizeVerdict({ outcome: "not_met" }), VerdictError);
    assert.throws(() => normalizeVerdict({ outcome: "not_met", failureMode: "made_up" }), VerdictError);
  });

  it("normalizes confidence, forces severity/failureMode to null on goal_met, defaults severity", () => {
    const met = normalizeVerdict({ outcome: "goal_met", failureMode: "off_goal", severity: "blocker", confidence: 5 });
    assert.equal(met.failureMode, null);
    assert.equal(met.severity, null);
    assert.equal(met.confidence, 1); // clamped
    const bad = normalizeVerdict({ outcome: "not_met", failureMode: FAILURE_MODES[0], confidence: "x" });
    assert.equal(bad.severity, "major"); // default
    assert.equal(bad.confidence, 0.5); // neutral default
  });

  it("evaluator throws VerdictError on unparseable output (even after the retry)", async () => {
    const evaluator = createLlmEvaluator(createFauxModel("I think it went fine, no JSON here."));
    await assert.rejects(() => evaluator.evaluate(scenario, [{ index: 0, user: "hi", assistant: "ok", toolCalls: [] }]), VerdictError);
  });

  it("evaluator recovers via the corrective retry when the first reply is not parseable", async () => {
    // First reply is prose (no JSON); the JSON-only retry succeeds → a real verdict, not an error.
    const evaluator = createLlmEvaluator(
      createFauxModel((_req, i) => (i === 0 ? "Bien sûr, voici mon évaluation détaillée…" : '{"outcome":"goal_met","confidence":0.8,"evidence":[],"rationale":"ok"}')),
    );
    const verdict = await evaluator.evaluate(scenario, [{ index: 0, user: "hi", assistant: "ok", toolCalls: [] }]);
    assert.equal(verdict.outcome, "goal_met");
  });
});

describe("base-eval — util.extractJson", () => {
  it("parses bare, fenced, and prose-wrapped JSON; returns null otherwise", () => {
    assert.deepEqual(extractJson('{"a":1}'), { a: 1 });
    assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
    assert.deepEqual(extractJson('Sure! {"a": {"b": 2}} done'), { a: { b: 2 } });
    assert.equal(extractJson("no json at all"), null);
  });
});
