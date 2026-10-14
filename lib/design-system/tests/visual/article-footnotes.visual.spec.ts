import { expect, test } from "@playwright/test";

test("in-text footnotes navigate to notes and return to every citation", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-footnotes--playground&viewMode=story");

  const article = page.getByRole("article", {
    name: "A guide to preparing a welcoming studio",
  });
  const footnotes = article.getByRole("region", { name: "Footnotes" });
  const firstCitation = article.getByRole("link", { name: "Footnote 1", exact: true });

  await expect(article).toBeVisible();
  await expect(firstCitation).toHaveAttribute("href", "#sample-note-opening-hours");
  await expect(footnotes.getByRole("listitem")).toHaveCount(2);

  const secondNote = footnotes.locator("#sample-note-customer-survey");
  await expect(secondNote.getByRole("link", {
    name: "Back to citation 1 for footnote 2",
  })).toHaveAttribute("href", "#sample-citation-survey-first");
  await expect(secondNote.getByRole("link", {
    name: "Back to citation 2 for footnote 2",
  })).toHaveAttribute("href", "#sample-citation-survey-second");
});

test("citation markers remain in tab order and activate with the keyboard", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-footnotes--playground&viewMode=story");

  const firstCitation = page.getByRole("link", { name: "Footnote 1", exact: true });
  const nextCitation = page.getByRole("link", { name: "Footnote 2", exact: true }).first();
  await firstCitation.focus();
  await page.keyboard.press("Tab");
  await expect(nextCitation).toBeFocused();
  await expect(nextCitation).toHaveCSS("outline-style", "solid");

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#sample-note-customer-survey$/);
});

test("footnotes inherit theme boundaries", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-footnotes--theme-coverage&viewMode=story");

  const themedFootnotes = page.locator("[data-ds-theme] section[aria-labelledby]");
  await expect(themedFootnotes).toHaveCount(5);
  const borderColors = await themedFootnotes.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).borderBlockStartColor),
  );
  expect(new Set(borderColors).size).toBe(5);
});

test("footnote content fits a narrow viewport without horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-article-footnotes--narrow-screen&viewMode=story");

  await expect(page.getByRole("region", { name: "Footnotes" })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});
