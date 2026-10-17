import type { Meta, StoryObj } from "@storybook/react";
import { NewsletterSignup, type NewsletterSignupProps } from "./NewsletterSignup";

const previewSubmit: NonNullable<NewsletterSignupProps["onSubmit"]> = async ({ email }) => {
  await new Promise((resolve) => setTimeout(resolve, 350));
  if (email.endsWith("@fail.example")) throw new Error("Preview submission failed");
};

const meta = {
  title: "Compositions/Marketing/Newsletter signup",
  id: "components-newsletter-signup",
  component: NewsletterSignup,
  args: {
    onSubmit: previewSubmit,
    heading: "Notes from Harbor & Pine",
    description: "Occasional studio news, practical ideas, and new work. No clutter.",
    variant: "surface",
    layout: "stacked",
    headingLevel: 2,
    includeName: false,
    requiresConsent: false,
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    submitLabel: "Subscribe",
    submittingLabel: "Submitting…",
    successMessage: "You're on the list. Watch your inbox for a welcome note.",
    errorMessage: "We couldn't subscribe you. Please try again.",
  },
  argTypes: {
    heading: { control: "text" },
    description: { control: "text" },
    headingLevel: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] },
    layout: { control: "inline-radio", options: ["inline", "stacked"] },
    variant: { control: "inline-radio", options: ["plain", "surface", "accent"] },
    includeName: { control: "boolean" },
    requiresConsent: { control: "boolean" },
    nameLabel: { control: "text" },
    namePlaceholder: { control: "text" },
    emailLabel: { control: "text" },
    emailPlaceholder: { control: "text" },
    submitLabel: { control: "text" },
    submittingLabel: { control: "text" },
    successMessage: { control: "text" },
    errorMessage: { control: "text" },
    consentLabel: { control: "text" },
    privacyText: { control: "text" },
    onSubmit: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof NewsletterSignup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InlineFooter: Story = {
  args: {
    heading: "A little good news, now and then",
    description: "New articles and studio updates, sent when there is something worth sharing.",
    layout: "inline",
    variant: "accent",
    privacyText: (
      <>
        Read our <a href="#privacy">privacy notice</a>. Unsubscribe whenever you like.
      </>
    ),
  },
};

export const WithNameAndConsent: Story = {
  args: {
    heading: "Join the Harbor & Pine list",
    description: "Sign up for thoughtful updates from our small team.",
    includeName: true,
    requiresConsent: true,
    consentLabel: "I agree to receive the Harbor & Pine email newsletter.",
    privacyText: (
      <>
        See how we use your information in our <a href="#privacy">privacy notice</a>.
      </>
    ),
  },
};

export const FailedSubmission: Story = {
  args: {
    heading: "Newsletter error state",
    description: "Use an address ending in @fail.example to preview the error response.",
    layout: "inline",
  },
};

export const VariantComparison: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["plain", "surface", "accent"] as const).map((variant) => (
        <NewsletterSignup
          key={variant}
          description="Occasional updates from our studio."
          heading={`${variant} newsletter signup`}
          layout="inline"
          onSubmit={previewSubmit}
          variant={variant}
        />
      ))}
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            borderRadius: "var(--ds-radius-shape-rounded)",
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <NewsletterSignup
            description="Get notes from our team."
            heading={`${theme} theme newsletter`}
            onSubmit={previewSubmit}
            variant="surface"
          />
        </section>
      ))}
    </div>
  ),
};

export const CustomHooks: Story = {
  args: {
    heading: "A custom newsletter style",
    description: "Customize the signup surface, typography colors, and spacing with scoped hooks.",
    style: {
      "--ds-newsletter-surface": "var(--ds-color-accent-bg)",
      "--ds-newsletter-text": "var(--ds-color-accent-fg)",
      "--ds-newsletter-muted": "var(--ds-color-accent-fg)",
      "--ds-newsletter-border": "var(--ds-color-accent-fg)",
      "--ds-newsletter-radius": "var(--ds-radius-surface)",
      "--ds-newsletter-padding": "var(--ds-space-8)",
      "--ds-newsletter-gap": "var(--ds-space-5)",
    },
  },
};

export const NarrowInline: Story = {
  args: {
    heading: "Stay in the loop",
    description: "Short updates, never spam.",
    layout: "inline",
    variant: "surface",
  },
  decorators: [
    (StoryComponent) => (
      <div style={{ maxInlineSize: "22rem" }}>
        <StoryComponent />
      </div>
    ),
  ],
};
