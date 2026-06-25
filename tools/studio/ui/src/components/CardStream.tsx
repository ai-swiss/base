// One-column stream of full-width cards: grouped by root (workspace) then by folder, in
// tree order, with clickable group headers; ranked flat when a query is active; every empty state
// proposes the next action (no dead ends).

import { type Card } from "../api.ts";
import { useCopy } from "../copy.ts";
import { groupCardsByDir } from "../lib.ts";
import { ResourceCard, type CardActions } from "./ResourceCard.tsx";

export interface EmptyActions {
  onCheckAll: () => void;
  onWiden: () => void;
  widenLabel: string;
  filtered: boolean; // a type mask is active
  query: string; // the active search query, "" when browsing
}

export function CardStream({
  cards,
  grouped,
  scopeDir,
  rootLabels,
  onSelectDir,
  openKey,
  onOpenCard,
  onCloseCard,
  onDirtyChange,
  actionsFor,
  empty,
}: {
  cards: Card[];
  grouped: boolean; // false while a query ranks (flat, by score)
  scopeDir: string;
  rootLabels: Record<string, string>;
  onSelectDir: (rootId: string | null, dir: string) => void;
  openKey: string | null; // `${rootId ?? ""}:${path}` of the one expanded card
  onOpenCard: (card: Card) => void;
  onCloseCard: () => void;
  onDirtyChange: (dirty: boolean) => void;
  actionsFor: (card: Card) => CardActions;
  empty: EmptyActions;
}) {
  const copy = useCopy();
  if (cards.length === 0) {
    const scope = scopeDir || copy.cardStream.root;
    return (
      <div className="empty-state">
        <p>
          {empty.query
            ? copy.cardStream.nothingFor(empty.query, scope)
            : empty.filtered
              ? copy.cardStream.noneOfTypes(scope)
              : copy.cardStream.none(scope)}
        </p>
        <p>
          {empty.filtered && !empty.query && (
            <button className="linklike" onClick={empty.onCheckAll}>
              {copy.cardStream.checkAll}
            </button>
          )}
          <button className="linklike" onClick={empty.onWiden}>
            {empty.widenLabel}
          </button>
        </p>
      </div>
    );
  }

  if (!grouped) {
    return (
      <div className="cardstream">
        {cards.map((c) => (
          <Stream key={`${c.rootId ?? ""}:${c.path}`} card={c} openKey={openKey} onOpenCard={onOpenCard} onCloseCard={onCloseCard} onDirtyChange={onDirtyChange} actionsFor={actionsFor} />
        ))}
      </div>
    );
  }

  // Group by root (workspace fan-out) then by folder, both in incoming order.
  const byRoot: { rootId: string | null; cards: Card[] }[] = [];
  for (const card of cards) {
    const rootId = card.rootId ?? null;
    const last = byRoot[byRoot.length - 1];
    if (last && last.rootId === rootId) last.cards.push(card);
    else byRoot.push({ rootId, cards: [card] });
  }

  return (
    <div className="cardstream">
      {byRoot.map((root) => (
        <section key={root.rootId ?? ""}>
          {root.rootId && (
            <button className="group-head root-head" onClick={() => onSelectDir(root.rootId, "")}>
              ⌂ {rootLabels[root.rootId] ?? root.rootId}
            </button>
          )}
          {groupCardsByDir(root.cards, scopeDir).map((group) => (
            <section key={`${root.rootId ?? ""}:${group.dir}`}>
              {group.dir !== "" && (
                <button className="group-head" onClick={() => onSelectDir(root.rootId, group.dir)}>
                  {group.dir}
                </button>
              )}
              {group.cards.map((c) => (
                <Stream key={`${c.rootId ?? ""}:${c.path}`} card={c} openKey={openKey} onOpenCard={onOpenCard} onCloseCard={onCloseCard} onDirtyChange={onDirtyChange} actionsFor={actionsFor} />
              ))}
            </section>
          ))}
        </section>
      ))}
    </div>
  );
}

function Stream({
  card,
  openKey,
  onOpenCard,
  onCloseCard,
  onDirtyChange,
  actionsFor,
}: {
  card: Card;
  openKey: string | null;
  onOpenCard: (card: Card) => void;
  onCloseCard: () => void;
  onDirtyChange: (dirty: boolean) => void;
  actionsFor: (card: Card) => CardActions;
}) {
  const key = `${card.rootId ?? ""}:${card.path}`;
  return (
    <ResourceCard
      card={card}
      open={openKey === key}
      onOpen={() => onOpenCard(card)}
      onClose={onCloseCard}
      onDirtyChange={onDirtyChange}
      actions={actionsFor(card)}
    />
  );
}
