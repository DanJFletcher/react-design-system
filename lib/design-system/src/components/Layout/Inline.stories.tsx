import type { Meta, StoryObj } from "@storybook/react";
import { Inline } from "./Inline";
import styles from "./Layout.stories.module.css";

const meta = {
  title: "Foundations/Layout helpers/Inline",
  id: "components-layout-inline",
  component: Inline,
  args: {
    gap: "sm",
    align: "center",
    justify: "start",
    wrap: true,
  },
  argTypes: {
    gap: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl"],
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      control: "inline-radio",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    wrap: { control: "boolean" },
    as: {
      control: "select",
      options: ["div", "nav", "ul", "ol", "header"],
    },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Inline {...args}>
      {["Repairs", "Installations", "Maintenance", "Consultations"].map((service) => (
        <span className={styles.demoChip} key={service}>
          {service}
        </span>
      ))}
    </Inline>
  ),
};

export const WrappingExample: Story = {
  render: () => (
    <div style={{ maxInlineSize: "var(--ds-layout-container-narrow)" }}>
      <Inline gap="sm" wrap>
        {["Repairs", "Installations", "Maintenance", "Consultations"].map((service) => (
          <span className={styles.demoChip} key={service}>
            {service}
          </span>
        ))}
      </Inline>
    </div>
  ),
};
