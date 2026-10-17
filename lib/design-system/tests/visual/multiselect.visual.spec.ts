import { expect, test } from "@playwright/test";

test("MultiSelect keeps themed controls readable and selected tags usable", async ({ page }) => {
  await page.goto("/iframe.html?id=components-multiselect--validation-disabled-and-themes&viewMode=story");

  for (const theme of ["acme", "luna", "orchid", "atom", "sublime"]) {
    const input = page.getByRole("combobox", { name: `${theme} topics` });
    await expect(input).toBeVisible();
    const radius = await input.evaluate((element) => getComputedStyle(element.parentElement!).borderRadius);
    expect(radius).not.toBe("0px");
    await expect(page.getByRole("button", { name: "Remove Design systems" }).nth(
      ["acme", "luna", "orchid", "atom", "sublime"].indexOf(theme),
    )).toBeVisible();
  }
});

test("MultiSelect wraps selected values and keeps the popup inside a narrow viewport", async ({ page }) => {
  await page.goto("/iframe.html?id=components-multiselect--narrow-long-options&viewMode=story");
  await page.setViewportSize({ width: 320, height: 720 });

  const input = page.getByRole("combobox", { name: "Choose article topics" });
  await input.focus();
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  const listboxBounds = await listbox.boundingBox();
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(listboxBounds).not.toBeNull();
  expect(listboxBounds!.x).toBeGreaterThanOrEqual(0);
  expect(listboxBounds!.x + listboxBounds!.width).toBeLessThanOrEqual(viewportWidth);

  await page.getByRole("option", { name: "Editorial design systems and component libraries" }).click();
  await page.getByRole("option", { name: "Accessible interaction and inclusive content" }).click();
  await expect(page.getByRole("button", { name: "Remove Editorial design systems and component libraries" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove Accessible interaction and inclusive content" })).toBeVisible();
  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(viewportWidth);
});
