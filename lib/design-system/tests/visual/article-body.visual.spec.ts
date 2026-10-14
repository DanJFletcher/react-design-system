import { expect, test } from "@playwright/test";

function contrastRatio(foreground: string, background: string) {
  const luminance = (color: string) => {
    const channels = color.match(/\d+/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length !== 3) {
      throw new Error(`Expected an RGB color, received ${color}`);
    }
    const [red, green, blue] = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };

  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

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

test("ArticleBody follows all built-in theme boundaries", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-body--theme-coverage&viewMode=story");

  const articles = page.locator("[data-ds-theme] article");
  await expect(articles).toHaveCount(4);
  const colors = await articles.evaluateAll((elements) =>
    elements.map((element) => {
      const inlineCode = getComputedStyle(element.querySelector("p code") as HTMLElement);
      const pre = getComputedStyle(element.querySelector("pre") as HTMLElement);
      return {
        text: getComputedStyle(element).color,
        link: getComputedStyle(element.querySelector("a") as HTMLAnchorElement).color,
        inlineCode: {
          color: inlineCode.color,
          background: inlineCode.backgroundColor,
        },
        pre: {
          color: pre.color,
          background: pre.backgroundColor,
          fontFamily: pre.fontFamily,
        },
      };
    }),
  );
  expect(new Set(colors.map(({ text }) => text)).size).toBe(4);
  expect(new Set(colors.map(({ link }) => link)).size).toBe(4);
  for (const { inlineCode, pre } of colors) {
    expect(contrastRatio(inlineCode.color, inlineCode.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(pre.color, pre.background)).toBeGreaterThanOrEqual(4.5);
    expect(pre.fontFamily).toMatch(/monospace/);
  }
});

test("ArticleBody and wide tables remain usable at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-article-body--narrow-screen&viewMode=story");

  const article = page.getByRole("article", { name: "A calmer morning routine for your studio" });
  await expect(article).toBeVisible();
  const widths = await article.evaluate((element) => {
    const table = element.querySelector("table") as HTMLTableElement;
    const pre = element.querySelector("pre") as HTMLPreElement;
    return {
      article: element.getBoundingClientRect().width,
      articleScroll: element.scrollWidth,
      table: table.getBoundingClientRect().width,
      tableScroll: table.scrollWidth,
      pre: pre.getBoundingClientRect().width,
      preClient: pre.clientWidth,
      preScroll: pre.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    };
  });
  expect(widths.article).toBeLessThanOrEqual(390);
  expect(widths.articleScroll).toBeLessThanOrEqual(widths.article);
  expect(widths.tableScroll).toBeGreaterThanOrEqual(widths.table);
  expect(widths.pre).toBeLessThanOrEqual(widths.article);
  expect(widths.preScroll).toBeGreaterThan(widths.preClient);
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);

  const codeBlock = article.locator('pre[aria-label="A long command that can scroll horizontally"]');
  await codeBlock.focus();
  await expect(codeBlock).toBeFocused();
  await expect(codeBlock).toHaveCSS("overflow-x", "auto");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => codeBlock.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

  const lineMeasure = await article.evaluate((element) => {
    const paragraph = element.querySelector("p") as HTMLParagraphElement;
    return {
      fontSize: Number.parseFloat(getComputedStyle(paragraph).fontSize),
      lineHeight: Number.parseFloat(getComputedStyle(paragraph).lineHeight),
    };
  });
  expect(lineMeasure.lineHeight / lineMeasure.fontSize).toBeGreaterThanOrEqual(1.5);
});
