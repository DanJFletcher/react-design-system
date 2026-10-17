import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { RevisionHistory, type ContentRevision } from "./RevisionHistory";

const revisions: readonly ContentRevision[] = [
  {
    id: "rev-18",
    version: "Version 1.8",
    author: "Mara Ellison",
    dateText: "October 15, 2026 at 10:42 AM",
    dateTime: "2026-10-15T10:42:00-04:00",
    summary: "Updated the service details and clarified the booking instructions.",
  },
  {
    id: "rev-17",
    version: "Version 1.7",
    author: "Theo Park",
    dateText: "October 14, 2026 at 4:16 PM",
    dateTime: "2026-10-14T16:16:00-04:00",
    summary: "Added the new seasonal service and refreshed the introduction.",
  },
  {
    id: "rev-16",
    version: "Version 1.6",
    author: "Mara Ellison",
    dateText: "October 12, 2026 at 9:05 AM",
    dateTime: "2026-10-12T09:05:00-04:00",
    summary: "Revised the page title, description, and contact details.",
  },
];

const meta = {
  title: "Compositions/CMS/Revision history",
  id: "components-revision-history",
  component: RevisionHistory,
  args: {
    revisions,
    currentRevisionId: "rev-18",
    heading: "Revision history",
  },
  argTypes: {
    revisions: { control: false },
    onCompare: { control: false },
    onRestore: { control: false },
    busyRevisionId: { control: false },
    busyAction: { control: false },
    style: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof RevisionHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RecentVersions: Story = {};

export const CompareAndRestore: Story = {
  args: { onCompare: fn(), onRestore: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Compare Version 1.7" }));
    await expect(args.onCompare).toHaveBeenCalledWith(revisions[1]);

    await userEvent.click(canvas.getByRole("button", { name: "Restore Version 1.6" }));
    await expect(args.onRestore).toHaveBeenCalledWith(revisions[2]);
    await expect(canvas.queryByRole("button", { name: "Restore Version 1.8" })).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    revisions: [],
    emptyMessage: "Save the first version to start a revision history.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Save the first version to start a revision history.")).toBeVisible();
    await expect(canvas.queryByRole("list", { name: "Content versions" })).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { loading: true, revisions: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Loading revision history");
    await expect(canvas.getByRole("region", { name: "Revision history" })).toHaveAttribute("aria-busy", "true");
  },
};

export const Disabled: Story = {
  args: { disabled: true, onCompare: fn(), onRestore: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Compare Version 1.7" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Restore Version 1.6" })).toBeDisabled();
  },
};

export const RestoringVersion: Story = {
  args: {
    onCompare: fn(),
    onRestore: fn(),
    busyRevisionId: "rev-17",
    busyAction: "restore",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Restore Version 1.7" })).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByRole("button", { name: "Compare Version 1.6" })).toBeDisabled();
  },
};

export const ThemeCoverage: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{
            padding: "var(--ds-space-4)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <RevisionHistory {...args} heading={`${theme} revision history`} />
        </div>
      ))}
    </div>
  ),
};
