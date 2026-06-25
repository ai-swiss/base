// Réglages: providers + per-model display names + eval defaults — and NOTHING else. Keys never
// enter this page: a provider names the ENV VARIABLE holding its key, the server answers with a
// boolean. The punctual model choice happens at the point of use (chat / eval pickers), not here.
// All user-facing strings come from the copy catalog (copy.ts), never inline.

import { useEffect, useState } from "react";
import { api, type CatalogModel, type ProviderSettings, type StudioSettings } from "../api.ts";
import { ModelPicker } from "../components/ModelPicker.tsx";
import { Help } from "../components/Help.tsx";
import { useCopy } from "../copy.ts";
import { errorText } from "../lib.ts";

const EMPTY: StudioSettings = { providers: [], aliases: {}, defaults: {}, discovered: {} };
const TYPES: ProviderSettings["type"][] = ["openai-compatible", "ollama", "anthropic", "google"];
// The embedding strategy's candidate count default, mirroring the server's DEFAULT_ROUTING_K (settings.mjs): how
// many candidates the refiner sees, not a tuned threshold.
const DEFAULT_ROUTING_K = 10;

// A discovered model paired with its display name (the alias for `<providerId>/<model>`, if any).
interface ProviderModel {
  ref: string;
  model: string;
  alias: string | null;
}

export function Settings() {
  const copy = useCopy();
  const [settings, setSettings] = useState<StudioSettings>(EMPTY);
  const [catalog, setCatalog] = useState<CatalogModel[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = (refresh = false) => api.models(refresh).then(setCatalog).catch(() => setCatalog([]));

  useEffect(() => {
    api.settings().then(setSettings).catch((e) => setError(errorText(e)));
    void loadCatalog();
  }, []);

  const save = async (next: StudioSettings) => {
    setError(null);
    setStatus(null);
    try {
      const written = await api.saveSettings(next);
      setSettings({ ...next, ...written, providers: next.providers });
      setStatus(copy.settings.saved);
      await api.settings().then(setSettings).catch(() => {});
      await loadCatalog(true);
    } catch (e) {
      setError(errorText(e));
    }
  };

  // The one-click Ollama path: add a local provider and set it as both eval defaults, so the
  // very next screen (chat or eval) is usable without another detour.
  const connectOllama = () => {
    const next: StudioSettings = {
      ...settings,
      providers: [...settings.providers, { id: "ollama", type: "ollama" }],
      defaults: { runner: settings.defaults.runner ?? "ollama", judge: settings.defaults.judge ?? "ollama" },
    };
    void save(next);
  };

  // Removing a provider strips every reference that would otherwise dangle: eval defaults pointing
  // at it (the backend rejects those), its aliases, and its discovery cache. Without this scrub the
  // save fails with «defaults.runner names unknown provider».
  const removeProvider = (id: string) => {
    const providers = settings.providers.filter((p) => p.id !== id);
    const defaults = { ...settings.defaults };
    for (const role of ["runner", "judge"] as const) {
      if (defaults[role]?.split("/")[0] === id) delete defaults[role];
    }
    const aliases = Object.fromEntries(Object.entries(settings.aliases).filter(([ref]) => ref.split("/")[0] !== id));
    const discovered = { ...settings.discovered };
    delete discovered[id];
    void save({ ...settings, providers, defaults, aliases, discovered });
  };

  // Set or clear one model's display name (its alias). An empty name deletes the entry.
  const setAlias = (ref: string, name: string) => {
    const aliases = { ...settings.aliases };
    if (name) aliases[ref] = name;
    else delete aliases[ref];
    void save({ ...settings, aliases });
  };

  const modelsOf = (p: ProviderSettings): ProviderModel[] => {
    const discovered = settings.discovered[p.id]?.models ?? catalog.filter((m) => m.providerId === p.id).map((m) => m.model);
    return discovered.map((model) => {
      const ref = `${p.id}/${model}`;
      return { ref, model, alias: settings.aliases[ref] ?? null };
    });
  };

  // Exactly the models shown in the cards above (providers × discovered/catalog × aliases), as catalog
  // entries the pickers consume. Passed to every ModelPicker here so a provider configured on this page
  // shows up in the defaults/routing pickers at once, without a remount or a second fetch (the bug: the
  // pickers used to fetch once on mount and never saw a provider added during the session).
  const pickerModels: CatalogModel[] = settings.providers.flatMap((p) =>
    modelsOf(p).map((m) => {
      const cat = catalog.find((c) => c.ref === m.ref);
      return {
        ref: m.ref,
        providerId: p.id,
        model: m.model,
        alias: m.alias,
        locality: cat?.locality ?? p.locality ?? (p.type === "ollama" ? "local" : "remote"),
        online: cat?.online ?? true,
      };
    }),
  );

  const hasProviders = settings.providers.length > 0;

  return (
    <div className="settings">
      <header className="settings-intro">
        <h2 className="settings-title">{copy.settings.title}</h2>
        <p className="subtle">{copy.settings.description}</p>
      </header>
      {error && <p className="error">{copy.common.errorPrefix}{error}</p>}
      {status && <p className="ok">{status}</p>}

      <section className="settings-card" aria-labelledby="settings-models">
        <header className="settings-cardhead">
          <h3 className="settings-h" id="settings-models">{copy.settings.models.title}</h3>
          <p className="subtle">{copy.settings.models.description}</p>
        </header>
        {!hasProviders && <FirstModelGuide suggestion={settings.suggestion} onConnectOllama={connectOllama} />}
        {hasProviders && (
          <div className="provider-list">
            {settings.providers.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                models={modelsOf(p)}
                onRefresh={() => loadCatalog(true)}
                onRemove={() => removeProvider(p.id)}
                onAlias={setAlias}
              />
            ))}
          </div>
        )}
        <AddProvider onAdd={(p) => save({ ...settings, providers: [...settings.providers, p] })} />
      </section>

      <section className="settings-card" aria-labelledby="settings-defaults">
        <header className="settings-cardhead">
          <h3 className="settings-h" id="settings-defaults">{copy.settings.defaults.title}</h3>
          <p className="subtle">{copy.settings.defaults.description}</p>
        </header>
        <div className="defaults-grid">
          <div className="default-role">
            <ModelPicker
              label={copy.settings.defaults.runner.label}
              surfaceId="defaults-runner"
              shortcut={false}
              models={pickerModels}
              value={settings.defaults.runner ?? null}
              onChange={(ref) => save({ ...settings, defaults: { ...settings.defaults, runner: ref } })}
            />
            <p className="subtle">{copy.settings.defaults.runner.help}</p>
          </div>
          <div className="default-role">
            <ModelPicker
              label={copy.settings.defaults.judge.label}
              surfaceId="defaults-judge"
              shortcut={false}
              models={pickerModels}
              value={settings.defaults.judge ?? null}
              onChange={(ref) => save({ ...settings, defaults: { ...settings.defaults, judge: ref } })}
            />
            <p className="subtle">{copy.settings.defaults.judge.help}</p>
          </div>
        </div>
      </section>

      <RoutingSection settings={settings} onSave={save} models={pickerModels} />

      <SettingsFootnote file={settings.file} scope={settings.scope} />
    </div>
  );
}

