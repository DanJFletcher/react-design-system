import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { TextField } from "../FormControls/TextField";
import {
  ContactSection,
  type ContactSectionProps,
} from "./ContactSection";

const address = {
  lines: ["214 Queen Street West", "Toronto, ON M5V 1Z4"],
  directionsHref: "https://maps.example.test/directions",
};

const contactMethods = [
  { id: "phone", label: "Call", value: "(416) 555-0148", href: "tel:+14165550148" },
  { id: "email", label: "Email", value: "hello@harborpine.example", href: "mailto:hello@harborpine.example" },
];

const hours = [
  { id: "monday", day: "Monday", hours: "9:00 AM – 5:00 PM" },
  { id: "tuesday", day: "Tuesday", hours: "9:00 AM – 5:00 PM" },
  { id: "wednesday", day: "Wednesday", hours: "9:00 AM – 5:00 PM" },
  { id: "thursday", day: "Thursday", hours: "9:00 AM – 7:00 PM" },
  { id: "friday", day: "Friday", hours: "9:00 AM – 5:00 PM" },
  { id: "saturday", day: "Saturday", hours: "10:00 AM – 3:00 PM" },
  { id: "sunday", day: "Sunday", hours: "Closed" },
];

function ContactFormExample() {
  return (
    <form
      aria-label="Send a message"
      onSubmit={(event) => event.preventDefault()}
      style={{ display: "grid", gap: "var(--ds-space-4)" }}
    >
      <TextField
        autoComplete="name"
        id="contact-name"
        label="Your name"
        placeholder="Your name"
        required
      />
      <TextField
        autoComplete="email"
        id="contact-email"
        label="Email address"
        placeholder="you@example.com"
        required
        type="email"
      />
      <Button type="submit">Send message</Button>
    </form>
  );
}

const meta = {
  title: "Components/Contact section",
  component: ContactSection,
  args: {
    heading: "Visit Harbor & Pine Studio",
    description: "A friendly neighborhood studio for thoughtful projects and one-to-one consultations.",
    variant: "surface",
    layout: "split",
    headingLevel: 2,
    address,
    contactMethods,
    hours,
    addressHeading: "Visit us",
    contactHeading: "Contact",
    hoursHeading: "Business hours",
  },
  argTypes: {
    heading: { control: "text" },
    description: { control: "text" },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    variant: { control: "inline-radio", options: ["plain", "surface", "accent"] },
    layout: { control: "inline-radio", options: ["split", "stacked"] },
    address: { control: "object" },
    contactMethods: { control: "object" },
    hours: { control: "object" },
    addressHeading: { control: "text" },
    contactHeading: { control: "text" },
    hoursHeading: { control: "text" },
    action: { control: false },
    form: { control: false },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <ContactSection
      {...args}
      action={<Button type="button">Book a consultation</Button>}
    />
  ),
} satisfies Meta<typeof ContactSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithContactForm: Story = {
  render: () => (
    <ContactSection
      action={<Button type="button">Call the studio</Button>}
      address={address}
      contactMethods={contactMethods}
      description="Tell us what you have in mind and we'll get back to you."
      form={<ContactFormExample />}
      heading="Start a conversation"
      hours={hours}
      variant="surface"
    />
  ),
};

export const StackedLayout: Story = {
  render: () => (
    <ContactSection
      action={<Button type="button">Request a quote</Button>}
      address={address}
      contactMethods={contactMethods}
      description="The details customers need, with the inquiry form underneath."
      form={<ContactFormExample />}
      heading="Contact our team"
      hours={hours}
      layout="stacked"
      variant="accent"
    />
  ),
};

export const VariantComparison: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["plain", "surface", "accent"] as const).map((variant) => (
        <ContactSection
          key={variant}
          address={address}
          contactMethods={contactMethods.slice(0, 1)}
          heading={`${variant} contact section`}
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
          <ContactSection
            address={address}
            contactMethods={contactMethods.slice(0, 1)}
            heading={`${theme} theme contact`}
            variant="surface"
          />
        </section>
      ))}
    </div>
  ),
};

export const NestedThemeBoundary: Story = {
  render: () => (
    <div
      data-ds-theme="acme"
      style={{
        display: "grid",
        gap: "var(--ds-space-4)",
        padding: "var(--ds-space-4)",
        backgroundColor: "var(--ds-color-canvas)",
      }}
    >
      <ContactSection heading="ACME studio" variant="surface" address={address} />
      <section
        data-ds-theme="luna"
        style={{ padding: "var(--ds-space-4)", backgroundColor: "var(--ds-color-canvas)" }}
      >
        <ContactSection heading="Luna studio" variant="accent" address={address} />
      </section>
    </div>
  ),
};

export const CustomHooks: Story = {
  args: {
    heading: "Custom contact styling",
    style: {
      "--ds-contact-surface": "var(--ds-color-accent-bg)",
      "--ds-contact-text": "var(--ds-color-accent-fg)",
      "--ds-contact-muted": "var(--ds-color-accent-fg)",
      "--ds-contact-border": "var(--ds-color-accent-fg)",
      "--ds-contact-link": "var(--ds-color-accent-fg)",
      "--ds-contact-radius": "var(--ds-radius-shape-rounded)",
      "--ds-contact-padding": "var(--ds-space-8)",
      "--ds-contact-gap": "var(--ds-space-5)",
    },
  },
};

export const HeadingLevels: Story = {
  args: { heading: "Subsection contact", headingLevel: 4 },
  render: (args: ContactSectionProps) => (
    <ContactSection
      {...args}
      address={address}
      contactMethods={contactMethods.slice(0, 1)}
    />
  ),
};

export const LongContent: Story = {
  render: () => (
    <div style={{ inlineSize: "18rem" }}>
      <ContactSection
        address={{
          lines: [
            "Suite 204, 38 Old Mill Road, North Building",
            "North York, Ontario, M2N 7C3",
          ],
          directionsHref: "https://maps.example.test/directions",
        }}
        contactMethods={[
          {
            id: "email",
            label: "Email our customer service team",
            value: "appointments@harborpine.example",
            href: "mailto:appointments@harborpine.example",
          },
        ]}
        heading="Talk with a member of the Harbor & Pine team"
        hours={hours}
        variant="surface"
      />
    </div>
  ),
};
