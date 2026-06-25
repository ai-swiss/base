// Spec coverage: FR-STUDIO-006
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, type ProviderSettings, type StudioSettings } from "../api";
import { COPY } from "../copy";
import { Settings } from "./Settings";

vi.mock("../api", () => ({
  api: { settings: vi.fn(), models: vi.fn(), saveSettings: vi.fn(), testProvider: vi.fn() },
}));

const EMPTY: StudioSettings = { providers: [], aliases: {}, defaults: {}, discovered: {} };
const OLLAMA: ProviderSettings = { id: "ollama", type: "ollama", locality: "local", keyDetected: null };
const withOllama = (extra: Partial<StudioSettings> = {}): StudioSettings => ({ ...EMPTY, providers: [OLLAMA], ...extra });

beforeEach(() => {
  vi.mocked(api.models).mockResolvedValue([]);
  vi.mocked(api.saveSettings).mockResolvedValue(EMPTY);
});

describe("Settings — first-model guide", () => {
  it("appears when no provider is configured, and offers the no-input key paths", async () => {
    vi.mocked(api.settings).mockResolvedValue({ ...EMPTY, suggestion: { type: "ollama", reachable: false } });
    render(<Settings />);
    const guide = await screen.findByRole("region", { name: "Connecter un premier modèle" });
    // The key path routes through an env var OR the AI tool — never a key typed into the screen.
    expect(screen.getByText(/configure la variable OPENAI_API_KEY/)).toBeInTheDocument();
    expect(guide.textContent).toMatch(/jamais à cet écran/);
  });

  it("is hidden once a provider exists", async () => {
    vi.mocked(api.settings).mockResolvedValue({
      ...EMPTY,
      providers: [{ id: "ollama", type: "ollama", locality: "local", keyDetected: null }],
    });
    render(<Settings />);
    await screen.findByText("ollama"); // provider card rendered
    expect(screen.queryByRole("region", { name: "Connecter un premier modèle" })).not.toBeInTheDocument();
  });

  it("when Ollama is reachable, one click connects it and sets the eval defaults", async () => {
    vi.mocked(api.settings).mockResolvedValue({ ...EMPTY, suggestion: { type: "ollama", reachable: true } });
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: "Connecter Ollama" }));
    await waitFor(() => expect(api.saveSettings).toHaveBeenCalled());
    const saved = vi.mocked(api.saveSettings).mock.calls[0][0];
    expect(saved.providers.some((p) => p.type === "ollama")).toBe(true);
    expect(saved.defaults.runner).toBe("ollama");
    expect(saved.defaults.judge).toBe("ollama");
  });
});

