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

test("Tooltip escapes transformed and clipped panels", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tooltip--transformed-clipped-panel&viewMode=story");
  const panel = page.getByTestId("transformed-clipped-panel");
  const trigger = page.getByRole("button", { name: "Panel help" });
  await trigger.hover();

  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const panelBounds = await panel.boundingBox();
  const tooltipBounds = await tooltip.boundingBox();
  expect(panelBounds).not.toBeNull();
  expect(tooltipBounds).not.toBeNull();
  expect(tooltipBounds!.y).toBeLessThan(panelBounds!.y);
  expect(
    await tooltip.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      return hit !== null && element.contains(hit);
    }),
  ).toBe(true);
});

test("Tooltip keeps local style-hook overrides in the top layer", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tooltip--custom-hooks&viewMode=story");
  await page.getByRole("button", { name: "Custom tooltip" }).hover();

  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const styles = await tooltip.evaluate((element) => {
    const tooltipStyle = getComputedStyle(element);
    const rootStyle = getComputedStyle(element.parentElement!);
    return {
      surfaceOverride: tooltipStyle.getPropertyValue("--ds-tooltip-surface").trim(),
      inheritedSurfaceOverride: rootStyle.getPropertyValue("--ds-tooltip-surface").trim(),
      radiusOverride: tooltipStyle.getPropertyValue("--ds-tooltip-radius").trim(),
      inheritedRadiusOverride: rootStyle.getPropertyValue("--ds-tooltip-radius").trim(),
    };
  });
  expect(styles.surfaceOverride).toBe(styles.inheritedSurfaceOverride);
  expect(styles.radiusOverride).toBe(styles.inheritedRadiusOverride);
});

test("Tooltip tracks its trigger while a scrollable panel moves it past the panel edge", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tooltip--scrollable-panel&viewMode=story");
  const panel = page.getByTestId("scrollable-panel");
  const trigger = page.getByRole("button", { name: "Scrollable help" });
  await panel.evaluate((element) => {
    element.scrollTop = 170;
  });
  await trigger.focus();

  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const panelBounds = await panel.boundingBox();
  const before = await tooltip.boundingBox();
  expect(panelBounds).not.toBeNull();
  expect(before).not.toBeNull();
  expect(before!.y).toBeLessThan(panelBounds!.y);

  await panel.evaluate((element) => {
    element.scrollTop += 24;
  });
  await expect.poll(async () => (await tooltip.boundingBox())?.y).toBe(before!.y - 24);
  expect(
    await tooltip.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      return hit !== null && element.contains(hit);
    }),
  ).toBe(true);
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
