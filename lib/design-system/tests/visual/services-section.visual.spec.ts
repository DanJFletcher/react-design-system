import { expect, test } from "@playwright/test";

test("ServicesSection names the section and exposes service details and actions", async ({ page }) => {
  await page.goto("/iframe.html?id=components-services-section--playground&viewMode=story");

  const section = page.getByRole("region", { name: "Thoughtful help for every project" });
  await expect(section).toBeVisible();
  await expect(section.getByRole("heading", {
    name: "Thoughtful help for every project",
    level: 2,
  })).toBeVisible();
  await expect(section.getByRole("article", { name: "Custom woodwork" })).toBeVisible();
  await expect(section.getByRole("link", { name: "Explore custom woodwork" }))
    .toHaveAttribute("href", "/services/custom-woodwork");
  await expect(section.getByRole("link", { name: "Learn more about Space planning" }))
    .toHaveAttribute("href", "/services/space-planning");
  await expect(section.getByRole("button", { name: "Book an assessment" })).toBeVisible();
});

test("ServicesSection adapts its configured columns to tablet and mobile widths", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/iframe.html?id=components-services-section--playground&viewMode=story");
  const grid = page.locator("[data-slot='services-grid']");

  const countColumns = async () => {
    const template = await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
    return template.trim().split(/\s+/).length;
  };

  expect(await countColumns()).toBe(3);
  await page.setViewportSize({ width: 760, height: 900 });
  expect(await countColumns()).toBe(2);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await countColumns()).toBe(1);

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("ServicesSection switches at the compact and medium breakpoint edges", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto("/iframe.html?id=components-services-section--playground&viewMode=story");
  const grid = page.locator("[data-slot='services-grid']");
  const countColumns = async () => {
    const template = await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
    return template.trim().split(/\s+/).length;
  };

  await expect.poll(countColumns).toBe(1);
  await page.setViewportSize({ width: 641, height: 900 });
  await expect.poll(countColumns).toBe(2);
  await page.setViewportSize({ width: 767, height: 900 });
  await expect.poll(countColumns).toBe(2);
  await page.setViewportSize({ width: 768, height: 900 });
  await expect.poll(countColumns).toBe(3);
});

test("ServicesSection links are keyboard reachable and a headingless section can be named", async ({ page }) => {
  await page.goto("/iframe.html?id=components-services-section--playground&viewMode=story");
  const firstLink = page.getByRole("link", { name: "Explore custom woodwork" });
  await firstLink.focus();
  await expect(firstLink).toBeFocused();
  await expect(firstLink).toHaveAttribute("href", "/services/custom-woodwork");
  const outlineStyle = await firstLink.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outlineStyle).toBe("solid");

  await page.goto("/iframe.html?id=components-services-section--headingless-services&viewMode=story");
  await expect(page.getByRole("region", { name: "Ways we can help" })).toBeVisible();
});

test("ServicesSection respects theme boundaries and scoped section hooks", async ({ page }) => {
  await page.goto("/iframe.html?id=components-services-section--theme-coverage&viewMode=story");
  const sections = page.locator("[data-ds-theme] [data-services-section]");
  await expect(sections).toHaveCount(5);
  const backgrounds = await sections.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).backgroundColor),
  );
  expect(new Set(backgrounds).size).toBeGreaterThan(1);

  const luna = page.locator("[data-ds-theme='luna'] [data-services-section]");
  await expect(luna).toHaveCount(1);
  await expect(luna).toHaveCSS("border-radius", "32px");

  await page.goto("/iframe.html?id=components-services-section--custom-hooks&viewMode=story");
  const custom = page.getByRole("region", { name: "Services with scoped styling" });
  const styles = await custom.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      background: computed.backgroundColor,
      borderRadius: computed.borderRadius,
      padding: computed.padding,
    };
  });
  expect(styles.background).not.toBe("transparent");
  expect(Number.parseFloat(styles.borderRadius)).toBeGreaterThan(0);
  expect(Number.parseFloat(styles.padding)).toBeGreaterThan(0);
});

test("ServicesSection wraps long content without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-services-section--long-content&viewMode=story");
  await expect(page.getByRole("region", {
    name: "Support for the details that make a home work better",
  })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});
