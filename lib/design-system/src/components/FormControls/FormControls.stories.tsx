import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Checkbox } from "./Checkbox";
import { DateField } from "./DateField";
import { FileField } from "./FileField";
import { FieldGroup } from "./FieldGroup";
import { FormLayout } from "./FormLayout";
import { RadioGroup } from "./RadioGroup";
import { Select } from "./Select";
import { Switch } from "./Switch";
import { Textarea } from "./Textarea";
import { TextField } from "./TextField";

const meta = {
  title: "Components/Form controls",
  component: TextField,
  args: { label: "Example field" },
  parameters: { layout: "padded" },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextFieldStates: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)", maxWidth: "32rem" }}>
      <TextField
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        required
        description="We will use this for account updates."
        placeholder="you@example.com"
      />
      <TextField
        label="Organization"
        name="organization"
        defaultValue="Example Co."
        error="Enter the organization name shown on your account."
      />
      <TextField label="Account ID" defaultValue="AC-2048" disabled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByRole("textbox", { name: "Email address" });
    await expect(email).toBeRequired();
    await expect(email).toHaveAttribute("aria-describedby", expect.stringContaining("description"));
    const organization = canvas.getByRole("textbox", { name: "Organization" });
    await expect(organization).toHaveAttribute("aria-invalid", "true");
    await expect(organization).toHaveAttribute("aria-describedby", expect.stringContaining("error"));
    await expect(canvas.getByText("Enter the organization name shown on your account.")).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Account ID" })).toBeDisabled();
  },
};

export const TextareaBasics: Story = {
  render: () => (
    <div style={{ maxWidth: "32rem" }}>
      <Textarea
        label="Project notes"
        name="notes"
        rows={4}
        required
        description="Include context that will help your teammates."
        placeholder="Write a short summary..."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox", { name: "Project notes" });
    await expect(textarea).toHaveAttribute("rows", "4");
    await expect(textarea).toBeRequired();
    await userEvent.type(textarea, "Keep this keyboard-editable.");
    await expect(textarea).toHaveValue("Keep this keyboard-editable.");
  },
};

export const SelectInteraction: Story = {
  render: () => (
    <div style={{ maxWidth: "32rem" }}>
      <Select
        label="Primary region"
        name="region"
        defaultValue=""
        required
        description="Choose where your workspace is based."
      >
        <option value="" disabled>Select a region</option>
        <option value="ca">Canada</option>
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole("combobox", { name: "Primary region" });
    await expect(select).toBeRequired();
    await expect(getComputedStyle(select).appearance).toBe("none");
    const indicator = select.nextElementSibling;
    await expect(indicator).toHaveAttribute("data-icon", "chevron-down");
    await expect(indicator).toHaveAttribute("data-size", "sm");
    await expect(indicator).toHaveAttribute("aria-hidden", "true");
    await expect(getComputedStyle(indicator as SVGElement).inlineSize).toBe("16px");
    await userEvent.selectOptions(select, "ca");
    await expect(select).toHaveValue("ca");
  },
};

export const CheckboxInteraction: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <Checkbox
        label="Receive product updates"
        name="product-updates"
        value="yes"
        defaultChecked
        description="You can change this preference later."
      />
      <Checkbox
        label="Accept the terms"
        name="terms"
        value="accepted"
        required
        error="You must accept the terms to continue."
      />
      <Checkbox label="Archived account" disabled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const updates = canvas.getByRole("checkbox", { name: "Receive product updates" });
    await expect(updates).toBeChecked();
    await userEvent.click(updates);
    await expect(updates).not.toBeChecked();
    const terms = canvas.getByRole("checkbox", { name: "Accept the terms" });
    await expect(terms).toBeRequired();
    await expect(terms).toHaveAttribute("aria-invalid", "true");
    terms.focus();
    await expect(getComputedStyle(terms).outlineWidth).toBe("3px");
    await expect(canvas.getByRole("checkbox", { name: "Archived account" })).toBeDisabled();
  },
};

