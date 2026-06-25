// Spec coverage: UR-CORE-001
// callback for a burst of relevant file events, ignores runtime/noise paths, and stops cleanly on
// close(). The OS file watcher (node:fs watch) is unavailable on constrained/sandboxed hosts (EMFILE),
// so we inject a fake `watch` and drive change events deterministically — exercising the REAL
// relevance filter, debounce coalescing, and close() teardown. The debounce timers are real (short);
// we poll for the callback rather than sleeping a fixed long time.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createResourceWatcher } from "../tools/studio/watch.mjs";

const DEBOUNCE = 30;

// A controllable stand-in for node:fs watch: captures the (event, filename) listener so the test can
// emit synthetic filesystem events, and records close().
function fakeWatch() {
  let listener = null;
  let closed = false;
  const factory = (_root, _optsOrCb, maybeCb) => {
    listener = typeof _optsOrCb === "function" ? _optsOrCb : maybeCb;
    return {
      on() {
        return this;
      },
      close() {
        closed = true;
      },
    };
  };
  return {
    factory,
    // A real closed watcher delivers no further events.
    emit: (filename, event = "change") => {
      if (!closed) listener?.(event, filename);
    },
    isClosed: () => closed,
  };
}

// Poll until cond() or timeout — no fixed long sleeps.
async function waitFor(cond, { timeoutMs = 1000, stepMs = 4 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (cond()) return true;
    if (Date.now() > deadline) return false;
    await new Promise((r) => setTimeout(r, stepMs));
  }
}

const idle = (ms) => new Promise((r) => setTimeout(r, ms));

describe("studio watch — createResourceWatcher", () => {
  it("fires the debounced callback on a relevant file event (.md)", async () => {
    let calls = 0;
    const fw = fakeWatch();
    const w = createResourceWatcher("/root", () => calls++, { debounceMs: DEBOUNCE, watch: fw.factory });

    fw.emit("AGENT.md");
    assert.ok(await waitFor(() => calls >= 1), "should fire for a .md event");
    assert.equal(calls, 1);
    w.close();
  });

  it("fires for a path under /.ai/ and for a .json, and when filename is missing (be-safe)", async () => {
    let calls = 0;
    const fw = fakeWatch();
    const w = createResourceWatcher("/root", () => calls++, { debounceMs: DEBOUNCE, watch: fw.factory });

    fw.emit(".ai/config.yaml"); // under /.ai/ → relevant
    assert.ok(await waitFor(() => calls === 1));

    fw.emit("base.config.json"); // .json → relevant
    assert.ok(await waitFor(() => calls === 2));

    fw.emit(null); // no filename → refresh to be safe
    assert.ok(await waitFor(() => calls === 3));
    w.close();
  });

  it("ignores IGNORED paths (node_modules, .ai/trace) and irrelevant extensions", async () => {
    let calls = 0;
    const fw = fakeWatch();
    const w = createResourceWatcher("/root", () => calls++, { debounceMs: DEBOUNCE, watch: fw.factory });

    fw.emit("node_modules/pkg/index.json");
    fw.emit(".ai/trace/event.json");
    fw.emit(".ai/experiments/runs/r.json");
    fw.emit("src/app.ts"); // not .md / not /.ai/ / not .json → irrelevant

    await idle(DEBOUNCE * 3); // more than a debounce window; must not have fired
    assert.equal(calls, 0);
    w.close();
  });

  it("coalesces a burst of rapid events into a single callback", async () => {
    let calls = 0;
    const fw = fakeWatch();
    const w = createResourceWatcher("/root", () => calls++, { debounceMs: DEBOUNCE, watch: fw.factory });

    for (let i = 0; i < 6; i++) fw.emit(`note-${i}.md`); // all within one debounce window

    assert.ok(await waitFor(() => calls >= 1));
    await idle(DEBOUNCE * 3); // let it settle fully
    assert.equal(calls, 1, "a burst must collapse to one callback");
    w.close();
  });

  it("close() stops further callbacks and closes the underlying watcher", async () => {
    let calls = 0;
    const fw = fakeWatch();
    const w = createResourceWatcher("/root", () => calls++, { debounceMs: DEBOUNCE, watch: fw.factory });

    w.close();
    assert.equal(fw.isClosed(), true, "close() must close the underlying watcher");

    fw.emit("after-close.md");
    await idle(DEBOUNCE * 3);
    assert.equal(calls, 0, "no callbacks after close()");
  });

  it("close() during a pending debounce cancels the queued callback", async () => {
    let calls = 0;
    const fw = fakeWatch();
    const w = createResourceWatcher("/root", () => calls++, { debounceMs: DEBOUNCE, watch: fw.factory });

    fw.emit("pending.md"); // arms the debounce timer
    w.close(); // before it elapses → must clear the timer

    await idle(DEBOUNCE * 3);
    assert.equal(calls, 0, "a pending debounced callback must be cancelled by close()");
  });

  it("never throws when the OS watcher is unavailable (degrades to no live push)", () => {
    // Both recursive and flat watch throw synchronously (e.g. EMFILE): construction must still succeed.
    const throwing = () => {
      throw Object.assign(new Error("EMFILE"), { code: "EMFILE" });
    };
    let calls = 0;
    const w = createResourceWatcher("/root", () => calls++, { debounceMs: DEBOUNCE, watch: throwing });
    assert.equal(typeof w.close, "function");
    w.close(); // must not throw even though no watcher was attached
    assert.equal(calls, 0);
  });
});
