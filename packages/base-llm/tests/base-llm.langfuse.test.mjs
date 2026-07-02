// Spec coverage: UR-CORE-003
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createLangfuseModel,
  assistantMessage,
  userMessage,
  getText,
  LlmConfigError,
} from "../index.mjs";

// Capturing fake fetch: records each call and returns a canned response.
function fakeFetch(respond = () => ({ ok: true, status: 207 })) {
  const calls = [];
  const fn = async (url, opts) => {
    calls.push({ url, opts, body: JSON.parse(opts.body) });
    return respond(url, opts);
  };
  fn.calls = calls;
  return fn;
}

function inner(text, usage = { input: 5, output: 7 }) {
  return {
    id: "gpt-x",
    async complete() {
      return { message: assistantMessage(text), usage, finishReason: "stop" };
    },
  };
}

const KEYS = { publicKey: "pk", secretKey: "sk" };
const ask = { messages: [userMessage("hi")] };

describe("createLangfuseModel", () => {
  it("returns the inner completion unchanged and emits a trace + generation", async () => {
    const f = fakeFetch();
    const m = createLangfuseModel({ model: inner("hello"), ...KEYS, fetch: f });

    const out = await m.complete(ask);
    assert.equal(getText(out.message), "hello");

    await m.flush();
    assert.equal(f.calls.length, 1);
    const call = f.calls[0];
    assert.match(call.url, /\/api\/public\/ingestion$/);
    assert.equal(call.opts.method, "POST");
    assert.match(call.opts.headers.Authorization, /^Basic /);
    assert.deepEqual(call.body.batch.map((e) => e.type), ["trace-create", "generation-create"]);

    const gen = call.body.batch[1].body;
    assert.equal(gen.model, "gpt-x");
    assert.equal(gen.output, "hello");
    assert.deepEqual(gen.usage, { input: 5, output: 7, total: 12, unit: "TOKENS" });
    assert.ok(gen.startTime && gen.endTime);
  });

  it("emits an ERROR generation and rethrows when the inner model fails", async () => {
    const f = fakeFetch();
    const failing = { id: "x", async complete() { throw new Error("upstream 500"); } };
    const m = createLangfuseModel({ model: failing, ...KEYS, fetch: f });

    await assert.rejects(() => m.complete(ask), /upstream 500/);
    await m.flush();
    assert.equal(f.calls[0].body.batch[1].body.level, "ERROR");
  });

  it("never breaks the call when ingestion fails (errors routed to onError)", async () => {
    const errs = [];
    const f = fakeFetch(() => ({ ok: false, status: 401 }));
    const m = createLangfuseModel({ model: inner("ok"), ...KEYS, fetch: f, onError: (e) => errs.push(e) });

    const out = await m.complete(ask);
    assert.equal(getText(out.message), "ok");
    await m.flush();
    assert.equal(errs.length, 1);
  });

  it("reads keys from the environment", async () => {
    const f = fakeFetch();
    const m = createLangfuseModel({
      model: inner("x"),
      fetch: f,
      env: { LANGFUSE_PUBLIC_KEY: "pk", LANGFUSE_SECRET_KEY: "sk" },
    });
    await m.complete(ask);
    await m.flush();
    assert.match(f.calls[0].opts.headers.Authorization, /^Basic /);
  });

  it("captures streamed text and usage, passing chunks through", async () => {
    const f = fakeFetch();
    const streamer = {
      id: "s",
      async complete() { return { message: assistantMessage("full"), usage: { input: 1, output: 1 } }; },
      async *stream() {
        yield { type: "text-delta", text: "he" };
        yield { type: "text-delta", text: "llo" };
        yield { type: "done", usage: { input: 2, output: 3 } };
      },
    };
    const m = createLangfuseModel({ model: streamer, ...KEYS, fetch: f });

    const chunks = [];
    for await (const c of m.stream(ask)) chunks.push(c);
    assert.equal(chunks.length, 3);

    await m.flush();
    const gen = f.calls[0].body.batch[1].body;
    assert.equal(gen.output, "hello");
    assert.deepEqual(gen.usage, { input: 2, output: 3, total: 5, unit: "TOKENS" });
  });

  it("exposes stream() only when the wrapped model streams", () => {
    const withStream = createLangfuseModel({
      model: { id: "s", complete: inner("x").complete, async *stream() {} },
      ...KEYS,
      fetch: fakeFetch(),
    });
    assert.equal(typeof withStream.stream, "function");

    const noStream = createLangfuseModel({ model: inner("x"), ...KEYS, fetch: fakeFetch() });
    assert.equal(typeof noStream.stream, "undefined");
  });

  it("validates configuration", () => {
    assert.throws(() => createLangfuseModel({ ...KEYS }), LlmConfigError); // no model
    assert.throws(() => createLangfuseModel({ model: inner("x"), secretKey: "sk", env: {} }), LlmConfigError); // no public key
    assert.throws(() => createLangfuseModel({ model: inner("x"), publicKey: "pk", env: {} }), LlmConfigError); // no secret key
  });
});
