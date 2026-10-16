import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Components/Empty state",
  component: EmptyState,
  args: {
    title: "No pages yet",
    description: "Create your first page to start building your site.",
    headingLevel: 2,
    layout: "compact",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    layout: { control: "inline-radio", options: ["compact", "full"] },
    icon: { control: false },
    actions: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <EmptyState
      {...args}
      actions={
        <>
          <Button variant="secondary">Browse templates</Button>
          <Button>Create a page</Button>
        </>
      }
      icon={<Icon name="folder" size="xl" />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("region", { name: "No pages yet" })).toBeVisible();
    await expect(canvas.getByRole("heading", { level: 2, name: "No pages yet" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Create a page" })).toBeVisible();
  },
};

export const NoResults: Story = {
  args: {
    title: "No matching articles",
    description: "Try a different search term or clear the current filters.",
  },
  render: (args) => (
    <EmptyState
      {...args}
      actions={<Button variant="secondary">Clear filters</Button>}
      icon={<Icon name="search" size="xl" />}
    />
  ),
};

export const FullPage: Story = {
  args: {
    title: "Nothing to review",
    description: "New submissions will appear here when they are ready.",
    layout: "full",
  },
  render: (args) => (
    <div
      data-testid="empty-state-full-page-container"
      style={{
        blockSize: "calc(100vh - var(--ds-space-32))",
        minBlockSize: "var(--ds-space-32)",
      }}
    >
      <EmptyState
        {...args}
        actions={<Button>View all content</Button>}
        icon={<Icon name="book" size="xl" />}
      />
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme preview`}
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
          <EmptyState
            actions={<Button>Create a page</Button>}
            description="Create or import content to get started."
            icon={<Icon name="folder" size="xl" />}
            title={`No ${theme} pages yet`}
          />
        </section>
      ))}
    </div>
  ),
};
