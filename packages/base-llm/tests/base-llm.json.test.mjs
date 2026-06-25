import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { completeJson, createFauxModel, extractJson } from "../index.mjs";

describe("base-llm — extractJson", () => {
  it("parses bare JSON, a fenced block, and JSON embedded in prose; null when absent", () => {
    assert.deepEqual(extractJson('{"a":1}'), { a: 1 });
    assert.deepEqual(extractJson("```json\n{\"a\":1}\n```"), { a: 1 });
    assert.deepEqual(extractJson('Sure! {"a": {"b": 2}} done'), { a: { b: 2 } });
    assert.equal(extractJson("no json at all"), null);
    assert.equal(extractJson(42), null);
  });
});

describe("base-llm — completeJson", () => {
  it("returns the parsed object on a clean first reply", async () => {
    const model = createFauxModel('{"ok":true}');
    assert.deepEqual(await completeJson(model, [{ role: "user", content: "x" }]), { ok: true });
    assert.equal(model.calls.length, 1, "no retry needed when the first reply parses");
  });

  it("recovers with exactly one corrective retry when the first reply has no JSON", async () => {
    const model = createFauxModel(["I cannot do that", '{"n":2}']);
    assert.deepEqual(await completeJson(model, [{ role: "user", content: "x" }]), { n: 2 });
    assert.equal(model.calls.length, 2, "used exactly one corrective retry");
  });

  it("returns null when even the retry yields no JSON (the caller decides if that is fatal)", async () => {
    const model = createFauxModel(["nope", "still nope"]);
    assert.equal(await completeJson(model, [{ role: "user", content: "x" }]), null);
  });
});
