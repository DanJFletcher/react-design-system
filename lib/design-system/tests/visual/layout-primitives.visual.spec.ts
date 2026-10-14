import { expect, test } from "@playwright/test";

test("container variants keep content centered and within narrow viewports", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-layout-container--width-examples&viewMode=story",
  );
  await page.setViewportSize({ width: 390, height: 844 });

  const containers = page.locator("[data-max-width]");
  await expect(containers).toHaveCount(4);
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth);

  await page.setViewportSize({ width: 1280, height: 900 });
  const contentContainer = page.locator('[data-max-width="content"]');
  const box = await contentContainer.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(1024);
});

test("stack and inline apply token gaps, alignment, and wrapping", async ({ page }) => {
  await page.goto("/iframe.html?id=components-layout-stack--playground&viewMode=story");

  const stack = page.locator('[data-gap="md"][data-align="stretch"]');
  await expect(stack).toHaveCSS("display", "flex");
  await expect(stack).toHaveCSS("flex-direction", "column");
  await expect(stack).toHaveCSS("gap", "16px");

  await page.goto(
    "/iframe.html?id=components-layout-inline--wrapping-example&viewMode=story",
  );
  const inline = page.locator('[data-wrap="true"]');
  await expect(inline).toHaveCSS("display", "flex");
  await expect(inline).toHaveCSS("flex-wrap", "wrap");
  await expect(inline).toHaveCSS("gap", "8px");
});

test("grid automatically adds columns as the viewport grows", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-layout-grid--responsive-example&viewMode=story",
  );

  const grid = page.locator("#responsive-layout-grid");
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileColumns = await grid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopColumns = await grid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );

  expect(mobileColumns).toBe(1);
  expect(desktopColumns).toBeGreaterThan(mobileColumns);
});

test("visually hidden text remains an accessible description and skip links reveal on focus", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-layout-visually-hidden--accessible-description&viewMode=story",
  );

  await expect(
    page.getByRole("textbox", { name: "Business name" }),
  ).toHaveAccessibleDescription(
    "Enter the name customers will see on your profile.",
  );

  await page.goto(
    "/iframe.html?id=components-layout-visually-hidden--focusable-skip-link&viewMode=story",
  );
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toHaveCSS("position", "absolute");
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveCSS("position", "static");
});
