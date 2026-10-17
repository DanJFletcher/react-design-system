import type { Meta, StoryObj } from "@storybook/react";
import { Container, type ContainerMaxWidth } from "./Container";
import styles from "./Layout.stories.module.css";

const meta = {
  title: "Foundations/Layout helpers/Container",
  id: "components-layout-container",
  component: Container,
  args: {
    maxWidth: "content",
    gutter: "md",
  },
  argTypes: {
    maxWidth: {
      control: "inline-radio",
      options: ["narrow", "content", "wide", "full"],
    },
    gutter: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl"],
    },
    as: {
      control: "select",
      options: ["div", "section", "main", "article", "nav", "aside"],
    },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Container {...args}>
      <div className={styles.demoItem}>Readable page content inside a centered container.</div>
    </Container>
  ),
};

export const WidthExamples: Story = {
  render: () => (
    <div className={styles.examples}>
      {(["narrow", "content", "wide", "full"] as const).map(
        (maxWidth: ContainerMaxWidth) => (
          <Container
            className={styles.demoItem}
            key={maxWidth}
            maxWidth={maxWidth}
          >
            maxWidth=&quot;{maxWidth}&quot;
          </Container>
        ),
      )}
    </div>
  ),
};

export const SemanticSection: Story = {
  render: () => (
    <Container as="section" aria-labelledby="container-section-heading">
      <h2 id="container-section-heading">A semantic section with consistent gutters</h2>
      <p className={styles.demoText}>The container only controls width and spacing.</p>
    </Container>
  ),
};
