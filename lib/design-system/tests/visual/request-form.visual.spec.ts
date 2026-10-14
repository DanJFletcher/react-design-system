import { expect, test } from "@playwright/test";

test("quote form submits normalized values and includes consumer-owned form fields", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-request-form--quote-submission&viewMode=story",
  );

  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email address").fill("ada@example.com");
  await page.getByLabel("Phone number").fill("416-555-0134");
  await page.getByLabel("Service").selectOption("garden-design");
  await page.getByLabel("How can we help?").fill("Redesign our courtyard.");
  await page.getByLabel("How did you hear about us?").fill("A neighbor");
  await page.getByRole("button", { name: "Request a quote" }).click();

  await expect(page.getByRole("status")).toHaveText("Quote request received.");
  const payload = JSON.parse(
    (await page.getByLabel("Submitted request payload").textContent()) ?? "{}",
  ) as { values: Record<string, unknown>; referral: string | null };

  expect(payload.values).toEqual({
    requestType: "quote",
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "416-555-0134",
    service: "garden-design",
    message: "Redesign our courtyard.",
  });
  expect(payload.referral).toBe("A neighbor");
});

test("appointment requests include preferred date and time without booking a slot", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-request-form--appointment-submission&viewMode=story",
  );

  await page.getByLabel("Full name").fill("Sam Rivera");
  await page.getByLabel("Email address").fill("sam@example.com");
  await page.getByLabel("Service").selectOption("consultation");
  await page.getByLabel("Preferred date").fill("2026-11-02");
  await page.getByLabel("Preferred time").fill("10:30");
  await page.getByLabel("How can we help?").fill("Discuss a garden renovation.");
  await page.getByRole("button", { name: "Request an appointment" }).click();

  await expect(page.getByRole("status")).toHaveText("Appointment request received.");
  const output = await page.getByLabel("Submitted request payload").textContent();
  const payload = JSON.parse(output ?? "{}") as {
    values: Record<string, unknown>;
  };
  expect(payload.values).toMatchObject({
    requestType: "appointment",
    name: "Sam Rivera",
    email: "sam@example.com",
    service: "consultation",
    preferredDate: "2026-11-02",
    preferredTime: "10:30",
    message: "Discuss a garden renovation.",
  });
});

test("request form announces rejected submissions and clears status after editing", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-request-form--failed-submission&viewMode=story",
  );

  await page.getByLabel("Full name").fill("Taylor Chen");
  await page.getByLabel("Email address").fill("taylor@fail.example");
  await page.getByLabel("Service").selectOption("garden-design");
  await page.getByLabel("How can we help?").fill("Please send an estimate.");
  await page.getByRole("button", { name: "Request a quote" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "We couldn't receive your request. Please try again.",
  );
  await page.getByLabel("Email address").fill("taylor@example.com");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("two-column request forms collapse to one column on narrow screens", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-request-form--narrow-two-column-layout&viewMode=story",
  );
  await page.setViewportSize({ width: 390, height: 844 });

  const formGrid = page.locator("form [data-columns='2']");
  await expect(formGrid).toHaveCount(1);
  const mobileColumnCount = await formGrid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  const mobilePageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  const mobileViewportWidth = await page.evaluate(
    () => document.documentElement.clientWidth,
  );
  expect(mobileColumnCount).toBe(1);
  expect(mobilePageWidth).toBeLessThanOrEqual(mobileViewportWidth);

  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopColumnCount = await formGrid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(desktopColumnCount).toBe(2);
});
