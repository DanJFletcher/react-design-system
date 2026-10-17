import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { AvatarGroup, type AvatarGroupMember } from "./AvatarGroup";

const avatarImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#e8ddf2"/><circle cx="48" cy="35" r="18" fill="#79588f"/><path d="M15 96c2-24 15-37 33-37s31 13 33 37" fill="#79588f"/></svg>',
)}`;

const teamMembers: readonly AvatarGroupMember[] = [
  { id: "maya", name: "Maya Chen", src: avatarImage },
  { id: "theo", name: "Theo Park" },
  { id: "nia", name: "Nia Woods", initials: "NW" },
  { id: "ari", name: "Ari Morgan" },
  { id: "jules", name: "Jules Rivera" },
  { id: "sam", name: "Sam Patel" },
];

const meta = {
  title: "Components/Identity/Avatar group",
  id: "components-avatar-group",
  component: AvatarGroup,
  args: {
    members: teamMembers,
    label: "Project team",
    maxVisible: 3,
  },
  argTypes: {
    members: { control: false },
    label: { control: "text" },
    maxVisible: { control: { type: "number", min: 0, max: 6, step: 1 } },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    shape: { control: "inline-radio", options: ["circle", "rounded", "square"] },
    overflowLabel: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TeamMembers: Story = {};

export const OverflowDisclosure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overflow = canvas.getByRole("button", { name: "Show 3 more members" });
    await expect(overflow).toBeVisible();
    await userEvent.click(overflow);
    await expect(canvas.getByText("Ari Morgan")).toBeVisible();
    await expect(canvas.getByText("Jules Rivera")).toBeVisible();
    await expect(canvas.getByText("Sam Patel")).toBeVisible();
  },
};

export const SmallGroup: Story = {
  args: {
    members: teamMembers.slice(0, 2),
    maxVisible: 4,
    size: "sm",
  },
};

export const AllMembersHidden: Story = {
  args: {
    members: teamMembers.slice(0, 3),
    maxVisible: 0,
    overflowLabel: (count) => `View ${count} assigned editors`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "View 3 assigned editors" }));
    await expect(canvas.getByText("Maya Chen")).toBeVisible();
    await expect(canvas.getByText("Theo Park")).toBeVisible();
    await expect(canvas.getByText("Nia Woods")).toBeVisible();
  },
};

export const ThemeCoverage: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
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
          <AvatarGroup {...args} label={`${theme} team`} />
        </div>
      ))}
    </div>
  ),
};
