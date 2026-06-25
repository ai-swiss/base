// Small UI primitives shared across pages, plus the PURE functions behind the explorer (tree
// pruning, tri-state filter, keyboard row flattening). The pure functions are tested without DOM.

import { useCallback, useEffect, useState } from "react";
import type { TreeFile, TreeNode } from "./api.ts";
import type { Lang } from "./i18n.ts";

/** Narrow an unknown caught value to a message, without the repeated `String(e.message ?? e)` dance. */
export function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export interface Resource<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

/**
 * Load async data into component state, with automatic cancellation on deps-change / unmount and a
 * manual `reload()`. Stale-while-revalidate: existing data stays visible during a reload (so polling
 * never flashes a "loading" placeholder). This is the single seam for "fetch → {data, loading,
 * error}", so individual components stop re-implementing — and forgetting — the cancellation guard.
 *
 * `loader` is captured fresh each render; the effect re-runs only when `deps` (or a reload) change,
 * exactly like a `useEffect` with an explicit dependency array.
 */
export function useResource<T>(loader: () => Promise<T>, deps: unknown[]): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loader()
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(errorText(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // Mirror useEffect's explicit-deps contract; `loader` is deliberately excluded (callers own deps).
  }, [...deps, nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, error, loading, reload };
}

// ---------------------------------------------------------------------------
// Hash routing: the URL hash is the single source of truth for UI state.
// Reload or share → exact same root, folder, filters, open card. Only volatile
// things (text being edited, a chat conversation) live outside it.

export interface BrowseState {
  view: "browse";
  root: string | null; // workspace root id; "*" = the workspace node; null = single root / default
  dir: string;
  types: string[];
  q: string;
  open: string | null; // path of the expanded card
  chat: boolean;
}

export interface EvalState {
  view: "eval";
  root: string | null;
  process: string | null;
  back: string | null; // encoded Parcourir hash to restore on «Retour»
  // The selection — chips, period, transcript search, and the one open run card. ONE state in
  // the hash; the filter bar, the Pulse and the card list are all projections of it.
  verdict: string | null;
  failure: string | null;
  model: string | null;
  days: number | null; // null = everything
  q: string;
  open: string | null; // run name
}

export const DEFAULT_EVAL_DAYS = 30;

/** The one place that knows a fresh eval state — construction sites override what they carry. */
export function freshEval(partial: Partial<Omit<EvalState, "view">> = {}): EvalState {
  return {
    view: "eval",
    root: null,
    process: null,
    back: null,
    verdict: null,
    failure: null,
    model: null,
    days: DEFAULT_EVAL_DAYS,
    q: "",
    open: null,
    ...partial,
  };
}

export interface SettingsState {
  view: "settings";
}

export type RouteState = BrowseState | EvalState | SettingsState;

export const DEFAULT_BROWSE: BrowseState = { view: "browse", root: null, dir: "", types: [], q: "", open: null, chat: false };