// Routing / the embedding strategy — the two model refs + candidate count, exposed 1:1 with the file's `routing`
// block, exactly like the eval defaults above (a ModelPicker over the same provider registry). The
// BOTH-required rule is the server's (cleanRouting refuses one model alone), so the UI never sends a
// half-block: a lone model is held in local draft state, and `routing` is persisted only when both
// are set — otherwise it is cleared (the lexical strategy). `k` rides along only with both models. No validation
// is duplicated here; the server is the single source of truth.
function RoutingSection({ settings, onSave, models }: { settings: StudioSettings; onSave: (next: StudioSettings) => void; models: CatalogModel[] }) {
  const copy = useCopy();
  const [embedding, setEmbedding] = useState<string | null>(settings.routing?.embedding_model ?? null);
  const [refiner, setRefiner] = useState<string | null>(settings.routing?.refiner_model ?? null);
  // `k` is kept as the raw input string so an intermediate empty/partial value while typing is allowed;
  // only a valid positive integer is persisted (the parsed `k` below; the server is the final arbiter).
  const [kText, setKText] = useState<string>(String(settings.routing?.k ?? DEFAULT_ROUTING_K));
  const parsedK = Number.parseInt(kText, 10);
  const k = Number.isInteger(parsedK) && parsedK >= 1 ? parsedK : DEFAULT_ROUTING_K;

  // Re-seed the draft from the persisted block when it changes IDENTITY (a fresh load, or a save that
  // turns the embedding strategy on/off) — re-seeding in place (not via a remount) keeps the k input's DOM node, so
  // focus survives an async settings hydration. Keyed on the two models, not k, so editing k does not
  // re-seed mid-typing. A lone in-progress model (no persisted block) is left untouched.
  const persistedEmbedding = settings.routing?.embedding_model ?? null;
  const persistedRefiner = settings.routing?.refiner_model ?? null;
  const persistedK = settings.routing?.k;
  useEffect(() => {
    if (!persistedEmbedding && !persistedRefiner) return; // no block to hydrate from (the lexical strategy)
    setEmbedding(persistedEmbedding);
    setRefiner(persistedRefiner);
    setKText(String(persistedK ?? DEFAULT_ROUTING_K));
    // persistedK is intentionally NOT a dependency: only a models change re-seeds, so editing k (which
    // does change persistedK on save) never clobbers the field the user is typing into.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedEmbedding, persistedRefiner]);

  // Persist the draft: both models → the full block; otherwise no block (the lexical strategy). A lone model stays
  // in local state so the in-progress pick is visible, but is never sent (the server would refuse it).
  const persist = (next: { embedding: string | null; refiner: string | null; k: number }) => {
    const routing =
      next.embedding && next.refiner
        ? { embedding_model: next.embedding, refiner_model: next.refiner, k: next.k }
        : undefined;
    onSave({ ...settings, routing });
  };

  const onEmbedding = (ref: string) => { setEmbedding(ref); persist({ embedding: ref, refiner, k }); };
  const onRefiner = (ref: string) => { setRefiner(ref); persist({ embedding, refiner: ref, k }); };
  // `k` commits on blur or Enter (like the model-rename field), not per keystroke: one save round-trip
  // per edit, and no mid-typing re-render race. An invalid/blank value snaps back to the parsed default.
  const commitK = () => {
    const n = Number.parseInt(kText, 10);
    const next = Number.isInteger(n) && n >= 1 ? n : DEFAULT_ROUTING_K;
    if (String(next) !== kText) setKText(String(next));
    if (next !== (settings.routing?.k ?? DEFAULT_ROUTING_K) && embedding && refiner) persist({ embedding, refiner, k: next });
  };

  return (
    <section className="settings-card" aria-labelledby="settings-routing">
      <header className="settings-cardhead">
        <h3 className="settings-h" id="settings-routing">{copy.settings.routing.title}</h3>
        <p className="subtle">{copy.settings.routing.description}</p>
      </header>
      <p className="hint routing-both">{copy.settings.routing.both}</p>
      <div className="defaults-grid">
        <div className="default-role">
          <ModelPicker
            label={copy.settings.routing.embedding.label}
            surfaceId="routing-embedding"
            shortcut={false}
            models={models}
            value={embedding}
            onChange={onEmbedding}
          />
          <p className="subtle">{copy.settings.routing.embedding.help}</p>
        </div>
        <div className="default-role">
          <ModelPicker
            label={copy.settings.routing.refiner.label}
            surfaceId="routing-refiner"
            shortcut={false}
            models={models}
            value={refiner}
            onChange={onRefiner}
          />
          <p className="subtle">{copy.settings.routing.refiner.help}</p>
        </div>
        <div className="default-role">
          <label className="picker-label" htmlFor="routing-k">{copy.settings.routing.k.label}</label>
          <input
            id="routing-k"
            className="routing-k"
            type="number"
            min={1}
            step={1}
            value={kText}
            onChange={(e) => setKText(e.target.value)}
            onBlur={commitK}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          />
          <p className="subtle">{copy.settings.routing.k.help}</p>
        </div>
      </div>
      <p className="subtle">{copy.settings.routing.setup}</p>
    </section>
  );
}

// The settings file these values ARE, demoted to a quiet footnote disclosure: the page leads with
// what the screen is for, not with a path and a sentence about secrets.
function SettingsFootnote({ file, scope }: { file?: string; scope?: "root" | "workspace" }) {
  const copy = useCopy();
  return (
    <details className="settings-footnote">
      <summary>{copy.settings.location.summary}</summary>
      <p>
        {scope === "workspace" ? copy.settings.location.workspace : copy.settings.location.root}
        <code>{file ?? copy.settings.location.defaultFile}</code>
        {copy.settings.location.secretsNote}
      </p>
    </details>
  );
}

// Shown only when nothing is configured: three paths to a first model, softest first. It never
// asks for a key (a key lives in an env var, never in this screen) — for the key path it offers
// BOTH the terminal export AND the "ask your AI tool" route, so a non-developer is never stuck.
function FirstModelGuide({
  suggestion,
  onConnectOllama,
}: {
  suggestion?: { type: "ollama"; reachable: boolean };
  onConnectOllama: () => void;
}) {
  const copy = useCopy();
  const fm = copy.settings.firstModel;
  return (
    <section className="first-model" aria-label={fm.aria}>
      <h3>{fm.title}</h3>
      <p className="subtle">{fm.intro}</p>

      <article className="fm-path">
        <h4>{fm.ollamaTitle}</h4>
        {suggestion?.reachable ? (
          <>
            <p>{fm.ollamaReady}</p>
            <button className="primary" onClick={onConnectOllama}>{fm.ollamaConnect}</button>
          </>
        ) : (
          <p>
            {fm.ollamaInstallPre}<a href="https://ollama.com" target="_blank" rel="noreferrer">Ollama</a>{fm.ollamaInstallMid}<code>llama3.1</code>{fm.ollamaInstallSize}
            <strong>{fm.ollamaReload}</strong>{fm.ollamaReloadPost}
          </p>
        )}
      </article>

      <article className="fm-path">
        <h4>{fm.keyTitle}</h4>
        <p>
          {fm.keyIntroPre}<strong>{fm.keyIntroStrong}</strong>{fm.keyIntroPost}
        </p>
        <ul>
          <li>
            {fm.keyTerminalPre}<code>base studio</code>:
            <code className="fm-export">export OPENAI_API_KEY=sk-…</code>{fm.keyTerminalPost}
          </li>
          <li>
            {fm.keyAskPre}<em>{fm.keyAskEm}</em>{fm.keyAskPost}
          </li>
        </ul>
        <p className="subtle">{fm.keyAfter}</p>
      </article>

      <article className="fm-path">
        <h4>{fm.compatTitle}</h4>
        <p className="subtle">{fm.compatBody}</p>
      </article>
    </section>
  );
}

function ProviderCard({
  provider,
  models,
  onRefresh,
  onRemove,
  onAlias,
}: {
  provider: ProviderSettings;
  models: ProviderModel[];
  onRefresh: () => void;
  onRemove: () => void;
  onAlias: (ref: string, name: string) => void;
}) {
  const copy = useCopy();
  const [test, setTest] = useState<string | null>(null);
  const runTest = async () => {
    setTest(copy.settings.provider.testing);
    try {
      const r = await api.testProvider(provider.id);
      setTest(r.ok ? copy.settings.provider.testOk(r.latencyMs, r.url) : copy.settings.provider.testFail(r));
    } catch (e) {
      setTest(copy.settings.provider.testFail({ error: errorText(e) }));
    }
  };

  const keyLine =
    provider.keyDetected === null
      ? copy.settings.provider.key.none
      : provider.keyDetected
        ? copy.settings.provider.key.detected(provider.apiKeyEnv ?? "")
        : copy.settings.provider.key.missing(provider.apiKeyEnv);

  // The renamed models, shown as chips in the collapsed row (capped) so a nickname is visible
  // without opening the card.
  const named = models.filter((m) => m.alias).map((m) => m.alias as string);
  const chips = named.slice(0, 2);
  const more = named.length - chips.length;

  // Quiet by default: a one-line row with the essentials; type, URL, the discovered models (each
  // renamable) and the actions open on demand, so the page reads as a calm list.
  return (
    <details className="provider-card">
      <summary className="provider-summary">
        <span className={`locality-dot ${provider.locality === "local" ? "is-local" : "is-remote"}`} aria-hidden />
        <strong>{provider.id}</strong>
        {named.length > 0 && (
          <span className="provider-aliases">
            {chips.map((n) => <span key={n} className="alias-chip">{n}</span>)}
            {more > 0 && <span className="alias-chip more">{copy.settings.provider.more(more)}</span>}
          </span>
        )}
        <span className={provider.keyDetected === false ? "provider-key warn-text" : "provider-key subtle"}>{keyLine}</span>
      </summary>
      <div className="provider-detail">
        <p className="subtle">
          {copy.settings.providerType[provider.type]} · {provider.baseUrl ?? copy.settings.provider.defaultUrl} ·{" "}
          {provider.locality === "local" ? copy.common.local : copy.common.remote}
        </p>
        {models.length > 0 ? (
          <ul className="model-list">
            {models.map((m) => (
              <ModelRow key={m.ref} modelRef={m.ref} model={m.model} alias={m.alias} onAlias={onAlias} />
            ))}
          </ul>
        ) : (
          <p className="subtle">{copy.settings.provider.discovered}: {copy.settings.provider.noModels}</p>
        )}
        <div className="actions">
          <button className="ghost small" onClick={onRefresh}>{copy.settings.provider.refresh}</button>
          <button className="ghost small" onClick={runTest}>{copy.settings.provider.test}</button>
          <button className="ghost small" onClick={onRemove}>{copy.common.remove}</button>
          {test && <span className="subtle">{test}</span>}
        </div>
      </div>
    </details>
  );
}

// One discovered model: its technical name plus an inline display-name field. The name commits on
// blur (or Enter) so a save is one round-trip per rename, not one per keystroke.
function ModelRow({
  modelRef,
  model,
  alias,
  onAlias,
}: {
  modelRef: string;
  model: string;
  alias: string | null;
  onAlias: (ref: string, name: string) => void;
}) {
  const copy = useCopy();
  const [name, setName] = useState(alias ?? "");
  const commit = () => {
    const trimmed = name.trim();
    if (trimmed !== (alias ?? "")) onAlias(modelRef, trimmed);
  };
  return (
    <li className="model-row">
      <code className="model-ref">{model}</code>
      <input
        className="model-alias"
        placeholder={copy.settings.provider.renamePlaceholder}
        aria-label={copy.settings.provider.renameAria(model)}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      />
    </li>
  );
}

// Progressive disclosure: the four-field form is closed by default (a quiet «+ Ajouter» row),
// so the page reads as a calm list until you actually want to add a fournisseur. Each field carries
// a «?» with one line of guidance, sourced from the copy catalog.
function AddProvider({ onAdd }: { onAdd: (p: ProviderSettings) => void }) {
  const copy = useCopy();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProviderSettings>({ id: "", type: "openai-compatible", baseUrl: "", apiKeyEnv: "" });
  const ready = Boolean(draft.id.trim());

  if (!open) {
    return (
      <button className="add-trigger" onClick={() => setOpen(true)}>
        {copy.settings.addProvider.trigger}
      </button>
    );
  }
  return (
    <div className="add-form" role="group" aria-label={copy.settings.addProvider.ariaLabel}>
      <div className="add-field">
        <span className="add-field-head">
          <label htmlFor="ap-id">{copy.settings.addProvider.id.label}</label>
          <Help text={copy.settings.addProvider.id.help} />
        </span>
        <input id="ap-id" placeholder={copy.settings.addProvider.id.placeholder} value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} autoFocus />
      </div>
      <div className="add-field">
        <span className="add-field-head">
          <label htmlFor="ap-type">{copy.settings.addProvider.type.label}</label>
          <Help text={copy.settings.addProvider.type.help} />
        </span>
        <select id="ap-type" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as ProviderSettings["type"] })}>
          {TYPES.map((t) => <option key={t} value={t}>{copy.settings.providerType[t]}</option>)}
        </select>
      </div>
      <div className="add-field">
        <span className="add-field-head">
          <label htmlFor="ap-url">{copy.settings.addProvider.baseUrl.label} <span className="subtle">{copy.settings.addProvider.baseUrl.optional}</span></label>
          <Help text={copy.settings.addProvider.baseUrl.help} />
        </span>
        <input id="ap-url" placeholder={copy.settings.addProvider.baseUrl.placeholder} value={draft.baseUrl} onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })} />
      </div>
      <div className="add-field">
        <span className="add-field-head">
          <label htmlFor="ap-env">{copy.settings.addProvider.apiKeyEnv.label} <span className="subtle">{copy.settings.addProvider.apiKeyEnv.optional}</span></label>
          <Help text={copy.settings.addProvider.apiKeyEnv.help} />
        </span>
        <input id="ap-env" placeholder={copy.settings.addProvider.apiKeyEnv.placeholder} value={draft.apiKeyEnv} onChange={(e) => setDraft({ ...draft, apiKeyEnv: e.target.value })} />
      </div>
      <div className="add-actions">
        <button
          className="primary"
          disabled={!ready}
          title={ready ? undefined : copy.settings.addProvider.needId}
          onClick={() => {
            const p: ProviderSettings = { id: draft.id.trim(), type: draft.type };
            if (draft.baseUrl?.trim()) p.baseUrl = draft.baseUrl.trim();
            if (draft.apiKeyEnv?.trim()) p.apiKeyEnv = draft.apiKeyEnv.trim();
            onAdd(p);
            setDraft({ id: "", type: "openai-compatible", baseUrl: "", apiKeyEnv: "" });
            setOpen(false);
          }}
        >
          {copy.common.add}
        </button>
        <button className="ghost" onClick={() => setOpen(false)}>{copy.common.cancel}</button>
      </div>
    </div>
  );
}
