import { expect, test } from "@playwright/test";

test("Dialog opens modally, closes on Escape, and restores trigger focus", async ({ page }) => {
  await page.goto("/iframe.html?id=components-dialog--playground&viewMode=story");

  const trigger = page.getByRole("button", { name: "Open dialog" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Confirm the changes?" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close dialog" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("Tooltip inside a dialog is topmost and consumes Escape before the dialog", async ({ page }) => {
  await page.goto("/iframe.html?id=components-dialog--tooltip-inside-dialog&viewMode=story");

  const openDialog = page.getByRole("button", { name: "Open dialog" });
  await openDialog.click();
  const dialog = page.getByRole("dialog", { name: "Confirm the changes?" });
  const trigger = page.getByRole("button", { name: "Dialog help" });
  await expect(dialog).toBeVisible();
  await trigger.focus();

  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  expect(
    await tooltip.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const hit = element.ownerDocument.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
      return hit !== null && element.contains(hit);
    }),
  ).toBe(true);

  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(openDialog).toBeFocused();
});

test("Tooltip stays aligned and visible when its dialog body scrolls", async ({ page }) => {
  await page.goto("/iframe.html?id=components-dialog--tooltip-while-body-scrolls&viewMode=story");

  await page.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm the changes?" });
  const body = dialog.locator(":scope > div");
  const trigger = page.getByRole("button", { name: "Dialog help" });
  await body.evaluate((element) => {
    element.scrollTop = 375;
  });
  expect(await body.evaluate((element) => element.scrollTop)).toBe(375);
  await trigger.evaluate((element) => element.focus({ preventScroll: true }));

  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const bodyBounds = await body.boundingBox();
  const beforeAnchor = await trigger.boundingBox();
  const beforeTooltip = await tooltip.boundingBox();
  expect(bodyBounds).not.toBeNull();
  expect(beforeAnchor).not.toBeNull();
  expect(beforeTooltip).not.toBeNull();

  await body.evaluate((element) => {
    element.scrollTop += 12;
  });
  await expect.poll(async () => (await trigger.boundingBox())?.y).toBe(beforeAnchor!.y - 12);
  await expect.poll(async () => (await tooltip.boundingBox())?.y).toBe(beforeTooltip!.y - 12);

  const afterAnchor = await trigger.boundingBox();
  const afterTooltip = await tooltip.boundingBox();
  expect(afterAnchor).not.toBeNull();
  expect(afterTooltip).not.toBeNull();
  expect(afterTooltip!.y - beforeTooltip!.y).toBe(afterAnchor!.y - beforeAnchor!.y);
  expect(afterTooltip!.y).toBeLessThan(bodyBounds!.y);
  expect(
    await tooltip.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const hit = element.ownerDocument.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
      return hit !== null && element.contains(hit);
    }),
  ).toBe(true);
});

test("Dialog blocks Escape when configured and remains closeable", async ({ page }) => {
  await page.goto("/iframe.html?id=components-dialog--escape-disabled&viewMode=story");
  await page.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm the changes?" });
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Open dialog" })).toBeFocused();
});

test("Dialog backdrop dismissal is opt-in and closes when enabled", async ({ page }) => {
  await page.goto("/iframe.html?id=components-dialog--backdrop-dismissal&viewMode=story");

  await page.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm the changes?" });
  await expect(dialog).toBeVisible();
  await page.mouse.click(8, 8);
  await expect(dialog).not.toBeVisible();
});

test("Dialog fits a narrow viewport and keeps nested Luna theme tokens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-dialog--theme-coverage&viewMode=story");
  await page.getByRole("button", { name: "Open dialog" }).click();

  const lunaDialog = page.getByRole("dialog", { name: "Confirm the changes?" });
  await expect(lunaDialog).toBeVisible();
  const bounds = await lunaDialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);

  const lunaSurface = await lunaDialog.evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.goto("/iframe.html?id=components-dialog--initially-open&viewMode=story");
  const defaultDialog = page.getByRole("dialog", { name: "Confirm the changes?" });
  await expect(defaultDialog).toBeVisible();
  const defaultSurface = await defaultDialog.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(lunaSurface).not.toBe(defaultSurface);

  await page.goto("/iframe.html?id=components-dialog--custom-hooks&viewMode=story");
  await page.getByRole("button", { name: "Open dialog" }).click();
  const customDialog = page.getByRole("dialog", { name: "Confirm the changes?" });
  await expect(customDialog).toBeVisible();
  await expect.poll(() => customDialog.evaluate((element) =>
    getComputedStyle(element).borderTopLeftRadius,
  )).toBe("24px");
});
