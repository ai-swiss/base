// A full-width resource card: closed, it shows type, title, description, use_when and
// path; a click anywhere expands it IN PLACE. The expanded card is directly editable (body as a
// textarea, metadata in a folded «Détails» panel) and every write goes through the same
// propose → diff → commit gate as before — nothing is written until the human validates the diff.
//
// ONE review state, whatever the door: a manual «Proposer» (⌘S) and a chat proposal both land
// in `review`, rendered as the document-with-changes in the editor's own frame (DocumentDiff).
// Applying is the only write path: full selection commits the staged change as-is; a partial
// selection rebuilds the document from the chosen blocks and re-enters the same gate.

import { useEffect, useRef, useState } from "react";
import { api, type Card, type ProposeResult, type ResourceDoc } from "../api.ts";
import { useCopy } from "../copy.ts";
import { useLang } from "../i18n.ts";
import { applyDiffSelection, comboMatches, errorText, orderFields, parseDiff, REQUIRED_FIELDS, SHORTCUTS, UNSAVED_CHANGES_MESSAGE, useResource } from "../lib.ts";
import { ChatPanel } from "./ChatPanel.tsx";
import { DocumentDiff } from "./DocumentDiff.tsx";
import { Field } from "./Field.tsx";
import { Kbd } from "./Kbd.tsx";
import { useSplitPane } from "./useSplitPane.ts";

export interface CardActions {
  chatOpen?: boolean;
  onToggleChat?: () => void;
  onEvaluate?: (() => void) | null;
}

export function ResourceCard({
  card,
  open,
  onOpen,
  onClose,
  onDirtyChange,
  actions,
}: {
  card: Card;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  actions?: CardActions;
}) {
  const copy = useCopy();
  if (!open) {
    return (
      <article
        className={`card card-closed ${card.hasErrors ? "card-error" : ""}`}
        role="button"
        aria-expanded={false}
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (comboMatches(SHORTCUTS.open.combo, e)) onOpen();
        }}
      >
        <ClosedHead card={card} />
        <h3 className="card-title">{card.title}</h3>
        {card.description && <p className="card-desc">{card.description}</p>}
        {card.useWhen && <p className="card-when">{copy.card.when(card.useWhen)}</p>}
        {card.reasons && card.reasons.length > 0 && <p className="card-why">{copy.card.why(card.reasons.slice(0, 4).join(" · "))}</p>}
      </article>
    );
  }
  return <ExpandedCard card={card} onClose={onClose} onDirtyChange={onDirtyChange} actions={actions ?? {}} />;
}

function ClosedHead({ card }: { card: Card }) {
  const copy = useCopy();
  return (
    <div className="card-head">
      <span className={`kind kind-${card.type}`}>{card.type}</span>
      {card.nonDefault.includes("scope") && <span className="badge">{card.scope}</span>}
      {card.nonDefault.includes("status") && <span className="badge">{card.status}</span>}
      {card.hasErrors && <span className="badge badge-warn">{copy.card.errors}</span>}
      {typeof card.score === "number" && <span className="badge badge-score">★ {card.score.toFixed(2)}</span>}
      {card.rootId && <span className="badge badge-root">⌂ {card.rootId}</span>}
      <code className="path">{card.path}</code>
    </div>
  );
}

/** The one review state: the staged change and one boolean per changed block. */
interface Review {
  changeId: string;
  diff: string;
  selected: boolean[];
}

/**
 * The gate's client side, ONE state for both doors: a proposal (manual ⌘S or chat) enters
 * review; applying commits — whole when every block is kept, otherwise the document is rebuilt
 * from the chosen blocks and re-enters the same gate (a fresh staged change). The write path
 * never changes. Refusing never writes.
 */
