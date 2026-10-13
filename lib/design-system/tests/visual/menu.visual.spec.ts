import { expect, test } from "@playwright/test";

test("Menu opens, exposes items, closes outside, and restores focus on Escape", async ({ page }) => {
  await page.goto("/iframe.html?id=components-menu--playground&viewMode=story");

  const trigger = page.getByRole("button", { name: "Workspace" });
  const menu = page.getByRole("menu", { name: "Workspace actions" });

  await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("separator")).toHaveCount(2);
  await expect(menu.getByRole("menuitem", { name: "Archived projects" })).toBeDisabled();

  await page.mouse.click(8, 8);
  await expect(menu).not.toBeVisible();

  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("Menu supports keyboard navigation into and back out of nested menus", async ({ page }) => {
  await page.goto("/iframe.html?id=components-menu--open-preview&viewMode=story");

  const trigger = page.getByRole("button", { name: "Workspace" });
  const firstItem = page.getByRole("menuitem", { name: "New project" });
  const submenuTrigger = page.getByRole("menuitem", { name: "View" });
  await expect(firstItem).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(submenuTrigger).toBeFocused();
  await page.keyboard.press("ArrowRight");

  const submenu = page.getByRole("menu", { name: "View" });
  await expect(submenu).toBeVisible();
  await expect(submenu.getByRole("menuitem", { name: "Grid view" })).toBeFocused();

  await page.keyboard.press("ArrowLeft");
  await expect(submenuTrigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("menu", { name: "Workspace actions" })).not.toBeVisible();
});

test("Menu follows theme tokens and accepts scoped component-hook overrides", async ({ page }) => {
  await page.goto("/iframe.html?id=components-menu--theme-coverage&viewMode=story");

  await page.getByRole("button", { name: "acme actions" }).click();
  const acmeMenu = page.getByRole("menu", { name: "acme workspace actions" });
  const acmeSurface = await acmeMenu.evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect.poll(() => acmeMenu.evaluate((element) =>
    getComputedStyle(element).borderTopLeftRadius,
  )).toBe("6px");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "luna actions" }).click();
  const lunaMenu = page.getByRole("menu", { name: "luna workspace actions" });
  const lunaSurface = await lunaMenu.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(lunaSurface).not.toBe(acmeSurface);
  await expect.poll(() => lunaMenu.evaluate((element) =>
    getComputedStyle(element).borderTopLeftRadius,
  )).toBe("32px");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "orchid actions" }).click();
  const orchidMenu = page.getByRole("menu", { name: "orchid workspace actions" });
  await expect.poll(() => orchidMenu.evaluate((element) =>
    getComputedStyle(element).borderTopLeftRadius,
  )).toBe("16px");

  await page.goto("/iframe.html?id=components-menu--scoped-hook-overrides&viewMode=story");
  await page.getByRole("button", { name: "Default menu" }).click();
  const defaultMenu = page.getByRole("menu", { name: "Default actions" });
  const defaultRadius = await defaultMenu.evaluate((element) => getComputedStyle(element).borderTopLeftRadius);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Rounded custom menu" }).click();
  const customMenu = page.getByRole("menu", { name: "Custom actions" });
  const customRadius = await customMenu.evaluate((element) => getComputedStyle(element).borderTopLeftRadius);
  expect(customRadius).not.toBe(defaultRadius);
});
