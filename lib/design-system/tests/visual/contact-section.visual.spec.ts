import { expect, test } from "@playwright/test";

test("ContactSection is a named section with semantic address, contact links, and business hours", async ({ page }) => {
  await page.goto("/iframe.html?id=components-contact-section--playground&viewMode=story");

  const section = page.getByRole("region", { name: "Visit Harbor & Pine Studio" });
  await expect(section).toBeVisible();
  await expect(section.getByRole("heading", { name: "Visit Harbor & Pine Studio", level: 2 })).toBeVisible();
  await expect(section.locator("address")).toContainText("214 Queen Street West");
  await expect(section.getByRole("link", { name: "Get directions" }))
    .toHaveAttribute("href", "https://maps.example.test/directions");
  await expect(section.getByRole("link", { name: "(416) 555-0148" }))
    .toHaveAttribute("href", "tel:+14165550148");
  await expect(section.getByRole("link", { name: "hello@harborpine.example" }))
    .toHaveAttribute("href", "mailto:hello@harborpine.example");
  await expect(section.getByText("Thursday", { exact: true })).toBeVisible();
  await expect(section.getByText("9:00 AM – 7:00 PM", { exact: true })).toBeVisible();
  await expect(section.getByRole("button", { name: "Book a consultation" })).toBeVisible();
});

test("ContactSection keeps form controls and actions consumer-owned and accessible", async ({ page }) => {
  await page.goto("/iframe.html?id=components-contact-section--with-contact-form&viewMode=story");

  const section = page.getByRole("region", { name: "Start a conversation" });
  await expect(section.getByRole("form", { name: "Send a message" })).toBeVisible();
  await expect(section.getByRole("textbox", { name: "Your name" })).toBeVisible();
  await expect(section.getByRole("textbox", { name: "Email address" })).toHaveAttribute("type", "email");
  await expect(section.getByRole("button", { name: "Send message" })).toHaveAttribute("type", "submit");
  await expect(section.getByRole("button", { name: "Call the studio" })).toHaveAttribute("type", "button");
});

test("Split contact layout stacks on mobile while preserving the desktop form column", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/iframe.html?id=components-contact-section--with-contact-form&viewMode=story");

  const section = page.getByRole("region", { name: "Start a conversation" });
  const layout = section.locator(":scope > div");
  const desktopColumns = await layout.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(desktopColumns.trim().split(/\s+/)).toHaveLength(2);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(section).toBeVisible();
  const mobileColumns = await layout.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(mobileColumns.trim().split(/\s+/)).toHaveLength(1);
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  await page.goto("/iframe.html?id=components-contact-section--stacked-layout&viewMode=story");
  const stacked = page.getByRole("region", { name: "Contact our team" });
  const stackedColumns = await stacked.locator(":scope > div")
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(stackedColumns.trim().split(/\s+/)).toHaveLength(1);
});

test("ContactSection inherits theme boundaries and scoped component hooks", async ({ page }) => {
  await page.goto("/iframe.html?id=components-contact-section--theme-coverage&viewMode=story");
  const sections = page.locator("[data-ds-theme] section[aria-labelledby]");
  await expect(sections).toHaveCount(5);
  const backgrounds = await sections.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).backgroundColor),
  );
  expect(backgrounds[0]).not.toBe(backgrounds[1]);

  await page.goto("/iframe.html?id=components-contact-section--custom-hooks&viewMode=story");
  const custom = page.getByRole("region", { name: "Custom contact styling" });
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

  await page.goto("/iframe.html?id=components-contact-section--nested-theme-boundary&viewMode=story");
  const acme = page.getByRole("region", { name: "ACME studio" });
  const luna = page.getByRole("region", { name: "Luna studio" });
  const [acmeSurface, lunaSurface] = await Promise.all([
    acme.evaluate((element) => getComputedStyle(element).backgroundColor),
    luna.evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  expect(acmeSurface).not.toBe(lunaSurface);
});

test("ContactSection supports heading levels and wraps long business details", async ({ page }) => {
  await page.goto("/iframe.html?id=components-contact-section--heading-levels&viewMode=story");
  const section = page.getByRole("region", { name: "Subsection contact" });
  await expect(section.getByRole("heading", { name: "Subsection contact", level: 4 })).toBeVisible();
  await expect(section.getByRole("heading", { name: "Visit us", level: 5 })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-contact-section--long-content&viewMode=story");
  const longSection = page.getByRole("region", {
    name: "Talk with a member of the Harbor & Pine team",
  });
  await expect(longSection).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});
