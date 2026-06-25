// A hand-rolled split pane (no library): the RIGHT pane's width in px, driven by a drag
// handle. Pointer Events with pointer capture — never document-level listeners that outlive
// the component. The width is a session preference, persisted per surface like the model
// picker's choice (`studio.split.<surfaceId>`); double-click returns to the fallback and
// forgets the preference. Keyboard follows the ARIA separator pattern: ←/→ in fixed steps,
// aria-valuenow announcing the width.

import { useRef, useState } from "react";

const KEY_STEP = 16; // px per arrow press

export function useSplitPane(surfaceId: string, opts: { min: number; max: number; fallback: number }) {
  const { min, max, fallback } = opts;
  const storageKey = `studio.split.${surfaceId}`;
  const clamp = (w: number) => Math.min(max, Math.max(min, w));
  const [width, setWidth] = useState(() => {
    const stored = Number(window.localStorage.getItem(storageKey));
    return Number.isFinite(stored) && stored > 0 ? clamp(stored) : fallback;
  });
  const drag = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);

  const remember = (w: number) => window.localStorage.setItem(storageKey, String(Math.round(w)));

  const handleProps = {
    role: "separator" as const,
    "aria-orientation": "vertical" as const,
    "aria-label": "Largeur du chat",
    "aria-valuenow": Math.round(width),
    "aria-valuemin": min,
    "aria-valuemax": max,
    tabIndex: 0,
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      drag.current = { pointerId: e.pointerId, startX: e.clientX, startWidth: width };
      // jsdom has no pointer capture — the optional call keeps the hook testable.
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (drag.current === null || e.pointerId !== drag.current.pointerId) return;
      // The handle sits LEFT of the pane: dragging left widens it.
      setWidth(clamp(drag.current.startWidth + (drag.current.startX - e.clientX)));
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      if (drag.current === null) return;
      drag.current = null;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      setWidth((w) => {
        remember(w);
        return w;
      });
    },
    onDoubleClick: () => {
      setWidth(fallback);
      window.localStorage.removeItem(storageKey);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      setWidth((w) => {
        const next = clamp(w + (e.key === "ArrowLeft" ? KEY_STEP : -KEY_STEP));
        remember(next);
        return next;
      });
    },
  };

  return { width, handleProps };
}
