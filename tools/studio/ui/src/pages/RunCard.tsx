// One evaluation run as an expandable card: the essentials without a click (verdict word,
// scenario, process, failure/limitation badges, model alias, age, turns); the judge's verdict,
// the injected context pack and the full transcript in place on click.

import { api, type RunResult, type RunSummary, type Verdict } from "../api.ts";
import { useCopy } from "../copy.ts";
import { useLang } from "../i18n.ts";
import { failureModeWord, outcomeWord, relativeAge, severityWord, useResource } from "../lib.ts";

export function RunCard({
  run,
  root,
  modelName,
  open,
  onToggle,
  onRelaunch,
}: {
  run: RunSummary;
  root?: string;
  modelName: string;
  open: boolean;
  onToggle: () => void;
  onRelaunch: (withAnotherModel: boolean) => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  return (
    <article className={`card runcard ${open ? "card-open" : "card-closed"}`}>
      <button className="runcard-head" onClick={onToggle} aria-expanded={open} aria-label={copy.runcard.runAria(run.scenarioId ?? run.name)}>
        <OutcomeDot outcome={run.outcome} />
        <strong>{outcomeWord(run.outcome, lang)}</strong>
        <span className="runid">{run.scenarioId ?? run.name}</span>
        {run.process && <span className="badge">{run.process}</span>}
        {run.failureMode && <span className="badge badge-warn">{failureModeWord(run.failureMode, lang)}</span>}
        {(run.limitations?.length ?? 0) > 0 && <span className="badge badge-warn">{copy.runcard.limitation(run.limitations![0].tool)}</span>}
        <span className="subtle runmeta">
          {modelName || "?"} · {relativeAge(run.at, undefined, lang)} · {run.turns} {copy.runcard.turns(run.turns)}
        </span>
      </button>
      {open && <RunDetail name={run.name} root={root} onRelaunch={onRelaunch} />}
    </article>
  );
}

function RunDetail({ name, root, onRelaunch }: { name: string; root?: string; onRelaunch: (withAnotherModel: boolean) => void }) {
  const copy = useCopy();
  const { data: run, error } = useResource<RunResult>(() => api.run(name, root), [name, root]);

  if (error) return <p className="error">{copy.common.errorPrefix}{error}</p>;
  if (!run) return <p className="resultmeta">{copy.common.loading}</p>;

  const pack = run.contextPack;
  const openProcess = () => {
    if (!run.processPath) return;
    const params = new URLSearchParams();
    if (root) params.set("root", root);
    params.set("open", run.processPath);
    window.location.hash = `#/b?${params.toString()}`;
  };

  return (
    <div className="rundetail">
      {run.verdict ? <VerdictCard verdict={run.verdict} /> : <p className="hint warn">{copy.runcard.noVerdict}</p>}

      {pack && (pack.sections.length > 0 || pack.withheld.length > 0 || pack.unresolved.length > 0) && (
        <p className="resultmeta">
          {copy.runcard.contextPack(
            pack.sections.length,
            pack.sections.some((s) => s.note?.includes("≈")),
            pack.withheld.length,
            pack.unresolved.length,
          )}
        </p>
      )}

      <h4>{copy.runcard.transcript}</h4>
      <div className="trace">
        {run.turns.map((t) => (
          <div key={t.index} className="turn">
            <div className="bubble user">
              <span className="who">U</span>
              <p>{t.user}</p>
            </div>
            <div className="bubble agent">
              <span className="who">A</span>
              <div>
                <p>{t.assistant || <em>{copy.runcard.noText}</em>}</p>
                {t.toolCalls.map((tc, i) => (
                  <div key={i} className={`toolcall ${tc.denied ? "denied" : ""}`}>
                    <code>
                      {tc.name}({JSON.stringify(tc.args)})
                    </code>
                    {tc.denied && <span className="badge badge-warn">{copy.runcard.denied}</span>}
                    <div className="toolresult">{truncate(tc.result, 600)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="actions">
        {run.processPath && (
          <button className="ghost small" onClick={openProcess}>
            {copy.runcard.openProcess}
          </button>
        )}
        <button className="ghost small" onClick={() => onRelaunch(false)}>
          {copy.runcard.relaunch}
        </button>
        <button className="ghost small" onClick={() => onRelaunch(true)}>
          {copy.runcard.relaunchOther}
        </button>
      </div>
    </div>
  );
}

function VerdictCard({ verdict }: { verdict: Verdict }) {
  const copy = useCopy();
  const lang = useLang();
  return (
    <div className={`verdict v-${verdict.outcome}`}>
      <div className="verdict-head">
        <OutcomeDot outcome={verdict.outcome} />
        <strong>{outcomeWord(verdict.outcome, lang)}</strong>
        {verdict.failureMode && <span className="badge">{failureModeWord(verdict.failureMode, lang)}</span>}
        {verdict.severity && <span className="badge badge-warn">{severityWord(verdict.severity, lang)}</span>}
        <span className="subtle">{copy.eval.confidence} {Math.round(verdict.confidence * 100)}%</span>
      </div>
      <p className="verdict-note">{copy.eval.judgeNote}</p>
      {verdict.rationale && <p>{verdict.rationale}</p>}
      {verdict.fixHint && <p className="fix">{copy.runcard.fix(verdict.fixHint)}</p>}
      {verdict.evidence.length > 0 && (
        <ul className="evidence">
          {verdict.evidence.map((e, i) => (
            <li key={i}>{copy.runcard.evidence(e.turn, e.quote, e.why)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OutcomeDot({ outcome }: { outcome: string | null }) {
  const lang = useLang();
  const cls = outcome === "goal_met" ? "good" : outcome === "partially_met" ? "mid" : "bad";
  const label = outcomeWord(outcome, lang);
  return <span className={`dot ${cls}`} role="img" aria-label={label} title={label} />;
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