function useReviewGate(path: string, root: string | undefined, onApplied: () => void) {
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enterReview = (proposal: ProposeResult) => {
    setReview({ changeId: proposal.changeId, diff: proposal.diff, selected: parseDiff(proposal.diff).hunks.map(() => true) });
  };

  const propose = async (data: Record<string, unknown>, body: string) => {
    setError(null);
    setBusy(true);
    try {
      enterReview(await api.proposeEdit({ path, data, body, root }));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    if (!review) return;
    // No block kept = nothing to write (a sentinel diff has zero blocks and applies whole).
    if (review.selected.length > 0 && !review.selected.some(Boolean)) return;
    setBusy(true);
    try {
      let changeId = review.changeId;
      if (review.selected.some((on) => !on)) {
        const content = applyDiffSelection(parseDiff(review.diff), review.selected);
        const partial = await api.proposeContent({ path, content, root });
        changeId = partial.changeId;
      }
      await api.commitEdit(changeId, root);
      setReview(null);
      onApplied();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const refuse = () => setReview(null);
  const select = (i: number, on: boolean) =>
    setReview((r) => (r ? { ...r, selected: r.selected.map((v, k) => (k === i ? on : v)) } : r));

  return { review, busy, error, propose, enterReview, apply, refuse, select };
}

function ExpandedCard({
  card,
  onClose,
  onDirtyChange,
  actions,
}: {
  card: Card;
  onClose: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  actions: CardActions;
}) {
  const copy = useCopy();
  const lang = useLang();
  const root = card.rootId ?? undefined;
  const { data: doc, error: loadError, reload } = useResource<ResourceDoc>(() => api.resource(card.path, root), [card.path, root]);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [body, setBody] = useState("");
  // The chat's pending proposal — display only (its header in the chat column); the decision
  // happens in the gate's review, exactly like a manual proposal.
  const [chatProposal, setChatProposal] = useState<ProposeResult | null>(null);
  const [saved, setSaved] = useState(false);
  const reviewFrameRef = useRef<HTMLDivElement>(null);
  const split = useSplitPane("chat", { min: 280, max: 640, fallback: 360 });
  const gate = useReviewGate(card.path, root, () => {
    setChatProposal(null);
    setSaved(true);
    reload();
  });
  const { review } = gate;

  useEffect(() => {
    if (doc) {
      setData(doc.data);
      setBody(doc.body);
      setChatProposal(null);
    }
  }, [doc]);

  // The banner narrates the LAST action: opening a review (either door) retires it.
  useEffect(() => {
    if (review) setSaved(false);
  }, [review]);

  const dirty = doc !== null && (body !== doc.body || JSON.stringify(data) !== JSON.stringify(doc.data));

  // Report dirtiness through a ref: the effect depends on `dirty` only, whatever the callback's identity.
  const dirtyCallback = useRef(onDirtyChange);
  dirtyCallback.current = onDirtyChange;
  useEffect(() => {
    dirtyCallback.current?.(dirty);
    return () => dirtyCallback.current?.(false);
  }, [dirty]);

  // Folding guard: unproposed modifications require an explicit confirmation.
  const requestClose = () => {
    if (dirty && !window.confirm(UNSAVED_CHANGES_MESSAGE[lang])) return;
    onClose();
  };

  // Refusing never writes and never loses a keystroke: the editor keeps its (possibly dirty) state.
  const refuse = () => {
    gate.refuse();
    setChatProposal(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const inField = (e.target as HTMLElement).closest?.("input, textarea, select");
    if (comboMatches(SHORTCUTS.refuse.combo, e)) {
      e.stopPropagation();
      if (review) refuse();
      else if (actions.chatOpen && actions.onToggleChat) actions.onToggleChat(); // chat closes first
      else requestClose();
    } else if (comboMatches(SHORTCUTS.chat.combo, e) && !inField && actions.onToggleChat) {
      e.preventDefault();
      actions.onToggleChat();
    } else if (comboMatches(SHORTCUTS.propose.combo, e)) {
      e.preventDefault();
      if (dirty && !review) void gate.propose(data, body);
    } else if (comboMatches(SHORTCUTS.apply.combo, e)) {
      e.preventDefault();
      if (review) void gate.apply();
    } else if (comboMatches(SHORTCUTS.open.combo, e) && e.target === e.currentTarget) {
      // Enter is a toggle: when the card itself holds focus (not a field or inner control),
      // it folds — symmetric with Enter-to-open on the closed card.
      e.preventDefault();
      requestClose();
    }
  };

  // Opening moves focus onto the card frame: the j/k walker then has an anchor (so it keeps
  // working while a card is open), and Enter/Échap act on the card without a click first.
  const frameRef = useRef<HTMLElement>(null);
  useEffect(() => {
    frameRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <article ref={frameRef} tabIndex={-1} className={`card card-open ${card.hasErrors ? "card-error" : ""}`} onKeyDown={onKeyDown}>
      <ExpandedHead card={card} actions={actions} onRequestClose={requestClose} />
      {(gate.error || loadError) && <p className="error">{copy.common.errorPrefix}{gate.error || loadError}</p>}
      {doc && doc.errors.length > 0 && (
        <ul className="fm-errors">
          {doc.errors.map((er, i) => (
            <li key={i}>{copy.card.line(er.line, er.message)}</li>
          ))}
        </ul>
      )}
      {saved && <p className="ok">{copy.card.applied}</p>}

      <div
        className={actions.chatOpen ? "card-grid" : undefined}
        style={actions.chatOpen ? { gridTemplateColumns: `minmax(0, 1fr) 6px ${split.width}px` } : undefined}
      >
        <div className="card-main">
          {review ? (
            <DocumentDiff
              diff={review.diff}
              selected={review.selected}
              onSelect={gate.select}
              busy={gate.busy}
              onApply={() => void gate.apply()}
              onRefuse={refuse}
              frameRef={reviewFrameRef}
            />
          ) : (
            doc && (
              <CardEditor
                data={data}
                body={body}
                dirty={dirty}
                busy={gate.busy}
                onField={(key, value) => setData((prev) => ({ ...prev, [key]: value }))}
                onBody={(next) => {
                  setBody(next);
                  setSaved(false);
                }}
                onPropose={() => void gate.propose(data, body)}
                onRevert={() => {
                  setData(doc.data);
                  setBody(doc.body);
                }}
              />
            )
          )}
        </div>
        {actions.chatOpen && <div className="splitter" {...split.handleProps} />}
        {actions.chatOpen && (
          <ChatPanel
            card={card}
            draft={dirty ? { data, body } : null}
            proposal={chatProposal}
            onProposal={(p) => {
              setChatProposal(p);
              gate.enterReview(p);
            }}
            onReveal={() => reviewFrameRef.current?.focus()}
          />
        )}
      </div>
    </article>
  );
}

function ExpandedHead({ card, actions, onRequestClose }: { card: Card; actions: CardActions; onRequestClose: () => void }) {
  const copy = useCopy();
  const stop = (e: React.MouseEvent, run: () => void) => {
    e.stopPropagation();
    run();
  };
  return (
    <header className="card-openhead" onClick={onRequestClose}>
      <span className={`kind kind-${card.type}`}>{card.type}</span>
      <strong className="card-title">{card.title}</strong>
      {card.type === "process" && actions.onEvaluate && (
        <button className="ghost small" onClick={(e) => stop(e, actions.onEvaluate!)}>
          {copy.card.evaluate}
        </button>
      )}
      {actions.onToggleChat && (
        <button
          className={`ghost small ${actions.chatOpen ? "on" : ""}`}
          aria-pressed={actions.chatOpen}
          onClick={(e) => stop(e, actions.onToggleChat!)}
        >
          {copy.card.editWithAi} <Kbd k={SHORTCUTS.chat.combo} />
        </button>
      )}
      <button
        className="ghost small"
        aria-label={copy.common.collapse}
        title={copy.card.collapseTitle(SHORTCUTS.refuse.combo)}
        onClick={(e) => stop(e, onRequestClose)}
      >
        ×
      </button>
    </header>
  );
}

// Directly editable content: metadata folded behind «Détails», body as a mono textarea,
// and the sticky dirty bar that only appears once something changed.
function CardEditor({
  data,
  body,
  dirty,
  busy,
  onField,
  onBody,
  onPropose,
  onRevert,
}: {
  data: Record<string, unknown>;
  body: string;
  dirty: boolean;
  busy: boolean;
  onField: (key: string, value: unknown) => void;
  onBody: (next: string) => void;
  onPropose: () => void;
  onRevert: () => void;
}) {
  const copy = useCopy();
  return (
    <>
      <details className="card-details">
        <summary>{copy.card.detailsSummary}</summary>
        <p className="field-legend">{copy.card.requiredLegendPre}<span className="req">*</span>{copy.card.requiredLegendPost}</p>
        {orderFields(data).map(([key, value]) => (
          <Field key={key} name={key} value={value} required={REQUIRED_FIELDS.has(key)} onChange={(v) => onField(key, v)} />
        ))}
      </details>
      <textarea
        className="card-body"
        aria-label={copy.card.bodyAria}
        value={body}
        spellCheck={false}
        rows={Math.min(36, Math.max(8, body.split("\n").length + 2))}
        onChange={(e) => onBody(e.target.value)}
      />
      {dirty && (
        <div className="dirtybar">
          <span className="dirtydot">{copy.card.dirtyDot}</span>
          <button className="primary" disabled={busy} onClick={onPropose}>
            {copy.card.proposeChanges} <Kbd k={SHORTCUTS.propose.combo} />
          </button>
          <button className="ghost" disabled={busy} onClick={onRevert}>
            {copy.common.cancel}
          </button>
        </div>
      )}
    </>
  );
}
