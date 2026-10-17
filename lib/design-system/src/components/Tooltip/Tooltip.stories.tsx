import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Tooltip, type TooltipPlacement } from "./Tooltip";

type PlaygroundArgs = {
  content: string;
  placement: TooltipPlacement;
};

const meta = {
  title: "Components/Overlays/Tooltip",
  id: "components-tooltip",
  args: {
    content: "Brief contextual help appears on hover or keyboard focus.",
    placement: "top",
  },
  argTypes: {
    content: { control: "text" },
    placement: { control: "select", options: ["top", "right", "bottom", "left"] },
  },
  render: ({ content, placement }) => (
    <Tooltip content={content} placement={placement}>
      <Button variant="secondary">More information</Button>
    </Tooltip>
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const NativePopover: Story = {
  render: () => (
    <div style={{ padding: "var(--ds-space-8)" }}>
      <button popoverTarget="tooltip-native-popover" type="button">
        Open help panel
      </button>
      <div
        id="tooltip-native-popover"
        popover="auto"
        style={{ padding: "var(--ds-space-8)" }}
      >
        <Tooltip content="Additional context inside this popover.">
          <Button variant="secondary">Popover help</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

export const PlacementExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, max-content)", gap: "var(--ds-space-8)", padding: "var(--ds-space-16)" }}>
      {(["top", "right", "bottom", "left"] as const).map((placement) => (
        <Tooltip key={placement} content={`Tooltip placed ${placement}.`} placement={placement}>
          <Button variant="secondary">{placement}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div
      data-ds-theme="acme"
      style={{
        display: "grid",
        gap: "var(--ds-space-4)",
        padding: "var(--ds-space-4)",
        color: "var(--ds-color-text-primary)",
        backgroundColor: "var(--ds-color-canvas)",
      }}
    >
      <Tooltip content="This tooltip inherits ACME colors and spacing.">
        <Button variant="secondary">ACME tooltip</Button>
      </Tooltip>
      <section
        data-ds-theme="luna"
        style={{ display: "grid", gap: "var(--ds-space-4)", padding: "var(--ds-space-4)", backgroundColor: "var(--ds-color-canvas)" }}
      >
        <Tooltip content="This tooltip remains within the nested Luna theme.">
          <Button variant="secondary">Luna tooltip</Button>
        </Tooltip>
        <section
          data-ds-theme="orchid"
          style={{ display: "grid", gap: "var(--ds-space-4)", padding: "var(--ds-space-4)", backgroundColor: "var(--ds-color-canvas)" }}
        >
          <Tooltip content="This tooltip follows the nested Orchid theme.">
            <Button variant="secondary">Orchid tooltip</Button>
          </Tooltip>
        </section>
      </section>
    </div>
  ),
};

export const ViewportEdge: Story = {
  args: {
    content: "A longer tooltip description that wraps naturally and stays inside the visible browser window, even when the trigger is close to the edge.",
    placement: "top",
  },
  render: ({ content, placement }) => (
    <div style={{ position: "fixed", insetBlockStart: "var(--ds-space-1)", insetInlineStart: "var(--ds-space-1)" }}>
      <Tooltip content={content} placement={placement}>
        <Button variant="secondary">Near the viewport edge</Button>
      </Tooltip>
    </div>
  ),
};

export const TransformedClippedPanel: Story = {
  render: () => (
    <div
      data-testid="transformed-clipped-panel"
      style={{
        boxSizing: "border-box",
        inlineSize: "18rem",
        blockSize: "7rem",
        margin: "8rem",
        overflow: "hidden",
        padding: "var(--ds-space-2)",
        border: "1px solid var(--ds-color-border-default)",
        transform: "translateZ(0)",
      }}
    >
      <Tooltip content="This tooltip escapes the transformed, clipped panel.">
        <Button variant="secondary">Panel help</Button>
      </Tooltip>
    </div>
  ),
};

export const ScrollablePanel: Story = {
  render: () => (
    <div
      data-testid="scrollable-panel"
      style={{
        boxSizing: "border-box",
        inlineSize: "20rem",
        blockSize: "9rem",
        margin: "8rem",
        overflow: "auto",
        padding: "var(--ds-space-2)",
        border: "1px solid var(--ds-color-border-default)",
      }}
    >
      <div style={{ blockSize: "12rem" }} />
      <Tooltip content="This tooltip follows its trigger as the panel scrolls.">
        <Button variant="secondary">Scrollable help</Button>
      </Tooltip>
      <div style={{ blockSize: "20rem" }} />
    </div>
  ),
};

export const CustomHooks: Story = {
  render: () => (
    <Tooltip
      content="Scoped hook values style only this tooltip."
      style={{
        "--ds-tooltip-surface": "var(--ds-color-accent-bg)",
        "--ds-tooltip-text": "var(--ds-color-accent-fg)",
        "--ds-tooltip-border": "var(--ds-color-accent-fg)",
        "--ds-tooltip-radius": "var(--ds-space-4)",
        "--ds-tooltip-padding-block": "var(--ds-space-3)",
        "--ds-tooltip-padding-inline": "var(--ds-space-4)",
      }}
    >
      <Button variant="secondary">Custom tooltip</Button>
    </Tooltip>
  ),
};
