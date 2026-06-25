// Spec coverage: FR-STUDIO-005
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api.ts";
import { WorkspaceManager } from "./WorkspaceManager.tsx";

vi.mock("../api", () => ({ api: { saveWorkspace: vi.fn() } }));

const ROOTS = [
  { id: "acme", label: "Acme", type: "project", default: true, path: "clients/acme" },
  { id: "globex", label: "Globex", type: "project", default: false, path: "clients/globex" },
];

beforeEach(() => {
  vi.mocked(api.saveWorkspace).mockResolvedValue({
    mode: "workspace",
    workspace: { id: "ws", label: "WS", path: "/ws/base.workspace.json" },
    roots: ROOTS,
  } as never);
});

describe("WorkspaceManager", () => {
  it("saves the edited roots through the gated endpoint", async () => {
    const onSaved = vi.fn();
    render(<WorkspaceManager workspace={{ id: "ws", label: "WS" }} roots={ROOTS} onClose={() => {}} onSaved={onSaved} />);
    const label = screen.getByLabelText("Nom du dossier 1");
    await userEvent.clear(label);
    await userEvent.type(label, "Acme SA");
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer l'espace" }));

    expect(api.saveWorkspace).toHaveBeenCalledTimes(1);
    const body = vi.mocked(api.saveWorkspace).mock.calls[0][0];
    expect(body.roots).toHaveLength(2);
    expect(body.roots[0].label).toBe("Acme SA");
    expect(onSaved).toHaveBeenCalled();
  });

  it("removing a folder drops it from the saved set", async () => {
    render(<WorkspaceManager workspace={{ id: "ws", label: "WS" }} roots={ROOTS} onClose={() => {}} onSaved={() => {}} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Retirer" })[1]);
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer l'espace" }));
    const body = vi.mocked(api.saveWorkspace).mock.calls.at(-1)![0];
    expect(body.roots).toHaveLength(1);
    expect(body.roots[0].id).toBe("acme");
  });
});
