import { expect, test } from "@playwright/test";

test("Popover flips and clamps its panel on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto("/iframe.html?id=components-popover--positioning-at-viewport-edge&viewMode=story");

  const panel = page.getByRole("dialog", { name: "Edge-aware content" });
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("data-side", "bottom");

  const bounds = await panel.boundingBox();
  const viewport = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.width);
});
