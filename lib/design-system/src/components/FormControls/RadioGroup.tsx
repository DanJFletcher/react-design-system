import { forwardRef, type ChangeEventHandler, type ComponentPropsWithRef, type ReactNode } from "react";
import { FieldLegend, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import styles from "./FormControls.module.css";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export type RadioGroupProps = Omit<
  ComponentPropsWithRef<"fieldset">,
  "id" | "children" | "disabled" | "onChange" | "value" | "defaultValue" | "aria-describedby" | "aria-invalid"
> & FormFieldProps & {
  name: string;
  options: readonly RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  {
    id,
    label,
    description,
    error,
    invalid = false,
    required = false,
    disabled = false,
    name,
    options,
    value,
    defaultValue,
    onChange,
    className,
    "aria-describedby": externalDescribedBy,
    ...fieldsetProps
  },
  ref,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const groupClassName = [styles.radioGroup, className].filter(Boolean).join(" ");

  return (
    <fieldset
      {...fieldsetProps}
      ref={ref}
      id={field.id}
      disabled={disabled}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      className={groupClassName}
    >
      <FieldLegend label={label} required={required} />
      <div className={styles.radioChoices}>
        {options.map((option, index) => {
          const optionId = `${field.id}-option-${index}`;
          return (
            <label className={styles.choiceLabel} htmlFor={optionId} key={option.value}>
              <input
                id={optionId}
                className={styles.choiceControl}
                type="radio"
                name={name}
                value={option.value}
                checked={value === undefined ? undefined : value === option.value}
                defaultChecked={value === undefined ? defaultValue === option.value : undefined}
                required={required}
                disabled={option.disabled}
                onChange={onChange}
              />
              <span className={styles.choiceText}>{option.label}</span>
            </label>
          );
        })}
      </div>
      <FieldMessages
        description={description}
        descriptionId={field.descriptionId}
        error={error}
        errorId={field.errorId}
      />
    </fieldset>
  );
});

RadioGroup.displayName = "RadioGroup";
