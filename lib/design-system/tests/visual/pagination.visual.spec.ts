import { expect, test } from "@playwright/test";

test("controlled buttons update the current page and keyboard activation works", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-pagination--controlled&viewMode=story");

  const navigation = page.getByRole("navigation", {
    name: "Controlled article pagination",
  });
  await expect(page.getByTestId("current-page")).toHaveText("Current page: 4");

  const nextPage = navigation.getByRole("button", { name: "Page 5" });
  await nextPage.focus();
  await expect(nextPage).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");

  await expect(page.getByTestId("current-page")).toHaveText("Current page: 5");
  await expect(navigation.getByText("5", { exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("link navigation uses native URLs and identifies the current page", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-pagination--link-navigation&viewMode=story");

  const navigation = page.getByRole("navigation", { name: "Article pages" });
  await expect(navigation.getByRole("link", { name: "Previous page" })).toHaveAttribute(
    "href",
    "/journal?page=3",
  );
  await expect(navigation.getByRole("link", { name: "Next page" })).toHaveAttribute(
    "href",
    "/journal?page=5",
  );
  await expect(navigation.getByRole("link", { name: "Page 3" })).toHaveAttribute(
    "href",
    "/journal?page=3",
  );
  await expect(navigation.getByText("4", { exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(navigation.getByRole("link", { name: "Page 4" })).toHaveCount(0);
});

test("page windows preserve boundary pages and use ellipses for omitted ranges", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-pagination--page-window&viewMode=story");

  const navigation = page.getByRole("navigation", { name: "Article pagination" });
  for (const pageNumber of [1, 2, 17, 19, 39, 40]) {
    await expect(
      navigation.getByRole("button", {
        name: `Page ${pageNumber}`,
        exact: true,
      }),
    ).toBeVisible();
  }
  await expect(navigation.getByText("18", { exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(navigation.locator("ol > li[aria-hidden='true']")).toHaveCount(2);
});

test("first and last pages disable the unavailable direction", async ({ page }) => {
  await page.goto("/iframe.html?id=components-pagination--first-page&viewMode=story");
  await expect(
    page.getByRole("navigation", { name: "Article pagination" }).getByRole("button", {
      name: "Previous page",
    }),
  ).toBeDisabled();

  await page.goto("/iframe.html?id=components-pagination--last-page&viewMode=story");
  await expect(
    page.getByRole("navigation", { name: "Article pagination" }).getByRole("button", {
      name: "Next page",
    }),
  ).toBeDisabled();
});

test("pagination inherits theme colors across all built-in themes", async ({ page }) => {
  await page.goto("/iframe.html?id=components-pagination--theme-coverage&viewMode=story");

  const navs = page.locator("nav[aria-label$='article pagination']");
  await expect(navs).toHaveCount(3);
  const colors = await navs.locator("[aria-current='page']").evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).backgroundColor),
  );
  expect(new Set(colors).size).toBe(3);
});

test("mobile pagination shows a page summary and fits without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-pagination--narrow-screen&viewMode=story");

  const navigation = page.getByRole("navigation", {
    name: "Narrow-screen article pagination",
  });
  await expect(navigation.getByText("Page 17 of 30")).toBeVisible();
  await expect(navigation.getByRole("list")).toBeHidden();
  await expect(navigation.getByRole("button", { name: "Previous page" })).toBeVisible();
  await expect(navigation.getByRole("button", { name: "Next page" })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});
