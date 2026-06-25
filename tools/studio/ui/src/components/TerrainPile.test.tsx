// The frictions pile: open work, up top, never mixed with the simulation metrics. A friction
// resolves through the ordinary gate (propose → diff → commit); its other actions only route.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, type Friction } from "../api.ts";
import { COPY } from "../copy.ts";
import { FrictionsPile } from "./TerrainPile.tsx";

vi.mock("../api", () => ({ api: { resolveFriction: vi.fn(), commitEdit: vi.fn() } }));

const FRICTION: Friction = {
  path: ".ai/feedback/f1.md",
  process: ".ai/agents/agent-1/skills/processes/nouveau-devis/SKILL.md",
  reported: "2026-06-18",
  via: "user",
  status: "open",
  summary: "manque la TVA",
  detail: "le devis n'inclut pas la TVA",
};

beforeEach(() => {
  window.location.hash = "";
});
afterEach(() => {
  window.location.hash = "";
});

describe("FrictionsPile", () => {
  it("renders nothing when there are no frictions", () => {
    const { container } = render(<FrictionsPile frictions={[]} onResolved={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one card per friction with its summary and detail", () => {
    render(<FrictionsPile frictions={[FRICTION]} onResolved={() => {}} />);
    expect(screen.getByRole("region", { name: COPY.terrain.aria })).toBeInTheDocument();
    expect(screen.getByText(COPY.terrain.quote("manque la TVA"))).toBeInTheDocument();
    expect(screen.getByText("le devis n'inclut pas la TVA")).toBeInTheDocument();
    expect(screen.getByText(COPY.terrain.summary(1))).toBeInTheDocument();
  });

  it("«Ouvrir le process» routes to the browser with the process open", async () => {
    render(<FrictionsPile frictions={[FRICTION]} root="r1" onResolved={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: COPY.terrain.openProcess }));
    expect(window.location.hash).toContain("#/b?");
    expect(window.location.hash).toContain("root=r1");
    expect(decodeURIComponent(window.location.hash)).toContain(`open=${FRICTION.process}`);
  });

  it("«Évaluer» routes to the eval page with the process id derived from the path", async () => {
    render(<FrictionsPile frictions={[FRICTION]} root="r1" onResolved={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: COPY.terrain.evaluate }));
    expect(window.location.hash).toContain("#/eval?");
    expect(window.location.hash).toContain("process=nouveau-devis");
  });

  it("«Marquer résolu» proposes a change and shows its diff; «Valider et écrire» commits and notifies", async () => {
    vi.mocked(api.resolveFriction).mockResolvedValue({ changeId: "c1", target: FRICTION.path, exists: true, diff: "- old\n+ new" });
    vi.mocked(api.commitEdit).mockResolvedValue(undefined as never);
    const onResolved = vi.fn();
    render(<FrictionsPile frictions={[FRICTION]} root="r1" onResolved={onResolved} />);

    await userEvent.click(screen.getByRole("button", { name: COPY.terrain.markResolved }));
    expect(await screen.findByRole("button", { name: COPY.terrain.commitWrite })).toBeInTheDocument();
    expect(api.resolveFriction).toHaveBeenCalledWith(FRICTION.path, "r1");

    await userEvent.click(screen.getByRole("button", { name: COPY.terrain.commitWrite }));
    expect(api.commitEdit).toHaveBeenCalledWith("c1", "r1");
    await vi.waitFor(() => expect(onResolved).toHaveBeenCalledTimes(1));
  });

  it("«Annuler» on the review drops the diff without committing", async () => {
    vi.mocked(api.resolveFriction).mockResolvedValue({ changeId: "c1", target: FRICTION.path, exists: true, diff: "- old\n+ new" });
    render(<FrictionsPile frictions={[FRICTION]} onResolved={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: COPY.terrain.markResolved }));
    const commit = await screen.findByRole("button", { name: COPY.terrain.commitWrite });
    const card = commit.closest("article")!;
    await userEvent.click(within(card).getByRole("button", { name: COPY.common.cancel }));
    expect(screen.queryByRole("button", { name: COPY.terrain.commitWrite })).not.toBeInTheDocument();
    expect(api.commitEdit).not.toHaveBeenCalled();
  });

  it("a failed resolve surfaces the error and never opens the review", async () => {
    vi.mocked(api.resolveFriction).mockRejectedValue(new Error("nope"));
    render(<FrictionsPile frictions={[FRICTION]} onResolved={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: COPY.terrain.markResolved }));
    expect(await screen.findByText("nope")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: COPY.terrain.commitWrite })).not.toBeInTheDocument();
  });
});
