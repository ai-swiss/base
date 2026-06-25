// The field pile shown on Évaluations: OPEN frictions, i.e. work. A friction is a pending fix; it
// outranks the simulation metrics and sits at the top of the page, NEVER mixed with their counters.
// It resolves through the ordinary gate (propose → diff → commit). Presentational: Monitor owns the
// fetch. (Router abstentions are NOT surfaced here — an abstention is usually a routing-signal gap,
// not a missing process, so its honest home is the doctor's `recurring_abstention`, threshold-gated.)

import { useState } from "react";
import { api, type Friction, type ProposeResult } from "../api.ts";
import { useCopy } from "../copy.ts";
import { DiffView } from "./DiffView.tsx";
import { errorText } from "../lib.ts";

export function FrictionsPile({ frictions, root, onResolved }: { frictions: Friction[]; root?: string; onResolved: () => void }) {
  const copy = useCopy();
  if (frictions.length === 0) return null;
  return (
    <section className="terrain" aria-label={copy.terrain.aria}>
      <header className="terrain-head">
        <h3>{copy.terrain.title}</h3>
        <p className="subtle">{copy.terrain.summary(frictions.length)}</p>
      </header>
      <div className="cardstream">
        {frictions.map((f) => (
          <FrictionCard key={f.path} friction={f} root={root} onResolved={onResolved} />
        ))}
      </div>
    </section>
  );
}

function FrictionCard({ friction, root, onResolved }: { friction: Friction; root?: string; onResolved: () => void }) {
  const copy = useCopy();
  const [review, setReview] = useState<ProposeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openProcess = () => {
    const params = new URLSearchParams();
    if (root) params.set("root", root);
    params.set("open", friction.process);
    window.location.hash = `#/b?${params.toString()}`;
  };
  const evaluate = () => {
    const params = new URLSearchParams();
    if (root) params.set("root", root);
    params.set("process", friction.process.split("/").slice(-2, -1)[0] ?? friction.process);
    window.location.hash = `#/eval?${params.toString()}`;
  };

  const markResolved = async () => {
    setBusy(true);
    setError(null);
    try {
      setReview(await api.resolveFriction(friction.path, root));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    if (!review) return;
    setBusy(true);
    try {
      await api.commitEdit(review.changeId, root);
      setReview(null);
      onResolved();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card frictioncard">
      <div className="card-head">
        <span className="dot bad" aria-hidden />
        <strong>{copy.terrain.open}</strong>
        <code className="path">{friction.process}</code>
        <span>{copy.terrain.quote(friction.summary)}</span>
        <span className="badge badge-remote">{copy.terrain.field}</span>
        <span className="subtle">{copy.terrain.reportedVia(friction.reported, friction.via)}</span>
      </div>
      {friction.detail && <p className="card-desc">{friction.detail}</p>}
      {error && <p className="error">{error}</p>}
      {review ? (
        <div className="review">
          <DiffView diff={review.diff} />
          <div className="actions">
            <button className="primary" disabled={busy} onClick={commit}>{copy.terrain.commitWrite}</button>
            <button className="ghost" disabled={busy} onClick={() => setReview(null)}>{copy.common.cancel}</button>
          </div>
        </div>
      ) : (
        <div className="actions">
          <button className="ghost small" onClick={openProcess}>{copy.terrain.openProcess}</button>
          <button className="ghost small" onClick={evaluate}>{copy.terrain.evaluate}</button>
          <button className="ghost small" disabled={busy} onClick={markResolved}>{copy.terrain.markResolved}</button>
        </div>
      )}
    </article>
  );
}
