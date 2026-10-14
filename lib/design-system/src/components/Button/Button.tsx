import { forwardRef, type ComponentPropsWithRef, type CSSProperties, type ReactNode } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "rounded" | "square" | "pill";
export type ButtonIconPosition = "left" | "right";

type ButtonBaseProps = Omit<
  ComponentPropsWithRef<"button">,
  "style" | "aria-busy" | "aria-disabled" | "aria-label" | "aria-labelledby" | "children"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
  loading?: boolean;
  style?: DesignSystemStyle;
};

type AccessibleIconOnlyName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

export type ButtonProps =
  | (ButtonBaseProps & {
      iconOnly?: false;
      children?: ReactNode;
      "aria-label"?: string;
      "aria-labelledby"?: string;
    })
  | (ButtonBaseProps & {
      iconOnly: true;
      icon: ReactNode;
      children?: never;
    } & AccessibleIconOnlyName);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    shape,
    fullWidth = false,
    icon,
    iconPosition = "left",
    iconOnly = false,
    loading = false,
    type = "button",
    disabled = false,
    className,
    style,
    onClick,
    children,
    ...props
  },
  ref,
) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    shape && styles[shape],
    fullWidth && styles.fullWidth,
    iconOnly && styles.iconOnly,
    className,
  ].filter(Boolean).join(" ");
  const iconElement = icon == null || typeof icon === "boolean"
    ? null
    : <span className={styles.icon} aria-hidden="true">{icon}</span>;

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-ds-button-variant={variant}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
      className={classes}
      style={style as CSSProperties | undefined}
    >
      {iconPosition === "left" && iconElement}
      {!iconOnly && <span className={styles.label}>{children}</span>}
      {iconPosition === "right" && iconElement}
      {loading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}
    </button>
  );
});

Button.displayName = "Button";
