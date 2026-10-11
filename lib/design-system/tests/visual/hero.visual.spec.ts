import { expect, test } from "@playwright/test";

test("Hero is labeled and stacks on mobile while splitting on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-hero--playground&viewMode=story");

  const hero = page.locator("section[data-layout='split']");
  await expect(hero).toHaveAttribute("aria-labelledby", /\S+/);
  await expect(hero.getByRole("heading", {
    name: "Make room for your next big idea",
    level: 1,
  })).toBeVisible();
  await expect(hero.getByRole("button", { name: "Start for free" })).toBeVisible();

  const mobilePositions = await hero.evaluate((element) => {
    const content = element.querySelector<HTMLElement>('[data-slot="content"]');
    const media = element.querySelector<HTMLElement>('[data-slot="media"]');
    return {
      contentTop: content?.getBoundingClientRect().top,
      mediaTop: media?.getBoundingClientRect().top,
      columns: getComputedStyle(element.querySelector('[data-slot="inner"]')!).gridTemplateColumns
        .split(" ").length,
    };
  });
  expect(mobilePositions.contentTop).toBeLessThan(mobilePositions.mediaTop!);
  expect(mobilePositions.columns).toBe(1);

  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopPositions = await hero.evaluate((element) => {
    const content = element.querySelector<HTMLElement>('[data-slot="content"]');
    const media = element.querySelector<HTMLElement>('[data-slot="media"]');
    return {
      contentLeft: content?.getBoundingClientRect().left,
      mediaLeft: media?.getBoundingClientRect().left,
      columns: getComputedStyle(element.querySelector('[data-slot="inner"]')!).gridTemplateColumns
        .split(" ").length,
    };
  });
  expect(desktopPositions.columns).toBe(2);
  expect(desktopPositions.mediaLeft).toBeGreaterThan(desktopPositions.contentLeft!);
});

test("Hero uses theme colors and honors scoped component hooks", async ({ page }) => {
  await page.goto("/iframe.html?id=components-hero--theme-coverage&viewMode=story");

  const acmeHero = page.locator('[data-ds-theme="acme"] > section[data-background="surface"]');
  const lunaHero = page.locator('[data-ds-theme="luna"] > section[data-background="surface"]');
  const acmeSurface = await acmeHero.evaluate((element) => getComputedStyle(element).backgroundColor);
  const lunaSurface = await lunaHero.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(lunaSurface).not.toBe(acmeSurface);

  await page.goto("/iframe.html?id=components-hero--custom-hook-overrides&viewMode=story");
  const media = page.locator('section[data-background="surface"] [data-slot="media"]');
  await expect(media).toHaveCSS("border-top-left-radius", "24px");
});

test("Hero can use a semantic accent background and a text-only action slot", async ({ page }) => {
  await page.goto("/iframe.html?id=components-hero--text-only&viewMode=story");

  const hero = page.locator('section[data-background="accent"]');
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(hero.getByRole("button", { name: "Read the guide" })).toBeVisible();
  await expect(hero.locator('[data-slot="media"]')).toHaveCount(0);
});
