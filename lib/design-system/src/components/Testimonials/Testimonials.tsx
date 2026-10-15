import {
  createElement,
  forwardRef,
  useId,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import {
  Card,
  type CardAlignment,
  type CardHeadingLevel,
  type CardShape,
  type CardSize,
  type CardVariant,
} from "../Card/Card";
import { Rating } from "../Rating/Rating";
import styles from "./Testimonials.module.css";

export type TestimonialAvatar = {
  src: string;
  alt?: string;
};

export type TestimonialAuthor = {
  name: string;
  role?: string;
  company?: string;
  avatar?: TestimonialAvatar;
};

export type TestimonialItem = {
  id: string;
  quote: string;
  author: TestimonialAuthor;
  rating?: number;
};

export type TestimonialsLayout = "grid" | "featured";
export type TestimonialsHeadingLevel = Exclude<CardHeadingLevel, 1>;

export type TestimonialsProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style"
> & {
  items: readonly TestimonialItem[];
  heading?: string;
  description?: ReactNode;
  headingLevel?: TestimonialsHeadingLevel;
  layout?: TestimonialsLayout;
  columns?: 2 | 3;
  variant?: CardVariant;
  size?: CardSize;
  shape?: CardShape;
  alignment?: CardAlignment;
  getRatingLabel?: (rating: number) => string;
  style?: DesignSystemStyle;
};

const headingLevels: readonly TestimonialsHeadingLevel[] = [2, 3, 4, 5, 6];

export const Testimonials = forwardRef<HTMLElement, TestimonialsProps>(
  function Testimonials(
    {
      items,
      heading,
      description,
      headingLevel = 2,
      layout = "grid",
      columns = 3,
      variant = "surface",
      size = "md",
      shape = "rounded",
      alignment = "start",
      getRatingLabel,
      className,
      style,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...sectionProps
    },
    ref,
  ) {
    const headingId = useId();

    if (!Array.isArray(items)) {
      throw new Error("Testimonials requires an items array.");
    }
    if (layout !== "grid" && layout !== "featured") {
      throw new Error('Testimonials layout must be "grid" or "featured".');
    }
    if (columns !== 2 && columns !== 3) {
      throw new Error("Testimonials columns must be 2 or 3.");
    }
    if (!headingLevels.includes(headingLevel)) {
      throw new Error("Testimonials headingLevel must be between 2 and 6.");
    }
    if (heading !== undefined && !heading.trim()) {
      throw new Error("Testimonials heading cannot be empty.");
    }
    if (
      !heading &&
      !ariaLabelledBy &&
      ariaLabel !== undefined &&
      !ariaLabel.trim()
    ) {
      throw new Error("Testimonials aria-label cannot be empty.");
    }
    if (items.length === 0) {
      return null;
    }
    if (layout === "featured" && items.length !== 1) {
      throw new Error('Testimonials layout="featured" requires exactly one item.');
    }

    const seenIds = new Set<string>();
    for (const item of items) {
      if (!item.id.trim()) {
        throw new Error("Each testimonial requires a non-empty id.");
      }
      if (seenIds.has(item.id)) {
        throw new Error(`Testimonials item id "${item.id}" is duplicated.`);
      }
      seenIds.add(item.id);

      if (!item.quote.trim()) {
        throw new Error(`Testimonial "${item.id}" requires a non-empty quote.`);
      }
      if (!item.author.name.trim()) {
        throw new Error(`Testimonial "${item.id}" requires an author name.`);
      }
      if (item.author.avatar && !item.author.avatar.src.trim()) {
        throw new Error(`Testimonial "${item.id}" has an empty avatar source.`);
      }
      if (
        item.rating !== undefined &&
        (!Number.isSafeInteger(item.rating) || item.rating < 1 || item.rating > 5)
      ) {
        throw new RangeError(
          `Testimonial "${item.id}" rating must be an integer from 1 to 5.`,
        );
      }
    }

    const resolvedAriaLabelledBy = ariaLabelledBy ??
      (heading && !ariaLabel ? headingId : undefined);
    const resolvedAriaLabel = ariaLabel ??
      (!heading && !ariaLabelledBy ? "Testimonials" : undefined);
    const Heading = `h${headingLevel}` as
      | "h2"
      | "h3"
      | "h4"
      | "h5"
      | "h6";

    return (
      <section
        {...sectionProps}
        ref={ref}
        aria-label={resolvedAriaLabel}
        aria-labelledby={resolvedAriaLabelledBy}
        className={[styles.root, className].filter(Boolean).join(" ")}
        style={style as CSSProperties | undefined}
      >
        {(heading || description != null) && (
          <header className={styles.header}>
            {heading &&
              createElement(Heading, { className: styles.heading, id: headingId }, heading)}
            {description != null && (
              <div className={styles.description}>{description}</div>
            )}
          </header>
        )}

        <div
          className={styles.items}
          data-columns={columns}
          data-layout={layout}
        >
          {items.map((item) => {
            const authorDetails = [item.author.role, item.author.company]
              .filter((detail): detail is string => Boolean(detail?.trim()));

            return (
              <Card
                key={item.id}
                alignment={alignment}
                className={styles.card}
                shape={shape}
                size={size}
                variant={variant}
              >
                <figure className={styles.figure}>
                  {item.rating !== undefined && (
                    <Rating
                      mode="display"
                      value={item.rating}
                      max={5}
                      size="md"
                      getRatingLabel={(rating, max) =>
                        getAccessibleRatingLabel(rating, getRatingLabel, max)
                      }
                    />
                  )}

                  <blockquote className={styles.quote}>
                    <p>{item.quote}</p>
                  </blockquote>

                  <figcaption className={styles.attribution}>
                    {item.author.avatar && (
                      <img
                        alt={item.author.avatar.alt ?? ""}
                        className={styles.avatar}
                        decoding="async"
                        height={48}
                        loading="lazy"
                        src={item.author.avatar.src}
                        width={48}
                      />
                    )}
                    <span className={styles.author}>
                      <cite className={styles.authorName}>{item.author.name}</cite>
                      {authorDetails.length > 0 && (
                        <span className={styles.authorDetails}>
                          {authorDetails.map((detail, index) => (
                            <span key={`${item.id}-${index}`}>
                              {index > 0 && (
                                <span aria-hidden="true"> · </span>
                              )}
                              {detail}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </figcaption>
                </figure>
              </Card>
            );
          })}
        </div>
      </section>
    );
  },
);

Testimonials.displayName = "Testimonials";

function getAccessibleRatingLabel(
  rating: number,
  getRatingLabel?: (rating: number) => string,
  max = 5,
) {
  const label = getRatingLabel
    ? getRatingLabel(rating)
    : `${rating} out of ${max} stars`;

  if (typeof label !== "string" || !label.trim()) {
    throw new Error("Testimonials getRatingLabel must return non-empty text.");
  }

  return label;
}
