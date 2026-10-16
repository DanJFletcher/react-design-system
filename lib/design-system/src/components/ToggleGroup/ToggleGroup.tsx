import {
  forwardRef,
  useState,
  type ReactNode,
} from "react";
import { ButtonGroup, type ButtonGroupProps } from "../ButtonGroup/ButtonGroup";
import { ToggleButton } from "../ToggleButton/ToggleButton";

export type ToggleGroupSelectionMode = "single" | "multiple";

export type ToggleGroupItem = {
  value: string;
  label: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
};

type ToggleGroupNameProps =
  | {
      "aria-label": string;
      "aria-labelledby"?: never;
    }
  | {
      "aria-label"?: never;
      "aria-labelledby": string;
    };

type ToggleGroupBaseProps = Omit<
  ButtonGroupProps,
  "aria-label" | "aria-labelledby" | "children" | "disabled"
> & {
  items: readonly ToggleGroupItem[];
  disabled?: boolean;
};

export type ToggleGroupSingleProps = ToggleGroupBaseProps & ToggleGroupNameProps & {
  selectionMode?: "single";
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  allowEmpty?: boolean;
};

export type ToggleGroupMultipleProps = ToggleGroupBaseProps & ToggleGroupNameProps & {
  selectionMode: "multiple";
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: readonly string[]) => void;
  allowEmpty?: never;
};

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

type SelectionValue = string | null | readonly string[];

type ToggleGroupInternalProps = ToggleGroupBaseProps & ToggleGroupNameProps & {
  selectionMode?: ToggleGroupSelectionMode;
  value?: SelectionValue;
  defaultValue?: SelectionValue;
  onValueChange?: ((value: string | null) => void) | ((value: readonly string[]) => void);
  allowEmpty?: boolean;
};

function validateItems(items: readonly ToggleGroupItem[]) {
  const values = new Set<string>();
  for (const item of items) {
    if (typeof item.value !== "string" || item.value.trim() === "") {
      throw new Error("ToggleGroup item values must be non-empty strings.");
    }
    if (values.has(item.value)) {
      throw new Error(`ToggleGroup item values must be unique. Duplicate value: "${item.value}".`);
    }
    values.add(item.value);
  }
}

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(props, ref) {
    const {
      items,
      selectionMode = "single",
      value,
      defaultValue,
      onValueChange,
      allowEmpty = true,
      disabled = false,
      ...groupProps
    } = props as ToggleGroupInternalProps;

    validateItems(items);

    const [uncontrolledValue, setUncontrolledValue] = useState<SelectionValue>(() =>
      selectionMode === "multiple"
        ? (defaultValue as readonly string[] | undefined) ?? []
        : (defaultValue as string | null | undefined) ?? null,
    );
    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : uncontrolledValue;

    function isSelected(itemValue: string) {
      if (selectionMode === "multiple") {
        return Array.isArray(selectedValue) && selectedValue.includes(itemValue);
      }
      return selectedValue === itemValue;
    }

    function toggleValue(itemValue: string) {
      if (selectionMode === "multiple") {
        const selected = selectedValue as readonly string[];
        const nextValue = selected.includes(itemValue)
          ? selected.filter((selectedItem) => selectedItem !== itemValue)
          : [...selected, itemValue];

        if (!isControlled) setUncontrolledValue(nextValue);
        (onValueChange as ToggleGroupMultipleProps["onValueChange"])?.(nextValue);
        return;
      }

      const selected = typeof selectedValue === "string" ? selectedValue : null;
      if (selected === itemValue && !allowEmpty) return;

      const nextValue = selected === itemValue ? null : itemValue;
      if (!isControlled) setUncontrolledValue(nextValue);
      (onValueChange as ToggleGroupSingleProps["onValueChange"])?.(nextValue);
    }

    return (
      <ButtonGroup
        {...groupProps}
        data-selection-mode={selectionMode}
        disabled={disabled}
        ref={ref}
      >
        {items.map((item) => (
          <ToggleButton
            aria-label={item.ariaLabel}
            disabled={disabled || item.disabled}
            key={item.value}
            onPressedChange={() => toggleValue(item.value)}
            pressed={isSelected(item.value)}
          >
            {item.label}
          </ToggleButton>
        ))}
      </ButtonGroup>
    );
  },
);

ToggleGroup.displayName = "ToggleGroup";
