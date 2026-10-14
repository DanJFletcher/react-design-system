import {
  forwardRef,
  useId,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Hero.module.css";

export type HeroLayout = "split" | "stacked";
export type HeroAlignment = "start" | "center";
export type HeroMediaPosition = "start" | "end";
export type HeroSize = "sm" | "md" | "lg";
export type HeroBackground = "transparent" | "surface" | "accent";
export type HeroContentWidth = "narrow" | "normal" | "wide" | "full";
export type HeroHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeroMediaAspectRatio = "auto" | "square" | "landscape" | "portrait";
export type HeroMediaFit = "cover" | "contain";

export type HeroProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style" | "title"
> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  layout?: HeroLayout;
  alignment?: HeroAlignment;
  mediaPosition?: HeroMediaPosition;
  mediaAspectRatio?: HeroMediaAspectRatio;
  mediaFit?: HeroMediaFit;
  size?: HeroSize;
  background?: HeroBackground;
  contentWidth?: HeroContentWidth;
  headingLevel?: HeroHeadingLevel;
  style?: DesignSystemStyle;
};

export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero(
  {
    eyebrow,
    title,
    description,
    primaryAction,
    secondaryAction,
    actions,
    media,
    layout = "split",
    alignment = "start",
    mediaPosition = "end",
    mediaAspectRatio = "auto",
    mediaFit = "cover",
    size = "md",
    background = "transparent",
    contentWidth = "wide",
    headingLevel = 1,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...sectionProps
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
  const heroClassName = [styles.hero, className].filter(Boolean).join(" ");

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

  return (
    <section
      {...sectionProps}
      ref={ref}
      className={heroClassName}
      data-ds-layout-component="hero"
      data-layout={layout}
      data-alignment={alignment}
      data-media-position={mediaPosition}
      data-size={size}
      data-background={background}
      data-content-width={contentWidth}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby ?? (ariaLabel ? undefined : titleId)}
      style={style as CSSProperties | undefined}
    >
      <div className={styles.inner} data-slot="inner">
        {mediaPosition === "start" && mediaSlot}
        <div className={styles.content} data-slot="content">
          {eyebrow != null && <div className={styles.eyebrow}>{eyebrow}</div>}
          <Heading className={styles.title} id={titleId}>{title}</Heading>
          {description != null && <div className={styles.description}>{description}</div>}
          {hasActions && (
            <div className={styles.actions}>
              {actions != null ? actions : (
                <>
                  {primaryAction}
                  {secondaryAction}
                </>
              )}
            </div>
          )}
        </div>
        {mediaPosition === "end" && mediaSlot}
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
