// The Pulse: one real <button> per run, the success-rate headline, and never a silent truncation —
// what falls off the left edge is counted and said. Clicking a bar opens that run.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { COPY } from "../copy.ts";
import type { RunFacts } from "../lib.ts";
import { Pulse } from "./Pulse.tsx";

const NOW = "2026-06-25T12:00:00.000Z";
const hoursAgo = (h: number) => new Date(Date.parse(NOW) - h * 3_600_000).toISOString();

const RUNS: RunFacts[] = [
  { name: "run-1", process: "p", outcome: "goal_met", failureMode: null, model: "m", at: hoursAgo(2) },
  { name: "run-2", process: "p", outcome: "not_met", failureMode: "x", model: "m", at: hoursAgo(1) },
];

describe("Pulse", () => {
  it("renders one button per in-window run and the success-rate headline", async () => {
    render(<Pulse runs={RUNS} now={NOW} days={null} onOpen={() => {}} onShowAll={() => {}} />);
    const region = screen.getByRole("region", { name: COPY.pulse.aria });
    expect(within(region).getAllByRole("button")).toHaveLength(2);
    expect(screen.getByText("50 %")).toBeInTheDocument();
  });

  it("clicking a bar opens that run by name", async () => {
    const onOpen = vi.fn();
    render(<Pulse runs={RUNS} now={NOW} days={null} onOpen={onOpen} onShowAll={() => {}} />);
    const region = screen.getByRole("region", { name: COPY.pulse.aria });
    // Bars are ordered oldest → newest; the last one is the most recent (run-2).
    await userEvent.click(within(region).getAllByRole("button")[1]);
    expect(onOpen).toHaveBeenCalledWith("run-2");
  });

  it("when runs exist but none fall in the period, it offers «tout afficher»", async () => {
    const onShowAll = vi.fn();
    // A 1-day window with runs that are all 5 days old → nothing in window, but runs exist.
    const old: RunFacts[] = RUNS.map((r) => ({ ...r, at: hoursAgo(120) }));
    render(<Pulse runs={old} now={NOW} days={1} onOpen={() => {}} onShowAll={onShowAll} />);
    expect(screen.getByText(COPY.pulse.noneInPeriod)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: COPY.pulse.showAll }));
    expect(onShowAll).toHaveBeenCalledTimes(1);
  });

  it("renders nothing at all when there are no runs", () => {
    const { container } = render(<Pulse runs={[]} now={NOW} days={1} onOpen={() => {}} onShowAll={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
