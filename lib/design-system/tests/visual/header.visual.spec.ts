import { expect, test } from "@playwright/test";

const playgroundUrl = "/iframe.html?id=components-header--playground&viewMode=story";

test("Header mobile navigation opens and closes accessibly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(playgroundUrl);

  const mobileNavigationRegion = page.locator("[data-responsive-navigation] nav");
  const menuButton = page.locator("[data-responsive-navigation] > button[aria-controls]");

  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton.locator('[data-icon="menu"]')).toBeVisible();
  await expect(mobileNavigationRegion).not.toBeVisible();

  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(menuButton.locator('[data-icon="close"]')).toBeVisible();
  await expect(mobileNavigationRegion).toBeVisible();
  await expect(mobileNavigationRegion).toHaveAttribute("aria-label", "Primary navigation");
  await expect(mobileNavigationRegion).not.toHaveAttribute("role", "menu");
  await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton.locator('[data-icon="menu"]')).toBeVisible();
  await expect(menuButton).toBeFocused();
  await expect(mobileNavigationRegion).not.toBeVisible();

  await menuButton.click();
  await page.getByRole("link", { name: "Pricing" }).click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton.locator('[data-icon="menu"]')).toBeVisible();
  await expect(mobileNavigationRegion).not.toBeVisible();
});

test("Header custom mobile navigation receives controlled state and CTA", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-header--custom-mobile-navigation&viewMode=story");

  const trigger = page.getByRole("button", { name: "Open custom navigation" });
  await trigger.click();
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation).toBeVisible();
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();
  await page.getByRole("link", { name: "Pricing" }).click();
  await expect(navigation).not.toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("Header default Menu becomes inline navigation on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(playgroundUrl);

  const menuTrigger = page.locator("[data-responsive-navigation] > button");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });

  await expect(menuTrigger).toBeHidden();
  await expect(navigation).toBeVisible();
  await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();
  await expect(navigation).not.toHaveAttribute("aria-hidden", "true");
  await expect(navigation).not.toHaveAttribute("inert");
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
