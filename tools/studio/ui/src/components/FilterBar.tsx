// Drive-style filtering: one search field + one chip per criterion. A chip opens a small
// popover of options WITH counts (computed on the selection filtered by the other chips — so
// changing one's mind is always possible); an active chip turns solid and carries its ✕. Chips
// that cannot change the selection (single-valued criterion) simply do not render: a filter
// that can do nothing is noise. The state lives in the hash — this component owns NOTHING.

import { useEffect, useRef, useState } from "react";
import { useCopy } from "../copy.ts";
import { chipOptions, comboMatches, filterRuns, SHORTCUTS, type ChipOption, type EvalSelection, type RunFacts } from "../lib.ts";
import { Kbd } from "./Kbd.tsx";

const CHIP_KEYS = ["process", "verdict", "failure", "model"] as const;
type ChipKey = (typeof CHIP_KEYS)[number];

const PERIOD_DAYS: (number | null)[] = [7, 30, 90, null];

export function FilterBar({
  runs,
  selection,
  now,
  matchedNames,
  labelFor,
  onChange,
}: {
  runs: readonly RunFacts[];
  selection: EvalSelection;
  now: string;
  matchedNames: ReadonlySet<string> | null;
  /** Display name for a chip value (model refs become their settings alias). */
  labelFor: (chip: ChipKey | "days", value: string) => string;
  onChange: (patch: Partial<EvalSelection>) => void;
}) {
  const copy = useCopy();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(selection.q);

  const chipLabel: Record<ChipKey, string> = {
    process: copy.filter.process,
    verdict: copy.filter.verdict,
    failure: copy.filter.failureMode,
    model: copy.filter.model,
  };
  const periodLabel = (days: number | null) => (days === null ? copy.filter.all : copy.filter.days(days));

  // Local input, debounced into the selection; an external change (back button) flows back in.
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== selection.q) onChange({ q: query });
    }, 300);
    return () => clearTimeout(t);
  }, [query, selection.q, onChange]);
  useEffect(() => setQuery(selection.q), [selection.q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!comboMatches(SHORTCUTS.search.combo, e) || (e.target as HTMLElement).closest("input, textarea, select")) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const anyActive = CHIP_KEYS.some((key) => selection[key] !== null) || selection.q !== "";

  return (
    <div className="filterbar" role="group" aria-label={copy.filter.runsAria}>
      <span className="search-host">
        <input
          ref={searchRef}
          type="search"
          aria-label={copy.filter.searchTranscripts}
          placeholder={copy.filter.searchTranscriptsPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="search-kbd">
          <Kbd k={SHORTCUTS.search.combo} />
        </span>
      </span>
      {CHIP_KEYS.map((key) => {
        const options = chipOptions(runs, selection, now, matchedNames, key);
        const othersCount = filterRuns(runs, { ...selection, [key]: null }, now, matchedNames).length;
        // A chip renders only if picking an option would CHANGE the selection: several values,
        // or one value that not every run shares (the rest have none).
        const canFilter = options.length >= 2 || (options.length === 1 && options[0].count < othersCount);
        return (
          <Chip
            key={key}
            label={chipLabel[key]}
            active={selection[key]}
            activeLabel={selection[key] ? labelFor(key, selection[key]!) : null}
            options={options}
            optionLabel={(v) => labelFor(key, v)}
            onPick={(value) => onChange({ [key]: value })}
            visible={canFilter}
          />
        );
      })}
      <Chip
        label={copy.filter.period}
        active={selection.days === 30 ? null : String(selection.days)}
        activeLabel={PERIOD_DAYS.includes(selection.days) ? periodLabel(selection.days) : null}
        options={PERIOD_DAYS.map((days) => ({ value: String(days), count: -1 }))}
        optionLabel={(v) => periodLabel(v === "null" ? null : Number(v))}
        onPick={(value) => onChange({ days: value === null || value === "null" ? null : Number(value) })}
      />
      {anyActive && (
        <button
          className="linklike"
          onClick={() => onChange({ process: null, verdict: null, failure: null, model: null, q: "", days: 30 })}
        >
          {copy.filter.reset}
        </button>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  activeLabel,
  options,
  optionLabel,
  onPick,
  visible = true,
}: {
  label: string;
  active: string | null;
  activeLabel: string | null;
  options: ChipOption[];
  optionLabel: (value: string) => string;
  onPick: (value: string | null) => void;
  visible?: boolean;
}) {
  const copy = useCopy();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onAway = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onAway);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onAway);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // A chip that cannot change the selection is noise — it does not render (active ones always
  // do: the user must be able to remove them).
  if (active === null && !visible) return null;

  return (
    <div className="chip-wrap" ref={ref}>
      {active !== null ? (
        <span className="chip on">
          {copy.filter.chipValue(label, activeLabel ?? "")}
          <button aria-label={copy.filter.removeFilter(label)} onClick={() => onPick(null)}>
            ✕
          </button>
        </span>
      ) : (
        <button className="chip" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {label} ▾
        </button>
      )}
      {open && active === null && (
        <ul className="chip-pop" role="listbox" aria-label={label}>
          {options.map((o) => (
            <li key={o.value}>
              <button
                role="option"
                aria-selected={false}
                onClick={() => {
                  onPick(o.value);
                  setOpen(false);
                }}
              >
                {optionLabel(o.value)}
                {o.count >= 0 && <span className="subtle"> ({o.count})</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
