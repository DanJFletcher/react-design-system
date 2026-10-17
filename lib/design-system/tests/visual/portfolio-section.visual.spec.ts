import { expect, test } from "@playwright/test";

test("portfolio projects adapt to compact and wide layouts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    "/iframe.html?id=components-portfolio-section--playground&viewMode=story",
  );

  const section = page.getByRole("region", {
    name: "Projects made for real life",
  });
  const grid = section.locator('[data-slot="portfolio-grid"]');
  await expect(grid.getByRole("listitem")).toHaveCount(3);

  const narrowFirst = await grid.getByRole("listitem").nth(0).boundingBox();
  const narrowSecond = await grid.getByRole("listitem").nth(1).boundingBox();
  expect(narrowFirst).not.toBeNull();
  expect(narrowSecond).not.toBeNull();
  expect(narrowSecond!.y).toBeGreaterThan(narrowFirst!.y);

  const narrowScrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  const narrowClientWidth = await page.evaluate(
    () => document.documentElement.clientWidth,
  );
  expect(narrowScrollWidth).toBeLessThanOrEqual(narrowClientWidth);

  await page.setViewportSize({ width: 1280, height: 900 });
  const wideItems = await grid.getByRole("listitem").all();
  const wideBoxes = await Promise.all(
    wideItems.map((item) => item.boundingBox()),
  );
  const leftEdges = new Set(
    wideBoxes.map((box) => Math.round(box?.x ?? Number.NaN)),
  );
  expect(leftEdges.size).toBe(3);
});
