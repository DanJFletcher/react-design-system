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
export type TextVariant = "display" | "body" | "body-small" | "lead" | "label" | "caption" | "eyebrow";
export type HeadingVariant = "heading" | "display";
export type TypographyMeasure = "none" | "narrow" | "content" | "wide";
export type TextElement = "p" | "span" | "div";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type TextBaseProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "color" | "style"
> & {
  children?: ReactNode;
  weight?: TypographyWeight;
  tone?: TypographyTone;
  measure?: TypographyMeasure;
  style?: DesignSystemStyle;
};

export type TextProps = TextBaseProps & {
  as?: TextElement;
  size?: TypographySize;
  variant?: TextVariant;
};

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as = "p",
    size,
    variant = "body",
    weight,
    tone = "primary",
    measure = "none",
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
      "data-ds-typography": "text",
      "data-size": size,
      "data-variant": variant,
      "data-weight": weight,
      "data-tone": tone,
      "data-measure": measure,
      style: style as CSSProperties | undefined,
    },
    children,
  );
});

Text.displayName = "Text";

export type HeadingProps = TextBaseProps & {
  level?: HeadingLevel;
  size?: TypographySize;
  variant?: HeadingVariant;
};

export const Heading = forwardRef<HTMLElement, HeadingProps>(function Heading(
  {
    level = 2,
    variant = "heading",
    size,
    weight,
    tone = "primary",
    measure = "none",
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
      "data-ds-typography": "heading",
      "data-level": level,
      "data-size": size,
      "data-variant": variant,
      "data-weight": weight,
      "data-tone": tone,
      "data-measure": measure,
      style: style as CSSProperties | undefined,
    },
    children,
  );
});

Heading.displayName = "Heading";
