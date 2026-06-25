// The field-feedback journal — zero dependencies. Two append-only channels under
// `.ai/feedback/`:
// - frictions: one dated Markdown file per report (`report_friction` creates, NEVER modifies;
// a name collision gets a numeric suffix). «Marquer résolu» later edits `status` through the
// ordinary propose→commit gate — the journal itself is exempt from the gate at CREATION only,
// like the eval traces: the gate protects expertise, not telemetry.
// - abstentions: one JSON line per router abstention, appended by the router's ADAPTERS (CLI and
// MCP) — the broker stays pure, journalling is an entry-door responsibility.
// Everything here is `origin: "terrain"` by construction; it never mixes with simulation signals.

import { appendFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathExists } from "./confine.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";

const FEEDBACK_DIR = path.join(".ai", "feedback");
export const ABSTENTIONS_FILE = "abstentions.jsonl";

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "friction";
}

/**
 * Write a friction report: `.ai/feedback/<stamp>_<slug>.md`, creation-only (collision → -2, -3 …).
 * Frontmatter: { process, reported, via, status: "open" }; body: `# <summary>` then the detail.
 * @param {string} rootDir
 * @param {{ process: string, summary: string, detail?: string, via?: "user" | "assistant", now?: Date }} report
 * → { path } (root-relative)
 */
export async function reportFriction(rootDir, { process: processRef, summary, detail = "", via = "user", now = new Date() }) {
  if (!processRef || !String(processRef).trim()) throw new Error("report_friction requires `process` (path or id of the concerned process)");
  if (!summary || !String(summary).trim()) throw new Error("report_friction requires `summary`");
  const safeVia = via === "assistant" ? "assistant" : "user";
  const stamp = now.toISOString().replace(/[:]/g, "").slice(0, 15); // 2026-06-11T0832
  const dir = path.join(rootDir, FEEDBACK_DIR);
  await mkdir(dir, { recursive: true });

  const leaf = (processRef.split("/").pop() ?? processRef).replace(/\.[a-z0-9]+$/i, "");
  const base = `${stamp}_${slugify(leaf)}`;
  let name = `${base}.md`;
  for (let i = 2; await pathExists(path.join(dir, name)); i += 1) {
    name = `${base}-${i}.md`; // never overwrite: append-only journal
  }

  const content = [
    "---",
    `process: ${processRef}`,
    `reported: ${now.toISOString().slice(0, 10)}`,
    `via: ${safeVia}`,
    "status: open",
    "---",
    `# ${String(summary).trim()}`,
    "",
    String(detail).trim(),
    "",
  ].join("\n");
  // `wx`: exclusive create — the filesystem itself enforces "create, never modify".
  await writeFile(path.join(dir, name), content, { flag: "wx" });
  return { path: path.posix.join(".ai", "feedback", name) };
}

/**
 * Append one abstention line to `.ai/feedback/abstentions.jsonl` — called by the router's ADAPTERS
 * on `out_of_scope` / `ambiguous` / `needs_clarification`, never by the broker itself.
 * @param {string} rootDir
 * @param {{ query: string, verdict: string, suggestion?: string | null, at?: string }} abstention
 */
export async function appendAbstention(rootDir, { query, verdict, suggestion = null, at = new Date().toISOString() }) {
  const dir = path.join(rootDir, FEEDBACK_DIR);
  await mkdir(dir, { recursive: true });
  const line = JSON.stringify({ at, query: String(query), verdict: String(verdict), ...(suggestion ? { suggestion } : {}) });
  await appendFile(path.join(dir, ABSTENTIONS_FILE), `${line}\n`);
}

/** The abstention statuses worth journalling — an unserved request is a process waiting to exist. */
export function isAbstention(status) {
  return status === "out_of_scope" || status === "ambiguous" || status === "needs_clarification";
}

/** Normalization for aggregation (case, punctuation, spacing): recurring asks group together. */
export function normalizeQuery(query) {
  return String(query)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The field pile, read side: frictions (one card each, newest first) and abstentions aggregated by
 * normalized query with a counter — a recurring unserved ask is a process waiting to exist.
 * @param {string} rootDir
 * @param {{ status?: "open" | "resolved" | "all" }} [options]
 */
export async function readFeedback(rootDir, { status = "open" } = {}) {
  const dir = path.join(rootDir, FEEDBACK_DIR);
  let names = [];
  try {
    names = (await readdir(dir)).filter((n) => n.endsWith(".md"));
  } catch {
    /* no feedback yet */
  }

  const frictions = [];
  for (const name of names.sort().reverse()) {
    try {
      const parsed = parseFrontmatter(await readFile(path.join(dir, name), "utf8"));
      const entryStatus = parsed.data.status === "resolved" ? "resolved" : "open";
      if (status !== "all" && entryStatus !== status) continue;
      const lines = parsed.body.trim().split("\n");
      const summary = (lines[0] ?? "").replace(/^#\s*/, "").trim();
      frictions.push({
        path: path.posix.join(".ai", "feedback", name),
        process: String(parsed.data.process ?? ""),
        reported: String(parsed.data.reported ?? ""),
        via: parsed.data.via === "assistant" ? "assistant" : "user",
        status: entryStatus,
        summary,
        detail: lines.slice(1).join("\n").trim(),
      });
    } catch {
      /* skip unreadable entry */
    }
  }

  const abstentions = new Map();
  try {
    const raw = await readFile(path.join(dir, ABSTENTIONS_FILE), "utf8");
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      const key = normalizeQuery(entry.query ?? "");
      if (!key) continue;
      const existing = abstentions.get(key) ?? { query: String(entry.query), verdict: String(entry.verdict ?? ""), count: 0, lastAt: "" };
      existing.count += 1;
      if (String(entry.at ?? "") > existing.lastAt) {
        existing.lastAt = String(entry.at ?? "");
        existing.verdict = String(entry.verdict ?? existing.verdict);
      }
      abstentions.set(key, existing);
    }
  } catch {
    /* no journal yet */
  }

  return {
    frictions,
    abstentions: [...abstentions.values()].sort((a, b) => b.count - a.count || (a.lastAt < b.lastAt ? 1 : -1)),
  };
}
