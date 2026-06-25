// Évaluations — the orchestrator only. ONE selection (the hash) drives three projections: the
// filter bar (Drive-style chips), the Pulse (the heartbeat strip) and the run cards. Launching
// lives in a right-hand drawer («▶ Évaluer»); a run in flight shows a progress pill and a
// skeleton card, results stream in as cards. The Terrain pile (field signals) stays on top:
// it is the pile of WORK, it outranks the metrics — and its counters never mix with these.

import { useEffect, useMemo, useRef, useState } from "react";
import { api, type Feedback, type RunSummary, type StudioSettings } from "../api.ts";
import { useCopy } from "../copy.ts";
import { useLang } from "../i18n.ts";
import { EvalDrawer } from "../components/EvalDrawer.tsx";
import { FilterBar } from "../components/FilterBar.tsx";
import { Pulse } from "../components/Pulse.tsx";
import { FrictionsPile } from "../components/TerrainPile.tsx";
import { RunCard } from "./RunCard.tsx";
import {
  filterRuns,
  modelLabel,
  outcomeWord,
  useResource,
  type EvalSelection,
  type EvalState,
  type RouteState,
} from "../lib.ts";

export function Monitor({
  evalState,
  onChange,
  onBack,
}: {
  evalState: EvalState;
  onChange: (next: RouteState) => void;
  onBack: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const root = evalState.root ?? undefined;
  const { data: overview, reload, error } = useResource(
    () => api.experiments(root, evalState.q || undefined),
    [root, evalState.q],
  );
  const { data: settings } = useResource<StudioSettings>(() => api.settings(), []);
  const aliases = settings?.aliases ?? {};
  const { data: feedback, reload: reloadFeedback } = useResource<Feedback>(() => api.feedback(root, "open"), [root]);

  // `now` anchors the period window and ages; it refreshes with the data, so the projections
  // stay pure functions of (runs, selection, now).
  const now = useMemo(() => new Date().toISOString(), [overview]);

  // Poll while a run is in flight: results land one by one.
  const running = overview?.eval?.running ?? false;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(reload, 1500);
    return () => clearInterval(id);
  }, [running, reload]);

  // The drawer: opened by the button, by «Évaluer ▶» (process in the hash), or by a relaunch.
  const [drawer, setDrawer] = useState<{ open: boolean; modelPreset: string | null }>({ open: false, modelPreset: null });
  const arrivedWithProcess = useRef(evalState.process !== null);
  useEffect(() => {
    if (arrivedWithProcess.current) setDrawer({ open: true, modelPreset: null });
  }, []);

  if (error && !overview) return <p className="error">{copy.common.errorPrefix}{error}</p>;
  if (!overview) return <p className="resultmeta">{copy.common.loading}</p>;

  const selection: EvalSelection = evalState;
  const matched = overview.matched === null ? null : new Set(overview.matched);
  const runs = filterRuns(overview.runs, selection, now, matched);
  const patch = (p: Partial<EvalSelection> & { open?: string | null }) => onChange({ ...evalState, ...p });
  const labelFor = (chip: string, value: string) =>
    chip === "model" ? modelLabel(value, aliases) : chip === "verdict" ? outcomeWord(value, lang) : value;

  // «Relancer» (same config, now): the run's OWN agent and process, the settings defaults.
  // Runs recorded before agentId existed fall back to the root's first agent — an approximation,
  // acceptable only because it is the previous behaviour, not an improvement.
  const relaunchNow = async (run: RunSummary) => {
    const agentId = run.agentId ?? (await api.list({ type: "agent", root }))[0]?.id ?? "";
    await api.startEval({
      agentId,
      processId: run.process ?? "",
      userModel: settings?.defaults.runner ?? "",
      judgeModel: settings?.defaults.judge || undefined,
      jsonMode: true,
      root,
    });
    reload();
  };

  const frictions = feedback?.frictions ?? [];
  const noRuns = runs.length === 0 && !running;

  return (
    <div className="monitor">
      <header className="eval-head">
        <div>
          {evalState.back && (
            <button className="link eval-back" onClick={onBack}>
              {copy.monitor.back}
            </button>
          )}
          <h2>{copy.monitor.title}</h2>
          <p className="eval-sub subtle">{copy.monitor.sub}</p>
        </div>
        <div className="eval-head-actions">
          {running && (
            <span className="eval-pill" role="status">
              {copy.monitor.progress(
                overview.eval.batchIndex ?? 0,
                overview.eval.batchCount ?? 1,
                overview.eval.done ?? 0,
                overview.eval.total ?? "?",
              )}
            </span>
          )}
          <button className="primary" onClick={() => setDrawer({ open: true, modelPreset: null })}>
            {copy.eval.evaluate}
          </button>
        </div>
      </header>

      {/* Open frictions are work; they outrank the metrics and lead the page. */}
      <FrictionsPile frictions={frictions} root={root} onResolved={reloadFeedback} />

      {noRuns ? (
        <EmptyRuns hasAny={overview.runs.length > 0} onLaunch={() => setDrawer({ open: true, modelPreset: null })} />
      ) : (
        <>
          <Pulse runs={runs} now={now} days={evalState.days} onOpen={(name) => patch({ open: name })} onShowAll={() => patch({ days: null })} />
          <FilterBar runs={overview.runs} selection={selection} now={now} matchedNames={matched} labelFor={labelFor} onChange={patch} />
          <section aria-label={copy.monitor.simulations}>
            <h3>{copy.monitor.runs(runs.length)}</h3>
            <div className="cardstream">
              {running && <SkeletonCard />}
              {runs.map((r) => (
                <RunCard
                  key={r.name}
                  run={r}
                  root={root}
                  modelName={modelLabel(r.model, aliases)}
                  open={evalState.open === r.name}
                  onToggle={() => patch({ open: evalState.open === r.name ? null : r.name })}
                  onRelaunch={(withModel) =>
                    withModel ? setDrawer({ open: true, modelPreset: r.model }) : void relaunchNow(r)
                  }
                />
              ))}
            </div>
          </section>
        </>
      )}

      {drawer.open && (
        <EvalDrawer
          root={root}
          processPreset={evalState.process}
          modelPreset={drawer.modelPreset}
          onClose={() => setDrawer({ open: false, modelPreset: null })}
          onStarted={reload}
        />
      )}
    </div>
  );
}

function EmptyRuns({ hasAny, onLaunch }: { hasAny: boolean; onLaunch: () => void }) {
  const copy = useCopy();
  // A filtered-out selection is a small inline note; a genuinely empty page is a hero that says
  // what an evaluation is and offers the one action worth taking.
  if (hasAny) {
    return (
      <div className="empty-state">
        <p>{copy.monitor.emptyFiltered}</p>
      </div>
    );
  }
  return (
    <section className="eval-hero" aria-label={copy.monitor.heroAria}>
      <h3>{copy.monitor.heroTitle}</h3>
      <p>{copy.monitor.heroBody}</p>
      <div className="eval-hero-actions">
        <button className="primary" onClick={onLaunch}>
          {copy.monitor.heroLaunch}
        </button>
        <button className="linklike" onClick={() => (window.location.hash = "#/settings")}>
          {copy.monitor.heroNoModel}
        </button>
      </div>
    </section>
  );
}

function SkeletonCard() {
  const copy = useCopy();
  return (
    <article className="card runcard skeleton" aria-label={copy.monitor.scenarioInProgress}>
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </article>
  );
}
