import {
  forwardRef,
  useId,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./PricingDetails.module.css";

export type PricingDetailsVariant = "surface" | "outlined" | "subtle" | "accent" | "featured";
export type PricingDetailsLayout = "stacked" | "split";
export type PricingDetailsAlignment = "start" | "center";
export type PricingDetailsSize = "sm" | "md" | "lg";
export type PricingDetailsShape = "rounded" | "square";
export type PricingDetailsHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type PricingDetailItem = {
  id: string;
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  emphasis?: boolean;
};

export type PricingDetailsProps = Omit<
  ComponentPropsWithRef<"article">,
  "children" | "style" | "title"
> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  price?: ReactNode;
  pricePrefix?: ReactNode;
  priceSuffix?: ReactNode;
  billingPeriod?: ReactNode;
  compareAtPrice?: ReactNode;
  priceLabel?: string;
  detailsLabel?: ReactNode;
  details?: PricingDetailItem[];
  features?: ReactNode;
  children?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  variant?: PricingDetailsVariant;
  layout?: PricingDetailsLayout;
  alignment?: PricingDetailsAlignment;
  size?: PricingDetailsSize;
  shape?: PricingDetailsShape;
  headingLevel?: PricingDetailsHeadingLevel;
  style?: DesignSystemStyle;
};

export const PricingDetails = forwardRef<HTMLElement, PricingDetailsProps>(
  function PricingDetails(
    {
      eyebrow,
      title,
      description,
      badge,
      price,
      pricePrefix,
      priceSuffix,
      billingPeriod,
      compareAtPrice,
      priceLabel,
      detailsLabel,
      details,
      features,
      children,
      primaryAction,
      secondaryAction,
      actions,
      footer,
      variant = "surface",
      layout = "stacked",
      alignment = "start",
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
    const hasActions = actions != null || primaryAction != null || secondaryAction != null;

    return (
      <article
        {...articleProps}
        ref={ref}
        className={[styles.pricing, className].filter(Boolean).join(" ")}
        data-variant={variant}
        data-layout={layout}
        data-alignment={alignment}
        data-size={size}
        data-shape={shape}
        aria-label={ariaLabel}
        aria-labelledby={
          ariaLabelledby ?? (!ariaLabel && title != null ? titleId : undefined)
        }
        style={style as CSSProperties | undefined}
      >
        <div className={styles.main} data-slot="main">
          <header className={styles.header} data-slot="header">
            <div className={styles.headingGroup}>
              {eyebrow != null && <div className={styles.eyebrow}>{eyebrow}</div>}
              <div className={styles.titleRow}>
                {title != null && <Heading className={styles.title} id={titleId}>{title}</Heading>}
                {badge != null && <div className={styles.badge}>{badge}</div>}
              </div>
              {description != null && <div className={styles.description}>{description}</div>}
            </div>

            {price != null && (
              <div className={styles.priceGroup} data-slot="price" aria-label={priceLabel}>
                <div className={styles.priceLine}>
                  {pricePrefix != null && <span className={styles.priceAffix}>{pricePrefix}</span>}
                  <span className={styles.price}>{price}</span>
                  {priceSuffix != null && <span className={styles.priceAffix}>{priceSuffix}</span>}
                  {billingPeriod != null && (
                    <span className={styles.billingPeriod}>{billingPeriod}</span>
                  )}
                </div>
                {compareAtPrice != null && (
                  <div className={styles.compareAt}>
                    <del>{compareAtPrice}</del>
                  </div>
                )}
              </div>
            )}

            {(children != null || features != null) && (
              <div className={styles.supportingContent} data-slot="supporting-content">
                {children}
                {features != null && <div className={styles.features}>{features}</div>}
              </div>
            )}

            {hasActions && (
              <div className={styles.actions} data-slot="actions">
                {actions != null ? actions : (
                  <>
                    {primaryAction}
                    {secondaryAction}
                  </>
                )}
              </div>
            )}
          </header>
        </div>

        {details != null && details.length > 0 && (
          <section className={styles.details} data-slot="details">
            {detailsLabel != null && <div className={styles.detailsLabel}>{detailsLabel}</div>}
            <dl className={styles.detailList}>
              {details.map((item) => (
                <div
                  className={styles.detailItem}
                  key={item.id}
                  data-emphasis={item.emphasis ? "true" : undefined}
                >
                  <dt>{item.label}</dt>
                  <dd>
                    <span>{item.value}</span>
                    {item.description != null && (
                      <span className={styles.detailDescription}>{item.description}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {footer != null && (
          <footer className={styles.footer} data-slot="footer">
            {footer}
          </footer>
        )}
      </article>
    );
  },
);

PricingDetails.displayName = "PricingDetails";
