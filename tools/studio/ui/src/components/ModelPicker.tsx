// Cursor-style model picker: one dropdown with a filter input, models grouped by provider,
// aliases shown, offline badge, manual entry as last resort, and a door to the Settings tab. The
// same component serves the chat and the evaluation launcher. With `remember`, the last choice is
// kept per surface in localStorage (a session preference, NOT team configuration — that is what
// the settings defaults are for). ⌘K opens the first picker in DOCUMENT order — no
// registry: each instance checks at event time whether it is that first one.

import { useEffect, useMemo, useRef, useState } from "react";
import { api, type CatalogModel } from "../api.ts";
import { useCopy } from "../copy.ts";
import { comboMatches, SHORTCUTS } from "../lib.ts";
import { Kbd } from "./Kbd.tsx";

export function ModelPicker({
  value,
  onChange,
  surfaceId,
  remember = false,
  disabled = false,
  shortcut = true,
  label,
  models: providedModels,
}: {
  value: string | null;
  onChange: (ref: string) => void;
  surfaceId: string;
  remember?: boolean;
  disabled?: boolean;
  /** Whether ⌘K can open this picker and show its chip. Off for the Réglages defaults pickers. */
  shortcut?: boolean;
  label?: string;
  /** Controlled catalog: when given, the picker shows exactly this list and does NOT fetch. Réglages
   *  passes its live catalog so a provider configured mid-session appears at once; chat/eval omit it. */
  models?: CatalogModel[];
}) {
  const copy = useCopy();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [fetched, setFetched] = useState<CatalogModel[]>([]);
  const [cursor, setCursor] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const storageKey = `studio.model.${surfaceId}`;
  const controlled = providedModels !== undefined;
  const models = providedModels ?? fetched;

  // Uncontrolled surfaces fetch the catalog on mount AND each time the dropdown opens, so a provider
  // configured mid-session is never missed (the old once-on-mount fetch went stale after a change).
  // Controlled surfaces (Réglages) receive their live catalog as a prop and never fetch here.
  useEffect(() => {
    if (controlled) return;
    api.models().then(setFetched).catch(() => setFetched([]));
  }, [controlled]);
  useEffect(() => {
    if (controlled || !open) return;
    api.models().then(setFetched).catch(() => {});
  }, [controlled, open]);

  // Restore the remembered choice once, only when the caller has no value yet. The ref makes the
  // restore single-shot under complete dependencies (re-runs are no-ops).
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || !remember || value) return;
    restored.current = true;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) onChange(stored);
  }, [remember, value, onChange, storageKey]);

  // ⌘K opens the FIRST shortcut-enabled picker in document order — decided at event time. A picker
  // that opts out (the Réglages defaults) registers no listener and carries no `data-shortcut`, so
  // it can neither steal ⌘K nor shadow an enabled picker elsewhere: ⌘K is simply a no-op there.
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if (!comboMatches(SHORTCUTS.model.combo, e)) return;
      if (containerRef.current !== document.querySelector(".modelpicker[data-shortcut]")) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  // The ⌘K chip shows only on the picker ⌘K actually opens (the first enabled one) — a hint on the
  // others would be a lie. Checked after mount; stable for the component's life.
  const [hasKbd, setHasKbd] = useState(false);
  useEffect(() => {
    setHasKbd(shortcut && containerRef.current === document.querySelector(".modelpicker[data-shortcut]"));
  }, [shortcut]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return models;
    return models.filter((m) => m.ref.toLowerCase().includes(f) || (m.alias ?? "").toLowerCase().includes(f));
  }, [models, filter]);

  const groups = useMemo(() => {
    const byProvider: { providerId: string; items: CatalogModel[] }[] = [];
    for (const m of filtered) {
      const last = byProvider[byProvider.length - 1];
      if (last && last.providerId === m.providerId) last.items.push(m);
      else byProvider.push({ providerId: m.providerId, items: [m] });
    }
    return byProvider;
  }, [filtered]);

  const pick = (ref: string) => {
    onChange(ref);
    if (remember) window.localStorage.setItem(storageKey, ref);
    setOpen(false);
    setFilter("");
  };

  const current = models.find((m) => m.ref === value);
  const display = value ? (current?.alias ? `${current.alias} · ${current.model}` : value) : copy.picker.placeholder;
  const manual = filter.trim().includes("/") && !filtered.some((m) => m.ref === filter.trim());

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setCursor((c) => Math.max(0, c - 1));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (filtered[cursor]) pick(filtered[cursor].ref);
      else if (manual) pick(filter.trim());
      e.preventDefault();
    }
  };

  return (
    <div className="modelpicker" data-shortcut={shortcut ? "" : undefined} ref={containerRef}>
      <button
        type="button"
        className="picker-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label && <span className="picker-label">{label}</span>}
        <span className="picker-value">⌄ {display}</span>
        {hasKbd && <Kbd k={SHORTCUTS.model.combo} />}
      </button>
      {open && (
        <PickerPop
          inputRef={inputRef}
          filter={filter}
          onFilter={(v) => {
            setFilter(v);
            setCursor(0);
          }}
          onKeyDown={onKeyDown}
          groups={groups}
          value={value}
          cursorRef={filtered[cursor]?.ref}
          manual={manual}
          manualLabel={filter.trim()}
          onPick={pick}
          label={label}
        />
      )}
    </div>
  );
}

