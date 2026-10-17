import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ReactNode } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Icon, iconNames, type IconName } from "../Icon/Icon";
import { Search } from "./Search";

const iconChoices = Object.fromEntries(
  iconNames.map((name) => [name, <Icon key={name} name={name} size="sm" />]),
) as Record<IconName, ReactNode>;

function resolveIcon(value: ReactNode, fallback: IconName): ReactNode {
  if (typeof value === "string" && value in iconChoices) {
    return iconChoices[value as IconName];
  }
  return value ?? iconChoices[fallback];
}

const meta = {
  title: "Components/Forms/Search",
  id: "components-search",
  component: Search,
  args: {
    label: "Search the site",
    placeholder: "Search services, articles, and more",
    queryName: "q",
    showLabel: false,
    showLeadingIcon: true,
    leadingIcon: "search",
    clearIcon: "close",
    submitIcon: "search",
    clearable: true,
    showSubmitButton: true,
    submitButtonLabel: "Search",
    clearButtonLabel: "Clear search",
    size: "md",
    variant: "outlined",
  },
  argTypes: {
    label: { control: "text" },
    inputId: { control: "text" },
    queryName: { control: "text" },
    placeholder: { control: "text" },
    value: { control: "text" },
    defaultValue: { control: "text" },
    showLabel: { control: "boolean" },
    showLeadingIcon: { control: "boolean" },
    leadingIcon: { control: "select", options: iconNames },
    clearIcon: { control: "select", options: iconNames },
    submitIcon: { control: "select", options: iconNames },
    clearable: { control: "boolean" },
    showSubmitButton: { control: "boolean" },
    submitButtonLabel: { control: "text" },
    clearButtonLabel: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outlined", "soft"] },
    onValueChange: { control: false },
    onClear: { control: false },
    onSearch: { control: false },
    onSubmit: { control: false },
    invalid: { control: "boolean" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    autoComplete: { control: "text" },
    inputMode: { control: "text" },
    minLength: { control: "number" },
    maxLength: { control: "number" },
    inputAriaDescribedBy: { control: "text" },
    inputClassName: { control: false },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <Search
      {...args}
      leadingIcon={resolveIcon(args.leadingIcon, "search")}
      clearIcon={resolveIcon(args.clearIcon, "close")}
      submitIcon={resolveIcon(args.submitIcon, "search")}
    />
  ),
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    onSearch: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox", { name: "Search the site" });
    await userEvent.type(input, "garden design");
    await userEvent.keyboard("{Enter}");
    await expect(args.onSearch).toHaveBeenCalledWith("garden design", expect.anything());

    const clearButton = canvas.getByRole("button", { name: "Clear search" });
    await userEvent.click(clearButton);
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
  },
};

export const VisibleLabel: Story = {
  args: {
    label: "Search appointments",
    showLabel: true,
    placeholder: "Name, service, or date",
  },
};

export const SearchSizes: Story = {
  render: () => (
    <div style={{ display: "grid", maxInlineSize: "42rem", gap: "var(--ds-space-5)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Search
          key={size}
          label={`${size.toUpperCase()} search`}
          placeholder="Search this website"
          size={size}
          variant="outlined"
        />
      ))}
    </div>
  ),
};

export const SoftVariant: Story = {
  args: {
    label: "Search services",
    placeholder: "Try “repairs”",
    variant: "soft",
    showSubmitButton: false,
  },
};

export const NativeGetSearch: Story = {
  args: {
    label: "Search local listings",
    action: "/search-results",
    method: "get",
    queryName: "query",
    placeholder: "Enter a neighborhood or service",
    onSearch: undefined,
  },
};

export const Disabled: Story = {
  args: {
    label: "Search unavailable",
    defaultValue: "Seasonal services",
    disabled: true,
  },
};

export const ControlledValue: Story = {
  render: () => <ControlledSearch />,
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{ padding: "var(--ds-space-4)", backgroundColor: "var(--ds-color-canvas)" }}
        >
          <Search
            label={`${theme} site search`}
            placeholder={`Search in ${theme}`}
            size="md"
            variant="outlined"
          />
        </div>
      ))}
    </div>
  ),
};

export const CustomHooks: Story = {
  args: {
    label: "Search with custom styling",
    placeholder: "Search the catalog",
    style: {
      "--ds-search-surface": "var(--ds-color-accent-bg)",
      "--ds-search-text": "var(--ds-color-accent-fg)",
      "--ds-search-muted": "var(--ds-color-accent-fg)",
      "--ds-search-border": "var(--ds-color-accent-fg)",
      "--ds-search-radius": "var(--ds-radius-form-control)",
      "--ds-search-padding": "var(--ds-space-4)",
      "--ds-search-gap": "var(--ds-space-3)",
    },
  },
};

function ControlledSearch() {
  const [query, setQuery] = useState("appointments");
  const [submittedQuery, setSubmittedQuery] = useState("");

  return (
    <div style={{ display: "grid", maxInlineSize: "36rem", gap: "var(--ds-space-3)" }}>
      <Search
        label="Search appointments"
        onSearch={(nextQuery) => setSubmittedQuery(nextQuery)}
        onValueChange={setQuery}
        placeholder="Search appointments"
        value={query}
      />
      <p aria-live="polite" style={{ margin: 0, color: "var(--ds-color-text-muted)" }}>
        {submittedQuery ? `Submitted: ${submittedQuery}` : "Edit the controlled value and press Enter."}
      </p>
    </div>
  );
}
