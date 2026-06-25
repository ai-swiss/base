import { expect, test } from "@playwright/test";

// Co-thinker journeys against the faux provider (serve.mjs, 127.0.0.1:4666): the co-thinker chat in the
// expanded card (the chat ANNOUNCES, the diff shows IN the document, Appliquer commits), the
// BASE-method injection, and the Évaluer ▶ → Retour round-trip that restores the exact Parcourir state.

async function openCardWithChat(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /Nouveau devis/ }).first().click();
  const card = page.locator(".card-open");
  await expect(card.locator(".card-body")).toBeVisible();
  await card.getByRole("button", { name: /Éditer avec l'IA/ }).click();
  const chat = page.locator(".chatpanel");
  await expect(chat).toBeVisible();
  // Pick the faux model in the chat's picker.
  await chat.locator(".picker-trigger").click();
  await page.getByRole("option", { name: /faux-mini/ }).first().click();
  return { card, chat };
}

test.describe("Chat d'édition (co-penseur)", () => {
  test("ask for an addition → the diff colors the DOCUMENT, the chat only announces → Appliquer commits", async ({ page }) => {
    const { card, chat } = await openCardWithChat(page);

    await chat.getByLabel("Demander une modification").fill("ajoute une étape de vérification TVA après l'étape 2");
    await chat.getByLabel("Demander une modification").press("Enter");

    // The suggestion shows IN the document frame, at its real position — never in the chat column.
    await expect(card.locator(".docdiff ins", { hasText: "vérifier la TVA" })).toBeVisible({ timeout: 15_000 });
    await expect(chat.locator(".chat-proposal")).toContainText("± Proposition");
    await expect(chat.locator(".diff-line")).toHaveCount(0);

    await card.getByRole("button", { name: /Appliquer/ }).click();
    await expect(card.getByText("Modification appliquée.")).toBeVisible();
    // The card reloads the committed document.
    await expect(card.locator(".card-body")).toHaveValue(/vérifier la TVA/);
  });

  test("two blocks proposed → Annuler one → «Appliquer 1 bloc» writes ONLY the chosen one", async ({ page }) => {
    const { card, chat } = await openCardWithChat(page);

    await chat.getByLabel("Demander une modification").fill("révise le document à deux endroits");
    await chat.getByLabel("Demander une modification").press("Enter");

    // The chat announces the shape of the change; the blocks live in the document.
    await expect(chat.locator(".chat-proposal")).toContainText("2 blocs", { timeout: 15_000 });
    const annuler = card.locator(".docdiff").getByRole("button", { name: /Annuler ⌘N/ });
    await expect(annuler).toHaveCount(2);

    // Drop the first block (the retitle); keep the appended line.
    await annuler.first().click();
    await card.getByRole("button", { name: /Appliquer 1 bloc/ }).click();
    await expect(card.getByText("Modification appliquée.")).toBeVisible();

    // The document contains ONLY the chosen change.
    const body = page.locator(".card-open .card-body");
    await expect(body).toContainText("Ligne finale ajoutée par le modèle.");
    await expect(body).not.toContainText("(révisé)");
  });

  test("the editor/chat split drags with the mouse and the width survives a reload", async ({ page }) => {
    const { chat } = await openCardWithChat(page);
    const handle = page.locator(".card-grid [role='separator']");
    const before = (await chat.boundingBox())!.width;

    // The handle spans the whole (tall) card: grab it in its VISIBLE portion, below the sticky
    // topbar — events above it land on the topbar, events below the fold land in the void.
    await handle.scrollIntoViewIfNeeded();
    const hb = (await handle.boundingBox())!;
    const grabY = Math.min(Math.max(hb.y + 20, 100), hb.y + hb.height - 20);
    await page.mouse.move(hb.x + 3, grabY);
    await page.mouse.down();
    await page.mouse.move(hb.x - 117, grabY, { steps: 4 });
    await page.mouse.up();

    const after = (await chat.boundingBox())!.width;
    expect(after).toBeGreaterThan(before + 80);

    await page.reload();
    await expect(page.locator(".chatpanel")).toBeVisible();
    const restored = (await page.locator(".chatpanel").boundingBox())!.width;
    expect(Math.abs(restored - after)).toBeLessThan(10);
  });

  test("a method question is answered WITH the BASE method process in context", async ({ page }) => {
    const { chat } = await openCardWithChat(page);

    await chat.getByLabel("Demander une modification").fill("quelles métadonnées ajouter ?");
    await chat.getByLabel("Demander une modification").press("Enter");

    // The faux model echoes the method process id it found in its context.
    await expect(chat.getByText(/MÉTHODE reçue : ameliorer-agent/)).toBeVisible({ timeout: 15_000 });
  });

  test("a long conversation shows the memory banner and stays coherent", async ({ page }) => {
    const { chat } = await openCardWithChat(page);
    const input = chat.getByLabel("Demander une modification");

    // The e2e server runs with a tiny context budget (STUDIO_CHAT_CONTEXT_TOKENS=60): three
    // substantial messages exceed it, the server compacts, the client folds the prefix.
    const filler = "point de contexte assez long pour peser dans le budget de la conversation ".repeat(3);
    for (let i = 0; i < 3; i += 1) {
      await input.fill(`question ${i + 1} : ${filler}`);
      await input.press("Enter");
      await expect(chat.locator(".chat-msg.chat-assistant")).toHaveCount(i + 1, { timeout: 15_000 });
    }

    await expect(chat.locator(".memorybar")).toBeVisible();
    await expect(chat.locator(".memorybar")).toContainText(/Mémoire: \d+ message/);
    // The conversation remains usable after compaction.
    await input.fill("question finale courte");
    await input.press("Enter");
    await expect(chat.locator(".chat-msg.chat-assistant")).toHaveCount(4, { timeout: 15_000 });
  });

  test("a remote model withholds the confidential reference, with the «retenu» badge", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Nouveau devis/ }).first().click();
    const card = page.locator(".card-open");
    await card.getByRole("button", { name: /Éditer avec l'IA/ }).click();
    const chat = page.locator(".chatpanel");
    // Pick the REMOTE-flagged provider (same stub, explicit locality override).
    await chat.locator(".picker-trigger").click();
    await page.getByLabel("Filtrer les modèles").fill("faux-distant");
    await page.getByRole("option", { name: /faux-mini/ }).first().click();

    await chat.getByLabel("Demander une modification").fill("bonjour");
    await chat.getByLabel("Demander une modification").press("Enter");

    await expect(chat.locator(".egress-badge")).toBeVisible({ timeout: 15_000 });
    await expect(chat.locator(".egress-badge")).toContainText(/retenu/);
    await expect(chat.locator(".egress-badge")).toContainText(/modèle local/);
  });

  test("Évaluer ▶ pre-fills the eval and Retour restores root, folder, filters and open card", async ({ page }) => {
    await page.goto("/");
    // Build a distinctive Parcourir state: filter to process, then open the card.
    await page.getByRole("checkbox", { name: /^process/ }).check();
    await page.getByRole("button", { name: /Nouveau devis/ }).first().click();
    const card = page.locator(".card-open");
    await expect(card.locator(".card-body")).toBeVisible();

    await card.getByRole("button", { name: "Évaluer ▶" }).click();
    await expect(page).toHaveURL(/#\/eval\?.*process=nouveau-devis/);
    // Arriving with a process opens the launch DRAWER, pre-filled.
    const drawer = page.getByRole("dialog", { name: "Lancer une évaluation" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("checkbox", { name: "Nouveau devis" })).toBeChecked();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "← Retour à Parcourir" }).click();
    // Same filters, same open card.
    await expect(page.locator(".card-open", { hasText: "Nouveau devis" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /^process/ })).toBeChecked();
  });
});
