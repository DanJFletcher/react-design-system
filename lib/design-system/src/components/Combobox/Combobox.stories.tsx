import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Combobox, type ComboboxOption } from "./Combobox";

const regions: readonly ComboboxOption[] = [
  { value: "ca", label: "Canada" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "nz", label: "New Zealand" },
];

const meta = {
  title: "Components/Forms/Combobox",
  id: "components-combobox",
  component: Combobox,
  args: {
    label: "Service region",
    options: regions,
    placeholder: "Search regions",
  },
  argTypes: {
    label: { control: "text" },
    options: { control: false },
    value: { control: "text" },
    defaultValue: { control: "text" },
    name: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    allowClear: { control: "boolean" },
    loading: { control: "boolean" },
    description: { control: "text" },
    error: { control: "text" },
    noResultsMessage: { control: "text" },
    loadingMessage: { control: "text" },
    filterOptions: { control: false },
    onValueChange: { control: false },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <div style={{ maxWidth: "32rem" }}>
      <Combobox {...args} />
    </div>
  ),
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

function RegionRequestForm() {
  const [summary, setSummary] = useState("No region selected yet.");

  return (
    <form
      aria-label="Estimate request"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSummary(`Selected region: ${String(formData.get("region") ?? "")}`);
      }}
    >
      <div style={{ display: "grid", maxWidth: "32rem", gap: "var(--ds-space-4)" }}>
        <Combobox
          label="Service region"
          name="region"
          options={regions}
          required
          description="Search for the region where you need service."
          placeholder="Type a country"
        />
        <Button type="submit">Request estimate</Button>
        <output aria-live="polite">{summary}</output>
      </div>
    </form>
  );
}

export const SearchAndFormSubmission: Story = {
  render: () => <RegionRequestForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Service region" });
    const form = canvas.getByRole("form", { name: "Estimate request" });

    await expect(input).toBeRequired();
    await expect(input).toHaveAttribute("aria-autocomplete", "list");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    expect((form as HTMLFormElement).checkValidity()).toBe(false);

    input.focus();
    await userEvent.type(input, "Can");
    await expect(canvas.getByRole("option", { name: "Canada" })).toBeVisible();
    await expect(canvas.getAllByRole("option")).toHaveLength(1);
    await userEvent.keyboard("{ArrowDown}{Enter}");

    await expect(input).toHaveValue("Canada");
    expect(new FormData(form as HTMLFormElement).get("region")).toBe("ca");
    await userEvent.click(canvas.getByRole("button", { name: "Request estimate" }));
    await expect(canvas.getByText("Selected region: ca")).toBeVisible();
  },
};

export const ClearSelection: Story = {
  args: {
    name: "region",
    defaultValue: "ca",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Service region" });
    await expect(input).toHaveValue("Canada");
    input.focus();
    await userEvent.tab();
    const clearButton = canvas.getByRole("button", { name: "Clear selection" });
    await expect(clearButton).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("");
    await expect(input).toHaveAttribute("aria-expanded", "false");
  },
};

export const KeyboardAndDisabledOptions: Story = {
  args: {
    label: "Choose a province",
    options: [
      { value: "alberta", label: "Alberta" },
      { value: "british-columbia", label: "British Columbia", disabled: true },
      { value: "ontario", label: "Ontario" },
    ],
    name: "province",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Choose a province" });
    await userEvent.click(input);
    await expect(canvas.getByRole("listbox")).toBeVisible();
    await expect(canvas.getByRole("option", { name: "British Columbia" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveAttribute(
      "aria-activedescendant",
      expect.stringContaining("option-2"),
    );
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("Ontario");
  },
};

export const ValidationAndDisabled: Story = {
  render: () => (
    <div style={{ display: "grid", maxWidth: "32rem", gap: "var(--ds-space-4)" }}>
      <Combobox
        label="Preferred region"
        options={regions}
        error="Choose a region before continuing."
        name="preferred-region"
      />
      <Combobox label="Locked region" options={regions} defaultValue="uk" disabled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("combobox", { name: "Preferred region" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(canvas.getByRole("combobox", { name: "Locked region" })).toBeDisabled();
    await expect(canvas.getByRole("combobox", { name: "Locked region" })).toHaveValue("United Kingdom");
  },
};

export const LoadingAndNoResults: Story = {
  render: () => (
    <div style={{ display: "grid", maxWidth: "32rem", gap: "var(--ds-space-4)" }}>
      <Combobox label="Loading locations" options={[]} loading />
      <Combobox label="Find a location" options={regions} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loadingInput = canvas.getByRole("combobox", { name: "Loading locations" });
    await userEvent.click(loadingInput);
    await expect(canvas.getByRole("status")).toHaveTextContent("Loading options…");

    const searchInput = canvas.getByRole("combobox", { name: "Find a location" });
    await userEvent.type(searchInput, "no matching region");
    await expect(canvas.getByRole("status")).toHaveTextContent("No results found.");
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-2)",
            padding: "var(--ds-space-4)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <Combobox
            label={`${theme} service region`}
            options={regions}
            defaultValue="ca"
            name={`${theme}-region`}
          />
        </div>
      ))}
    </div>
  ),
};

export const NarrowLongOptions: Story = {
  render: () => (
    <div style={{ maxWidth: "18rem" }}>
      <Combobox
        label="Choose a service area"
        options={[
          { value: "east", label: "Eastern region with a longer descriptive name" },
          { value: "west", label: "Western region with a longer descriptive name" },
        ]}
        placeholder="Search service areas"
      />
    </div>
  ),
};
