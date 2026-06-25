// Spec coverage: UR-CORE-001
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { promisify } from "node:util";
import { inventoryResources } from "../tools/base-core.mjs";
import { buildPack } from "../tools/browser-pack.mjs";

const execFileAsync = promisify(execFile);
const browserPackPath = path.resolve("tools/browser-pack.mjs");

describe("browser-pack", () => {
  it("bundles an agent and its skills into one Markdown document", async () => {
    const resources = await inventoryResources("exemples/assistant-devis-demo");
    const { markdown, agentId, count } = buildPack(resources, { agentId: "assistant-devis" });

    assert.equal(agentId, "assistant-devis");
    assert.ok(count >= 5, `expected the agent to own several resources, got ${count}`);
    assert.match(markdown, /# Pack navigateur: Assistant Devis/);
    assert.match(markdown, /## Process: Nouveau devis/);
    assert.match(markdown, /## Compétence:/);
    // The concierge lives under a different agent directory and must not leak in.
    assert.equal(markdown.includes("Agent: Accueil"), false);
  });

  it("defaults to the business agent, not the concierge", async () => {
    const resources = await inventoryResources("exemples/assistant-devis-demo");
    assert.equal(buildPack(resources, {}).agentId, "assistant-devis");
  });

  it("fails loudly when a requested agent is absent", async () => {
    const resources = await inventoryResources("exemples/assistant-devis-demo");
    assert.throws(() => buildPack(resources, { agentId: "missing-agent" }), /agent not found/);
  });

  it("prints the requested missing agent in CLI errors", async () => {
    await assert.rejects(
      execFileAsync("node", [browserPackPath, "--root", "exemples/assistant-devis-demo", "--agent", "missing-agent"]),
      (error) => {
        assert.match(error.stderr, /agent not found in this root: missing-agent/);
        return true;
      },
    );
  });

  it("throws when the root has no agent", () => {
    assert.throws(() => buildPack([{ type: "document", path: "x.md" }], {}), /no agent/);
  });
});
