import { expect, test } from "@playwright/test";

// Multi-root behaviours run against the SECOND instance (agence-multi-clients workspace) booted by
// serve.mjs on 5198/4398. Wait for it: Playwright's webServer only gates on the first instance.
const WS = "http://localhost:5198";

test.beforeAll(async ({ request }) => {
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      const res = await request.get(WS);
      if (res.ok()) return;
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) throw new Error(`workspace Studio not reachable at ${WS}`);
    await new Promise((r) => setTimeout(r, 500));
  }
});

test.describe("Browse — workspace (multi-root)", () => {
  test("the workspace shows its two roots, default root expanded", async ({ page }) => {
    await page.goto(WS);

    // The workspace header and both ⌂ root nodes — and the perimeter badge counts the roots
    // (shown in workspace mode as «… · N dossiers»).
    await expect(page.locator(".perimeter")).toContainText("2 dossiers");
    await expect(page.locator(".tree-workspace")).toContainText(/AGENCE/);
    await expect(page.getByRole("treeitem", { name: /Dupont Conseil/ })).toBeVisible();
    await expect(page.getByRole("treeitem", { name: /Martin Digital/ })).toBeVisible();

    // Default root (Dupont) expanded → exactly one ".ai" child visible (Martin stays folded).
    await expect(page.locator(".tree-row.tree-dir", { hasText: /^.*\.ai/ })).toHaveCount(1);

    // Workspace header selected by default → the cards cover both roots.
    await expect(page.locator(".card").first()).toBeVisible();
  });

  test("the workspace header shows the cards of both roots, grouped by root", async ({ page }) => {
    await page.goto(WS);
    await page.locator(".tree-workspace").click();

    await expect(page.locator(".root-head", { hasText: "Dupont Conseil" })).toBeVisible();
    await expect(page.locator(".root-head", { hasText: "Martin Digital" })).toBeVisible();

    // A root group header narrows the scope to that root.
    await page.locator(".root-head", { hasText: "Martin Digital" }).click();
    await expect(page.locator(".scope-title")).toHaveText("Martin Digital");
  });

  test("a workspace-wide search merges the roots, each card showing its root", async ({ page }) => {
    await page.goto(WS);
    await page.locator(".tree-workspace").click();
    await page.getByLabel("Rechercher une ressource").fill("assistant");

    await expect(page.locator(".card").first()).toBeVisible();
    const badges = await page.locator(".card .badge-root").allTextContents();
    expect(badges.length).toBeGreaterThan(0);
    const roots = new Set(badges.map((b) => b.replace("⌂", "").trim()));
    expect(roots.size).toBeGreaterThanOrEqual(2); // both roots represented, root visible on each card
  });
});
