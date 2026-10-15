import { expect, test } from "@playwright/test";

test("Atom callouts have border-matching left and diagonal corner halftone strips", async ({ page }) => {
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
    expect(styles.width).toBe("8px");
    expect(styles.left).toBe("0px");
    expect(styles.top).toBe("0px");
    expect(styles.bottom).toBe("0px");
    expect(styles.background).toBe("rgba(0, 0, 0, 0)");
    expect(styles.image).toContain("radial-gradient");
    expect(styles.tile).toBe("4px 4px");
    expect(styles.pointerEvents).toBe("none");
    const corner = await callout.evaluate((element) => {
      const strip = getComputedStyle(element, "::after");
      return {
        color: strip.color,
        width: strip.width,
        height: strip.height,
        right: strip.right,
        bottom: strip.bottom,
        background: strip.backgroundColor,
        image: strip.backgroundImage,
        tile: strip.backgroundSize,
        mask: strip.maskImage,
        pointerEvents: strip.pointerEvents,
        layer: strip.zIndex,
      };
    });
    expect(corner.color).toBe(styles.borderColor);
    expect(corner.width).toBe("48px");
    expect(corner.height).toBe("48px");
    expect(corner.right).toBe("0px");
    expect(corner.bottom).toBe("0px");
    expect(corner.background).toBe("rgba(0, 0, 0, 0)");
    expect(corner.image).toBe(styles.image);
    expect(corner.tile).toBe(styles.tile);
    expect(corner.mask).toContain("linear-gradient(135deg");
    expect(corner.mask).toContain("calc(100% - 12px)");
    expect(corner.mask.endsWith("rgb(0, 0, 0) 100%)")).toBe(true);
    expect(corner.pointerEvents).toBe("none");
    expect(corner.layer).toBe("-1");
  }
  // A nested non-Atom theme must not inherit the decoration.
  await page.locator('[data-ds-theme="atom"]').evaluate((element) =>
    element.parentElement?.setAttribute("data-ds-theme", "atom"),
  );
  for (const theme of ["acme", "luna", "orchid"]) {
    for (const pseudo of ["::before", "::after"]) {
      expect(await page.locator(`[data-ds-theme="${theme}"] [data-ds-callout]`).first().evaluate((element, selector) =>
        getComputedStyle(element, selector).content,
      pseudo)).toBe("none");
    }
  }
  await callouts.first().evaluate((element) =>
    (element as HTMLElement).style.setProperty("--ds-callout-border", "#70E8FF"),
  );
  expect(await callouts.first().evaluate((element) =>
    getComputedStyle(element, "::before").color,
  )).toBe("rgb(112, 232, 255)");
  expect(await callouts.first().evaluate((element) =>
    getComputedStyle(element, "::after").color,
  )).toBe("rgb(112, 232, 255)");
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth,
  )).toBe(true);
  await page.emulateMedia({ forcedColors: "active" });
  for (const pseudo of ["::before", "::after"]) {
    expect(await callouts.first().evaluate((element, selector) =>
      getComputedStyle(element, selector).content,
    pseudo)).toBe("none");
  }
});

