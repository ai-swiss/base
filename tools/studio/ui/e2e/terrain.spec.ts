import { expect, test } from "@playwright/test";

// The field pile: an open friction shows in the Terrain pile, resolves through
// the ordinary gate (diff → Valider) and leaves the open filter; abstentions aggregate with
// counters; terrain and simulation counters never mix.

test.describe("Terrain — frictions et abstentions", () => {
  test("the pile shows the field friction, separate from simulations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Évaluations" }).click();

    const terrain = page.locator(".terrain");
    await expect(terrain).toBeVisible();
    await expect(terrain).toContainText("le barème cité n'est plus le bon");
    await expect(terrain).toContainText("via assistant");
    await expect(terrain.locator(".badge", { hasText: "terrain" })).toBeVisible();

    // Router abstentions are deliberately NOT surfaced in the terrain pile (TerrainPile.tsx):
    // their honest home is the doctor's threshold-gated `recurring_abstention`, not this list.

    // Terrain never mixes with the simulation counters: the friction is absent from the run cards,
    // and the executions counter counts exactly the simulation cards.
    await expect(page.locator(".runcard", { hasText: "le barème cité" })).toHaveCount(0);
    const runCount = await page.locator(".runcard").count();
    await expect(page.getByText(`Exécutions (${runCount})`)).toBeVisible();
  });

  test("Marquer résolu goes through the gate and the friction leaves the open pile", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Évaluations" }).click();
    const terrain = page.locator(".terrain");
    await expect(terrain).toContainText("le barème cité");

    await terrain.getByRole("button", { name: "Marquer résolu" }).click();
    // The gate: a COLORED diff first, nothing written yet — the change is an <ins> line.
    await expect(terrain.locator(".diffview ins", { hasText: "status: resolved" })).toBeVisible();
    await terrain.getByRole("button", { name: "Valider et écrire" }).click();

    // Resolved → out of the open pile.
    await expect(terrain.getByText("le barème cité n'est plus le bon")).toHaveCount(0, { timeout: 10_000 });
  });
});
