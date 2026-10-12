import { expect, test } from "@playwright/test";

test("Heading levels preserve semantic HTML independently of visual size", async ({ page }) => {
  await page.goto("/iframe.html?id=components-typography--heading-levels&viewMode=story");

  for (const level of [1, 2, 3, 4, 5, 6]) {
    await expect(page.getByRole("heading", { name: `Heading level ${level}`, level })).toBeVisible();
  }

  const largeLevelThree = page.getByRole("heading", {
    name: "Level 3 with display size 5xl",
    level: 3,
  });
  await expect(largeLevelThree).toHaveAttribute("data-size", "5xl");
  await expect(largeLevelThree).toHaveCSS("font-size", "48px");
});

test("Text elements retain native markup and expose the selected typography tokens", async ({ page }) => {
  await page.goto("/iframe.html?id=components-typography--text-elements&viewMode=story");

  await expect(page.getByText("Paragraph text")).toHaveJSProperty("tagName", "P");
  await expect(page.getByText("Inline text")).toHaveJSProperty("tagName", "SPAN");
  await expect(page.getByText("Block text")).toHaveJSProperty("tagName", "DIV");

  await page.goto("/iframe.html?id=components-typography--playground&viewMode=story");
  const text = page.getByText("Readable type keeps content clear and consistent.");
  await expect(text).toHaveAttribute("data-size", "md");
  await expect(text).toHaveAttribute("data-weight", "regular");
  await expect(text).toHaveCSS("line-height", "24px");
});

test("Typography follows nested theme text colors", async ({ page }) => {
  await page.goto("/iframe.html?id=components-typography--theme-coverage&viewMode=story");

  const acme = page.locator('section[data-ds-theme="acme"]');
  const luna = page.locator('section[data-ds-theme="luna"]');
  const acmePrimary = acme.getByText("Primary text follows the active theme.");
  const lunaPrimary = luna.getByText("Primary text follows the active theme.");
  const lunaMuted = luna.getByText("Muted text follows the active theme.");

  const acmeColor = await acmePrimary.evaluate((element) => getComputedStyle(element).color);
  const lunaColor = await lunaPrimary.evaluate((element) => getComputedStyle(element).color);
  const lunaMutedColor = await lunaMuted.evaluate((element) => getComputedStyle(element).color);
  expect(lunaColor).not.toBe(acmeColor);
  expect(lunaMutedColor).not.toBe(lunaColor);

  await page.goto("/iframe.html?id=components-typography--nested-theme-boundary&viewMode=story");
  const nestedHeading = page.getByRole("heading", { name: "Nested Luna heading" });
  const outerText = page.getByText("ACME parent text");
  expect(
    await nestedHeading.evaluate((element) => getComputedStyle(element).color),
  ).not.toBe(await outerText.evaluate((element) => getComputedStyle(element).color));
});

test("Typography wraps within a narrow viewport without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-typography--responsive-wrapping&viewMode=story");

  await expect(page.getByRole("heading", {
    name: "Design systems make strong teams more consistent",
  })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});
