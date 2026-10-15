import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Separator.module.css";

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorLength = "full" | "inset" | "short";
export type SeparatorSpacing = "none" | "sm" | "md" | "lg";
export type SeparatorVariant = "solid" | "dashed" | "dotted";

export type SeparatorProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "style" | "role" | "aria-hidden" | "aria-orientation"
> & {
  orientation?: SeparatorOrientation;
  decorative?: boolean;
  length?: SeparatorLength;
  spacing?: SeparatorSpacing;
  variant?: SeparatorVariant;
  style?: DesignSystemStyle;
};

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  {
    orientation = "horizontal",
    decorative = true,
    length = "full",
    spacing = "md",
    variant = "solid",
    className,
    style,
    ...divProps
  },
  ref,
) {
  const classes = [
    styles.separator,
    orientation === "horizontal" ? styles.horizontal : styles.vertical,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div
      {...divProps}
      aria-hidden={decorative ? "true" : undefined}
      aria-orientation={decorative ? undefined : orientation}
      className={classes}
      data-length={length}
      data-orientation={orientation}
      data-spacing={spacing}
      data-variant={variant}
      ref={ref}
      role={decorative ? undefined : "separator"}
      style={style as CSSProperties | undefined}
    />
  );
});

Separator.displayName = "Separator";
