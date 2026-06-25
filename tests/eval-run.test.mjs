// Spec coverage: UR-CORE-001
// mapping, including the judge's "different provider than the SUT" branches. Importing run.mjs must NOT
// launch main() (it is guarded by an import.meta.url entry-point check).

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildRolesFromArgs } from "../tools/eval/run.mjs";

describe("eval run — buildRolesFromArgs", () => {
  it("defaults to OpenAI gpt-4o-mini for all three roles when nothing is specified", () => {
    const roles = buildRolesFromArgs({});
    for (const r of [roles.sut, roles.runner, roles.judge]) {
      assert.equal(r.useOllama, false);
      assert.equal(r.model, "gpt-4o-mini");
    }
  });

  it("--ollama runs all three roles on Ollama with the default qwen3.5:9b-q4_K_M", () => {
    const roles = buildRolesFromArgs({ ollama: true });
    assert.deepEqual(
      [roles.sut.useOllama, roles.runner.useOllama, roles.judge.useOllama],
      [true, true, true],
    );
    assert.equal(roles.sut.model, "qwen3.5:9b-q4_K_M");
    assert.equal(roles.judge.model, "qwen3.5:9b-q4_K_M");
  });

  it("--model sets the default model for every role; per-role overrides win", () => {
    const roles = buildRolesFromArgs({
      ollama: true,
      model: "qwen2.5",
      "runner-model": "phi3",
      "evaluator-model": "mistral",
    });
    assert.equal(roles.sut.model, "qwen2.5");
    assert.equal(roles.runner.model, "phi3"); // override
    assert.equal(roles.judge.model, "mistral"); // override
  });

  it("--base-url propagates to sut/runner and (on Ollama) the judge", () => {
    const roles = buildRolesFromArgs({ ollama: true, "base-url": "http://remote:11434/v1" });
    assert.equal(roles.sut.baseUrl, "http://remote:11434/v1");
    assert.equal(roles.runner.baseUrl, "http://remote:11434/v1");
    assert.equal(roles.judge.baseUrl, "http://remote:11434/v1");
  });

  it("--evaluator-openai runs the judge on OpenAI even when the SUT is on Ollama", () => {
    const roles = buildRolesFromArgs({ ollama: true, "base-url": "http://remote:11434/v1", "evaluator-openai": true });
    assert.equal(roles.sut.useOllama, true);
    assert.equal(roles.judge.useOllama, false);
    // No --model and no --evaluator-model → the OpenAI judge falls back to gpt-4o-mini.
    assert.equal(roles.judge.model, "gpt-4o-mini");
    // The Ollama base-url must NOT leak onto the OpenAI judge.
    assert.equal(roles.judge.baseUrl, undefined);
  });

  it("the OpenAI judge picks up --model when no --evaluator-model is given", () => {
    const roles = buildRolesFromArgs({ ollama: true, model: "gpt-4o", "evaluator-openai": true });
    assert.equal(roles.judge.model, "gpt-4o");
  });

  it("--evaluator-base-url targets the judge's own endpoint", () => {
    const roles = buildRolesFromArgs({
      "evaluator-base-url": "https://judge.gateway/v1",
      "evaluator-model": "gpt-4o-mini",
    });
    assert.equal(roles.judge.baseUrl, "https://judge.gateway/v1");
  });
});
