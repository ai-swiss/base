import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DiffView } from "./DiffView.tsx";

const DIFF = [
  "  début",
  "- le taux est 7.7 %",
  "+ le taux est 8.1 %",
  "  c1",
  "  c2",
  "  c3",
  "  c4",
  "  c5",
  "  c6",
  "- fin ancienne",
  "+ fin nouvelle",
].join("\n");

describe("DiffView", () => {
  it("renders additions as <ins>, deletions as <del>, with intra-line emphasis", () => {
    render(<DiffView diff={DIFF} />);
    const ins = screen.getByText((_, el) => el?.tagName === "INS" && el.textContent === "le taux est 8.1 %");
    expect(ins).toBeInTheDocument();
    // The differing span only ("7.7"/"8.1") is emphasised, not the whole line.
    expect(ins.querySelector("mark")?.textContent).toBe("8.1");
  });

  it("folds long context runs behind an expander that reveals them", async () => {
    render(<DiffView diff={DIFF} />);
    const fold = screen.getByRole("button", { name: /lignes identiques/ });
    expect(screen.queryByText("c3")).not.toBeInTheDocument();
    await userEvent.click(fold);
    expect(screen.getByText("c3")).toBeInTheDocument();
  });

  it("a no-change diff says so — never a crash, never nothing", () => {
    render(<DiffView diff="(aucun changement)" />);
    expect(screen.getByText("(aucun changement)")).toBeInTheDocument();
  });
});
