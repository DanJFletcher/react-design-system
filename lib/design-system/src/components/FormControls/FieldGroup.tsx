import { forwardRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { FieldLegend, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import styles from "./FormControls.module.css";

export type FieldGroupProps = Omit<
  ComponentPropsWithRef<"fieldset">,
  "id" | "children" | "disabled" | "aria-describedby" | "aria-invalid"
> & Omit<FormFieldProps, "required"> & {
  children: ReactNode;
};

export const FieldGroup = forwardRef<HTMLFieldSetElement, FieldGroupProps>(function FieldGroup(
  {
    id,
    label,
    description,
    error,
    invalid = false,
    disabled = false,
    className,
    children,
    "aria-describedby": externalDescribedBy,
    ...fieldsetProps
  },
  ref,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const groupClassName = [styles.fieldGroup, className].filter(Boolean).join(" ");

  return (
    <fieldset
      {...fieldsetProps}
      ref={ref}
      id={field.id}
      disabled={disabled}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      className={groupClassName}
      data-ds-field-group=""
    >
      <FieldLegend label={label} />
      {children}
      <FieldMessages
        description={description}
        descriptionId={field.descriptionId}
        error={error}
        errorId={field.errorId}
      />
    </fieldset>
  );
});

FieldGroup.displayName = "FieldGroup";
