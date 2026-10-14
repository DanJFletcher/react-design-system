import { expect, test } from "@playwright/test";

test("Table exposes semantic headers, accessible naming, custom cells, and captions", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-table--with-caption&viewMode=story");

  const table = page.getByRole("table", { name: "Featured local providers" });
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await expect(table.getByRole("columnheader", { name: /Business/i })).toBeVisible();
  await expect(table.getByRole("cell", { name: "4.9 / 5" })).toBeVisible();
  await expect(table.getByRole("cell", { name: "Open" }).first()).toBeVisible();
});

test("Table supports controlled client-side sorting and announces the active direction", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-table--controlled-sorting&viewMode=story");

  const table = page.getByRole("table", { name: "Top local businesses" });
  await expect(table.locator("tbody tr").first()).toContainText("Northstar Plumbing");

  await table.getByRole("button", { name: "Sort by business" }).click();
  await expect(page.getByText("Sorted by name, asc")).toBeVisible();
  await expect(table.getByRole("columnheader", { name: /Business/i })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  await expect(table.locator("tbody tr").first()).toContainText("Fieldstone Home Repair");
});

test("manual sorting changes the sort indicator without reordering rows", async ({ page }) => {
  await page.goto("/iframe.html?id=components-table--manual-sorting&viewMode=story");

  const table = page.getByRole("table", { name: "Local businesses" });
  await expect(table.getByRole("columnheader", { name: /Service/ })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  await expect(table.locator("tbody tr").first()).toContainText("Northstar Plumbing");
});

test("multiple selection supports indeterminate and select-all states", async ({ page }) => {
  await page.goto("/iframe.html?id=components-table--multiple-selection&viewMode=story");

  const table = page.getByRole("table", { name: "Select businesses" });
  const selectAll = table.getByRole("checkbox", { name: "Select all rows" });
  await expect(selectAll).not.toBeChecked();
  await expect
    .poll(() => selectAll.evaluate((input: HTMLInputElement) => input.indeterminate))
    .toBe(true);

  await selectAll.check();
  await expect(selectAll).toBeChecked();
  await expect(page.getByText("Selected: b2, b1, b3, b4")).toBeVisible();
  await expect(table.getByRole("row", { selected: true })).toHaveCount(4);
});

test("Table renders empty and loading states accessibly", async ({ page }) => {
  await page.goto("/iframe.html?id=components-table--empty&viewMode=story");
  const emptyTable = page.getByRole("table", { name: "Local businesses" });
  await expect(emptyTable.getByText("No businesses match these filters.")).toBeVisible();

  await page.goto("/iframe.html?id=components-table--loading&viewMode=story");
  const loadingTable = page.getByRole("table", { name: "Local businesses" });
  await expect(loadingTable).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("status")).toHaveText("Refreshing business directory…");
  await expect(loadingTable.locator("tbody tr")).toHaveCount(4);
});

test("sticky headers remain sticky inside a bounded table viewport", async ({ page }) => {
  await page.goto("/iframe.html?id=components-table--sticky-header&viewMode=story");
  const header = page
    .getByRole("table", { name: "Local businesses" })
    .getByRole("columnheader", { name: /Business/i });
  await expect(header).toHaveCSS("position", "sticky");
});

test("wide tables scroll inside their viewport on mobile without widening the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-table--narrow-screen&viewMode=story");

  const viewport = page
    .getByRole("table", { name: "Local businesses" })
    .locator("xpath=ancestor::div[contains(@class, 'viewport')]");
  const dimensions = await viewport.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);

  const pageDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(pageDimensions.documentWidth).toBeLessThanOrEqual(pageDimensions.viewportWidth);
});

test("default table columns stay readable and scroll within the viewport on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-table--with-caption&viewMode=story");

  const table = page.getByRole("table", { name: "Featured local providers" });
  const viewport = table.locator("xpath=parent::div");
  await expect(table).toHaveCSS("min-inline-size", "max-content");
  const dimensions = await viewport.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);

  const pageDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(pageDimensions.documentWidth).toBeLessThanOrEqual(pageDimensions.viewportWidth);
});

test("optional search filters visible columns case-insensitively and clears results", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-table--searchable&viewMode=story");

  const table = page.getByRole("table", { name: "Local businesses" });
  const search = page.getByRole("searchbox", { name: "Search businesses" });
  await expect(table.locator("tbody tr")).toHaveCount(4);

  await search.fill("oAkV");
  await expect(table.locator("tbody tr")).toHaveCount(1);
  await expect(table.locator("tbody tr").first()).toContainText("Juniper Garden Studio");
  await expect(page.getByRole("status")).toHaveText("1 result for “oAkV”");

  await search.fill("Electrical");
  await expect(table.getByText("No matching businesses.")).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("0 results for “Electrical”");

  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(table.locator("tbody tr")).toHaveCount(4);
});

test("custom table search functions can match values beyond visible accessors", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-table--custom-search-function&viewMode=story");

  const table = page.getByRole("table", { name: "Local businesses" });
  await page.getByRole("searchbox", { name: "Search business services" }).fill("top rated");
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await expect(table.getByText("Northstar Plumbing")).toBeVisible();
  await expect(table.getByText("Harborlight Electric")).toBeVisible();
});

test("table search can be controlled by its consumer", async ({ page }) => {
  await page.goto("/iframe.html?id=components-table--controlled-search&viewMode=story");

  const table = page.getByRole("table", { name: "Search local businesses" });
  const search = page.getByRole("searchbox", { name: "Search local businesses" });
  await search.fill("Oakville");
  await expect(page.getByText("Current query: Oakville")).toBeVisible();
  await expect(table.locator("tbody tr")).toHaveCount(1);
  await expect(table.locator("tbody tr").first()).toContainText("Juniper Garden Studio");
});

test("table themes keep distinct surfaces and custom hook overrides apply", async ({ page }) => {
  await page.goto("/iframe.html?id=components-table--theme-coverage&viewMode=story");
  const tables = page.locator("table[aria-label$='business table']");
  await expect(tables).toHaveCount(4);
  const backgrounds = await tables.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).color),
  );
  expect(new Set(backgrounds).size).toBe(4);
  const lunaViewport = page
    .locator("section[aria-label='luna theme'] table")
    .locator("xpath=parent::div");
  await expect(lunaViewport).toHaveCSS("border-radius", "32px");

  await page.goto("/iframe.html?id=components-table--custom-hooks&viewMode=story");
  const viewport = page
    .getByRole("table", { name: "Local businesses" })
    .locator("xpath=parent::div");
  const surfaceRadius = await viewport.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--ds-radius-surface").trim(),
  );
  await expect(viewport).toHaveCSS("border-radius", surfaceRadius);
  await expect(viewport).toHaveCSS("background-color", "rgb(241, 245, 255)");
});
