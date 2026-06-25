import { expect, test } from "@playwright/test";

// S6 journey against the faux provider booted by serve.mjs on 127.0.0.1:4666 (a first provider is
// seeded by serve.mjs; this adds a SECOND one through the UI): add a provider in Réglages, discover
// its models, give one a display name inline in its row, then find that name in the evaluation
// picker. No secret ever transits: the provider only names an env var.

test.describe("Réglages — providers, discovery, display names, pickers", () => {
  test("add a provider, discover models, name one, find it in the eval picker", async ({ page }) => {
    await page.goto("/#/settings");

    // Open the (collapsed-by-default) add form, then add the faux openai-compatible provider.
    await page.getByRole("button", { name: "+ Ajouter un fournisseur" }).click();
    await page.getByLabel("Identifiant").fill("faux2");
    await page.getByLabel(/URL de base/).fill("http://127.0.0.1:4666/v1");
    await page.getByRole("button", { name: "Ajouter", exact: true }).click();

    // Open the new provider's details (the card is a disclosure: quiet row, details on demand).
    const card = page.locator(".provider-card", { hasText: "faux2" });
    await card.locator("summary").click();

    // Discovery: its models appear in the opened detail.
    await expect(card).toContainText("faux-mini", { timeout: 10_000 });

    // Connection test answers OK (scoped to the new card — the seeded provider has its own button).
    await card.getByRole("button", { name: "Tester la connexion" }).click();
    await expect(card).toContainText(/OK, \d+ ms/);

    // Give one discovered model a display name, inline in its row; it shows as a chip in the summary.
    await card.getByLabel("Nom d'affichage pour faux-mini").fill("rapide");
    await card.getByLabel("Nom d'affichage pour faux-mini").blur();
    await expect(card.locator(".alias-chip", { hasText: "rapide" })).toBeVisible();

    // The evaluation launcher's picker lists the display name.
    await page.getByRole("tab", { name: "Évaluations" }).click();
    await page.getByRole("button", { name: "▶ Évaluer" }).click();
    await page.getByRole("button", { name: /Utilisateur simulé/ }).click();
    await expect(page.getByRole("option", { name: /rapide/ })).toBeVisible();
    await page.getByRole("option", { name: /rapide/ }).click();
    await expect(page.getByRole("button", { name: /Utilisateur simulé/ })).toContainText("rapide");
  });
});
