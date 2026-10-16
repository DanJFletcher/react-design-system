import { expect, test } from "@playwright/test";

test("CodeBlock scrolls long source within a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-code-block--long-lines&viewMode=story");

  const figure = page.getByRole("figure", { name: "long-lines.ts, typescript" });
  const pre = figure.locator("pre");
  await expect(figure).toBeVisible();
  await expect(pre).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);

  const dimensions = await pre.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
});

test("CodeBlock shows a visible focus indicator", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/iframe.html?id=components-code-block--playground&viewMode=story");

  const figure = page.getByRole("figure", { name: "service.tsx, tsx" });
  const pre = figure.locator("pre");
  await pre.focus();
  await expect(pre).toBeFocused();
  const outlineWidth = await pre.evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(Number.parseFloat(outlineWidth)).toBeGreaterThan(0);
});
