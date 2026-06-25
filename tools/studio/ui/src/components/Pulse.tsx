// The Pulse: one REAL <button> per run in a flex row — no SVG, no geometry. Focus, keyboard,
// aria-labels and hover transitions come free from HTML/CSS; the only logic lives in
// buildPulse (pure, tested). The Pulse reflects the CURRENT selection: chips → pulse → cards
// are three projections of one filtered list.

import { useMemo } from "react";
import { useCopy } from "../copy.ts";
import { useLang } from "../i18n.ts";
import { buildPulse, type RunFacts } from "../lib.ts";

const MAX_BARS = 60;

export function Pulse({
  runs,
  now,
  days,
  onOpen,
  onShowAll,
}: {
  runs: readonly RunFacts[];
  now: string;
  days: number | null;
  onOpen: (runName: string) => void;
  onShowAll: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const model = useMemo(() => buildPulse(runs, { now, days, maxBars: MAX_BARS }, lang), [runs, now, days, lang]);

  if (model.headline.total === 0) {
    return runs.length > 0 ? (
      <section className="pulse" aria-label={copy.pulse.aria}>
        <p className="resultmeta">
          {copy.pulse.noneInPeriod}{" "}
          <button className="linklike" onClick={onShowAll}>
            {copy.pulse.showAll}
          </button>
        </p>
      </section>
    ) : null;
  }

  const { rate, total, deltaPts } = model.headline;
  const ticksBefore = new Map(model.dayTicks.map((t) => [t.beforeIndex, t.label]));

  return (
    <section className="pulse" aria-label={copy.pulse.aria}>
      <header className="pulse-head">
        <span className="pulse-rate">{rate} %</span>
        <span className="subtle">
          {copy.pulse.successRate(total)}
          {days !== null ? copy.pulse.lastDays(days) : ""}
          {model.hiddenCount > 0 ? copy.pulse.olderOutOfScope(model.hiddenCount) : ""}
        </span>
        {deltaPts !== null && (
          <span className={`pulse-delta ${deltaPts >= 0 ? "up" : "down"}`}>
            {deltaPts >= 0 ? "▲" : "▼"} {copy.pulse.pts(deltaPts)}
          </span>
        )}
      </header>
      <div className="pulse-strip">
        {model.bars.map((bar, i) => (
          <span key={bar.name} className="pulse-slot">
            {ticksBefore.has(i) && i > 0 && <span className="pulse-tick" aria-hidden />}
            <button
              className={`pulse-bar pulse-${bar.outcome}`}
              aria-label={bar.label}
              title={bar.label}
              onClick={() => onOpen(bar.name)}
            />
          </span>
        ))}
      </div>
      <div className="pulse-days" aria-hidden>
        {model.dayTicks.map((t) => (
          <span key={t.beforeIndex}>{t.label}</span>
        ))}
      </div>
    </section>
  );
}
