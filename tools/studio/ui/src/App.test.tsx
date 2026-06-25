import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

vi.mock("./api", () => ({
  api: {
    context: vi.fn().mockResolvedValue({ mode: "root", label: "demo", path: "/tmp/demo" }),
    tree: vi.fn().mockResolvedValue({ name: "root", path: "", dirs: [], files: [] }),
    list: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue([]),
    experiments: vi.fn().mockResolvedValue({ latestReport: null, reports: [], runs: [], eval: { running: false } }),
    feedback: vi.fn().mockResolvedValue({ frictions: [], abstentions: [] }),
    doctor: vi.fn().mockResolvedValue([]),
    settings: vi.fn().mockResolvedValue({ providers: [], aliases: {}, defaults: {}, discovered: {} }),
    models: vi.fn().mockResolvedValue([]),
  },
}));

beforeEach(() => {
  window.location.hash = "";
});

describe("App", () => {
  it("starts on Parcourir and switches to Évaluations (ARIA tab state follows)", async () => {
    render(<App />);
    expect(screen.getByRole("tab", { name: "Parcourir" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Évaluations" })).toHaveAttribute("aria-selected", "false");

    await userEvent.click(screen.getByRole("tab", { name: "Évaluations" }));
    expect(await screen.findByText("▶ Évaluer")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Évaluations" })).toHaveAttribute("aria-selected", "true");
  });
});
