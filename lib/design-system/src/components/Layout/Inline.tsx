import type {
  LayoutAlignment,
  LayoutGap,
  LayoutJustification,
  LayoutPolymorphicProps,
  LayoutElement,
} from "./Layout.types";
import { renderLayoutElement } from "./Layout.types";
import styles from "./Layout.module.css";

export type InlineProps<T extends LayoutElement = "div"> =
  LayoutPolymorphicProps<
    T,
    {
      gap?: LayoutGap;
      align?: LayoutAlignment;
      justify?: LayoutJustification;
      wrap?: boolean;
    }
  >;

export function Inline<T extends LayoutElement = "div">({
  as,
  gap = "sm",
  align = "center",
  justify = "start",
  wrap = true,
  className,
  ...elementProps
}: InlineProps<T>) {
  return renderLayoutElement(as, "div", {
    ...elementProps,
    className: [styles.inline, className].filter(Boolean).join(" "),
    "data-align": align,
    "data-gap": gap,
    "data-justify": justify,
    "data-wrap": String(wrap),
  });
}

Inline.displayName = "Inline";