export function parseHash(hash: string): RouteState {
  const raw = hash.replace(/^#/, "");
  const [route, query = ""] = raw.split("?", 2);
  const params = new URLSearchParams(query);
  if (route === "/eval") {
    const days = params.get("days");
    return {
      view: "eval",
      root: params.get("root"),
      process: params.get("process"),
      back: params.get("back"),
      verdict: params.get("verdict"),
      failure: params.get("failure"),
      model: params.get("model"),
      days: days === "all" ? null : days ? Number(days) : DEFAULT_EVAL_DAYS,
      q: params.get("q") ?? "",
      open: params.get("open"),
    };
  }
  if (route === "/settings") return { view: "settings" };
  return {
    view: "browse",
    root: params.get("root"),
    dir: params.get("dir") ?? "",
    types: (params.get("types") ?? "").split(",").map((k) => k.trim()).filter(Boolean),
    q: params.get("q") ?? "",
    open: params.get("open"),
    chat: params.get("chat") === "1",
  };
}

export function buildHash(state: RouteState): string {
  if (state.view === "settings") return "#/settings";
  const params = new URLSearchParams();
  if (state.view === "eval") {
    if (state.root) params.set("root", state.root);
    if (state.process) params.set("process", state.process);
    if (state.back) params.set("back", state.back);
    if (state.verdict) params.set("verdict", state.verdict);
    if (state.failure) params.set("failure", state.failure);
    if (state.model) params.set("model", state.model);
    if (state.days === null) params.set("days", "all");
    else if (state.days !== DEFAULT_EVAL_DAYS) params.set("days", String(state.days));
    if (state.q) params.set("q", state.q);
    if (state.open) params.set("open", state.open);
    const s = params.toString();
    return s ? `#/eval?${s}` : "#/eval";
  }
  if (state.root) params.set("root", state.root);
  if (state.dir) params.set("dir", state.dir);
  if (state.types.length) params.set("types", state.types.join(","));
  if (state.q) params.set("q", state.q);
  if (state.open) params.set("open", state.open);
  if (state.chat) params.set("chat", "1");
  const s = params.toString();
  return s ? `#/b?${s}` : "#/b";
}

/** The hash as React state: read once, follow hashchange, and update by writing the hash. */
export function useHashState(): [RouteState, (next: RouteState) => void] {
  const [state, setState] = useState<RouteState>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setState(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const update = useCallback((next: RouteState) => {
    const target = buildHash(next);
    if (target === window.location.hash) return;
    window.location.hash = target;
    // jsdom (and some browsers) deliver hashchange asynchronously; reflect immediately.
    setState(parseHash(target));
  }, []);
  return [state, update];
}

// ---------------------------------------------------------------------------
// Explorer pure functions (the tree shows the truth of the disk; the
// filter prunes, never reorganizes).

export type Types = ReadonlySet<string>;

/** A tree node after pruning: same shape as TreeNode plus the per-folder resource counter and an
 * error flag (any descendant resource with frontmatter errors lights the folder). */
export interface PrunedNode {
  name: string;
  path: string;
  count: number;
  hasErrors: boolean;
  dirs: PrunedNode[];
  files: TreeFile[];
}

/**
 * Prune a disk tree by a set of checked types (the filter truth table):
 * - types empty → NO filter: full structure, every dir and file kept (non-resources included);
 * - types non-empty → only resource files whose type is checked; dirs without a matching
 * descendant return null (the ancestors of a kept file always survive).
 * Every returned dir carries `count`: matching resource files in its whole descendance.
 */
export function pruneTree(tree: TreeNode, types: Types): PrunedNode | null {
  const filtering = types.size > 0;
  const files = filtering
    ? tree.files.filter((f) => f.resource !== null && types.has(f.resource.type))
    : tree.files;
  const dirs: PrunedNode[] = [];
  for (const dir of tree.dirs) {
    const pruned = pruneTree(dir, types);
    if (pruned) dirs.push(pruned);
  }
  const ownCount = files.filter((f) => f.resource !== null).length;
  const count = ownCount + dirs.reduce((sum, d) => sum + d.count, 0);
  if (filtering && count === 0) return null;
  const hasErrors = files.some((f) => f.resource?.hasErrors) || dirs.some((d) => d.hasErrors);
  return { name: tree.name, path: tree.path, count, hasErrors, dirs, files };
}

/** Count resources by type over a whole (unpruned) tree — feeds the filter panel counters. */
export function countByKind(tree: TreeNode): Record<string, number> {
  const counts: Record<string, number> = {};
  const visit = (node: TreeNode) => {
    for (const f of node.files) {
      if (f.resource) counts[f.resource.type] = (counts[f.resource.type] ?? 0) + 1;
    }
    for (const d of node.dirs) visit(d);
  };
  visit(tree);
  return counts;
}

/** A minimal card shape for grouping — the UI's Card satisfies it. */
export interface GroupableCard {
  path: string;
}

/**
 * Group cards by their parent directory, preserving the incoming (tree) order (a folder click
 * shows its whole descendance, grouped by sub-folder, with one header per group). `dir` is the
 * selected scope: cards directly inside it get the scope itself as their group. Cards must arrive
 * sorted by path (the API's default), so same-dir cards are contiguous.
 */
export function groupCardsByDir<T extends GroupableCard>(cards: readonly T[], dir: string): { dir: string; cards: T[] }[] {
  const groups: { dir: string; cards: T[] }[] = [];
  for (const card of cards) {
    const cut = card.path.lastIndexOf("/");
    const parent = cut === -1 ? "" : card.path.slice(0, cut);
    const label = parent || dir;
    const last = groups[groups.length - 1];
    if (last && last.dir === label) last.cards.push(card);
    else groups.push({ dir: label, cards: [card] });
  }
  return groups;
}

/** Find a file entry anywhere in a tree by its root-relative path. */
export function findTreeFile(tree: TreeNode, path: string): TreeFile | null {
  for (const f of tree.files) if (f.path === path) return f;
  for (const d of tree.dirs) {
    if (path === d.path || path.startsWith(`${d.path}/`)) {
      const found = findTreeFile(d, path);
      if (found) return found;
    }
  }
  return null;
}

// High-level types first: an agent is the thing a user owns, then the process it runs, then what
// those draw on (competence, template, tool); the generic `document` trails as the catch-all.
const TYPE_ORDER = ["agent", "process", "competence", "template", "tool", "document"];

/** Stable display order for types: the ontology's main types first, then the rest alphabetically. */
export function kindOrder(counts: Record<string, number>): string[] {
  const present = Object.keys(counts);
  const head = TYPE_ORDER.filter((k) => present.includes(k));
  const tail = present.filter((k) => !TYPE_ORDER.includes(k)).sort();
  return [...head, ...tail];
}

// The fields that feed the card come first (title, then description and use_when), then identity
// and lifecycle; everything else keeps its order, and the structural schema_version sits last. The
// raw frontmatter order buried use_when far down — this is the reader's order, not the file's.
const FIELD_PRIORITY = ["title", "description", "use_when", "id", "type", "status", "scope", "sensitivity"];
// Mirrors base.schema.json `required` (the resource contract; changes only on a major version).
export const REQUIRED_FIELDS = new Set(["schema_version", "id", "type", "description"]);

/** Order metadata entries for the editor: card-feeding fields first, schema_version last. */
export function orderFields(data: Record<string, unknown>): [string, unknown][] {
  const rank = (k: string) => {
    if (k === "schema_version") return Number.MAX_SAFE_INTEGER;
    const i = FIELD_PRIORITY.indexOf(k);
    return i === -1 ? 1000 : i; // unranked fields keep their (stable) incoming order between the bands
  };
  return Object.entries(data).sort((a, b) => rank(a[0]) - rank(b[0]));
}

/**
 * Prune an (already type-pruned) tree to a set of matching file paths (typing a query prunes
 * the tree to the matching files; ancestors of a match survive, everything else disappears).
 */
export function pruneToPaths(node: PrunedNode, paths: ReadonlySet<string>): PrunedNode | null {
  const files = node.files.filter((f) => paths.has(f.path));
  const dirs: PrunedNode[] = [];
  for (const dir of node.dirs) {
    const pruned = pruneToPaths(dir, paths);
    if (pruned) dirs.push(pruned);
  }
  const count = files.filter((f) => f.resource !== null).length + dirs.reduce((sum, d) => sum + d.count, 0);
  if (count === 0 && files.length === 0) return null;
  const hasErrors = files.some((f) => f.resource?.hasErrors) || dirs.some((d) => d.hasErrors);
  return { name: node.name, path: node.path, count, hasErrors, dirs, files };
}

/**
 * The tree(s) as the explorer shows them: type mask first (filter truth table), then — when a query
 * is active — pruned to the matching card paths per root. Roots left empty disappear.
 */
export function pruneRootsForView<R extends { rootId: string | null; label: string; tree: TreeNode }>(
  roots: readonly R[],
  types: Types,
  query: string,
  cards: readonly { rootId?: string | null; path: string }[],
): { rootId: string | null; label: string; node: PrunedNode }[] {
  const querying = query.trim().length > 0;
  const matchedByRoot = new Map<string | null, Set<string>>();
  if (querying) {
    for (const c of cards) {
      const key = c.rootId ?? null;
      if (!matchedByRoot.has(key)) matchedByRoot.set(key, new Set());
      matchedByRoot.get(key)!.add(c.path);
    }
  }
  const out: { rootId: string | null; label: string; node: PrunedNode }[] = [];
  for (const r of roots) {
    let node = pruneTree(r.tree, types);
    if (node && querying) node = pruneToPaths(node, matchedByRoot.get(r.rootId) ?? new Set());
    if (node) out.push({ rootId: r.rootId, label: r.label, node });
  }
  return out;
}

// ---------------------------------------------------------------------------
// The broker's diff, parsed ONCE at this frontier. There is exactly ONE diff producer in this
// app (the broker's renderDiff): a FULL-FILE line diff — "  " context, "- " deletion, "+ "
// addition, plus two sentinel strings. Full-file is a gift: applying a partial selection is a
// rebuild (walk every line, keep or drop), never a context-matching patch that could fail.

export interface DiffLine {
  type: "add" | "del" | "ctx";
  text: string;
}

export interface DiffModel {
  lines: DiffLine[];
  /** Maximal runs of consecutive changed lines, as [from, to) index ranges — the selectable blocks. */
  hunks: { from: number; to: number }[];
}

const NO_CHANGE = "(aucun changement)";

/**
 * Parse the broker's diff. NEVER throws: sentinels and unknown text degrade to context-only
 * lines (a renderer shows plain text, never a broken screen). Empty/no-change → empty model.
 */
export function parseDiff(diff: string): DiffModel {
  const text = diff.replace(/\n$/, "");
  if (!text || text === NO_CHANGE) return { lines: [], hunks: [] };
  const lines: DiffLine[] = text.split("\n").map((raw) => {
    if (raw.startsWith("+ ") || raw === "+") return { type: "add", text: raw.slice(2) };
    if (raw.startsWith("- ") || raw === "-") return { type: "del", text: raw.slice(2) };
    if (raw.startsWith("  ")) return { type: "ctx", text: raw.slice(2) };
    return { type: "ctx", text: raw }; // sentinel ("diff trop volumineux…") or foreign text
  });
  const hunks: { from: number; to: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].type === "ctx") continue;
    let to = i;
    while (to < lines.length && lines[to].type !== "ctx") to += 1;
    hunks.push({ from: i, to });
    i = to;
  }
  return { lines, hunks };
}

