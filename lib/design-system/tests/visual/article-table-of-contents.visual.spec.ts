import { expect, test } from "@playwright/test";

test("table of contents exposes native links to consumer heading IDs", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-article-table-of-contents--playground&viewMode=story",
  );

  const navigation = page.getByRole("navigation", {
    name: "Article table of contents",
  });
  const link = navigation.getByRole("link", { name: "Prepare the space" });
  await expect(navigation.getByRole("heading", { name: "In this article" })).toBeVisible();
  await expect(link).toHaveAttribute("href", "#sample-section-2");
  await expect(page.locator("#sample-section-2")).toHaveText("Prepare the space");
});

test("table-of-contents links remain keyboard-operable and navigate by fragment", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-article-table-of-contents--playground&viewMode=story",
  );

  const firstLink = page.getByRole("link", { name: "Start with a simple routine" });
  const secondLink = page.getByRole("link", { name: "Prepare the space" });
  await firstLink.focus();
  await expect(firstLink).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Tab");
  await expect(secondLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#sample-section-2$/);
});

test("table of contents inherits built-in, custom, and nested theme tokens", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-article-table-of-contents--theme-coverage&viewMode=story",
  );

  const navigation = page.locator("nav[aria-label$='article table of contents']");
  await expect(navigation).toHaveCount(5);
  const borderColors = await navigation.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).borderTopColor),
  );
  expect(new Set(borderColors).size).toBeGreaterThanOrEqual(4);
});

test("table of contents fits a narrow viewport without horizontal page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    "/iframe.html?id=components-article-table-of-contents--narrow-screen&viewMode=story",
  );

  await expect(
    page.getByRole("navigation", { name: "Article table of contents" }),
  ).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});
