import { expect, test } from "@playwright/test";

test("Tabs keeps tab and panel relationships while using horizontal keyboard navigation", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-tabs--playground&viewMode=story");

  const tabList = page.getByRole("tablist", { name: "Workspace sections" });
  const overview = page.getByRole("tab", { name: "Overview" });
  const activity = page.getByRole("tab", { name: "Activity" });
  const settings = page.getByRole("tab", { name: "Settings" });

  await expect(tabList).toHaveAttribute("aria-orientation", "horizontal");
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await expect(overview).toHaveAttribute("tabindex", "0");

  const activityPanelId = await activity.getAttribute("aria-controls");
  const activityPanel = page.locator(`[id="${activityPanelId}"]`);
  await expect(activityPanel).toHaveAttribute("role", "tabpanel");
  const activityTabId = await activity.getAttribute("id");
  await expect(activityPanel).toHaveAttribute(
    "aria-labelledby",
    activityTabId ?? "",
  );

  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(activity).toBeFocused();
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Activity" })).toBeVisible();
  await expect(page.getByRole("tabpanel", { name: "Overview" })).toBeHidden();

  await page.keyboard.press("End");
  await expect(settings).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(overview).toHaveAttribute("aria-selected", "true");
});

test("Tabs skip disabled items during keyboard navigation", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tabs--disabled-tab&viewMode=story");

  const overview = page.getByRole("tab", { name: "Overview" });
  const activity = page.getByRole("tab", { name: "Activity" });
  const settings = page.getByRole("tab", { name: "Settings" });

  await expect(activity).toBeDisabled();
  await overview.focus();
  await page.keyboard.press("ArrowRight");

  await expect(settings).toBeFocused();
  await expect(settings).toHaveAttribute("aria-selected", "true");
});

test("Manual activation moves focus without selecting until Space is pressed", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-tabs--manual-activation&viewMode=story");

  const overview = page.getByRole("tab", { name: "Overview" });
  const activity = page.getByRole("tab", { name: "Activity" });

  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(activity).toBeFocused();
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await expect(activity).toHaveAttribute("aria-selected", "false");

  await page.keyboard.press("Space");
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Activity" })).toBeVisible();
});

test("Vertical Tabs use Up and Down Arrow keys", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tabs--vertical&viewMode=story");

  const tabList = page.getByRole("tablist", { name: "Workspace sections" });
  const overview = page.getByRole("tab", { name: "Overview" });
  const activity = page.getByRole("tab", { name: "Activity" });

  await expect(tabList).toHaveAttribute("aria-orientation", "vertical");
  await overview.focus();
  await page.keyboard.press("ArrowDown");
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowUp");
  await expect(overview).toHaveAttribute("aria-selected", "true");
});

test("Horizontal Tabs respect right-to-left arrow direction", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tabs--right-to-left&viewMode=story");

  const overview = page.getByRole("tab", { name: "Overview" });
  const settings = page.getByRole("tab", { name: "Settings" });

  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(settings).toHaveAttribute("aria-selected", "true");
});

test("Controlled Tabs reflect selection changes from their owner", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tabs--controlled&viewMode=story");

  await page.getByRole("tab", { name: "Activity" }).click();

  await expect(page.getByTestId("controlled-tab-value")).toHaveText(
    "Selected section: activity",
  );
  await expect(page.getByRole("tab", { name: "Activity" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("Tabs inherit action colors from each theme and nested theme boundary", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=components-tabs--theme-coverage&viewMode=story");

  const themeBackgrounds = [];
  for (const theme of ["acme", "luna", "orchid"]) {
    const selectedTab = page.locator(
      `[data-ds-theme="${theme}"] > div > [role="tablist"] > [role="tab"][aria-selected="true"]`,
    );
    themeBackgrounds.push(
      await selectedTab.evaluate((element) => getComputedStyle(element).backgroundColor),
    );
  }
  expect(new Set(themeBackgrounds).size).toBe(3);

  await page.goto("/iframe.html?id=components-tabs--nested-theme-boundary&viewMode=story");
  const outerTab = page.getByRole("tab", { name: "Overview" }).first();
  const nestedTab = page.getByRole("tab", { name: "Activity" }).last();
  const outerColor = await outerTab.evaluate((element) => getComputedStyle(element).color);
  const nestedColor = await nestedTab.evaluate((element) => getComputedStyle(element).color);
  expect(outerColor).not.toBe(nestedColor);
});

test("Horizontal tab labels remain scrollable on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/iframe.html?id=components-tabs--scrollable-on-mobile&viewMode=story");

  const tabList = page.getByRole("tablist", { name: "Workspace sections" });
  const sizes = await tabList.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    renderedWidth: element.getBoundingClientRect().width,
  }));

  expect(sizes.scrollWidth).toBeGreaterThan(sizes.clientWidth);
  expect(sizes.renderedWidth).toBeLessThanOrEqual(375);
});

test("Full-width Tabs divide the horizontal tab-list evenly", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tabs--full-width&viewMode=story");

  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveCSS("flex-grow", "1");
  await expect(tabs.nth(1)).toHaveCSS("flex-grow", "1");
});
