import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Automated WCAG 2 A/AA audit on the two main views. We gate on serious/critical impacts (the ones
// that actually block users); the report still lists everything for discussion.
async function audit(page: import("@playwright/test").Page, within?: string) {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]);
  if (within) builder = builder.include(within);
  const results = await builder.analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

// A failing audit must explain ITSELF: which node, which measured colors — flaky a11y reports
// that only name a rule id cost us hours.
function describeViolations(violations: Awaited<ReturnType<typeof audit>>) {
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => `${n.target.join(" ")} ${JSON.stringify(n.any[0]?.data ?? {})}`).join(" | ")}`);
}

test.describe("accessibility (axe)", () => {
  test("Browse has no serious/critical violations", async ({ page }) => {
    await page.goto("/");
    await page.locator(".card").first().waitFor();
    const serious = await audit(page);
    expect(describeViolations(serious)).toEqual([]);
  });

  test("Évaluations has no serious/critical violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Évaluations" }).click();
    await page.getByText("▶ Évaluer").waitFor();
    const serious = await audit(page);
    expect(describeViolations(serious)).toEqual([]);
  });

  test("the launch drawer (open) has no serious/critical violations", async ({ page }) => {
    await page.goto("/#/eval");
    await page.getByRole("button", { name: "▶ Évaluer" }).click();
    await page.getByRole("dialog", { name: "Lancer une évaluation" }).waitFor();
    // Audit the DIALOG: the page behind is inert and dimmed by the overlay (axe would judge the
    // contrast of deliberately obscured text); the undimmed page has its own audits above.
    const serious = await audit(page, ".drawer");
    expect(describeViolations(serious)).toEqual([]);
  });
});
