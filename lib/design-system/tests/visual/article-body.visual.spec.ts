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

test("ArticleBody citations navigate to notes and keyboard backlinks return to their markers", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-body--citations-and-footnotes&viewMode=story");

  const article = page.getByRole("article", { name: "A guide to preparing your studio" });
  const citations = article.getByRole("link", { name: "Footnote 1", exact: true });
  const firstCitation = citations.first();
  const secondCitation = citations.last();
  const notes = article.getByRole("region", { name: "Sources and notes" });
  const note = notes.getByRole("listitem");
  const backlinks = notes.getByRole("link", { name: /Back to citation/ });

  await expect(article).toBeVisible({ timeout: 15_000 });
  await expect(notes.getByRole("list")).toBeVisible();
  await expect(firstCitation).toHaveAttribute("href", "#article-note-checklist");
  await expect(secondCitation).toHaveAttribute("href", "#article-note-checklist");
  await expect(backlinks).toHaveCount(2);
  await expect(backlinks.nth(0)).toHaveAttribute("href", "#article-citation-checklist");
  await expect(backlinks.nth(1)).toHaveAttribute("href", "#article-citation-weekly-review");

  await firstCitation.focus();
  await expect(firstCitation).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(note).toBeFocused();
  await expect(note).toHaveCSS("outline-style", "solid");
  await expect(page).toHaveURL(/#article-note-checklist$/);

  await page.keyboard.press("Tab");
  await expect(notes.getByRole("link", { name: "full opening checklist" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(backlinks.first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(firstCitation).toBeFocused();
  await expect(page).toHaveURL(/#article-citation-checklist$/);
});

test("ArticleBody follows all built-in theme boundaries", async ({ page }) => {
  await page.goto("/iframe.html?id=components-article-body--theme-coverage&viewMode=story");

  const articles = page.locator("[data-ds-theme] article");
  await expect(articles).toHaveCount(5);
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
  expect(new Set(colors.map(({ text }) => text)).size).toBe(5);
  expect(new Set(colors.map(({ link }) => link)).size).toBe(5);
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

test("ArticleBody footnotes with long source URLs stay usable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(
    "/iframe.html?id=components-article-footnotes--narrow-screen-long-content&viewMode=story",
  );

  const article = page.getByRole("article", {
    name: "A guide to preparing a welcoming studio",
  });
  const citation = article.getByRole("link", { name: "Footnote 1", exact: true });
  const note = article.locator("#narrow-long-note-source");
  const source = note.getByRole("link", {
    name: "https://example.org/research/archive/2026/field-notes/extended-source-reference",
  });
  const backlink = note.getByRole("link", {
    name: "Back to citation 1 for footnote 1",
  });

  await expect(article).toBeVisible();
  await expect(note).toBeVisible();
  await expect(source).toBeVisible();
  await expect(backlink).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  const noteWidths = await note.evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(noteWidths.scrollWidth).toBeLessThanOrEqual(noteWidths.width);

  await citation.focus();
  await expect(citation).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(source).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(backlink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(citation).toBeFocused();
});
