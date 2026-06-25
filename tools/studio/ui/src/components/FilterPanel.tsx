// The type filter: a checkbox list with a tri-state master. Fully controlled — this component
// holds NO logic beyond rendering `checked` and emitting the next set; the truth table lives in
// lib.ts (triState) and in the consumer's pruning.

import { useEffect, useRef } from "react";
import { useCopy } from "../copy.ts";
import { triState, type Types } from "../lib.ts";

export function FilterPanel({
  all,
  counts,
  checked,
  onChange,
}: {
  all: readonly string[];
  counts: Record<string, number>;
  checked: Types;
  onChange: (next: Set<string>) => void;
}) {
  const copy = useCopy();
  const master = triState(checked, all);
  const masterRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (masterRef.current) masterRef.current.indeterminate = master === "some";
  }, [master]);

  const toggleType = (type: string) => {
    const next = new Set(checked);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    onChange(next);
  };

  return (
    <fieldset className="filters">
      <legend>{copy.filter.legend}</legend>
      <label className="filter filter-master">
        <input
          ref={masterRef}
          type="checkbox"
          checked={master === "all"}
          aria-checked={master === "some" ? "mixed" : master === "all"}
          onChange={() => onChange(master === "all" ? new Set<string>() : new Set(all))}
        />
        <span>{copy.filter.allResources}</span>
      </label>
      {all.map((type) => (
        <label key={type} className="filter filter-kind">
          <input type="checkbox" checked={checked.has(type)} onChange={() => toggleType(type)} />
          <span>{type}</span>
          <span className="count">{counts[type] ?? 0}</span>
        </label>
      ))}
      {master === "none" && <p className="hint">{copy.filter.noFilter}</p>}
    </fieldset>
  );
}
