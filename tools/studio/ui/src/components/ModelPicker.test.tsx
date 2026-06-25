// Spec coverage: FR-STUDIO-006 — the model picker must show the configured models and never strand the
// user. Regression guard for the bug where the picker fetched once on mount and went stale (a provider
// configured mid-session never appeared), and the "Configure providers" link was a dead click.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, type CatalogModel } from "../api";
import { COPY } from "../copy";
import { ModelPicker } from "./ModelPicker";

vi.mock("../api", () => ({ api: { models: vi.fn() } }));

const MODELS: CatalogModel[] = [
  { ref: "ollama/llama3.1", providerId: "ollama", model: "llama3.1", alias: null, locality: "local", online: true },
  { ref: "ollama/qwen2.5", providerId: "ollama", model: "qwen2.5", alias: "rapide", locality: "local", online: true },
];

const trigger = () => screen.getByRole("button", { name: new RegExp(COPY.picker.placeholder) });

afterEach(() => {
  window.location.hash = "";
});

describe("ModelPicker — controlled (Réglages passes its live catalog)", () => {
  it("shows exactly the models it is given, and never fetches", async () => {
    vi.mocked(api.models).mockResolvedValue([]);
    render(<ModelPicker value={null} onChange={() => {}} surfaceId="t" shortcut={false} models={MODELS} />);
    await userEvent.click(trigger());
    expect(await screen.findByRole("option", { name: /llama3\.1/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /rapide/ })).toBeInTheDocument(); // the alias is shown
    expect(api.models).not.toHaveBeenCalled();
  });

  it("selecting a model calls onChange with its ref", async () => {
    const onChange = vi.fn();
    render(<ModelPicker value={null} onChange={onChange} surfaceId="t" shortcut={false} models={MODELS} />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByRole("option", { name: /llama3\.1/ }));
    expect(onChange).toHaveBeenCalledWith("ollama/llama3.1");
  });

  it("with an empty catalog, shows the empty hint and a Configure link that routes to Réglages (never a dead click)", async () => {
    render(<ModelPicker value={null} onChange={() => {}} surfaceId="t" shortcut={false} models={[]} />);
    await userEvent.click(trigger());
    expect(await screen.findByText(COPY.picker.empty)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: COPY.picker.configure }));
    expect(window.location.hash).toBe("#/settings");
  });
});

describe("ModelPicker — uncontrolled (chat / eval)", () => {
  it("fetches on mount and refetches each time it opens, so a mid-session provider appears", async () => {
    vi.mocked(api.models).mockResolvedValue(MODELS);
    render(<ModelPicker value={null} onChange={() => {}} surfaceId="t" shortcut={false} />);
    await waitFor(() => expect(api.models).toHaveBeenCalledTimes(1)); // on mount
    await userEvent.click(trigger());
    expect(await screen.findByRole("option", { name: /llama3\.1/ })).toBeInTheDocument();
    await waitFor(() => expect(api.models).toHaveBeenCalledTimes(2)); // refetch on open
  });
});
