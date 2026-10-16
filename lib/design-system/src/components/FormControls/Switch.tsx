import { forwardRef, type ComponentPropsWithRef } from "react";
import { FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import { Label } from "../Label/Label";
import styles from "./FormControls.module.css";

export type SwitchProps = Omit<
  ComponentPropsWithRef<"input">,
  "id" | "type" | "role" | "required" | "disabled" | "aria-describedby" | "aria-invalid" | "children"
> & FormFieldProps;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
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
  const controlClassName = [styles.choiceControl, styles.switch, className].filter(Boolean).join(" ");

  return (
    <div className={styles.choiceField}>
      <Label disabled={disabled} htmlFor={field.id} required={required} variant="choice">
        <input
          {...inputProps}
          ref={ref}
          id={field.id}
          type="checkbox"
          role="switch"
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

Switch.displayName = "Switch";
