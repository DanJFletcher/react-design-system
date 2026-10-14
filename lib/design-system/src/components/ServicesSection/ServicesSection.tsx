import {
  forwardRef,
  useId,
  type AnchorHTMLAttributes,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
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
import styles from "./ServicesSection.module.css";

export type ServicesSectionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type ServicesSectionColumns = 1 | 2 | 3 | 4;
export type ServicesSectionVariant = "plain" | "surface" | "accent";

export type ServicesSectionLink = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target" | "rel"
> & {
  href: string;
  label?: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  image?: ReactNode;
  link?: ServicesSectionLink;
  action?: ReactNode;
};

export type ServicesSectionProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style" | "title" | "aria-label" | "aria-labelledby"
> & {
  eyebrow?: ReactNode;
  heading?: string;
  description?: ReactNode;
  items: readonly ServiceItem[];
  columns?: ServicesSectionColumns;
  headingLevel?: ServicesSectionHeadingLevel;
  variant?: ServicesSectionVariant;
  cardVariant?: CardVariant;
  cardSize?: CardSize;
  cardShape?: CardShape;
  cardAlignment?: CardAlignment;
  mediaAspectRatio?: CardMediaAspectRatio;
  mediaFit?: CardMediaFit;
  style?: DesignSystemStyle;
  "aria-label"?: string;
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export const ServicesSection = forwardRef<HTMLElement, ServicesSectionProps>(
  function ServicesSection(
    {
      eyebrow,
      heading,
      description,
      items,
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
      ...sectionProps
    },
    ref,
  ) {
    const generatedId = useId();
    const Heading = `h${headingLevel}` as HeadingTag;
    const cardHeadingLevel = (heading == null
      ? headingLevel
      : Math.min(headingLevel + 1, 6)) as ServicesSectionHeadingLevel;
    const hasHeader = eyebrow != null || heading != null || description != null;

    return (
      <section
        {...sectionProps}
        ref={ref}
        aria-labelledby={heading != null ? `${generatedId}-heading` : undefined}
        aria-label={heading == null ? ariaLabel ?? "Services" : ariaLabel}
        className={[styles.services, className].filter(Boolean).join(" ")}
        data-services-section=""
        data-variant={variant}
        data-columns={columns}
        style={style as CSSProperties | undefined}
      >
        {hasHeader && (
          <header className={styles.intro}>
            {eyebrow != null && <div className={styles.sectionEyebrow}>{eyebrow}</div>}
            {heading != null && (
              <Heading className={styles.heading} id={`${generatedId}-heading`}>
                {heading}
              </Heading>
            )}
            {description != null && <div className={styles.description}>{description}</div>}
          </header>
        )}

        <ul className={styles.grid} data-slot="services-grid">
          {items.map((item) => {
            const hasServiceEyebrow = item.eyebrow != null || item.icon != null;
            const hasAction = item.link != null || (item.action != null && item.action !== false);
            const serviceEyebrow = hasServiceEyebrow ? (
              <span className={styles.cardEyebrow}>
                {item.icon != null && (
                  <span aria-hidden="true" className={styles.icon}>
                    {item.icon}
                  </span>
                )}
                {item.eyebrow != null && <span>{item.eyebrow}</span>}
              </span>
            ) : undefined;
            const actions = hasAction ? (
              <>
                {item.link != null && (
                  <a
                    className={styles.link}
                    href={item.link.href}
                    rel={item.link.rel}
                    target={item.link.target}
                  >
                    {item.link.label ?? `Learn more about ${item.title}`}
                  </a>
                )}
                {item.action}
              </>
            ) : undefined;

            return (
              <li className={styles.item} key={item.id}>
                <Card
                  alignment={cardAlignment}
                  actions={actions}
                  className={styles.card}
                  description={item.description}
                  eyebrow={serviceEyebrow}
                  headingLevel={cardHeadingLevel}
                  media={item.image}
                  mediaAspectRatio={mediaAspectRatio}
                  mediaFit={mediaFit}
                  shape={cardShape}
                  size={cardSize}
                  title={item.title}
                  variant={cardVariant}
                />
              </li>
            );
          })}
        </ul>
      </section>
    );
  },
);

ServicesSection.displayName = "ServicesSection";