export function diffStats(model: DiffModel): { hunks: number; additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;
  for (const l of model.lines) {
    if (l.type === "add") additions += 1;
    else if (l.type === "del") deletions += 1;
  }
  return { hunks: model.hunks.length, additions, deletions };
}

/**
 * Rebuild the document, applying ONLY the selected hunks. The diff covers the whole file, so
 * this is a single pass: context always stays; inside a selected hunk, deletions drop and
 * additions stay; inside an unselected hunk, the OLD lines (ctx+del) survive and additions drop.
 * All-selected reproduces the proposed document; none-selected reproduces the original.
 */
export function applyDiffSelection(model: DiffModel, selected: readonly boolean[]): string {
  const inSelected = new Array(model.lines.length).fill(false);
  model.hunks.forEach((h, i) => {
    if (selected[i]) for (let k = h.from; k < h.to; k++) inSelected[k] = true;
  });
  const out: string[] = [];
  model.lines.forEach((line, i) => {
    if (line.type === "ctx") out.push(line.text);
    else if (line.type === "add" && inSelected[i]) out.push(line.text);
    else if (line.type === "del" && !inSelected[i]) out.push(line.text);
  });
  return out.length ? `${out.join("\n")}\n` : "";
}

// Intra-line emphasis for a paired del/add line: the differing span, by common prefix/suffix.
// Deliberately NOT an LCS — prefix/suffix covers the vast majority of real edits for a fraction
// of the code. Lines longer than 300 chars get no emphasis (announced cap, not a hidden one).
export function intralineRanges(a: string, b: string): { a: [number, number]; b: [number, number] } | null {
  if (a === b || a.length > 300 || b.length > 300) return null;
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA -= 1;
    endB -= 1;
  }
  return { a: [start, endA], b: [start, endB] };
}

