import { expect, test } from "@playwright/test";

test.describe("Browse — explorer + filters", () => {
  test("lists resources, searches by relevance, and the checkbox filter masks types", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".card").first()).toBeVisible();
    expect(await page.locator(".card").count()).toBeGreaterThan(3);

    // Single-root mode shows no perimeter badge by design (it would only echo the wordmark);
    // the served directory is named by the tree root instead. The e2e fixture copies the example
    // into e2e/.run, so the tree root is «.run».
    await expect(page.getByRole("treeitem", { name: /^\.run\b/ })).toBeVisible();

    // Full-text search switches the result meta to ranked results.
    await page.getByLabel("Rechercher une ressource").fill("devis");
    await expect(page.locator(".resultmeta")).toContainText("résultats pour");
    await expect(page.locator(".card").first()).toBeVisible();

    // Clearing + checking one type narrows the cards to that type only.
    await page.getByLabel("Rechercher une ressource").fill("");
    await page.getByRole("checkbox", { name: /^process/ }).check();
    await expect(page.locator(".card").first()).toBeVisible();
    const types = await page.locator(".card .kind").allTextContents();
    expect(types.length).toBeGreaterThan(0);
    expect(types.every((k) => k.trim().toLowerCase() === "process")).toBeTruthy();
  });

  test("checking process prunes the tree and the master checkbox becomes indeterminate", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("treeitem").first()).toBeVisible();

    // Before filtering: business folders (no process inside) are part of the full structure.
    await expect(page.getByRole("treeitem", { name: /^catalogue/ })).toBeVisible();

    await page.getByRole("checkbox", { name: /^process/ }).check();
    // Folders without a matching descendant disappear; ancestors of processes stay.
    await expect(page.getByRole("treeitem", { name: /^catalogue/ })).toHaveCount(0);
    await expect(page.getByRole("treeitem", { name: /^\.ai/ }).first()).toBeVisible();

    const master = page.getByRole("checkbox", { name: /Toutes les ressources/ });
    expect(await master.evaluate((el) => (el as HTMLInputElement).indeterminate)).toBe(true);
  });

  test("clicking a folder shows its whole descendance grouped by sub-folder", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("treeitem").first()).toBeVisible();

    // Select .ai → cards of all its descendance, grouped, with clickable headers.
    await page.getByRole("treeitem", { name: /^\.ai/ }).first().click();
    await expect(page.locator(".scope-title")).toHaveText(".ai");
    await expect(page.locator(".card").first()).toBeVisible();
    await expect(page.locator(".group-head").nth(1)).toBeVisible(); // several groups, one per sub-folder

    // A group header click narrows the scope to that folder.
    const header = page.locator(".group-head").last();
    const headerText = (await header.textContent())!.trim();
    await header.click();
    await expect(page.locator(".scope-title")).toHaveText(headerText);
  });

  test("a folder with no matching type proposes the next action (Tout cocher)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("treeitem").first()).toBeVisible();

    // Select devis/ (documents only), then check a type it does not contain: the selection stays
    // while its cards are masked away → the empty state must propose a way out.
    await page.getByRole("treeitem", { name: /^devis\b/ }).first().click();
    await expect(page.locator(".scope-title")).toHaveText("devis");
    await page.getByRole("checkbox", { name: /^tool/ }).check();

    await expect(page.locator(".empty-state")).toBeVisible();
    await expect(page.getByRole("button", { name: "Tout cocher" })).toBeVisible();
    await page.getByRole("button", { name: "Tout cocher" }).click();
    await expect(page.locator(".empty-state")).toHaveCount(0);
  });

  test("scoped search without a hit offers «Chercher partout», which widens and finds", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("treeitem").first()).toBeVisible();

    // Scope to devis/ then search a term that only lives in catalogue/.
    await page.getByRole("treeitem", { name: /^devis\b/ }).first().click();
    await page.getByLabel("Rechercher une ressource").fill("tarification");

    await expect(page.locator(".empty-state")).toContainText(/Rien pour «tarification»/);
    await page.locator(".empty-state").getByRole("button", { name: "Chercher partout" }).click();
    await expect(page.locator(".card").first()).toBeVisible();
    // The tree itself pruned to the matches.
    await expect(page.getByRole("treeitem", { name: /^catalogue/ })).toBeVisible();
    await expect(page.getByRole("treeitem", { name: /^entreprise/ })).toHaveCount(0);
  });

  test("a non-resource file from the tree opens read-only", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("treeitem").first()).toBeVisible();

    await page.locator(".tree-row.nonresource", { hasText: "base.config.json" }).click();
    await expect(page.locator(".card-file")).toBeVisible();
    await expect(page.locator(".card-file")).toContainText("Lecture seule");
    await expect(page.locator(".card-file .file-content")).toContainText("routing");
  });

  test("no box checked shows the full structure with non-resources dimmed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("treeitem").first()).toBeVisible();

    // Default state: nothing checked — the explicit zero-state hint is shown…
    await expect(page.getByText(/Aucun filtre: structure complète/)).toBeVisible();
    // …and a non-resource file (base.config.json) is visible, dimmed.
    await expect(page.locator(".tree-row.nonresource", { hasText: "base.config.json" })).toBeVisible();

    // Checking then unchecking the master returns to the same zero state.
    const master = page.getByRole("checkbox", { name: /Toutes les ressources/ });
    await master.check();
    await expect(page.locator(".tree-row.nonresource")).toHaveCount(0);
    await master.uncheck();
    await expect(page.locator(".tree-row.nonresource", { hasText: "base.config.json" })).toBeVisible();
  });
});
