import {
  createElement,
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Typography.module.css";

export type TypographySize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
export type TypographyWeight = "regular" | "medium" | "semibold";
export type TypographyTone = "primary" | "muted";
export type TextElement = "p" | "span" | "div";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type TextBaseProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "color" | "style"
> & {
  children?: ReactNode;
  size?: TypographySize;
  weight?: TypographyWeight;
  tone?: TypographyTone;
  style?: DesignSystemStyle;
};

export type TextProps = TextBaseProps & {
  as?: TextElement;
};

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as = "p",
    size = "md",
    weight = "regular",
    tone = "primary",
    children,
    className,
    style,
    ...nativeProps
  },
  ref,
) {
  return createElement(
    as,
    {
      ...nativeProps,
      ref,
      className: [styles.text, className].filter(Boolean).join(" "),
      "data-size": size,
      "data-weight": weight,
      "data-tone": tone,
      style: style as CSSProperties | undefined,
    },
    children,
  );
});

Text.displayName = "Text";

export type HeadingProps = Omit<TextBaseProps, "size"> & {
  level?: HeadingLevel;
  size?: TypographySize;
};

const defaultHeadingSize: Record<HeadingLevel, TypographySize> = {
  1: "5xl",
  2: "4xl",
  3: "3xl",
  4: "2xl",
  5: "xl",
  6: "lg",
};

export const Heading = forwardRef<HTMLElement, HeadingProps>(function Heading(
  {
    level = 2,
    size,
    weight = "semibold",
    tone = "primary",
    children,
    className,
    style,
    ...nativeProps
  },
  ref,
) {
  const element = `h${level}` as const;
  return createElement(
    element,
    {
      ...nativeProps,
      ref,
      className: [styles.heading, className].filter(Boolean).join(" "),
      "data-level": level,
      "data-size": size ?? defaultHeadingSize[level],
      "data-weight": weight,
      "data-tone": tone,
      style: style as CSSProperties | undefined,
    },
    children,
  );
});

Heading.displayName = "Heading";
