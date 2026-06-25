import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type Card } from "../api";
import { ResourceCard } from "./ResourceCard";
import { api } from "../api";

vi.mock("../api", () => ({
  api: {
    resource: vi.fn(),
    proposeEdit: vi.fn(),
    proposeContent: vi.fn(),
    commitEdit: vi.fn(),
    models: vi.fn(),
    chat: vi.fn(),
  },
}));

const card: Card = {
  id: "p", type: "process", title: "Nouveau devis", description: "Crée un devis", path: ".ai/p.md",
  scope: "team", status: "active", sensitivity: "internal", useWhen: "créer un devis", keywords: [],
  hasErrors: false, nonDefault: [], rootId: null,
};

const doc = {
  id: "p", type: "process", path: ".ai/p.md",
  data: { schema_version: "base.resource.v1", id: "p", type: "process", description: "Crée un devis" },
  body: "# Devis\n\nEtapes.\n", errors: [],
};

// The broker's house diff: full file, context included — the review must show the document.
const DIFF = ["  # Devis", "  ", "  Etapes.", "+ Vérifier la TVA."].join("\n");

beforeEach(() => {
  vi.mocked(api.resource).mockResolvedValue(structuredClone(doc));
  vi.mocked(api.proposeEdit).mockResolvedValue({ changeId: "chg_1", target: ".ai/p.md", exists: true, diff: DIFF });
  vi.mocked(api.commitEdit).mockResolvedValue({ written: true, target: ".ai/p.md" });
  vi.mocked(api.models).mockResolvedValue([
    { ref: "ollama:m", providerId: "ollama", model: "m", alias: null, locality: "local", online: true },
  ]);
});

