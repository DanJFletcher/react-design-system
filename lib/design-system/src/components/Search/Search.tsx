import {
  forwardRef,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Search.module.css";

type SearchSubmitEvent = Parameters<
  NonNullable<ComponentPropsWithRef<"form">["onSubmit"]>
>[0];

export type SearchSize = "sm" | "md" | "lg";
export type SearchVariant = "outlined" | "soft";

export type SearchProps = Omit<
  ComponentPropsWithRef<"form">,
  "children" | "style"
> & {
  label: string;
  inputId?: string;
  queryName?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  onSearch?: (query: string, event: SearchSubmitEvent) => void;
  showLabel?: boolean;
  showLeadingIcon?: boolean;
  leadingIcon?: ReactNode;
  clearIcon?: ReactNode;
  submitIcon?: ReactNode;
  clearable?: boolean;
  showSubmitButton?: boolean;
  clearButtonLabel?: string;
  submitButtonLabel?: string;
  size?: SearchSize;
  variant?: SearchVariant;
  invalid?: boolean;
  inputAriaDescribedBy?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  inputMode?: ComponentPropsWithRef<"input">["inputMode"];
  minLength?: number;
  maxLength?: number;
  inputClassName?: string;
  style?: DesignSystemStyle;
};

export const Search = forwardRef<HTMLFormElement, SearchProps>(function Search(
  {
    label,
    inputId,
    queryName = "q",
    placeholder,
    value,
    defaultValue = "",
    onValueChange,
    onClear,
    onSearch,
    onSubmit,
    showLabel = false,
    showLeadingIcon = true,
    leadingIcon = <Icon name="search" size="sm" />,
    clearIcon = <Icon name="close" size="sm" />,
    submitIcon = <Icon name="search" size="sm" />,
    clearable = true,
    showSubmitButton = true,
    clearButtonLabel = "Clear search",
    submitButtonLabel = "Search",
    size = "md",
    variant = "outlined",
    invalid = false,
    inputAriaDescribedBy,
    required = false,
    disabled = false,
    readOnly = false,
    autoComplete = "off",
    inputMode,
    minLength,
    maxLength,
    inputClassName,
    className,
    style,
    method,
    "aria-label": formAriaLabel,
    "aria-labelledby": formLabelledBy,
    ...formProps
  },
  ref,
) {
  const generatedId = useId();
  const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = value ?? uncontrolledQuery;
  const resolvedInputId = inputId ?? `${generatedId}-search`;
  const hasLeadingIcon = showLeadingIcon && leadingIcon != null;
  const hasClearButton = clearable && query.length > 0;

  function handleSubmit(event: SearchSubmitEvent) {
    onSubmit?.(event);
    if (!event.defaultPrevented && onSearch) {
      event.preventDefault();
      onSearch(query, event);
    }
  }

  function handleClear() {
    if (value === undefined) setUncontrolledQuery("");
    onValueChange?.("");
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <form
      {...formProps}
      ref={ref}
      role="search"
      aria-label={formAriaLabel ?? label}
      aria-labelledby={formLabelledBy}
      className={[styles.search, className].filter(Boolean).join(" ")}
      data-size={size}
      data-variant={variant}
      onSubmit={handleSubmit}
      method={method ?? "get"}
      style={style as CSSProperties | undefined}
    >
      {showLabel && (
        <label className={styles.label} htmlFor={resolvedInputId}>
          {label}
        </label>
      )}
      <div className={styles.row}>
        <div className={styles.control}>
          {hasLeadingIcon && (
            <span aria-hidden="true" className={styles.leadingIcon}>
              {leadingIcon}
            </span>
          )}
          <input
            ref={inputRef}
            id={resolvedInputId}
            className={[
              styles.input,
              hasLeadingIcon && styles.inputWithLeadingIcon,
              hasClearButton && styles.inputWithClearButton,
              inputClassName,
            ].filter(Boolean).join(" ")}
            type="search"
            name={queryName}
            value={query}
            onChange={(event) => {
              const nextQuery = event.currentTarget.value;
              if (value === undefined) setUncontrolledQuery(nextQuery);
              onValueChange?.(nextQuery);
            }}
            aria-label={showLabel ? undefined : label}
            aria-describedby={inputAriaDescribedBy}
            aria-invalid={invalid || undefined}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            minLength={minLength}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
          />
          {hasClearButton && (
            <Button
              aria-label={clearButtonLabel}
              className={styles.clearButton}
              disabled={disabled || readOnly}
              icon={clearIcon}
              iconOnly
              onClick={handleClear}
              size="sm"
              type="button"
              variant="ghost"
            />
          )}
        </div>
        {showSubmitButton && (
          <Button
            aria-label={submitButtonLabel}
            disabled={disabled}
            icon={submitIcon}
            className={styles.submitButton}
            size={size}
            type="submit"
          >
            {submitButtonLabel}
          </Button>
        )}
      </div>
    </form>
  );
});

Search.displayName = "Search";
