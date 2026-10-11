import { expect, test } from "@playwright/test";

test("Card remains a named article with independent native actions", async ({ page }) => {
  await page.goto("/iframe.html?id=components-card--playground&viewMode=story");

  const card = page.getByRole("article", { name: "Design project overview" });
  await expect(card).toBeVisible();
  await expect(card.getByRole("heading", {
    name: "Design project overview",
    level: 2,
  })).toBeVisible();
  await expect(card.getByRole("button", { name: "Open card" })).toBeVisible();
  await expect(card).not.toHaveAttribute("role", "button");
  await expect(card.locator('[data-slot="media"]')).toBeVisible();
});

test("Horizontal cards stack on mobile and place media on the configured desktop side", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-card--layout-examples&viewMode=story");

  const horizontalCards = page.locator("article[data-layout='horizontal']");
  await expect(horizontalCards).toHaveCount(2);

  const mobilePositions = await Promise.all([0, 1].map(async (index) =>
    horizontalCards.nth(index).evaluate((element) => {
      const content = element.querySelector<HTMLElement>('[data-slot="content"]');
      const media = element.querySelector<HTMLElement>('[data-slot="media"]');
      return {
        contentTop: content?.getBoundingClientRect().top,
        mediaTop: media?.getBoundingClientRect().top,
      };
    }),
  ));
  expect(mobilePositions[0].mediaTop).toBeLessThan(mobilePositions[0].contentTop!);
  expect(mobilePositions[1].contentTop).toBeLessThan(mobilePositions[1].mediaTop!);

  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopPositions = await Promise.all([0, 1].map(async (index) =>
    horizontalCards.nth(index).evaluate((element) => {
      const content = element.querySelector<HTMLElement>('[data-slot="content"]');
      const media = element.querySelector<HTMLElement>('[data-slot="media"]');
      return {
        contentLeft: content?.getBoundingClientRect().left,
        mediaLeft: media?.getBoundingClientRect().left,
        columns: getComputedStyle(element).gridTemplateColumns.split(" ").length,
      };
    }),
  ));
  expect(desktopPositions[0].columns).toBe(2);
  expect(desktopPositions[0].mediaLeft).toBeLessThan(desktopPositions[0].contentLeft!);
  expect(desktopPositions[1].columns).toBe(2);
  expect(desktopPositions[1].mediaLeft).toBeGreaterThan(desktopPositions[1].contentLeft!);
});

test("Card variants follow theme colors and scoped radius hooks", async ({ page }) => {
  await page.goto("/iframe.html?id=components-card--theme-coverage&viewMode=story");

  const acmeCard = page.locator('[data-ds-theme="acme"] > article');
  const lunaCard = page.locator('[data-ds-theme="luna"] > article');
  const acmeSurface = await acmeCard.evaluate((element) => getComputedStyle(element).backgroundColor);
  const lunaSurface = await lunaCard.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(lunaSurface).not.toBe(acmeSurface);

  await page.goto("/iframe.html?id=components-card--custom-hook-overrides&viewMode=story");
  const card = page.locator("article[data-variant='surface']");
  await expect(card).toHaveCSS("border-top-left-radius", "24px");
  await expect(card.locator('[data-slot="media"]')).toHaveCSS("border-top-left-radius", "12px");
});
