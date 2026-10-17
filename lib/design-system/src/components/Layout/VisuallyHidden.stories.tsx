import type { Meta, StoryObj } from "@storybook/react";
import { VisuallyHidden } from "./VisuallyHidden";
import styles from "./Layout.stories.module.css";

const meta = {
  title: "Foundations/Accessibility/Visually hidden",
  id: "components-layout-visually-hidden",
  component: VisuallyHidden,
  args: {
    focusable: false,
  },
  argTypes: {
    focusable: { control: "boolean" },
    as: {
      control: "select",
      options: ["span", "div", "label", "a"],
    },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <p>
      This visible sentence includes{" "}
      <VisuallyHidden {...args}>additional text available to screen readers</VisuallyHidden>
      {" "}for assistive technology.
    </p>
  ),
};

export const AccessibleDescription: Story = {
  render: () => (
    <div>
      <label htmlFor="layout-accessible-name">Business name</label>
      <input
        aria-describedby="layout-accessible-name-help"
        id="layout-accessible-name"
        type="text"
      />
      <VisuallyHidden id="layout-accessible-name-help">
        Enter the name customers will see on your profile.
      </VisuallyHidden>
      <p className={styles.focusHelp}>The extra hint is available to screen readers.</p>
    </div>
  ),
};

export const FocusableSkipLink: Story = {
  render: () => (
    <div>
      <VisuallyHidden as="a" focusable href="#layout-main-content">
        Skip to main content
      </VisuallyHidden>
      <p className={styles.focusHelp}>Use Tab to reveal the visually hidden skip link.</p>
      <main id="layout-main-content">Main content target</main>
    </div>
  ),
};
