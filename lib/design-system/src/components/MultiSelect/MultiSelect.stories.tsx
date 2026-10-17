import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { MultiSelect, type MultiSelectOption } from "./MultiSelect";

const tags: readonly MultiSelectOption[] = [
  { value: "design", label: "Design systems" },
  { value: "accessibility", label: "Accessibility" },
  { value: "react", label: "React" },
  { value: "cms", label: "Content management" },
  { value: "internal", label: "Internal only", disabled: true },
];

const meta = {
  title: "Components/Forms/Multi-select",
  id: "components-multiselect",
  component: MultiSelect,
  args: {
    label: "Topics",
    options: tags,
    placeholder: "Search and select topics",
  },
  argTypes: {
    label: { control: "text" },
    options: { control: false },
    value: { control: false },
    defaultValue: { control: false },
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
    removeLabel: { control: false },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <div style={{ maxWidth: "32rem" }}>
      <MultiSelect {...args} />
    </div>
  ),
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

function TopicRequestForm() {
  const [summary, setSummary] = useState("No topics selected yet.");

  return (
    <form
      aria-label="Topic request"
      onSubmit={(event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget).getAll("topics").join(", ");
        setSummary(`Selected topics: ${values}`);
      }}
    >
      <div style={{ display: "grid", maxWidth: "32rem", gap: "var(--ds-space-4)" }}>
        <MultiSelect
          label="Topics"
          name="topics"
          options={tags}
          required
          description="Choose one or more topics for your article."
          placeholder="Search topics"
        />
        <Button type="submit">Save topics</Button>
        <output aria-live="polite">{summary}</output>
      </div>
    </form>
  );
}

function ControlledTopicsExample() {
  const [value, setValue] = useState<string[]>(["design"]);
  return (
    <div style={{ display: "grid", maxWidth: "32rem", gap: "var(--ds-space-3)" }}>
      <MultiSelect
        label="Article topics"
        options={tags}
        value={value}
        onValueChange={setValue}
        description="Selection is controlled by the parent."
      />
      <output aria-live="polite">Selected: {value.join(", ") || "none"}</output>
    </div>
  );
}

export const SearchAndFormSubmission: Story = {
  render: () => <TopicRequestForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Topics" });
    const form = canvas.getByRole("form", { name: "Topic request" });

    await expect(input).toHaveAttribute("aria-required", "true");
    expect((form as HTMLFormElement).checkValidity()).toBe(false);
    await userEvent.type(input, "design");
    await expect(canvas.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByRole("button", { name: "Remove Design systems" })).toBeVisible();
    await userEvent.clear(input);
    await userEvent.type(input, "react");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(form).toHaveFormValues({ topics: ["design", "react"] });
    await userEvent.click(canvas.getByRole("button", { name: "Save topics" }));
    await expect(canvas.getByText("Selected topics: design, react")).toBeVisible();
  },
};

export const RemoveSelections: Story = {
  args: {
    name: "topics",
    defaultValue: ["design", "react"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Topics" });
    await expect(canvas.getByRole("button", { name: "Remove Design systems" })).toBeVisible();
    input.focus();
    await userEvent.keyboard("{Backspace}");
    await expect(canvas.queryByRole("button", { name: "Remove React" })).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Clear selections" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("button", { name: "Remove Design systems" })).not.toBeInTheDocument();
    await expect(input).toHaveAttribute("aria-expanded", "false");
  },
};

export const ControlledSelection: Story = {
  render: () => <ControlledTopicsExample />,
};

export const KeyboardAndDisabledOptions: Story = {
  args: {
    options: [
      { value: "first", label: "First topic" },
      { value: "unavailable", label: "Unavailable topic", disabled: true },
      { value: "last", label: "Last topic" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Topics" });
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Remove Last topic" })).toBeVisible();
    await expect(canvas.getByRole("option", { name: "Unavailable topic" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  },
};

export const LoadingAndNoResults: Story = {
  render: () => (
    <div style={{ display: "grid", maxWidth: "32rem", gap: "var(--ds-space-4)" }}>
      <MultiSelect label="Loading topics" options={[]} loading />
      <MultiSelect label="Find a topic" options={tags} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Loading topics" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Loading options…");
    await userEvent.type(canvas.getByRole("combobox", { name: "Find a topic" }), "no matching topic");
    await expect(canvas.getByRole("status")).toHaveTextContent("No results found.");
  },
};

export const ValidationDisabledAndThemes: Story = {
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
          <MultiSelect label={`${theme} topics`} options={tags} defaultValue={["design"]} />
        </div>
      ))}
      <MultiSelect label="Disabled topics" options={tags} disabled defaultValue={["design"]} />
      <MultiSelect label="Topics with error" options={tags} error="Select at least one topic." />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("combobox", { name: "Disabled topics" })).toBeDisabled();
    await expect(canvas.getByRole("combobox", { name: "Topics with error" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  },
};

export const NarrowLongOptions: Story = {
  render: () => (
    <div style={{ maxWidth: "18rem" }}>
      <MultiSelect
        label="Choose article topics"
        options={[
          { value: "editorial", label: "Editorial design systems and component libraries" },
          { value: "accessibility", label: "Accessible interaction and inclusive content" },
        ]}
        placeholder="Search topics"
      />
    </div>
  ),
};
