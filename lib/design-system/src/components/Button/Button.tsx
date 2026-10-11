import { forwardRef, type ComponentPropsWithRef, type CSSProperties, type ReactNode } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<
  ComponentPropsWithRef<"button">,
  "style" | "aria-busy" | "aria-disabled"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  style?: DesignSystemStyle;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
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
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
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
      <span className={styles.label}>{children}</span>
      {loading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}
    </button>
  );
});

Button.displayName = "Button";
