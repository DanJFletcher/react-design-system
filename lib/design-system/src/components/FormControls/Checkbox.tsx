import { forwardRef, type ComponentPropsWithRef } from "react";
import { FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import { Label } from "../Label/Label";
import styles from "./FormControls.module.css";

export type CheckboxProps = Omit<
  ComponentPropsWithRef<"input">,
  "id" | "type" | "required" | "disabled" | "aria-describedby" | "aria-invalid"
> & FormFieldProps;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    id,
    label,
    description,
    error,
    invalid = false,
    required = false,
    disabled = false,
    className,
    "aria-describedby": externalDescribedBy,
    ...inputProps
  },
  ref,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const controlClassName = [styles.choiceControl, className].filter(Boolean).join(" ");

  return (
    <div className={styles.choiceField}>
      <Label disabled={disabled} htmlFor={field.id} required={required} variant="choice">
        <input
          {...inputProps}
          ref={ref}
          id={field.id}
          type="checkbox"
          required={required}
          disabled={disabled}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          className={controlClassName}
        />
        <span className={styles.choiceText}>
          {label}
        </span>
      </Label>
      <FieldMessages
        description={description}
        descriptionId={field.descriptionId}
        error={error}
        errorId={field.errorId}
      />
    </div>
  );
});

Checkbox.displayName = "Checkbox";
