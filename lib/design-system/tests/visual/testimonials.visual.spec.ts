import { expect, test } from "@playwright/test";

test("Testimonials exposes named quote cards and accessible ratings", async ({ page }) => {
  await page.goto("/iframe.html?id=components-testimonials--playground&viewMode=story");

  const section = page.getByRole("region", { name: "What our customers say" });
  await expect(section).toBeVisible();
  await expect(section.getByRole("article")).toHaveCount(3);
  await expect(section.locator("blockquote")).toHaveCount(3);
  await expect(section.locator("cite")).toHaveCount(3);
  await expect(section.getByRole("img", { name: "5 out of 5 stars" })).toHaveCount(2);
  await expect(section.locator("img").first()).toHaveAttribute("alt", "");
});

test("Testimonials omits optional details and supports localized rating labels", async ({ page }) => {
  await page.goto("/iframe.html?id=components-testimonials--optional-details&viewMode=story");

  const section = page.getByRole("region", { name: "A few kind words" });
  await expect(section.getByRole("article")).toHaveCount(2);
  await expect(section.getByText("Casey Morgan")).toBeVisible();
  await expect(section.getByRole("img", { name: "4 out of 5 stars" })).toBeVisible();
  await expect(section.getByRole("img", { name: "5 out of 5 stars" })).toHaveCount(0);

  await page.goto("/iframe.html?id=components-testimonials--localized-rating&viewMode=story");
  await expect(page.getByRole("img", { name: "5 étoiles sur 5" })).toBeVisible();
});

test("Testimonials supports a single featured item and configurable grid columns", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/iframe.html?id=components-testimonials--layout-variants&viewMode=story");

  const featured = page.getByRole("region", { name: "Featured customer testimonial" });
  await expect(featured.getByRole("article")).toHaveCount(1);
  const grid = page.getByRole("region", { name: "More customer stories" });
  await expect(grid.getByRole("article")).toHaveCount(3);
  const columns = await grid.locator("[data-layout='grid']").evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
  );
  expect(columns).toBe(2);
});

test("Testimonials inherits themes and existing Card styling hooks", async ({ page }) => {
  await page.goto("/iframe.html?id=components-testimonials--theme-coverage&viewMode=story");

  const themedCards = page.locator("[data-ds-theme] article");
  await expect(themedCards).toHaveCount(10);
  const backgrounds = await themedCards.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).backgroundColor),
  );
  expect(new Set(backgrounds).size).toBeGreaterThan(1);

  await page.goto("/iframe.html?id=components-testimonials--custom-card-hooks&viewMode=story");
  const card = page.locator("article").first();
  const styles = await card.evaluate((element) => {
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

test("Testimonials respects a nested theme boundary", async ({ page }) => {
  await page.goto("/iframe.html?id=components-testimonials--nested-theme-boundary&viewMode=story");

  const parentCard = page.getByRole("region", { name: "ACME parent testimonials" }).locator("article").first();
  const nestedCard = page.getByRole("region", { name: "Luna nested testimonials" }).locator("article").first();
  const parentBackground = await parentCard.evaluate((element) => getComputedStyle(element).backgroundColor);
  const nestedBackground = await nestedCard.evaluate((element) => getComputedStyle(element).backgroundColor);

  expect(parentBackground).not.toBe(nestedBackground);
});

test("Testimonials grid collapses to one column without narrow-screen overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-testimonials--narrow-layout&viewMode=story");

  const section = page.getByRole("region", { name: "Narrow customer testimonials" });
  await expect(section.getByRole("article")).toHaveCount(3);
  const columns = await section.locator("[data-layout='grid']").evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
  );
  expect(columns).toBe(1);

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("Testimonials expands a three-column grid at the wide breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 1151, height: 900 });
  await page.goto("/iframe.html?id=components-testimonials--three-column-grid&viewMode=story");

  const section = page.getByRole("region", { name: "Wide customer testimonials" });
  const grid = section.locator("[data-layout='grid']");
  const columns = async () => grid.evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
  );

  await expect(section.getByRole("article")).toHaveCount(3);
  await expect.poll(columns).toBe(2);
  await page.setViewportSize({ width: 1152, height: 900 });
  await expect.poll(columns).toBe(3);
});
