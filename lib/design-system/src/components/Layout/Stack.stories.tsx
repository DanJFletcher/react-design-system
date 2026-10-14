import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "./Stack";
import styles from "./Layout.stories.module.css";

const meta = {
  title: "Components/Layout/Stack",
  component: Stack,
  args: {
    gap: "md",
    align: "stretch",
    justify: "start",
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
    as: {
      control: "select",
      options: ["div", "section", "ul", "ol", "form"],
    },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Stack {...args}>
      <div className={styles.demoItem}>First item</div>
      <div className={styles.demoItem}>Second item</div>
      <div className={styles.demoItem}>Third item</div>
    </Stack>
  ),
};

export const ListExample: Story = {
  render: () => (
    <Stack as="ul" aria-label="Business services" gap="sm">
      {["Repairs", "Installations", "Maintenance"].map((service) => (
        <li className={styles.demoItem} key={service}>
          {service}
        </li>
      ))}
    </Stack>
  ),
};
