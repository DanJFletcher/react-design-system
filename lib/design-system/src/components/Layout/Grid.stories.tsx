import type { Meta, StoryObj } from "@storybook/react";
import { Grid, type GridMinItemWidth } from "./Grid";
import styles from "./Layout.stories.module.css";

const businessServices = [
  "Repairs",
  "Installations",
  "Maintenance",
  "Consultations",
  "Inspections",
  "Emergency visits",
];

const meta = {
  title: "Components/Layout/Grid",
  component: Grid,
  args: {
    gap: "md",
    minItemWidth: "md",
  },
  argTypes: {
    gap: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl"],
    },
    minItemWidth: { control: "inline-radio", options: ["sm", "md", "lg"] },
    as: {
      control: "select",
      options: ["div", "section", "ul", "ol"],
    },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Grid {...args}>
      {businessServices.map((service) => (
        <div className={styles.demoItem} key={service}>
          {service}
        </div>
      ))}
    </Grid>
  ),
};

export const ResponsiveExample: Story = {
  render: () => (
    <Grid id="responsive-layout-grid" gap="md" minItemWidth="sm">
      {businessServices.map((service) => (
        <div className={styles.demoItem} key={service}>
          {service}
        </div>
      ))}
    </Grid>
  ),
};

export const MinimumWidthExamples: Story = {
  render: () => (
    <Grid className={styles.examples} gap="lg" minItemWidth="sm">
      {(["sm", "md", "lg"] as const).map((minItemWidth: GridMinItemWidth) => (
        <section key={minItemWidth}>
          <h3>Minimum item width: {minItemWidth}</h3>
          <Grid gap="sm" minItemWidth={minItemWidth}>
            {businessServices.slice(0, 3).map((service) => (
              <div className={styles.demoItem} key={service}>
                {service}
              </div>
            ))}
          </Grid>
        </section>
      ))}
    </Grid>
  ),
};