describe("Settings — provider actions (every action has a test)", () => {
  it("removing a provider saves the shorter list", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama());
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: COPY.common.remove }));
    await waitFor(() => expect(api.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ providers: [] })));
  });

  it("removing a provider that is the default scrubs the dangling default before saving (no error)", async () => {
    // The bug: keeping defaults.runner/judge pointing at a removed provider makes writeSettings throw
    // «defaults.runner names unknown provider». onRemove must drop the dangling defaults first.
    vi.mocked(api.settings).mockResolvedValue(withOllama({ defaults: { runner: "ollama", judge: "ollama" } }));
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: COPY.common.remove }));
    await waitFor(() => expect(api.saveSettings).toHaveBeenCalled());
    const saved = vi.mocked(api.saveSettings).mock.calls[0][0];
    expect(saved.providers).toEqual([]);
    expect(saved.defaults.runner).toBeUndefined();
    expect(saved.defaults.judge).toBeUndefined();
    expect(screen.queryByText(/unknown provider/)).not.toBeInTheDocument();
  });

  it("a failed connection test shows actionable French built from the error code", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama({
      providers: [{ id: "claude", type: "anthropic", apiKeyEnv: "ANTHROPIC_API_KEY", locality: "remote", keyDetected: false }],
    }));
    vi.mocked(api.testProvider).mockResolvedValue({ ok: false, latencyMs: 3, code: "llm.config", env: "ANTHROPIC_API_KEY", url: "https://api.anthropic.com" });
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: COPY.settings.provider.test }));
    // Asserts on the part unique to the llm.config test result (the summary key line says
    // «… côté serveur», the test result says «… dans le terminal qui lance …»).
    expect(await screen.findByText(/exportez ANTHROPIC_API_KEY dans le terminal/)).toBeInTheDocument();
  });

  it("«Actualiser» refreshes the model catalog", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama());
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: COPY.settings.provider.refresh }));
    await waitFor(() => expect(api.models).toHaveBeenCalledWith(true));
  });

  it("renaming a discovered model saves it as an alias keyed by ref; clearing it removes the key", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama({ discovered: { ollama: { models: ["llama3.1"], at: "" } } }));
    render(<Settings />);
    const input = await screen.findByLabelText(COPY.settings.provider.renameAria("llama3.1"));
    await userEvent.type(input, "rapide");
    await userEvent.tab();
    await waitFor(() => expect(api.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ aliases: { "ollama/llama3.1": "rapide" } })));
  });

  it("clearing an existing model name removes the alias entry", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama({
      aliases: { "ollama/llama3.1": "rapide" },
      discovered: { ollama: { models: ["llama3.1"], at: "" } },
    }));
    render(<Settings />);
    const input = await screen.findByLabelText(COPY.settings.provider.renameAria("llama3.1"));
    await userEvent.clear(input);
    await userEvent.tab();
    await waitFor(() => expect(api.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ aliases: {} })));
  });

  it("choosing a default runner from the picker saves it under defaults.runner", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama());
    vi.mocked(api.models).mockResolvedValue([
      { ref: "ollama/llama3.1", providerId: "ollama", model: "llama3.1", alias: null, locality: "local", online: true },
    ]);
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: new RegExp(COPY.settings.defaults.runner.label) }));
    await userEvent.click(await screen.findByRole("option", { name: /llama3\.1/ }));
    await waitFor(() =>
      expect(api.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ defaults: expect.objectContaining({ runner: "ollama/llama3.1" }) })),
    );
  });

  it("the default pickers list a provider's discovered models even when the catalog fetch is empty (regression: the pickers used to go stale and show «No models»)", async () => {
    // The reported bug: ollama is configured with models (visible in the cards above), yet the
    // «Default models» pickers showed «No models. Configure a provider.». They now read the same
    // derived list the cards do — so a discovered model is selectable without a remount or a refetch.
    vi.mocked(api.settings).mockResolvedValue(withOllama({ discovered: { ollama: { models: ["llama3.1"], at: "" } } }));
    vi.mocked(api.models).mockResolvedValue([]); // catalog empty on purpose: the picker must not depend on it
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: new RegExp(COPY.settings.defaults.judge.label) }));
    expect(await screen.findByRole("option", { name: /llama3\.1/ })).toBeInTheDocument();
    expect(screen.queryByText(COPY.picker.empty)).not.toBeInTheDocument();
  });

  it("a save failure surfaces «Erreur: …» and not «Enregistré.»", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama());
    vi.mocked(api.saveSettings).mockRejectedValueOnce(new Error("disque plein"));
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: COPY.common.remove }));
    expect(await screen.findByText(/Erreur: disque plein/)).toBeInTheDocument();
    expect(screen.queryByText(COPY.settings.saved)).not.toBeInTheDocument();
  });
});

