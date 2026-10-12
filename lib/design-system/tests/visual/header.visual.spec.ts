import { expect, test } from "@playwright/test";

const playgroundUrl = "/iframe.html?id=components-header--playground&viewMode=story";

test("Header mobile navigation opens and closes accessibly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(playgroundUrl);

  const menuButton = page.locator("button[aria-controls]");
  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
    includeHidden: true,
  });

  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton.locator('[data-icon="menu"]')).toBeVisible();
  await expect(navigation).not.toBeVisible();

  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(menuButton.locator('[data-icon="close"]')).toBeVisible();
  await expect(navigation).toBeVisible();
  await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton.locator('[data-icon="menu"]')).toBeVisible();
  await expect(menuButton).toBeFocused();
  await expect(navigation).not.toBeVisible();

  await menuButton.click();
  await page.getByRole("link", { name: "Pricing" }).click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton.locator('[data-icon="menu"]')).toBeVisible();
  await expect(navigation).not.toBeVisible();
});

test("Header size examples use the three documented minimum heights", async ({ page }) => {
  await page.goto("/iframe.html?id=components-header--height-examples&viewMode=story");

  const headers = page.locator("header[data-size]");
  await expect(headers).toHaveCount(3);
  await expect(headers.nth(0)).toHaveAttribute("data-size", "sm");
  await expect(headers.nth(1)).toHaveAttribute("data-size", "md");
  await expect(headers.nth(2)).toHaveAttribute("data-size", "lg");
  await expect.poll(async () => headers.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.getBoundingClientRect().height)),
  )).toEqual([48, 64, 80]);
});

test("Header can stick without a bottom border", async ({ page }) => {
  await page.goto("/iframe.html?id=components-header--sticky-without-border&viewMode=story");

  const header = page.locator("header[data-size]");
  await expect(header).toHaveCSS("position", "sticky");
  await expect(header).toHaveCSS("border-block-end-width", "0px");
  await expect.poll(async () => Math.round(await header.evaluate((element) =>
    element.getBoundingClientRect().height,
  ))).toBe(80);
});
