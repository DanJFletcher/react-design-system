import { forwardRef, type ComponentPropsWithRef, type CSSProperties, type ReactNode } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "rounded" | "square" | "pill";
export type BadgeIconPosition = "left" | "right";

export type BadgeProps = Omit<
  ComponentPropsWithRef<"span">,
  "style" | "children"
> & {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  shape?: BadgeShape;
  icon?: ReactNode;
  iconPosition?: BadgeIconPosition;
  dot?: boolean;
  style?: DesignSystemStyle;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone = "neutral",
    size = "md",
    shape,
    icon,
    iconPosition = "left",
    dot = false,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const classes = [
    styles.badge,
    styles[size],
    shape && styles[shape],
    className,
  ].filter(Boolean).join(" ");
  const iconElement = icon == null || typeof icon === "boolean"
    ? null
    : <span className={styles.icon} aria-hidden="true">{icon}</span>;

  return (
    <span
      {...props}
      ref={ref}
      className={classes}
      data-tone={tone}
      data-size={size}
      data-shape={shape}
      style={style as CSSProperties | undefined}
    >
      {iconPosition === "left" && iconElement}
      {dot && <span className={styles.dot} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
      {iconPosition === "right" && iconElement}
    </span>
  );
});

Badge.displayName = "Badge";
