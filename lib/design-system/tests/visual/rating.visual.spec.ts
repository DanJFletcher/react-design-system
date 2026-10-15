import { expect, test } from "@playwright/test";

test("Rating follows theme colors and fits a narrow viewport", async ({ page }) => {
  await page.goto("/iframe.html?id=components-rating--theme-coverage&viewMode=story");

  const groups = page.getByRole("group");
  const images = page.getByRole("img");
  await expect(groups).toHaveCount(5);
  await expect(images).toHaveCount(5);

  const fills = page.locator("[data-ds-theme] [data-rating-star-fill]");
  const fillColors = await fills.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).color),
  );
  expect(new Set(fillColors).size).toBeGreaterThan(1);

  await page.setViewportSize({ width: 390, height: 720 });
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  await expect(page.getByRole("group", { name: "sublime service rating" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "1 out of 5 stars" }).last()).toBeVisible();
});
