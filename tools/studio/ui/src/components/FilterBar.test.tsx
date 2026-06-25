// Drive-style filtering: a search field that debounces into the selection, plus one chip per
// criterion that opens a popover of options-with-counts. The bar owns nothing — every choice flows
// out through onChange; chips that cannot change the selection do not render.
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COPY } from "../copy.ts";
import type { EvalSelection, RunFacts } from "../lib.ts";
import { FilterBar } from "./FilterBar.tsx";

const NOW = "2026-06-25T12:00:00.000Z";
const minutesAgo = (m: number) => new Date(Date.parse(NOW) - m * 60_000).toISOString();

// A mix of values so every chip can actually change the selection (>= 2 options each).
const RUNS: RunFacts[] = [
  { name: "r1", process: "nouveau-devis", outcome: "goal_met", failureMode: null, model: "ollama/a", at: minutesAgo(5) },
  { name: "r2", process: "configuration", outcome: "not_met", failureMode: "wrong_routing", model: "ollama/b", at: minutesAgo(10) },
  { name: "r3", process: "configuration", outcome: "partially_met", failureMode: "missing_step", model: "ollama/a", at: minutesAgo(15) },
];

const SELECTION: EvalSelection = { process: null, verdict: null, failure: null, model: null, days: 30, q: "" };
const labelFor = (_chip: string, value: string) => value;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
});

function mount(selection: Partial<EvalSelection> = {}) {
  const onChange = vi.fn();
  render(
    <FilterBar
      runs={RUNS}
      selection={{ ...SELECTION, ...selection }}
      now={NOW}
      matchedNames={null}
      labelFor={labelFor}
      onChange={onChange}
    />,
  );
  return { onChange };
}

describe("FilterBar", () => {
  it("opening a chip lists its options with counts and picking one patches the selection", async () => {
    const user = userEvent.setup();
    const { onChange } = mount();
    await user.click(screen.getByRole("button", { name: `${COPY.filter.process} ▾` }));
    const list = screen.getByRole("listbox", { name: COPY.filter.process });
    expect(within(list).getByRole("option", { name: /configuration/ })).toBeInTheDocument();
    await user.click(within(list).getByRole("option", { name: /nouveau-devis/ }));
    expect(onChange).toHaveBeenCalledWith({ process: "nouveau-devis" });
  });

  it("an active chip turns solid with a remove ✕ that clears it", async () => {
    const user = userEvent.setup();
    const { onChange } = mount({ verdict: "not_met" });
    expect(screen.getByText(COPY.filter.chipValue(COPY.filter.verdict, "not_met"))).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: COPY.filter.removeFilter(COPY.filter.verdict) }));
    expect(onChange).toHaveBeenCalledWith({ verdict: null });
  });

  it("the period chip patches days, mapping «Tout» to null", async () => {
    const user = userEvent.setup();
    const { onChange } = mount();
    await user.click(screen.getByRole("button", { name: `${COPY.filter.period} ▾` }));
    const list = screen.getByRole("listbox", { name: COPY.filter.period });
    await user.click(within(list).getByRole("option", { name: COPY.filter.all }));
    expect(onChange).toHaveBeenCalledWith({ days: null });
  });

  it("the search field debounces its value into the selection (q)", async () => {
    const { onChange } = mount();
    const input = screen.getByRole("searchbox", { name: COPY.filter.searchTranscripts });
    await userEvent.type(input, "TVA");
    expect(onChange).not.toHaveBeenCalled(); // not yet — still within the debounce window
    vi.advanceTimersByTime(300);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith({ q: "TVA" }));
  });

  it("the «/» shortcut focuses the search field from anywhere outside an input", () => {
    mount();
    const input = screen.getByRole("searchbox", { name: COPY.filter.searchTranscripts });
    expect(input).not.toHaveFocus();
    // Dispatched from an element (body) so the handler's `e.target.closest(...)` guard runs, as in the app.
    fireEvent.keyDown(document.body, { key: "/" });
    expect(input).toHaveFocus();
  });

  it("«Réinitialiser» appears only when something is active and resets every criterion", async () => {
    const user = userEvent.setup();
    const { onChange } = mount({ process: "configuration" });
    await user.click(screen.getByRole("button", { name: COPY.filter.reset }));
    expect(onChange).toHaveBeenCalledWith({ process: null, verdict: null, failure: null, model: null, q: "", days: 30 });
  });

  it("a chip popover closes on Escape", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole("button", { name: `${COPY.filter.process} ▾` }));
    expect(screen.getByRole("listbox", { name: COPY.filter.process })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox", { name: COPY.filter.process })).not.toBeInTheDocument());
  });
});
