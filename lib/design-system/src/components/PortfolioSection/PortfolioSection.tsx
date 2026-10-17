import {
  forwardRef,
  useId,
  type AnchorHTMLAttributes,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { Badge } from "../Badge/Badge";
import {
  Card,
  type CardAlignment,
  type CardMediaAspectRatio,
  type CardMediaFit,
  type CardShape,
  type CardSize,
  type CardVariant,
} from "../Card/Card";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./PortfolioSection.module.css";

export type PortfolioSectionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type PortfolioSectionColumns = 1 | 2 | 3 | 4;
export type PortfolioSectionVariant = "plain" | "surface" | "accent";

export type PortfolioItemImage = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "children" | "style"
> & {
  src: string;
  alt: string;
};

export type PortfolioItemLink = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target" | "rel"
> & {
  href: string;
  label?: string;
};

export type PortfolioItemDate = {
  dateTime: string;
  label: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description?: ReactNode;
  category?: ReactNode;
  location?: ReactNode;
  completedAt?: PortfolioItemDate;
  image?: PortfolioItemImage;
  link?: PortfolioItemLink;
  action?: ReactNode;
};

export type PortfolioSectionProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style" | "title"
> & {
  eyebrow?: ReactNode;
  heading?: string;
  description?: ReactNode;
  items: readonly PortfolioItem[];
  action?: ReactNode;
  emptyMessage?: ReactNode;
  columns?: PortfolioSectionColumns;
  headingLevel?: PortfolioSectionHeadingLevel;
  variant?: PortfolioSectionVariant;
  cardVariant?: CardVariant;
  cardSize?: CardSize;
  cardShape?: CardShape;
  cardAlignment?: CardAlignment;
  mediaAspectRatio?: CardMediaAspectRatio;
  mediaFit?: CardMediaFit;
  style?: DesignSystemStyle;
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const renderImage = (image: PortfolioItemImage) => {
  const {
    alt,
    className,
    decoding,
    loading,
    ...imageProps
  } = image;

  return (
    <img
      {...imageProps}
      alt={alt}
      className={[styles.image, className].filter(Boolean).join(" ")}
      decoding={decoding ?? "async"}
      loading={loading ?? "lazy"}
    />
  );
};

export const PortfolioSection = forwardRef<
  HTMLElement,
  PortfolioSectionProps
>(function PortfolioSection(
  {
    eyebrow,
    heading,
    description,
    items,
    action,
    emptyMessage = "No projects to show.",
    columns = 3,
    headingLevel = 2,
    variant = "plain",
    cardVariant = "surface",
    cardSize = "md",
    cardShape = "rounded",
    cardAlignment = "start",
    mediaAspectRatio = "landscape",
    mediaFit = "cover",
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...sectionProps
  },
  ref,
) {
  const generatedId = useId();
  const Heading = `h${headingLevel}` as HeadingTag;
  const headingId = `${generatedId}-heading`;
  const sectionLabelledBy =
    ariaLabelledBy ?? (heading != null ? headingId : undefined);
  const cardHeadingLevel = (heading == null
    ? headingLevel
    : Math.min(headingLevel + 1, 6)) as PortfolioSectionHeadingLevel;
  const hasHeader = eyebrow != null || heading != null || description != null;

  return (
    <section
      {...sectionProps}
      ref={ref}
      aria-label={
        sectionLabelledBy == null ? ariaLabel ?? "Project portfolio" : undefined
      }
      aria-labelledby={sectionLabelledBy}
      className={[styles.portfolio, className].filter(Boolean).join(" ")}
      data-columns={columns}
      data-variant={variant}
      style={style as CSSProperties | undefined}
    >
      {hasHeader && (
        <header className={styles.intro}>
          {eyebrow != null && (
            <div className={styles.sectionEyebrow}>{eyebrow}</div>
          )}
          {heading != null && (
            <Heading className={styles.heading} id={headingId}>
              {heading}
            </Heading>
          )}
          {description != null && (
            <div className={styles.description}>{description}</div>
          )}
        </header>
      )}

      {items.length === 0 ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <ul className={styles.grid} data-slot="portfolio-grid">
          {items.map((item) => {
            const category =
              item.category == null ? undefined : (
                <Badge shape="rounded" size="sm" tone="neutral">
                  {item.category}
                </Badge>
              );
            const metadata =
              item.location != null || item.completedAt != null ? (
                <div className={styles.metadata}>
                  {item.location != null && (
                    <span className={styles.location}>{item.location}</span>
                  )}
                  {item.completedAt != null && (
                    <time dateTime={item.completedAt.dateTime}>
                      {item.completedAt.label}
                    </time>
                  )}
                </div>
              ) : undefined;
            const hasAction =
              item.link != null ||
              (item.action != null && item.action !== false);
            const itemActions = hasAction ? (
              <>
                {item.link != null && (
                  <a
                    aria-label={`${item.link.label ?? "View project"}: ${item.title}`}
                    className={styles.link}
                    href={item.link.href}
                    rel={item.link.rel}
                    target={item.link.target}
                  >
                    {item.link.label ?? "View project"}
                  </a>
                )}
                {item.action}
              </>
            ) : undefined;
            const title =
              item.link == null ? (
                item.title
              ) : (
                <a
                  className={styles.titleLink}
                  href={item.link.href}
                  rel={item.link.rel}
                  target={item.link.target}
                >
                  {item.title}
                </a>
              );

            return (
              <li className={styles.item} key={item.id}>
                <Card
                  alignment={cardAlignment}
                  actions={itemActions}
                  className={styles.card}
                  description={item.description}
                  eyebrow={category}
                  headingLevel={cardHeadingLevel}
                  media={item.image == null ? undefined : renderImage(item.image)}
                  mediaAspectRatio={mediaAspectRatio}
                  mediaFit={mediaFit}
                  metadata={metadata}
                  shape={cardShape}
                  size={cardSize}
                  title={title}
                  variant={cardVariant}
                />
              </li>
            );
          })}
        </ul>
      )}

      {action != null && <div className={styles.sectionAction}>{action}</div>}
    </section>
  );
});

PortfolioSection.displayName = "PortfolioSection";
