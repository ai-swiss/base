// Colored diff — hand-rolled, zero dependencies, and it only knows how to render the broker's
// diff. Lines: green additions, red deletions, dimmed context; context runs longer than 4 lines
// fold behind a «⋯ N lignes identiques» expander. Paired del/add lines get intra-line emphasis
// on the differing span. This is the COMPACT view (Terrain pile); the in-editor review with
// per-block acceptance is DocumentDiff.

import { useMemo, useState } from "react";
import { useCopy } from "../copy.ts";
import { diffStats, intralineRanges, parseDiff, type DiffLine, type DiffModel } from "../lib.ts";

const FOLD_THRESHOLD = 4; // context runs longer than this fold…
const FOLD_KEEP = 2; //      …keeping this many lines on each side

export function DiffView({ diff }: { diff: string }) {
  const copy = useCopy();
  const model = useMemo(() => parseDiff(diff), [diff]);
  const stats = diffStats(model);
  if (model.lines.length === 0) return <p className="resultmeta">{copy.diff.noChange}</p>;

  return (
    <div className="diffview" aria-label={copy.diff.proposedAria(stats.additions, stats.deletions)}>
      {shape(model).map((part, i) =>
        part.type === "fold" ? <Fold key={i} lines={part.lines} /> : <DiffLineRow key={i} line={part.line} peer={part.peer} />,
      )}
    </div>
  );
}

/** One diff line: ±gutter, color by type, intra-line emphasis when a peer pairs with it.
 * Shared by the compact view (here) and the in-editor document view (DocumentDiff). */
export function DiffLineRow({ line, peer }: { line: DiffLine; peer?: DiffLine }) {
  const marker = line.type === "add" ? "+" : line.type === "del" ? "−" : " ";
  const ranges = peer
    ? intralineRanges(line.type === "del" ? line.text : peer.text, line.type === "del" ? peer.text : line.text)
    : null;
  const span = ranges ? (line.type === "del" ? ranges.a : ranges.b) : null;
  const content =
    span && span[0] < span[1] ? (
      <>
        {line.text.slice(0, span[0])}
        <mark>{line.text.slice(span[0], span[1])}</mark>
        {line.text.slice(span[1])}
      </>
    ) : (
      line.text
    );
  const Tag = line.type === "add" ? "ins" : line.type === "del" ? "del" : "span";
  return (
    <div className={`diff-line diff-${line.type}`}>
      <span className="diff-gutter" aria-hidden>
        {marker}
      </span>
      <Tag>{content || " "}</Tag>
    </div>
  );
}

/** A folded run of identical lines, expandable in place. Shared by both diff views. */
export function Fold({ lines }: { lines: DiffLine[] }) {
  const copy = useCopy();
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <>
        {lines.map((l, i) => (
          <DiffLineRow key={i} line={l} />
        ))}
      </>
    );
  }
  return (
    <button className="diff-fold" onClick={() => setOpen(true)}>
      {copy.diff.identicalLines(lines.length)}
    </button>
  );
}

// Pure shaping of the model into renderable parts: context runs fold; del/add lines inside a
// hunk pair up positionally for the intra-line emphasis when a block replaces N lines by N lines.
type Part = { type: "line"; line: DiffLine; peer?: DiffLine } | { type: "fold"; lines: DiffLine[] };

function shape(model: DiffModel): Part[] {
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
  let atStart = true;
  const flushRun = (atEnd = false) => {
    if (run.length > FOLD_THRESHOLD) {
      const head = atStart ? 0 : FOLD_KEEP;
      const tail = atEnd ? 0 : FOLD_KEEP;
      for (const l of run.slice(0, head)) parts.push({ type: "line", line: l });
      parts.push({ type: "fold", lines: run.slice(head, run.length - tail) });
      for (const l of run.slice(run.length - tail)) parts.push({ type: "line", line: l });
    } else {
      for (const l of run) parts.push({ type: "line", line: l });
    }
    run = [];
    atStart = false;
  };

  model.lines.forEach((line, i) => {
    if (line.type === "ctx") {
      run.push(line);
      return;
    }
    flushRun();
    parts.push({ type: "line", line, peer: peers.get(i) });
  });
  flushRun(true);
  return parts;
}
