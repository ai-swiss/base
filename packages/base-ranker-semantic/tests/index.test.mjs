// Spec coverage: FR-ROUTE-006 FR-ROUTE-008
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cosineSimilarity,
  createOpenAICompatibleEmbedder,
  createOllamaEmbedder,
  createSemanticRanker,
  textForResource,
} from "../index.mjs";

describe("@ai-swiss/base-ranker-semantic", () => {
  it("scores semantic similarity with a real embedding provider interface", async () => {
    const embed = async (text) => {
      const value = String(text).toLowerCase();
      if (value.includes("proposal") || value.includes("quote") || value.includes("devis")) return [1, 0];
      if (value.includes("invoice") || value.includes("facture")) return [0, 1];
      return [0.1, 0];
    };
    const ranker = createSemanticRanker({ embed, minSimilarity: 0.4, weight: 200 });

    const hit = await ranker(
      { id: "quote", route_text: "Prepare a client quote", path: "quote.md" },
      ["proposal"],
      { query: "client proposal" },
    );
    const miss = await ranker(
      { id: "invoice", route_text: "Handle invoice dispute", path: "invoice.md" },
      ["proposal"],
      { query: "client proposal" },
    );

    assert.equal(hit.score, 200);
    assert.deepEqual(hit.reasons, ["semantic:embedding:1.000"]);
    assert.equal(miss.score, 0);
  });

  it("uses precomputed resource vectors without embedding the resource again", async () => {
    let calls = 0;
    const ranker = createSemanticRanker({
      embed: async () => {
        calls++;
        return [1, 0, 0];
      },
    });

    const result = await ranker(
      { id: "precomputed", metadata: { routing_embedding: [1, 0, 0] } },
      ["anything"],
      { query: "anything" },
    );

    assert.equal(result.score, 160);
    assert.equal(calls, 1);
  });

  it("calls OpenAI-compatible embedding endpoints without a client dependency", async () => {
    const requests = [];
    const embed = createOpenAICompatibleEmbedder({
      apiKey: "secret",
      baseUrl: "https://embeddings.example/v1/",
      model: "embedding-model",
      fetch: async (url, init) => {
        requests.push({ url, init });
        return {
          ok: true,
          async json() {
            return {
              data: [
                { index: 1, embedding: [0, 1] },
                { index: 0, embedding: [1, 0] },
              ],
            };
          },
        };
      },
    });

    const vectors = await embed(["first", "second"]);

    assert.deepEqual(vectors, [[1, 0], [0, 1]]);
    assert.equal(requests[0].url, "https://embeddings.example/v1/embeddings");
    assert.equal(requests[0].init.headers.authorization, "Bearer secret");
    assert.deepEqual(JSON.parse(requests[0].init.body), { model: "embedding-model", input: ["first", "second"] });
  });

  it("provides an optional Ollama embedder with no client dependency", async () => {
    const requests = [];
    const embed = createOllamaEmbedder({
      baseUrl: "http://localhost:11434/",
      model: "nomic-embed-text",
      fetch: async (url, init) => {
        requests.push({ url, init });
        return {
          ok: true,
          async json() {
            return { embedding: [0.5, 0.5] };
          },
        };
      },
    });

    const vector = await embed("bonjour");

    assert.deepEqual(vector, [0.5, 0.5]);
    assert.equal(requests[0].url, "http://localhost:11434/api/embeddings");
    assert.deepEqual(JSON.parse(requests[0].init.body), { model: "nomic-embed-text", prompt: "bonjour" });
  });

  it("keeps helpers deterministic and conservative", () => {
    assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
    assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
    assert.equal(cosineSimilarity([1, 0], [1]), null);
    assert.match(textForResource({ route_text: "A", title: "B", description: "C" }), /A\nB\nC/);
  });
});
