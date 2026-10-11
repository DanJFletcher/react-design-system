import { expect, test } from "@playwright/test";

test("PricingDetails is a named article with price, details, and native actions", async ({ page }) => {
  await page.goto("/iframe.html?id=components-pricing-details--playground&viewMode=story");

  const pricing = page.getByRole("article", { name: "Professional" });
  await expect(pricing).toBeVisible();
  await expect(pricing.getByRole("heading", { name: "Professional", level: 2 })).toBeVisible();
  await expect(pricing.getByText("39")).toBeVisible();
  await expect(pricing.getByText("Priority")).toBeVisible();
  await expect(pricing.getByRole("button", { name: "Start 14-day trial" })).toBeVisible();
});

test("Split pricing details stack on mobile and sit side by side on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-pricing-details--layout-examples&viewMode=story");

  const pricing = page.locator("article[data-layout='split']");
  const mobilePosition = await pricing.evaluate((element) => {
    const main = element.querySelector<HTMLElement>('[data-slot="main"]');
    const details = element.querySelector<HTMLElement>('[data-slot="details"]');
    return {
      mainBottom: main?.getBoundingClientRect().bottom,
      detailsTop: details?.getBoundingClientRect().top,
      columns: getComputedStyle(element).gridTemplateColumns.split(" ").length,
    };
  });
  expect(mobilePosition.columns).toBe(1);
  expect(mobilePosition.detailsTop).toBeGreaterThanOrEqual(mobilePosition.mainBottom!);

  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopPosition = await pricing.evaluate((element) => {
    const main = element.querySelector<HTMLElement>('[data-slot="main"]');
    const details = element.querySelector<HTMLElement>('[data-slot="details"]');
    return {
      mainLeft: main?.getBoundingClientRect().left,
      detailsLeft: details?.getBoundingClientRect().left,
      columns: getComputedStyle(element).gridTemplateColumns.split(" ").length,
    };
  });
  expect(desktopPosition.columns).toBe(2);
  expect(desktopPosition.detailsLeft).toBeGreaterThan(desktopPosition.mainLeft!);
});

test("PricingDetails follows theme tokens and scoped component hooks", async ({ page }) => {
  await page.goto("/iframe.html?id=components-pricing-details--theme-coverage&viewMode=story");

  const acmePricing = page.locator('[data-ds-theme="acme"] > article');
  const lunaPricing = page.locator('[data-ds-theme="luna"] > article');
  const acmeSurface = await acmePricing.evaluate((element) => getComputedStyle(element).backgroundColor);
  const lunaSurface = await lunaPricing.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(lunaSurface).not.toBe(acmeSurface);

  await page.goto("/iframe.html?id=components-pricing-details--custom-hook-overrides&viewMode=story");
  const pricing = page.locator("article[data-variant='featured']");
  await expect(pricing).toHaveCSS("border-top-left-radius", "24px");
});
