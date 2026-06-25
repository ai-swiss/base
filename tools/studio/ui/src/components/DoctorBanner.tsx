// The doctor banner: a counter, never a modal — what is about to break, with one fix hint
// per finding. Silent when the corpus is healthy.

import { useState } from "react";
import { api, type DoctorFinding } from "../api.ts";
import { useCopy } from "../copy.ts";
import { useResource } from "../lib.ts";

export function DoctorBanner({ root }: { root?: string }) {
  const copy = useCopy();
  const { data } = useResource<DoctorFinding[]>(() => api.doctor(root), [root]);
  const [open, setOpen] = useState(false);

  if (!data || data.length === 0) return null;
  const errors = data.filter((f) => f.severity === "error").length;

  return (
    <div className={`doctorbanner ${errors ? "has-errors" : ""}`}>
      <button className="linklike" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {copy.doctor.summary(data.length, errors)}
      </button>
      {open && (
        <ul className="doctorlist">
          {data.map((f, i) => (
            <li key={i}>
              <span className={`badge ${f.severity === "error" ? "badge-warn" : ""}`}>{f.type}</span>{" "}
              <code className="path">{f.path}</code>: {f.message}
              <div className="subtle">→ {f.fix_hint}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
