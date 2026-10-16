import { expect, test } from "@playwright/test";

test("ActivityFeed wraps long event content on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-activity-feed--long-content&viewMode=story");

  const region = page.getByRole("region", {
    name: "Updates from across your publishing workspace",
  });
  const subject = page.getByRole("link", {
    name: "A detailed guide to planning seasonal landscape maintenance for community properties",
  });
  await expect(region).toBeVisible();
  await expect(subject).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
});

test("ActivityFeed subject links receive visible keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/iframe.html?id=components-activity-feed--playground&viewMode=story");

  const firstSubject = page.getByRole("link", { name: "Spring service guide" });
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("Tab");
  await expect(firstSubject).toBeFocused();
  const outlineWidth = await firstSubject.evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(Number.parseFloat(outlineWidth)).toBeGreaterThan(0);
});
