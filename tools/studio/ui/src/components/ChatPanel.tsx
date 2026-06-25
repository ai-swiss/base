// The co-thinker panel: right of the expanded card, the document stays visible. Every
// model suggestion arrives as a DIFF through the gate — but the chat only ANNOUNCES it
// («± Proposition · 3 blocs · +12 −4») ; the diff itself shows IN the document, where the
// decision happens, exactly like a manual review. No provider configured → no ghost chat.

import { useEffect, useRef, useState } from "react";
import { api, type Card, type ChatMemory, type ChatMessage, type ProposeResult } from "../api.ts";
import { diffStats, errorText, parseDiff } from "../lib.ts";
import { providerErrorText, useCopy } from "../copy.ts";
import { useLang } from "../i18n.ts";
import { ModelPicker } from "./ModelPicker.tsx";

export function ChatPanel({
  card,
  draft,
  proposal,
  onProposal,
  onReveal,
}: {
  card: Card;
  draft: { data: Record<string, unknown>; body: string } | null;
  /** The pending proposal, owned by the card (it is the card's review) — header display only. */
  proposal: ProposeResult | null;
  onProposal: (p: ProposeResult) => void;
  onReveal: () => void;
}) {
  const copy = useCopy();
  const lang = useLang();
  const [model, setModel] = useState<string | null>(null);
  const [hasProviders, setHasProviders] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memory, setMemory] = useState<ChatMemory | null>(null);
  // Memory protocol: messages before `archived` are folded into memory.summary; only the tail travels.
  const [archived, setArchived] = useState(0);
  const [egress, setEgress] = useState<{ notice: string } | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.models().then((m) => setHasProviders(m.length > 0)).catch(() => setHasProviders(false));
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo?.({ top: logRef.current.scrollHeight });
  }, [messages, proposal]);

  if (hasProviders === false) {
    return (
      <aside className="chatpanel">
        <p className="hint">
          {copy.chat.noModel}{" "}
          <button className="linklike" onClick={() => (window.location.hash = "#/settings")}>
            {copy.chat.connectModel}
          </button>
        </p>
      </aside>
    );
  }

  const send = async () => {
    const content = input.trim();
    if (!content || !model || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await api.chat({
        root: card.rootId ?? undefined,
        path: card.path,
        model,
        memory,
        messages: next.slice(archived),
        draft,
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
      if (res.memory && res.memory.summary !== memory?.summary) {
        // The server compacted: fold the summarized prefix; resend only the kept tail from now on.
        setArchived((a) => a + res.memory!.keptFrom);
      }
      setMemory(res.memory);
      if (res.proposal) onProposal(res.proposal);
      setEgress(res.egress);
    } catch (e) {
      // A coded provider failure (base-llm "llm.*") becomes the same actionable text as the Réglages
      // test; an uncoded error falls back to its raw message, so nothing is hidden.
      setError(providerErrorText({ code: (e as { code?: string }).code, env: (e as { env?: string }).env, error: errorText(e) }, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="chatpanel" aria-label={copy.chat.panelAria}>
      <ChatHead model={model} onModel={setModel} memory={memory} archived={archived} egress={egress} />
      <div className="chat-log" ref={logRef}>
        {messages.map((m, i) => (
          <p key={i} className={`chat-msg chat-${m.role}`}>
            <span className="who">{copy.chat.who(m.role === "user")}</span> {m.content}
          </p>
        ))}
        {proposal && <ProposalHead diff={proposal.diff} onReveal={onReveal} />}
        {busy && <p className="resultmeta">…</p>}
      </div>
      {error && <p className="error">{error}</p>}
      <textarea
        className="chat-input"
        aria-label={copy.chat.inputAria}
        placeholder={copy.chat.inputPlaceholder}
        rows={2}
        value={input}
        disabled={busy || !model}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void send();
          }
        }}
      />
    </aside>
  );
}

// Above the log: the model picker, the protocol-memory fold and the egress notice — display only.
function ChatHead({
  model,
  onModel,
  memory,
  archived,
  egress,
}: {
  model: string | null;
  onModel: (ref: string) => void;
  memory: ChatMemory | null;
  archived: number;
  egress: { notice: string } | null;
}) {
  const copy = useCopy();
  return (
    <>
      <div className="chat-head">
        <strong>{copy.chat.title}</strong>
        <ModelPicker surfaceId="chat" remember value={model} onChange={onModel} />
      </div>
      {memory && archived > 0 && (
        <details className="hint memorybar">
          <summary>{copy.chat.memory(archived)}</summary>
          <p className="memory-summary">{memory.summary}</p>
        </details>
      )}
      {egress && <p className="hint warn egress-badge">{copy.chat.withheld(egress.notice)}</p>}
    </>
  );
}

// The announcement, nothing more: the shape of the change and the way back to where it shows.
// The chat column never renders a diff — the document is the stage.
function ProposalHead({ diff, onReveal }: { diff: string; onReveal: () => void }) {
  const copy = useCopy();
  const stats = diffStats(parseDiff(diff));
  return (
    <div className="chat-proposal">
      <span>{copy.chat.proposal(stats.hunks, stats.additions, stats.deletions)}</span>
      <button className="linklike" onClick={onReveal}>
        {copy.chat.seeInDocument}
      </button>
    </div>
  );
}
