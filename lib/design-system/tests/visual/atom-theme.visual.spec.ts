import { expect, test } from "@playwright/test";

test("Atom callouts have a transparent 12px left halftone strip matching each border", async ({ page }) => {
  await page.goto("/iframe.html?id=components-callout--theme-coverage&viewMode=story");
  const callouts = page.locator('section[data-ds-theme="atom"] [data-ds-callout]');
  await expect(callouts).toHaveCount(5);
  for (const callout of await callouts.all()) {
    const styles = await callout.evaluate((element) => {
      const root = getComputedStyle(element);
      const strip = getComputedStyle(element, "::before");
      return {
        borderColor: root.borderTopColor,
        color: strip.color,
        width: strip.width,
        left: strip.left,
        top: strip.top,
        bottom: strip.bottom,
        background: strip.backgroundColor,
        image: strip.backgroundImage,
        tile: strip.backgroundSize,
        pointerEvents: strip.pointerEvents,
      };
    });
    expect(styles.color).toBe(styles.borderColor);
    expect(styles.width).toBe("12px");
    expect(styles.left).toBe("0px");
    expect(styles.top).toBe("0px");
    expect(styles.bottom).toBe("0px");
    expect(styles.background).toBe("rgba(0, 0, 0, 0)");
    expect(styles.image).toContain("radial-gradient");
    expect(styles.tile).toBe("4px 4px");
    expect(styles.pointerEvents).toBe("none");
  }
  // A nested non-Atom theme must not inherit the decoration.
  await page.locator('[data-ds-theme="atom"]').evaluate((element) =>
    element.parentElement?.setAttribute("data-ds-theme", "atom"),
  );
  for (const theme of ["acme", "luna", "orchid"]) {
    expect(await page.locator(`[data-ds-theme="${theme}"] [data-ds-callout]`).first().evaluate((element) =>
      getComputedStyle(element, "::before").content,
    )).toBe("none");
  }
  await callouts.first().evaluate((element) =>
    (element as HTMLElement).style.setProperty("--ds-callout-border", "#70E8FF"),
  );
  expect(await callouts.first().evaluate((element) =>
    getComputedStyle(element, "::before").color,
  )).toBe("rgb(112, 232, 255)");
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth,
  )).toBe(true);
  await page.emulateMedia({ forcedColors: "active" });
  expect(await callouts.first().evaluate((element) =>
    getComputedStyle(element, "::before").content,
  )).toBe("none");
});

