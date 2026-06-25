// Studio i18n scaffolding, mirroring the documentation's FR/EN switch.
//
// The topbar chrome is translated; t() falls back to French for any key without an `en`, so the rest
// of the UI degrades gracefully to French. To translate a page: thread `lang` into it, move its
// hard-coded strings into STRINGS below with an `en`, and read them through `t()`.
//
// t() falls back to FR for any key without an `en`, so switching to English degrades gracefully
// (English chrome over still-French content) instead of showing blanks.

import { createContext, useContext } from "react";

export type Lang = "fr" | "en";

/** The active UI language, provided once by App and read by useCopy() and components below it. */
export const LangContext = createContext<Lang>("fr");

/** Read the active UI language inside any component under the provider. */
export function useLang(): Lang {
  return useContext(LangContext);
}

type Entry = { fr: string; en?: string };

const STRINGS = {
  "tab.browse": { fr: "Parcourir", en: "Browse" },
  "tab.eval": { fr: "Évaluations", en: "Evaluations" },
  "tab.settings": { fr: "Réglages", en: "Settings" },
  "topbar.manageWorkspace": { fr: "Gérer l'espace", en: "Manage workspace" },
  "topbar.docs": { fr: "Documentation ↗", en: "Documentation ↗" },
  "topbar.docsTitle": { fr: "Ouvrir la documentation BASE (site séparé)", en: "Open the BASE documentation (separate site)" },
  "theme.dark": { fr: "Sombre", en: "Dark" },
  "theme.light": { fr: "Clair", en: "Light" },
  "theme.toggleTitle": { fr: "Basculer le thème clair / sombre", en: "Toggle light / dark theme" },
  "theme.toggleAria": { fr: "Basculer le thème clair ou sombre", en: "Toggle light or dark theme" },
  "lang.label": { fr: "Langue", en: "Language" },
} satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Lang): string {
  const entry = STRINGS[key];
  return (lang === "en" && entry.en) || entry.fr;
}

const STORE_KEY = "studio-lang";

export function initialLang(): Lang {
  try {
    return localStorage.getItem(STORE_KEY) === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

export function persistLang(lang: Lang): void {
  try {
    localStorage.setItem(STORE_KEY, lang);
  } catch {
    /* private mode: the choice just won't persist */
  }
}
