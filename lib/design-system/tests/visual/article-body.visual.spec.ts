import { expect, test } from "@playwright/test";

test("ArticleBody exposes native reading structure, helpful alternatives, and keyboard links", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-body--full-article&viewMode=story");

  const article = page.getByRole("article", {
    name: "A calmer morning routine for your studio",
  });
  await expect(article).toBeVisible();
  await expect(article.getByRole("heading", {
    name: "Begin with a little breathing room",
    level: 2,
  })).toBeVisible();
  await expect(article.getByRole("listitem")).toHaveCount(3);
  await expect(article.getByRole("figure")).toBeVisible();
  await expect(article.getByRole("img", {
    name: "A bright green hillside beneath a warm morning sun",
  })).toBeVisible();
  await expect(article.getByRole("table", {
    name: "Three useful moments to reset the studio",
  })).toBeVisible();
  await expect(article.getByRole("columnheader")).toHaveCount(3);
  await expect(article.getByRole("rowheader", { name: "Monday" })).toBeVisible();

  const link = article.getByRole("link", { name: "our studio planning guide" });
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS("outline-style", "solid");
});

test("ArticleBody follows ACME, Luna, and Orchid theme boundaries", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-body--theme-coverage&viewMode=story");

  const articles = page.locator("[data-ds-theme] article");
  await expect(articles).toHaveCount(3);
  const colors = await articles.evaluateAll((elements) =>
    elements.map((element) => ({
      text: getComputedStyle(element).color,
      link: getComputedStyle(element.querySelector("a") as HTMLAnchorElement).color,
    })),
  );
  expect(new Set(colors.map(({ text }) => text)).size).toBe(3);
  expect(new Set(colors.map(({ link }) => link)).size).toBe(3);
});

test("ArticleBody and wide tables remain usable at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-article-body--narrow-screen&viewMode=story");

  const article = page.getByRole("article", { name: "A calmer morning routine for your studio" });
  await expect(article).toBeVisible();
  const widths = await article.evaluate((element) => {
    const table = element.querySelector("table") as HTMLTableElement;
    return {
      article: element.getBoundingClientRect().width,
      articleScroll: element.scrollWidth,
      table: table.getBoundingClientRect().width,
      tableScroll: table.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    };
  });
  expect(widths.article).toBeLessThanOrEqual(390);
  expect(widths.articleScroll).toBeLessThanOrEqual(widths.article);
  expect(widths.tableScroll).toBeGreaterThanOrEqual(widths.table);
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);

  const lineMeasure = await article.evaluate((element) => {
    const paragraph = element.querySelector("p") as HTMLParagraphElement;
    return {
      fontSize: Number.parseFloat(getComputedStyle(paragraph).fontSize),
      lineHeight: Number.parseFloat(getComputedStyle(paragraph).lineHeight),
    };
  });
  expect(lineMeasure.lineHeight / lineMeasure.fontSize).toBeGreaterThanOrEqual(1.5);
});
