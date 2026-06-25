import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api.ts";
import { freshEval, type RouteState } from "../lib.ts";
import { Monitor } from "./Monitor.tsx";

vi.mock("../api", () => ({
  api: {
    experiments: vi.fn(),
    run: vi.fn(),
    startEval: vi.fn(),
    list: vi.fn(),
    settings: vi.fn(),
    models: vi.fn(),
    feedback: vi.fn(),
  },
}));

const RUNS = [
  {
    name: "run-ok",
    scenarioId: "devis-simple",
    process: "nouveau-devis",
    agentId: "assistant-devis",
    outcome: "goal_met",
    failureMode: null,
    severity: null,
    stopReason: "satisfied",
    origin: "simulation",
    model: "openai-compatible:llama3.1",
    at: new Date(Date.now() - 3_600_000).toISOString(),
    turns: 4,
    limitations: [],
  },
  {
    name: "run-ko",
    scenarioId: "devis-incomplet",
    process: "configuration",
    agentId: "assistant-devis",
    outcome: "not_met",
    failureMode: "wrong_routing",
    severity: "major",
    stopReason: "judge",
    origin: "simulation",
    model: "openai-compatible:llama3.1",
    at: new Date(Date.now() - 7_200_000).toISOString(),
    turns: 6,
    limitations: [],
  },
];

beforeEach(() => {
  vi.mocked(api.experiments).mockResolvedValue({ latestReport: null, reports: [], runs: RUNS, matched: null, eval: { running: false } });
  vi.mocked(api.settings).mockResolvedValue({ providers: [], aliases: { "openai-compatible:llama3.1": "rapide" }, defaults: {}, discovered: {} });
  vi.mocked(api.feedback).mockResolvedValue({ frictions: [], abstentions: [] });
  vi.mocked(api.list).mockResolvedValue([]);
  vi.mocked(api.models).mockResolvedValue([]);
});

function mount(overrides: Partial<ReturnType<typeof freshEval>> = {}) {
  const onChange = vi.fn<(next: RouteState) => void>();
  render(<Monitor evalState={freshEval({ days: null, ...overrides })} onChange={onChange} onBack={() => {}} />);
  return { onChange };
}

describe("Monitor — one selection, three projections", () => {
  it("renders the Pulse (one button per run) and the run cards, model shown by ALIAS", async () => {
    mount();
    const pulse = await screen.findByRole("region", { name: "Pulse des évaluations" });
    expect(within(pulse).getAllByRole("button")).toHaveLength(2);
    expect(screen.getByText("50 %")).toBeInTheDocument();

    const cards = screen.getByRole("region", { name: "Simulations" });
    expect(within(cards).getByRole("button", { name: "Exécution devis-simple" })).toBeInTheDocument();
    // The display name (alias, keyed by the model ref) replaces the raw ref wherever a model is named.
    expect(within(cards).getAllByText(/rapide ·/).length).toBeGreaterThan(0);
  });

  it("a chip filters the selection through the hash (onChange), not local state", async () => {
    const { onChange } = mount();
    await screen.findByText("50 %");
    await userEvent.click(screen.getByRole("button", { name: "Verdict ▾" }));
    await userEvent.click(screen.getByRole("option", { name: /manqué/ }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ verdict: "not_met" }));
  });

  it("clicking a Pulse bar opens that run (open lands in the hash)", async () => {
    const { onChange } = mount();
    const pulse = await screen.findByRole("region", { name: "Pulse des évaluations" });
    await userEvent.click(within(pulse).getAllByRole("button")[1]); // most recent = run-ok
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ open: "run-ok" }));
  });

  it("«▶ Évaluer» opens the drawer (dialog with trapped focus surface)", async () => {
    mount();
    await screen.findByText("50 %");
    await userEvent.click(screen.getByRole("button", { name: "▶ Évaluer" }));
    expect(await screen.findByRole("dialog", { name: "Lancer une évaluation" })).toBeInTheDocument();
  });

  it("arriving via «Évaluer ▶» (process in the hash) opens the drawer pre-filled", async () => {
    vi.mocked(api.list).mockImplementation(async (p) =>
      p?.type === "process"
        ? [{ id: "configuration", title: "Configuration", type: "process", path: ".ai/agents/agent-1/skills/processes/configuration/SKILL.md" } as never]
        : [{ id: "agent-1", title: "Agent", type: "agent", path: ".ai/agents/agent-1/AGENT.md" } as never],
    );
    mount({ process: "configuration" });
    const dialog = await screen.findByRole("dialog", { name: "Lancer une évaluation" });
    // The preset process is pre-checked in its agent's branch of the tree.
    await waitFor(() => expect(within(dialog).getByLabelText("Configuration")).toBeChecked());
  });

  it("a running evaluation shows the progress pill and a skeleton card", async () => {
    vi.mocked(api.experiments).mockResolvedValue({
      latestReport: null,
      reports: [],
      runs: RUNS,
      matched: null,
      eval: { running: true, done: 1, total: 5 },
    });
    mount();
    expect(await screen.findByRole("status")).toHaveTextContent("scénario 2/5");
    expect(screen.getByLabelText("Scénario en cours")).toBeInTheDocument();
  });

  it("no runs at all → the explainer and a first-launch button", async () => {
    vi.mocked(api.experiments).mockResolvedValue({ latestReport: null, reports: [], runs: [], matched: null, eval: { running: false } });
    mount();
    expect(await screen.findByRole("button", { name: "Lancer votre première évaluation" })).toBeInTheDocument();
  });

  it("open frictions lead as the pile of work; abstentions are not surfaced here", async () => {
    vi.mocked(api.experiments).mockResolvedValue({ latestReport: null, reports: [], runs: [], matched: null, eval: { running: false } });
    vi.mocked(api.feedback).mockResolvedValue({
      frictions: [{ path: ".ai/feedback/f1.md", process: "nouveau-devis", reported: "2026-06-18", via: "user", status: "open", summary: "manque la TVA", detail: "" }],
      abstentions: [{ query: "ouvrir un dossier", verdict: "ambiguous", count: 3, lastAt: "2026-06-18" }],
    });
    mount();
    // Frictions are real, actionable anomalies — their own region, up top.
    expect(await screen.findByRole("region", { name: "Frictions à traiter" })).toBeInTheDocument();
    // Abstentions belong to the doctor (recurring_abstention), not the eval page: no panel, no query.
    expect(screen.queryByText(/ouvrir un dossier/)).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Demandes sans réponse" })).not.toBeInTheDocument();
  });
});
