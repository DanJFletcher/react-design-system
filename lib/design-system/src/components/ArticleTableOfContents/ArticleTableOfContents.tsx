import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./ArticleTableOfContents.module.css";

export type ArticleTableOfContentsHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface ArticleTableOfContentsItem {
  /** Consumer-provided id of the matching article heading. */
  id: string;
  /** Visible link text for the heading. */
  label: string;
}

export type ArticleTableOfContentsProps = Omit<
  ComponentPropsWithRef<"nav">,
  "children" | "style"
> & {
  /** Ordered heading destinations supplied by the article author. */
  items: readonly ArticleTableOfContentsItem[];
  /** Visible title above the links. Defaults to "On this page". */
  heading?: string;
  /** Semantic level for the visible title. Defaults to 2. */
  headingLevel?: ArticleTableOfContentsHeadingLevel;
  style?: DesignSystemStyle;
};

/**
 * A theme-aware list of native fragment links to consumer-provided article headings.
 * The caller owns the heading IDs, labels, and document navigation behavior.
 */
export const ArticleTableOfContents = forwardRef<
  HTMLElement,
  ArticleTableOfContentsProps
>(function ArticleTableOfContents(
  {
    items,
    heading = "On this page",
    headingLevel = 2,
    className,
    style,
    "aria-label": ariaLabel = "Table of contents",
    ...navProps
  },
  ref,
) {
  const HeadingTag = `h${headingLevel}` as `h${ArticleTableOfContentsHeadingLevel}`;

  return (
    <nav
      {...navProps}
      ref={ref}
      aria-label={ariaLabel}
      className={[styles.tableOfContents, className].filter(Boolean).join(" ")}
      style={style as CSSProperties | undefined}
    >
      <HeadingTag className={styles.heading}>{heading}</HeadingTag>
      <ul className={styles.list}>
        {items.map((item) => (
          <li className={styles.item} key={item.id}>
            <a className={styles.link} href={`#${item.id}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
});

ArticleTableOfContents.displayName = "ArticleTableOfContents";
