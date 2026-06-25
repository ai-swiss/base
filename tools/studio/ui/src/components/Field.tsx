// One frontmatter field as a typed control (ported from the old full-page editor): checkbox for
// booleans, number input, comma-separated list for string arrays, JSON preview for nested objects,
// text/textarea otherwise. `schema_version` stays read-only (structural).

import { type ReactNode } from "react";
import { useCopy } from "../copy.ts";

const READONLY_KEYS = new Set(["schema_version"]);

export function Field({ name, value, required, onChange }: { name: string; value: unknown; required?: boolean; onChange: (v: unknown) => void }) {
  const copy = useCopy();
  const readOnly = READONLY_KEYS.has(name);

  let control: ReactNode;
  if (typeof value === "boolean") {
    control = <input type="checkbox" checked={value} disabled={readOnly} onChange={(e) => onChange(e.target.checked)} />;
  } else if (typeof value === "number") {
    control = <input type="number" value={value} disabled={readOnly} onChange={(e) => onChange(Number(e.target.value))} />;
  } else if (Array.isArray(value) && value.every((x) => typeof x === "string")) {
    control = (
      <input
        type="text"
        value={(value as string[]).join(", ")}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
        placeholder={copy.field.listPlaceholder}
      />
    );
  } else if (value !== null && typeof value === "object") {
    // Nested object / array-of-objects: preserved on save; advanced editing is out of scope.
    control = <pre className="nested">{JSON.stringify(value, null, 2)}</pre>;
  } else {
    const str = value == null ? "" : String(value);
    const long = name === "description" || name === "use_when" || str.length > 60;
    control = long ? (
      <textarea value={str} disabled={readOnly} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input type="text" value={str} disabled={readOnly} onChange={(e) => onChange(e.target.value)} />
    );
  }

  return (
    <label className="field">
      <span className="field-name">
        {name}
        {required && <span className="req" title={copy.field.requiredTip} aria-label={copy.field.requiredAria}> *</span>}
        {readOnly && <em>{copy.field.structural}</em>}
      </span>
      {control}
    </label>
  );
}
