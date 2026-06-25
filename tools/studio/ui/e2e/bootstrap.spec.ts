import { expect, test } from "@playwright/test";

// The bootstrap journey runs against the THIRD instance (a loose-markdown directory, no BASE)
// booted by serve.mjs on 5197/4397. The directory is recreated on every serve.mjs start, so the
// journey is repeatable; within ONE run, the two tests are ordered: welcome first, then init.
const LOOSE = "http://localhost:5197";

test.beforeAll(async ({ request }) => {
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      const res = await request.get(`${LOOSE}/api/context`);
      if (res.ok()) return;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) throw new Error("loose-dir instance (5197) did not come up");
    await new Promise((r) => setTimeout(r, 500));
  }
});

test.describe.configure({ mode: "serial" });

test.describe("Bienvenue — du dossier nu au Studio", () => {
  test("a non-BASE directory shows the Welcome screen with the exact files to create", async ({ page }) => {
    await page.goto(LOOSE);
    await expect(page.getByRole("heading", { name: "Bienvenue dans BASE Studio" })).toBeVisible();
    // The SKILL.md imitation is noticed and welcomed, not ignored.
    await expect(page.getByText(/vous parlez déjà BASE/)).toBeVisible();

    // The creation gate: every file is listed and its full content is readable BEFORE creating —
    // tool artifacts included (the folder must speak to Claude Code/Cursor right away).
    const plan = page.getByRole("region", { name: "Fichiers à créer" });
    await expect(plan).toContainText("AGENT.md");
    await expect(plan).toContainText("base.config.json");
    await expect(plan).toContainText("CLAUDE.md");
    await expect(plan).toContainText(".cursor/rules/assistant.mdc");
    await plan.locator("summary code", { hasText: /agents\/.*AGENT\.md/ }).click();
    await expect(plan.getByText(/type: agent/)).toBeVisible();
    await plan.locator("summary code", { hasText: /^CLAUDE\.md$/ }).click();
    await expect(plan.getByText(/point d'entrée pour Claude Code/)).toBeVisible();
  });

  test("«Créer ces fichiers» bootstraps the BASE and the app reloads into root mode — no restart", async ({ page }) => {
    await page.goto(LOOSE);
    await page.getByRole("button", { name: "Créer ces fichiers" }).click();

    // The same server now serves a real BASE: the explorer appears (Parcourir + the .ai tree). A
    // single root carries no perimeter badge by design — the wordmark and the tree prove the reload.
    await expect(page.getByRole("tab", { name: "Parcourir" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("treeitem", { name: /^\.ai/ })).toBeVisible();
  });
});
