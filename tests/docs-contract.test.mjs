// Spec coverage: UR-CORE-004
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";
import { routeRequest } from "../tools/base-core.mjs";

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-doc-contract-"));
  await fs.mkdir(path.join(tmpDir, ".ai/agents/rh/skills/processes/depart"), { recursive: true });
  await fs.writeFile(
    path.join(tmpDir, ".ai/agents/rh/AGENT.md"),
    "---\nid: rh\ntype: agent\ntitle: RH\ndescription: Ressources humaines.\n---\n# RH\n",
  );
  await fs.writeFile(
    path.join(tmpDir, ".ai/agents/rh/skills/processes/depart/SKILL.md"),
    "---\nid: depart-collaborateur\ntype: process\ntitle: Départ collaborateur\ndescription: Accompagner une fin de relation de travail.\nuse_when: Quand un collaborateur quitte l'entreprise.\n---\n# Départ\n",
  );
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

const semanticPackage = pathToFileURL(path.resolve("packages/base-ranker-semantic/index.mjs")).href;
const indexPackage = pathToFileURL(path.resolve("packages/base-index-local/index.mjs")).href;

// These tests prove the *reference patterns* in docs/guides/routage-semantique-quickstart.md actually work
// against the real packages. The snippets below are equivalent to the documented ones; the last test
// guards against the doc drifting away from these exact public APIs.
describe("documentation reference patterns", () => {
  it("the routing quickstart documents these exact public APIs", async () => {
    const doc = await fs.readFile(path.resolve("docs/guides/routage-semantique-quickstart.md"), "utf8");
    for (const api of [
      "createOpenAICompatibleEmbedder",
      "createOllamaEmbedder",
      "createSemanticRanker",
      "vectorFor",
    ]) {
      assert.ok(doc.includes(api), `quickstart must document ${api} (the pattern tested below)`);
    }
  });

  it("loads the OpenAI-compatible semantic routing pattern", async () => {
    await writeConfig(`
      import { createOpenAICompatibleEmbedder, createSemanticRanker } from ${JSON.stringify(semanticPackage)};
      const embed = createOpenAICompatibleEmbedder({
        model: "test-model",
        apiKey: "test",
        fetch: async (_url, init) => {
          const text = JSON.parse(init.body).input[0];
          const vector = text.includes("offboarding") || text.includes("quitte") ? [1, 0] : [0, 1];
          return { ok: true, json: async () => ({ data: [{ index: 0, embedding: vector }] }) };
        },
      });
      export default { rankers: [createSemanticRanker({ embed, minSimilarity: 0.8 })] };
    `);

    const out = await routeRequest(tmpDir, "offboarding");

    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "depart-collaborateur");
  });

  it("loads the Ollama semantic routing pattern", async () => {
    await writeConfig(`
      import { createOllamaEmbedder, createSemanticRanker } from ${JSON.stringify(semanticPackage)};
      const embed = createOllamaEmbedder({
        fetch: async (_url, init) => {
          const text = JSON.parse(init.body).prompt;
          const vector = text.includes("offboarding") || text.includes("quitte") ? [1, 0] : [0, 1];
          return { ok: true, json: async () => ({ embedding: vector }) };
        },
      });
      export default { rankers: [createSemanticRanker({ embed, minSimilarity: 0.8 })] };
    `);

    const out = await routeRequest(tmpDir, "offboarding");

    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "depart-collaborateur");
  });

  it("loads the precomputed vector pattern with vectorFor", async () => {
    await writeConfig(`
      import { createSemanticRanker } from ${JSON.stringify(semanticPackage)};
      import { vectorFor } from ${JSON.stringify(indexPackage)};
      const index = { documents: [{ id: "depart-collaborateur", path: ".ai/agents/rh/skills/processes/depart/SKILL.md", embedding: [1, 0] }] };
      export default {
        rankers: [createSemanticRanker({
          embed: async (text) => String(text).includes("offboarding") ? [1, 0] : [0, 1],
          getResourceEmbedding: (resource) => vectorFor(index, resource),
          minSimilarity: 0.8,
        })],
      };
    `);

    const out = await routeRequest(tmpDir, "offboarding");

    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "depart-collaborateur");
  });
});

async function writeConfig(source) {
  await fs.writeFile(path.join(tmpDir, "base.config.mjs"), source, "utf8");
}
