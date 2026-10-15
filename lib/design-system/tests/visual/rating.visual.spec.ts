import { expect, test } from "@playwright/test";

test("Rating follows theme colors and fits a narrow viewport", async ({ page }) => {
  await page.goto("/iframe.html?id=components-rating--theme-coverage&viewMode=story");

  const groups = page.getByRole("group");
  const images = page.getByRole("img");
  await expect(groups).toHaveCount(5);
  await expect(images).toHaveCount(5);
  const halfStarChoices = page.getByRole("radio", { name: "3.5 out of 5 stars" });
  await expect(halfStarChoices).toHaveCount(5);
  await expect(halfStarChoices.last()).toBeChecked();

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

  await page.goto("/iframe.html?id=components-rating--narrow-half-star-scale&viewMode=story");
  await expect(page.getByRole("radio", { name: "6.5 out of 10 stars" })).toBeChecked();
  const narrowScaleDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(narrowScaleDimensions.documentWidth).toBeLessThanOrEqual(narrowScaleDimensions.viewportWidth);

  await page.goto("/iframe.html?id=components-rating--symbol-variants&viewMode=story");
  await expect(page.getByRole("img", { name: "4.5 out of 5 hearts" })).toHaveCount(5);
  for (const symbol of ["star", "heart", "thumbs"]) {
    await expect(page.locator(`[data-ds-theme] [data-rating-symbol="${symbol}"]`).first()).toBeVisible();
  }

  const fractionalSymbols = await page.locator("[data-rating-star-fill]").evaluateAll((fills) =>
    fills
      .filter((fill) => (fill as HTMLElement).style.getPropertyValue("--rating-fill") === "50%")
      .map((fill) => {
        const outline = fill.previousElementSibling!.getBoundingClientRect();
        const solid = fill.querySelector("svg")!.getBoundingClientRect();
        const clip = fill.getBoundingClientRect();
        return {
          outlineWidth: outline.width,
          outlineHeight: outline.height,
          solidWidth: solid.width,
          solidHeight: solid.height,
          solidTop: solid.top,
          outlineTop: outline.top,
          clipWidth: clip.width,
          overflow: getComputedStyle(fill).overflow,
        };
      }),
  );
  expect(fractionalSymbols).toHaveLength(15);
  for (const symbol of fractionalSymbols) {
    expect(symbol.outlineWidth).toBeGreaterThan(0);
    expect(symbol.solidWidth).toBeCloseTo(symbol.outlineWidth, 1);
    expect(symbol.solidHeight).toBeCloseTo(symbol.outlineHeight, 1);
    expect(symbol.solidTop).toBeCloseTo(symbol.outlineTop, 1);
    expect(symbol.clipWidth).toBeCloseTo(symbol.outlineWidth / 2, 1);
    expect(symbol.overflow).toBe("hidden");
  }
});
