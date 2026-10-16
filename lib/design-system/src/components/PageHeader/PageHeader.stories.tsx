import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Badge } from "../Badge/Badge";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs";
import { Button } from "../Button/Button";
import { PageHeader } from "./PageHeader";

const meta = {
  title: "Components/Page Header",
  component: PageHeader,
  args: {
    title: "Content dashboard",
    description: "Review drafts, manage your pages, and keep publishing on track.",
    headingLevel: 1,
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    breadcrumbs: { control: false },
    status: { control: false },
    actions: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <PageHeader
      {...args}
      actions={
        <>
          <Button variant="secondary">Save draft</Button>
          <Button>Create page</Button>
        </>
      }
      breadcrumbs={
        <Breadcrumbs
          items={[
            { label: "Workspace", href: "/" },
            { label: "Pages", current: true },
          ]}
        />
      }
      status={<Badge>Draft</Badge>}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { level: 1, name: "Content dashboard" })).toBeVisible();
    await expect(canvas.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await expect(canvas.getByText("Draft")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Create page" })).toBeVisible();
  },
};

export const Minimal: Story = {
  args: {
    title: "Profile settings",
    description: undefined,
  },
};

export const NarrowLayout: Story = {
  args: {
    title: "Your team's publishing workspace",
    description: "Review drafts, share previews, and publish content from one place.",
  },
  render: (args) => (
    <PageHeader
      {...args}
      actions={
        <>
          <Button variant="secondary">Import draft</Button>
          <Button>Create post</Button>
        </>
      }
      status={<Badge>3 drafts</Badge>}
    />
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme`}
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
          <PageHeader
            actions={<Button>Create page</Button>}
            description="Keep your team's content moving."
            status={<Badge>Draft</Badge>}
            title="Pages"
          />
        </section>
      ))}
    </div>
  ),
};
