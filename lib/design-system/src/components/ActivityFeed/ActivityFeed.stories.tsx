import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Avatar } from "../Avatar/Avatar";
import { ActivityFeed, type ActivityFeedItem } from "./ActivityFeed";

const events: readonly ActivityFeedItem[] = [
  {
    id: "published-spring-guide",
    actor: "Mara Ellison",
    action: "published",
    subject: "Spring service guide",
    href: "/content/spring-service-guide",
    avatar: <Avatar name="Mara Ellison" size="sm" />,
    dateText: "Today at 10:30 AM",
    dateTime: "2026-10-16T10:30:00-04:00",
    details: "The article is now live on the public site.",
  },
  {
    id: "reviewed-landscape-page",
    actor: "Theo Park",
    action: "reviewed",
    subject: "Landscape design services",
    href: "/content/landscape-design",
    avatar: <Avatar name="Theo Park" size="sm" />,
    dateText: "Today at 9:12 AM",
    dateTime: "2026-10-16T09:12:00-04:00",
  },
  {
    id: "created-faq",
    actor: "Amira Shah",
    action: "created a draft of",
    subject: "Frequently asked questions",
    dateText: "Yesterday at 4:45 PM",
    dateTime: "2026-10-15T16:45:00-04:00",
    details: "The draft is waiting for an editor's review.",
  },
];

const meta = {
  title: "Components/Activity feed",
  component: ActivityFeed,
  args: {
    events,
    heading: "Recent activity",
    description: "Updates from your content workspace.",
  },
  argTypes: {
    events: { control: false },
    heading: { control: "text" },
    description: { control: "text" },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    emptyMessage: { control: "text" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof ActivityFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("region", { name: "Recent activity" })).toBeVisible();
    await expect(canvas.getByRole("list")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Spring service guide" })).toBeVisible();
    await expect(canvas.getByText("Today at 10:30 AM")).toHaveAttribute(
      "datetime",
      "2026-10-16T10:30:00-04:00",
    );
  },
};

export const Empty: Story = {
  args: {
    events: [],
    emptyMessage: "Your team's updates will appear here.",
  },
};

export const LongContent: Story = {
  args: {
    heading: "Updates from across your publishing workspace",
    events: [
      {
        id: "updated-long-title",
        actor: "Mara Ellison",
        action: "updated",
        subject: "A detailed guide to planning seasonal landscape maintenance for community properties",
        href: "/content/seasonal-landscape-maintenance",
        dateText: "Today at 10:30 AM",
        dateTime: "2026-10-16T10:30:00-04:00",
        details: "Added regional timing notes and reviewed the service recommendations for accuracy.",
      },
    ],
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme activity preview`}
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
          <ActivityFeed
            events={events}
            heading={`${theme} recent activity`}
          />
        </section>
      ))}
    </div>
  ),
};
