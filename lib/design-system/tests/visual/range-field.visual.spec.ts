import { expect, test } from "@playwright/test";

test("RangeField uses theme colors and remains usable in a narrow RTL layout", async ({ page }) => {
  await page.goto("/iframe.html?id=components-range-field--theme-coverage&viewMode=story");

  const themedSliders = page.getByRole("slider");
  await expect(themedSliders).toHaveCount(5);
  const themeActionColors = await themedSliders.evaluateAll((sliders) =>
    sliders.map((slider) => getComputedStyle(slider).getPropertyValue("--ds-color-action-primary-bg").trim()),
  );
  expect(new Set(themeActionColors).size).toBeGreaterThan(1);

  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto("/iframe.html?id=components-range-field--right-to-left&viewMode=story");
  const slider = page.getByRole("slider", { name: "ميزانية النقل" });
  await expect(slider).toBeVisible();

  const dimensions = await slider.evaluate((element) => ({
    left: element.getBoundingClientRect().left,
    right: element.getBoundingClientRect().right,
    width: element.getBoundingClientRect().width,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.width).toBeGreaterThan(0);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  await page.goto("/iframe.html?id=components-range-field--keyboard-native&viewMode=story");
  const keyboardSlider = page.getByRole("slider", { name: "Keyboard adjustable budget" });
  await expect(keyboardSlider).toHaveValue("50");
  await keyboardSlider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(keyboardSlider).toHaveValue("55");
});
