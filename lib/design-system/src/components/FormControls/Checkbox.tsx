import { forwardRef, type ComponentPropsWithRef } from "react";
import { FieldMessages, type FormFieldProps, useFormField } from "./FormField";
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
      <label className={styles.choiceLabel} htmlFor={field.id}>
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

Checkbox.displayName = "Checkbox";
