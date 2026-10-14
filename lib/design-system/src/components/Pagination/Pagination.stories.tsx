import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Pagination } from "./Pagination";

function ControlledPaginationExample({
  initialPage,
  totalPages,
}: {
  initialPage: number;
  totalPages: number;
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <Pagination
        aria-label="Controlled article pagination"
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
      />
      <output aria-live="polite" data-testid="current-page">
        Current page: {currentPage}
      </output>
    </div>
  );
}

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  args: {
    "aria-label": "Article pagination",
    currentPage: 4,
    totalPages: 12,
    siblingCount: 1,
    boundaryCount: 1,
    previousLabel: "Previous page",
    nextLabel: "Next page",
    onPageChange: fn(),
  },
  argTypes: {
    "aria-label": { control: "text", description: "Accessible name for the navigation landmark." },
    currentPage: { control: { type: "number", min: 1 }, description: "Currently selected one-based page." },
    totalPages: { control: { type: "number", min: 1 }, description: "Total number of pages." },
    siblingCount: { control: { type: "number", min: 0 }, description: "Visible page numbers on either side of the current page." },
    boundaryCount: { control: { type: "number", min: 0 }, description: "Visible page numbers at each end of the range." },
    previousLabel: { control: "text" },
    nextLabel: { control: "text" },
    pageLabel: { control: false },
    pageSummaryLabel: { control: false },
    onPageChange: { control: false },
    getPageHref: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Page 5" }));
    await expect(args.onPageChange).toHaveBeenCalledWith(5);
  },
};

export const LinkNavigation: Story = {
  render: () => (
    <Pagination
      aria-label="Article pages"
      currentPage={4}
      getPageHref={(page) => `/journal?page=${page}`}
      totalPages={12}
    />
  ),
};

export const Controlled: Story = {
  render: (args) => (
    <ControlledPaginationExample
      initialPage={args.currentPage}
      totalPages={args.totalPages}
    />
  ),
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 12,
  },
};

export const PageWindow: Story = {
  args: {
    currentPage: 18,
    totalPages: 40,
    boundaryCount: 2,
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["acme", "luna", "orchid", "atom"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme`}
          data-ds-theme={theme}
          key={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <h2 style={{ color: "var(--ds-color-text-primary)" }}>
            {theme.toUpperCase()}
          </h2>
          <Pagination
            aria-label={`${theme} article pagination`}
            currentPage={4}
            getPageHref={(page) => `/${theme}/journal?page=${page}`}
            totalPages={12}
          />
        </section>
      ))}
    </div>
  ),
};

export const NarrowScreen: Story = {
  args: {
    "aria-label": "Narrow-screen article pagination",
    currentPage: 17,
    totalPages: 30,
  },
};
