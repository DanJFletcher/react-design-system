import { expect, test } from "@playwright/test";

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

  const buttonStyles = await page.getByTestId("atom-primary-button").evaluate((element) => {
    const styles = getComputedStyle(element);
    return { borderWidth: styles.borderTopWidth, boxShadow: styles.boxShadow };
  });
  expect(buttonStyles.borderWidth).toBe("3px");
  expect(buttonStyles.boxShadow).toContain("3px 3px 0px");

  const inputStyles = await page.getByTestId("atom-text-field").evaluate((element) => {
    const styles = getComputedStyle(element);
    return { borderWidth: styles.borderTopWidth, boxShadow: styles.boxShadow };
  });
  expect(inputStyles.borderWidth).toBe("3px");
  expect(inputStyles.boxShadow).toContain("3px 3px 0px");
});
