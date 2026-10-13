import { expect, test } from "@playwright/test";

test("Gallery adapts its columns to viewport width without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/iframe.html?id=components-gallery--playground&viewMode=story");

  const region = page.getByRole("region", { name: "Studio portfolio" });
  await expect(region).toBeVisible();
  const list = region.getByRole("list");
  await expect(list.getByRole("listitem")).toHaveCount(6);

  const countColumns = () =>
    list.evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length);
  expect(await countColumns()).toBe(3);

  await page.setViewportSize({ width: 680, height: 900 });
  await expect.poll(countColumns).toBe(2);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(countColumns).toBe(2);
  const dimensions = await region.evaluate((element) => ({
    content: element.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test("Gallery lightbox supports navigation, Escape, and focus restoration", async ({ page }) => {
  await page.goto("/iframe.html?id=components-gallery--portfolio-with-lightbox&viewMode=story");

  const trigger = page.getByRole("button", {
    name: "Open image 1: A bright sunroom with soft green plants and warm morning light.",
  });
  await trigger.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Sunroom refresh" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View sunroom project" })).toHaveAttribute(
    "href",
    "/projects/sunroom",
  );

  await dialog.getByRole("button", { name: "Next image" }).click();
  await expect(dialog.getByRole("heading", { name: "Terracotta kitchen" })).toBeVisible();
  await expect(dialog.getByText("2 of 6")).toBeVisible();
  await dialog.getByRole("button", { name: "Previous image" }).click();
  await expect(dialog.getByRole("heading", { name: "Sunroom refresh" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("Gallery empty state is visible and does not render an empty list", async ({ page }) => {
  await page.goto("/iframe.html?id=components-gallery--empty-state&viewMode=story");

  const region = page.getByRole("region", { name: "Recent projects" });
  await expect(region).toContainText("New project photos will appear here soon.");
  await expect(region.getByRole("list")).toHaveCount(0);
});

test("Gallery theme coverage preserves surface radii and scoped hooks", async ({ page }) => {
  await page.goto("/iframe.html?id=components-gallery--theme-coverage&viewMode=story");

  const galleries = page.locator('[data-ds-theme] [aria-label$="project gallery"]');
  await expect(galleries).toHaveCount(3);
  const luna = galleries.nth(1);
  const lunaFrame = luna.locator('[data-variant="framed"]').first();
  await expect(lunaFrame).toBeVisible();
  expect(await lunaFrame.evaluate((element) => getComputedStyle(element).borderRadius)).toBe("32px");
});
