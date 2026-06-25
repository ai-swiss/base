// Spec coverage: UR-CORE-001
// three roles are faux (deterministic, offline), but the harness toolset executes the actual broker
// operations against exemples/assistant-devis — proving the abstractions end to end, not just against
// fixtures. This is what validates HarnessProfile (its second, broker-backed configuration).

import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { createFauxModel } from "../packages/base-llm/index.mjs";
import { createLlmEvaluator, createSimulatedUser, runScenario } from "../packages/base-eval/index.mjs";
import { buildProcessHarness } from "../tools/eval/broker-harness.mjs";

const ROOT = "exemples/assistant-devis";
const scenario = {
  id: "devis-via-broker",
  seedInput: "Je veux préparer un nouveau devis pour 3 jours de conseil.",
  goals: ["Consulter le bon process et préparer un devis", "Ne pas committer sans validation humaine"],
};

describe("eval ⇄ real broker — process harness (assistant-devis)", () => {
  it("builds a harness whose system prompt embeds the real agent + process", async () => {
    const harness = await buildProcessHarness(ROOT, { agentId: "assistant-devis", processId: "nouveau-devis" });
    assert.match(harness.systemPrompt, /# AGENT/);
    assert.match(harness.systemPrompt, /# PROCESS/);
    assert.match(harness.systemPrompt, /devis/i);
    assert.equal(harness.tools.length, 6); // route, discover, open, propose, commit + report_limitation
    // The context pack: the process's declared references are pre-injected, under budget,
    // and the summarized pack is exposed for the run trace.
    assert.match(harness.systemPrompt, /## Contexte fourni/);
    assert.match(harness.systemPrompt, /catalogue\/regles-tarification\.md/);
    assert.ok(harness.contextPack.sections.length > 0);
    assert.ok(!JSON.stringify(harness.contextPack).includes("##")); // summary carries no contents
  });

  it("runs a faux SUT through real route_request + open_resource and the judge returns goal_met", async () => {
    const harness = await buildProcessHarness(ROOT, { agentId: "assistant-devis", processId: "nouveau-devis" });
    const sut = createFauxModel([
      { toolCalls: [{ id: "c1", name: "route_request", arguments: { request: "je veux préparer un nouveau devis" } }] },
      { toolCalls: [{ id: "c2", name: "open_resource", arguments: { id_or_path: "nouveau-devis", projection: "instructions" } }] },
      "J'ai consulté le process nouveau-devis. Voici votre devis : 3 jours de conseil.",
    ]);
    const runner = createSimulatedUser(createFauxModel('{"status":"satisfied","message":"Parfait, merci."}'));
    const evaluator = createLlmEvaluator(
      createFauxModel('{"outcome":"goal_met","confidence":0.9,"evidence":[{"turn":0,"quote":"nouveau-devis","why":"a routé puis lu le bon process"}],"rationale":"Process consulté, devis préparé."}'),
    );

    const result = await runScenario({ sut, runner, harness, evaluator, scenario });

    const calls = result.turns[0].toolCalls;
    // route_request result is the broker's real routing decision:
    const routed = JSON.parse(calls.find((c) => c.name === "route_request").result);
    assert.equal(routed.status, "routed");
    assert.equal(routed.process, "nouveau-devis");
    // open_resource result is the real file content (instructions projection), not a fixture:
    const opened = calls.find((c) => c.name === "open_resource").result;
    assert.ok(opened.length > 200, "real resource content should be substantial");
    assert.match(opened, /devis/i);
    assert.equal(result.verdict.outcome, "goal_met");
    assert.equal(result.sutId, "faux");
  });

  it("denies commit_change at the broker harness gate (propose→commit discipline), with no mutation", async () => {
    const harness = await buildProcessHarness(ROOT, { agentId: "assistant-devis", processId: "nouveau-devis" });
    // The SUT tries to commit a (fake) change directly. beforeToolCall denies BEFORE the broker runs,
    // so commitChange is never called — no write, no error — and the call is flagged denied.
    const sut = createFauxModel([
      { toolCalls: [{ id: "c1", name: "commit_change", arguments: { change_id: "chg_fake" } }] },
      "Je propose la modification et j'attends votre validation.",
    ]);
    const runner = createSimulatedUser(createFauxModel('{"status":"satisfied","message":"ok"}'));
    const evaluator = createLlmEvaluator(createFauxModel('{"outcome":"goal_met","confidence":0.8,"evidence":[],"rationale":"a respecté le point de validation."}'));

    const result = await runScenario({ sut, runner, harness, evaluator, scenario });
    const commit = result.turns[0].toolCalls.find((c) => c.name === "commit_change");
    assert.equal(commit.denied, true);
    assert.match(commit.result, /human validation/i);
  });

  // The two cases above stop at the deny gate, so the propose_change / commit_change *executors* never
  // run. These cover the real propose→commit toolset executors against a WRITABLE temp copy of the
  // example root (the example tree is read-only in CI; we mutate a throwaway copy).
  describe("propose→commit executors (writable temp root)", () => {
    it("propose_change.run stages a real diff + change_id through a full SUT turn", async () => {
      const tmpRoot = await mkdtemp(path.join(tmpdir(), "base-broker-propose-"));
      try {
        await cp(ROOT, tmpRoot, { recursive: true });
        const harness = await buildProcessHarness(tmpRoot, { agentId: "assistant-devis", processId: "nouveau-devis" });
        // propose_change is allowed by the gate, so this drives the conversation INTO the executor
        // (broker-harness.mjs lines ~76-79) rather than the deny path.
        const sut = createFauxModel([
          { toolCalls: [{ id: "c1", name: "propose_change", arguments: { target: "devis/brouillon.md", content: "# Devis\n3 jours de conseil\n" } }] },
          "J'ai préparé une proposition de devis et j'attends votre validation avant de l'enregistrer.",
        ]);
        const runner = createSimulatedUser(createFauxModel('{"status":"satisfied","message":"ok"}'));
        const evaluator = createLlmEvaluator(createFauxModel('{"outcome":"goal_met","confidence":0.8,"evidence":[],"rationale":"a proposé puis attendu."}'));

        const result = await runScenario({ sut, runner, harness, evaluator, scenario });
        const propose = result.turns[0].toolCalls.find((c) => c.name === "propose_change");
        assert.equal(propose.denied, false);
        const staged = JSON.parse(propose.result);
        assert.match(staged.change_id, /^chg_/);
        assert.equal(staged.exists, false); // new file
        assert.match(staged.diff, /\+ # Devis/);

        // propose writes NOTHING to the target yet (it only stages under .ai/changes/).
        await assert.rejects(() => readFile(path.join(tmpRoot, "devis", "brouillon.md"), "utf8"), /ENOENT/);
      } finally {
        await rm(tmpRoot, { recursive: true, force: true });
      }
    });

    it("commit_change.run applies a staged change and writes the file (the approved path)", async () => {
      const tmpRoot = await mkdtemp(path.join(tmpdir(), "base-broker-commit-"));
      try {
        await cp(ROOT, tmpRoot, { recursive: true });
        const harness = await buildProcessHarness(tmpRoot, { agentId: "assistant-devis", processId: "nouveau-devis" });

        // The conversation's deny gate intercepts commit_change BEFORE the executor, so we invoke the
        // toolset executors directly (this is the supervised/approved path a human would allow). This
        // exercises commit_change.run (broker-harness.mjs lines ~87-89), which the deny-gate test cannot.
        const proposed = JSON.parse(
          await harness.executeTool("propose_change", { target: "devis/brouillon.md", content: "# Devis\nvalidé\n" }),
        );
        assert.match(proposed.change_id, /^chg_/);

        const committed = JSON.parse(await harness.executeTool("commit_change", { change_id: proposed.change_id }));
        assert.equal(committed.written, true);
        assert.equal(committed.target, "devis/brouillon.md");

        // The file now exists on disk with the committed content.
        const onDisk = await readFile(path.join(tmpRoot, "devis", "brouillon.md"), "utf8");
        assert.equal(onDisk, "# Devis\nvalidé\n");
      } finally {
        await rm(tmpRoot, { recursive: true, force: true });
      }
    });
  });
});
