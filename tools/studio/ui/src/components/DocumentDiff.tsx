// The review IS the document: the whole file rendered in the editor's frame (same font, same
// box), changed lines colored at their real position, and a Garder/Annuler control on each
// block — what Cursor does in the buffer. The editor cannot be decorated (it is a bare
// textarea), but a review needs no caret: one reads and decides. So switching edit ⇄ review is
// an exchange of CONTENT inside the same box, never a second box the eye must reconcile.
//
// Only long unchanged runs fold; short context stays visible because it is the document, not
// an excerpt. The decision bar at the bottom is the SAME whatever brought the review here —
// a manual «Proposer» or a chat proposal.

import { useEffect, useMemo, useRef, useState } from "react";
import { useCopy } from "../copy.ts";
import { comboMatches, diffStats, parseDiff, SHORTCUTS, type DiffLine, type DiffModel } from "../lib.ts";
import { DiffLineRow, Fold } from "./DiffView.tsx";
import { Kbd } from "./Kbd.tsx";

const CONTEXT_FOLD_THRESHOLD = 40; // an unchanged run longer than this folds…
const CONTEXT_FOLD_EDGE = 3; //       …keeping this many lines visible on each side

export function DocumentDiff({
  diff,
  selected,
  onSelect,
  busy,
  onApply,
  onRefuse,
  frameRef,
}: {
  diff: string;
  selected: boolean[];
  onSelect: (index: number, on: boolean) => void;
  busy: boolean;
  onApply: () => void;
  onRefuse: () => void;
  /** Owned by the card so «voir dans le document ↩» can focus the review from the chat. */
  frameRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const copy = useCopy();
  const model = useMemo(() => parseDiff(diff), [diff]);
  const [current, setCurrent] = useState(0);
  const localRef = useRef<HTMLDivElement>(null);
  const ref = frameRef ?? localRef;
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    ref.current?.focus();
  }, [ref]);

  if (model.lines.length === 0) {
    return (
      <div className="docdiff" ref={ref} tabIndex={-1} role="region" aria-label={copy.diff.reviewAria}>
        <p className="resultmeta docdiff-calm">{copy.diff.noChange}</p>
        <div className="docdiff-bar">
          <button className="ghost" disabled={busy} onClick={onRefuse}>
            {copy.diff.refuse} <Kbd k={SHORTCUTS.refuse.combo} />
          </button>
        </div>
      </div>
    );
  }

  const move = (delta: number) => {
    if (model.hunks.length === 0) return;
    const next = Math.min(model.hunks.length - 1, Math.max(0, current + delta));
    setCurrent(next);
    blockRefs.current[next]?.scrollIntoView?.({ block: "nearest" });
  };

  // Captured on the frame only — never a window listener — so ⌘Y/⌘N exist solely while the
  // review has focus and cannot shadow the browser elsewhere.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const keep = comboMatches(SHORTCUTS.keepBlock.combo, e);
    if (keep || comboMatches(SHORTCUTS.undoBlock.combo, e)) {
      e.preventDefault();
      onSelect(current, keep);
    } else if (comboMatches(SHORTCUTS.blocks.combo, e)) {
      e.preventDefault();
      move(e.key === "n" ? 1 : -1);
    }
  };

  const picked = selected.filter(Boolean).length;
  return (
    <div className="docdiff" ref={ref} tabIndex={0} role="region" aria-label={copy.diff.reviewAria} onKeyDown={onKeyDown}>
      <div className="docdiff-doc">
        {documentParts(model).map((part, i) => {
          if (part.type === "fold") return <Fold key={i} lines={part.lines} />;
          if (part.type === "text") return <DiffLineRow key={i} line={part.line} />;
          return (
            <ChangeBlock
              key={i}
              part={part}
              total={model.hunks.length}
              on={selected[part.block] ?? true}
              isCurrent={current === part.block}
              blockRef={(el) => {
                blockRefs.current[part.block] = el;
              }}
              onKeep={(on) => {
                setCurrent(part.block);
                onSelect(part.block, on);
              }}
            />
          );
        })}
      </div>
      <DecisionBar model={model} picked={picked} busy={busy} onApply={onApply} onRefuse={onRefuse} />
    </div>
  );
}

