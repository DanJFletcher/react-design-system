import { expect, test } from "@playwright/test";

test("EmptyState action content remains visible without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-empty-state--playground&viewMode=story");

  const region = page.getByRole("region", { name: "No pages yet" });
  const primaryAction = page.getByRole("button", { name: "Create a page" });
  const secondaryAction = page.getByRole("button", { name: "Browse templates" });
  await expect(region).toBeVisible();
  await expect(primaryAction).toBeVisible();
  await expect(secondaryAction).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
});

test("EmptyState full layout fills its explicitly sized parent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-empty-state--full-page&viewMode=story");

  const container = page.getByTestId("empty-state-full-page-container");
  const region = page.getByRole("region", { name: "Nothing to review" });
  await expect(region).toBeVisible();

  const parentBox = await container.boundingBox();
  const regionBox = await region.boundingBox();
  expect(parentBox).not.toBeNull();
  expect(regionBox).not.toBeNull();
  expect(regionBox!.height).toBeGreaterThanOrEqual(parentBox!.height);
});
