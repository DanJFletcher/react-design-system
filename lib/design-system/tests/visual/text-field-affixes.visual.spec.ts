import { expect, test } from "@playwright/test";

test("TextField affixes retain keyboard focus and fit narrow containers", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-form-controls--text-field-prefixes-and-suffixes&viewMode=story",
  );

  const budget = page.getByRole("spinbutton", { name: "Monthly budget" });
  const website = page.getByRole("textbox", { name: "Website" });
  const check = page.getByRole("button", { name: "Check" });

  await budget.click();
  await expect(budget).toBeFocused();
  const outlineStyle = await budget.evaluate((input) =>
    getComputedStyle(input.parentElement!).outlineStyle,
  );
  expect(outlineStyle).not.toBe("none");
  await page.keyboard.press("Tab");
  await expect(website).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(check).toBeFocused();

  await page.setViewportSize({ width: 320, height: 640 });
  const dimensions = await budget.evaluate((input) => {
    const group = input.parentElement!.getBoundingClientRect();
    return {
      groupLeft: group.left,
      groupRight: group.right,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(dimensions.groupLeft).toBeGreaterThanOrEqual(0);
  expect(dimensions.groupRight).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("TextField affixes render in all built-in themes", async ({ page }) => {
  await page.goto("/iframe.html?id=components-form-controls--theme-coverage&viewMode=story");

  const budgetFields = page.getByRole("spinbutton", { name: "Monthly budget" });
  await expect(budgetFields).toHaveCount(5);
  for (const field of await budgetFields.all()) {
    await expect(field).toBeVisible();
    await expect(field.locator("..")).toBeVisible();
  }
});
