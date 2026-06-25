import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { type Card, type TreeNode } from "../api";
import { DEFAULT_BROWSE, type BrowseState } from "../lib";
import { Browse } from "./Browse";
import { api } from "../api";

vi.mock("../api", () => ({ api: { context: vi.fn(), tree: vi.fn(), list: vi.fn(), search: vi.fn(), resource: vi.fn(), doctor: vi.fn() } }));

// Browse is controlled by the hash state; the harness plays the App's role.
function Harness({ initial = DEFAULT_BROWSE }: { initial?: BrowseState }) {
  const [state, setState] = useState<BrowseState>(initial);
  return <Browse state={state} onChange={(next) => next.view === "browse" && setState(next)} />;
}

const card = (over: Partial<Card> = {}): Card => ({
  id: "p", type: "process", title: "Nouveau devis", description: "Crée un devis", path: ".ai/p.md",
  scope: "team", status: "active", sensitivity: "internal", useWhen: null, keywords: [], hasErrors: false, nonDefault: [], ...over,
});

const tree: TreeNode = {
  name: "demo",
  path: "",
  dirs: [
    {
      name: ".ai",
      path: ".ai",
      dirs: [
        {
          name: "agents",
          path: ".ai/agents",
          dirs: [],
          files: [
            { name: "AGENT.md", path: ".ai/agents/AGENT.md", resource: { type: "agent", id: "a", hasErrors: false } },
            { name: "SKILL.md", path: ".ai/agents/SKILL.md", resource: { type: "process", id: "p", hasErrors: false } },
          ],
        },
      ],
      files: [],
    },
    {
      name: "clients",
      path: "clients",
      dirs: [],
      files: [{ name: "notes.txt", path: "clients/notes.txt", resource: null }],
    },
  ],
  files: [{ name: "README.md", path: "README.md", resource: { type: "document", id: "readme", hasErrors: false } }],
};

beforeEach(() => {
  vi.mocked(api.context).mockResolvedValue({ mode: "root", label: "assistant-devis", path: "/tmp/devis" });
  vi.mocked(api.doctor).mockResolvedValue([]);
  vi.mocked(api.tree).mockResolvedValue(tree);
  vi.mocked(api.list).mockResolvedValue([card(), card({ id: "a", type: "agent", title: "Assistant", path: ".ai/a.md" })]);
  vi.mocked(api.search).mockResolvedValue([card({ title: "Résultat recherché" })]);
});

describe("Browse", () => {
  it("renders the file tree, the filter panel and the cards", async () => {
    render(<Harness />);
    expect(await screen.findByText("Nouveau devis")).toBeInTheDocument();
    expect(screen.getByRole("tree")).toBeInTheDocument();
    // Children appear once the initial expansion commits — await them.
    expect(await screen.findByText("clients")).toBeInTheDocument();
    expect(screen.getByLabelText(/Toutes les ressources/)).toBeInTheDocument();
    // No filter: the non-resource file is visible, dimmed — the class IS the visual contract (truth-table row 1).
    expect((await screen.findByText("notes.txt")).closest(".tree-row")).toHaveClass("nonresource");
  });

  it("checking one type prunes the tree and the master becomes indeterminate", async () => {
    render(<Harness />);
    await screen.findByText("clients");
    const tree = () => within(screen.getByRole("tree"));

    await userEvent.click(screen.getByLabelText(/^process/));
    // clients/ has no process descendant → pruned; .ai stays (SKILL.md is a process).
    await waitFor(() => expect(tree().queryByText("clients")).not.toBeInTheDocument());
    expect(tree().getByText(".ai")).toBeInTheDocument();
    const master = screen.getByLabelText(/Toutes les ressources/) as HTMLInputElement;
    expect(master.indeterminate).toBe(true);
    // The card request carries the type mask.
    await waitFor(() => expect(api.list).toHaveBeenCalledWith(expect.objectContaining({ types: ["process"] })));
  });

  it("checking the master checks every type; unchecking it returns to no-filter", async () => {
    render(<Harness />);
    await screen.findByText("clients");

    const master = screen.getByLabelText(/Toutes les ressources/) as HTMLInputElement;
    await userEvent.click(master);
    // All types checked → non-resources disappear from the tree (truth-table row 2).
    await waitFor(() => expect(screen.queryByText("notes.txt")).not.toBeInTheDocument());
    expect(master.checked).toBe(true);

    await userEvent.click(master);
    await waitFor(() => expect(screen.getByText("notes.txt")).toBeInTheDocument());
    expect(screen.getByText(/Aucun filtre/)).toBeInTheDocument();
  });

  it("selecting a folder scopes the card list to it (under=)", async () => {
    render(<Harness />);
    await screen.findByText("clients");

    await userEvent.click(screen.getByText("clients"));
    await waitFor(() => expect(api.list).toHaveBeenCalledWith(expect.objectContaining({ under: "clients" })));
  });

  it("debounced search calls api.search scoped to the selection", async () => {
    render(<Harness />);
    await waitFor(() => expect(api.list).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText("Rechercher une ressource"), "devis");
    await waitFor(() => expect(api.search).toHaveBeenCalledWith("devis", expect.objectContaining({})));
    expect(await screen.findByText("Résultat recherché")).toBeInTheDocument();
  });

  it("workspace mode: both roots appear as ⌂ nodes, default root expanded, fan-out list", async () => {
    vi.mocked(api.context).mockResolvedValue({
      mode: "workspace",
      workspace: { id: "agence", label: "Agence (démo)", path: "/tmp/agence" },
      roots: [
        { id: "dupont", label: "Dupont Conseil", type: "project", default: true },
        { id: "martin", label: "Martin Digital", type: "project", default: false },
      ],
    });
    vi.mocked(api.tree).mockImplementation(async (root?: string) => ({ ...tree, name: root ?? "demo" }));

    render(<Harness />);
    expect(await screen.findByText("Dupont Conseil")).toBeInTheDocument();
    expect(screen.getByText("Martin Digital")).toBeInTheDocument();
    expect(screen.getByText(/AGENCE/)).toBeInTheDocument();
    // Default root expanded → its children visible exactly once (the other root is folded). The
    // expansion lands one commit after the root rows: poll instead of asserting synchronously.
    await waitFor(() => expect(screen.getAllByText("clients")).toHaveLength(1));
    // Workspace header selected by default → one list per root (client-side fan-out).
    await waitFor(() => expect(api.list).toHaveBeenCalledWith(expect.objectContaining({ root: "dupont" })));
    await waitFor(() => expect(api.list).toHaveBeenCalledWith(expect.objectContaining({ root: "martin" })));
  });

  it("clicking a card expands it in place (editable body, one card at a time)", async () => {
    vi.mocked(api.resource).mockResolvedValue({
      id: "p", type: "process", path: ".ai/p.md",
      data: { schema_version: "base.resource.v1", id: "p", type: "process", description: "Crée un devis" },
      body: "# Nouveau devis\n", errors: [],
    });
    render(<Harness />);
    await screen.findByText("Nouveau devis");

    await userEvent.click(screen.getByText("Nouveau devis"));
    expect(await screen.findByLabelText("Contenu du document")).toHaveValue("# Nouveau devis\n");
    expect(screen.getByText("Détails (métadonnées)")).toBeInTheDocument();
    expect(api.resource).toHaveBeenCalledWith(".ai/p.md", undefined);
  });

  it("surfaces a load error", async () => {
    vi.mocked(api.list).mockRejectedValueOnce(new Error("offline"));
    render(<Harness />);
    expect(await screen.findByText(/offline/)).toBeInTheDocument();
  });
});
