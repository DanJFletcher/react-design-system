import { expect, test } from "@playwright/test";

const iconNames = [
  "arrow-left",
  "arrow-right",
  "book",
  "check",
  "chevron-left",
  "chevron-down",
  "chevron-right",
  "circle-check",
  "circle-close",
  "circle-info",
  "close",
  "folder",
  "grid",
  "heart",
  "list",
  "menu",
  "moon",
  "pause",
  "play",
  "search",
  "settings",
  "sparkle",
  "triangle-alert",
];

test("Icon playground exposes the named icon select and decorative semantics", async ({ page }) => {
  await page.goto("/iframe.html?id=components-icon--playground&viewMode=story");

  const icon = page.locator('svg[data-icon="sparkle"]');
  await expect(icon).toBeVisible();
  await expect(icon).toHaveAttribute("aria-hidden", "true");
  await expect(icon).toHaveAttribute("data-size", "md");
  await expect(icon).toHaveCSS("width", "20px");
});

test("Icon catalog renders every built-in icon", async ({ page }) => {
  await page.goto("/iframe.html?id=components-icon--catalog&viewMode=story");

  const icons = page.locator("svg[data-icon]");
  await expect(icons).toHaveCount(iconNames.length);
  for (const name of iconNames) {
    await expect(page.locator(`svg[data-icon="${name}"]`)).toBeVisible();
  }
});

test("Icon sizes use the shared spacing scale", async ({ page }) => {
  await page.goto("/iframe.html?id=components-icon--sizes&viewMode=story");

  for (const [size, pixels] of [
    ["xs", "12px"],
    ["sm", "16px"],
    ["md", "20px"],
    ["lg", "24px"],
    ["xl", "32px"],
  ]) {
    await expect(page.locator(`svg[data-size="${size}"]`)).toHaveCSS("width", pixels);
  }
});

test("Icon distinguishes decorative from meaning-bearing SVGs", async ({ page }) => {
  await page.goto("/iframe.html?id=components-icon--accessibility&viewMode=story");

  const decorative = page.locator('svg[data-icon="sparkle"]');
  await expect(decorative).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("img", { name: "Search" })).toBeVisible();
});

test("Icon inherits colors across themes and nested theme boundaries", async ({ page }) => {
  await page.goto("/iframe.html?id=components-icon--theme-coverage&viewMode=story");

  const acmeIcon = page.locator(
    '.theme-story-stack > [data-ds-theme="acme"] svg[data-icon="sparkle"]',
  );
  const lunaIcon = page.locator(
    '.theme-story-stack > [data-ds-theme="luna"] svg[data-icon="sparkle"]',
  );
  const acmeColor = await acmeIcon.evaluate((element) => getComputedStyle(element).color);
  const lunaColor = await lunaIcon.evaluate((element) => getComputedStyle(element).color);
  expect(lunaColor).not.toBe(acmeColor);

  await page.goto("/iframe.html?id=components-icon--nested-theme-boundary&viewMode=story");
  const icons = page.locator('svg[data-icon="moon"]');
  await expect(icons).toHaveCount(2);
  const outerColor = await icons.nth(0).evaluate((element) => getComputedStyle(element).color);
  const innerColor = await icons.nth(1).evaluate((element) => getComputedStyle(element).color);
  expect(outerColor).not.toBe(innerColor);
});
