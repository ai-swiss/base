// The launch drawer: a right-hand panel, dialog semantics, trapped focus, Échap closes. You pick
// WHAT to evaluate by ticking processes in an agent → process tree (the same mental model as
// Parcourir), so a launch can span several agents; the server queues the (agent, process) targets
// one at a time. Defaults come from the Réglages; a process may arrive preselected («Évaluer ▶»
// or a relaunch). No decision lives here beyond the selection — the launch is the api call.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api, type Card } from "../api.ts";
import { useCopy } from "../copy.ts";
import { errorText, SHORTCUTS } from "../lib.ts";
import { Help } from "./Help.tsx";
import { ModelPicker } from "./ModelPicker.tsx";
import { useModalBehavior } from "./useModalBehavior.ts";

// The owning agent of a resource, from its path (.ai/agents/<agent>/…) — the rule the router uses.
function agentOf(path: string): string | null {
  return /(?:^|\/)\.ai\/agents\/([^/]+)\//.exec(path)?.[1] ?? null;
}
const targetKey = (agentId: string, processId: string) => `${agentId}\n${processId}`;

interface AgentGroup {
  id: string;
  title: string;
  processes: Card[];
}

export function EvalDrawer({
  root,
  processPreset,
  modelPreset,
  onClose,
  onStarted,
}: {
  root?: string;
  processPreset: string | null;
  /** Pre-fill the runner picker (relaunch «avec un autre modèle» keeps the run's model). */
  modelPreset?: string | null;
  onClose: () => void;
  onStarted: () => void;
}) {
  const copy = useCopy();
  const [agents, setAgents] = useState<Card[]>([]);
  const [processes, setProcesses] = useState<Card[]>([]);
  const [form, setForm] = useState<{ userModel: string; judgeModel: string; jsonMode: boolean }>({ userModel: "", judgeModel: "", jsonMode: true });
  // The (agent, process) targets to evaluate, as `${agentId}\n${processId}` keys.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [problems, setProblems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    api.list({ type: "agent", root }).then(setAgents).catch(() => {});
    api.list({ type: "process", root }).then((p) => {
      setProcesses(p);
      // An explicit preset («Évaluer ▶» / relaunch) preselects that one process, under its agent.
      const preset = processPreset ? p.find((x) => x.id === processPreset) : null;
      const agentId = preset ? agentOf(preset.path) : null;
      if (preset && agentId) setSelected(new Set([targetKey(agentId, preset.id)]));
    }).catch(() => {});
    // Réglages defaults preselect both models; an explicit preset (relaunch) wins for the runner.
    // `||`, not `??`: an empty string means «not chosen yet», it must fall through.
    api.settings().then((s) =>
      setForm((f) => ({
        ...f,
        userModel: modelPreset ?? (f.userModel || s.defaults.runner || ""),
        judgeModel: f.judgeModel || (s.defaults.judge ?? ""),
      })),
    ).catch(() => {});
  }, [root, processPreset, modelPreset]);

  useModalBehavior(panelRef, onClose);

  // Group processes under their owning agent, in the agents' listed order; agents with no process
  // drop out. This also ties each process to the RIGHT agent at launch (the old flat list ran every
  // checked process under one dropdown agent — wrong as soon as a root held several agents).
  const groups = useMemo<AgentGroup[]>(
    () =>
      agents
        .map((a) => ({ id: a.id, title: a.title, processes: processes.filter((p) => agentOf(p.path) === a.id) }))
        .filter((g) => g.processes.length > 0),
    [agents, processes],
  );

  const toggle = (agentId: string, processId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const k = targetKey(agentId, processId);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const toggleAll = (agentId: string, processIds: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const pid of processIds) {
        const k = targetKey(agentId, pid);
        if (on) next.add(k);
        else next.delete(k);
      }
      return next;
    });

  // «Tous les process»: one master over the whole tree (every agent, every process).
  const allKeys = useMemo(() => groups.flatMap((g) => g.processes.map((p) => targetKey(g.id, p.id))), [groups]);
  const allOn = allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someOn = allKeys.some((k) => selected.has(k)) && !allOn;
  const globalRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (globalRef.current) globalRef.current.indeterminate = someOn;
  }, [someOn]);

  const launch = async () => {
    setProblems([]);
    setError(null);
    setBusy(true);
    const targets = [...selected].map((k) => {
      const [agentId, processId] = k.split("\n");
      return { agentId, processId };
    });
    try {
      await api.startEval({ targets, userModel: form.userModel, judgeModel: form.judgeModel || undefined, jsonMode: form.jsonMode, root });
      onStarted();
      onClose();
    } catch (e) {
      const ex = e as Error & { problems?: string[] };
      if (ex.problems?.length) setProblems(ex.problems);
      else setError(errorText(ex));
    } finally {
      setBusy(false);
    }
  };

  const count = selected.size;

  // Portal to <body>: the drawer must not live inside the content it makes inert.
  return createPortal(
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panelRef} className="drawer" role="dialog" aria-modal="true" aria-label={copy.eval.drawerAria}>
        <header className="drawer-head">
          <h2>{copy.eval.evaluate}</h2>
          <button className="ghost small" aria-label={copy.common.close} title={copy.eval.closeTitle(SHORTCUTS.refuse.combo)} onClick={onClose}>
            ✕
          </button>
        </header>

        <p className="subtle">{copy.eval.tickProcesses}</p>
        <fieldset className="eval-processes filters">
          <legend>{copy.eval.legend}</legend>
          {groups.length === 0 ? (
            <p className="hint">{copy.eval.noProcesses}</p>
          ) : (
            <>
              <label className="filter filter-master">
                <input ref={globalRef} type="checkbox" checked={allOn} aria-checked={someOn ? "mixed" : allOn} onChange={() => setSelected(allOn ? new Set() : new Set(allKeys))} />
                <span>{copy.eval.allProcesses}</span>
              </label>
              {groups.map((g) => (
                <AgentGroupRow key={g.id} group={g} showMaster={groups.length > 1} selected={selected} onToggle={toggle} onToggleAll={toggleAll} />
              ))}
            </>
          )}
        </fieldset>

        <ModelPicker label={copy.eval.simulatedUser} surfaceId="eval-user" value={form.userModel || null} onChange={(ref) => set({ userModel: ref })} />
        <ModelPicker label={copy.eval.judge} surfaceId="eval-judge" value={form.judgeModel || null} onChange={(ref) => set({ judgeModel: ref })} />
        <div className="drawer-check-row">
          <label className="drawer-check">
            <input type="checkbox" checked={form.jsonMode} onChange={(e) => set({ jsonMode: e.target.checked })} />
            {copy.eval.jsonStrict}
          </label>
          <Help text={copy.eval.jsonStrictHelp} />
        </div>

        {problems.length > 0 && (
          <ul className="fm-errors">
            {problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        )}
        {error && <p className="error">{error}</p>}

        <button className="primary" disabled={busy || !form.userModel || count === 0} onClick={launch}>
          {copy.eval.launch(count)}
        </button>
        <p className="subtle">{copy.eval.serial}</p>
      </div>
    </div>,
    document.body,
  );
}

