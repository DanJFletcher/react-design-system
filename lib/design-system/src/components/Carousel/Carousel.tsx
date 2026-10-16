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
import { Icon } from "../Icon/Icon";
import type { DesignSystemStyle } from "../../generated/token-types";
import { usePrefersReducedMotion } from "../../motion/usePrefersReducedMotion";
import styles from "./Carousel.module.css";

export type CarouselSlide = {
  id: string;
  content: ReactNode;
  label?: string;
};

export type CarouselIndicator = "dots" | "fraction" | "none";
export type CarouselIndicatorTargetSize = "compact" | "comfortable";
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
  indicatorTargetSize?: CarouselIndicatorTargetSize;
  controlsPosition?: CarouselControlsPosition;
  overlaySafeArea?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  pauseLabel?: string;
  playLabel?: string;
  reducedMotionLabel?: string;
  emptyMessage?: ReactNode;
  variant?: CarouselVariant;
  size?: CarouselSize;
  frameAspectRatio?: number;
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
    indicatorTargetSize = "comfortable",
    controlsPosition = "below",
    overlaySafeArea = true,
    previousLabel = "Previous slide",
    nextLabel = "Next slide",
    autoPlay = false,
    autoPlayInterval = 5000,
    pauseLabel = "Pause automatic slide rotation",
    playLabel = "Start automatic slide rotation",
    reducedMotionLabel = "Automatic slide rotation is disabled by your reduced-motion preference",
    emptyMessage = "No slides to display.",
    variant = "surface",
    size = "md",
    frameAspectRatio,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    onKeyDown,
    onFocusCapture,
    onMouseEnter,
    onMouseLeave,
    ...sectionProps
  },
  ref,
) {
  if (
    frameAspectRatio !== undefined &&
    (!Number.isFinite(frameAspectRatio) || frameAspectRatio <= 0)
  ) {
    throw new RangeError("Carousel frameAspectRatio must be a positive finite number.");
  }

  const carouselId = useId();
  const isControlled = index !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [rotationEnabled, setRotationEnabled] = useState(
    autoPlay && !prefersReducedMotion
  );
  const [isHovered, setIsHovered] = useState(false);
  const requestedIndex = isControlled ? index : internalIndex;
  const normalizedIndex = Number.isFinite(requestedIndex) ? Math.trunc(requestedIndex) : 0;
  const activeIndex = slides.length === 0
    ? 0
    : Math.min(Math.max(normalizedIndex, 0), slides.length - 1);
  const rotationInterval = Number.isFinite(autoPlayInterval)
    ? Math.max(1000, Math.trunc(autoPlayInterval))
    : 5000;
  const pointerStart = useRef<PointerStart | null>(null);

  useEffect(() => {
    setRotationEnabled(autoPlay && !prefersReducedMotion);
  }, [autoPlay, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) setRotationEnabled(false);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isControlled && internalIndex !== activeIndex) {
      setInternalIndex(activeIndex);
    }
  }, [activeIndex, internalIndex, isControlled]);

  useEffect(() => {
    if (
      !autoPlay ||
      !rotationEnabled ||
      isHovered ||
      prefersReducedMotion ||
      slides.length < 2
    ) {
      return;
    }

    if (!loop && activeIndex === slides.length - 1) {
      setRotationEnabled(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      goTo(activeIndex + 1);
    }, rotationInterval);
    return () => window.clearTimeout(timeoutId);
  }, [
    activeIndex,
    autoPlay,
    isControlled,
    isHovered,
    loop,
    onIndexChange,
    prefersReducedMotion,
    rotationEnabled,
    rotationInterval,
    slides.length,
  ]);

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
      if (autoPlay) setRotationEnabled(false);
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (autoPlay) setRotationEnabled(false);
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      if (autoPlay) setRotationEnabled(false);
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      if (autoPlay) setRotationEnabled(false);
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
    if (autoPlay) setRotationEnabled(false);
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
    showControls || indicators !== "none" || autoPlay
  );
  const usesOverlaySafeArea =
    controlsPosition === "overlay" && overlaySafeArea && shouldRenderControls;

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
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        const target = event.target;
        if (
          !event.defaultPrevented &&
          autoPlay &&
          !(target instanceof Element && target.closest('[data-slot="rotation-toggle"]'))
        ) {
          setRotationEnabled(false);
        }
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        setIsHovered(true);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        setIsHovered(false);
      }}
      style={style as CSSProperties | undefined}
    >
      <div
        className={styles.frame}
        data-controls-position={controlsPosition}
      >
        {slides.length === 0 ? (
          <div className={styles.empty} data-slot="empty">
            {emptyMessage}
          </div>
        ) : (
          <div
            className={styles.viewport}
            id={carouselId}
            data-slot="viewport"
            data-frame-aspect-ratio={frameAspectRatio}
            data-overlay-safe-area={usesOverlaySafeArea ? "true" : undefined}
            data-controls-navigation={showControls ? "true" : undefined}
            data-controls-indicators={indicators !== "none" ? "true" : undefined}
            data-controls-auto-play={autoPlay ? "true" : undefined}
            style={frameAspectRatio === undefined ? undefined : { aspectRatio: frameAspectRatio }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              pointerStart.current = null;
            }}
          >
            <div
              className={styles.track}
              data-slot="track"
              aria-live={rotationEnabled && !prefersReducedMotion ? "off" : "polite"}
            >
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
          <div
            className={styles.controls}
            data-position={controlsPosition}
            data-auto-play={autoPlay ? "true" : undefined}
            data-slot="controls"
          >
            {autoPlay && (
              <button
                className={styles.controlButton}
                type="button"
                data-slot="rotation-toggle"
                aria-label={prefersReducedMotion
                  ? reducedMotionLabel
                  : rotationEnabled
                    ? pauseLabel
                    : playLabel}
                aria-pressed={rotationEnabled}
                aria-controls={carouselId}
                disabled={prefersReducedMotion}
                onClick={() => {
                  if (rotationEnabled) {
                    setRotationEnabled(false);
                  } else if (!prefersReducedMotion) {
                    if (!loop && activeIndex === slides.length - 1) goTo(0);
                    setRotationEnabled(true);
                  }
                }}
              >
                <RotationIcon playing={rotationEnabled && !prefersReducedMotion} />
              </button>
            )}

            {showControls && (
              <button
                className={styles.controlButton}
                type="button"
                aria-label={previousLabel}
                aria-controls={carouselId}
                disabled={!canMovePrevious}
                onClick={() => {
                  if (autoPlay) setRotationEnabled(false);
                  move(-1);
                }}
              >
                <ArrowIcon direction="left" />
              </button>
            )}

            {indicators === "dots" && (
              <div
                className={styles.indicators}
                data-slot="indicators"
                data-target-size={indicatorTargetSize}
                role="group"
                aria-label={`${label} slide indicators`}
              >
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
                    onClick={() => {
                      if (autoPlay) setRotationEnabled(false);
                      goTo(slideIndex);
                    }}
                  />
                ))}
              </div>
            )}

            {indicators === "fraction" && (
              <div
                className={styles.fraction}
                aria-live={rotationEnabled && !prefersReducedMotion ? "off" : "polite"}
                aria-atomic="true"
              >
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
                onClick={() => {
                  if (autoPlay) setRotationEnabled(false);
                  move(1);
                }}
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
    <Icon
      className={styles.arrow}
      name={direction === "left" ? "chevron-left" : "chevron-right"}
      size="lg"
    />
  );
}

function RotationIcon({ playing }: { playing: boolean }) {
  return <Icon className={styles.arrow} name={playing ? "pause" : "play"} size="lg" />;
}