// The dropdown body: filter input, models grouped by provider, manual entry as last resort,
// and the door to the Réglages. Pure rendering — selection logic stays in the picker.
function PickerPop({
  inputRef,
  filter,
  onFilter,
  onKeyDown,
  groups,
  value,
  cursorRef,
  manual,
  manualLabel,
  onPick,
  label,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  filter: string;
  onFilter: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  groups: { providerId: string; items: CatalogModel[] }[];
  value: string | null;
  cursorRef: string | undefined;
  manual: boolean;
  manualLabel: string;
  onPick: (ref: string) => void;
  label?: string;
}) {
  const copy = useCopy();
  const empty = groups.every((g) => g.items.length === 0);
  return (
    <div className="picker-pop" onKeyDown={onKeyDown}>
      <input
        ref={inputRef}
        className="picker-filter"
        placeholder={copy.picker.filterPlaceholder}
        aria-label={copy.picker.filterAria}
        value={filter}
        onChange={(e) => onFilter(e.target.value)}
      />
      <div className="picker-list" role="listbox" aria-label={label ?? copy.picker.listAria}>
        {groups.map((g) => (
          <div key={g.providerId} className="picker-group">
            <div className="picker-provider">{g.providerId.toUpperCase()}</div>
            {g.items.map((m) => (
              <button
                key={m.ref}
                role="option"
                aria-selected={m.ref === value}
                className={["picker-item", m.ref === value ? "selected" : "", cursorRef === m.ref ? "cursor" : ""].join(" ")}
                onClick={() => onPick(m.ref)}
              >
                {m.ref === value ? "● " : ""}
                {m.alias ? <strong>{m.alias}</strong> : null}
                {m.alias ? " · " : ""}
                {m.model}
                {!m.online && <span className="badge badge-warn">{copy.picker.offline}</span>}
                <span className={`badge badge-${m.locality}`}>{m.locality === "local" ? copy.common.local : copy.common.remote}</span>
              </button>
            ))}
          </div>
        ))}
        {empty && !manual && <p className="hint">{copy.picker.empty}</p>}
        {manual && (
          <button className="picker-item" onClick={() => onPick(manualLabel)}>
            {copy.picker.useAnyway(manualLabel)}
          </button>
        )}
      </div>
      <button
        className="picker-settings linklike"
        onClick={() => {
          // Go to Réglages (a no-op when already there) and, in that case, bring the providers section
          // into view so the action is never a dead click. scrollIntoView is optional-guarded for
          // environments (jsdom) that do not implement it.
          window.location.hash = "#/settings";
          document.getElementById("settings-models")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
        }}
      >
        {copy.picker.configure}
      </button>
    </div>
  );
}
