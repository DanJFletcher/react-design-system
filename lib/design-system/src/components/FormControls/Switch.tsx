import { forwardRef, type ComponentPropsWithRef } from "react";
import { FieldMessages, type FormFieldProps, useFormField } from "./FormField";
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
      <label className={styles.choiceLabel} data-disabled={disabled || undefined} htmlFor={field.id}>
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
          {required && <span className={styles.requiredMark} aria-hidden="true"> *</span>}
        </span>
      </label>
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
