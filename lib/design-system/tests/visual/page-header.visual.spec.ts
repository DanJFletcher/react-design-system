import { expect, test } from "@playwright/test";

const playgroundUrl = "/iframe.html?id=components-page-header--playground&viewMode=story";
const narrowLayoutUrl = "/iframe.html?id=components-page-header--narrow-layout&viewMode=story";

test("PageHeader places actions beside page copy on wide layouts", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(playgroundUrl);

  const heading = page.getByRole("heading", { level: 1, name: "Content dashboard" });
  const action = page.getByRole("button", { name: "Create page" });
  await expect(heading).toBeVisible();
  await expect(action).toBeVisible();

  const headingBox = await heading.boundingBox();
  const actionBox = await action.boundingBox();
  expect(headingBox).not.toBeNull();
  expect(actionBox).not.toBeNull();
  expect(actionBox!.x).toBeGreaterThan(headingBox!.x);
});

test("PageHeader stacks actions below long content on narrow layouts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(narrowLayoutUrl);

  const heading = page.getByRole("heading", { level: 1, name: "Your team's publishing workspace" });
  const action = page.getByRole("button", { name: "Create post" });
  await expect(heading).toBeVisible();
  await expect(action).toBeVisible();

  const headingBox = await heading.boundingBox();
  const actionBox = await action.boundingBox();
  expect(headingBox).not.toBeNull();
  expect(actionBox).not.toBeNull();
  expect(actionBox!.y).toBeGreaterThan(headingBox!.y);
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
});
