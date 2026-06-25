// Spec coverage: FR-STUDIO-003
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api.ts";
import { EvalDrawer } from "./EvalDrawer.tsx";

vi.mock("../api", () => ({ api: { list: vi.fn(), settings: vi.fn(), models: vi.fn(), startEval: vi.fn() } }));

beforeEach(() => {
  vi.mocked(api.list).mockResolvedValue([]);
  vi.mocked(api.settings).mockResolvedValue({ providers: [], aliases: {}, defaults: {}, discovered: {} });
  vi.mocked(api.models).mockResolvedValue([]);
});

describe("EvalDrawer — dialog semantics", () => {
  it("the focus trap really cycles: Tab from the last lands on the first, Shift+Tab reverses", async () => {
    render(<EvalDrawer processPreset={null} onClose={() => {}} onStarted={() => {}} />);
    const dialog = await screen.findByRole("dialog", { name: "Lancer une évaluation" });
    // Same filter as the trap itself: a disabled control is not a tab stop.
    const focusables = [...dialog.querySelectorAll<HTMLElement>("a, button, input, select, textarea")].filter(
      (el) => !el.hasAttribute("disabled"),
    );
    const last = focusables[focusables.length - 1];

    last.focus();
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(focusables[0]);

    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it("Échap closes", async () => {
    const onClose = vi.fn();
    render(<EvalDrawer processPreset={null} onClose={onClose} onStarted={() => {}} />);
    await screen.findByRole("dialog", { name: "Lancer une évaluation" });
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("launches the checked processes as (agent, process) targets, tied to their real agent", async () => {
    // Two agents; ticking processes across both must launch each under ITS OWN agent.
    vi.mocked(api.list).mockImplementation(async (p) =>
      p?.type === "process"
        ? ([
            { id: "p1", title: "Un", type: "process", path: ".ai/agents/a1/skills/processes/p1/SKILL.md" },
            { id: "p2", title: "Deux", type: "process", path: ".ai/agents/a2/skills/processes/p2/SKILL.md" },
          ] as never)
        : ([
            { id: "a1", title: "Agent Un", type: "agent", path: ".ai/agents/a1/AGENT.md" },
            { id: "a2", title: "Agent Deux", type: "agent", path: ".ai/agents/a2/AGENT.md" },
          ] as never),
    );
    vi.mocked(api.settings).mockResolvedValue({ providers: [], aliases: {}, defaults: { runner: "prov/m" }, discovered: {} });
    vi.mocked(api.startEval).mockResolvedValue({ started: true });
    const onStarted = vi.fn();
    render(<EvalDrawer processPreset={null} onClose={() => {}} onStarted={onStarted} />);

    await screen.findByRole("dialog", { name: "Lancer une évaluation" });
    await userEvent.click(await screen.findByLabelText("Un"));
    await userEvent.click(await screen.findByLabelText("Deux"));
    await userEvent.click(await screen.findByRole("button", { name: "Lancer 2 évaluations" }));

    expect(api.startEval).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.startEval).mock.calls[0][0].targets).toEqual([
      { agentId: "a1", processId: "p1" },
      { agentId: "a2", processId: "p2" },
    ]);
    expect(onStarted).toHaveBeenCalled();
  });
});
