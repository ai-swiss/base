// True modal semantics, as a reusable behaviour: while the modal lives, the rest of the app is
// INERT (screen readers cannot wander behind it, contrast audits stop judging dimmed text),
// Échap closes, and Tab REALLY cycles inside the panel (tested by cycling, not by intent).

import { useEffect, type RefObject } from "react";

export function useModalBehavior(panelRef: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const behind = document.querySelectorAll("main, .topbar");
    for (const el of behind) el.setAttribute("inert", "");
    return () => {
      for (const el of behind) el.removeAttribute("inert");
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("select, input, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusables = [...panel.querySelectorAll<HTMLElement>("a, button, input, select, textarea")].filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelRef, onClose]);
}
