import { expect, test } from "@playwright/test";

test("ColorField stays usable and within the viewport on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/iframe.html?id=components-form-controls--theme-coverage&viewMode=story");

  const bounds = await page.locator('input[type="color"]').first().evaluate((picker) => {
    const controlsElement = picker.parentElement;
    const valueInput = controlsElement?.querySelector('input[type="text"]');
    if (!controlsElement || !valueInput) return null;
    const controls = controlsElement.getBoundingClientRect();
    const textBounds = valueInput.getBoundingClientRect();
    const pickerBounds = picker.getBoundingClientRect();
    return {
      controlsLeft: controls.left,
      controlsRight: controls.right,
      textRight: textBounds.right,
      pickerLeft: pickerBounds.left,
      pickerRight: pickerBounds.right,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  if (!bounds) throw new Error("The color picker and hex value should share a control group.");

  expect(bounds.controlsLeft).toBeGreaterThanOrEqual(0);
  expect(bounds.controlsRight).toBeLessThanOrEqual(bounds.viewportWidth);
  expect(bounds.textRight).toBeLessThanOrEqual(bounds.pickerLeft);
  expect(bounds.pickerRight).toBeLessThanOrEqual(bounds.controlsRight);
  expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewportWidth);
});

test("ColorField is visible in every built-in theme", async ({ page }) => {
  await page.goto("/iframe.html?id=components-form-controls--theme-coverage&viewMode=story");

  const values = page.locator('input[type="text"][name^="brand-color-"]');
  const pickers = page.locator('input[type="color"]');
  await expect(values).toHaveCount(5);
  await expect(pickers).toHaveCount(5);

  for (const picker of await pickers.all()) {
    await expect(picker).toBeVisible();
    const radius = await picker.evaluate((input) => getComputedStyle(input).borderTopLeftRadius);
    expect(radius).not.toBe("0px");
  }
});