// ---------------------------------------------------------------------------
// Évaluations: ONE selection, projected everywhere. `filterRuns` applies the chips, the period
// and the (server-resolved) transcript search; `chipOptions` counts each chip's options on the
// selection filtered by the OTHER chips — Drive's facet semantics, so picking a value never
// strands the other chips on incoherent counts.

export interface EvalSelection {
  process: string | null;
  verdict: string | null;
  failure: string | null;
  model: string | null;
  days: number | null;
  q: string;
}

export interface RunFacts {
  name: string;
  process: string | null;
  outcome: string | null;
  failureMode: string | null;
  model: string | null;
  at: string | null;
}

function withinDays(at: string | null, days: number | null, now: string): boolean {
  if (days === null) return true;
  if (!at) return false;
  return Date.parse(now) - Date.parse(at) <= days * 86_400_000;
}

/** `matchedNames`: run names matching the transcript search (server-side), or null when q is empty. */
export function filterRuns<R extends RunFacts>(
  runs: readonly R[],
  selection: EvalSelection,
  now: string,
  matchedNames: ReadonlySet<string> | null,
): R[] {
  return runs.filter(
    (r) =>
      (selection.process === null || r.process === selection.process) &&
      (selection.verdict === null || r.outcome === selection.verdict) &&
      (selection.failure === null || r.failureMode === selection.failure) &&
      (selection.model === null || r.model === selection.model) &&
      withinDays(r.at, selection.days, now) &&
      (matchedNames === null || matchedNames.has(r.name)),
  );
}

