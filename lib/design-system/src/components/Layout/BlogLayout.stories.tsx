import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { BlogLayout } from "./BlogLayout";

const meta = {
  title: "Components/Layout/Blog layout",
  component: BlogLayout,
  args: {
    footerGap: "2xl",
  },
  argTypes: {
    children: { control: false },
    className: { control: false },
    footer: { control: false },
    footerGap: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl"],
    },
    header: { control: false },
    style: { control: false },
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BlogLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: null,
  },
  render: ({ footerGap }) => (
    <BlogLayout
      footerGap={footerGap}
      header={
        <Header
          logo="Fieldnotes"
          logoHref="#blog-layout-story"
          logoLabel="Fieldnotes home"
          navItems={[
            { label: "Journal", href: "#blog-layout-story", current: true },
            { label: "Topics", href: "#blog-layout-story" },
          ]}
        />
      }
      footer={
        <Footer
          brand="Fieldnotes"
          copyright="© 2026 Fieldnotes Journal"
          description="Thoughtful notes on building clear, consistent digital products."
          variant="surface"
        />
      }
    >
      <main
        id="blog-layout-story"
        style={{
          boxSizing: "border-box",
          maxInlineSize: "var(--ds-layout-container-content)",
          minBlockSize: "24rem",
          marginInline: "auto",
          padding: "var(--ds-space-8) var(--ds-space-4)",
          color: "var(--ds-color-text-primary)",
        }}
      >
        <p
          style={{
            marginBlock: 0,
            color: "var(--ds-color-action-primary-bg)",
            fontSize: "var(--ds-font-size-sm)",
            fontWeight: "var(--ds-font-weight-semibold)",
          }}
        >
          DESIGN JOURNAL
        </p>
        <h1>One shared layout, a more considered reading experience.</h1>
        <p>
          BlogLayout provides header and footer slots and a token-based control
          for the space between the page content and the footer.
        </p>
      </main>
    </BlogLayout>
  ),
};
