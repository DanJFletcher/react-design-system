import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";
import { FieldLabel, FieldMessages, type FormFieldProps, useFormField } from "../FormControls/FormField";
import styles from "./MultiSelect.module.css";

export type MultiSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  | "id"
  | "name"
  | "type"
  | "value"
  | "defaultValue"
  | "required"
  | "disabled"
  | "aria-describedby"
  | "aria-invalid"
  | "aria-required"
  | "aria-expanded"
  | "aria-controls"
  | "aria-activedescendant"
  | "aria-autocomplete"
  | "aria-haspopup"
  | "className"
  | "style"
>;

export type MultiSelectProps = NativeInputProps &
  Omit<FormFieldProps, "id" | "label"> & {
    id?: string;
    label: FormFieldProps["label"];
    options: readonly MultiSelectOption[];
    name?: string;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[]) => void;
    filterOptions?: (
      options: readonly MultiSelectOption[],
      query: string,
    ) => readonly MultiSelectOption[];
    allowClear?: boolean;
    clearLabel?: string;
    removeLabel?: (option: MultiSelectOption) => string;
    noResultsMessage?: FormFieldProps["description"];
    loading?: boolean;
    loadingMessage?: FormFieldProps["description"];
    requiredMessage?: string;
    className?: string;
    style?: DesignSystemStyle;
  };

function validateOptions(
  options: readonly MultiSelectOption[],
  selectedValues: readonly string[],
  loading: boolean,
) {
  const values = new Set<string>();

  for (const option of options) {
    if (!option.value || !option.label.trim()) {
      throw new Error("MultiSelect options require non-empty values and labels.");
    }
    if (values.has(option.value)) {
      throw new Error(`MultiSelect option values must be unique: "${option.value}".`);
    }
    values.add(option.value);
  }

  const selected = new Set<string>();
  for (const value of selectedValues) {
    if (selected.has(value)) {
      throw new Error(`MultiSelect values must be unique: "${value}".`);
    }
    selected.add(value);
    if (!loading && !values.has(value)) {
      throw new Error(`MultiSelect value must match an option: "${value}".`);
    }
  }
}

function findEnabledIndex(
  options: readonly MultiSelectOption[],
  currentIndex: number,
  direction: 1 | -1,
) {
  if (options.length === 0) return -1;
  const startIndex = currentIndex < 0
    ? (direction === 1 ? -1 : options.length)
    : currentIndex;

  for (let offset = 1; offset <= options.length; offset += 1) {
    const nextIndex = (startIndex + direction * offset + options.length) % options.length;
    if (!options[nextIndex].disabled) return nextIndex;
  }

  return -1;
}

