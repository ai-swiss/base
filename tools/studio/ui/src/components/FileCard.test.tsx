// A non-resource file opens read-only: it shows its content, says so, and never offers edit/chat.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api.ts";
import { COPY } from "../copy.ts";
import { FileCard } from "./FileCard.tsx";

vi.mock("../api", () => ({ api: { file: vi.fn() } }));

beforeEach(() => {
  vi.mocked(api.file).mockResolvedValue({
    path: "docs/notes.txt",
    name: "notes.txt",
    size: 12,
    content: "contenu du fichier",
  });
});

describe("FileCard — read-only view of a non-resource", () => {
  it("loads the file content and renders the read-only notice", async () => {
    render(<FileCard path="docs/notes.txt" rootId={null} onClose={() => {}} />);
    expect(await screen.findByText("contenu du fichier")).toBeInTheDocument();
    expect(screen.getByText(COPY.file.readOnly)).toBeInTheDocument();
    expect(screen.getByText(COPY.file.kind)).toBeInTheDocument();
    // The title is the basename, not the full path.
    expect(screen.getByText("notes.txt")).toBeInTheDocument();
    expect(api.file).toHaveBeenCalledWith("docs/notes.txt", undefined);
  });

  it("passes the root id through to the loader when given", async () => {
    render(<FileCard path="a/b.txt" rootId="root-2" onClose={() => {}} />);
    await waitFor(() => expect(api.file).toHaveBeenCalledWith("a/b.txt", "root-2"));
  });

  it("clicking the header collapses the card", async () => {
    const onClose = vi.fn();
    render(<FileCard path="docs/notes.txt" rootId={null} onClose={onClose} />);
    await screen.findByText("contenu du fichier");
    await userEvent.click(screen.getByText("notes.txt"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("the × button collapses without bubbling a second close through the header", async () => {
    const onClose = vi.fn();
    render(<FileCard path="docs/notes.txt" rootId={null} onClose={onClose} />);
    await screen.findByText("contenu du fichier");
    await userEvent.click(screen.getByRole("button", { name: COPY.common.collapse }));
    // stopPropagation means the header onClick does not also fire.
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("surfaces a load error", async () => {
    vi.mocked(api.file).mockRejectedValue(new Error("boom"));
    render(<FileCard path="docs/notes.txt" rootId={null} onClose={() => {}} />);
    expect(await screen.findByText(/boom/)).toBeInTheDocument();
  });
});
