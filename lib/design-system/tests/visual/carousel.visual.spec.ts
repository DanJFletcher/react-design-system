import { expect, test } from "@playwright/test";

test("Carousel buttons, indicators, keyboard navigation, and slide focus state work", async ({ page }) => {
  await page.goto("/iframe.html?id=components-carousel--playground&viewMode=story");

  const carousel = page.getByRole("region", { name: "Featured stories" });
  await expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
  await expect(carousel.getByRole("group", { name: "Find your focus, 1 of 3" })).toBeVisible();
  await expect(carousel.locator('[data-slot="rotation-toggle"]')).toHaveCount(0);
  await expect(carousel.getByRole("button", { name: "Previous slide" })).toBeEnabled();
  await expect(carousel.locator('button[aria-label="Previous slide"] [data-icon="chevron-left"]'))
    .toBeVisible();
  await expect(carousel.locator('button[aria-label="Next slide"] [data-icon="chevron-right"]'))
    .toBeVisible();

  await carousel.getByRole("button", { name: "Previous slide" }).click();
  await expect(carousel.getByRole("group", { name: "Move forward, 3 of 3" })).toBeVisible();
  await carousel.getByRole("button", { name: "Next slide" }).click();
  await expect(carousel.getByRole("group", { name: "Find your focus, 1 of 3" })).toBeVisible();
  await carousel.getByRole("button", { name: "Next slide" }).click();
  await expect(carousel.getByRole("group", { name: "Build your flow, 2 of 3" })).toBeVisible();
  await expect(carousel.locator('[data-slot="slide"]').nth(0)).toHaveAttribute("inert");

  await carousel.focus();
  await page.keyboard.press("End");
  await expect(carousel.getByRole("group", { name: "Move forward, 3 of 3" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(carousel.getByRole("group", { name: "Find your focus, 1 of 3" })).toBeVisible();

  await page.getByRole("button", { name: "Go to slide 2" }).click();
  await expect(carousel.getByRole("group", { name: "Build your flow, 2 of 3" })).toBeVisible();
});

test("Carousel indicator targets resize independently from their markers and wrap on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-carousel--indicator-target-sizes&viewMode=story");

  const comfortable = page.getByRole("region", { name: "Comfortable indicator targets" });
  const compact = page.getByRole("region", { name: "Compact indicator targets" });
  const comfortableIndicators = comfortable.locator('[data-slot="indicators"]');
  const compactIndicators = compact.locator('[data-slot="indicators"]');
  const comfortableFirst = comfortableIndicators.getByRole("button", {
    name: "Go to slide 1",
    exact: true,
  });
  const comfortableSecond = comfortableIndicators.getByRole("button", {
    name: "Go to slide 2",
    exact: true,
  });
  const compactFirst = compactIndicators.getByRole("button", {
    name: "Go to slide 1",
    exact: true,
  });

  await expect(comfortableIndicators).toHaveAttribute("data-target-size", "comfortable");
  await expect(compactIndicators).toHaveAttribute("data-target-size", "compact");

  const comfortableTargetBox = await comfortableFirst.boundingBox();
  const compactTargetBox = await compactFirst.boundingBox();
  expect(comfortableTargetBox?.width).toBe(44);
  expect(comfortableTargetBox?.height).toBe(44);
  expect(compactTargetBox?.width).toBe(24);
  expect(compactTargetBox?.height).toBe(24);

  const markerSizes = await Promise.all(
    [comfortableFirst, comfortableSecond, compactFirst].map((button) =>
      button.evaluate((element) => {
        const marker = getComputedStyle(element, "::before");
        return { width: marker.width, height: marker.height };
      }),
    ),
  );
  expect(markerSizes).toEqual([
    { width: "20px", height: "8px" },
    { width: "8px", height: "8px" },
    { width: "20px", height: "8px" },
  ]);

  await comfortable.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(comfortableFirst).toBeFocused();
  const focusStyle = await comfortableFirst.evaluate((element) => ({
    visible: element.matches(":focus-visible"),
    outlineStyle: getComputedStyle(element).outlineStyle,
    outlineWidth: getComputedStyle(element).outlineWidth,
  }));
  expect(focusStyle).toEqual({ visible: true, outlineStyle: "solid", outlineWidth: "3px" });

  await page.keyboard.press("Tab");
  await expect(comfortableSecond).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(comfortable).toHaveAttribute("data-index", "1");
  await expect(comfortableSecond).toHaveAttribute("aria-current", "true");
  await expect(comfortable.getByRole("group", { name: "Gallery item 2, 2 of 12" })).toBeVisible();

  await compactIndicators.getByRole("button", { name: "Go to slide 12" }).click();
  await expect(compact).toHaveAttribute("data-index", "11");
  await expect(compact.getByRole("group", { name: "Gallery item 12, 12 of 12" })).toBeVisible();

  for (const carousel of [comfortable, compact]) {
    const controls = carousel.locator('[data-slot="controls"]');
    const indicators = carousel.locator('[data-slot="indicators"]');
    const controlsBox = await controls.boundingBox();
    const indicatorsBox = await indicators.boundingBox();
    const previousBox = await carousel.getByRole("button", { name: "Previous slide" }).boundingBox();
    const nextBox = await carousel.getByRole("button", { name: "Next slide" }).boundingBox();
    expect(controlsBox).not.toBeNull();
    expect(indicatorsBox).not.toBeNull();
    expect(previousBox).not.toBeNull();
    expect(nextBox).not.toBeNull();
    expect(indicatorsBox!.height).toBeGreaterThan(44);
    expect(indicatorsBox!.x).toBeGreaterThanOrEqual(controlsBox!.x);
    expect(indicatorsBox!.x + indicatorsBox!.width)
      .toBeLessThanOrEqual(controlsBox!.x + controlsBox!.width);

    const intersects = (
      first: NonNullable<typeof indicatorsBox>,
      second: NonNullable<typeof previousBox>,
    ) =>
      first.x < second.x + second.width &&
      first.x + first.width > second.x &&
      first.y < second.y + second.height &&
      first.y + first.height > second.y;
    expect(intersects(indicatorsBox!, previousBox!)).toBe(false);
    expect(intersects(indicatorsBox!, nextBox!)).toBe(false);
  }

  const dimensions = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("Carousel disables navigation at non-looping boundaries", async ({ page }) => {
  await page.goto("/iframe.html?id=components-carousel--controls-examples&viewMode=story");

  const carousel = page.getByRole("region", { name: "Fraction indicator example" });
  await expect(carousel.getByRole("button", { name: "Previous slide" })).toBeDisabled();
  await expect(carousel.getByRole("button", { name: "Next slide" })).toBeEnabled();
});

test("Carousel overlay safe area keeps slide content clear at desktop and phone widths", async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/iframe.html?id=components-carousel--controls-examples&viewMode=story");

    const safe = page.getByRole("region", { name: "Safe overlay controls example" });
    const safeSlide = safe.locator('[data-slot="slide"][data-active="true"]');
    const safeControls = safe.locator('[data-slot="controls"]');
    const safeViewport = safe.locator('[data-slot="viewport"]');
    await expect(safe.locator('[data-slot="viewport"]')).toHaveAttribute(
      "data-overlay-safe-area",
      "true",
    );
    const controlPosition = await safeControls.evaluate((element) => getComputedStyle(element).position);

    if (width <= 576) {
      expect(controlPosition).toBe("static");
      expect(
        await safeSlide.evaluate((element) => getComputedStyle(element).paddingInlineStart),
      ).toBe("0px");
      const viewportBox = await safeViewport.boundingBox();
      const controlsBox = await safeControls.boundingBox();
      expect(viewportBox).not.toBeNull();
      expect(controlsBox).not.toBeNull();
      expect(controlsBox!.y).toBeGreaterThanOrEqual(viewportBox!.y + viewportBox!.height);
    } else {
      expect(controlPosition).toBe("absolute");
      expect(
        await safeSlide.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingInlineStart)),
      ).toBeGreaterThan(0);

      const heading = safeSlide.getByRole("heading", { name: "Find your focus" });
      const headingBox = await heading.boundingBox();
      const previousBox = await safe.getByRole("button", { name: "Previous slide" }).boundingBox();
      const nextBox = await safe.getByRole("button", { name: "Next slide" }).boundingBox();
      const indicatorBox = await safe.locator('[data-slot="indicators"]').boundingBox();
      expect(headingBox).not.toBeNull();
      expect(previousBox).not.toBeNull();
      expect(nextBox).not.toBeNull();
      expect(indicatorBox).not.toBeNull();

      const intersects = (a: NonNullable<typeof headingBox>, b: NonNullable<typeof previousBox>) =>
        a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
      expect(intersects(headingBox!, previousBox!)).toBe(false);
      expect(intersects(headingBox!, nextBox!)).toBe(false);
      expect(intersects(headingBox!, indicatorBox!)).toBe(false);
    }

    const fullBleed = page.getByRole("region", { name: "Full-bleed overlay controls example" });
    const fullBleedViewport = fullBleed.locator('[data-slot="viewport"]');
    const fullBleedSlide = fullBleed.locator('[data-slot="slide"][data-active="true"]');
    const fullBleedControls = fullBleed.locator('[data-slot="controls"]');
    await expect(fullBleedViewport).not.toHaveAttribute("data-overlay-safe-area", "true");
    expect(
      await fullBleedSlide.evaluate((element) => getComputedStyle(element).paddingInlineStart),
    ).toBe("0px");
    if (width <= 576) {
      expect(await fullBleedControls.evaluate((element) => getComputedStyle(element).position))
        .toBe("static");
      const viewportBox = await fullBleedViewport.boundingBox();
      const controlsBox = await fullBleedControls.boundingBox();
      const headingBox = await fullBleedSlide.getByRole("heading", { name: "Find your focus" }).boundingBox();
      expect(viewportBox).not.toBeNull();
      expect(controlsBox).not.toBeNull();
      expect(headingBox).not.toBeNull();
      expect(controlsBox!.y).toBeGreaterThanOrEqual(viewportBox!.y + viewportBox!.height);
      expect(
        headingBox!.y < controlsBox!.y + controlsBox!.height &&
        headingBox!.y + headingBox!.height > controlsBox!.y,
      ).toBe(false);
    } else {
      expect(await fullBleedControls.evaluate((element) => getComputedStyle(element).position))
        .toBe("absolute");
    }

    const below = page.getByRole("region", { name: "Below controls example" });
    const belowViewport = await below.locator('[data-slot="viewport"]').boundingBox();
    const belowControls = await below.locator('[data-slot="controls"]').boundingBox();
    expect(belowViewport).not.toBeNull();
    expect(belowControls).not.toBeNull();
    expect(belowControls!.y).toBeGreaterThanOrEqual(belowViewport!.y + belowViewport!.height);

    const dimensions = await page.evaluate(() => ({
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  }
});

test("Carousel autoplay advances slides and its control pauses and resumes rotation", async ({ page }) => {
  await page.goto("/iframe.html?id=components-carousel--auto-play&viewMode=story");

  const carousel = page.getByRole("region", { name: "Auto-advancing stories" });
  const rotationToggle = carousel.locator('[data-slot="rotation-toggle"]');
  await expect(carousel.getByRole("group", { name: "Build your flow, 2 of 3" })).toBeVisible({
    timeout: 5000,
  });
  await expect(rotationToggle.locator('[data-icon="pause"]')).toBeVisible();

  await rotationToggle.click();
  await expect(rotationToggle).toHaveAttribute("aria-pressed", "false");
  await expect(rotationToggle.locator('[data-icon="play"]')).toBeVisible();
  const pausedIndex = await carousel.getAttribute("data-index");
  await page.waitForTimeout(1800);
  await expect(carousel).toHaveAttribute("data-index", pausedIndex ?? "");

  await rotationToggle.click();
  await expect(rotationToggle).toHaveAttribute("aria-pressed", "true");
  await expect(rotationToggle.locator('[data-icon="pause"]')).toBeVisible();
  await page.mouse.move(0, 0);
  await expect.poll(() => carousel.getAttribute("data-index"), { timeout: 5000 }).not.toBe(pausedIndex);
});

test("Carousel stops rotation on focus and disables autoplay for reduced motion", async ({ page }) => {
  await page.goto("/iframe.html?id=components-carousel--auto-play&viewMode=story");

  const carousel = page.getByRole("region", { name: "Auto-advancing stories" });
  await expect(carousel.getByRole("group", { name: "Build your flow, 2 of 3" })).toBeVisible({
    timeout: 5000,
  });
  await carousel.focus();
  const focusedIndex = await carousel.getAttribute("data-index");
  await page.waitForTimeout(1800);
  await expect(carousel).toHaveAttribute("data-index", focusedIndex ?? "");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=components-carousel--auto-play&viewMode=story");
  const reducedMotionCarousel = page.getByRole("region", { name: "Auto-advancing stories" });
  const rotationToggle = reducedMotionCarousel.locator('[data-slot="rotation-toggle"]');
  await expect(rotationToggle).toBeDisabled();
  await expect(rotationToggle).toHaveAttribute(
    "aria-label",
    "Automatic slide rotation is disabled by your reduced-motion preference",
  );
  await expect(rotationToggle.locator('[data-icon="play"]')).toBeVisible();
  await page.waitForTimeout(1800);
  await expect(reducedMotionCarousel).toHaveAttribute("data-index", "0");
});

test("Carousel touch swipe navigates without introducing horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-carousel--swipe-example&viewMode=story");

  const carousel = page.getByRole("region", { name: "Swipe example" });
  const viewport = carousel.locator('[data-slot="viewport"]');
  await viewport.dispatchEvent("pointerdown", {
    pointerId: 1,
    pointerType: "touch",
    clientX: 320,
    clientY: 150,
  });
  await viewport.dispatchEvent("pointerup", {
    pointerId: 1,
    pointerType: "touch",
    clientX: 100,
    clientY: 155,
  });

  await expect(carousel.getByRole("group", { name: "Build your flow, 2 of 3" })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("Carousel themes and scoped component hooks apply", async ({ page }) => {
  await page.goto("/iframe.html?id=components-carousel--theme-coverage&viewMode=story");

  const acmeCarousel = page.locator('[data-ds-theme="acme"] > section');
  const lunaCarousel = page.locator('[data-ds-theme="luna"] > section');
  const acmeSurface = await acmeCarousel.evaluate((element) => getComputedStyle(element).backgroundColor);
  const lunaSurface = await lunaCarousel.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(lunaSurface).not.toBe(acmeSurface);

  await page.goto("/iframe.html?id=components-carousel--custom-hook-overrides&viewMode=story");
  const carousel = page.getByRole("region", { name: "Custom themed carousel" });
  await expect(carousel).toHaveCSS("border-top-left-radius", "24px");
  await expect(carousel.locator('[data-slot="viewport"]')).toHaveCSS("border-top-left-radius", "16px");
});

test("Carousel displays its empty state without navigation controls", async ({ page }) => {
  await page.goto("/iframe.html?id=components-carousel--empty-state&viewMode=story");
  const carousel = page.getByRole("region", { name: "Empty carousel" });
  await expect(carousel.getByText("There are no featured stories right now.")).toBeVisible();
  await expect(carousel.getByRole("button")).toHaveCount(0);
});