export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(function MultiSelect(
  {
    id,
    label,
    options,
    name,
    value,
    defaultValue = [],
    onValueChange,
    filterOptions,
    allowClear = true,
    clearLabel = "Clear selections",
    removeLabel = (option) => `Remove ${option.label}`,
    noResultsMessage = "No results found.",
    loading = false,
    loadingMessage = "Loading options…",
    requiredMessage = "Please select at least one option.",
    required = false,
    disabled = false,
    description,
    error,
    invalid = false,
    className,
    style,
    autoComplete = "off",
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    "aria-describedby": externalDescribedBy,
    ...inputProps
  },
  forwardedRef,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const listboxId = `${field.id}-listbox`;
  const labelId = `${field.id}-label`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suppressOpenOnFocusRef = useRef(false);
  const [uncontrolledValues, setUncontrolledValues] = useState<string[]>(() => [...defaultValue]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const controlled = value !== undefined;
  const selectedValues = value !== undefined ? [...value] : uncontrolledValues;
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  validateOptions(options, selectedValues, loading);

  const filteredOptions = useMemo(() => {
    if (filterOptions) return filterOptions(options, query);
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery));
  }, [filterOptions, options, query]);
  const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
  const popupOpen = isOpen && !disabled;
  const showNoResults = popupOpen && !loading && filteredOptions.length === 0;
  const selectedOptions = selectedValues.flatMap((selectedValue) => {
    const option = options.find((candidate) => candidate.value === selectedValue);
    return option ? [option] : [];
  });

  useEffect(() => {
    inputRef.current?.setCustomValidity(
      required && selectedValues.length === 0 ? requiredMessage : "",
    );
  }, [required, requiredMessage, selectedValues.length]);

  useEffect(() => {
    if (!popupOpen) return undefined;
    const closeOnOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [popupOpen]);

  function updateValues(nextValues: string[]) {
    if (!controlled) setUncontrolledValues(nextValues);
    onValueChange?.(nextValues);
  }

  function toggleOption(option: MultiSelectOption) {
    if (option.disabled || disabled) return;
    if (selectedSet.has(option.value)) {
      updateValues(selectedValues.filter((selectedValue) => selectedValue !== option.value));
    } else {
      updateValues([...selectedValues, option.value]);
    }
    setQuery("");
  }

  function removeValue(valueToRemove: string) {
    updateValues(selectedValues.filter((selectedValue) => selectedValue !== valueToRemove));
    inputRef.current?.focus();
  }

  function clearSelection() {
    updateValues([]);
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
    if (inputRef.current !== document.activeElement) suppressOpenOnFocusRef.current = true;
    inputRef.current?.focus();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.currentTarget.value;
    setQuery(nextQuery);
    const matches = filterOptions
      ? filterOptions(options, nextQuery)
      : options.filter((option) => option.label.toLocaleLowerCase().includes(nextQuery.trim().toLocaleLowerCase()));
    setActiveIndex(findEnabledIndex(matches, -1, 1));
    setIsOpen(true);
    onChange?.(event);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    if (suppressOpenOnFocusRef.current) {
      suppressOpenOnFocusRef.current = false;
    } else if (!disabled) {
      setActiveIndex(findEnabledIndex(filteredOptions, -1, 1));
      setIsOpen(true);
    }
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
    onBlur?.(event);
  }

  function handleRootBlur(event: FocusEvent<HTMLDivElement>) {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        findEnabledIndex(filteredOptions, current, event.key === "ArrowDown" ? 1 : -1),
      );
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      if (!popupOpen || filteredOptions.length === 0) return;
      event.preventDefault();
      const direction = event.key === "Home" ? 1 : -1;
      const index = direction === 1 ? -1 : filteredOptions.length;
      setActiveIndex(findEnabledIndex(filteredOptions, index, direction));
      return;
    }

    if (event.key === "Enter" && popupOpen && activeOption) {
      event.preventDefault();
      toggleOption(activeOption);
      return;
    }

    if (event.key === "Escape" && popupOpen) {
      event.preventDefault();
      setQuery("");
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "Backspace" && query === "" && selectedValues.length > 0) {
      const lastRemovable = [...selectedOptions].reverse().find((option) => !option.disabled);
      if (lastRemovable) {
        event.preventDefault();
        removeValue(lastRemovable.value);
      }
      return;
    }

    if (event.key === "Tab") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleOptionPointerDown(event: PointerEvent<HTMLLIElement>) {
    event.preventDefault();
  }

  return (
    <div className={styles.field}>
      <FieldLabel disabled={disabled} id={field.id} labelId={labelId} label={label} required={required} />
      <div
        className={styles.root}
        data-disabled={disabled || undefined}
        data-invalid={field.invalid || undefined}
        onBlur={handleRootBlur}
        ref={rootRef}
        style={style as CSSProperties | undefined}
      >
        <div className={styles.control}>
          {selectedOptions.map((option) => (
            <span className={styles.tag} key={option.value}>
              <span className={styles.tagLabel}>{option.label}</span>
              <button
                aria-label={removeLabel(option)}
                className={styles.removeButton}
                disabled={disabled}
                onClick={() => removeValue(option.value)}
                onPointerDown={(event) => event.preventDefault()}
                type="button"
              >
                <Icon name="close" size="xs" />
              </button>
            </span>
          ))}
          <input
            {...inputProps}
            ref={(node) => {
              inputRef.current = node;
              if (typeof forwardedRef === "function") forwardedRef(node);
              else if (forwardedRef) forwardedRef.current = node;
            }}
            id={field.id}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={popupOpen}
            aria-controls={listboxId}
            aria-activedescendant={
              popupOpen && activeOption ? `${listboxId}-option-${activeIndex}` : undefined
            }
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
            aria-required={required || undefined}
            autoComplete={autoComplete}
            className={[styles.input, className].filter(Boolean).join(" ")}
            disabled={disabled}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={query === "" ? inputProps.placeholder : undefined}
            value={query}
          />
          {allowClear && selectedValues.length > 0 && !disabled && (
            <button
              aria-label={clearLabel}
              className={styles.clearButton}
              onClick={clearSelection}
              onPointerDown={(event) => event.preventDefault()}
              type="button"
            >
              <Icon name="close" size="sm" />
            </button>
          )}
          <Icon className={styles.chevronIcon} name="chevron-down" size="sm" />
        </div>
        <ul
          aria-labelledby={labelId}
          aria-multiselectable="true"
          className={styles.listbox}
          hidden={!popupOpen || loading || filteredOptions.length === 0}
          id={listboxId}
          role="listbox"
        >
          {filteredOptions.map((option, index) => (
            <li
              aria-disabled={option.disabled || undefined}
              aria-selected={selectedSet.has(option.value)}
              className={styles.option}
              data-active={activeIndex === index || undefined}
              data-disabled={option.disabled || undefined}
              id={`${listboxId}-option-${index}`}
              key={option.value}
              onClick={() => toggleOption(option)}
              onPointerDown={handleOptionPointerDown}
              onPointerEnter={() => {
                if (!option.disabled) setActiveIndex(index);
              }}
              role="option"
            >
              <span>{option.label}</span>
              {selectedSet.has(option.value) && <Icon className={styles.selectedIcon} name="check" size="sm" />}
            </li>
          ))}
        </ul>
        {showNoResults && <div className={styles.status} role="status">{noResultsMessage}</div>}
        {popupOpen && loading && (
          <div className={[styles.status, styles.loadingStatus].join(" ")} role="status">
            <Spinner decorative size="sm" />
            <div>{loadingMessage}</div>
          </div>
        )}
        {name && selectedValues.map((selectedValue) => (
          <input
            disabled={disabled}
            form={inputProps.form}
            key={selectedValue}
            name={name}
            type="hidden"
            value={selectedValue}
          />
        ))}
      </div>
      <FieldMessages
        description={description}
        descriptionId={field.descriptionId}
        error={error}
        errorId={field.errorId}
      />
    </div>
  );
});

MultiSelect.displayName = "MultiSelect";
