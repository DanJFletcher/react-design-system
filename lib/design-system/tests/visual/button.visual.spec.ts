import { expect, test } from "@playwright/test";

test("Button snapshots show the ACME, Luna, and Orchid themes", async ({ page }) => {
  const backgrounds: string[] = [];
  for (const theme of ["acme", "luna", "orchid"]) {
    await page.goto(`/iframe.html?id=components-button--primary&viewMode=story&globals=theme:${theme}`);
    const button = page.getByRole("button", { name: "Save changes" });
    await expect(button).toBeVisible();
    backgrounds.push(await button.evaluate((element) => getComputedStyle(element).backgroundColor));
    await expect(button).toHaveScreenshot(`button-${theme}-primary.png`, {
      animations: "disabled",
      caret: "hide",
    });
  }
  expect(new Set(backgrounds).size).toBe(3);
});

test("nested theme stories render each theme boundary", async ({ page }) => {
  await page.goto("/iframe.html?id=components-button--nested-themes&viewMode=story");
  await expect(page.getByRole("button", { name: "ACME default" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Nested Luna" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restored ACME" })).toBeVisible();
});
