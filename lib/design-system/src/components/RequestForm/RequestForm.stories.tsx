import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "../FormControls/TextField";
import {
  RequestForm,
  type RequestFormProps,
  type RequestFormServiceOption,
  type RequestFormType,
} from "./RequestForm";

const serviceOptions: RequestFormServiceOption[] = [
  { value: "garden-design", label: "Garden design" },
  { value: "maintenance", label: "Garden maintenance" },
  { value: "consultation", label: "On-site consultation" },
];

const previewSubmit: RequestFormProps["onSubmit"] = async ({ email }) => {
  await new Promise((resolve) => setTimeout(resolve, 350));
  if (email.endsWith("@fail.example")) {
    throw new Error("Preview request failed.");
  }
};

const meta = {
  title: "Compositions/Marketing/Request form",
  id: "components-request-form",
  component: RequestForm,
  args: {
    heading: "Tell us about your project",
    description: "Share a few details and our team will get back to you.",
    requestType: "quote",
    onSubmit: previewSubmit,
    serviceOptions,
    variant: "surface",
    layout: "stacked",
    headingLevel: 2,
    includePhone: true,
    includeService: true,
    includeMessage: true,
    includeConsent: false,
    submitLabel: "Request a quote",
    submittingLabel: "Sending request…",
    successMessage: "Your quote request has been sent. We'll be in touch soon.",
    errorMessage: "We couldn't send your request. Please try again.",
  },
  argTypes: {
    heading: { control: "text" },
    description: { control: "text" },
    requestType: { control: "inline-radio", options: ["quote", "appointment"] },
    layout: { control: "inline-radio", options: ["stacked", "two-column"] },
    variant: { control: "inline-radio", options: ["plain", "surface", "accent"] },
    headingLevel: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] },
    includePhone: { control: "boolean" },
    phoneRequired: { control: "boolean" },
    includeService: { control: "boolean" },
    serviceRequired: { control: "boolean" },
    includeMessage: { control: "boolean" },
    messageRequired: { control: "boolean" },
    includePreferredDate: { control: "boolean" },
    preferredDateRequired: { control: "boolean" },
    includePreferredTime: { control: "boolean" },
    preferredTimeRequired: { control: "boolean" },
    includeConsent: { control: "boolean" },
    consentLabel: { control: "text" },
    privacyText: { control: "text" },
    nameLabel: { control: "text" },
    namePlaceholder: { control: "text" },
    emailLabel: { control: "text" },
    emailPlaceholder: { control: "text" },
    phoneLabel: { control: "text" },
    phonePlaceholder: { control: "text" },
    serviceLabel: { control: "text" },
    servicePlaceholder: { control: "text" },
    messageLabel: { control: "text" },
    messagePlaceholder: { control: "text" },
    preferredDateLabel: { control: "text" },
    preferredTimeLabel: { control: "text" },
    submitLabel: { control: "text" },
    submittingLabel: { control: "text" },
    successMessage: { control: "text" },
    errorMessage: { control: "text" },
    defaultValues: { control: false },
    serviceOptions: { control: "object" },
    additionalFields: { control: false },
    resetOnSuccess: { control: "boolean" },
    onSubmit: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof RequestForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function SubmissionPayloadExample({
  requestType,
}: {
  requestType: RequestFormType;
}) {
  const [submittedPayload, setSubmittedPayload] = useState("");
  const appointment = requestType === "appointment";

  const onSubmit: RequestFormProps["onSubmit"] = async (values, formData) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const referral = formData.get("referral");
    setSubmittedPayload(
      JSON.stringify({
        values,
        referral: typeof referral === "string" ? referral : null,
      }),
    );
  };

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <RequestForm
        additionalFields={
          <TextField label="How did you hear about us?" name="referral" />
        }
        heading={appointment ? "Request an appointment" : "Get an estimate"}
        includePhone={!appointment}
        layout="two-column"
        messageRequired
        onSubmit={onSubmit}
        preferredDateRequired={appointment}
        preferredTimeRequired={appointment}
        requestType={requestType}
        serviceOptions={serviceOptions}
        successMessage={
          appointment ? "Appointment request received." : "Quote request received."
        }
        variant="surface"
      />
      <pre
        aria-label="Submitted request payload"
        style={{ margin: 0, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
      >
        {submittedPayload || "No request submitted."}
      </pre>
    </div>
  );
}

export const QuoteSubmission: Story = {
  render: () => <SubmissionPayloadExample requestType="quote" />,
};

export const AppointmentSubmission: Story = {
  render: () => <SubmissionPayloadExample requestType="appointment" />,
};

export const AppointmentRequest: Story = {
  args: {
    heading: "Request a consultation",
    description: "Tell us which service you need and when you would prefer to meet.",
    requestType: "appointment",
    layout: "two-column",
    variant: "surface",
    preferredDateRequired: true,
    preferredTimeRequired: true,
    successMessage: "Your appointment request has been received.",
  },
};

export const WithConsent: Story = {
  args: {
    heading: "Request a home visit",
    includeConsent: true,
    consentLabel: "I agree that the team may contact me about this request.",
    privacyText: (
      <>
        Your details are only used to respond to this request. Read our{" "}
        <a href="#privacy">privacy notice</a>.
      </>
    ),
  },
};

export const FailedSubmission: Story = {
  args: {
    heading: "Request form error state",
    description: "Use an email ending in @fail.example to preview the error response.",
    errorMessage: "We couldn't receive your request. Please try again.",
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          data-ds-theme={theme}
          key={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <RequestForm
            description="Tell us what you need and we'll follow up."
            heading={`${theme} quote request`}
            onSubmit={previewSubmit}
            serviceOptions={serviceOptions}
            variant="surface"
          />
        </section>
      ))}
    </div>
  ),
};

export const CustomHooks: Story = {
  args: {
    heading: "A request form with scoped styling",
    description: "The component hooks customize the surface without changing form behavior.",
    style: {
      "--ds-request-form-surface": "var(--ds-color-accent-bg)",
      "--ds-request-form-text": "var(--ds-color-accent-fg)",
      "--ds-request-form-muted": "var(--ds-color-accent-fg)",
      "--ds-request-form-border": "var(--ds-color-accent-fg)",
      "--ds-request-form-radius": "var(--ds-radius-surface)",
      "--ds-request-form-padding": "var(--ds-space-8)",
      "--ds-request-form-gap": "var(--ds-space-5)",
    },
  },
};

export const NarrowTwoColumnLayout: Story = {
  args: {
    heading: "Request an estimate",
    layout: "two-column",
    variant: "surface",
  },
  decorators: [
    (StoryComponent) => (
      <div style={{ maxInlineSize: "var(--ds-layout-container-narrow)" }}>
        <StoryComponent />
      </div>
    ),
  ],
};

