import { expect, test } from "@playwright/test";

test("MediaLibrary toolbar changes from one column at 32rem to two above it", async ({ page }) => {
  await page.setViewportSize({ width: 512, height: 900 });
  await page.goto("/iframe.html?id=components-media-library--playground&viewMode=story");

  const search = page.getByRole("searchbox", { name: "Search media" });
  const filter = page.getByRole("combobox", { name: "Media type" });
  await expect(search).toBeVisible();
  await expect(filter).toBeVisible();

  const topOffset = async () => {
    const searchTop = (await search.boundingBox())!.y;
    const filterTop = (await filter.boundingBox())!.y;
    return filterTop - searchTop;
  };

  await expect.poll(topOffset).toBeGreaterThan(0);
  await page.setViewportSize({ width: 513, height: 900 });
  await expect.poll(topOffset).toBe(0);
});
