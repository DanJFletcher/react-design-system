import { expect, test } from "@playwright/test";

test("FAQSection names the section, preserves question semantics, and renders the action", async ({ page }) => {
  await page.goto("/iframe.html?id=components-faq-section--playground&viewMode=story");

  const section = page.getByRole("region", { name: "Frequently asked questions" });
  const firstQuestion = section.getByRole("button", { name: "How do I book a consultation?" });
  await expect(section.getByRole("heading", {
    name: "Frequently asked questions",
    level: 2,
  })).toBeVisible();
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(section.getByRole("button", { name: "Talk to our team" })).toBeVisible();

  await firstQuestion.click();
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
  await firstQuestion.click();
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(section.getByRole("region", {
    name: "How do I book a consultation?",
  })).toBeVisible();
});

test("FAQSection supports multiple open answers", async ({ page }) => {
  await page.goto("/iframe.html?id=components-faq-section--multiple-open&viewMode=story");

  const section = page.getByRole("region", { name: "Questions about getting started" });
  const firstQuestion = section.getByRole("button", { name: "How do I book a consultation?" });
  const secondQuestion = section.getByRole("button", { name: "Which areas do you serve?" });
  const thirdQuestion = section.getByRole("button", {
    name: "What payment methods do you accept?",
  });
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(thirdQuestion).toHaveAttribute("aria-expanded", "false");
  await thirdQuestion.click();
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(thirdQuestion).toHaveAttribute("aria-expanded", "true");
});

test("FAQSection controlled state replaces the open answer in single-open mode", async ({ page }) => {
  await page.goto("/iframe.html?id=components-faq-section--controlled-state&viewMode=story");

  const section = page.getByRole("region", { name: "Controlled service questions" });
  const firstQuestion = section.getByRole("button", { name: "How do I book a consultation?" });
  const secondQuestion = section.getByRole("button", { name: "Which areas do you serve?" });
  await firstQuestion.click();
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  await secondQuestion.click();
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
  await expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
});

test("FAQSection passes disabled questions through to the Accordion", async ({ page }) => {
  await page.goto("/iframe.html?id=components-faq-section--disabled-question&viewMode=story");

  const section = page.getByRole("region", { name: "Questions with an unavailable answer" });
  const disabledQuestion = section.getByRole("button", {
    name: "Will you offer weekend appointments?",
  });
  await expect(disabledQuestion).toBeDisabled();
  await expect(disabledQuestion).toHaveAttribute("aria-expanded", "false");
});

test("FAQSection inherits themes, nested boundaries, and scoped styles", async ({ page }) => {
  await page.goto("/iframe.html?id=components-faq-section--theme-coverage&viewMode=story");

  const themedSections = page.locator("[data-ds-theme] section");
  await expect(themedSections).toHaveCount(5);
  const themeColors = await themedSections.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).color),
  );
  expect(new Set(themeColors).size).toBeGreaterThan(1);

  await page.goto("/iframe.html?id=components-faq-section--nested-theme-boundary&viewMode=story");
  const parent = page.getByRole("region", { name: "ACME studio FAQs" });
  const nested = page.getByRole("region", { name: "Luna studio FAQs" });
  const parentColor = await parent.evaluate((element) => getComputedStyle(element).color);
  const nestedColor = await nested.evaluate((element) => getComputedStyle(element).color);
  expect(parentColor).not.toBe(nestedColor);

  await page.goto("/iframe.html?id=components-faq-section--scoped-styling&viewMode=story");
  const scoped = page.getByRole("region", { name: "FAQs with scoped styling" });
  await expect(scoped).toHaveCSS("border-inline-start-style", "solid");
  await expect(scoped).toHaveCSS("border-inline-start-width", "1px");
});

test("FAQSection fits narrow screens without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iframe.html?id=components-faq-section--narrow-layout&viewMode=story");

  const section = page.getByRole("region", { name: "Small-screen FAQs" });
  await expect(section.getByRole("button", {
    name: "Can I change or reschedule my appointment after I have booked?",
  })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("FAQSection renders nothing when it has no questions", async ({ page }) => {
  await page.goto("/iframe.html?id=components-faq-section--empty-items&viewMode=story");

  await expect(page.getByRole("region", { name: "FAQs not loaded yet" })).toHaveCount(0);
});