export interface ChipOption {
  value: string;
  count: number;
}

/** Options + counts for one chip, on the selection filtered by every OTHER criterion. */
export function chipOptions<R extends RunFacts>(
  runs: readonly R[],
  selection: EvalSelection,
  now: string,
  matchedNames: ReadonlySet<string> | null,
  chip: "process" | "verdict" | "failure" | "model",
): ChipOption[] {
  const others = filterRuns(runs, { ...selection, [chip]: null }, now, matchedNames);
  const field: Record<typeof chip, keyof RunFacts> = { process: "process", verdict: "outcome", failure: "failureMode", model: "model" };
  const counts = new Map<string, number>();
  for (const r of others) {
    const v = r[field[chip]];
    if (typeof v === "string" && v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

// ---------------------------------------------------------------------------
// The Pulse: the assistant's heartbeat. One bar per run, colored by verdict, day separators,
// ONE headline number (success rate) with a delta vs the previous window — and never a silent
// truncation: what falls off the left edge is counted and said.

export interface PulseModel {
  bars: { name: string; outcome: string; label: string }[];
  /** Day separators: a tick BEFORE bar index `beforeIndex`, labelled with the day. */
  dayTicks: { beforeIndex: number; label: string }[];
  headline: { rate: number; total: number; deltaPts: number | null };
  hiddenCount: number;
}

const MIN_DELTA_BASELINE = 5; // a delta against fewer runs would be noise dressed as signal

export function buildPulse(
  runs: readonly RunFacts[],
  opts: { now: string; days: number | null; maxBars: number },
  lang: Lang = "fr",
): PulseModel {
  const nowMs = Date.parse(opts.now);
  const windowMs = opts.days === null ? Number.POSITIVE_INFINITY : opts.days * 86_400_000;
  const dated = runs
    .filter((r) => r.at && Number.isFinite(Date.parse(r.at)))
    .sort((a, b) => Date.parse(a.at!) - Date.parse(b.at!));

  const inWindow = dated.filter((r) => nowMs - Date.parse(r.at!) <= windowMs);
  const previous = dated.filter((r) => {
    const age = nowMs - Date.parse(r.at!);
    return age > windowMs && age <= windowMs * 2;
  });

  const visible = inWindow.slice(-opts.maxBars);
  const hiddenCount = inWindow.length - visible.length;

  const rateOf = (rs: readonly RunFacts[]) =>
    rs.length === 0 ? 0 : Math.round((rs.filter((r) => r.outcome === "goal_met").length / rs.length) * 100);
  const rate = rateOf(inWindow);
  const deltaPts = previous.length >= MIN_DELTA_BASELINE ? rate - rateOf(previous) : null;

  const dayOf = (at: string) => new Date(at).toISOString().slice(0, 10);
  const dayLabel = (at: string) =>
    new Date(at).toLocaleDateString(lang === "en" ? "en-US" : "fr-CH", { weekday: "short", day: "numeric" });
  const dayTicks: PulseModel["dayTicks"] = [];
  visible.forEach((r, i) => {
    if (i === 0 || dayOf(r.at!) !== dayOf(visible[i - 1].at!)) {
      dayTicks.push({ beforeIndex: i, label: dayLabel(r.at!) });
    }
  });

  return {
    bars: visible.map((r) => ({
      name: r.name,
      outcome: r.outcome ?? "unknown",
      label: [r.name, r.process, outcomeWord(r.outcome, lang), relativeAge(r.at ?? "", nowMs, lang)].filter(Boolean).join(" · "),
    })),
    dayTicks,
    headline: { rate, total: inWindow.length, deltaPts },
    hiddenCount,
  };
}

// The judge's outcome word, per language. The codes (goal_met, …) are the contract; only the human
// label is translated. Closed set (packages/base-eval/src/schema.mjs).
const OUTCOME_WORDS: Record<string, { fr: string; en: string }> = {
  goal_met: { fr: "atteint", en: "met" },
  partially_met: { fr: "partiel", en: "partial" },
  not_met: { fr: "manqué", en: "missed" },
};
export function outcomeWord(outcome: string | null, lang: Lang = "fr"): string {
  const w = outcome ? OUTCOME_WORDS[outcome] : undefined;
  if (w) return w[lang];
  return lang === "en" ? "unknown" : "inconnu";
}

// The judge's severity, per language. Closed set (packages/base-eval/src/schema.mjs: SEVERITIES).
const SEVERITY_WORDS: Record<string, { fr: string; en: string }> = {
  blocker: { fr: "bloquant", en: "blocker" },
  major: { fr: "majeur", en: "major" },
  minor: { fr: "mineur", en: "minor" },
};
export function severityWord(severity: string | null, lang: Lang = "fr"): string {
  const w = severity ? SEVERITY_WORDS[severity] : undefined;
  if (w) return w[lang];
  return severity ?? "";
}

// The judge's failure mode, per language. Closed taxonomy (schema.mjs: FAILURE_MODES); an unknown
// value is humanized (underscores to spaces) rather than shown raw, so the screen is never technical.
const FAILURE_MODE_WORDS: Record<string, { fr: string; en: string }> = {
  process_not_followed: { fr: "process non suivi", en: "process not followed" },
  missing_tool: { fr: "outil manquant", en: "missing tool" },
  decision_gate_skipped: { fr: "point de validation sauté", en: "decision gate skipped" },
  unverified_claim: { fr: "affirmation non vérifiée", en: "unverified claim" },
  wrong_routing: { fr: "mauvais routage", en: "wrong routing" },
  non_termination: { fr: "sans conclusion", en: "non-termination" },
  context_loss: { fr: "perte de contexte", en: "context loss" },
  format_violation: { fr: "format non respecté", en: "format violation" },
  refused: { fr: "refus injustifié", en: "unjustified refusal" },
  off_goal: { fr: "hors objectif", en: "off goal" },
};
export function failureModeWord(mode: string | null, lang: Lang = "fr"): string {
  if (!mode) return "";
  const w = FAILURE_MODE_WORDS[mode];
  return w ? w[lang] : mode.replace(/_/g, " ");
}

/** Display name for a model ref: its settings alias when one exists, the ref otherwise. The alias
 * map is keyed by ref (`<providerId>/<model>` → display name), so this is a direct lookup. */
export function modelLabel(ref: string | null, aliases: Record<string, string>): string {
  if (!ref) return "";
  return aliases[ref] ?? ref;
}

/** Master checkbox state for the type filter: "none" | "some" (indeterminate) | "all". */
export function triState(types: Types, all: readonly string[]): "none" | "some" | "all" {
  if (types.size === 0) return "none";
  return all.every((k) => types.has(k)) ? "all" : "some";
}

// A visible row of the (multi-root) tree, used for rendering and the roving-tabindex keyboard.
export interface TreeRow {
  key: string; // `${rootId ?? ""}:${path}`
  rootId: string | null;
  node: PrunedNode | null; // null for file rows
  file: TreeFile | null; // null for dir rows
  name: string;
  path: string;
  depth: number;
  isRoot: boolean; // a workspace root node (⌂) or the single root
  expandable: boolean;
  expanded: boolean;
}

export function rowKey(rootId: string | null, path: string): string {
  return `${rootId ?? ""}:${path}`;
}

/** The row keys of a path's root and every ancestor folder — what "unfold down to here" expands. */
export function ancestorKeys(rootId: string | null, path: string): string[] {
  const keys = [rowKey(rootId, "")];
  const parts = path.split("/").filter(Boolean);
  for (let i = 1; i <= parts.length; i += 1) keys.push(rowKey(rootId, parts.slice(0, i).join("/")));
  return keys;
}

/** One guard wording for every unsaved-changes confirmation (folding, scope change, Évaluer ▶). */
export const UNSAVED_CHANGES_MESSAGE: Record<Lang, string> = {
  fr: "Modifications non proposées: continuer quand même?",
  en: "Unproposed changes: continue anyway?",
};

// ---------------------------------------------------------------------------
// Keyboard: ONE table. Handlers match through `comboMatches`, chips render through `keyLabel`
// — an invisible tool does not exist, so a shortcut can never live without its on-screen
// chip nor a chip without its handler.

export interface Shortcut {
  /** Mac glyphs ("⌘S", "Échap", "n/p" for an either-key pair); keyLabel translates per platform. */
  combo: string;
  /** What it does, in French — feeds the README shortcut section (kept true by the shortcuts test). */
  does: string;
  /** The same, in English, for the on-screen chip when the UI is in English. */
  en: string;
}

export const SHORTCUTS = {
  search: { combo: "/", does: "rechercher", en: "search" },
  cards: { combo: "j/k", does: "carte suivante / précédente", en: "next / previous card" },
  open: { combo: "Entrée", does: "ouvrir ou replier la carte sélectionnée", en: "open or collapse the selected card" },
  chat: { combo: "e", does: "éditer avec l'IA (ouvrir ou fermer)", en: "edit with AI (open or close)" },
  model: { combo: "⌘K", does: "choisir le modèle", en: "choose the model" },
  propose: { combo: "⌘S", does: "proposer les changements (ouvre la revue)", en: "propose the changes (opens the review)" },
  apply: { combo: "⌘⏎", does: "appliquer la revue", en: "apply the review" },
  refuse: { combo: "Échap", does: "refuser la revue, replier ou fermer", en: "refuse the review, collapse or close" },
  keepBlock: { combo: "⌘Y", does: "garder le bloc courant", en: "keep the current block" },
  undoBlock: { combo: "⌘N", does: "annuler le bloc courant", en: "undo the current block" },
  blocks: { combo: "n/p", does: "bloc suivant / précédent dans la revue", en: "next / previous block in the review" },
} as const satisfies Record<string, Shortcut>;

/** A shortcut's on-screen description in the active UI language. */
export function shortcutDoes(key: keyof typeof SHORTCUTS, lang: Lang): string {
  const s = SHORTCUTS[key];
  return lang === "en" ? s.en : s.does;
}

const KEY_NAMES: Record<string, string> = { Échap: "Escape", Entrée: "Enter", "⏎": "Enter" };

/** The combo as the user's platform writes it: mac keeps the glyphs, elsewhere ⌘ becomes Ctrl+. */
export function keyLabel(combo: string, platform: string): string {
  if (/Mac|iPhone|iPad/.test(platform)) return combo;
  return combo.replace("⌘", "Ctrl+").replace("⏎", "Entrée");
}

/**
 * Does a keyboard event realize a combo? "⌘X" needs meta or ctrl; a bare key ("c", "n/p",
 * "Échap") requires NO modifier — so ⌘C can never pass for "c" (copying must not toggle the
 * chat). An either-key pair ("n/p") matches both; the caller reads e.key for the direction.
 */
export function comboMatches(combo: string, e: { key: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean }): boolean {
  const mod = combo.startsWith("⌘");
  const rest = mod ? combo.slice(1) : combo;
  const keys = rest === "/" ? ["/"] : rest.split("/");
  const wanted = keys.map((k) => KEY_NAMES[k] ?? k.toLowerCase());
  const modOk = mod ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey && !e.altKey;
  return modOk && wanted.includes(e.key.length === 1 ? e.key.toLowerCase() : e.key);
}

/**
 * Flatten the visible rows of one or many root trees, honouring the expansion set. Pure, so the
 * keyboard model (↑/↓ over rows, →/← expand/collapse) is testable without DOM.
 */
export function flattenVisible(
  roots: readonly { rootId: string | null; node: PrunedNode }[],
  expanded: ReadonlySet<string>,
): TreeRow[] {
  const rows: TreeRow[] = [];
  const push = (rootId: string | null, node: PrunedNode, depth: number, isRoot: boolean) => {
    const key = rowKey(rootId, node.path);
    const isExpanded = expanded.has(key);
    rows.push({
      key,
      rootId,
      node,
      file: null,
      name: node.name,
      path: node.path,
      depth,
      isRoot,
      expandable: node.dirs.length > 0 || node.files.length > 0,
      expanded: isExpanded,
    });
    if (!isExpanded) return;
    for (const dir of node.dirs) push(rootId, dir, depth + 1, false);
    for (const file of node.files) {
      rows.push({
        key: rowKey(rootId, file.path),
        rootId,
        node: null,
        file,
        name: file.name,
        path: file.path,
        depth: depth + 1,
        isRoot: false,
        expandable: false,
        expanded: false,
      });
    }
  };
  for (const root of roots) push(root.rootId, root.node, 0, true);
  return rows;
}

// ---------------------------------------------------------------------------
// Évaluations: aggregates recomputed on the FILTERED selection, client-side.


/** "il y a 2 h" / "2 h ago" style age for run cards; falls back to the date for older runs. */
export function relativeAge(iso: string, now: number = Date.now(), lang: Lang = "fr"): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const minutes = Math.floor((now - t) / 60_000);
  const en = lang === "en";
  if (minutes < 1) return en ? "just now" : "à l'instant";
  if (minutes < 60) return en ? `${minutes} min ago` : `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return en ? `${hours} h ago` : `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return en ? `${days} d ago` : `il y a ${days} j`;
  return iso.slice(0, 10);
}
