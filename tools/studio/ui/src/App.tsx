import { useState } from "react";
import { LangContext, initialLang, persistLang, t, type Lang } from "./i18n.ts";
import { copyFor, useCopy } from "./copy.ts";
import { api, type StudioContext } from "./api.ts";
import { Browse } from "./pages/Browse.tsx";
import { Welcome } from "./pages/Welcome.tsx";
import { Monitor } from "./pages/Monitor.tsx";
import { Settings } from "./pages/Settings.tsx";
import { WorkspaceManager } from "./components/WorkspaceManager.tsx";
import { buildHash, DEFAULT_BROWSE, freshEval, parseHash, useHashState, useResource, type BrowseState } from "./lib.ts";

// Studio links to the canonical documentation site (the Astro renderer); it never re-renders the
// docs itself, so there is one source of truth. `base studio` co-launches `base docs serve` on this
// default port, so the link resolves the moment Studio is open.
const DOCS_URL = "http://127.0.0.1:4321/";

// Theme toggle in the topbar, labelled like the documentation's selector (dark is the default,
// set on <html> by index.html before paint). The choice persists in localStorage.
function ThemeToggle({ lang }: { lang: Lang }) {
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark",
  );
  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("studio-theme", next);
    } catch {
      /* private mode: the choice just won't persist */
    }
    setTheme(next);
  };
  return (
    <button className="theme-toggle" onClick={flip} title={t("theme.toggleTitle", lang)} aria-label={t("theme.toggleAria", lang)}>
      <span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
      {theme === "dark" ? t("theme.dark", lang) : t("theme.light", lang)}
    </button>
  );
}

