import {
  type AnchorHTMLAttributes,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useId,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./ArticleFootnotes.module.css";

export type ArticleFootnoteHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface ArticleFootnoteBacklink {
  /** The id of the matching in-text ArticleFootnote marker. */
  id: string;
  /** Optional accessible name override, useful for localized content. */
  ariaLabel?: string;
}

export interface ArticleFootnoteEntry {
  /** Unique id targeted by each matching ArticleFootnote marker. */
  id: string;
  /** The visible label shared by this note and its in-text markers. */
  label: string | number;
  /** Consumer-provided note content. */
  content: ReactNode;
  /** One or more in-text markers to which readers can return. */
  backlinks: readonly [ArticleFootnoteBacklink, ...ArticleFootnoteBacklink[]];
}

export type ArticleFootnoteProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href" | "id" | "style"
> & {
  /** Unique id for the in-text citation marker. */
  id: string;
  /** The id of the matching ArticleFootnoteEntry. */
  noteId: string;
  /** Visible note label, such as 1 or *. */
  label: string | number;
  style?: DesignSystemStyle;
};

export type ArticleFootnotesProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "style"
> & {
  items: readonly ArticleFootnoteEntry[];
  /** Visible section heading. Defaults to "Footnotes". */
  heading?: string;
  /** Semantic heading level, independent of its visual size. Defaults to 2. */
  headingLevel?: ArticleFootnoteHeadingLevel;
  /** Localizable prefix used for generated backlink labels. */
  backlinkLabel?: string;
  style?: DesignSystemStyle;
};

const ArticleFootnoteMarker = forwardRef<HTMLAnchorElement, ArticleFootnoteProps>(
  function ArticleFootnoteMarker(
    { id, noteId, label, className, style, ...nativeProps },
    ref,
  ) {
    const accessibleName = nativeProps["aria-label"] ?? `Footnote ${label}`;

    return (
      <sup className={styles.marker}>
        <a
          {...nativeProps}
          ref={ref}
          id={id}
          href={`#${noteId}`}
          className={[styles.markerLink, className].filter(Boolean).join(" ")}
          style={style as CSSProperties | undefined}
          aria-label={accessibleName}
        >
          {label}
        </a>
      </sup>
    );
  },
);

ArticleFootnoteMarker.displayName = "ArticleFootnote";

export const ArticleFootnote = ArticleFootnoteMarker;

const ArticleFootnotesSection = forwardRef<HTMLElement, ArticleFootnotesProps>(
  function ArticleFootnotesSection(
    {
      items,
      heading = "Footnotes",
      headingLevel = 2,
      backlinkLabel = "Back to citation",
      className,
      style,
      ...nativeProps
    },
    ref,
  ) {
    const generatedHeadingId = useId();
    const HeadingTag = `h${headingLevel}` as `h${ArticleFootnoteHeadingLevel}`;
    const headingId = nativeProps["aria-labelledby"] ?? generatedHeadingId;

    return (
      <section
        {...nativeProps}
        ref={ref}
        aria-labelledby={headingId}
        className={[styles.footnotes, className].filter(Boolean).join(" ")}
        style={style as CSSProperties | undefined}
      >
        <HeadingTag id={generatedHeadingId} className={styles.heading}>
          {heading}
        </HeadingTag>
        <ol className={styles.list}>
          {items.map((item) => (
            <li className={styles.note} id={item.id} key={item.id}>
              <span className={styles.noteLabel}>{item.label}</span>
              <div className={styles.noteContent}>{item.content}</div>
              <div className={styles.backlinks}>
                {item.backlinks.map((backlink, index) => (
                  <a
                    key={backlink.id}
                    className={styles.backlink}
                    href={`#${backlink.id}`}
                    aria-label={
                      backlink.ariaLabel ??
                      `${backlinkLabel} ${index + 1} for footnote ${item.label}`
                    }
                  >
                    <span aria-hidden="true">↩</span>
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  },
);

ArticleFootnotesSection.displayName = "ArticleFootnotes";

export const ArticleFootnotes = ArticleFootnotesSection;
