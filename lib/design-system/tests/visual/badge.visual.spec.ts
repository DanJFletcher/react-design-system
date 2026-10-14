import { expect, test } from "@playwright/test";

test("Badge is static, readable content with decorative indicators", async ({ page }) => {
  await page.goto("/iframe.html?id=components-badge--playground&viewMode=story");

  const badge = page.locator('span[data-tone="success"][data-size="md"]');
  await expect(badge).toHaveText("Published");
  await expect(badge).not.toHaveAttribute("role");
  await expect(badge).not.toHaveAttribute("aria-live");
  await expect(badge.locator('[aria-hidden="true"]')).toHaveCount(0);

  await page.goto("/iframe.html?id=components-badge--icon-and-dot-indicators&viewMode=story");
  const failedBadge = page.getByText("Failed", { exact: true }).locator("xpath=..");
  await expect(failedBadge).toHaveAttribute("data-tone", "error");
  await expect(failedBadge.locator(":scope > [aria-hidden='true']")).toHaveCount(2);
});

test("Every Badge tone maintains readable text contrast across built-in themes", async ({ page }) => {
  await page.goto("/iframe.html?id=components-badge--theme-coverage&viewMode=story");

  const themeBadges = page.locator('section[data-ds-theme] span[data-tone]');
  await expect(themeBadges).toHaveCount(25);
  const ratios = await themeBadges.evaluateAll((elements) => {
    const parseColor = (value: string): [number, number, number] => {
      const channels = value.match(/\d+(?:\.\d+)?/g)!.map(Number);
      return [channels[0]!, channels[1]!, channels[2]!];
    };
    const luminance = (color: [number, number, number]) => {
      const channels = color.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
    };

    return elements.map((element) => {
      const styles = getComputedStyle(element);
      const foreground = luminance(parseColor(styles.color));
      const background = luminance(parseColor(styles.backgroundColor));
      const [lighter, darker] = foreground > background
        ? [foreground, background]
        : [background, foreground];
      return (lighter + 0.05) / (darker + 0.05);
    });
  });

  expect(ratios).toHaveLength(25);
  expect(ratios.every((ratio) => ratio >= 4.5)).toBe(true);
});

test("Badge exposes the requested shape and size options", async ({ page }) => {
  await page.goto("/iframe.html?id=components-badge--size-and-shape-examples&viewMode=story");

  const rounded = page.getByText("Rounded · sm", { exact: true }).locator("xpath=..");
  const square = page.getByText("Square · sm", { exact: true }).locator("xpath=..");
  const pill = page.getByText("Pill · sm", { exact: true }).locator("xpath=..");
  await expect(rounded).toHaveAttribute("data-shape", "rounded");
  await expect(square).toHaveAttribute("data-shape", "square");
  await expect(pill).toHaveAttribute("data-shape", "pill");
  await expect(rounded).toHaveCSS("border-radius", "12px");
  await expect(square).toHaveCSS("border-radius", "0px");
  await expect(pill).toHaveCSS("border-radius", "9999px");

  const smallFontSize = await page.getByText("Rounded · sm", { exact: true })
    .locator("xpath=..")
    .evaluate((element) => getComputedStyle(element).fontSize);
  const largeFontSize = await page.getByText("Rounded · lg", { exact: true })
    .locator("xpath=..")
    .evaluate((element) => getComputedStyle(element).fontSize);
  expect(Number.parseFloat(largeFontSize)).toBeGreaterThan(Number.parseFloat(smallFontSize));
});

test("Nested theme boundaries change the Badge palette without changing its markup", async ({ page }) => {
  await page.goto("/iframe.html?id=components-badge--nested-theme-boundary&viewMode=story");

  const acmeBadge = page.getByText("ACME status", { exact: true }).locator("xpath=..");
  const lunaBadge = page.getByText("Luna status", { exact: true }).locator("xpath=..");
  await expect(acmeBadge).toHaveAttribute("data-tone", "success");
  await expect(lunaBadge).toHaveAttribute("data-tone", "success");

  const acmeBackground = await acmeBadge.evaluate((element) => getComputedStyle(element).backgroundColor);
  const lunaBackground = await lunaBadge.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(acmeBackground).not.toBe(lunaBackground);
});

test("Long Badge labels wrap inside narrow layouts", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/iframe.html?id=components-badge--long-label&viewMode=story");

  const badge = page.locator('span[data-tone="warning"]');
  const dimensions = await badge.evaluate((element) => {
    const parent = element.parentElement!.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    return {
      parentRight: parent.right,
      badgeRight: bounds.right,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    };
  });

  expect(dimensions.badgeRight).toBeLessThanOrEqual(dimensions.parentRight + 1);
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
