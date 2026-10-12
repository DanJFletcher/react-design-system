import { expect, test } from "@playwright/test";

test("Toast announces status, dismisses manually, and auto-dismisses", async ({ page }) => {
  await page.goto("/iframe.html?id=components-toast--playground&viewMode=story");
  await page.getByRole("button", { name: "Show toast" }).click();

  const toast = page.getByRole("status");
  await expect(toast).toContainText("Changes saved");
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(toast).not.toBeVisible();

  await page.goto("/iframe.html?id=components-toast--auto-dismiss&viewMode=story");
  await page.getByRole("button", { name: "Show toast" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByRole("status")).not.toBeVisible({ timeout: 3000 });
});

test("Toast timer pauses while hovered and resumes after pointer exit", async ({ page }) => {
  await page.goto("/iframe.html?id=components-toast--auto-dismiss&viewMode=story");
  await page.getByRole("button", { name: "Show toast" }).click();

  const toast = page.getByRole("status");
  const bounds = await toast.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.waitForTimeout(700);
  await expect(toast).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(toast).not.toBeVisible({ timeout: 3000 });
});

test("Toast uses assertive semantics for errors and promotes queued notifications", async ({ page }) => {
  await page.goto("/iframe.html?id=components-toast--variants&viewMode=story");
  await page.getByRole("button", { name: "Show error" }).click();
  await expect(page.getByRole("alert")).toContainText("Error notification");

  await page.goto("/iframe.html?id=components-toast--queue&viewMode=story");
  const addButton = page.getByRole("button", { name: "Add notification" });
  await addButton.click();
  await addButton.click();
  await addButton.click();
  await expect(page.getByRole("region", { name: "Notifications" }).getByRole("status")).toHaveCount(2);
  await page.getByRole("button", { name: "Dismiss notification" }).first().click();
  await expect(page.getByRole("status").filter({ hasText: "Queued notification 3" })).toBeVisible();
});

test("Toast fits a narrow viewport and inherits the Luna theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-toast--theme-coverage&viewMode=story");
  await page.getByRole("button", { name: "Show toast" }).click();

  const toast = page.getByRole("status");
  await expect(toast).toBeVisible();
  const bounds = await toast.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  const lunaSurface = await toast.evaluate((element) => getComputedStyle(element).backgroundColor);

  await page.goto("/iframe.html?id=components-toast--playground&viewMode=story");
  await page.getByRole("button", { name: "Show toast" }).click();
  const defaultSurface = await page.getByRole("status").evaluate((element) =>
    getComputedStyle(element).backgroundColor,
  );
  expect(lunaSurface).not.toBe(defaultSurface);
});
