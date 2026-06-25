// Parcourir — the orchestrator only: the hash is the source of truth, browse-hooks.ts owns
// the loading/sync logic, lib.ts the pure tree functions, and the components render. «Évaluer ▶»
// carries the process, the root and the back-hash.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CardStream } from "../components/CardStream.tsx";
import { DoctorBanner } from "../components/DoctorBanner.tsx";
import { FileCard } from "../components/FileCard.tsx";
import { FileTree, type TreeSelection } from "../components/FileTree.tsx";
import { FilterPanel } from "../components/FilterPanel.tsx";
import { Kbd } from "../components/Kbd.tsx";
import { useCopy } from "../copy.ts";
import { useLang } from "../i18n.ts";
import {
  ancestorKeys,
  buildHash,
  freshEval,
  findTreeFile,
  pruneRootsForView,
  shortcutDoes,
  SHORTCUTS,
  UNSAVED_CHANGES_MESSAGE,
  type BrowseState,
  type Types,
  type PrunedNode,
  type RouteState,
} from "../lib.ts";
import {
  initialExpansion,
  useCardLoader,
  useExplorerKeyboard,
  useHashSyncedQuery,
  useRootDerivations,
  useRootTrees,
} from "./browse-hooks.ts";

export function Browse({ state, onChange }: { state: BrowseState; onChange: (next: RouteState) => void }) {
  const copy = useCopy();
  const lang = useLang();
  const { ctxData, workspace, roots, error: loadError } = useRootTrees();

  // Selection and filter DERIVE from the hash; the search input syncs through browse-hooks.
  const selected: TreeSelection = useMemo(
    () => ({ rootId: state.root ?? (workspace ? "*" : null), path: state.dir, isFile: false }),
    [state.root, state.dir, workspace],
  );
  const types = useMemo(() => new Set(state.types), [state.types]);
  const pushQuery = useCallback((q: string) => onChange({ ...state, q }), [onChange, state]);
  const [query, setQuery] = useHashSyncedQuery(state.q, pushQuery);
  const { cards, error, loading } = useCardLoader({ ready: Boolean(ctxData), roots, selected, types, q: state.q });

  const searchRef = useRef<HTMLInputElement>(null);
  useExplorerKeyboard(searchRef);

  // Tree expansion is volatile UI state; it always unfolds down to the current dir and open card.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!roots) return;
    setExpanded((prev) => {
      const next = prev.size ? new Set(prev) : initialExpansion(roots);
      const rootId = selected.rootId === "*" ? null : selected.rootId;
      for (const target of [state.dir, state.open ?? ""]) {
        for (const key of ancestorKeys(rootId, target)) next.add(key);
      }
      return next;
    });
  }, [roots, selected.rootId, state.dir, state.open]);

  // The one expanded card reports its dirty state so scope changes can warn.
  const dirtyRef = useRef(false);
  const guardedChange = (next: RouteState) => {
    const closesCard = next.view !== "browse" || next.open !== state.open;
    if (dirtyRef.current && closesCard && !window.confirm(UNSAVED_CHANGES_MESSAGE[lang])) return;
    dirtyRef.current = false;
    onChange(next);
  };

  const selectNode = (sel: TreeSelection) => {
    if (sel.isFile) {
      // A resource file opens as its (editable) card; a non-resource opens read-only.
      const parent = sel.path.includes("/") ? sel.path.slice(0, sel.path.lastIndexOf("/")) : "";
      guardedChange({ ...state, root: sel.rootId, dir: parent, open: sel.path });
      return;
    }
    guardedChange({ ...state, root: sel.rootId === "*" ? null : sel.rootId, dir: sel.path, open: null });
  };
  const selectDir = (rootId: string | null, dir: string) => guardedChange({ ...state, root: rootId, dir, open: null });
  const widenScope = () => guardedChange({ ...state, root: null, dir: "", open: null });

  const { counts, allKinds, rootLabels } = useRootDerivations(roots);

  // An active query prunes the tree to the matching files; the type mask applies first.
  const prunedRoots = useMemo(() => pruneRootsForView(roots ?? [], types, state.q, cards), [roots, types, state.q, cards]);

  const scopeTitle =
    selected.rootId === "*"
      ? workspace
        ? copy.browse.scopeWorkspace(workspace.label, (roots ?? []).length)
        : ""
      : selected.path || ((roots ?? []).find((r) => r.rootId === selected.rootId)?.label ?? "");

  const openKey = state.open ? `${selected.rootId === "*" ? "" : selected.rootId ?? ""}:${state.open}` : null;
  // When the open path is a NON-resource file of the current root, it renders read-only.
  const openFile = useMemo(() => {
    if (!state.open || !roots) return null;
    const rootId = selected.rootId === "*" ? null : selected.rootId;
    const tree = roots.find((r) => r.rootId === rootId)?.tree;
    const file = tree ? findTreeFile(tree, state.open) : null;
    return file && file.resource === null ? { path: file.path, rootId } : null;
  }, [state.open, roots, selected.rootId]);

  const scoped = Boolean(selected.path) || selected.rootId !== (workspace ? "*" : null);

  return (
    <div className="browse">
      <ExplorerSidebar
        search={{ ref: searchRef, query, onQuery: setQuery }}
        filter={{ all: allKinds, counts, checked: types, onChange: (next) => onChange({ ...state, types: [...next] }) }}
        tree={{ roots: prunedRoots, workspace, selected, onSelect: selectNode, expanded, onExpanded: setExpanded }}
        loadError={loadError}
      />

      <section className="results">
        <DoctorBanner root={selected.rootId === "*" ? undefined : selected.rootId ?? undefined} />
        {error && <p className="error">{copy.common.errorPrefix}{error}</p>}
        <ScopeHeader
          title={scopeTitle}
          loading={loading}
          count={cards.length}
          query={state.q.trim()}
          scopedTo={scoped ? selected.path || scopeTitle : null}
          widenLabel={workspace ? copy.browse.searchAllFolders : copy.browse.searchEverywhere}
          onWiden={widenScope}
        />
        {openFile && <FileCard path={openFile.path} rootId={openFile.rootId} onClose={() => onChange({ ...state, open: null })} />}
        {!loading && !openFile && (
          <CardStream
            cards={cards}
            grouped={!state.q.trim()}
            scopeDir={selected.rootId === "*" ? "" : selected.path}
            rootLabels={rootLabels}
            onSelectDir={selectDir}
            openKey={openKey}
            onOpenCard={(card) => guardedChange({ ...state, root: card.rootId ?? state.root, open: card.path })}
            onCloseCard={() => onChange({ ...state, open: null, chat: false })}
            onDirtyChange={(d) => {
              dirtyRef.current = d;
            }}
            actionsFor={(card) => ({
              chatOpen: state.chat,
              onToggleChat: () => onChange({ ...state, chat: !state.chat }),
              onEvaluate: () =>
                guardedChange(freshEval({ root: card.rootId ?? null, process: card.id, back: buildHash(state) })),
            })}
            empty={{
              query: state.q.trim(),
              filtered: types.size > 0,
              onCheckAll: () => onChange({ ...state, types: allKinds }),
              onWiden: widenScope,
              widenLabel: state.q.trim()
                ? workspace
                  ? copy.browse.searchAllFolders
                  : copy.browse.searchEverywhere
                : workspace
                  ? copy.browse.widenAllFolders
                  : copy.browse.widenWholeSpace,
            }}
          />
        )}
        {!loading && !openFile && cards.length > 0 && (
          <p className="stream-keys">
            <Kbd k={SHORTCUTS.cards.combo} /> {shortcutDoes("cards", lang)} · <Kbd k={SHORTCUTS.open.combo} /> {copy.browse.openCollapse}
          </p>
        )}
      </section>
    </div>
  );
}