export const RadioGroupKeyboard: Story = {
  render: () => (
    <div style={{ maxWidth: "32rem" }}>
      <RadioGroup
        label="Preferred contact method"
        name="contact-method"
        required
        defaultValue="email"
        description="Use the arrow keys to move between options."
        options={[
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
          { value: "sms", label: "Text message" },
        ]}
      />
      <RadioGroup
        label="Plan"
        name="plan"
        error="Choose a plan before continuing."
        options={[
          { value: "basic", label: "Basic" },
          { value: "pro", label: "Professional" },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Preferred contact method" });
    const email = canvas.getByRole("radio", { name: "Email" });
    const phone = canvas.getByRole("radio", { name: "Phone" });
    await expect(email).toBeChecked();
    await expect(email).toBeRequired();
    await userEvent.click(email);
    await userEvent.keyboard("{ArrowDown}");
    await expect(phone).toBeChecked();
    const planGroup = canvas.getByRole("group", { name: "Plan" });
    await expect(planGroup).toHaveAttribute("aria-invalid", "true");
    await expect(planGroup).toHaveAttribute("aria-describedby", expect.stringContaining("error"));
  },
};

function NativeDateFileSwitchExample() {
  const [submittedSummary, setSubmittedSummary] = useState("");

  return (
    <>
      <form
        aria-label="Schedule and preferences"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const attachmentName =
            event.currentTarget.querySelector<HTMLInputElement>('input[name="attachments"]')
              ?.files?.[0]?.name ?? "";
          setSubmittedSummary([
            String(formData.get("startDate") ?? ""),
            attachmentName,
            formData.has("reminders") ? "on" : "off",
          ].join(" · "));
        }}
      >
        <div style={{ display: "grid", gap: "var(--ds-space-4)", maxWidth: "32rem" }}>
          <DateField
            label="Start date"
            name="startDate"
            defaultValue="2026-10-11"
            required
            description="Choose the first day of the schedule."
            error="Confirm the start date before submitting."
          />
          <DateField
            label="Review time"
            name="reviewTime"
            type="time"
            disabled
            defaultValue="09:30"
          />
          <FileField
            label="Attachments"
            name="attachments"
            accept=".pdf,application/pdf"
            multiple
            description="Select one or more PDF files."
          />
          <FileField label="Archived attachments" disabled />
          <Switch
            label="Enable reminders"
            name="reminders"
            value="enabled"
            required
            description="Send a reminder before the schedule starts."
            error="This preference needs review."
          />
          <Button type="submit">Save schedule</Button>
          <output aria-live="polite">{submittedSummary}</output>
        </div>
      </form>
      <div style={{ marginBlockStart: "var(--ds-space-4)", maxWidth: "32rem" }}>
        <FileField label="Required attachments" required />
      </div>
    </>
  );
}

export const DateFileAndSwitchInteraction: Story = {
  render: () => <NativeDateFileSwitchExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "Schedule and preferences" });
    const date = canvas.getByLabelText(/Start date/) as HTMLInputElement;
    const time = canvas.getByLabelText("Review time");
    const files = canvas.getByLabelText(/Attachments/);
    const requiredFiles = canvas.getByLabelText(/Required attachments/);
    const reminders = canvas.getByRole("switch", { name: "Enable reminders" });

    await expect(date).toHaveAttribute("type", "date");
    await expect(date).toBeRequired();
    await expect(date).toHaveValue("2026-10-11");
    await expect(date).toHaveAttribute("aria-invalid", "true");
    await expect(date).toHaveAttribute("aria-describedby", expect.stringContaining("description"));
    await expect(time).toHaveAttribute("type", "time");
    await expect(time).toBeDisabled();
    await expect(files).toHaveAttribute("accept", ".pdf,application/pdf");
    await expect(files).toHaveAttribute("multiple");
    await expect(requiredFiles).toBeRequired();
    await expect(canvas.getByLabelText("Archived attachments")).toBeDisabled();
    date.value = "2026-10-12";
    date.dispatchEvent(new Event("input", { bubbles: true }));
    date.dispatchEvent(new Event("change", { bubbles: true }));
    await expect(date).toHaveValue("2026-10-12");
    await expect(reminders).not.toBeChecked();
    await expect(reminders).toBeRequired();
    await userEvent.click(reminders);
    await expect(reminders).toBeChecked();
    reminders.focus();
    await userEvent.keyboard(" ");
    await expect(reminders).not.toBeChecked();
    await userEvent.keyboard(" ");
    await expect(reminders).toBeChecked();
    await expect(reminders).toHaveAttribute("aria-invalid", "true");
    await expect(reminders).toHaveAttribute("aria-describedby", expect.stringContaining("error"));

    const attachments = [
      new File(["agenda"], "agenda.pdf", { type: "application/pdf" }),
      new File(["notes"], "notes.pdf", { type: "application/pdf" }),
    ];
    await userEvent.upload(files, attachments);
    await expect(files).toHaveValue("C:\\fakepath\\agenda.pdf");
    await expect(files).toHaveProperty("files.length", 2);
    const formElement = form as HTMLFormElement;
    const invalidInputs = Array.from(formElement.elements)
      .filter((element): element is HTMLInputElement => element instanceof HTMLInputElement)
      .filter((element) => !element.checkValidity())
      .map((element) => element.name || element.type);
    await expect(invalidInputs).toEqual([]);
    await userEvent.click(canvas.getByRole("button", { name: "Save schedule" }));
    await expect(canvas.getByText("2026-10-12 · agenda.pdf · on")).toBeVisible();

    const submitted = new FormData(formElement);
    expect(submitted.get("startDate")).toBe("2026-10-12");
    expect(submitted.get("reminders")).toBe("enabled");
  },
};

