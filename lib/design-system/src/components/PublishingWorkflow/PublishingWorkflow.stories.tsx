import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { PublishingWorkflow, type PublishingReviewStep, type PublishingWorkflowStatus } from "./PublishingWorkflow";

const meta = {
  title: "Components/Publishing workflow",
  component: PublishingWorkflow,
  args: {
    status: "draft",
    reviewSteps: [
      { id: "editorial", label: "Editorial review", status: "pending", assignee: "Theo Park" },
      { id: "brand", label: "Brand check", status: "approved", assignee: "Mara Ellison" },
    ],
    scheduleAt: "2026-10-22T09:00",
    lastSavedText: "All changes saved",
  },
  argTypes: {
    status: {
      control: "select",
      options: ["draft", "in-review", "scheduled", "published", "archived"],
    },
    reviewSteps: { control: false },
    scheduleAt: { control: false },
    onScheduleAtChange: { control: false },
    onSubmitForReview: { control: false },
    onApprove: { control: false },
    onRequestChanges: { control: false },
    onPublish: { control: false },
    onPublishNow: { control: false },
    onSchedule: { control: false },
    onCancelSchedule: { control: false },
    onUnpublish: { control: false },
    onReturnToDraft: { control: false },
    onRestoreDraft: { control: false },
    busyAction: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof PublishingWorkflow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveWorkflow: Story = {
  name: "Interactive workflow",
  render: () => <InteractiveExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Draft")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Submit for review" }));
    await expect(canvas.getByText("In review")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Approve review" }));
    await expect(canvas.getByText("Approved")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Publish" }));
    await expect(canvas.getByText("Published")).toBeVisible();
  },
};

export const SchedulePublishing: Story = {
  name: "Schedule publishing",
  render: () => <ScheduleExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const schedule = canvas.getByLabelText("Publish date and time");
    await expect(schedule).toHaveValue("2026-10-22T09:00");
    await userEvent.click(canvas.getByRole("button", { name: "Schedule publish" }));
    await expect(canvas.getByText("Scheduled")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Update schedule" })).toBeVisible();
  },
};

export const Published: Story = {
  args: {
    status: "published",
    reviewSteps: [],
    onUnpublish: fn(),
    onReturnToDraft: fn(),
  },
};

export const Archived: Story = {
  args: {
    status: "archived",
    reviewSteps: [],
    onRestoreDraft: fn(),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onSubmitForReview: fn(),
    onScheduleAtChange: fn(),
    onSchedule: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Submit for review" })).toBeDisabled();
    await expect(canvas.getByLabelText("Publish date and time")).toBeDisabled();
  },
};

export const ThemeCoverage: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{ padding: "var(--ds-space-4)", background: "var(--ds-color-canvas)", color: "var(--ds-color-text-primary)" }}
        >
          <PublishingWorkflow
            {...args}
            heading={`${theme} publishing workflow`}
            status="in-review"
            reviewSteps={[
              { id: "editorial", label: "Editorial review", status: "pending", assignee: "Theo Park" },
              { id: "brand", label: "Brand check", status: "approved", assignee: "Mara Ellison" },
            ]}
          />
        </div>
      ))}
    </div>
  ),
};

function InteractiveExample() {
  const [status, setStatus] = useState<PublishingWorkflowStatus>("draft");
  const [reviewSteps, setReviewSteps] = useState<readonly PublishingReviewStep[]>([
    { id: "editorial", label: "Editorial review", status: "pending", assignee: "Theo Park" },
  ]);

  return (
    <PublishingWorkflow
      lastSavedText="All changes saved"
      onApprove={() => setReviewSteps((steps) => steps.map((step) => ({ ...step, status: "approved" })))}
      onPublish={() => setStatus("published")}
      onRequestChanges={() => setReviewSteps((steps) => steps.map((step) => ({ ...step, status: "changes-requested" })))}
      onSubmitForReview={() => setStatus("in-review")}
      reviewSteps={reviewSteps}
      status={status}
    />
  );
}

function ScheduleExample() {
  const [status, setStatus] = useState<PublishingWorkflowStatus>("draft");
  const [scheduleAt, setScheduleAt] = useState("2026-10-22T09:00");

  return (
    <PublishingWorkflow
      onCancelSchedule={() => setStatus("draft")}
      onPublishNow={() => setStatus("published")}
      onSchedule={(value) => {
        setScheduleAt(value);
        setStatus("scheduled");
      }}
      onScheduleAtChange={setScheduleAt}
      scheduleAt={scheduleAt}
      status={status}
    />
  );
}
