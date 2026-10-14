import { expect, test } from "@playwright/test";

test("NewsletterSignup validates email and presents async success feedback", async ({ page }) => {
  await page.goto("/iframe.html?id=components-newsletter-signup--playground&viewMode=story");

  const section = page.getByRole("region", { name: "Notes from Harbor & Pine" });
  const form = section.getByRole("form", { name: "Sign up for Notes from Harbor & Pine" });
  const email = form.getByRole("textbox", { name: "Email address" });

  await expect(email).toHaveAttribute("required", "");
  await expect(email).toHaveAttribute("type", "email");
  await form.getByRole("button", { name: "Subscribe" }).click();
  expect(await email.evaluate((element: HTMLInputElement) => element.validity.valid)).toBe(false);
  await expect(form.getByRole("status")).toHaveCount(0);

  await email.fill("reader@example.com");
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(form.getByRole("status"))
    .toHaveText("You're on the list. Watch your inbox for a welcome note.");
  await expect(email).toHaveValue("");
});

test("NewsletterSignup includes optional name and enforces required consent", async ({ page }) => {
  await page.goto("/iframe.html?id=components-newsletter-signup--with-name-and-consent&viewMode=story");

  const form = page.getByRole("form", { name: "Sign up for Join the Harbor & Pine list" });
  const name = form.getByRole("textbox", { name: "Name" });
  const email = form.getByRole("textbox", { name: "Email address" });
  const consent = form.getByRole("checkbox", {
    name: "I agree to receive the Harbor & Pine email newsletter.",
  });
  const submit = form.getByRole("button", { name: "Subscribe" });

  await expect(name).toHaveAttribute("autocomplete", "name");
  await expect(consent).toHaveAttribute("required", "");
  await name.fill("Avery Reader");
  await email.fill("avery@example.com");
  await submit.click();
  await expect(form.getByRole("status")).toHaveCount(0);

  await consent.check();
  await submit.click();
  await expect(form.getByRole("status")).toBeVisible();
  await expect(name).toHaveValue("");
  await expect(consent).not.toBeChecked();
});

test("NewsletterSignup exposes rejected submissions as an accessible error", async ({ page }) => {
  await page.goto("/iframe.html?id=components-newsletter-signup--failed-submission&viewMode=story");

  const form = page.getByRole("form", { name: "Sign up for Newsletter error state" });
  await form.getByRole("textbox", { name: "Email address" }).fill("reader@fail.example");
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(form.getByRole("alert"))
    .toHaveText("We couldn't subscribe you. Please try again.");
});

test("NewsletterSignup inline fields reflow responsively without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/iframe.html?id=components-newsletter-signup--inline-footer&viewMode=story");

  const section = page.getByRole("region", { name: "A little good news, now and then" });
  const fields = section.locator("form > div").first();
  const activeColumnCount = async () => fields.evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns
      .trim()
      .split(/\s+/)
      .filter((track) => Number.parseFloat(track) > 0)
      .length,
  );
  expect(await activeColumnCount()).toBe(2);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await activeColumnCount()).toBe(1);
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("NewsletterSignup inherits themes and supports scoped custom hooks", async ({ page }) => {
  await page.goto("/iframe.html?id=components-newsletter-signup--theme-coverage&viewMode=story");

  const sections = page.locator("[data-ds-theme] section[aria-labelledby]");
  await expect(sections).toHaveCount(4);
  const backgrounds = await sections.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).backgroundColor),
  );
  expect(backgrounds[0]).not.toBe(backgrounds[1]);

  await page.goto("/iframe.html?id=components-newsletter-signup--custom-hooks&viewMode=story");
  const custom = page.getByRole("region", { name: "A custom newsletter style" });
  const styles = await custom.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      background: computed.backgroundColor,
      borderRadius: computed.borderRadius,
      padding: computed.padding,
    };
  });
  expect(styles.background).not.toBe("transparent");
  expect(Number.parseFloat(styles.borderRadius)).toBeGreaterThan(0);
  expect(Number.parseFloat(styles.padding)).toBeGreaterThan(0);
});
