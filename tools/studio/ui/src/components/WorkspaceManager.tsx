// Manage the roots of a workspace from the UI: rename, set the default, remove, add a folder.
// A dialog with trapped focus (Échap closes). Saving writes base.workspace.json through the gated
// PUT /api/workspace; the server validates every path is a real BASE root and re-resolves the
// served context, so the change takes effect without a restart. The decision (which folders) is
// the user's; this panel only collects it.

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api, type ContextRoot, type StudioContext } from "../api.ts";
import { useCopy } from "../copy.ts";
import { errorText, SHORTCUTS } from "../lib.ts";
import { useModalBehavior } from "./useModalBehavior.ts";

interface EditRoot {
  id: string;
  label: string;
  path: string;
  default: boolean;
}

export function WorkspaceManager({
  workspace,
  roots,
  onClose,
  onSaved,
}: {
  workspace: { id: string; label: string };
  roots: ContextRoot[];
  onClose: () => void;
  onSaved: (context: StudioContext) => void;
}) {
  const copy = useCopy();
  const [items, setItems] = useState<EditRoot[]>(roots.map((r) => ({ id: r.id, label: r.label, path: r.path ?? "", default: r.default })));
  const [newPath, setNewPath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useModalBehavior(panelRef, onClose);

  const patch = (i: number, p: Partial<EditRoot>) => setItems((xs) => xs.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const setDefault = (i: number) => setItems((xs) => xs.map((x, k) => ({ ...x, default: k === i })));
  const remove = (i: number) => setItems((xs) => xs.filter((_, k) => k !== i));
  const add = () => {
    const path = newPath.trim();
    if (!path) return;
    const id = path.split("/").filter(Boolean).pop() ?? copy.workspace.defaultFolderId;
    setItems((xs) => [...xs, { id, label: id, path, default: xs.length === 0 }]);
    setNewPath("");
  };

  const save = async () => {
    setError(null);
    setBusy(true);
    try {
      const context = await api.saveWorkspace({ label: workspace.label, roots: items });
      onSaved(context);
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panelRef} className="drawer" role="dialog" aria-modal="true" aria-label={copy.workspace.drawerAria}>
        <header className="drawer-head">
          <h2>{copy.workspace.title}</h2>
          <button className="ghost small" aria-label={copy.common.close} title={copy.eval.closeTitle(SHORTCUTS.refuse.combo)} onClick={onClose}>
            ✕
          </button>
        </header>
        <p className="subtle">{copy.workspace.intro}</p>
        <ul className="ws-roots">
          {items.map((r, i) => (
            <li key={i} className="ws-root">
              <input aria-label={copy.workspace.folderNameAria(i + 1)} value={r.label} onChange={(e) => patch(i, { label: e.target.value })} />
              <code className="path" title={r.path}>{r.path}</code>
              <label className="ws-default">
                <input type="radio" name="ws-default" checked={r.default} onChange={() => setDefault(i)} /> {copy.workspace.defaultLabel}
              </label>
              <button className="ghost small" onClick={() => remove(i)} disabled={items.length <= 1}>
                {copy.common.remove}
              </button>
            </li>
          ))}
        </ul>
        <div className="add-provider-row">
          <input
            aria-label={copy.workspace.addPathAria}
            placeholder={copy.workspace.addPathPlaceholder}
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
          />
          <button className="ghost small" onClick={add} disabled={!newPath.trim()}>
            {copy.workspace.addFolder}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="primary" onClick={save} disabled={busy || items.length === 0}>
          {copy.workspace.save}
        </button>
        <p className="subtle">
          {copy.workspace.notePre}<code>.ai/agents/…</code>{copy.workspace.noteMid}<code>base.workspace.json</code>{copy.workspace.notePost}
        </p>
      </div>
    </div>,
    document.body,
  );
}
