import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Table, type TableColumn, type TableProps, type TableSort } from "./Table";

type Business = {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  status: "Open" | "Closing soon" | "Closed";
};

const businesses: Business[] = [
  { id: "b1", name: "Northstar Plumbing", category: "Plumbing", location: "Toronto", rating: 4.9, status: "Open" },
  { id: "b2", name: "Juniper Garden Studio", category: "Landscaping", location: "Oakville", rating: 4.7, status: "Closing soon" },
  { id: "b3", name: "Harborlight Electric", category: "Electrical", location: "Toronto", rating: 4.8, status: "Open" },
  { id: "b4", name: "Fieldstone Home Repair", category: "Home repair", location: "Burlington", rating: 4.6, status: "Closed" },
];

const businessColumns: TableColumn<Business>[] = [
  { id: "name", header: "Business", accessor: "name", sortable: true, sortLabel: "Sort by business" },
  { id: "category", header: "Service", accessor: "category", sortable: true },
  { id: "location", header: "Location", accessor: "location", sortable: true },
  {
    id: "rating",
    header: "Rating",
    accessor: "rating",
    sortable: true,
    align: "end",
    cell: ({ value }) => `${Number(value).toFixed(1)} / 5`,
    footer: "Average",
  },
  {
    id: "status",
    header: "Status",
    accessor: "status",
    cell: ({ value }) => (
      <span
        style={{
          display: "inline-flex",
          padding: "var(--ds-space-1) var(--ds-space-2)",
          borderRadius: "var(--ds-radius-control)",
          background: "var(--ds-color-action-secondary-bg)",
          color: "var(--ds-color-action-secondary-fg)",
          fontSize: "var(--ds-font-size-sm)",
        }}
      >
        {value as string}
      </span>
    ),
  },
];

function ControlledSortExample() {
  const [sort, setSort] = useState<TableSort | null>({
    columnId: "rating",
    direction: "desc",
  });

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
      <Table
        aria-label="Top local businesses"
        columns={businessColumns}
        data={businesses}
        getRowKey={(business) => business.id}
        onSortChange={setSort}
        sort={sort}
      />
      <output aria-live="polite">
        {sort
          ? `Sorted by ${sort.columnId}, ${sort.direction}`
          : "No active sort"}
      </output>
    </div>
  );
}

function ControlledSelectionExample() {
  const [selected, setSelected] = useState<readonly (string | number)[]>(["b2"]);

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <Table
        aria-label="Select businesses"
        columns={businessColumns}
        data={businesses}
        getRowKey={(business) => business.id}
        onSelectionChange={(keys) => setSelected(keys)}
        selectRowLabel={(business) => `Select ${business.name}`}
        selectedRowKeys={selected}
        selectionMode="multiple"
      />
      <output aria-live="polite">Selected: {selected.join(", ") || "none"}</output>
    </div>
  );
}

function ControlledSearchExample() {
  const [query, setQuery] = useState("");

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <Table
        aria-label="Search local businesses"
        columns={businessColumns}
        data={businesses}
        getRowKey={(business) => business.id}
        onSearchChange={setQuery}
        searchable
        searchLabel="Search local businesses"
        searchValue={query}
      />
      <output aria-live="polite">Current query: {query || "none"}</output>
    </div>
  );
}

