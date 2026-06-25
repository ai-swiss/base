// Spec coverage: UR-CORE-001
// The evaluated model's toolkit: repairing open_resource errors (did_you_mean from
// the ranker), discover_resources with the SAME name/contract as the MCP tool, report_limitation
// aggregated into run metadata (the SUT continues), and the eval ⇄ MCP isomorphism gate.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { createFauxModel } from "../packages/base-llm/index.mjs";
import { createLlmEvaluator, createSimulatedUser, runScenario } from "../packages/base-eval/index.mjs";
import { buildProcessHarness, HARNESS_ONLY_TOOLS } from "../tools/eval/broker-harness.mjs";
import { loadScenarios } from "../tools/eval/store.mjs";

const ROOT = "exemples/assistant-devis";
const okRunner = () => createSimulatedUser(createFauxModel('{"status":"satisfied","message":"Parfait, merci."}'));
const okJudge = (rationale = "ok") =>
  createLlmEvaluator(createFauxModel(`{"outcome":"goal_met","confidence":0.9,"evidence":[],"rationale":"${rationale}"}`));

describe("SUT tools — repairing errors and discovery", () => {
  it("an imperfect path answers with did_you_mean suggestions, and the SUT recovers (reference scenario)", async () => {
    const scenarios = await loadScenarios("exemples/assistant-devis/.ai/experiments/scenarios/chemin-imparfait.json");
    const scenario = scenarios[0];
    assert.match(scenario.seedInput, /catalogue\/regles\.md/); // the deliberately imperfect path

    const harness = await buildProcessHarness(ROOT, { agentId: "assistant-devis", processId: "nouveau-devis" });
    const sut = createFauxModel((request, i) => {
      if (i === 0) return { toolCalls: [{ id: "c1", name: "open_resource", arguments: { id_or_path: "catalogue/regles.md" } }] };
      if (i === 1) {
        // Read the repairing error from the last tool message and follow its first suggestion.
        const last = request.messages[request.messages.length - 1];
        const parsed = JSON.parse(last.content);
        assert.equal(parsed.error, "not_found");
        assert.ok(parsed.did_you_mean.length > 0, "the ranker must suggest the close match");
        return { toolCalls: [{ id: "c2", name: "open_resource", arguments: { id_or_path: parsed.did_you_mean[0].path } }] };
      }
      return "J'ai consulté les règles de tarification : voici le devis.";
    });

    const result = await runScenario({ sut, runner: okRunner(), harness, evaluator: okJudge("a réparé le chemin"), scenario });
    const calls = result.turns[0].toolCalls;
    const miss = JSON.parse(calls[0].result);
    assert.equal(miss.error, "not_found");
    assert.ok(miss.did_you_mean.some((s) => /regles-tarification/.test(s.path)));
    assert.match(calls[1].result, /tarif/i); // the real file content, via the suggestion
    assert.equal(result.verdict.outcome, "goal_met");
  });

  it("with no path at all, discover_resources ranks (with reasons) and the SUT reads the hit", async () => {
    const harness = await buildProcessHarness(ROOT, { agentId: "assistant-devis", processId: "nouveau-devis" });
    const sut = createFauxModel((request, i) => {
      if (i === 0) return { toolCalls: [{ id: "c1", name: "discover_resources", arguments: { query: "règles tarification" } }] };
      if (i === 1) {
        const hits = JSON.parse(request.messages[request.messages.length - 1].content);
        assert.ok(hits.length > 0 && hits[0].score > 0 && Array.isArray(hits[0].reasons));
        return { toolCalls: [{ id: "c2", name: "open_resource", arguments: { id_or_path: hits[0].id } }] };
      }
      return "Barème consulté.";
    });

    const result = await runScenario({
      sut,
      runner: okRunner(),
      harness,
      evaluator: okJudge(),
      scenario: { id: "discover", seedInput: "utilise le barème en vigueur", goals: ["consulter le barème"] },
    });
    assert.ok(result.turns[0].toolCalls[1].result.length > 50);
  });
});

describe("SUT tools — report_limitation", () => {
  it("a script step is DECLARED, the SUT continues, and the run carries the limitation (reference scenario)", async () => {
    const scenarios = await loadScenarios("exemples/assistant-devis/.ai/experiments/scenarios/etape-script.json");
    const scenario = scenarios[0];

    const harness = await buildProcessHarness(ROOT, { agentId: "assistant-devis", processId: "nouveau-devis" });
    const sut = createFauxModel([
      { toolCalls: [{ id: "c1", name: "report_limitation", arguments: { tool: "code_execution", step: "étape 4 : scripts/calcule-marge.py" } }] },
      "Je ne peux pas exécuter scripts/calcule-marge.py dans ce runtime. Voici les étapes restantes et le devis préparé.",
    ]);

    const result = await runScenario({ sut, runner: okRunner(), harness, evaluator: okJudge("limitation déclarée, pas une faute"), scenario });

    // The harness aggregated the declaration; the orchestrator attaches it to the run (same drain).
    const limitations = harness.drainLimitations();
    assert.equal(limitations.length, 1);
    assert.equal(limitations[0].tool, "code_execution");
    assert.match(limitations[0].step, /calcule-marge/);
    assert.match(limitations[0].processPath, /nouveau-devis\/SKILL\.md$/);

    // Not a failure: the SUT continued and the verdict stays clean.
    assert.equal(result.verdict.outcome, "goal_met");
    const ack = result.turns[0].toolCalls[0].result;
    assert.match(ack, /poursuis/);
  });

  it("the system prompt forbids pretending and explains the repair + limitation contract", async () => {
    const harness = await buildProcessHarness(ROOT, { agentId: "assistant-devis", processId: "nouveau-devis" });
    assert.match(harness.systemPrompt, /CANNOT execute code/);
    assert.match(harness.systemPrompt, /report_limitation/);
    assert.match(harness.systemPrompt, /did_you_mean|discover_resources/);
  });
});

describe("eval toolset ⇄ MCP surface — isomorphism gate", () => {
  it("every harness tool (minus the harness meta-tool) exists on the MCP surface with the same parameter names", async () => {
    const harness = await buildProcessHarness(ROOT, { agentId: "assistant-devis", processId: "nouveau-devis" });
    const mcpSource = await readFile("mcp/src/index.ts", "utf8");

    for (const tool of harness.tools) {
      if (HARNESS_ONLY_TOOLS.includes(tool.name)) {
        // report_limitation is deliberately ABSENT from MCP: in production the HOST executes code
        // (Cursor, Claude Code…); the harness has no such host, so the gap is declared, not simulated.
        assert.ok(!mcpSource.includes(`"${tool.name}"`), `${tool.name} must stay a harness-only meta-tool`);
        continue;
      }
      assert.ok(mcpSource.includes(`"${tool.name}"`), `MCP must expose ${tool.name}`);
      // Same parameter names: every harness parameter must be declared by the MCP registration.
      const registration = mcpSource.slice(mcpSource.indexOf(`"${tool.name}"`));
      for (const param of Object.keys(tool.parameters?.properties ?? {})) {
        const block = registration.slice(0, registration.indexOf("async ("));
        assert.ok(new RegExp(`\\b${param}\\s*:`).test(block), `MCP ${tool.name} must accept "${param}"`);
      }
    }
  });
});
