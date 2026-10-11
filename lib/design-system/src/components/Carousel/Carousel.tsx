import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Carousel.module.css";

export type CarouselSlide = {
  id: string;
  content: ReactNode;
  label?: string;
};

export type CarouselIndicator = "dots" | "fraction" | "none";
export type CarouselControlsPosition = "overlay" | "below";
export type CarouselVariant = "surface" | "outlined" | "subtle" | "accent";
export type CarouselSize = "sm" | "md" | "lg";

export type CarouselProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style"
> & {
  label: string;
  slides: CarouselSlide[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  getSlideLabel?: (slide: CarouselSlide, index: number, total: number) => string;
  getIndicatorLabel?: (slide: CarouselSlide, index: number, total: number) => string;
  loop?: boolean;
  showControls?: boolean;
  indicators?: CarouselIndicator;
  controlsPosition?: CarouselControlsPosition;
  previousLabel?: string;
  nextLabel?: string;
  emptyMessage?: ReactNode;
  variant?: CarouselVariant;
  size?: CarouselSize;
  style?: DesignSystemStyle;
};

type PointerStart = {
  id: number;
  x: number;
  y: number;
};

export const Carousel = forwardRef<HTMLElement, CarouselProps>(function Carousel(
  {
    label,
    slides,
    index,
    defaultIndex = 0,
    onIndexChange,
    getSlideLabel,
    getIndicatorLabel,
    loop = false,
    showControls = true,
    indicators = "dots",
    controlsPosition = "below",
    previousLabel = "Previous slide",
    nextLabel = "Next slide",
    emptyMessage = "No slides to display.",
    variant = "surface",
    size = "md",
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    onKeyDown,
    ...sectionProps
  },
  ref,
) {
  const carouselId = useId();
  const isControlled = index !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const requestedIndex = isControlled ? index : internalIndex;
  const normalizedIndex = Number.isFinite(requestedIndex) ? Math.trunc(requestedIndex) : 0;
  const activeIndex = slides.length === 0
    ? 0
    : Math.min(Math.max(normalizedIndex, 0), slides.length - 1);
  const pointerStart = useRef<PointerStart | null>(null);

  useEffect(() => {
    if (!isControlled && internalIndex !== activeIndex) {
      setInternalIndex(activeIndex);
    }
  }, [activeIndex, internalIndex, isControlled]);

  const goTo = (requested: number) => {
    if (slides.length < 2) return;

    let next = requested;
    if (loop) {
      next = ((requested % slides.length) + slides.length) % slides.length;
    } else {
      next = Math.min(Math.max(requested, 0), slides.length - 1);
    }

    if (next === activeIndex) return;
    if (!isControlled) setInternalIndex(next);
    onIndexChange?.(next);
  };

  const move = (direction: -1 | 1) => {
    goTo(activeIndex + direction);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.target !== event.currentTarget || slides.length < 2) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(slides.length - 1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || slides.length < 2) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("a, button, input, select, textarea, [contenteditable='true']")
    ) {
      return;
    }
    pointerStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.id !== event.pointerId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    move(deltaX < 0 ? 1 : -1);
  };

  const classes = [styles.carousel, className].filter(Boolean).join(" ");
  const canMovePrevious = loop || activeIndex > 0;
  const canMoveNext = loop || activeIndex < slides.length - 1;
  const shouldRenderControls = slides.length > 1 && (
    showControls || indicators !== "none"
  );

  return (
    <section
      {...sectionProps}
      ref={ref}
      className={classes}
      data-variant={variant}
      data-size={size}
      data-index={activeIndex}
      aria-label={ariaLabel ?? label}
      aria-labelledby={ariaLabelledby}
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={style as CSSProperties | undefined}
    >
      <div className={styles.frame}>
        {slides.length === 0 ? (
          <div className={styles.empty} data-slot="empty">
            {emptyMessage}
          </div>
        ) : (
          <div
            className={styles.viewport}
            id={carouselId}
            data-slot="viewport"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              pointerStart.current = null;
            }}
          >
            <div className={styles.track} data-slot="track" aria-live="polite">
              {slides.map((slide, slideIndex) => {
                const isActive = slideIndex === activeIndex;
                const positionLabel = getSlideLabel
                  ? getSlideLabel(slide, slideIndex, slides.length)
                  : slide.label
                    ? `${slide.label}, ${slideIndex + 1} of ${slides.length}`
                    : `Slide ${slideIndex + 1} of ${slides.length}`;

                return (
                  <div
                    className={styles.slide}
                    data-slot="slide"
                    data-active={isActive}
                    key={slide.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={positionLabel}
                    aria-hidden={!isActive}
                    inert={!isActive}
                    style={{ transform: `translateX(${(slideIndex - activeIndex) * 100}%)` }}
                  >
                    {slide.content}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {shouldRenderControls && (
          <div className={styles.controls} data-position={controlsPosition} data-slot="controls">
            {showControls && (
              <button
                className={styles.controlButton}
                type="button"
                aria-label={previousLabel}
                aria-controls={carouselId}
                disabled={!canMovePrevious}
                onClick={() => move(-1)}
              >
                <ArrowIcon direction="left" />
              </button>
            )}

            {indicators === "dots" && (
              <div className={styles.indicators} role="group" aria-label={`${label} slide indicators`}>
                {slides.map((slide, slideIndex) => (
                  <button
                    className={styles.indicator}
                    key={slide.id}
                    type="button"
                    aria-label={getIndicatorLabel
                      ? getIndicatorLabel(slide, slideIndex, slides.length)
                      : `Go to slide ${slideIndex + 1}`}
                    aria-current={slideIndex === activeIndex ? "true" : undefined}
                    aria-controls={carouselId}
                    onClick={() => goTo(slideIndex)}
                  />
                ))}
              </div>
            )}

            {indicators === "fraction" && (
              <div className={styles.fraction} aria-live="polite" aria-atomic="true">
                {activeIndex + 1} / {slides.length}
              </div>
            )}

            {showControls && (
              <button
                className={styles.controlButton}
                type="button"
                aria-label={nextLabel}
                aria-controls={carouselId}
                disabled={!canMoveNext}
                onClick={() => move(1)}
              >
                <ArrowIcon direction="right" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

Carousel.displayName = "Carousel";

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={styles.arrow}
    >
      {direction === "left" ? (
        <path d="m14.5 5-7 7 7 7" />
      ) : (
        <path d="m9.5 5 7 7-7 7" />
      )}
    </svg>
  );
}
