import { expect, test } from "@playwright/test";

test("Tooltip relates its trigger, opens on focus and hover, and dismisses with Escape", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tooltip--playground&viewMode=story");
  const trigger = page.getByRole("button", { name: "More information" });
  const tooltip = page.locator('[role="tooltip"]');
  const descriptionId = await trigger.getAttribute("aria-describedby");
  expect(descriptionId).toContain(await tooltip.getAttribute("id"));

  await trigger.focus();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.blur();

  await trigger.hover();
  await expect(tooltip).toBeVisible();
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(tooltip).toBeHidden();
});

test("Tooltip flips and stays within a narrow viewport, including with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=components-tooltip--viewport-edge&viewMode=story");

  const trigger = page.getByRole("button", { name: "Near the viewport edge" });
  await trigger.hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveAttribute("data-side", "bottom");
  const bounds = await tooltip.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(568);
  await expect.poll(() => tooltip.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
});

test("Tooltip follows ACME, Luna, and Orchid colors through nested theme boundaries", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tooltip--theme-coverage&viewMode=story");
  const colors: string[] = [];
  for (const theme of ["ACME", "Luna", "Orchid"]) {
    const trigger = page.getByRole("button", { name: `${theme} tooltip` });
    await trigger.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    colors.push(await tooltip.evaluate((element) => getComputedStyle(element).backgroundColor));
    await page.mouse.move(0, 0);
    await expect(tooltip).toBeHidden();
  }
  expect(new Set(colors).size).toBe(3);
});

test("Touch users can open and dismiss a tooltip without hover", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 720 },
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:6007/iframe.html?id=components-tooltip--playground&viewMode=story");
    const trigger = page.getByRole("button", { name: "More information" });
    await trigger.tap();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await page.touchscreen.tap(380, 700);
    await expect(tooltip).toBeHidden();
  } finally {
    await context.close();
  }
});