const meta = {
  title: "Components/Table",
  component: Table,
  args: {
    "aria-label": "Local businesses",
    columns: businessColumns,
    data: businesses,
    getRowKey: (business: Business) => business.id,
    density: "comfortable",
    striped: false,
    bordered: false,
    hoverable: true,
    stickyHeader: false,
    sortMode: "client",
    selectionMode: "none",
    loading: false,
  },
  argTypes: {
    "aria-label": { control: "text", description: "Accessible name when no caption is supplied." },
    columns: { control: false, description: "Column definitions, including accessors and custom cell renderers." },
    data: { control: false, description: "Rows rendered by the table." },
    getRowKey: { control: false },
    rowClassName: { control: false },
    density: { control: "inline-radio", options: ["compact", "comfortable"] },
    striped: { control: "boolean" },
    bordered: { control: "boolean" },
    hoverable: { control: "boolean" },
    stickyHeader: { control: "boolean" },
    tableLayout: { control: "inline-radio", options: ["auto", "fixed"] },
    minTableWidth: { control: "text" },
    maxHeight: { control: "text" },
    caption: { control: "text" },
    captionHidden: { control: "boolean" },
    captionSide: { control: "inline-radio", options: ["top", "bottom"] },
    emptyState: { control: "text" },
    loading: { control: "boolean" },
    loadingMessage: { control: "text" },
    searchable: { control: "boolean" },
    searchValue: { control: false },
    defaultSearchValue: { control: "text" },
    onSearchChange: { control: false },
    searchLabel: { control: "text" },
    searchPlaceholder: { control: "text" },
    showSearchLabel: { control: "boolean" },
    searchableColumns: { control: false },
    searchFunction: { control: false },
    noResultsState: { control: "text" },
    sort: { control: false },
    defaultSort: { control: false },
    sortMode: { control: "inline-radio", options: ["client", "manual"] },
    onSortChange: { control: false },
    selectionMode: { control: "inline-radio", options: ["none", "single", "multiple"] },
    selectedRowKeys: { control: false },
    defaultSelectedRowKeys: { control: false },
    onSelectionChange: { control: false },
    isRowSelectable: { control: false },
    selectAllLabel: { control: "text" },
    selectRowLabel: { control: false },
    style: { control: false },
    className: { control: false },
    tableClassName: { control: false },
    tableStyle: { control: false },
    viewportClassName: { control: false },
    tableId: { control: false },
  },
} satisfies Meta<TableProps<Business>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    onSortChange: fn(),
    onSelectionChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Local businesses" });
    await userEvent.click(within(table).getByRole("button", { name: "Sort by business" }));
    await expect(within(table).getByRole("columnheader", { name: /Business/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  },
};

export const WithCaption: Story = {
  args: {
    "aria-label": undefined,
    caption: "Featured local providers",
  },
};

export const CompactStriped: Story = {
  args: {
    density: "compact",
    striped: true,
    bordered: true,
  },
};

export const MultipleSelection: Story = {
  render: () => <ControlledSelectionExample />,
};

export const ControlledSorting: Story = {
  render: () => <ControlledSortExample />,
};

export const Empty: Story = {
  args: {
    data: [],
    emptyState: "No businesses match these filters.",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    loadingMessage: "Refreshing business directory…",
  },
};

export const StickyHeader: Story = {
  args: {
    data: [...businesses, ...businesses, ...businesses].map((business, index) => ({
      ...business,
      id: `${business.id}-${index}`,
    })),
    maxHeight: 280,
    stickyHeader: true,
    striped: true,
  },
};

export const ManualSorting: Story = {
  args: {
    defaultSort: { columnId: "category", direction: "asc" },
    sortMode: "manual",
  },
};

export const NarrowScreen: Story = {
  args: {
    minTableWidth: 720,
    selectionMode: "multiple",
  },
};

export const Searchable: Story = {
  args: {
    searchable: true,
    searchLabel: "Search businesses",
    searchPlaceholder: "Search by business or location",
    searchableColumns: ["name", "location"],
    noResultsState: "No matching businesses.",
  },
};

export const ControlledSearch: Story = {
  render: () => <ControlledSearchExample />,
};

export const CustomSearchFunction: Story = {
  args: {
    searchable: true,
    searchLabel: "Search business services",
    searchPlaceholder: "Try a service or “top rated”",
    searchFunction: (business: Business, query: string) => {
      const normalizedQuery = query.toLocaleLowerCase();
      return (
        business.category.toLocaleLowerCase().includes(normalizedQuery) ||
        (normalizedQuery === "top rated" && business.rating >= 4.8)
      );
    },
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
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
          <h2 style={{ color: "var(--ds-color-text-primary)" }}>{theme.toUpperCase()}</h2>
          <Table
            aria-label={`${theme} business table`}
            columns={businessColumns.slice(0, 3)}
            data={businesses}
            getRowKey={(business) => business.id}
            hoverable
            striped
          />
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const atomTable = canvas.getByRole("table", { name: "atom business table" });
    const atomFrame = atomTable.parentElement;
    expect(atomFrame).not.toBeNull();
    const atomBorder = getComputedStyle(atomFrame!).borderTopColor;
    expect(atomBorder).toBe("rgb(112, 232, 255)");

    const acmeTable = canvas.getByRole("table", { name: "acme business table" });
    const acmeBorder = getComputedStyle(acmeTable.parentElement!).borderTopColor;
    expect(acmeBorder).not.toBe(atomBorder);
  },
};

export const CustomHooks: Story = {
  args: {
    style: {
      "--ds-table-surface": "#f1f5ff",
      "--ds-table-text": "#172554",
      "--ds-table-border": "#7992ce",
      "--ds-table-header-surface": "#dbeafe",
      "--ds-table-header-text": "#172554",
      "--ds-table-striped-surface": "#e8efff",
      "--ds-table-row-hover": "#dbeafe",
      "--ds-table-row-selected": "#bfdbfe",
      "--ds-table-muted": "#3b4e7a",
      "--ds-table-radius": "var(--ds-radius-surface)",
      "--ds-table-padding": "var(--ds-space-4)",
      "--ds-table-compact-padding": "var(--ds-space-2)",
      "--ds-table-gap": "var(--ds-space-3)",
    },
  },
};
