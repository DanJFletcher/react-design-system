import { expect, test } from "@playwright/test";

test("breadcrumbs expose parent links and a non-link current page", async ({ page }) => {
  await page.goto("/iframe.html?id=components-breadcrumbs--playground&viewMode=story");

  const navigation = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(navigation.getByRole("list")).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(
    navigation.getByRole("link", { name: "Services" }),
  ).toHaveAttribute("href", "/services");
  await expect(navigation.getByText("Repairs")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(navigation.getByRole("link", { name: "Repairs" })).toHaveCount(0);
  await expect(
    navigation.locator("li:not(:has(button)) > [aria-hidden='true']"),
  ).toHaveCount(2);
});

test("breadcrumb links retain native keyboard focus and activation behavior", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-breadcrumbs--playground&viewMode=story");

  const homeLink = page.getByRole("link", { name: "Home" });
  const servicesLink = page.getByRole("link", { name: "Services" });
  await homeLink.focus();
  await expect(homeLink).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Tab");
  await expect(servicesLink).toBeFocused();
  await expect(servicesLink).toHaveAttribute("href", "/services");
});

test("breadcrumb colors, spacing, and radius inherit built-in and scoped themes", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-breadcrumbs--theme-coverage&viewMode=story",
  );

  const links = page.locator("nav[aria-label$='breadcrumb'] a");
  await expect(links).toHaveCount(10);
  const styles = await links.evaluateAll((elements) =>
    elements.map((element) => {
      const computed = getComputedStyle(element);
      return {
        color: computed.color,
        radius: computed.borderTopLeftRadius,
        paddingInlineStart: computed.paddingInlineStart,
      };
    }),
  );
  expect(new Set(styles.map((style) => style.color)).size).toBeGreaterThanOrEqual(4);
  expect(new Set(styles.map((style) => style.radius)).size).toBeGreaterThanOrEqual(2);
  expect(
    new Set(styles.map((style) => style.paddingInlineStart)).size,
  ).toBeGreaterThanOrEqual(2);
});

test("long breadcrumb labels wrap at narrow widths without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto(
    "/iframe.html?id=components-breadcrumbs--narrow-screen&viewMode=story",
  );

  const navigation = page.getByRole("navigation", {
    name: "Narrow-screen breadcrumb",
  });
  const current = navigation.getByText(
    "A detailed current page name with enough words to demonstrate readable wrapping",
  );
  await expect(navigation).toBeVisible();
  await expect(current).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("deep trails collapse intermediate levels on narrow screens and expand by keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto(
    "/iframe.html?id=components-breadcrumbs--narrow-screen&viewMode=story",
  );

  const navigation = page.getByRole("navigation", {
    name: "Narrow-screen breadcrumb",
  });
  const home = navigation.getByRole("link", { name: "Home" });
  const current = navigation.getByText(
    "A detailed current page name with enough words to demonstrate readable wrapping",
  );
  const collapsed = navigation.getByRole("button", {
    name: "Show 4 hidden breadcrumb levels",
  });

  await expect(home).toBeVisible();
  await expect(current).toBeVisible();
  await expect(navigation.locator('[data-intermediate="true"]')).toHaveCount(4);
  await expect(
    navigation.locator('[data-intermediate="true"]').first(),
  ).toBeHidden();
  await expect(collapsed).toHaveAttribute("aria-expanded", "false");

  await collapsed.focus();
  await page.keyboard.press("Enter");
  const expanded = navigation.getByRole("button", {
    name: "Hide intermediate breadcrumb levels",
  });
  await expect(expanded).toBeFocused();
  await expect(
    navigation.getByRole("link", { name: "Products" }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Heating systems" }),
  ).toBeVisible();
  await expect(expanded).toHaveAttribute("aria-expanded", "true");

  await expanded.click();
  await expect(collapsed).toBeVisible();
  await expect(collapsed).toBeFocused();
  await expect(
    navigation.getByRole("link", { name: "Products" }),
  ).toBeHidden();
});

test("wide breadcrumb layouts retain every ancestor without a collapse control", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(
    "/iframe.html?id=components-breadcrumbs--narrow-screen&viewMode=story",
  );

  const navigation = page.getByRole("navigation", {
    name: "Narrow-screen breadcrumb",
  });
  await expect(
    navigation.getByRole("link", { name: "Home", exact: true }),
  ).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Products" })).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Home services" }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Heating systems" }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("button", {
      name: "Show 4 hidden breadcrumb levels",
    }),
  ).toBeHidden();
});

test("the narrow-screen breadcrumb control responds to touch", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 360, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(
    "/iframe.html?id=components-breadcrumbs--narrow-screen&viewMode=story",
  );

  const navigation = page.getByRole("navigation", {
    name: "Narrow-screen breadcrumb",
  });
  await navigation
    .getByRole("button", { name: "Show 4 hidden breadcrumb levels" })
    .tap();
  await expect(
    navigation.getByRole("link", { name: "Products" }),
  ).toBeVisible();
  await context.close();
});
