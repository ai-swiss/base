// Spec coverage: FR-STUDIO-001
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentDiff } from "./DocumentDiff";

const noop = () => {};

// Two changed blocks separated by living context — the document must stay readable around them.
const TWO_BLOCKS = [
  "  # Titre",
  "- Ancienne règle.",
  "+ Nouvelle règle.",
  "  Un paragraphe qui ne change pas.",
  "- Vieux barème.",
  "+ Barème 2026.",
  "  Fin du document.",
].join("\n");

function renderDiff(overrides: Partial<Parameters<typeof DocumentDiff>[0]> = {}) {
  const props = {
    diff: TWO_BLOCKS,
    selected: [true, true],
    onSelect: noop as (i: number, on: boolean) => void,
    busy: false,
    onApply: noop,
    onRefuse: noop,
    ...overrides,
  };
  return render(<DocumentDiff {...props} />);
}

describe("DocumentDiff — the review is the document, in the editor's box", () => {
  // Changed lines carry an intra-line <mark>: match on the ins/del node's full text content.
  const changedLine = (text: string) =>
    screen.getByText((_, el) => (el?.tagName === "INS" || el?.tagName === "DEL") && el.textContent === text);

  it("renders the WHOLE document: unchanged lines are visible around the colored blocks", () => {
    renderDiff();
    expect(screen.getByText("# Titre")).toBeInTheDocument();
    expect(screen.getByText("Un paragraphe qui ne change pas.")).toBeInTheDocument();
    expect(screen.getByText("Fin du document.")).toBeInTheDocument();
    expect(changedLine("Nouvelle règle.")).toBeInTheDocument();
    expect(changedLine("Vieux barème.")).toBeInTheDocument();
  });

  it("folds ONLY unchanged runs longer than the threshold, expandable in place", async () => {
    const longRun = Array.from({ length: 50 }, (_, i) => `  ligne ${i}`);
    const diff = ["+ Début révisé.", ...longRun, "+ Fin révisée."].join("\n");
    renderDiff({ diff, selected: [true, true] });

    // 50-line run: 3 visible on each side, 44 folded.
    const fold = screen.getByText("⋯ 44 lignes identiques");
    expect(screen.getByText("ligne 0")).toBeInTheDocument();
    expect(screen.getByText("ligne 49")).toBeInTheDocument();
    expect(screen.queryByText("ligne 25")).not.toBeInTheDocument();
    await userEvent.click(fold);
    expect(screen.getByText("ligne 25")).toBeInTheDocument();
  });

  it("Garder / Annuler on a block drive the selection by index", async () => {
    const onSelect = vi.fn();
    renderDiff({ onSelect });
    await userEvent.click(screen.getAllByRole("button", { name: /^Annuler/ })[1]);
    expect(onSelect).toHaveBeenCalledWith(1, false);
    await userEvent.click(screen.getAllByRole("button", { name: /^Garder/ })[0]);
    expect(onSelect).toHaveBeenCalledWith(0, true);
  });

  it("n/p move the block cursor; ⌘Y/⌘N decide the CURRENT block", async () => {
    const onSelect = vi.fn();
    renderDiff({ onSelect });
    const frame = screen.getByRole("region", { name: "Revue des modifications" });
    frame.focus();
    await userEvent.keyboard("n");
    await userEvent.keyboard("{Meta>}n{/Meta}");
    expect(onSelect).toHaveBeenLastCalledWith(1, false);
    await userEvent.keyboard("p");
    await userEvent.keyboard("{Meta>}y{/Meta}");
    expect(onSelect).toHaveBeenLastCalledWith(0, true);
  });

  it("the decision bar says what it will do, and 0 kept block disables it", () => {
    const { rerender } = renderDiff({ selected: [true, false] });
    expect(screen.getByRole("button", { name: /Appliquer 1 bloc/ })).toBeEnabled();
    rerender(
      <DocumentDiff diff={TWO_BLOCKS} selected={[false, false]} onSelect={noop} busy={false} onApply={noop} onRefuse={noop} />,
    );
    expect(screen.getByRole("button", { name: /Appliquer 0 bloc/ })).toBeDisabled();
  });

  it("«aucun changement» shows a calm message, never an empty frame — nothing to apply", () => {
    renderDiff({ diff: "(aucun changement)", selected: [] });
    expect(screen.getByText("(aucun changement)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Appliquer/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Refuser/ })).toBeInTheDocument();
  });

  it("the too-big sentinel cannot itemize blocks but applying the whole change stays possible", () => {
    renderDiff({ diff: "(diff trop volumineux pour l'affichage : 900 → 1200 lignes)", selected: [] });
    expect(screen.getByText(/diff trop volumineux/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Appliquer/ })).toBeEnabled();
  });

  it("Refuser discards the review and never applies — refusing writes nothing", async () => {
    const onApply = vi.fn();
    const onRefuse = vi.fn();
    renderDiff({ onApply, onRefuse });
    await userEvent.click(screen.getByRole("button", { name: /^Refuser/ }));
    expect(onRefuse).toHaveBeenCalledTimes(1);
    expect(onApply).not.toHaveBeenCalled();
  });
});