// One agent and its processes: a bold master row (toggles all of this agent's processes, with an
// indeterminate state for a partial selection) over indented, individually tickable process rows.
function AgentGroupRow({
  group,
  showMaster,
  selected,
  onToggle,
  onToggleAll,
}: {
  group: AgentGroup;
  /** Show the agent's own master row — only when several agents are listed (else it just echoes «Tous»). */
  showMaster: boolean;
  selected: Set<string>;
  onToggle: (agentId: string, processId: string) => void;
  onToggleAll: (agentId: string, processIds: string[], on: boolean) => void;
}) {
  const masterRef = useRef<HTMLInputElement>(null);
  const ids = group.processes.map((p) => p.id);
  const onCount = ids.filter((id) => selected.has(targetKey(group.id, id))).length;
  const all = onCount === ids.length && ids.length > 0;
  const some = onCount > 0 && !all;
  useEffect(() => {
    if (masterRef.current) masterRef.current.indeterminate = some;
  }, [some]);
  return (
    <div className="eval-agent">
      {showMaster && (
        <label className="filter filter-master">
          <input ref={masterRef} type="checkbox" checked={all} aria-checked={some ? "mixed" : all} onChange={() => onToggleAll(group.id, ids, !all)} />
          <span>{group.title}</span>
        </label>
      )}
      {group.processes.map((p) => (
        <label key={p.id} className="filter filter-kind">
          <input type="checkbox" checked={selected.has(targetKey(group.id, p.id))} onChange={() => onToggle(group.id, p.id)} />
          <span>{p.title}</span>
        </label>
      ))}
    </div>
  );
}
