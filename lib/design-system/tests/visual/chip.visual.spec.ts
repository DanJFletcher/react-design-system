import { expect, test } from "@playwright/test";

test("Selected Chips use readable theme colors and follow control radii", async ({ page }) => {
  await page.goto("/iframe.html?id=components-chip--theme-coverage&viewMode=story");

  const selectedChips = page.locator('section[data-ds-theme] span[data-selected="true"]');
  await expect(selectedChips).toHaveCount(5);

  const colors = await selectedChips.evaluateAll((elements) => {
    const parseColor = (value: string): [number, number, number] => {
      const channels = value.match(/\d+(?:\.\d+)?/g)!.map(Number);
      return [channels[0]!, channels[1]!, channels[2]!];
    };
    const luminance = (color: [number, number, number]) => {
      const channels = color.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
    };

    return elements.map((element) => {
      const styles = getComputedStyle(element);
      const foreground = luminance(parseColor(styles.color));
      const background = luminance(parseColor(styles.backgroundColor));
      const [lighter, darker] = foreground > background
        ? [foreground, background]
        : [background, foreground];
      return {
        contrast: (lighter + 0.05) / (darker + 0.05),
        borderRadius: styles.borderRadius,
      };
    });
  });

  expect(colors.every(({ contrast }) => contrast >= 4.5)).toBe(true);
  expect(colors[0]!.borderRadius).not.toBe(colors[1]!.borderRadius);
});

test("Long Chip labels wrap inside narrow layouts", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/iframe.html?id=components-chip--long-label&viewMode=story");

  const chip = page
    .getByText("A long content tag that wraps instead of overflowing its container", { exact: true })
    .locator("xpath=..");
  const dimensions = await chip.evaluate((element) => {
    const parent = element.parentElement!.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    return {
      parentRight: parent.right,
      chipRight: bounds.right,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    };
  });

  expect(dimensions.chipRight).toBeLessThanOrEqual(dimensions.parentRight + 1);
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test("Chip selection works with Enter and Space", async ({ page }) => {
  await page.goto("/iframe.html?id=components-chip--keyboard-selection&viewMode=story");

  const chip = page.getByRole("button", { name: "Keyboard filter" });
  await chip.focus();
  await page.keyboard.press("Space");
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Enter");
  await expect(chip).toHaveAttribute("aria-pressed", "false");
});

test("Chip focus remains visible in forced-colors mode", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/iframe.html?id=components-chip--keyboard-selection&viewMode=story");

  const filter = page.getByRole("button", { name: "Keyboard filter" });
  await filter.focus();
  await page.keyboard.press("Space");
  await expect(filter).toBeFocused();
  await expect(filter).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => filter.evaluate((element) => getComputedStyle(element).outlineStyle))
    .not.toBe("none");
});
