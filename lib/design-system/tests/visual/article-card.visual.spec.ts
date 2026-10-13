import { expect, test } from "@playwright/test";

test("ArticleCard renders an accessible article preview with native links and date metadata", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-card--playground&viewMode=story");

  const title = "A calmer morning routine for your studio";
  const article = page.getByRole("article", { name: title });
  await expect(article).toBeVisible();
  await expect(article.getByRole("heading", { name: title, level: 2 })).toBeVisible();
  await expect(article.getByRole("link", { name: title, exact: true }))
    .toHaveAttribute("href", "/journal/calm-morning-routine");
  await expect(article.getByRole("link", { name: "Small business" }))
    .toHaveAttribute("href", "/journal/topics/small-business");
  await expect(article.getByRole("link", { name: "Maya Chen" }))
    .toHaveAttribute("href", "/journal/authors/maya-chen");
  await expect(article.locator("time")).toHaveAttribute("datetime", "2026-05-14");
  await expect(article.getByText("6 min read")).toBeVisible();
  await expect(article.getByRole("link", {
    name: `Read article: ${title}`,
  })).toHaveAttribute("href", "/journal/calm-morning-routine");
  await expect(article.locator('img[alt="Illustration of a sunlit hillside and green garden"]'))
    .toHaveAttribute("loading", "lazy");
});

test("ArticleCard supports text-only posts and can hide the secondary read-more link", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-card--content-variants&viewMode=story");

  const article = page.getByRole("article", { name: "A text-only article card" });
  await expect(article).toBeVisible();
  await expect(article.locator("img")).toHaveCount(0);
  await expect(article.getByRole("link", { name: "A text-only article card" }))
    .toHaveAttribute("href", "/journal/practical-ideas");
  await expect(article.getByRole("link", { name: "Read article: A text-only article card" }))
    .toHaveCount(0);
});

test("ArticleCard horizontal layout responds to narrow screens without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/iframe.html?id=components-article-card--layout-variants&viewMode=story");

  const article = page.getByRole("article", { name: "A horizontal article preview" });
  await expect(article).toBeVisible();
  const desktopColumns = await article.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(desktopColumns.trim().split(/\s+/)).toHaveLength(2);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileColumns = await article.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(mobileColumns.trim().split(/\s+/)).toHaveLength(1);
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("ArticleCard follows theme boundaries and existing Card hooks", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-card--theme-coverage&viewMode=story");

  const themedArticles = page.locator("[data-ds-theme] article");
  await expect(themedArticles).toHaveCount(3);
  const backgrounds = await themedArticles.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).backgroundColor),
  );
  expect(new Set(backgrounds).size).toBe(3);

  await page.goto("/iframe.html?id=components-article-card--custom-hooks&viewMode=story");
  const customArticle = page.getByRole("article", { name: "A calmer morning routine for your studio" });
  const styles = await customArticle.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      background: computed.backgroundColor,
      padding: computed.padding,
      radius: computed.borderRadius,
    };
  });
  expect(styles.background).not.toBe("transparent");
  expect(Number.parseFloat(styles.padding)).toBeGreaterThan(0);
  expect(Number.parseFloat(styles.radius)).toBeGreaterThan(0);
});
