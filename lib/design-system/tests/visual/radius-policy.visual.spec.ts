import { expect, test, type Locator } from "@playwright/test";

async function expectCorners(locator: Locator, value: string) {
  await expect(locator).toBeVisible();
  for (const corner of ["top-left", "top-right", "bottom-right", "bottom-left"]) {
    await expect(locator).toHaveCSS(`border-${corner}-radius`, value);
  }
}

test("surfaces and controls use distinct computed corners in every theme", async ({ page }) => {
  await page.goto("/iframe.html?id=foundations-radius-policy--theme-comparison&viewMode=story");
  for (const theme of ["acme", "luna", "orchid"]) {
    const scope = page.locator(`[data-ds-theme="${theme}"]`).filter({ has: page.getByTestId(`${theme}-card`) }).last();
    const surface = theme === "luna" ? "24px" : "12px";
    const specialized = theme === "luna" ? "24px" : theme === "acme" ? "6px" : "16px";
    const control = theme === "luna" ? "9999px" : specialized;
    for (const name of ["card", "code", "callout", "carousel", "pricing", "contact"]) {
      await expectCorners(page.getByTestId(`${theme}-${name}`), surface);
    }
    await expectCorners(page.getByTestId(`${theme}-card`).locator('[data-slot="media"]'), surface);
    await expectCorners(scope.locator('[class*="_viewport_"]'), surface);
    await expectCorners(scope.locator('[class*="_item_"]').filter({ has: page.getByRole("button", { name: `${theme}: Why separate radius roles?` }) }), surface);
    await expectCorners(page.getByTestId(`${theme}-group`), specialized);
    await expectCorners(page.getByRole("textbox", { name: `${theme} notes` }), specialized);
    await expectCorners(page.getByRole("textbox", { name: `${theme} name` }), control);
    await expectCorners(page.getByRole("combobox", { name: `${theme} region` }), control);
    await expectCorners(page.getByTestId(`${theme}-button`), control);
    const toggle = page.getByRole("switch", { name: `${theme} updates` });
    await expectCorners(toggle, "9999px");
    expect(await toggle.evaluate((element) => getComputedStyle(element, "::before").borderTopLeftRadius)).toBe("9999px");
  }
});

test("explicit shapes, custom overrides and nested boundaries retain precedence", async ({ page }) => {
  await page.goto("/iframe.html?id=foundations-radius-policy--overrides-and-shapes&viewMode=story");
  for (const [name, radius] of [
    ["square-card", "0px"], ["custom-card", "40px"], ["outer-card", "32px"],
    ["nested-card", "12px"], ["nested-luna-card", "24px"], ["semantic-override-card", "18px"],
    ["unchanged-pill", "9999px"], ["square-pricing", "0px"],
    ["square-button", "0px"], ["rounded-button", "12px"], ["pill-button", "9999px"],
  ]) {
    await expectCorners(page.getByTestId(name!), radius!);
  }
  await expectCorners(page.locator('[class*="_item_"]').filter({ has: page.getByRole("button", { name: "Square question" }) }), "0px");
});

test("Luna surfaces remain bounded at phone width without horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=foundations-radius-policy--luna-surfaces&viewMode=story");
  for (const name of ["card", "code", "callout", "carousel", "pricing", "contact", "group"]) {
    await expectCorners(page.getByTestId(`Luna-${name}`), "24px");
  }
  await expectCorners(page.getByRole("textbox", { name: "Luna notes" }), "24px");
  await expectCorners(page.getByTestId("Luna-button"), "9999px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("Luna overlay surfaces stay bounded while their action buttons remain pills", async ({ page }) => {
  const globals = "&globals=theme:luna";
  await page.goto(`/iframe.html?id=components-tooltip--playground&viewMode=story${globals}`);
  await page.getByRole("button", { name: "More information" }).focus();
  await expectCorners(page.getByRole("tooltip"), "24px");

  await page.goto(`/iframe.html?id=components-menu--playground&viewMode=story${globals}`);
  const trigger = page.getByRole("button", { name: "Workspace" });
  if (await trigger.getAttribute("aria-expanded") !== "true") await trigger.click();
  await expectCorners(page.getByRole("menu").first(), "24px");
  await expectCorners(trigger, "9999px");

  await page.goto(`/iframe.html?id=components-dialog--playground&viewMode=story${globals}`);
  await page.getByRole("button", { name: "Open dialog" }).click();
  await expectCorners(page.getByRole("dialog"), "24px");
  await expectCorners(page.getByRole("button", { name: "Close dialog" }), "9999px");

  await page.goto(`/iframe.html?id=components-toast--playground&viewMode=story${globals}`);
  await page.getByRole("button", { name: "Show toast" }).click();
  await expectCorners(page.getByRole("status"), "24px");
});
