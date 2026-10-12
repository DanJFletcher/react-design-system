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