// Language selector, mirroring the documentation's FR/EN switch. The topbar chrome is translated;
// t() falls back to French elsewhere (see i18n.ts).
function LangSelector({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return (
    <select
      className="lang-select"
      value={lang}
      onChange={(event) => onChange(event.target.value as Lang)}
      title={t("lang.label", lang)}
      aria-label={t("lang.label", lang)}
    >
      <option value="fr">Français</option>
      <option value="en">English</option>
    </select>
  );
}

// App carries no business state: the hash decides the active tab (and everything inside it).
export function App() {
  const [route, setRoute] = useHashState();
  const [managingWs, setManagingWs] = useState(false);

  const goBrowse = () => {
    // Coming back from Évaluations restores the exact Parcourir state (root, folder, filters,
    // open card) carried in the `back` parameter — the «Évaluer ▶» round-trip.
    if (route.view === "eval" && route.back) {
      const restored = parseHash(route.back);
      setRoute(restored.view === "browse" ? restored : DEFAULT_BROWSE);
      return;
    }
    if (route.view !== "browse") setRoute(DEFAULT_BROWSE);
  };

  const goEval = () => {
    if (route.view === "eval") return;
    const back = route.view === "browse" ? buildHash(route) : null;
    setRoute(freshEval({ root: route.view === "browse" ? route.root : null, back }));
  };

  const browseState: BrowseState = route.view === "browse" ? route : DEFAULT_BROWSE;
  const ctx = useResource<StudioContext>(() => api.context(), []);
  const [lang, setLang] = useState<Lang>(initialLang);
  const copy = copyFor(lang);
  const changeLang = (next: Lang) => {
    setLang(next);
    persistLang(next);
  };

  if (ctx.data?.mode === "welcome") {
    return (
      <LangContext.Provider value={lang}>
        <div className="app">
        <header className="topbar">
          <Brand />
          <span className="perimeter" title={ctx.data.path}>{copy.app.perimeterToConfigure(ctx.data.label)}</span>
          <span className="topbar-end">
            <ThemeToggle lang={lang} />
            <LangSelector lang={lang} onChange={changeLang} />
          </span>
        </header>
        <main>
          <Welcome context={ctx.data} onInitialized={ctx.reload} />
        </main>
        <AppFooter />
        </div>
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={lang}>
      <div className="app">
      <header className="topbar">
        <Brand />
        <PerimeterBadge context={ctx.data} />
        {ctx.data?.mode === "workspace" && (
          <button className="ghost small ws-manage" onClick={() => setManagingWs(true)}>
            {t("topbar.manageWorkspace", lang)}
          </button>
        )}
        <nav className="tabs" role="tablist" aria-label={copy.common.sections}>
          <button role="tab" aria-selected={route.view === "browse"} className={route.view === "browse" ? "on" : ""} onClick={goBrowse}>
            {t("tab.browse", lang)}
          </button>
          <button role="tab" aria-selected={route.view === "eval"} className={route.view === "eval" ? "on" : ""} onClick={goEval}>
            {t("tab.eval", lang)}
          </button>
          <button
            role="tab"
            aria-selected={route.view === "settings"}
            className={route.view === "settings" ? "on" : ""}
            onClick={() => route.view !== "settings" && setRoute({ view: "settings" })}
          >
            {t("tab.settings", lang)}
          </button>
        </nav>
        <a className="doc-link" href={DOCS_URL} target="_blank" rel="noreferrer" title={t("topbar.docsTitle", lang)}>
          {t("topbar.docs", lang)}
        </a>
        <ThemeToggle lang={lang} />
        <LangSelector lang={lang} onChange={changeLang} />
      </header>
      <main>
        {route.view === "eval" ? (
          <Monitor evalState={route} onChange={setRoute} onBack={goBrowse} />
        ) : route.view === "settings" ? (
          <Settings />
        ) : (
          <Browse state={browseState} onChange={setRoute} />
        )}
      </main>
      <AppFooter />
      {managingWs && ctx.data?.mode === "workspace" && (
        <WorkspaceManager
          workspace={ctx.data.workspace}
          roots={ctx.data.roots}
          onClose={() => setManagingWs(false)}
          onSaved={() => ctx.reload()}
        />
      )}
      </div>
    </LangContext.Provider>
  );
}

// The brand lockup: the AI Swiss mark (Studio is a project of AI Swiss), a hairline divider, then
// the "BASE" wordmark in the brand red with "Studio" as the slate sub-descriptor. One source of
// truth for the header identity, shared by the welcome and main chromes.
function Brand() {
  const copy = useCopy();
  return (
    <span className="brand">
      <a className="brand-logo-link" href="https://a-i.swiss" target="_blank" rel="noreferrer" title={copy.app.brandTitle}>
        <img className="brand-logo brand-logo-light" src="/logo-ai-swiss.png" alt="AI Swiss" />
        <img className="brand-logo brand-logo-dark" src="/logo-ai-swiss-dark.png" alt="AI Swiss" />
      </a>
      <span className="brand-divider" aria-hidden="true" />
      <span className="brand-name">BASE</span>
      <span className="brand-sub">Studio</span>
    </span>
  );
}

// Endorsement: BASE is a project of AI Swiss (a Swiss non-profit), with business use cases seeded
// in partnership with Innovaud — the same wording the README and docs carry, kept consistent here.
function AppFooter() {
  const copy = useCopy();
  return (
    <footer className="app-foot">
      {copy.app.footerPre}<a href="https://a-i.swiss" target="_blank" rel="noreferrer">{copy.app.footerLink}</a>
      {copy.app.footerMid}<a href="https://innovaud.ch" target="_blank" rel="noreferrer">{copy.app.footerLink2}</a>{copy.app.footerEnd}
    </footer>
  );
}

// The perimeter, shown only when it carries non-obvious information: a WORKSPACE binds several
// roots, and which/how many is worth stating beside the «Gérer l'espace» control. A single root
// needs no badge — it would only echo the wordmark; the browser tab already says where you are.
function PerimeterBadge({ context: data }: { context: StudioContext | null }) {
  const copy = useCopy();
  if (!data || data.mode !== "workspace") return null;
  const n = data.roots.length;
  return (
    <span className="perimeter" title={data.workspace.path}>
      {copy.app.perimeterWorkspace(data.workspace.label, n)}
    </span>
  );
}
