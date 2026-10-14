import { expect, test } from "@playwright/test";

test("Atom H1 and H2 have offset cyan marker highlights without changing other headings", async ({ page }) => {
  await page.goto("/iframe.html?id=foundations-atom-theme--heading-highlights&viewMode=story");
  for (const id of ["atom-marker-h1", "atom-marker-h2", "atom-marker-component"]) {
    const heading = page.getByTestId(id);
    await expect(heading).toBeVisible();
    const styles = await heading.evaluate((element) => {
      const marker = getComputedStyle(element, "::before");
      return {
        background: marker.backgroundColor,
        clip: marker.clipPath,
        transform: marker.transform,
        content: marker.content,
        color: getComputedStyle(element).color,
      };
    });
    expect(styles.background).toBe("rgb(112, 232, 255)");
    expect(styles.clip).toContain("polygon(");
    expect(styles.transform).not.toBe("none");
    expect(styles.content).toBe('""');
    expect(styles.color).toBe("rgb(17, 17, 29)");
  }
  for (const id of ["atom-marker-h3", "luna-unmarked-heading"]) {
    expect(await page.getByTestId(id).evaluate((element) =>
      getComputedStyle(element, "::before").content,
    )).toBe("none");
  }
  await page.setViewportSize({ width: 360, height: 800 });
  const wrapped = page.getByTestId("atom-marker-h2");
  expect(await wrapped.evaluate((element) =>
    element.getBoundingClientRect().height > parseFloat(getComputedStyle(element).fontSize) * 1.5,
  )).toBe(true);
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth,
  )).toBe(true);
  await page.emulateMedia({ forcedColors: "active" });
  expect(await wrapped.evaluate((element) =>
    getComputedStyle(element, "::before").content,
  )).toBe("none");
});

test("Atom uses a dark palette, thick borders, and hard shadows", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=foundations-atom-theme--playground&viewMode=story",
  );

  const theme = page.locator('[data-ds-theme="atom"]');
  const canvasStyles = await theme.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      background: styles.backgroundColor,
      backgroundImage: styles.backgroundImage,
      colorScheme: styles.colorScheme,
    };
  });
  expect(canvasStyles.background).toBe("rgb(17, 17, 29)");
  expect(canvasStyles.backgroundImage).toContain("radial-gradient");
  expect(canvasStyles.colorScheme).toBe("dark");

  const cardStyles = await page.getByTestId("atom-surface-card").evaluate((element) => {
    const styles = getComputedStyle(element);
    return { borderWidth: styles.borderTopWidth, boxShadow: styles.boxShadow };
  });
  expect(cardStyles.borderWidth).toBe("3px");
  expect(cardStyles.boxShadow).toContain("6px 6px 0px");
  expect(cardStyles.boxShadow).toContain("rgb(255, 61, 141)");

  const buttonStyles = await page.getByTestId("atom-primary-button").evaluate((element) => {
    const styles = getComputedStyle(element);
    return { borderWidth: styles.borderTopWidth, boxShadow: styles.boxShadow };
  });
  expect(buttonStyles.borderWidth).toBe("3px");
  expect(buttonStyles.boxShadow).toContain("3px 3px 0px");
  expect(buttonStyles.boxShadow).toContain("rgb(255, 61, 141)");

  const inputStyles = await page.getByTestId("atom-text-field").evaluate((element) => {
    const styles = getComputedStyle(element);
    return { borderWidth: styles.borderTopWidth, boxShadow: styles.boxShadow };
  });
  expect(inputStyles.borderWidth).toBe("3px");
  expect(inputStyles.boxShadow).toContain("3px 3px 0px");
});
