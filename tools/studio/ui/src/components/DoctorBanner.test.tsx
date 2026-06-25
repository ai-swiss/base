// The doctor banner: a counter, never a modal — silent when healthy, expandable to one fix hint per
// finding when there is something about to break.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, type DoctorFinding } from "../api.ts";
import { COPY } from "../copy.ts";
import { DoctorBanner } from "./DoctorBanner.tsx";

vi.mock("../api", () => ({ api: { doctor: vi.fn() } }));

const FINDINGS: DoctorFinding[] = [
  { severity: "error", type: "broken_ref", path: ".ai/x.md", message: "référence cassée", fix_hint: "corriger le lien" },
  { severity: "warn", type: "stale", path: ".ai/y.md", message: "obsolète", fix_hint: "rafraîchir" },
];

beforeEach(() => {
  vi.mocked(api.doctor).mockResolvedValue(FINDINGS);
});

describe("DoctorBanner", () => {
  it("is silent when the corpus is healthy (no findings)", async () => {
    vi.mocked(api.doctor).mockResolvedValue([]);
    const { container } = render(<DoctorBanner />);
    // Give the resource a tick to resolve; the banner must still render nothing.
    await Promise.resolve();
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the counter summary with the error count, collapsed by default", async () => {
    render(<DoctorBanner root="r1" />);
    const button = await screen.findByRole("button", { name: COPY.doctor.summary(2, 1) });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(api.doctor).toHaveBeenCalledWith("r1");
    // The findings list is hidden until the counter is clicked.
    expect(screen.queryByText("référence cassée")).not.toBeInTheDocument();
  });

  it("expands to one line per finding, with type, path, message and fix hint", async () => {
    render(<DoctorBanner />);
    const button = await screen.findByRole("button", { name: COPY.doctor.summary(2, 1) });
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("broken_ref")).toBeInTheDocument();
    expect(screen.getByText(/référence cassée/)).toBeInTheDocument();
    expect(screen.getByText(/corriger le lien/)).toBeInTheDocument();
    // Toggling again collapses it.
    await userEvent.click(button);
    expect(screen.queryByText("broken_ref")).not.toBeInTheDocument();
  });
});
