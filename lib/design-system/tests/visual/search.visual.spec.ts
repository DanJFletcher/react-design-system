import { expect, test } from "@playwright/test";

test("Search has named search semantics, an accessible searchbox, and configurable icons", async ({ page }) => {
  await page.goto("/iframe.html?id=components-search--playground&viewMode=story");
  const search = page.getByRole("search", { name: "Search the site" });
  await expect(search).toBeVisible();
  const input = page.getByRole("searchbox", { name: "Search the site" });
  await expect(input).toHaveAttribute("name", "q");
  await expect(input).toHaveAttribute("type", "search");
  await expect(search.getByRole("button", { name: "Search", exact: true })).toBeVisible();
});

test("Search uses native GET submission settings when no search callback is supplied", async ({ page }) => {
  await page.goto("/iframe.html?id=components-search--native-get-search&viewMode=story");
  const search = page.getByRole("search", { name: "Search local listings" });
  const input = search.getByRole("searchbox", { name: "Search local listings" });
  await expect(search).toHaveAttribute("method", "get");
  await expect(search).toHaveAttribute("action", "/search-results");
  await expect(input).toHaveAttribute("name", "query");
  await expect(input).toHaveAttribute("placeholder", "Enter a neighborhood or service");
});

test("Search keeps its submit button compact and named on phone-sized screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-search--playground&viewMode=story");
  const submit = page.getByRole("button", { name: "Search", exact: true });
  await expect(submit).toBeVisible();
  await expect(submit).toHaveAttribute("aria-label", "Search");
  const dimensions = await submit.evaluate((button) => {
    const label = button.querySelector("span:not([aria-hidden='true'])");
    return {
      width: button.getBoundingClientRect().width,
      labelDisplay: label ? getComputedStyle(label).display : "missing",
    };
  });
  expect(dimensions.width).toBeLessThanOrEqual(48);
  expect(dimensions.labelDisplay).toBe("none");
});

test("Search exposes a visible label and supports disabled state", async ({ page }) => {
  await page.goto("/iframe.html?id=components-search--visible-label&viewMode=story");
  await expect(page.getByText("Search appointments", { exact: true })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Search appointments" })).toBeVisible();

  await page.goto("/iframe.html?id=components-search--disabled&viewMode=story");
  const disabledSearch = page.getByRole("search", { name: "Search unavailable" });
  await expect(disabledSearch.getByRole("searchbox")).toBeDisabled();
  await expect(disabledSearch.getByRole("button", { name: "Search", exact: true })).toBeDisabled();
  await expect(disabledSearch.getByRole("button", { name: "Clear search" })).toBeDisabled();
});

test("Search keeps the form control radius and custom hooks scoped across themes", async ({ page }) => {
  await page.goto("/iframe.html?id=components-search--theme-coverage&viewMode=story");
  const fields = page.locator("[data-ds-theme] input[type='search']");
  await expect(fields).toHaveCount(4);
  const luna = page.locator("[data-ds-theme='luna'] input[type='search']");
  await expect(luna).toHaveCSS("border-radius", "9999px");

  await page.goto("/iframe.html?id=components-search--custom-hooks&viewMode=story");
  const customInput = page.getByRole("searchbox", { name: "Search with custom styling" });
  const styles = await customInput.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      background: computed.backgroundColor,
      radius: computed.borderRadius,
      padding: computed.padding,
    };
  });
  expect(styles.background).not.toBe("transparent");
  expect(Number.parseFloat(styles.radius)).toBeGreaterThan(0);
  expect(Number.parseFloat(styles.padding)).toBeGreaterThan(0);
});
