import { expect, test } from "@playwright/test";

test("Callout is persistent content with optional decorative icons and no implicit live region", async ({ page }) => {
  await page.goto("/iframe.html?id=components-callout--icon-selector&viewMode=story");

  const callout = page.locator('[data-tone="success"]');
  await expect(callout).toBeVisible();
  expect(await callout.getAttribute("role")).toBeNull();
  expect(await callout.getAttribute("aria-live")).toBeNull();
  await expect(callout).toContainText("Workspace updated");
  await expect(callout.locator('[aria-hidden="true"] [data-icon="check"]')).toBeVisible();
});

test("Callout tones maintain readable contrast and a shared outline in every built-in theme", async ({ page }) => {
  await page.goto("/iframe.html?id=components-callout--theme-coverage&viewMode=story");

  const callouts = page.locator("[data-ds-theme] [data-tone]");
  await expect(callouts).toHaveCount(15);

  const styles = await callouts.evaluateAll((elements) =>
    elements.map((element) => {
      const computed = getComputedStyle(element);
      return {
        color: computed.color,
        background: computed.backgroundColor,
        border: computed.borderTopColor,
        borderWidth: computed.borderTopWidth,
      };
    }),
  );

  for (const { color, background } of styles) {
    expect(contrastRatio(color, background)).toBeGreaterThanOrEqual(4.5);
  }

  for (let themeStart = 0; themeStart < styles.length; themeStart += 5) {
    const neutralOutline = styles[themeStart + 4]!;
    for (let toneIndex = 0; toneIndex < 5; toneIndex += 1) {
      expect(styles[themeStart + toneIndex]!.border).toBe(neutralOutline.border);
      expect(styles[themeStart + toneIndex]!.borderWidth).toBe(neutralOutline.borderWidth);
    }
  }
});

test("Callout actions retain native button behavior without dismissing the message", async ({ page }) => {
  await page.goto("/iframe.html?id=components-callout--action&viewMode=story");

  const callout = page.getByText("Review before publishing");
  await expect(callout).toBeVisible();
  await page.getByRole("button", { name: "Review changes" }).click();
  await expect(page.getByRole("status")).toHaveText("Changes reviewed.");
  await expect(callout).toBeVisible();
});

test("Callout follows nested theme boundaries and scoped hook overrides", async ({ page }) => {
  await page.goto("/iframe.html?id=components-callout--nested-theme-boundary&viewMode=story");
  const acme = page.locator('[data-ds-theme="acme"] > [data-tone="success"]');
  const luna = page.locator('[data-ds-theme="luna"] [data-tone="success"]');
  await expect(acme).toBeVisible();
  await expect(luna).toBeVisible();
  const backgrounds = await Promise.all(
    [acme, luna].map((callout) => callout.evaluate((element) => getComputedStyle(element).backgroundColor)),
  );
  expect(backgrounds[0]).not.toBe(backgrounds[1]);

  await page.goto("/iframe.html?id=components-callout--custom-hooks&viewMode=story");
  const custom = page.locator('[data-tone="info"]');
  await expect(custom).toBeVisible();
  const styles = await custom.evaluate((element) => {
    const computed = getComputedStyle(element);
    const warningSurfaceProbe = document.createElement("span");
    warningSurfaceProbe.style.backgroundColor = "var(--ds-color-status-warning-bg)";
    element.parentElement?.append(warningSurfaceProbe);
    const warningSurface = getComputedStyle(warningSurfaceProbe).backgroundColor;
    warningSurfaceProbe.remove();
    return {
      radius: computed.borderRadius,
      background: computed.backgroundColor,
      warningSurface,
      text: computed.color,
      accent: computed.borderInlineStartColor,
    };
  });
  expect(styles.radius).toBe("24px");
  expect(styles.background).toBe(styles.warningSurface);
  expect(styles.text).toBe(styles.accent);
});

test("Callout long content wraps within a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto("/iframe.html?id=components-callout--long-content&viewMode=story");

  const callout = page.locator('[data-tone="info"]');
  await expect(callout).toBeVisible();
  const dimensions = await callout.evaluate((element) => ({
    width: element.clientWidth,
    contentWidth: element.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.width);
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

function contrastRatio(foreground: string, background: string) {
  const luminance = (color: string) => {
    const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length !== 3) {
      throw new Error(`Unexpected computed color: ${color}`);
    }
    const [r, g, b] = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };

  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}
