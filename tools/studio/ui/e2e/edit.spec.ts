import { expect, test, type Page } from "@playwright/test";

// Exercises the gated write path end to end, IN the expandable card: open in place, edit the body,
// ⌘S to propose (diff), validate (commit through the real broker), fold, reload → the hash
// restores the state and the change is on disk. Runs on the single-root fixture here and on the
// workspace fixture below (the rootId must travel with the card).

const MARK = "Vérification E2E du gate.";

async function editJourney(page: Page, origin: string) {
  await page.goto(origin);

  // Click anywhere on the closed card → expansion in place (no Edit button anywhere).
  await page.getByRole("button", { name: /Nouveau devis/ }).first().click();
  const open = page.locator(".card-open");
  await expect(open).toBeVisible();
  const body = open.locator(".card-body");
  await expect(body).toBeVisible();

  // The hash now carries the open card — reload restores it.
  const hashWhileOpen = await page.evaluate(() => window.location.hash);
  expect(hashWhileOpen).toContain("open=");

  // Edit the body → dirty bar appears → ⌘S proposes (the keyboard contract).
  await body.click();
  await body.press("End");
  await body.pressSequentially(`\n${MARK}\n`);
  await expect(open.getByText("Modifications non écrites")).toBeVisible();
  await body.press(process.platform === "darwin" ? "Meta+s" : "Control+s");

  // The review is the DOCUMENT, in the editor's frame: the added line is colored at its real
  // position and the unchanged text stays visible around it.
  await expect(open.locator(".docdiff ins", { hasText: MARK })).toBeVisible(); // nothing written yet — just the review
  await expect(open.locator(".docdiff .diff-ctx").first()).toBeVisible();
  await open.getByRole("button", { name: /Appliquer/ }).click();
  await expect(open.getByText(/Modification appliquée/)).toBeVisible();

  // Fold via the × button, reload the SAME url: the state (folder, card folded) is back, and the
  // committed change persisted on disk.
  await open.getByRole("button", { name: "Replier" }).click();
  await expect(page.locator(".card-open")).toHaveCount(0);

  await page.goto(origin + hashWhileOpen);
  await page.reload();
  await expect(page.locator(".card-open .card-body")).toHaveValue(new RegExp(MARK));
}

test.describe("Edit in the card (propose -> commit)", () => {
  test("single root: open, edit, ⌘S, validate, fold, reload restores", async ({ page }) => {
    await editJourney(page, "/");
  });

  test("workspace: the same journey, scoped to the card's root", async ({ page }) => {
    await editJourney(page, "http://localhost:5198/");
  });
});
