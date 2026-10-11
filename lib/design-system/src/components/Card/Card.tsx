import {
  forwardRef,
  useId,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Card.module.css";

export type CardVariant = "surface" | "outlined" | "subtle" | "accent";
export type CardLayout = "vertical" | "horizontal";
export type CardAlignment = "start" | "center";
export type CardMediaPosition = "start" | "end";
export type CardSize = "sm" | "md" | "lg";
export type CardShape = "rounded" | "square";
export type CardHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type CardMediaAspectRatio = "auto" | "square" | "landscape" | "wide" | "portrait";
export type CardMediaFit = "cover" | "contain";

export type CardProps = Omit<
  ComponentPropsWithRef<"article">,
  "children" | "style" | "title"
> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  metadata?: ReactNode;
  headerActions?: ReactNode;
  media?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  variant?: CardVariant;
  layout?: CardLayout;
  alignment?: CardAlignment;
  mediaPosition?: CardMediaPosition;
  mediaAspectRatio?: CardMediaAspectRatio;
  mediaFit?: CardMediaFit;
  size?: CardSize;
  shape?: CardShape;
  headingLevel?: CardHeadingLevel;
  style?: DesignSystemStyle;
};

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    eyebrow,
    title,
    description,
    metadata,
    headerActions,
    media,
    children,
    footer,
    actions,
    variant = "surface",
    layout = "vertical",
    alignment = "start",
    mediaPosition = "start",
    mediaAspectRatio = "auto",
    mediaFit = "cover",
    size = "md",
    shape = "rounded",
    headingLevel = 2,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...articleProps
  },
  ref,
) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";
  const hasHeader = eyebrow != null || title != null || metadata != null || headerActions != null;
  const hasBody = description != null || children != null;
  const hasFooter = footer != null || actions != null;

  const mediaSlot = media == null ? null : (
    <div
      className={styles.media}
      data-slot="media"
      data-aspect-ratio={mediaAspectRatio}
      data-fit={mediaFit}
    >
      {media}
    </div>
  );

  const contentSlot = (
    <div className={styles.content} data-slot="content">
      {hasHeader && (
        <header className={styles.header} data-slot="header">
          <div className={styles.headingGroup}>
            {eyebrow != null && <div className={styles.eyebrow}>{eyebrow}</div>}
            {title != null && <Heading className={styles.title} id={titleId}>{title}</Heading>}
            {metadata != null && <div className={styles.metadata}>{metadata}</div>}
          </div>
          {headerActions != null && (
            <div className={styles.headerActions}>{headerActions}</div>
          )}
        </header>
      )}

      {hasBody && (
        <div className={styles.body} data-slot="body">
          {description != null && <div className={styles.description}>{description}</div>}
          {children}
        </div>
      )}

      {hasFooter && (
        <footer className={styles.footer} data-slot="footer">
          {footer != null && <div className={styles.footerContent}>{footer}</div>}
          {actions != null && <div className={styles.actions}>{actions}</div>}
        </footer>
      )}
    </div>
  );

  return (
    <article
      {...articleProps}
      ref={ref}
      className={[styles.card, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-layout={layout}
      data-alignment={alignment}
      data-media-position={mediaPosition}
      data-size={size}
      data-shape={shape}
      aria-label={ariaLabel}
      aria-labelledby={
        ariaLabelledby ?? (!ariaLabel && title != null ? titleId : undefined)
      }
      style={style as CSSProperties | undefined}
    >
      {mediaPosition === "start" && mediaSlot}
      {contentSlot}
      {mediaPosition === "end" && mediaSlot}
    </article>
  );
});

Card.displayName = "Card";
