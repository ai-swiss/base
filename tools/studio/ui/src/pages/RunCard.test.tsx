// One evaluation run as an expandable card: the verdict word and badges without a click; the judge's
// verdict, the context pack and the full transcript in place on click; relaunch/openProcess route.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, type RunResult, type RunSummary } from "../api.ts";
import { COPY } from "../copy.ts";
import { RunCard } from "./RunCard.tsx";

vi.mock("../api", () => ({ api: { run: vi.fn() } }));

const SUMMARY: RunSummary = {
  name: "run-ko",
  scenarioId: "devis-incomplet",
  process: "configuration",
  agentId: "assistant-devis",
  outcome: "not_met",
  failureMode: "wrong_routing",
  severity: "major",
  stopReason: "judge",
  origin: "simulation",
  model: "ollama/llama3.1",
  at: new Date(Date.now() - 3_600_000).toISOString(),
  turns: 4,
  limitations: [{ tool: "fs.write", step: "1", processPath: "p" }],
};

const RESULT: RunResult = {
  scenarioId: "devis-incomplet",
  sutId: null,
  stopReason: "judge",
  process: "configuration",
  processPath: ".ai/agents/assistant-devis/skills/processes/configuration/SKILL.md",
  contextPack: { sections: [{ path: "a.md", note: "≈ approx" }], omitted: [], unresolved: [], withheld: [] },
  turns: [
    {
      index: 0,
      user: "Bonjour",
      assistant: "Voici",
      toolCalls: [{ name: "fs.read", args: { path: "x" }, result: "ok", denied: false }],
    },
    { index: 1, user: "Et la TVA ?", assistant: "", toolCalls: [{ name: "fs.write", args: {}, result: "accès interdit", denied: true }] },
  ],
  verdict: {
    outcome: "not_met",
    failureMode: "wrong_routing",
    severity: "major",
    confidence: 0.8,
    evidence: [{ turn: 1, quote: "manque la TVA", why: "absente" }],
    rationale: "Le devis n'inclut pas la TVA.",
    fixHint: "ajouter la TVA",
  },
};

beforeEach(() => {
  window.location.hash = "";
  vi.mocked(api.run).mockResolvedValue(RESULT);
});
afterEach(() => {
  window.location.hash = "";
});

function mount(open: boolean, overrides: Partial<Parameters<typeof RunCard>[0]> = {}) {
  const onToggle = vi.fn();
  const onRelaunch = vi.fn();
  render(
    <RunCard run={SUMMARY} root="r1" modelName="rapide" open={open} onToggle={onToggle} onRelaunch={onRelaunch} {...overrides} />,
  );
  return { onToggle, onRelaunch };
}

describe("RunCard — closed", () => {
  it("shows the verdict word, scenario, process and failure/limitation badges without a click", () => {
    mount(false);
    expect(screen.getByText("manqué")).toBeInTheDocument();
    expect(screen.getByText("devis-incomplet")).toBeInTheDocument();
    expect(screen.getByText("configuration")).toBeInTheDocument();
    expect(screen.getByText(COPY.runcard.limitation("fs.write"))).toBeInTheDocument();
    expect(screen.getByText(/rapide ·/)).toBeInTheDocument();
    // The detail is not fetched while closed.
    expect(api.run).not.toHaveBeenCalled();
  });

  it("the head button toggles open", async () => {
    const { onToggle } = mount(false);
    await userEvent.click(screen.getByRole("button", { name: COPY.runcard.runAria("devis-incomplet") }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe("RunCard — open", () => {
  it("fetches the run and renders the verdict, the context pack note and the transcript", async () => {
    mount(true);
    expect(await screen.findByText("Le devis n'inclut pas la TVA.")).toBeInTheDocument();
    expect(api.run).toHaveBeenCalledWith("run-ko", "r1");
    expect(screen.getByText(COPY.runcard.transcript)).toBeInTheDocument();
    expect(screen.getByText("Bonjour")).toBeInTheDocument();
    // An empty assistant turn shows the placeholder, and a denied tool call is badged.
    expect(screen.getByText(COPY.runcard.noText)).toBeInTheDocument();
    expect(screen.getByText(COPY.runcard.denied)).toBeInTheDocument();
    // The fix hint and the evidence line are surfaced.
    expect(screen.getByText(COPY.runcard.fix("ajouter la TVA"))).toBeInTheDocument();
    expect(screen.getByText(COPY.runcard.evidence(1, "manque la TVA", "absente"))).toBeInTheDocument();
  });

  it("«Ouvrir le process» routes to the browser with the process path", async () => {
    mount(true);
    await userEvent.click(await screen.findByRole("button", { name: COPY.runcard.openProcess }));
    expect(window.location.hash).toContain("#/b?");
    expect(decodeURIComponent(window.location.hash)).toContain(RESULT.processPath!);
  });

  it("relaunch buttons call onRelaunch with/without another model", async () => {
    const { onRelaunch } = mount(true);
    await userEvent.click(await screen.findByRole("button", { name: COPY.runcard.relaunch }));
    expect(onRelaunch).toHaveBeenLastCalledWith(false);
    await userEvent.click(screen.getByRole("button", { name: COPY.runcard.relaunchOther }));
    expect(onRelaunch).toHaveBeenLastCalledWith(true);
  });

  it("a run with no verdict shows the no-verdict hint", async () => {
    vi.mocked(api.run).mockResolvedValue({ ...RESULT, verdict: null as never });
    mount(true);
    expect(await screen.findByText(COPY.runcard.noVerdict)).toBeInTheDocument();
  });

  it("surfaces a load error", async () => {
    vi.mocked(api.run).mockRejectedValue(new Error("kaboom"));
    mount(true);
    expect(await screen.findByText(/kaboom/)).toBeInTheDocument();
  });
});
