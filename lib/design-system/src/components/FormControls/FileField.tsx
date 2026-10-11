import { forwardRef, type ComponentPropsWithRef } from "react";
import { FieldLabel, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import styles from "./FormControls.module.css";

export type FileFieldProps = Omit<
  ComponentPropsWithRef<"input">,
  | "id"
  | "type"
  | "value"
  | "defaultValue"
  | "required"
  | "disabled"
  | "aria-describedby"
  | "aria-invalid"
  | "children"
> & FormFieldProps;

export const FileField = forwardRef<HTMLInputElement, FileFieldProps>(function FileField(
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
  const controlClassName = [styles.control, styles.fileInput, className].filter(Boolean).join(" ");

  return (
    <div className={styles.field}>
      <FieldLabel id={field.id} label={label} required={required} />
      <input
        {...inputProps}
        ref={ref}
        id={field.id}
        type="file"
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

FileField.displayName = "FileField";