describe("Settings — Routing / the embedding strategy", () => {
  // Distinct, non-overlapping model names so an option regex can never match the wrong picker entry.
  const TWO_MODELS = [
    { ref: "ollama/embed-demo", providerId: "ollama", model: "embed-demo", alias: null, locality: "local" as const, online: true },
    { ref: "ollama/refine-demo", providerId: "ollama", model: "refine-demo", alias: null, locality: "local" as const, online: true },
  ];

  it("renders the section, its both-or-neither hint, and the k explanation", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama());
    render(<Settings />);
    expect(await screen.findByRole("heading", { name: COPY.settings.routing.title })).toBeInTheDocument();
    expect(screen.getByText(COPY.settings.routing.both)).toBeInTheDocument();
    expect(screen.getByText(COPY.settings.routing.k.help)).toBeInTheDocument();
    expect(screen.getByText(COPY.settings.routing.embedding.help)).toBeInTheDocument();
    expect(screen.getByText(COPY.settings.routing.refiner.help)).toBeInTheDocument();
  });

  it("a lone embedding pick does NOT persist a routing block (the server would refuse it)", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama());
    vi.mocked(api.models).mockResolvedValue(TWO_MODELS);
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: new RegExp(COPY.settings.routing.embedding.label) }));
    await userEvent.click(await screen.findByRole("option", { name: /embed-demo/ }));
    await waitFor(() => expect(api.saveSettings).toHaveBeenCalled());
    const saved = vi.mocked(api.saveSettings).mock.calls.at(-1)?.[0] as StudioSettings;
    expect(saved.routing).toBeUndefined();
  });

  it("picking both models persists the full routing block with the default k", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama());
    vi.mocked(api.models).mockResolvedValue(TWO_MODELS);
    render(<Settings />);
    await userEvent.click(await screen.findByRole("button", { name: new RegExp(COPY.settings.routing.embedding.label) }));
    await userEvent.click(await screen.findByRole("option", { name: /embed-demo/ }));
    await userEvent.click(await screen.findByRole("button", { name: new RegExp(COPY.settings.routing.refiner.label) }));
    await userEvent.click(await screen.findByRole("option", { name: /refine-demo/ }));
    await waitFor(() =>
      expect(api.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({ routing: { embedding_model: "ollama/embed-demo", refiner_model: "ollama/refine-demo", k: 10 } }),
      ),
    );
  });

  it("when both models are already set, editing k and committing (blur) saves the new candidate count", async () => {
    vi.mocked(api.settings).mockResolvedValue(
      withOllama({ routing: { embedding_model: "ollama/embed-demo", refiner_model: "ollama/refine-demo", k: 5 } }),
    );
    render(<Settings />);
    // k = 5 (not the default 10) only shows AFTER the section hydrates from the loaded routing block,
    // so finding it guarantees the draft now carries both models — the commit guard will pass.
    const input = (await screen.findByDisplayValue("5")) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "20");
    await userEvent.tab(); // commit on blur (like the model-rename field)
    await waitFor(() =>
      expect(api.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({ routing: expect.objectContaining({ k: 20 }) }),
      ),
    );
  });

  it("hydrates k from an existing routing block", async () => {
    vi.mocked(api.settings).mockResolvedValue(
      withOllama({ routing: { embedding_model: "ollama/embed-demo", refiner_model: "ollama/refine-demo", k: 7 } }),
    );
    vi.mocked(api.models).mockResolvedValue(TWO_MODELS);
    render(<Settings />);
    expect((await screen.findByDisplayValue("7")) as HTMLInputElement).toHaveAttribute("id", "routing-k");
  });
});

describe("Settings — copy comes from the catalog (no inline drift)", () => {
  it("renders each section's title and description from COPY", async () => {
    vi.mocked(api.settings).mockResolvedValue(EMPTY);
    render(<Settings />);
    expect(await screen.findByRole("heading", { name: COPY.settings.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: COPY.settings.models.title })).toBeInTheDocument();
    expect(screen.getByText(COPY.settings.models.description)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: COPY.settings.defaults.title })).toBeInTheDocument();
    expect(screen.getByText(COPY.settings.defaults.runner.help)).toBeInTheDocument();
    expect(screen.getByText(COPY.settings.defaults.judge.help)).toBeInTheDocument();
  });

  it("the default-model pickers carry no ⌘K chip on the Réglages page", async () => {
    vi.mocked(api.settings).mockResolvedValue(withOllama());
    render(<Settings />);
    await screen.findByRole("heading", { name: COPY.settings.defaults.title });
    // ⌘K is opt-in; the two defaults pickers pass shortcut={false}, so no kbd chip is rendered.
    expect(document.querySelector(".modelpicker .kbd")).toBeNull();
    expect(document.querySelector(".modelpicker[data-shortcut]")).toBeNull();
  });
});
