// The explorer tree: the truth of the disk, one node per dir/file, workspace roots as
// first-level nodes. Rendering + roving-tabindex keyboard only — pruning, counters and row
// flattening are pure functions in lib.ts.

import { useEffect, useRef, useState } from "react";
import { useCopy } from "../copy.ts";
import { flattenVisible, rowKey, type PrunedNode, type TreeRow } from "../lib.ts";

export interface TreeRootEntry {
  rootId: string | null;
  label: string;
  node: PrunedNode;
}

export interface TreeSelection {
  rootId: string | null; // "*" = the workspace header (all roots)
  path: string; // "" = the root node itself
  isFile: boolean;
}

export function FileTree({
  roots,
  workspace,
  selected,
  onSelect,
  expanded,
  onExpandedChange,
}: {
  roots: TreeRootEntry[];
  workspace: { id: string; label: string } | null;
  selected: TreeSelection | null;
  onSelect: (sel: TreeSelection) => void;
  expanded: ReadonlySet<string>;
  onExpandedChange: (next: Set<string>) => void;
}) {
  const copy = useCopy();
  const rows = flattenVisible(roots, expanded);
  const selectedKey = selected && selected.rootId !== "*" ? rowKey(selected.rootId, selected.path) : null;
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLDivElement>());

  // Roving tabindex: exactly one row is tabbable — the focused one, else the selected one, else row 0.
  const activeKey = focusKey ?? selectedKey ?? rows[0]?.key ?? null;

  useEffect(() => {
    if (focusKey) refs.current.get(focusKey)?.focus();
  }, [focusKey, rows.length]);

  const toggle = (key: string) => {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onExpandedChange(next);
  };

  const select = (row: TreeRow) => onSelect({ rootId: row.rootId, path: row.path, isFile: row.file !== null });

  const onKeyDown = (e: React.KeyboardEvent) => {
    const index = rows.findIndex((r) => r.key === activeKey);
    if (index === -1) return;
    const row = rows[index];
    const move = (to: number) => {
      const target = rows[Math.max(0, Math.min(rows.length - 1, to))];
      if (target) setFocusKey(target.key);
    };
    if (e.key === "ArrowDown") move(index + 1);
    else if (e.key === "ArrowUp") move(index - 1);
    else if (e.key === "ArrowRight") {
      if (row.expandable && !row.expanded) toggle(row.key);
      else move(index + 1);
    } else if (e.key === "ArrowLeft") {
      if (row.expanded) toggle(row.key);
      else {
        const parent = rows.slice(0, index).reverse().find((r) => r.depth < row.depth);
        if (parent) setFocusKey(parent.key);
      }
    } else if (e.key === "Enter") select(row);
    else return;
    e.preventDefault();
  };

  return (
    <div className="filetree" role="tree" aria-label={copy.tree.filesAria} onKeyDown={onKeyDown}>
      {workspace && (
        <button
          className={`tree-workspace ${selected?.rootId === "*" ? "selected" : ""}`}
          onClick={() => onSelect({ rootId: "*", path: "", isFile: false })}
        >
          {workspace.label.toUpperCase()}
        </button>
      )}
      {rows.map((row) => (
        <div
          key={row.key}
          ref={(el) => {
            if (el) refs.current.set(row.key, el);
            else refs.current.delete(row.key);
          }}
          role="treeitem"
          aria-level={row.depth + 1}
          aria-selected={row.key === selectedKey}
          aria-expanded={row.node ? row.expanded : undefined}
          tabIndex={row.key === activeKey ? 0 : -1}
          className={[
            "tree-row",
            row.node ? "tree-dir" : "tree-file",
            row.key === selectedKey ? "selected" : "",
            row.file && !row.file.resource ? "nonresource" : "",
          ].join(" ")}
          style={{ paddingLeft: `${row.depth * 14 + 4}px` }}
          onFocus={() => setFocusKey(row.key)}
          onClick={() => select(row)}
        >
          {row.node ? (
            <span
              className={`chevron ${row.expanded ? "open" : ""}`}
              aria-hidden
              onClick={(e) => {
                // The chevron folds/unfolds WITHOUT changing the selection.
                e.stopPropagation();
                toggle(row.key);
              }}
            >
              {row.expanded ? "▾" : "▸"}
            </span>
          ) : (
            <span className="chevron" aria-hidden />
          )}
          {row.isRoot && row.rootId !== null && <span className="root-glyph" aria-hidden>⌂ </span>}
          <span className="tree-name">{row.isRoot && row.rootId !== null ? labelOf(roots, row.rootId) : row.name}</span>
          {(row.node?.hasErrors || row.file?.resource?.hasErrors) && <span className="dot-warn" title={copy.tree.frontmatterErrors} />}
          {row.node && <span className="count">{row.node.count}</span>}
        </div>
      ))}
    </div>
  );
}

function labelOf(roots: TreeRootEntry[], rootId: string): string {
  return roots.find((r) => r.rootId === rootId)?.label ?? rootId;
}
