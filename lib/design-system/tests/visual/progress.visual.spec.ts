import { expect, test } from "@playwright/test";

test("Determinate Progress exposes its visible label and normalized ARIA value", async ({ page }) => {
  await page.goto("/iframe.html?id=components-progress--playground&viewMode=story");

  const progress = page.getByRole("progressbar", { name: "Uploading project assets" });
  await expect(progress).toHaveAttribute("aria-valuemin", "0");
  await expect(progress).toHaveAttribute("aria-valuemax", "100");
  await expect(progress).toHaveAttribute("aria-valuenow", "62");
  await expect(page.getByText("62%", { exact: true })).toBeVisible();
  await expect(progress).not.toHaveAttribute("aria-live");
});

test("Indeterminate Progress omits aria-valuenow and respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/iframe.html?id=components-progress--indeterminate&viewMode=story");

  const progress = page.getByRole("progressbar", { name: "Saving changes" });
  await expect(progress).not.toHaveAttribute("aria-valuenow");
  await expect(progress).toHaveAttribute("aria-valuetext", "Working…");
  await expect(page.getByText("Working…", { exact: true })).toBeVisible();

  const indicator = progress.locator(":scope > span");
  await expect.poll(() => indicator.evaluate((element) => getComputedStyle(element).animationName))
    .not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => indicator.evaluate((element) => getComputedStyle(element).animationName))
    .toBe("none");
});

test("Custom scales, value text, hidden values, and clamping preserve progress semantics", async ({ page }) => {
  await page.goto("/iframe.html?id=components-progress--custom-scale&viewMode=story");
  const customScale = page.getByRole("progressbar", { name: "Deployment stages" });
  await expect(customScale).toHaveAttribute("aria-valuemax", "8");
  await expect(customScale).toHaveAttribute("aria-valuenow", "3");
  await expect(customScale).toHaveAttribute("aria-valuetext", "3 of 8 completed");
  await expect(page.getByText("3 of 8 completed", { exact: true })).toBeVisible();

  await page.goto("/iframe.html?id=components-progress--clamped-values&viewMode=story");
  const below = page.getByRole("progressbar", { name: "Below range" });
  const above = page.getByRole("progressbar", { name: "Above range" });
  await expect(below).toHaveAttribute("aria-valuenow", "0");
  await expect(above).toHaveAttribute("aria-valuenow", "100");
  await expect.poll(() => below.locator(":scope > span")
    .evaluate((element) => (element as HTMLElement).style.inlineSize)).toBe("0%");
  await expect.poll(() => above.locator(":scope > span")
    .evaluate((element) => (element as HTMLElement).style.inlineSize)).toBe("100%");

  await page.goto("/iframe.html?id=components-progress--hidden-value&viewMode=story");
  const hiddenValue = page.getByRole("progressbar", { name: "Processing records" });
  await expect(hiddenValue).toHaveAttribute("aria-valuenow", "46");
  await expect(page.getByText("46%", { exact: true })).toHaveCount(0);
});

test("Progress forwards descriptions and uses the active theme colors", async ({ page }) => {
  await page.goto("/iframe.html?id=components-progress--described-by&viewMode=story");
  const described = page.getByRole("progressbar", { name: "Uploading archive" });
  await expect(described).toHaveAttribute("aria-describedby", "upload-help");
  await expect(page.locator("#upload-help")).toBeVisible();

  await page.goto("/iframe.html?id=components-progress--theme-coverage&viewMode=story");
  const progressBars = page.locator("[data-ds-theme] [role='progressbar']");
  await expect(progressBars).toHaveCount(5);
  const indicatorColors = await progressBars.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element.firstElementChild!).backgroundColor),
  );
  expect(indicatorColors[0]).not.toBe(indicatorColors[1]);
});

test("Progress styling hooks are scoped and long labels fit narrow layouts", async ({ page }) => {
  await page.goto("/iframe.html?id=components-progress--custom-hooks&viewMode=story");
  const custom = page.getByRole("progressbar", { name: "Custom themed progress" });
  const indicator = custom.locator(":scope > span");
  const styles = await Promise.all([
    custom.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        height: computed.height,
        track: computed.backgroundColor,
        radius: computed.borderRadius,
      };
    }),
    indicator.evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  expect(styles[0]!.height).toBe("12px");
  expect(styles[0]!.radius).toBe("9999px");
  expect(styles[0]!.track).not.toBe("rgb(219, 234, 254)");
  expect(styles[1]).not.toBe(styles[0]!.track);

  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto("/iframe.html?id=components-progress--long-label&viewMode=story");
  const longProgress = page.getByRole("progressbar", {
    name: "Preparing a complete archive of all project assets and verifying every selected item",
  });
  await expect(longProgress).toBeVisible();
  const dimensions = await longProgress.evaluate((element) => ({
    width: element.clientWidth,
    contentWidth: element.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.width);
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});