describe("ResourceCard (expanded, the gate in the card)", () => {
  it("closed → click → expanded with the document; no dirty bar until something changes", async () => {
    const onOpen = vi.fn();
    const { rerender } = render(<ResourceCard card={card} open={false} onOpen={onOpen} onClose={() => {}} />);
    await userEvent.click(screen.getByText("Nouveau devis"));
    expect(onOpen).toHaveBeenCalled();

    rerender(<ResourceCard card={card} open={true} onOpen={onOpen} onClose={() => {}} />);
    const body = await screen.findByLabelText("Contenu du document");
    await waitFor(() => expect(body).toHaveValue(doc.body));
    expect(screen.queryByText(/Modifications non écrites/)).not.toBeInTheDocument();
  });

  it("Proposer opens the review IN the document frame: context visible, then Appliquer commits", async () => {
    render(<ResourceCard card={card} open={true} onOpen={() => {}} onClose={() => {}} />);
    const body = await screen.findByLabelText("Contenu du document");
    await waitFor(() => expect(body).toHaveValue(doc.body));

    await userEvent.type(body, "Vérifier la TVA.");
    expect(screen.getByText(/Modifications non écrites/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Proposer les changements/ }));
    // The review is the document: the added line AND the untouched context around it.
    const review = await screen.findByRole("region", { name: "Revue des modifications" });
    expect(screen.getByText("Vérifier la TVA.")).toBeInTheDocument();
    expect(screen.getByText("# Devis")).toBeInTheDocument();
    expect(screen.getByText(/Rien n'est écrit/)).toBeInTheDocument();
    expect(review).toBeInTheDocument();
    expect(api.proposeEdit).toHaveBeenCalledWith(expect.objectContaining({ path: ".ai/p.md" }));

    await userEvent.click(screen.getByRole("button", { name: /Appliquer/ }));
    await waitFor(() => expect(api.commitEdit).toHaveBeenCalledWith("chg_1", undefined));
    expect(await screen.findByText("Modification appliquée.")).toBeInTheDocument();
  });

  it("a partial selection (Annuler on a block) rebuilds and re-enters the gate", async () => {
    const twoBlocks = ["  # Devis", "- Ancien.", "+ Nouveau.", "  Milieu.", "- Vieux.", "+ Neuf."].join("\n");
    vi.mocked(api.proposeEdit).mockResolvedValue({ changeId: "chg_1", target: ".ai/p.md", exists: true, diff: twoBlocks });
    vi.mocked(api.proposeContent).mockResolvedValue({ changeId: "chg_2", target: ".ai/p.md", exists: true, diff: "" });

    render(<ResourceCard card={card} open={true} onOpen={() => {}} onClose={() => {}} />);
    const body = await screen.findByLabelText("Contenu du document");
    await waitFor(() => expect(body).toHaveValue(doc.body));
    await userEvent.type(body, "X");
    await userEvent.click(screen.getByRole("button", { name: /Proposer les changements/ }));

    await screen.findByRole("region", { name: "Revue des modifications" });
    await userEvent.click(screen.getAllByRole("button", { name: /^Annuler/ })[1]);
    await userEvent.click(screen.getByRole("button", { name: /Appliquer 1 bloc/ }));

    // Only the kept block enters: the rebuilt document keeps the OLD second line.
    await waitFor(() =>
      expect(api.proposeContent).toHaveBeenCalledWith(
        expect.objectContaining({ content: "# Devis\nNouveau.\nMilieu.\nVieux.\n" }),
      ),
    );
    await waitFor(() => expect(api.commitEdit).toHaveBeenCalledWith("chg_2", undefined));
  });

  it("Refuser dismisses the review and writes NOTHING (the 'not accepting' path is alive and safe)", async () => {
    render(<ResourceCard card={card} open={true} onOpen={() => {}} onClose={() => {}} />);
    const body = await screen.findByLabelText("Contenu du document");
    await waitFor(() => expect(body).toHaveValue(doc.body));

    await userEvent.type(body, "Vérifier la TVA.");
    await userEvent.click(screen.getByRole("button", { name: /Proposer les changements/ }));
    await screen.findByRole("region", { name: "Revue des modifications" });

    await userEvent.click(screen.getAllByRole("button", { name: /^Refuser/ })[0]);
    // Review gone, editor back with its (still dirty) content kept, and the broker was never asked to write.
    await waitFor(() => expect(screen.queryByRole("region", { name: "Revue des modifications" })).not.toBeInTheDocument());
    expect(api.commitEdit).not.toHaveBeenCalled();
    expect(await screen.findByLabelText("Contenu du document")).toBeInTheDocument();
  });

  it("a chat proposal lands in the SAME in-document review; the chat only announces", async () => {
    window.localStorage.setItem("studio.model.chat", "ollama:m");
    vi.mocked(api.chat).mockResolvedValue({
      reply: "Voici la modification proposée — relisez le diff.",
      proposal: { changeId: "chg_9", target: ".ai/p.md", exists: true, diff: DIFF },
      memory: null,
      egress: null,
    });
    render(
      <ResourceCard
        card={card}
        open={true}
        onOpen={() => {}}
        onClose={() => {}}
        actions={{ chatOpen: true, onToggleChat: () => {} }}
      />,
    );
    const input = await screen.findByLabelText("Demander une modification");
    await waitFor(() => expect(input).toBeEnabled());
    await userEvent.type(input, "ajoute la TVA{Enter}");

    // The review opens in the document frame…
    const review = await screen.findByRole("region", { name: "Revue des modifications" });
    expect(review).toBeInTheDocument();
    // …and the chat column carries the ANNOUNCEMENT, never the diff lines.
    const announce = screen.getByText(/± Proposition · 1 bloc/);
    expect(announce.closest(".chatpanel")).not.toBeNull();
    expect(announce.closest(".chatpanel")!.querySelector(".diff-line")).toBeNull();

    // «voir dans le document ↩» focuses the review.
    await userEvent.click(screen.getByRole("button", { name: "voir dans le document ↩" }));
    expect(document.activeElement).toBe(review);

    // The decision is the card's: Appliquer commits the chat's changeId.
    await userEvent.click(screen.getByRole("button", { name: /Appliquer/ }));
    await waitFor(() => expect(api.commitEdit).toHaveBeenCalledWith("chg_9", undefined));
    window.localStorage.removeItem("studio.model.chat");
  });

  it("the screen teaches its shortcuts: a <kbd> chip sits on every shortcut-bearing action", async () => {
    render(
      <ResourceCard card={card} open={true} onOpen={() => {}} onClose={() => {}} actions={{ chatOpen: false, onToggleChat: () => {} }} />,
    );
    const body = await screen.findByLabelText("Contenu du document");
    await waitFor(() => expect(body).toHaveValue(doc.body));
    expect(screen.getByRole("button", { name: /Éditer avec l'IA/ }).querySelector("kbd")).not.toBeNull();

    await userEvent.type(body, "X");
    expect(screen.getByRole("button", { name: /Proposer les changements/ }).querySelector("kbd")).not.toBeNull();

    await userEvent.click(screen.getByRole("button", { name: /Proposer les changements/ }));
    await screen.findByRole("region", { name: "Revue des modifications" });
    for (const name of [/^Appliquer/, /^Refuser/, /^Garder/]) {
      expect(screen.getAllByRole("button", { name })[0].querySelector("kbd")).not.toBeNull();
    }
  });

  it("Annuler restores the document; Échap with dirty content asks before folding", async () => {
    const onClose = vi.fn();
    render(<ResourceCard card={card} open={true} onOpen={() => {}} onClose={onClose} />);
    const body = await screen.findByLabelText("Contenu du document");
    await waitFor(() => expect(body).toHaveValue(doc.body));

    await userEvent.type(body, "X");
    await userEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(body).toHaveValue(doc.body);

    // Clean card: Échap folds without asking.
    body.focus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    // Dirty card: the guard asks; refusing keeps it open.
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    await userEvent.type(body, "Y");
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("Entrée on the focused card frame folds it — the toggle mirror of Entrée-to-open", async () => {
    const onClose = vi.fn();
    render(<ResourceCard card={card} open={true} onOpen={() => {}} onClose={onClose} />);
    const body = await screen.findByLabelText("Contenu du document");
    await waitFor(() => expect(body).toHaveValue(doc.body));

    // The card frame (not a field, not an inner control) holds focus → Entrée folds.
    const frame = body.closest(".card-open") as HTMLElement;
    frame.focus();
    await userEvent.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("a workspace card carries its rootId into every read and write", async () => {
    render(<ResourceCard card={{ ...card, rootId: "martin" }} open={true} onOpen={() => {}} onClose={() => {}} />);
    const body = await screen.findByLabelText("Contenu du document");
    await waitFor(() => expect(body).toHaveValue(doc.body));
    expect(api.resource).toHaveBeenCalledWith(".ai/p.md", "martin");

    await userEvent.type(body, "Z");
    await userEvent.click(screen.getByRole("button", { name: /Proposer les changements/ }));
    await waitFor(() => expect(api.proposeEdit).toHaveBeenCalledWith(expect.objectContaining({ root: "martin" })));
    await userEvent.click(await screen.findByRole("button", { name: /Appliquer/ }));
    await waitFor(() => expect(api.commitEdit).toHaveBeenCalledWith("chg_1", "martin"));
  });
});
