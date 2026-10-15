import { expect, test } from "@playwright/test";

test("Combobox follows themes and keeps its option list inside a narrow viewport", async ({ page }) => {
  await page.goto("/iframe.html?id=components-combobox--theme-coverage&viewMode=story");

  const inputs = page.getByRole("combobox");
  await expect(inputs).toHaveCount(5);
  const cornerRadii = await inputs.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element.parentElement!).borderRadius),
  );
  expect(cornerRadii.every((radius) => radius !== "0px")).toBe(true);

  await page.goto("/iframe.html?id=components-combobox--narrow-long-options&viewMode=story");
  await page.setViewportSize({ width: 390, height: 720 });
  const input = page.getByRole("combobox", { name: "Choose a service area" });
  await input.focus();

  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(2);
  const listboxBounds = await listbox.boundingBox();
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(listboxBounds).not.toBeNull();
  expect(listboxBounds!.x).toBeGreaterThanOrEqual(0);
  expect(listboxBounds!.x + listboxBounds!.width).toBeLessThanOrEqual(viewportWidth);
  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(viewportWidth);
});
