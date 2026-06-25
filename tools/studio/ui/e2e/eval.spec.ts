import { expect, test } from "@playwright/test";

// Évaluations, the redesigned page: the Pulse strip, Drive-style chips, the run cards, and the
// launch drawer («▶ Évaluer», top right). One selection drives pulse + chips + cards. The
// seeded settings carry faux/faux-mini as runner+judge defaults; the faux provider answers the
// SUT, the simulated user and the judge deterministically.

async function gotoEval(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("tab", { name: "Évaluations" }).click();
  await expect(page.getByRole("button", { name: "▶ Évaluer" })).toBeVisible();
}

test.describe("Évaluations (Pulse + chips + cartes + drawer)", () => {
  test("the seeded runs are cards; one expands in place on verdict + transcript", async ({ page }) => {
    await gotoEval(page);
    const card = page.locator(".runcard", { hasText: "nouveau-devis" }).first();
    await expect(card).toBeVisible();
    // Essentials without a click: verdict word, process chip, failure mode (French taxonomy word).
    await expect(card).toContainText("manqué");
    await expect(card).toContainText("mauvais routage");

    await card.getByRole("button", { name: /^Exécution/ }).click();
    await expect(card.getByText("le devis n'est pas justifié")).toBeVisible();
    await expect(card.getByText(/Contexte injecté: pack/)).toBeVisible();
    await expect(card.getByText("J'ai besoin d'un devis")).toBeVisible();
    await expect(card.getByRole("button", { name: "Ouvrir le process ▸" })).toBeVisible();
  });

  test("the Pulse: one bar per run, the headline rate, click opens the run's card", async ({ page }) => {
    await gotoEval(page);
    const pulse = page.getByRole("region", { name: "Pulse des évaluations" });
    await expect(pulse).toContainText(/de réussite/);
    const bars = pulse.locator(".pulse-bar");
    expect(await bars.count()).toBeGreaterThanOrEqual(2);

    // The red bar belongs to the failed seeded run: clicking it expands that card below.
    await pulse.locator(".pulse-not_met").first().click();
    await expect(page.locator(".runcard.card-open")).toContainText("manqué");
  });

  test("a chip filters cards AND pulse together; ✕ clears it; the state survives a reload", async ({ page }) => {
    await gotoEval(page);
    await expect(page.locator(".runcard").first()).toBeVisible();
    const before = await page.locator(".runcard").count();

    await page.getByRole("button", { name: "Mode d'échec ▾" }).click();
    await page.getByRole("option", { name: /wrong_routing/ }).click();
    await expect(page.locator(".runcard")).toHaveCount(1);

    // One selection: the pulse follows the chips.
    await expect(page.getByRole("region", { name: "Pulse des évaluations" }).locator(".pulse-bar")).toHaveCount(1);

    // The hash carries the selection: a reload restores it.
    await page.reload();
    await expect(page.locator(".runcard")).toHaveCount(1);

    await page.getByRole("button", { name: "Retirer le filtre Mode d'échec" }).click();
    await expect(page.locator(".runcard")).toHaveCount(before);
  });

  test("«▶ Évaluer» opens the drawer; zero-config launch shows the pill and lands new cards", async ({ page }) => {
    await gotoEval(page);
    await expect(page.locator(".runcard").first()).toBeVisible();
    const before = await page.locator(".runcard").count();

    await page.getByRole("button", { name: "▶ Évaluer" }).click();
    const drawer = page.getByRole("dialog", { name: "Lancer une évaluation" });
    await expect(drawer).toBeVisible();
    // Échap closes, the button reopens (dialog semantics).
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await page.getByRole("button", { name: "▶ Évaluer" }).click();

    // Choose what to run (the default models are preselected), then launch.
    await drawer.getByLabel("Tous les process").check();
    const launch = drawer.getByRole("button", { name: /^Lancer/ });
    await expect(launch).toBeEnabled();
    await launch.click();
    await expect(drawer).not.toBeVisible();

    // The runs complete against the faux provider and land as new cards via the polling refresh.
    await expect(async () => {
      expect(await page.locator(".runcard").count()).toBeGreaterThan(before);
    }).toPass({ timeout: 30_000 });
  });

  test("«Relancer» relaunches for real; «avec un autre modèle» opens the drawer pre-filled", async ({ page }) => {
    await gotoEval(page);
    const card = page.locator(".runcard", { hasText: "configuration" }).first();
    await card.getByRole("button", { name: /^Exécution/ }).click();

    // The model-change variant opens the drawer with the run's model preset for the runner…
    await card.getByRole("button", { name: "Relancer avec un autre modèle" }).click();
    const drawer = page.getByRole("dialog", { name: "Lancer une évaluation" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("button", { name: /Utilisateur simulé/ })).toContainText("faux");
    await page.keyboard.press("Escape");

    // …while «Relancer» launches immediately with the defaults: new cards land.
    const before = await page.locator(".runcard").count();
    await card.getByRole("button", { name: "Relancer", exact: true }).click();
    await expect(async () => {
      expect(await page.locator(".runcard").count()).toBeGreaterThan(before);
    }).toPass({ timeout: 30_000 });
  });

  test("an invalid launch surfaces the preflight problems INSIDE the drawer", async ({ page }) => {
    await gotoEval(page);
    await page.getByRole("button", { name: "▶ Évaluer" }).click();
    const drawer = page.getByRole("dialog", { name: "Lancer une évaluation" });

    await drawer.getByLabel("Tous les process").check();
    await drawer.getByRole("button", { name: /Utilisateur simulé/ }).click();
    await page.getByLabel("Filtrer les modèles").fill("faux/modele-inexistant-e2e");
    await page.getByRole("button", { name: /quand même/ }).click();

    await drawer.getByRole("button", { name: /^Lancer/ }).click();
    await expect(drawer.locator(".fm-errors")).toBeVisible();
  });
});
