import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewsletterSignup } from "./NewsletterSignup";

describe("NewsletterSignup", () => {
  it("submits a trimmed email, announces success, and resets the field", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <NewsletterSignup
        description="Occasional product news."
        heading="Get updates"
        onSubmit={onSubmit}
        privacyText="Your email stays private."
      />,
    );
    const form = screen.getByRole("form", { name: "Sign up for Get updates" });
    const email = screen.getByRole("textbox", { name: "Email address" });

    expect(screen.getByRole("region", { name: "Get updates" })).toBeInTheDocument();
    expect(screen.getByText("Occasional product news.")).toBeInTheDocument();
    expect(screen.getByText("Your email stays private.")).toBeInTheDocument();
    expect(email).toBeRequired();

    fireEvent.change(email, { target: { value: "  reader@example.com  " } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "reader@example.com",
        consent: false,
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks for subscribing.");
    expect(email).toHaveValue("");
    expect(form).not.toHaveAttribute("aria-busy", "true");
  });

  it("includes the optional name and consent and exposes its pending state", async () => {
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(
      <NewsletterSignup
        consentLabel="I accept the newsletter terms"
        heading="Join the list"
        headingLevel={4}
        includeName
        layout="inline"
        nameLabel="Your name"
        onSubmit={onSubmit}
        requiresConsent
        submittingLabel="Please wait"
        variant="surface"
      />,
    );
    const section = screen.getByRole("region", { name: "Join the list" });
    const form = screen.getByRole("form", { name: "Sign up for Join the list" });
    const name = screen.getByRole("textbox", { name: "Your name" });
    const email = screen.getByRole("textbox", { name: "Email address" });
    const consent = screen.getByRole("checkbox", { name: "I accept the newsletter terms" });

    expect(screen.getByRole("heading", { level: 4, name: "Join the list" })).toBeInTheDocument();
    expect(section).toHaveAttribute("data-layout", "inline");
    expect(section).toHaveAttribute("data-variant", "surface");
    fireEvent.change(name, { target: { value: "  Alex Rivera " } });
    fireEvent.change(email, { target: { value: " alex@example.com " } });
    fireEvent.click(consent);
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Alex Rivera",
      email: "alex@example.com",
      consent: true,
    });
    expect(form).toHaveAttribute("aria-busy", "true");
    expect(name).toBeDisabled();
    expect(email).toBeDisabled();
    expect(consent).toBeDisabled();
    expect(screen.getByRole("button", { name: "Please wait" })).toBeDisabled();

    resolveSubmit();
    await screen.findByRole("status");
  });

  it("announces submission errors and clears them after the email changes", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("network unavailable"));
    render(
      <NewsletterSignup
        emailPlaceholder="Email for updates"
        errorMessage="Please try again later."
        heading="Newsletter"
        onSubmit={onSubmit}
        successMessage="Subscribed!"
      />,
    );
    const email = screen.getByRole("textbox", { name: "Email address" });
    const form = screen.getByRole("form", { name: "Sign up for Newsletter" });

    fireEvent.change(email, { target: { value: "reader@example.com" } });
    fireEvent.submit(form);

    expect(await screen.findByRole("alert")).toHaveTextContent("Please try again later.");
    fireEvent.change(email, { target: { value: "new@example.com" } });
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(email).toHaveAttribute("placeholder", "Email for updates");
  });
});
