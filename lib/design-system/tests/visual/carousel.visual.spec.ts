import { expect, test } from "@playwright/test";

test("Carousel buttons, indicators, keyboard navigation, and slide focus state work", async ({ page }) => {
  await page.goto("/iframe.html?id=components-carousel--playground&viewMode=story");

  const carousel = page.getByRole("region", { name: "Featured stories" });
  await expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
  await expect(carousel.getByRole("group", { name: "Find your focus, 1 of 3" })).toBeVisible();
  await expect(carousel.locator('[data-slot="rotation-toggle"]')).toHaveCount(0);
  await expect(carousel.getByRole("button", { name: "Previous slide" })).toBeEnabled();

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

test("Carousel disables navigation at non-looping boundaries", async ({ page }) => {
  await page.goto("/iframe.html?id=components-carousel--controls-examples&viewMode=story");

  const carousel = page.getByRole("region", { name: "Fraction indicator example" });
  await expect(carousel.getByRole("button", { name: "Previous slide" })).toBeDisabled();
  await expect(carousel.getByRole("button", { name: "Next slide" })).toBeEnabled();
});

test("Carousel autoplay advances slides and its control pauses and resumes rotation", async ({ page }) => {
  await page.goto("/iframe.html?id=components-carousel--auto-play&viewMode=story");

  const carousel = page.getByRole("region", { name: "Auto-advancing stories" });
  const rotationToggle = carousel.locator('[data-slot="rotation-toggle"]');
  await expect(carousel.getByRole("group", { name: "Build your flow, 2 of 3" })).toBeVisible({
    timeout: 5000,
  });

  await rotationToggle.click();
  await expect(rotationToggle).toHaveAttribute("aria-pressed", "false");
  const pausedIndex = await carousel.getAttribute("data-index");
  await page.waitForTimeout(1800);
  await expect(carousel).toHaveAttribute("data-index", pausedIndex ?? "");

  await rotationToggle.click();
  await expect(rotationToggle).toHaveAttribute("aria-pressed", "true");
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
  await page.waitForTimeout(1800);
  await expect(reducedMotionCarousel).toHaveAttribute("data-index", "0");
});

test("Carousel touch swipe navigates without introducing horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-carousel--playground&viewMode=story");

  const carousel = page.getByRole("region", { name: "Featured stories" });
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