function ChangeBlock({
  part,
  total,
  on,
  isCurrent,
  blockRef,
  onKeep,
}: {
  part: { block: number; lines: { line: DiffLine; peer?: DiffLine }[] };
  total: number;
  on: boolean;
  isCurrent: boolean;
  blockRef: (el: HTMLDivElement | null) => void;
  onKeep: (on: boolean) => void;
}) {
  const copy = useCopy();
  return (
    <div className={`docdiff-block ${on ? "" : "off"} ${isCurrent ? "current" : ""}`} ref={blockRef}>
      <div className="docdiff-blockbar">
        <span className="subtle">{copy.diff.block(part.block + 1, total)}</span>
        <button className={`blockbtn ${on ? "on" : ""}`} aria-pressed={on} onClick={() => onKeep(true)}>
          {copy.diff.keep} <Kbd k={SHORTCUTS.keepBlock.combo} />
        </button>
        <button className={`blockbtn ${on ? "" : "on"}`} aria-pressed={!on} onClick={() => onKeep(false)}>
          {copy.diff.undo} <Kbd k={SHORTCUTS.undoBlock.combo} />
        </button>
      </div>
      {part.lines.map((l, k) => (
        <DiffLineRow key={k} line={l.line} peer={l.peer} />
      ))}
    </div>
  );
}

// One bar, one meaning whatever the door: nothing is written before «Appliquer», and
// «Refuser» leaves the review with the editor state intact.
function DecisionBar({
  model,
  picked,
  busy,
  onApply,
  onRefuse,
}: {
  model: DiffModel;
  picked: number;
  busy: boolean;
  onApply: () => void;
  onRefuse: () => void;
}) {
  const copy = useCopy();
  const stats = diffStats(model);
  // hunks === 0 with visible lines is the «diff trop volumineux» sentinel: blocks cannot be
  // itemized, but the staged change is real — applying it whole must stay possible.
  const applicable = stats.hunks === 0 || picked > 0;
  return (
    <div className="docdiff-bar">
      <span className="hint">{copy.diff.nothingWritten}</span>
      <button className="primary" disabled={busy || !applicable} onClick={onApply}>
        {copy.diff.apply(picked, stats.hunks > 1)} <Kbd k={SHORTCUTS.apply.combo} />
      </button>
      <button className="ghost" disabled={busy} onClick={onRefuse}>
        {copy.diff.refuse} <Kbd k={SHORTCUTS.refuse.combo} />
      </button>
    </div>
  );
}

type Part =
  | { type: "text"; line: DiffLine }
  | { type: "fold"; lines: DiffLine[] }
  | { type: "block"; block: number; lines: { line: DiffLine; peer?: DiffLine }[] };

// Pure shaping: unchanged runs stay whole below the threshold (the document is the stage),
// long ones fold their middle; each hunk becomes one block whose del/add lines pair
// positionally for intra-line emphasis when N lines replace N lines.
function documentParts(model: DiffModel): Part[] {
  const peers = new Map<number, DiffLine>();
  for (const h of model.hunks) {
    const dels: number[] = [];
    const adds: number[] = [];
    for (let k = h.from; k < h.to; k++) (model.lines[k].type === "del" ? dels : adds).push(k);
    if (dels.length === adds.length) {
      dels.forEach((d, k) => {
        peers.set(d, model.lines[adds[k]]);
        peers.set(adds[k], model.lines[d]);
      });
    }
  }

  const parts: Part[] = [];
  let run: DiffLine[] = [];
  const flushRun = () => {
    if (run.length > CONTEXT_FOLD_THRESHOLD) {
      for (const l of run.slice(0, CONTEXT_FOLD_EDGE)) parts.push({ type: "text", line: l });
      parts.push({ type: "fold", lines: run.slice(CONTEXT_FOLD_EDGE, run.length - CONTEXT_FOLD_EDGE) });
      for (const l of run.slice(run.length - CONTEXT_FOLD_EDGE)) parts.push({ type: "text", line: l });
    } else {
      for (const l of run) parts.push({ type: "text", line: l });
    }
    run = [];
  };

  let block = 0;
  for (let i = 0; i < model.lines.length; ) {
    if (model.lines[i].type === "ctx") {
      run.push(model.lines[i]);
      i += 1;
      continue;
    }
    flushRun();
    const hunk = model.hunks[block];
    const lines: { line: DiffLine; peer?: DiffLine }[] = [];
    for (let k = hunk.from; k < hunk.to; k++) lines.push({ line: model.lines[k], peer: peers.get(k) });
    parts.push({ type: "block", block, lines });
    block += 1;
    i = hunk.to;
  }
  flushRun();
  return parts;
}
