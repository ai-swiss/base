// The non-render logic behind Browse, extracted so the page component stays a thin orchestrator:
// loading the root trees, the hash↔input query sync, the card loader and the global keyboard.
// Each hook declares its full dependencies; idempotence guards (not lint suppressions) make the
// extra re-runs harmless.

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { api, type Card, type StudioContext, type TreeNode } from "../api.ts";
import type { TreeSelection } from "../components/FileTree.tsx";
import { comboMatches, countByKind, kindOrder, rowKey, SHORTCUTS, useResource } from "../lib.ts";

export interface LoadedRoot {
  rootId: string | null;
  label: string;
  isDefault: boolean;
  tree: TreeNode;
}

async function loadRoots(ctx: StudioContext): Promise<LoadedRoot[]> {
  if (ctx.mode !== "workspace") {
    // welcome never reaches Browse (the app routes it away); a root serves its single tree.
    const tree = await api.tree();
    return [{ rootId: null, label: tree.name, isDefault: true, tree }];
  }
  return Promise.all(
    ctx.roots.map(async (r) => ({ rootId: r.id, label: r.label, isDefault: r.default, tree: await api.tree(r.id) })),
  );
}

/** Context + one tree per root, in one resource (the page renders nothing card-wise before this). */
export function useRootTrees() {
  const ctx = useResource(() => api.context(), []);
  const rootsRes = useResource(() => (ctx.data ? loadRoots(ctx.data) : Promise.resolve(null)), [ctx.data]);
  return {
    ctxData: ctx.data,
    workspace: ctx.data?.mode === "workspace" ? ctx.data.workspace : null,
    roots: rootsRes.data ?? null,
    error: ctx.error ?? rootsRes.error,
  };
}

/** Initial expansion: every default root row plus its first level (deep trees stay usable). */
export function initialExpansion(roots: LoadedRoot[]): Set<string> {
  const expanded = new Set<string>();
  for (const r of roots) {
    if (r.isDefault) {
      expanded.add(rowKey(r.rootId, ""));
      for (const dir of r.tree.dirs) expanded.add(rowKey(r.rootId, dir.path));
    }
  }
  return expanded;
}

/**
 * The search input stays LOCAL while typing; the debounced value is pushed to the hash, and an
 * external hash change (back button, shared link) flows back into the input. `lastPushed` breaks
 * the loop between the two directions.
 */
export function useHashSyncedQuery(stateQ: string, push: (q: string) => void): [string, (q: string) => void] {
  const [query, setQuery] = useState(stateQ);
  const lastPushed = useRef(stateQ);
  const debounced = useDebounced(query, 200);

  useEffect(() => {
    if (debounced !== lastPushed.current) {
      lastPushed.current = debounced;
      push(debounced);
    }
  }, [debounced, push]);

  useEffect(() => {
    if (stateQ !== lastPushed.current) {
      lastPushed.current = stateQ;
      setQuery(stateQ);
    }
  }, [stateQ]);

  return [query, setQuery];
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Card loading: the selected node is the scope, checked types the mask, a query ranks. */
export function useCardLoader({
  ready,
  roots,
  selected,
  types,
  q,
}: {
  ready: boolean;
  roots: LoadedRoot[] | null;
  selected: TreeSelection;
  types: ReadonlySet<string>;
  q: string;
}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const kindList = types.size ? [...types] : undefined;
  const kindsKey = kindList?.join(",") ?? "";

  useEffect(() => {
    if (!ready || !roots) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const list = kindsKey ? kindsKey.split(",") : undefined;
    const query = q.trim();
    const load = async (): Promise<Card[]> => {
      if (selected.rootId === "*") {
        if (query) return api.search(query, { types: list, root: "*" });
        const all = await Promise.all(
          roots
            .filter((r) => r.rootId)
            .map(async (r) => (await api.list({ types: list, root: r.rootId! })).map((c) => ({ ...c, rootId: r.rootId }))),
        );
        return all.flat();
      }
      const root = selected.rootId ?? undefined;
      const under = selected.path || undefined;
      const result = query
        ? await api.search(query, { types: list, under, root })
        : await api.list({ types: list, under, root });
      return result.map((c) => ({ ...c, rootId: selected.rootId }));
    };
    load()
      .then((result) => !cancelled && setCards(result))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [ready, roots, q, kindsKey, selected.rootId, selected.path]);

  return { cards, error, loading };
}

/** Global keyboard: `/` focuses the search anywhere; j/k walk the card list. */
export function useExplorerKeyboard(searchRef: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest?.("input, textarea, select, [contenteditable]")) return;
      if (comboMatches(SHORTCUTS.search.combo, e)) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (comboMatches(SHORTCUTS.cards.combo, e)) {
        const items = Array.from(document.querySelectorAll<HTMLElement>(".cardstream .card"));
        const active = document.activeElement as HTMLElement | null;
        const index = items.findIndex((c) => c === active || (active !== null && c.contains(active)));
        const next = e.key === "j" ? Math.min(items.length - 1, index + 1) : Math.max(0, index - 1);
        items[next]?.focus();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchRef]);
}

/** Everything derived from the loaded roots: type counters, their display order, root labels. */
export function useRootDerivations(roots: LoadedRoot[] | null) {
  const counts = useMemo(() => {
    const merged: Record<string, number> = {};
    for (const r of roots ?? []) {
      for (const [k, n] of Object.entries(countByKind(r.tree))) merged[k] = (merged[k] ?? 0) + n;
    }
    return merged;
  }, [roots]);
  const allKinds = useMemo(() => kindOrder(counts), [counts]);
  const rootLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const r of roots ?? []) if (r.rootId) labels[r.rootId] = r.label;
    return labels;
  }, [roots]);
  return { counts, allKinds, rootLabels };
}
