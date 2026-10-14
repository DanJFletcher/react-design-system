import type { LayoutPolymorphicProps, LayoutElement } from "./Layout.types";
import { renderLayoutElement } from "./Layout.types";
import styles from "./Layout.module.css";

export type VisuallyHiddenProps<T extends LayoutElement = "span"> =
  LayoutPolymorphicProps<
    T,
    {
      focusable?: boolean;
    }
  >;

export function VisuallyHidden<T extends LayoutElement = "span">({
  as,
  focusable = false,
  className,
  ...elementProps
}: VisuallyHiddenProps<T>) {
  return renderLayoutElement(as, "span", {
    ...elementProps,
    className: [styles.visuallyHidden, className].filter(Boolean).join(" "),
    "data-focusable": focusable ? "true" : undefined,
  });
}

VisuallyHidden.displayName = "VisuallyHidden";
