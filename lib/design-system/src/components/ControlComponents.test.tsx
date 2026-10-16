import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar/Avatar";
import { AvatarGroup } from "./AvatarGroup/AvatarGroup";
import { Button } from "./Button/Button";
import { ButtonGroup } from "./ButtonGroup/ButtonGroup";
import { Checkbox } from "./FormControls/Checkbox";
import { DateField } from "./FormControls/DateField";
import { FieldGroup } from "./FormControls/FieldGroup";
import { FieldLegend } from "./FormControls/FormField";
import { FileField } from "./FormControls/FileField";
import { FormLayout } from "./FormControls/FormLayout";
import { RadioGroup } from "./FormControls/RadioGroup";
import { RangeField } from "./FormControls/RangeField";
import { Select } from "./FormControls/Select";
import { Switch } from "./FormControls/Switch";
import { Textarea } from "./FormControls/Textarea";
import { TextField } from "./FormControls/TextField";
import { ToggleButton } from "./ToggleButton/ToggleButton";
import { ToggleGroup } from "./ToggleGroup/ToggleGroup";
import { Icon } from "./Icon/Icon";
import { Spinner } from "./Spinner/Spinner";
import {
  FormFieldLabel,
  FormFieldMessages,
  useFormField,
} from "../index";

describe("form controls", () => {
  it("keeps custom control help connected as validation errors change and clear", () => {
    function CustomControl({ error }: { error?: string }) {
      const description = "Use a unique workspace name.";
      const field = useFormField({
        id: "custom-workspace",
        description,
        error,
        "aria-describedby": "external-help external-help",
      });

      return (
        <>
          <FormFieldLabel id={field.id} label="Workspace name" required disabled />
          <input
            id={field.id}
            required
            disabled
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
          />
          <FormFieldMessages
            description={description}
            descriptionId={field.descriptionId}
            error={error}
            errorId={field.errorId}
          />
          <span id="external-help">Shown to invited members.</span>
        </>
      );
    }

    const { rerender } = render(<CustomControl />);
    const control = screen.getByRole("textbox", { name: "Workspace name" });

    expect(control).toBeRequired();
    expect(control).toBeDisabled();
    expect(control).not.toHaveAttribute("aria-invalid");
    expect(control).toHaveAttribute(
      "aria-describedby",
      "external-help custom-workspace-description",
    );
    expect(screen.getByText("Use a unique workspace name.").id).toContain("description");
    expect(screen.getByText("Workspace name").closest("label")).toHaveAttribute(
      "for",
      "custom-workspace",
    );

    rerender(<CustomControl error="This name is already taken." />);
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAttribute(
      "aria-describedby",
      "external-help custom-workspace-description custom-workspace-error",
    );
    expect(screen.getByText("This name is already taken.")).toHaveAttribute(
      "id",
      "custom-workspace-error",
    );

    rerender(<CustomControl error="Use only letters and numbers." />);
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAttribute(
      "aria-describedby",
      "external-help custom-workspace-description custom-workspace-error",
    );
    expect(screen.queryByText("This name is already taken.")).not.toBeInTheDocument();
    expect(screen.getByText("Use only letters and numbers.")).toHaveAttribute(
      "id",
      "custom-workspace-error",
    );
    expect(document.querySelectorAll("#custom-workspace-error")).toHaveLength(1);

    rerender(<CustomControl />);
    expect(control).not.toHaveAttribute("aria-invalid");
    expect(control).toHaveAttribute(
      "aria-describedby",
      "external-help custom-workspace-description",
    );
    expect(screen.queryByText("Use only letters and numbers.")).not.toBeInTheDocument();
  });

  it("keeps built-in field errors connected when validation messages change", () => {
    const renderFields = (textError: string, selectError: string) => (
      <>
        <TextField
          aria-describedby="name-help"
          description="Enter your display name."
          error={textError}
          id="display-name"
          label="Display name"
        />
        <span id="name-help">Names are visible to your team.</span>
        <Select
          aria-describedby="region-help"
          description="Choose your team's region."
          error={selectError}
          id="team-region"
          label="Team region"
        >
          <option value="west">West</option>
        </Select>
        <span id="region-help">You can change this later.</span>
      </>
    );

    const { rerender } = render(
      renderFields("A: Name is required.", "A: Choose a region."),
    );
    const textField = screen.getByRole("textbox", { name: "Display name" });
    const select = screen.getByRole("combobox", { name: "Team region" });

    rerender(renderFields("B: Use at least two characters.", "B: Select a valid region."));

    expect(textField).toHaveAttribute("aria-invalid", "true");
    expect(textField).toHaveAttribute(
      "aria-describedby",
      "name-help display-name-description display-name-error",
    );
    expect(document.getElementById("display-name-error"))
      .toHaveAttribute("aria-live", "polite");
    expect(document.getElementById("display-name-error"))
      .toHaveAttribute("aria-atomic", "true");
    expect(document.getElementById("display-name-error")).toHaveTextContent(
      "B: Use at least two characters.",
    );
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAttribute(
      "aria-describedby",
      "region-help team-region-description team-region-error",
    );
    expect(document.getElementById("team-region-error"))
      .toHaveAttribute("aria-live", "polite");
    expect(document.getElementById("team-region-error"))
      .toHaveAttribute("aria-atomic", "true");
    expect(document.getElementById("team-region-error")).toHaveTextContent(
      "B: Select a valid region.",
    );

    expect(screen.getByText("Enter your display name.")).toHaveAttribute(
      "id",
      "display-name-description",
    );
    expect(screen.getByText("Names are visible to your team.")).toHaveAttribute(
      "id",
      "name-help",
    );
    expect(screen.getByText("Choose your team's region.")).toHaveAttribute(
      "id",
      "team-region-description",
    );
    expect(screen.getByText("You can change this later.")).toHaveAttribute(
      "id",
      "region-help",
    );
    expect(screen.queryByText("A: Name is required.")).not.toBeInTheDocument();
    expect(screen.queryByText("A: Choose a region.")).not.toBeInTheDocument();
  });

  it("keeps built-in fields invalid without creating an error message or dangling error ID", () => {
    render(
      <>
        <TextField
          aria-describedby="name-help"
          description="Enter your display name."
          id="display-name"
          invalid
          label="Display name"
        />
        <span id="name-help">Names are visible to your team.</span>
        <Select
          aria-describedby="region-help"
          error=""
          id="team-region"
          invalid
          label="Team region"
        >
          <option value="west">West</option>
        </Select>
        <span id="region-help">You can change this later.</span>
      </>,
    );

    const textField = screen.getByRole("textbox", { name: "Display name" });
    const select = screen.getByRole("combobox", { name: "Team region" });

    expect(textField).toHaveAttribute("aria-invalid", "true");
    expect(textField).toHaveAttribute(
      "aria-describedby",
      "name-help display-name-description",
    );
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAttribute("aria-describedby", "region-help");

    expect(document.getElementById("display-name-error")).not.toBeInTheDocument();
    expect(document.getElementById("team-region-error")).not.toBeInTheDocument();
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(0);
    expect(screen.getByText("Enter your display name.")).toHaveAttribute(
      "id",
      "display-name-description",
    );
    expect(screen.getByText("Names are visible to your team.")).toHaveAttribute(
      "id",
      "name-help",
    );
    expect(screen.getByText("You can change this later.")).toHaveAttribute(
      "id",
      "region-help",
    );
  });

  it("keeps DateField, FileField, RangeField, and Textarea help connected when errors change", () => {
    const renderFields = (errorVersion: "A" | "B") => (
      <>
        <DateField
          aria-describedby="start-date-help"
          description="Choose the first day of the project."
          error={`${errorVersion}: Enter a valid start date.`}
          id="start-date"
          label="Start date"
        />
        <span id="start-date-help">The project begins on this date.</span>

        <FileField
          aria-describedby="attachments-help"
          description="Add relevant project files."
          error={`${errorVersion}: Select a supported file.`}
          id="project-files"
          label="Project files"
        />
        <span id="attachments-help">PDF files are preferred.</span>

        <RangeField
          aria-describedby="volume-help"
          description="Set the expected weekly volume."
          error={`${errorVersion}: Choose a valid weekly volume.`}
          id="weekly-volume"
          label="Weekly volume"
        />
        <span id="volume-help">You can update this estimate later.</span>

        <Textarea
          aria-describedby="project-notes-help"
          description="Include any details the team should know."
          error={`${errorVersion}: Add a project summary.`}
          id="project-notes"
          label="Project notes"
        />
        <span id="project-notes-help">Keep the summary brief.</span>
      </>
    );

    const { rerender } = render(renderFields("A"));
    rerender(renderFields("B"));

    const fields = [
      {
        control: screen.getByLabelText("Start date"),
        describedBy: "start-date-help start-date-description start-date-error",
        errorId: "start-date-error",
        error: "B: Enter a valid start date.",
        oldError: "A: Enter a valid start date.",
      },
      {
        control: screen.getByLabelText("Project files"),
        describedBy: "attachments-help project-files-description project-files-error",
        errorId: "project-files-error",
        error: "B: Select a supported file.",
        oldError: "A: Select a supported file.",
      },
      {
        control: screen.getByLabelText("Weekly volume"),
        describedBy: "volume-help weekly-volume-description weekly-volume-error",
        errorId: "weekly-volume-error",
        error: "B: Choose a valid weekly volume.",
        oldError: "A: Choose a valid weekly volume.",
      },
      {
        control: screen.getByLabelText("Project notes"),
        describedBy: "project-notes-help project-notes-description project-notes-error",
        errorId: "project-notes-error",
        error: "B: Add a project summary.",
        oldError: "A: Add a project summary.",
      },
    ];

    for (const field of fields) {
      expect(field.control).toHaveAttribute("aria-invalid", "true");
      expect(field.control).toHaveAttribute("aria-describedby", field.describedBy);
      expect(document.getElementById(field.errorId)).toHaveAttribute("aria-live", "polite");
      expect(document.getElementById(field.errorId)).toHaveAttribute("aria-atomic", "true");
      expect(document.getElementById(field.errorId)).toHaveTextContent(field.error);
      expect(screen.queryByText(field.oldError)).not.toBeInTheDocument();
    }
  });

  it("removes built-in field errors when validation clears while preserving help connections", () => {
    const renderFields = (showErrors: boolean) => (
      <>
        <TextField
          aria-describedby="name-help"
          description="Enter your display name."
          error={showErrors ? "A display name is required." : undefined}
          id="display-name"
          label="Display name"
        />
        <span id="name-help">Names are visible to your team.</span>

        <DateField
          aria-describedby="start-date-help"
          description="Choose the first day of the project."
          error={showErrors ? "Enter a valid start date." : undefined}
          id="start-date"
          label="Start date"
        />
        <span id="start-date-help">The project begins on this date.</span>

        <FileField
          aria-describedby="attachments-help"
          description="Add relevant project files."
          error={showErrors ? "Select a supported file." : undefined}
          id="project-files"
          label="Project files"
        />
        <span id="attachments-help">PDF files are preferred.</span>

        <RangeField
          aria-describedby="volume-help"
          description="Set the expected weekly volume."
          error={showErrors ? "Choose a valid weekly volume." : undefined}
          id="weekly-volume"
          label="Weekly volume"
        />
        <span id="volume-help">You can update this estimate later.</span>

        <Select
          aria-describedby="region-help"
          description="Choose your team's region."
          error={showErrors ? "Choose a region." : undefined}
          id="team-region"
          label="Team region"
        >
          <option value="west">West</option>
        </Select>
        <span id="region-help">You can change this later.</span>

        <Textarea
          aria-describedby="project-notes-help"
          description="Include any details the team should know."
          error={showErrors ? "Add a project summary." : undefined}
          id="project-notes"
          label="Project notes"
        />
        <span id="project-notes-help">Keep the summary brief.</span>
      </>
    );

    const fields = [
      {
        label: "Display name",
        describedBy: "name-help display-name-description",
        error: "A display name is required.",
        errorId: "display-name-error",
        description: "Enter your display name.",
        descriptionId: "display-name-description",
        externalHelp: "Names are visible to your team.",
        externalHelpId: "name-help",
      },
      {
        label: "Start date",
        describedBy: "start-date-help start-date-description",
        error: "Enter a valid start date.",
        errorId: "start-date-error",
        description: "Choose the first day of the project.",
        descriptionId: "start-date-description",
        externalHelp: "The project begins on this date.",
        externalHelpId: "start-date-help",
      },
      {
        label: "Project files",
        describedBy: "attachments-help project-files-description",
        error: "Select a supported file.",
        errorId: "project-files-error",
        description: "Add relevant project files.",
        descriptionId: "project-files-description",
        externalHelp: "PDF files are preferred.",
        externalHelpId: "attachments-help",
      },
      {
        label: "Weekly volume",
        describedBy: "volume-help weekly-volume-description",
        error: "Choose a valid weekly volume.",
        errorId: "weekly-volume-error",
        description: "Set the expected weekly volume.",
        descriptionId: "weekly-volume-description",
        externalHelp: "You can update this estimate later.",
        externalHelpId: "volume-help",
      },
      {
        label: "Team region",
        describedBy: "region-help team-region-description",
        error: "Choose a region.",
        errorId: "team-region-error",
        description: "Choose your team's region.",
        descriptionId: "team-region-description",
        externalHelp: "You can change this later.",
        externalHelpId: "region-help",
      },
      {
        label: "Project notes",
        describedBy: "project-notes-help project-notes-description",
        error: "Add a project summary.",
        errorId: "project-notes-error",
        description: "Include any details the team should know.",
        descriptionId: "project-notes-description",
        externalHelp: "Keep the summary brief.",
        externalHelpId: "project-notes-help",
      },
    ];

    const { rerender } = render(renderFields(true));

    for (const field of fields) {
      const control = screen.getByLabelText(field.label);
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(control).toHaveAttribute(
        "aria-describedby",
        `${field.externalHelpId} ${field.descriptionId} ${field.errorId}`,
      );
      expect(document.getElementById(field.errorId)).toHaveAttribute("aria-live", "polite");
      expect(document.getElementById(field.errorId)).toHaveAttribute("aria-atomic", "true");
      expect(document.getElementById(field.errorId)).toHaveTextContent(field.error);
    }

    rerender(renderFields(false));

    for (const field of fields) {
      const control = screen.getByLabelText(field.label);
      expect(control).not.toHaveAttribute("aria-invalid");
      expect(control).toHaveAttribute("aria-describedby", field.describedBy);
      expect(screen.getByText(field.externalHelp)).toHaveAttribute("id", field.externalHelpId);
      expect(screen.getByText(field.description)).toHaveAttribute("id", field.descriptionId);
      expect(document.getElementById(field.errorId)).not.toBeInTheDocument();
      expect(screen.queryByText(field.error)).not.toBeInTheDocument();
    }
  });

  it("associates checkbox and switch labels, descriptions, errors, and external descriptions", () => {
    render(
      <>
        <Checkbox
          aria-describedby="external-note"
          description="Optional details"
          error="Consent is required"
          id="terms"
          label="Accept terms"
          required
        />
        <Switch disabled label="Enable alerts" />
        <Switch label="Daily digest" required />
      </>,
    );
    const checkbox = screen.getByRole("checkbox", { name: /Accept terms/ });
    expect(checkbox).toHaveAttribute("aria-describedby", "external-note terms-description terms-error");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toBeRequired();
    expect(screen.getByText("Optional details")).toHaveAttribute("id", "terms-description");
    expect(screen.getByText("Consent is required")).toHaveAttribute("id", "terms-error");
    expect(screen.getByRole("switch", { name: "Enable alerts" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: /Daily digest/ })).toBeRequired();
    expect(screen.getByText("Daily digest").closest("label")).not.toHaveAttribute("data-disabled");
  });

  it("keeps checkbox and switch help connected when validation errors change", () => {
    const renderControls = (errorVersion: "A" | "B") => (
      <>
        <Checkbox
          aria-describedby="terms-help"
          description="Review the terms before continuing."
          error={`${errorVersion}: Consent is required.`}
          id="terms"
          label="Accept terms"
        />
        <span id="terms-help">The agreement applies to all workspace members.</span>
        <Switch
          aria-describedby="alerts-help"
          description="Choose whether to receive account alerts."
          error={`${errorVersion}: Choose an alert preference.`}
          id="account-alerts"
          label="Account alerts"
        />
        <span id="alerts-help">You can change this setting at any time.</span>
      </>
    );

    const { rerender } = render(renderControls("A"));
    rerender(renderControls("B"));

    const fields = [
      {
        control: screen.getByRole("checkbox", { name: "Accept terms" }),
        describedBy: "terms-help terms-description terms-error",
        description: "Review the terms before continuing.",
        descriptionId: "terms-description",
        error: "B: Consent is required.",
        errorId: "terms-error",
        externalHelp: "The agreement applies to all workspace members.",
        externalHelpId: "terms-help",
        oldError: "A: Consent is required.",
      },
      {
        control: screen.getByRole("switch", { name: "Account alerts" }),
        describedBy: "alerts-help account-alerts-description account-alerts-error",
        description: "Choose whether to receive account alerts.",
        descriptionId: "account-alerts-description",
        error: "B: Choose an alert preference.",
        errorId: "account-alerts-error",
        externalHelp: "You can change this setting at any time.",
        externalHelpId: "alerts-help",
        oldError: "A: Choose an alert preference.",
      },
    ];

    for (const field of fields) {
      expect(field.control).toHaveAttribute("aria-invalid", "true");
      expect(field.control).toHaveAttribute("aria-describedby", field.describedBy);
      expect(screen.getByText(field.externalHelp)).toHaveAttribute("id", field.externalHelpId);
      expect(screen.getByText(field.description)).toHaveAttribute("id", field.descriptionId);
      expect(document.getElementById(field.errorId)).toHaveAttribute("aria-live", "polite");
      expect(document.getElementById(field.errorId)).toHaveAttribute("aria-atomic", "true");
      expect(document.getElementById(field.errorId)).toHaveTextContent(field.error);
      expect(screen.queryByText(field.oldError)).not.toBeInTheDocument();
    }
  });

  it("keeps checkbox and switch help connected when validation errors clear", () => {
    const renderControls = (showError: boolean) => (
      <>
        <Checkbox
          aria-describedby="terms-help"
          description="Review the terms before continuing."
          error={showError ? "Consent is required." : undefined}
          id="terms"
          label="Accept terms"
        />
        <span id="terms-help">The agreement applies to all workspace members.</span>
        <Switch
          aria-describedby="alerts-help"
          description="Choose whether to receive account alerts."
          error={showError ? "Choose an alert preference." : undefined}
          id="account-alerts"
          label="Account alerts"
        />
        <span id="alerts-help">You can change this setting at any time.</span>
      </>
    );

    const fields = [
      {
        role: "checkbox" as const,
        label: "Accept terms",
        describedBy: "terms-help terms-description",
        description: "Review the terms before continuing.",
        descriptionId: "terms-description",
        error: "Consent is required.",
        errorId: "terms-error",
        externalHelp: "The agreement applies to all workspace members.",
        externalHelpId: "terms-help",
      },
      {
        role: "switch" as const,
        label: "Account alerts",
        describedBy: "alerts-help account-alerts-description",
        description: "Choose whether to receive account alerts.",
        descriptionId: "account-alerts-description",
        error: "Choose an alert preference.",
        errorId: "account-alerts-error",
        externalHelp: "You can change this setting at any time.",
        externalHelpId: "alerts-help",
      },
    ];

    const { rerender } = render(renderControls(true));

    for (const field of fields) {
      const control = screen.getByRole(field.role, { name: field.label });
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(control).toHaveAttribute(
        "aria-describedby",
        `${field.externalHelpId} ${field.descriptionId} ${field.errorId}`,
      );
      expect(document.getElementById(field.errorId)).toHaveTextContent(field.error);
    }

    rerender(renderControls(false));

    for (const field of fields) {
      const control = screen.getByRole(field.role, { name: field.label });
      expect(control).not.toHaveAttribute("aria-invalid");
      expect(control).toHaveAttribute("aria-describedby", field.describedBy);
      expect(screen.getByText(field.externalHelp)).toHaveAttribute("id", field.externalHelpId);
      expect(screen.getByText(field.description)).toHaveAttribute("id", field.descriptionId);
      expect(document.getElementById(field.errorId)).not.toBeInTheDocument();
      expect(screen.queryByText(field.error)).not.toBeInTheDocument();
    }
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(0);
  });

  it("renders text, date, file, select, and textarea fields with native constraints", () => {
    render(
      <>
        <TextField label="Email" type="email" required placeholder="you@example.com" />
        <DateField description="Choose a date" label="Start date" type="month" />
        <FileField accept="image/*" disabled label="Profile image" />
        <Select label="Region" required>
          <option value="west">West</option>
        </Select>
        <Textarea label="Notes" rows={6} value="Initial note" readOnly />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("type", "email");
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
    expect(screen.getByLabelText("Start date")).toHaveAttribute("type", "month");
    expect(screen.getByLabelText("Start date")).toHaveAttribute("aria-describedby");
    expect(screen.getByLabelText("Profile image")).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Region" })).toBeRequired();
    expect(screen.getByLabelText("Notes")).toHaveAttribute("rows", "6");
    expect(screen.getByLabelText("Notes")).toHaveValue("Initial note");
  });

  it("keeps TextField affixes accessible without changing its native form control", () => {
    render(
      <TextField
        description="Enter a monthly amount."
        error="Use a valid amount."
        label="Monthly budget"
        name="budget"
        prefix="$"
        suffix={<button type="button">Clear</button>}
        type="number"
        value={125}
        readOnly
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Monthly budget" });
    expect(input).toHaveValue(125);
    expect(input).toHaveAttribute("name", "budget");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", expect.stringContaining("description"));
    expect(input).toHaveAttribute("aria-describedby", expect.stringContaining("error"));
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeEnabled();
  });

  it("supports controlled and uncontrolled radio selections with disabled choices", () => {
    const onChange = vi.fn();
    const options = [
      { value: "small", label: "Small" },
      { value: "large", label: "Large", disabled: true },
    ];
    const { rerender } = render(
      <RadioGroup defaultValue="small" description="Choose a size" label="Size" name="size" options={options} />,
    );
    expect(screen.getByRole("radio", { name: "Small" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Large" })).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "Small" }));
    expect(screen.getByText("Choose a size")).toBeInTheDocument();

    rerender(
      <RadioGroup label="Size" name="size" onChange={onChange} options={options} value="large" />,
    );
    expect(screen.getByRole("radio", { name: "Large" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Small" }));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("normalizes range values, displays custom text, and invokes callbacks", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <RangeField
        defaultValue={8}
        description="Adjust the budget"
        formatValue={(value) => `$${value}`}
        getAriaValueText={(value) => `${value} dollars`}
        label="Budget"
        max={10}
        min={0}
        onChange={onChange}
        onValueChange={onValueChange}
        step={2}
        style={{ accentColor: "red" }}
      />,
    );
    const range = screen.getByRole("slider", { name: "Budget" });
    expect(range).toHaveValue("8");
    expect(range).toHaveAttribute("aria-valuetext", "8 dollars");
    expect(screen.getByText("$8")).toBeInTheDocument();
    expect(range.style.getPropertyValue("--range-progress")).toBe("80%");
    expect(range.style.getPropertyValue("accent-color")).toBe("red");
    fireEvent.change(range, { target: { value: "7", valueAsNumber: 7 } });
    expect(onValueChange).toHaveBeenCalledWith(8);
    expect(onChange).toHaveBeenCalledOnce();
    expect(range).toHaveValue("8");
  });

  it("supports any-step and controlled range states and rejects invalid bounds", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <RangeField label="Level" max={10} min={2} onValueChange={onValueChange} step="any" value={4.5} />,
    );
    const range = screen.getByRole("slider", { name: "Level" });
    expect(range).toHaveValue("4.5");
    expect(range).not.toHaveAttribute("aria-valuetext");
    fireEvent.change(range, { target: { value: "6.25", valueAsNumber: 6.25 } });
    expect(onValueChange).toHaveBeenCalledWith(6.25);
    rerender(<RangeField label="Fixed" max={5} min={5} value={5} />);
    expect(screen.getByRole("slider", { name: "Fixed" })).toHaveStyle({ "--range-progress": "0%" });
    expect(() => render(<RangeField label="Invalid" min={3} max={2} />)).toThrow(/finite min and max/);
    expect(() => render(<RangeField label="Invalid step" step={0} />)).toThrow(/positive finite/);
  });

  it("renders a disabled field group with combined external, description, and error references", () => {
    render(
      <FieldGroup
        aria-describedby="external"
        description="Group description"
        disabled
        error="Choose one"
        id="preferences"
        label="Preferences"
      >
        <Checkbox label="Email" />
      </FieldGroup>,
    );
    const group = screen.getByRole("group", { name: "Preferences" });
    expect(group).toBeDisabled();
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", "external preferences-description preferences-error");
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeDisabled();
    expect(screen.getByText("Group description")).toBeInTheDocument();
    expect(screen.getByText("Choose one")).toBeInTheDocument();
  });

  it("configures form layout columns, gap, and forwarded attributes", () => {
    const { rerender } = render(<FormLayout data-testid="fields"><TextField label="Name" /></FormLayout>);
    expect(screen.getByTestId("fields")).toHaveAttribute("data-columns", "1");
    expect(screen.getByTestId("fields")).toHaveAttribute("data-gap", "md");
    rerender(<FormLayout columns={2} gap="lg" data-testid="fields" />);
    expect(screen.getByTestId("fields")).toHaveAttribute("data-columns", "2");
    expect(screen.getByTestId("fields")).toHaveAttribute("data-gap", "lg");
  });

  it("renders an optional field group and a required legend", () => {
    render(
      <>
        <FieldGroup label="Optional preferences"><Checkbox label="SMS" /></FieldGroup>
        <FieldLegend label="Required choices" required />
      </>,
    );
    expect(screen.getByRole("group", { name: "Optional preferences" })).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Required choices").parentElement).toHaveTextContent("*");
  });
});

describe("avatars and toggle controls", () => {
  it("uses explicit initials or derives them and falls back when image loading fails", () => {
    const { rerender } = render(<Avatar name="  Ada Lovelace " src="/ada.png" />);
    const avatar = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(avatar.querySelector("img")).toHaveAttribute("src", "/ada.png");
    fireEvent.error(avatar.querySelector("img")!);
    expect(screen.getByText("AL")).toHaveAttribute("aria-hidden", "true");
    rerender(<Avatar initials=" XY " name="" shape="square" size="xl" />);
    expect(screen.getByRole("img", { name: "Avatar" })).toHaveTextContent("XY");
  });

  it("opens avatar overflow, dismisses it outside, and validates its display limit", () => {
    const members = [
      { id: "a", name: "Ada" },
      { id: "b", name: "Grace" },
      { id: "c", name: "Katherine" },
    ];
    const { rerender } = render(<AvatarGroup label="Team" maxVisible={1} members={members} />);
    fireEvent.click(screen.getByRole("button", { name: "Show 2 more members" }));
    expect(screen.getByRole("list", { name: "Additional team members" })).toBeVisible();
    expect(screen.getByText("Katherine")).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(document.querySelector('[aria-label="Additional team members"]')).not.toBeVisible();
    const overflowTrigger = screen.getByRole("button", { name: "Show 2 more members" });
    fireEvent.keyDown(overflowTrigger, { key: "Enter" });
    fireEvent.click(overflowTrigger);
    fireEvent.keyDown(overflowTrigger, { key: "Escape" });
    expect(document.querySelector('[aria-label="Additional team members"]')).not.toBeVisible();
    rerender(<AvatarGroup maxVisible={0} members={members.slice(0, 1)} overflowLabel={(count) => `More: ${count}`} />);
    expect(screen.getByRole("button", { name: "More: 1" })).toBeInTheDocument();
    expect(() => render(<AvatarGroup maxVisible={-1} members={members} />)).toThrow(RangeError);
  });

  it("toggles uncontrolled and controlled buttons while respecting prevented clicks", () => {
    const onPressedChange = vi.fn();
    const { rerender } = render(
      <ToggleButton defaultPressed className="favorite" onPressedChange={onPressedChange}>Favorite</ToggleButton>,
    );
    const button = screen.getByRole("button", { name: "Favorite" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).toHaveBeenCalledWith(false);
    rerender(
      <ToggleButton onClick={(event) => event.preventDefault()} onPressedChange={onPressedChange} pressed>
        Controlled
      </ToggleButton>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Controlled" }));
    expect(screen.getByRole("button", { name: "Controlled" })).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledOnce();
  });

  it("propagates group defaults, supports selection modes, and keeps controlled values controlled", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ToggleGroup
        aria-label="View"
        defaultValue="grid"
        items={[{ value: "grid", label: "Grid" }, { value: "list", label: "List", disabled: true }]}
        size="lg"
        variant="secondary"
      />,
    );
    expect(screen.getByRole("button", { name: "Grid" })).toHaveClass(/lg/);
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "List" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "false");

    rerender(
      <ToggleGroup
        aria-labelledby="toggle-label"
        items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        onValueChange={onValueChange}
        value="a"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");

    rerender(
      <ToggleGroup
        key="multiple-mode"
        aria-label="Multiple"
        defaultValue={["a"]}
        items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        selectionMode="multiple"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "false");
    rerender(
      <ToggleGroup
        key="controlled-multiple"
        aria-label="Controlled multiple"
        items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        onValueChange={onValueChange}
        selectionMode="multiple"
        value={["a"]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");

    rerender(
      <ToggleGroup
        key="non-empty-single"
        allowEmpty={false}
        aria-label="Required selection"
        defaultValue="a"
        items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");
    expect(() => render(<ToggleGroup aria-label="Invalid" items={[{ value: " ", label: "Empty" }]} />)).toThrow(/non-empty/);
    expect(() =>
      render(<ToggleGroup aria-label="Duplicates" items={[{ value: "same", label: "One" }, { value: "same", label: "Two" }]} />),
    ).toThrow(/unique/);
  });

  it("starts both selection modes empty when no default value is provided", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ToggleGroup
        aria-label="Empty single selection"
        items={[{ value: "a", label: "A" }]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith("a");
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);

    rerender(
      <ToggleGroup
        key="empty-multiple"
        aria-label="Empty multiple selection"
        items={[{ value: "a", label: "A" }]}
        onValueChange={onValueChange}
        selectionMode="multiple"
      />,
    );
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a"]);
  });

  it("allows explicit ButtonGroup props while applying inherited size, variant, and disabled state", () => {
    render(
      <ButtonGroup disabled size="lg" variant="secondary">
        <Button>Inherited</Button>
        <Button size="sm" variant="ghost">Explicit</Button>
        <span>Other child</span>
        {null}
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByRole("button", { name: "Inherited" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Explicit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Explicit" })).toHaveAttribute("data-ds-button-variant", "ghost");
  });

  it("supports accessible named icons", () => {
    render(<Icon decorative={false} label="Selected" name="check" />);
    const icon = screen.getByRole("img", { name: "Selected" });
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon).toHaveAttribute("data-icon", "check");
  });

  it("renders a named loading status for assistive technology", () => {
    render(<Spinner label="Saving garden" size="lg" />);
    expect(screen.getByRole("status", { name: "Saving garden" })).toHaveAttribute("data-ds-spinner", "");
  });
});