test("Atom H1 and H2 layer top-left yellow behind bottom-right cyan marker highlights", async ({ page }) => {
  await page.goto("/iframe.html?id=foundations-atom-theme--heading-highlights&viewMode=story");
  for (const id of ["atom-marker-h1", "atom-marker-h2", "atom-marker-component"]) {
    const heading = page.getByTestId(id);
    await expect(heading).toBeVisible();
    const styles = await heading.evaluate((element) => {
      const marker = getComputedStyle(element, "::before");
      const yellow = getComputedStyle(element, "::after");
      const cyanOffset = new DOMMatrixReadOnly(marker.transform);
      const yellowOffset = new DOMMatrixReadOnly(yellow.transform);
      return {
        background: marker.backgroundColor,
        clip: marker.clipPath,
        transform: marker.transform,
        content: marker.content,
        color: getComputedStyle(element).color,
        cyanX: cyanOffset.m41,
        cyanY: cyanOffset.m42,
        cyanLayer: Number(marker.zIndex),
        yellowBackground: yellow.backgroundColor,
        yellowClip: yellow.clipPath,
        yellowContent: yellow.content,
        yellowX: yellowOffset.m41,
        yellowY: yellowOffset.m42,
        yellowLayer: Number(yellow.zIndex),
      };
    });
    expect(styles.background).toBe("rgb(112, 232, 255)");
    expect(styles.clip).toContain("polygon(");
    expect(styles.transform).not.toBe("none");
    expect(styles.content).toBe('""');
    expect(styles.color).toBe("rgb(17, 17, 29)");
    expect(styles.cyanX).toBeGreaterThan(0);
    expect(styles.cyanY).toBeGreaterThan(0);
    expect(styles.yellowBackground).toBe("rgb(255, 224, 90)");
    expect(styles.yellowClip).toBe(styles.clip);
    expect(styles.yellowContent).toBe('""');
    expect(styles.yellowX).toBeLessThan(0);
    expect(styles.yellowY).toBeLessThan(0);
    expect(styles.yellowLayer).toBeLessThan(styles.cyanLayer);
  }
  for (const id of ["atom-marker-h3", "luna-unmarked-heading"]) {
    for (const pseudo of ["::before", "::after"]) {
      expect(await page.getByTestId(id).evaluate((element, selector) =>
        getComputedStyle(element, selector).content,
      pseudo)).toBe("none");
    }
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
  for (const pseudo of ["::before", "::after"]) {
    expect(await wrapped.evaluate((element, selector) =>
      getComputedStyle(element, selector).content,
    pseudo)).toBe("none");
  }
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
    return {
      backgroundImage: styles.backgroundImage,
      borderWidth: styles.borderTopWidth,
      boxShadow: styles.boxShadow,
    };
  });
  expect(buttonStyles.borderWidth).toBe("3px");
  expect(buttonStyles.boxShadow).toContain("3px 3px 0px");
  expect(buttonStyles.boxShadow).toContain("rgb(255, 61, 141)");
  expect(buttonStyles.backgroundImage).toContain("linear-gradient(135deg");
  const darkStop = buttonStyles.backgroundImage.indexOf("rgba(0, 0, 0, 0.22)");
  const lightStop = buttonStyles.backgroundImage.indexOf("rgba(255, 255, 255, 0.28)");
  expect(darkStop).toBeGreaterThanOrEqual(0);
  expect(lightStop).toBeGreaterThan(darkStop);

  const secondaryButton = page.getByTestId("atom-secondary-button");
  expect(await secondaryButton.evaluate((element) =>
    getComputedStyle(element).backgroundImage,
  )).toContain("linear-gradient(135deg");

  const ghostButton = page.getByTestId("atom-ghost-button");
  const ghostStyles = await ghostButton.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundImage: styles.backgroundImage,
      borderColor: styles.borderTopColor,
      borderStyle: styles.borderTopStyle,
      borderWidth: styles.borderTopWidth,
      boxShadow: styles.boxShadow,
    };
  });
  expect(ghostStyles.backgroundImage).toBe("none");
  expect(ghostStyles.borderWidth).toBe("1px");
  expect(ghostStyles.borderStyle).toBe("solid");
  expect(ghostStyles.borderColor).toBe("rgb(255, 61, 141)");
  expect(ghostStyles.boxShadow).toContain("rgb(255, 61, 141)");
  await ghostButton.hover();
  expect(await ghostButton.evaluate((element) =>
    getComputedStyle(element).backgroundImage,
  )).toContain("linear-gradient(135deg");
  await page.emulateMedia({ forcedColors: "active" });
  expect(await secondaryButton.evaluate((element) =>
    getComputedStyle(element).backgroundImage,
  )).toBe("none");
  expect(await ghostButton.evaluate((element) =>
    getComputedStyle(element).borderColor,
  )).not.toBe("rgb(255, 61, 141)");
  await page.emulateMedia({ forcedColors: "none" });

  const inputStyles = await page.getByTestId("atom-text-field").evaluate((element) => {
    const styles = getComputedStyle(element);
    return { borderWidth: styles.borderTopWidth, boxShadow: styles.boxShadow };
  });
  expect(inputStyles.borderWidth).toBe("3px");
  expect(inputStyles.boxShadow).toContain("3px 3px 0px");
});
