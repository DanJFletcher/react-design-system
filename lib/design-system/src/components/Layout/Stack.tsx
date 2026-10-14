import type {
  LayoutAlignment,
  LayoutGap,
  LayoutJustification,
  LayoutPolymorphicProps,
  LayoutElement,
} from "./Layout.types";
import { renderLayoutElement } from "./Layout.types";
import styles from "./Layout.module.css";

export type StackProps<T extends LayoutElement = "div"> =
  LayoutPolymorphicProps<
    T,
    {
      gap?: LayoutGap;
      align?: LayoutAlignment;
      justify?: LayoutJustification;
    }
  >;

export function Stack<T extends LayoutElement = "div">({
  as,
  gap = "md",
  align = "stretch",
  justify = "start",
  className,
  ...elementProps
}: StackProps<T>) {
  return renderLayoutElement(as, "div", {
    ...elementProps,
    className: [styles.stack, className].filter(Boolean).join(" "),
    "data-align": align,
    "data-gap": gap,
    "data-justify": justify,
  });
}

Stack.displayName = "Stack";