test("Atom H1–H6 use their layered marker colors with clipped highlights", async ({ page }) => {
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
  for (const [id, frontColor, backColor] of [
    ["atom-marker-h3", "rgb(255, 61, 141)", "rgb(112, 232, 255)"],
    ["atom-marker-h3-component", "rgb(255, 61, 141)", "rgb(112, 232, 255)"],
    ["atom-marker-h4", "rgb(0, 0, 0)", "rgb(255, 61, 141)"],
    ["atom-marker-h5", "rgb(0, 0, 0)", "rgb(255, 61, 141)"],
    ["atom-marker-h4-component", "rgb(0, 0, 0)", "rgb(255, 61, 141)"],
    ["atom-marker-h5-component", "rgb(0, 0, 0)", "rgb(255, 61, 141)"],
    ["atom-marker-h6", "rgb(150, 63, 157)", "rgb(0, 0, 0)"],
    ["atom-marker-h6-component", "rgb(150, 63, 157)", "rgb(0, 0, 0)"],
  ]) {
    const heading = page.getByTestId(id);
    await expect(heading).toBeVisible();
    const styles = await heading.evaluate((element) => {
      const front = getComputedStyle(element, "::before");
      const back = getComputedStyle(element, "::after");
      const frontOffset = new DOMMatrixReadOnly(front.transform);
      const backOffset = new DOMMatrixReadOnly(back.transform);
      return {
        frontColor: front.backgroundColor,
        backColor: back.backgroundColor,
        clip: front.clipPath,
        backClip: back.clipPath,
        color: getComputedStyle(element).color,
        frontX: frontOffset.m41,
        frontY: frontOffset.m42,
        frontLayer: Number(front.zIndex),
        backX: backOffset.m41,
        backY: backOffset.m42,
        backLayer: Number(back.zIndex),
      };
    });
    expect(styles.frontColor).toBe(frontColor);
    expect(styles.backColor).toBe(backColor);
    expect(styles.clip).toContain("polygon(");
    expect(styles.backClip).toBe(styles.clip);
    expect(styles.color).toBe("rgb(251, 248, 255)");
    expect(styles.frontX).toBeGreaterThan(0);
    expect(styles.frontY).toBeGreaterThan(0);
    expect(styles.backX).toBeLessThan(0);
    expect(styles.backY).toBeLessThan(0);
    expect(styles.backLayer).toBeLessThan(styles.frontLayer);
  }
  for (const id of ["luna-unmarked-heading", "luna-unmarked-h4", "luna-unmarked-h5", "luna-unmarked-h6"]) {
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
  for (const id of ["atom-marker-h2", "atom-marker-h3", "atom-marker-h4", "atom-marker-h5", "atom-marker-h6"]) {
    for (const pseudo of ["::before", "::after"]) {
      expect(await page.getByTestId(id).evaluate((element, selector) =>
        getComputedStyle(element, selector).content,
      pseudo)).toBe("none");
    }
  }
});

test("Atom Heading and Text components do not receive surface shadows", async ({ page }) => {
  await page.goto("/iframe.html?id=components-typography--theme-coverage&viewMode=story");
  const atom = page.locator('[data-ds-theme="atom"]');
  const typography = [
    atom.getByRole("heading", { name: "ATOM heading" }),
    atom.getByText("Themeable label role"),
    atom.getByText("Primary text follows the active theme."),
    atom.getByText("Muted text follows the active theme."),
  ];

  for (const element of typography) {
    await expect(element).toBeVisible();
    expect(await element.evaluate((node) => getComputedStyle(node).boxShadow)).toBe("none");
  }
});

test("Atom button and field groups stay flat while preserving standalone controls", async ({ page }) => {
  await page.goto("/iframe.html?id=components-button-group--theme-coverage&viewMode=story");
  const buttonGroupTheme = page.locator('[data-ds-theme="atom"]');
  const buttonGroups = buttonGroupTheme.locator("[data-ds-button-group]");
  await expect(buttonGroups).toHaveCount(2);
  for (const group of await buttonGroups.all()) {
    expect(await group.evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");
    for (const button of await group.locator(":scope > button").all()) {
      expect(await button.evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");
    }
  }

  await page.goto("/iframe.html?id=components-form-controls--theme-coverage&viewMode=story");
  const formTheme = page.locator('[data-ds-theme="atom"]');
  const fieldGroup = formTheme.locator("[data-ds-field-group]");
  await expect(fieldGroup).toBeVisible();
  expect(await fieldGroup.evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");
  expect(await formTheme.getByRole("textbox", { name: "Workspace name" }).evaluate(
    (element) => getComputedStyle(element).boxShadow,
  )).not.toBe("none");
});

test("Atom accordion H3 markers stay on title spans with full-width click targets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-accordion--theme-coverage&viewMode=story");
  const accordion = page.getByRole("group", { name: "atom questions" });
  const trigger = accordion.getByRole("button").first();
  const heading = accordion.locator("h3").first();
  const title = trigger.locator("[data-ds-accordion-title]");
  await expect(trigger).toBeVisible();
  const geometry = await title.evaluate((element) => {
    const trigger = element.closest("button")!;
    const icon = trigger.querySelector("svg")!;
    return {
      titleRight: element.getBoundingClientRect().right,
      iconLeft: icon.getBoundingClientRect().left,
      titleWidth: element.getBoundingClientRect().width,
      triggerWidth: trigger.getBoundingClientRect().width,
      front: getComputedStyle(element, "::before").backgroundColor,
      back: getComputedStyle(element, "::after").backgroundColor,
    };
  });
  expect(geometry.front).toBe("rgb(255, 61, 141)");
  expect(geometry.back).toBe("rgb(112, 232, 255)");
  expect(geometry.titleRight).toBeLessThan(geometry.iconLeft);
  expect(geometry.titleWidth).toBeLessThan(geometry.triggerWidth);
  for (const pseudo of ["::before", "::after"]) {
    expect(await heading.evaluate((element, pseudo) =>
      getComputedStyle(element, pseudo).content, pseudo)).toBe("none");
  }
  const bounds = await trigger.boundingBox();
  await trigger.click({ position: { x: bounds!.width - 8, y: bounds!.height / 2 } });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.emulateMedia({ forcedColors: "active" });
  for (const pseudo of ["::before", "::after"]) {
    expect(await title.evaluate((element, pseudo) =>
      getComputedStyle(element, pseudo).content, pseudo)).toBe("none");
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
