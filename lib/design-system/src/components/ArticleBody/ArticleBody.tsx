import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./ArticleBody.module.css";

export type ArticleBodyProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "style"
> & {
  children?: ReactNode;
  style?: DesignSystemStyle;
};

/**
 * A readable, theme-aware surface for the semantic HTML inside a long article.
 * Content remains ordinary paragraphs, headings, lists, figures, links, and tables.
 */
export const ArticleBody = forwardRef<HTMLElement, ArticleBodyProps>(function ArticleBody(
  { children, className, style, ...nativeProps },
  ref,
) {
  return (
    <article
      {...nativeProps}
      ref={ref}
      className={[styles.articleBody, className].filter(Boolean).join(" ")}
      style={style as CSSProperties | undefined}
    >
      {children}
    </article>
  );
});

ArticleBody.displayName = "ArticleBody";