// The results header: count or ranked-results meta, plus the scope exit when a query is scoped.
function ScopeHeader({
  title,
  loading,
  count,
  query,
  scopedTo,
  widenLabel,
  onWiden,
}: {
  title: string;
  loading: boolean;
  count: number;
  query: string;
  scopedTo: string | null;
  widenLabel: string;
  onWiden: () => void;
}) {
  const copy = useCopy();
  return (
    <header className="scope-head">
      <h2 className="scope-title">{title}</h2>
      <p className="resultmeta">
        {loading ? copy.common.loading : query ? copy.browse.resultsFor(count, query) : copy.browse.resources(count)}
        {query && scopedTo !== null && (
          <>
            {copy.browse.scopeLabel}
            {scopedTo}
            {" · "}
            <button className="linklike" onClick={onWiden}>
              {widenLabel}
            </button>
          </>
        )}
      </p>
    </header>
  );
}

// The left rail, three regions with cohesive props: the search box, the tri-state type filter,
// the pruned tree. Display wiring only — every decision stays in Browse.
function ExplorerSidebar({
  search,
  filter,
  tree,
  loadError,
}: {
  search: { ref: React.RefObject<HTMLInputElement | null>; query: string; onQuery: (q: string) => void };
  filter: { all: string[]; counts: Record<string, number>; checked: Types; onChange: (next: Set<string>) => void };
  tree: {
    roots: { rootId: string | null; label: string; node: PrunedNode }[];
    workspace: { id: string; label: string } | null;
    selected: TreeSelection;
    onSelect: (sel: TreeSelection) => void;
    expanded: Set<string>;
    onExpanded: (next: Set<string>) => void;
  };
  loadError: string | null;
}) {
  const copy = useCopy();
  return (
    <aside className="sidebar">
      <div className="search">
        <input
          ref={search.ref}
          type="search"
          aria-label={copy.browse.searchAria}
          placeholder={copy.browse.searchPlaceholder}
          value={search.query}
          onChange={(e) => search.onQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") search.onQuery("");
          }}
        />
        <span className="search-kbd">
          <Kbd k={SHORTCUTS.search.combo} />
        </span>
      </div>
      <FilterPanel all={filter.all} counts={filter.counts} checked={filter.checked} onChange={filter.onChange} />
      {loadError && <p className="error">{copy.common.errorPrefix}{loadError}</p>}
      {tree.roots.length > 0 && <h2 className="tree-header">{copy.browse.workspaceHeader}</h2>}
      {tree.roots.length > 0 && (
        <FileTree
          roots={tree.roots}
          workspace={tree.workspace}
          selected={tree.selected}
          onSelect={tree.onSelect}
          expanded={tree.expanded}
          onExpandedChange={tree.onExpanded}
        />
      )}
    </aside>
  );
}
