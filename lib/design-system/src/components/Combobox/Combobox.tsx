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
import styles from "./Combobox.module.css";

export type ComboboxOption = {
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
  | "aria-expanded"
  | "aria-controls"
  | "aria-activedescendant"
  | "aria-autocomplete"
  | "aria-haspopup"
  | "className"
  | "style"
>;

export type ComboboxProps = NativeInputProps &
  Omit<FormFieldProps, "id" | "label"> & {
    id?: string;
    label: FormFieldProps["label"];
    options: readonly ComboboxOption[];
    name?: string;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    filterOptions?: (
      options: readonly ComboboxOption[],
      query: string,
    ) => readonly ComboboxOption[];
    allowClear?: boolean;
    clearLabel?: string;
    noResultsMessage?: FormFieldProps["description"];
    loading?: boolean;
    loadingMessage?: FormFieldProps["description"];
    requiredMessage?: string;
    className?: string;
    style?: DesignSystemStyle;
  };

function validateOptions(
  options: readonly ComboboxOption[],
  selectedValue: string | null,
  loading: boolean,
) {
  const values = new Set<string>();

  for (const option of options) {
    if (!option.value || !option.label.trim()) {
      throw new Error("Combobox options require non-empty values and labels.");
    }
    if (values.has(option.value)) {
      throw new Error(`Combobox option values must be unique: "${option.value}".`);
    }
    values.add(option.value);
  }

  if (!loading && selectedValue !== null && !values.has(selectedValue)) {
    throw new Error(`Combobox value must match an option: "${selectedValue}".`);
  }
}

function findEnabledIndex(
  options: readonly ComboboxOption[],
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

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    id,
    label,
    options,
    name,
    value,
    defaultValue = null,
    onValueChange,
    filterOptions,
    allowClear = true,
    clearLabel = "Clear selection",
    noResultsMessage = "No results found.",
    loading = false,
    loadingMessage = "Loading options…",
    requiredMessage = "Please select an option.",
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
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);
  const [query, setQuery] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const controlled = value !== undefined;
  const selectedValue = controlled ? value ?? null : uncontrolledValue;

  validateOptions(options, selectedValue, loading);

  const selectedOption = selectedValue === null
    ? undefined
    : options.find((option) => option.value === selectedValue);
  const inputValue = query ?? selectedOption?.label ?? "";
  const filteredOptions = useMemo(() => {
    if (filterOptions) return filterOptions(options, query ?? "");
    const normalizedQuery = (query ?? "").trim().toLocaleLowerCase();
    return options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery));
  }, [filterOptions, options, query]);
  const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
  const popupOpen = isOpen && !disabled;
  const showNoResults = popupOpen && !loading && filteredOptions.length === 0;

  useEffect(() => {
    inputRef.current?.setCustomValidity(
      required && selectedValue === null ? requiredMessage : "",
    );
  }, [required, requiredMessage, selectedValue]);

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

  function updateValue(nextValue: string | null) {
    if (nextValue === selectedValue) return;
    if (!controlled) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  }

  function selectOption(option: ComboboxOption) {
    if (option.disabled || disabled) return;
    updateValue(option.value);
    setQuery(null);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function clearSelection() {
    updateValue(null);
    setQuery(null);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.currentTarget.value;
    setQuery(nextQuery);
    if (selectedValue !== null) updateValue(null);

    const normalizedQuery = nextQuery.trim().toLocaleLowerCase();
    const matches = filterOptions
      ? filterOptions(options, nextQuery)
      : options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery));
    setActiveIndex(findEnabledIndex(matches, -1, 1));
    setIsOpen(true);
    onChange?.(event);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    if (!disabled) {
      const selectionIndex = filteredOptions.findIndex((option) => option.value === selectedValue);
      setActiveIndex(selectionIndex >= 0 ? selectionIndex : findEnabledIndex(filteredOptions, -1, 1));
      setIsOpen(true);
    }
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setIsOpen(false);
    setActiveIndex(-1);
    onBlur?.(event);
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
      selectOption(activeOption);
      return;
    }

    if (event.key === "Escape" && popupOpen) {
      event.preventDefault();
      setQuery(null);
      setIsOpen(false);
      setActiveIndex(-1);
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
      <FieldLabel id={field.id} labelId={labelId} label={label} required={required} />
      <div
        className={styles.root}
        data-disabled={disabled || undefined}
        data-invalid={field.invalid || undefined}
        ref={rootRef}
        style={style as CSSProperties | undefined}
      >
        <div className={styles.control}>
          <Icon className={styles.searchIcon} name="search" size="sm" />
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
            required={required}
            value={inputValue}
          />
          {allowClear && (selectedValue !== null || query !== null && query.length > 0) && !disabled && (
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
          className={styles.listbox}
          hidden={!popupOpen || loading || filteredOptions.length === 0}
          id={listboxId}
          role="listbox"
        >
          {filteredOptions.map((option, index) => (
            <li
              aria-disabled={option.disabled || undefined}
              aria-selected={selectedValue === option.value}
              className={styles.option}
              data-active={activeIndex === index || undefined}
              data-disabled={option.disabled || undefined}
              id={`${listboxId}-option-${index}`}
              key={option.value}
              onClick={() => selectOption(option)}
              onPointerDown={handleOptionPointerDown}
              onPointerEnter={() => {
                if (!option.disabled) setActiveIndex(index);
              }}
              role="option"
            >
              <span>{option.label}</span>
              {selectedValue === option.value && <Icon className={styles.selectedIcon} name="check" size="sm" />}
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
        {name && (
          <input
            disabled={disabled}
            form={inputProps.form}
            name={name}
            type="hidden"
            value={selectedValue ?? ""}
          />
        )}
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

Combobox.displayName = "Combobox";
