// A debounced filesystem watcher for a BASE root: coalesces bursts of file events into a single
// "something changed" callback. Used to push live "resources-changed" SSE events so the UI is a live
// projection of the files. Ignores runtime/noise paths (trace, changes, index, .git, node_modules).

import { watch as nodeWatch } from "node:fs";
import path from "node:path";

const IGNORED = /(?:^|\/)(?:\.git|node_modules)(?:\/|$)|\/\.ai\/(?:trace|changes|index|experiments)\//;

// `watch` is injectable so the debounce/relevance/close logic is unit-testable without the OS watcher
// (which can be unavailable — EMFILE on constrained/sandboxed hosts). Defaults to node:fs `watch`.
export function createResourceWatcher(root, onChange, { debounceMs = 150, watch = nodeWatch } = {}) {
  let timer = null;
  const trigger = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      onChange();
    }, debounceMs);
  };

  const relevant = (filename) => {
    if (!filename) return true; // no name → be safe, refresh
    const rel = `/${String(filename).split(path.sep).join("/")}`;
    if (IGNORED.test(rel)) return false;
    return rel.endsWith(".md") || rel.includes("/.ai/") || rel.endsWith(".json");
  };

  // File watching is best-effort: it can fail (recursive watch unsupported, EMFILE on constrained
  // hosts, network drives). A failure degrades to "no live push" — the server still serves; clients
  // can poll. It must NEVER crash the process, so every path is guarded and errors are swallowed.
  let watcher = null;
  const attach = (w) => {
    w.on("error", () => {
      try {
        w.close();
      } catch {
        /* ignore */
      }
    });
    return w;
  };
  try {
    watcher = attach(watch(root, { recursive: true }, (_event, filename) => {
      if (relevant(filename)) trigger();
    }));
  } catch {
    try {
      watcher = attach(watch(root, () => trigger())); // flat fallback
    } catch {
      watcher = null; // no live updates available; server still works
    }
  }

  return {
    close() {
      if (timer) clearTimeout(timer);
      try {
        watcher?.close();
      } catch {
        /* ignore */
      }
    },
  };
}
