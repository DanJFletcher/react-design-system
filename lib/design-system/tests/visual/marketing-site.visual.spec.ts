import { expect, test } from "@playwright/test";

test("marketing site composes the library's main sections and signup form", async ({ page }) => {
  await page.goto("/iframe.html?id=examples-marketing-site--default&viewMode=story");

  await expect(page.getByRole("heading", { name: "Make room for your best work.", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Everything in its right orbit." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Room to grow, at your pace." })).toBeVisible();
  await expect(page.getByRole("region", { name: "Customer stories" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Starter", level: 3 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Footer navigation" })).toBeVisible();
  const faqQuestion = page.getByRole("button", { name: "Can we start small?" });
  await faqQuestion.click();
  await expect(faqQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("region", { name: "Can we start small?" })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("Orbit");

  await page.getByLabel("Work email").fill("team@example.com");
  await page.getByRole("button", { name: "Join the list" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Thanks — this demo form does not send or store your address.",
  );
});

test("marketing site navigation and layout work on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=examples-marketing-site--default&viewMode=story");

  const header = page.getByRole("banner");
  await expect(header.getByRole("button", { name: "Open navigation" })).toBeVisible();
  await header.getByRole("button", { name: "Open navigation" }).click();
  const navigation = header.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation.getByRole("link", { name: "Product" })).toBeVisible();
  await navigation.getByRole("link", { name: "Product" }).click();
  await expect(page).toHaveURL(/#features$/);

  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});
