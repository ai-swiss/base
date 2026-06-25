import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, type StudioContext } from "../api.ts";
import { Welcome } from "./Welcome.tsx";

vi.mock("../api", () => ({ api: { init: vi.fn() } }));

const CONTEXT: Extract<StudioContext, { mode: "welcome" }> = {
  mode: "welcome",
  label: "mes-notes",
  path: "/tmp/mes-notes",
  detection: { type: "loose", markdownCount: 3, hasSkillNames: true },
  plan: [
    { path: ".ai/agents/mes-notes/AGENT.md", content: "---\ntype: agent\n---\n# Mes Notes", reason: "Le point de départ." },
    { path: "base.config.json", content: "{}", reason: "La configuration du root." },
  ],
};

beforeEach(() => {
  vi.mocked(api.init).mockReset();
});

describe("Welcome", () => {
  it("shows the diagnostic and every file of the plan, content readable before creating", async () => {
    render(<Welcome context={CONTEXT} onInitialized={() => {}} />);
    expect(screen.getByText(/vous parlez déjà BASE/)).toBeInTheDocument();

    const plan = screen.getByRole("region", { name: "Fichiers à créer" });
    expect(plan).toHaveTextContent(".ai/agents/mes-notes/AGENT.md");
    expect(plan).toHaveTextContent("base.config.json");
    // The full content is in the DOM (a <details>): the user can read before consenting.
    expect(plan).toHaveTextContent("type: agent");
  });

  it("step 2 is the door to your AI tool, with the real folder path", () => {
    render(<Welcome context={CONTEXT} onInitialized={() => {}} />);
    expect(screen.getByRole("heading", { name: "Ouvrir dans votre outil IA" })).toBeInTheDocument();
    // The command carries the actual perimeter path, not a placeholder.
    expect(screen.getByText('cd "/tmp/mes-notes" && claude')).toBeInTheDocument();
  });

  it("creates via api.init then hands control back; a server error stays on screen", async () => {
    const onInitialized = vi.fn();
    vi.mocked(api.init).mockResolvedValue({ created: [".ai/agents/mes-notes/AGENT.md"], context: CONTEXT });
    render(<Welcome context={CONTEXT} onInitialized={onInitialized} />);

    await userEvent.click(screen.getByRole("button", { name: "Créer ces fichiers" }));
    await waitFor(() => expect(onInitialized).toHaveBeenCalled());
    expect(api.init).toHaveBeenCalledTimes(1);
  });

  it("a failed init shows the error and re-enables the button", async () => {
    vi.mocked(api.init).mockRejectedValue(new Error("disque plein"));
    render(<Welcome context={CONTEXT} onInitialized={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "Créer ces fichiers" }));
    expect(await screen.findByText(/disque plein/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Créer ces fichiers" })).toBeEnabled();
  });
});
