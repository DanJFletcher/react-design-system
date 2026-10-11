import { forwardRef, type ComponentPropsWithRef } from "react";
import { FieldLabel, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import styles from "./FormControls.module.css";

export type DateFieldType = "date" | "datetime-local" | "month" | "time" | "week";

export type DateFieldProps = Omit<
  ComponentPropsWithRef<"input">,
  "id" | "type" | "required" | "disabled" | "aria-describedby" | "aria-invalid" | "children"
> & FormFieldProps & {
  type?: DateFieldType;
};

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField(
  {
    id,
    label,
    description,
    error,
    invalid = false,
    required = false,
    disabled = false,
    className,
    type = "date",
    "aria-describedby": externalDescribedBy,
    ...inputProps
  },
  ref,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const controlClassName = [styles.control, className].filter(Boolean).join(" ");

  return (
    <div className={styles.field}>
      <FieldLabel id={field.id} label={label} required={required} />
      <input
        {...inputProps}
        ref={ref}
        id={field.id}
        type={type}
        required={required}
        disabled={disabled}
        aria-describedby={field.describedBy}
        aria-invalid={field.invalid || undefined}
        className={controlClassName}
      />
      <FieldMessages
        description={description}
        descriptionId={field.descriptionId}
        error={error}
        errorId={field.errorId}
      />
    </div>
  );
});

DateField.displayName = "DateField";
