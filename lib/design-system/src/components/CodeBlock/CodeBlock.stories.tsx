import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { CodeBlock } from "./CodeBlock";

const exampleCode = `type Service = {
  name: string;
  available: boolean;
};

export function formatService(service: Service) {
  return \`\${service.name}: \${service.available ? "available" : "booked"}\`;
}`;

const meta = {
  title: "Components/Code block",
  component: CodeBlock,
  args: {
    code: exampleCode,
    language: "tsx",
    label: "service.tsx",
  },
  argTypes: {
    code: { control: "text" },
    language: {
      control: "select",
      options: [
        "tsx",
        "typescript",
        "javascript",
        "json",
        "html",
        "css",
        "bash",
        "markdown",
        "python",
        "sql",
        "yaml",
        "text",
      ],
    },
    label: { control: "text" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("figure", { name: "service.tsx, tsx" }),
    ).toBeVisible();
    await expect(canvas.getByText("type")).toHaveClass("token", "keyword");
    await expect(canvas.getByText('"available"', { exact: true })).toHaveClass(
      "token",
      "template-string",
      "interpolation",
      "string",
    );
  },
};

export const PlainText: Story = {
  args: {
    language: "text",
    label: "Build output",
    code: "Build completed successfully.\nNo warnings were reported.",
  },
};

export const LongLines: Story = {
  args: {
    code: `const longValue = "${"responsive code surfaces remain scrollable without widening their parent container ".repeat(3)}";`,
    language: "typescript",
    label: "long-lines.ts",
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme code preview`}
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
          <CodeBlock
            code={exampleCode}
            label={`${theme} example.tsx`}
            language="tsx"
          />
        </section>
      ))}
    </div>
  ),
};
