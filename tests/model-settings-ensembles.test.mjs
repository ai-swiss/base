// Spec coverage: UR-CORE-003
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { resolveModel } from "../tools/core/model-settings.mjs";

const PROVIDERS = [
  { id: "local", type: "ollama", baseUrl: "http://localhost:11434/v1" },
  { id: "local2", type: "ollama", baseUrl: "http://localhost:11435/v1" },
];

async function makeContext(settings) {
  const dir = await mkdtemp(path.join(tmpdir(), "base-ensembles-"));
  await mkdir(path.join(dir, ".ai"), { recursive: true });
  await writeFile(path.join(dir, ".ai", "studio.settings.json"), JSON.stringify(settings), "utf8");
  return dir;
}

describe("model-settings ensembles", () => {
  let dir;
  const trash = [];
  const ctx = async (settings) => {
    const d = await makeContext(settings);
    trash.push(d);
    return d;
  };

  before(async () => {
    dir = await ctx({
      providers: PROVIDERS,
      ensembles: {
        council: { type: "moa", proposers: ["local/a", "local2/b"], aggregator: "local/a" },
        trio: { type: "triumvirat", pool: { x: "local/a", y: "local2/b" }, maxTurns: 4 },
      },
    });
  });
  after(async () => {
    await Promise.all(trash.map((d) => rm(d, { recursive: true, force: true })));
  });

  it("resolves a moa ensemble ref to a composed model with the ensemble's id", async () => {
    const m = await resolveModel(dir, "council", { env: {} });
    assert.equal(m.id, "council");
    assert.equal(typeof m.complete, "function");
  });

  it("resolves a triumvirat ensemble ref to a composed model", async () => {
    const m = await resolveModel(dir, "trio", { env: {} });
    assert.equal(m.id, "trio");
    assert.equal(typeof m.complete, "function");
  });

  it("still resolves a plain provider/model ref", async () => {
    const m = await resolveModel(dir, "local/llama3", { env: {} });
    assert.equal(typeof m.complete, "function");
  });

  it("rejects a moa ensemble missing its aggregator", async () => {
    const d = await ctx({ providers: PROVIDERS, ensembles: { c: { type: "moa", proposers: ["local/a"] } } });
    await assert.rejects(() => resolveModel(d, "c", { env: {} }), /aggregator/);
  });

  it("rejects a triumvirat ensemble with an empty pool", async () => {
    const d = await ctx({ providers: PROVIDERS, ensembles: { c: { type: "triumvirat", pool: {} } } });
    await assert.rejects(() => resolveModel(d, "c", { env: {} }), /pool/);
  });

  it("rejects an unknown ensemble type", async () => {
    const d = await ctx({ providers: PROVIDERS, ensembles: { c: { type: "duo", proposers: [], aggregator: "x" } } });
    await assert.rejects(() => resolveModel(d, "c", { env: {} }), /unknown type/);
  });

  it("rejects an ensemble member pointing at an unknown provider", async () => {
    const d = await ctx({
      providers: PROVIDERS,
      ensembles: { c: { type: "moa", proposers: ["ghost/a"], aggregator: "local/a" } },
    });
    await assert.rejects(() => resolveModel(d, "c", { env: {} }), /unknown provider/);
  });
});
