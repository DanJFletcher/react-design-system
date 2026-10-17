import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { AnnouncementBar, type AnnouncementBarTone } from "./AnnouncementBar";

const tones: AnnouncementBarTone[] = ["info", "success", "warning", "error", "neutral"];
const themes = ["acme", "luna", "orchid", "atom", "sublime"] as const;

const meta = {
  title: "Compositions/Marketing/Announcement bar",
  id: "components-announcementbar",
  component: AnnouncementBar,
  args: {
    title: "A little update",
    children: "Book your spring service before the calendar fills up.",
    tone: "info",
    dismissible: true,
  },
  argTypes: {
    title: { control: "text" },
    children: { control: "text" },
    tone: { control: "select", options: tones },
    size: { control: "select", options: ["sm", "md", "lg"] },
    alignment: { control: "select", options: ["start", "center"] },
    icon: { control: false },
    action: { control: false },
    visible: { control: false },
    defaultVisible: { control: "boolean" },
    onVisibleChange: { control: false },
    dismissible: { control: "boolean" },
    sticky: { control: "boolean" },
    announcementLabel: { control: "text" },
    dismissLabel: { control: "text" },
    className: { control: false },
    style: { control: false },
  },
  parameters: { docs: { page: null } },
} satisfies Meta<typeof AnnouncementBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    icon: <Icon name="sparkle" />,
    action: <Button size="sm" variant="secondary">Book now</Button>,
  },
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {tones.map((tone) => (
        <AnnouncementBar key={tone} tone={tone} announcementLabel={`${tone} announcement`} title={`${tone[0].toUpperCase()}${tone.slice(1)} update`}>
          Our service schedule has been updated for the season.
        </AnnouncementBar>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <AnnouncementBar key={size} size={size} announcementLabel={`${size} size announcement`} title={`${size.toUpperCase()} announcement`}>
          Seasonal hours: Monday through Saturday, 8 am–6 pm.
        </AnnouncementBar>
      ))}
    </div>
  ),
};

export const Sticky: Story = {
  render: () => (
    <div style={{ blockSize: "18rem", overflow: "auto", border: "1px solid var(--ds-color-border-control)" }}>
      <div style={{ minBlockSize: "8rem", padding: "var(--ds-space-3)" }}>Scroll this frame to see the announcement stick within its scroll context.</div>
      <AnnouncementBar sticky tone="warning" title="Holiday hours">
        We close at 2 pm on Friday.
      </AnnouncementBar>
      <div style={{ minBlockSize: "24rem", padding: "var(--ds-space-4)" }}>The bar stays in the document flow while sticking at the top of this scroll area.</div>
    </div>
  ),
};

export const DismissibleUncontrolled: Story = {
  args: { onVisibleChange: fn(), title: "Temporary service update" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dismissButton = canvas.getByRole("button", { name: "Dismiss announcement" });
    await expect(dismissButton).toBeInTheDocument();
    await userEvent.click(dismissButton);
    await expect(canvas.queryByRole("region", { name: "Announcement" })).not.toBeInTheDocument();
    await expect(args.onVisibleChange).toHaveBeenCalledWith(false);
  },
};

function ControlledVisibilityExample() {
  const [visible, setVisible] = useState(true);
  return (
    <AnnouncementBar
      visible={visible}
      onVisibleChange={(next) => setVisible(next)}
      dismissible
      title="Controlled notice"
    >
      The host controls whether this update is shown.
    </AnnouncementBar>
  );
}

export const ControlledVisibility: Story = {
  render: () => <ControlledVisibilityExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss announcement" }));
    await expect(canvas.queryByRole("region", { name: "Announcement" })).not.toBeInTheDocument();
  },
};

export const LongMobileCopyAndAction: Story = {
  render: () => (
    <div style={{ inlineSize: "19rem", maxInlineSize: "100%" }}>
      <AnnouncementBar
        title="A note about winter appointments"
        tone="info"
        icon={<Icon name="circle-info" />}
        action={<Button size="sm" variant="secondary">See updated hours</Button>}
        dismissible
      >
        Due to seasonal road conditions, our technicians may arrive a little later than usual. Please call ahead if your appointment is time-sensitive.
      </AnnouncementBar>
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {themes.map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            borderRadius: "var(--ds-radius-surface)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <AnnouncementBar announcementLabel={`${theme} store announcement`} title="Store update" tone="success" icon={<Icon name="check" />} dismissible>
            We are open late this Thursday.
          </AnnouncementBar>
        </section>
      ))}
    </div>
  ),
};