function ConsumerOwnedFormExample() {
  const [submittedName, setSubmittedName] = useState("");

  return (
    <form
      aria-label="Profile details"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSubmittedName(String(formData.get("fullName") ?? ""));
      }}
    >
      <FormLayout columns={2} gap="lg">
        <FieldGroup
          label="Profile"
          description="Tell us how to address you."
        >
          <TextField label="Full name" name="fullName" required />
          <TextField label="Email address" name="email" type="email" required />
        </FieldGroup>
        <FieldGroup label="Preferences">
          <Checkbox label="Send me product updates" name="updates" value="yes" />
          <RadioGroup
            label="Contact method"
            name="contactMethod"
            defaultValue="email"
            options={[
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone" },
            ]}
          />
        </FieldGroup>
      </FormLayout>
      <button type="submit" style={{ marginBlockStart: "var(--ds-space-4)" }}>
        Save profile
      </button>
      <output aria-live="polite" style={{ display: "block", marginBlockStart: "var(--ds-space-2)" }}>
        {submittedName ? `Submitted for ${submittedName}` : ""}
      </output>
    </form>
  );
}

export const FieldGroupingAndLayout: Story = {
  render: () => (
    <div style={{ maxWidth: "56rem" }}>
      <ConsumerOwnedFormExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form");
    const profileGroup = canvas.getByRole("group", { name: "Profile" });
    const name = canvas.getByRole("textbox", { name: "Full name" });
    const email = canvas.getByRole("textbox", { name: "Email address" });
    const emailRadio = canvas.getByRole("radio", { name: "Email" });
    const phoneRadio = canvas.getByRole("radio", { name: "Phone" });

    await expect(profileGroup).toHaveAttribute("aria-describedby", expect.stringContaining("description"));
    await expect(name).toBeRequired();
    await expect(email).toBeRequired();
    await expect(form).not.toHaveAttribute("novalidate");

    await userEvent.tab();
    await expect(name).toHaveFocus();
    await userEvent.type(name, "Avery Chen");
    await userEvent.tab();
    await expect(email).toHaveFocus();
    await userEvent.type(email, "avery@example.com");
    await userEvent.tab();
    await expect(canvas.getByRole("checkbox", { name: "Send me product updates" })).toHaveFocus();
    await userEvent.tab();
    await expect(emailRadio).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(phoneRadio).toBeChecked();

    await userEvent.click(canvas.getByRole("button", { name: "Save profile" }));
    await expect(canvas.getByText("Submitted for Avery Chen")).toBeVisible();
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          style={{
            display: "grid",
            alignContent: "start",
            gap: "var(--ds-space-4)",
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <h2 style={{ color: "var(--ds-color-text-primary)" }}>
            {theme === "acme"
              ? "ACME"
              : theme === "atom"
                ? "Atom comic dark theme"
                : theme === "luna"
                  ? "Luna"
                  : theme === "sublime"
                    ? "Sublime editor dark theme"
                    : "Orchid custom theme"}
          </h2>
          <TextField label="Workspace name" defaultValue="Moonlight" />
          <Textarea label="Description" rows={2} defaultValue="A shared project space." />
          <Select label="Visibility" defaultValue="private">
            <option value="private">Private</option>
            <option value="public">Public</option>
          </Select>
          <DateField label="Start date" type="date" defaultValue="2026-10-11" />
          <FileField label="Supporting document" accept=".pdf" />
          <FormLayout gap="sm">
            <FieldGroup label="Notifications">
              <Checkbox label="Enable notifications" defaultChecked />
              <Switch label="Enable reminders" defaultChecked />
            </FieldGroup>
            <RadioGroup
              label="Plan"
              name={`plan-${theme}`}
              defaultValue="standard"
              options={[
                { value: "standard", label: "Standard" },
                { value: "premium", label: "Premium" },
              ]}
            />
          </FormLayout>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const selects = within(canvasElement).getAllByRole("combobox");
    await expect(selects).toHaveLength(5);
    for (const select of selects) {
      const indicator = select.nextElementSibling;
      if (!(indicator instanceof SVGElement)) {
        throw new Error("The select chevron should follow its native select.");
      }
      await expect(getComputedStyle(indicator).insetInlineEnd).toBe(
        getComputedStyle(select).paddingInlineStart,
      );
    }
  },
};

export const NestedThemeBoundaries: Story = {
  render: () => (
    <div
      data-ds-theme="acme"
      style={{
        display: "grid",
        gap: "var(--ds-space-4)",
        maxWidth: "32rem",
        padding: "var(--ds-space-4)",
        backgroundColor: "var(--ds-color-canvas)",
      }}
    >
      <TextField label="ACME outer field" defaultValue="6px radius" />
      <div
        data-ds-theme="luna"
        style={{
          display: "grid",
          gap: "var(--ds-space-4)",
          padding: "var(--ds-space-4)",
          backgroundColor: "var(--ds-color-canvas)",
        }}
      >
        <TextField label="Luna nested field" defaultValue="pill radius" />
        <Select label="Luna nested select" defaultValue="private">
          <option value="private">Private</option>
          <option value="public">Public</option>
        </Select>
        <DateField label="Luna nested date" defaultValue="2026-10-11" />
        <Switch label="Luna nested switch" defaultChecked />
        <FieldGroup label="Luna profile group">
          <Textarea label="Luna notes" rows={3} placeholder="Add a note..." />
        </FieldGroup>
        <Checkbox label="Luna checkbox" defaultChecked />
        <Button>Luna action remains pill</Button>
        <div
          data-ds-theme="orchid"
          style={{
            display: "grid",
            gap: "var(--ds-space-4)",
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <Select label="Orchid nested select" defaultValue="ready">
            <option value="ready">Ready</option>
          </Select>
          <FileField label="Orchid nested file" accept=".pdf" />
          <RadioGroup
            label="Orchid nested radio group"
            name="orchid-mode"
            defaultValue="light"
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>
      </div>
      <TextField label="ACME restored field" defaultValue="ACME is restored" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radii = [
      { role: "textbox", name: "ACME outer field", radius: "6px" },
      { role: "textbox", name: "Luna nested field", radius: "9999px" },
      { role: "combobox", name: "Luna nested select", radius: "9999px" },
      { role: "textbox", name: "Luna notes", radius: "32px" },
      { role: "group", name: "Luna profile group", radius: "32px" },
      { role: "button", name: "Luna action remains pill", radius: "9999px" },
      { role: "combobox", name: "Orchid nested select", radius: "16px" },
      { role: "textbox", name: "ACME restored field", radius: "6px" },
    ] as const;
    for (const { role, name, radius } of radii) {
      const control = canvas.getByRole(role, { name });
      await expect(getComputedStyle(control).borderTopLeftRadius).toBe(radius);
    }
  },
};
