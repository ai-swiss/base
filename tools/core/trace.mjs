// tools/core/trace.mjs — the operational journal. Append-only, local, git-ignored daily files
// under `.ai/trace/`: WHAT ran, on WHICH path, with what decision, how long it took, and a HASH of
// the arguments, never their text. It answers an operator's questions (what did this server do?)
// without becoming a second copy of the corpus.
//
// Extracted from base-core.mjs, which re-exports it: recording, reading back and retention are one
// concern with one file format, and the facade should not have to hold the format too.

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";

export const TRACE_DIR = path.join(".ai", "trace");

// The actor context: WHO performs the traced operations, when a deployment can know it. Two doors,
// no per-call threading: a server wraps each authenticated request (the MCP wraps handleRequest in
// withTraceActor with the AuthProvider's principal), and a CLI session may set BASE_TRACE_ACTOR.
// Absent both, the field is simply omitted — a single-user local trace carries no ceremony.
const traceActorStorage = new AsyncLocalStorage();
/**
 * Run `fn` with `actor` attached to every recordEvent call it (transitively) makes.
 * @template T @param {unknown} actor @param {() => T} fn @returns {T}
 */
export function withTraceActor(actor, fn) {
  return actor ? traceActorStorage.run({ actor: String(actor) }, fn) : fn();
}

export async function recordEvent(rootDir, event) {
  const root = path.resolve(rootDir);
  const traceDir = path.join(root, TRACE_DIR);
  const ts = new Date().toISOString();
  const entry = {
    ts,
    trace_id: event.trace_id ?? crypto.randomUUID(),
    op: event.op,
    resource_id: event.resource_id ?? null,
    path: event.path ?? null,
    action: event.action ?? null,
    decision: event.decision ?? "not_applicable",
    status: event.status ?? "ok",
    duration_ms: event.duration_ms ?? null,
    args_hash: event.args_hash ?? null,
    error: event.error ?? null,
    metadata: event.metadata ?? undefined,
  };
  const actor = event.actor ?? traceActorStorage.getStore()?.actor ?? process.env.BASE_TRACE_ACTOR;
  if (actor) entry.actor = String(actor);

  try {
    await fs.mkdir(traceDir, { recursive: true });
    const filePath = path.join(traceDir, `${ts.slice(0, 10)}.jsonl`);
    await fs.appendFile(filePath, JSON.stringify(entry) + "\n", "utf8"); // raw-write-ok: append-only trace journal, not a mediated business resource
  } catch {
    // Tracing must never break the user's actual work.
  }
}

export async function summarizeTrace(rootDir) {
  const traceDir = path.join(path.resolve(rootDir), TRACE_DIR);
  const summary = {
    events: 0,
    by_operation: {},
    by_resource: {},
    denied: 0,
    errors: 0,
  };

  let files = [];
  try {
    files = await fs.readdir(traceDir);
  } catch {
    return summary;
  }

  for (const file of files.filter((item) => item.endsWith(".jsonl")).sort()) {
    const content = await fs.readFile(path.join(traceDir, file), "utf8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);
        summary.events++;
        if (event.op) summary.by_operation[event.op] = (summary.by_operation[event.op] ?? 0) + 1;
        if (event.resource_id) summary.by_resource[event.resource_id] = (summary.by_resource[event.resource_id] ?? 0) + 1;
        if (event.decision === "deny") summary.denied++;
        if (event.status === "error") summary.errors++;
      } catch {
        summary.errors++;
      }
    }
  }

  return summary;
}

// Trace is an append-only, local, git-ignored journal (daily `YYYY-MM-DD.jsonl` files). It is useful
// — `base trace` and the entretien report read it back — but it grows without bound. This gives the
// user explicit control over its retention, instead of silently pruning behind their back. Default
// keeps the last 30 days; `{ all: true }` clears everything; `before` (a YYYY-MM-DD cutoff) is the
// deterministic seam for tests. Filenames are dated, so a lexicographic compare is enough.
export async function pruneTrace(rootDir, { keepDays = 30, all = false, before = null } = {}) {
  const traceDir = path.join(path.resolve(rootDir), TRACE_DIR);
  let files = [];
  try {
    files = await fs.readdir(traceDir);
  } catch {
    return { removed: [], removed_count: 0, kept: 0, cutoff: null };
  }

  let cutoff = null;
  if (!all) {
    if (before) {
      cutoff = before;
    } else {
      const day = new Date();
      day.setUTCDate(day.getUTCDate() - keepDays);
      cutoff = day.toISOString().slice(0, 10);
    }
  }

  const removed = [];
  let kept = 0;
  for (const file of files.filter((item) => item.endsWith(".jsonl")).sort()) {
    const dated = /^\d{4}-\d{2}-\d{2}$/.test(file.slice(0, 10)) ? file.slice(0, 10) : null;
    if (all || (dated !== null && cutoff !== null && dated < cutoff)) {
      try {
        await fs.rm(path.join(traceDir, file), { force: true });
        removed.push(file);
      } catch {
        // Best-effort: a file we cannot remove is simply kept; pruning never throws into the workflow.
      }
    } else {
      kept++;
    }
  }

  return { removed, removed_count: removed.length, kept, cutoff };
}
