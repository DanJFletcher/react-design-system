import {
  forwardRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Dialog } from "../Dialog/Dialog";
import { Icon } from "../Icon/Icon";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Gallery.module.css";

export type GalleryColumns = 1 | 2 | 3 | 4;
export type GalleryGap = "sm" | "md" | "lg";
export type GalleryAspectRatio = "square" | "landscape" | "portrait" | "natural";
export type GalleryFit = "cover" | "contain";
export type GalleryVariant = "plain" | "framed";

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption?: ReactNode;
  href?: string;
  linkLabel?: string;
  target?: ComponentPropsWithoutRef<"a">["target"];
  rel?: ComponentPropsWithoutRef<"a">["rel"];
};

export type GalleryProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style"
> & {
  label: string;
  items: GalleryItem[];
  columns?: GalleryColumns;
  gap?: GalleryGap;
  aspectRatio?: GalleryAspectRatio;
  fit?: GalleryFit;
  variant?: GalleryVariant;
  lightbox?: boolean;
  loop?: boolean;
  emptyMessage?: ReactNode;
  getOpenImageLabel?: (item: GalleryItem, index: number, total: number) => string;
  previousLabel?: string;
  nextLabel?: string;
  closeLabel?: string;
  style?: DesignSystemStyle;
};

export const Gallery = forwardRef<HTMLElement, GalleryProps>(function Gallery(
  {
    label,
    items,
    columns = 3,
    gap = "md",
    aspectRatio = "landscape",
    fit = "cover",
    variant = "plain",
    lightbox = false,
    loop = false,
    emptyMessage = "No images to display.",
    getOpenImageLabel,
    previousLabel = "Previous image",
    nextLabel = "Next image",
    closeLabel = "Close image preview",
    className,
    style,
    "aria-label": ariaLabel,
    ...sectionProps
  },
  ref,
) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const classes = [styles.gallery, className].filter(Boolean).join(" ");
  const activeIndex =
    selectedIndex === null || items.length === 0
      ? null
      : Math.min(selectedIndex, items.length - 1);
  const activeItem = activeIndex === null ? null : items[activeIndex] ?? null;

  const movePreview = (direction: -1 | 1) => {
    if (activeIndex === null || items.length < 2) return;
    const requestedIndex = activeIndex + direction;
    const nextIndex = loop
      ? (requestedIndex + items.length) % items.length
      : Math.max(0, Math.min(requestedIndex, items.length - 1));
    setSelectedIndex(nextIndex);
  };

  return (
    <section
      {...sectionProps}
      ref={ref}
      aria-label={ariaLabel ?? label}
      className={classes}
      data-variant={variant}
      style={style as CSSProperties | undefined}
    >
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <ul className={styles.grid} data-columns={columns} data-gap={gap}>
          {items.map((item, index) => {
            const image = (
              <img
                alt={item.alt}
                decoding="async"
                loading="lazy"
                src={item.src}
              />
            );

            return (
              <li className={styles.cell} key={item.id}>
                <figure className={styles.figure} data-variant={variant}>
                  {lightbox ? (
                    <button
                      aria-haspopup="dialog"
                      aria-label={
                        getOpenImageLabel?.(item, index, items.length) ??
                        `Open image ${index + 1}: ${item.alt || "image"}`
                      }
                      className={styles.imageTrigger}
                      onClick={() => setSelectedIndex(index)}
                      type="button"
                    >
                      <span
                        className={styles.media}
                        data-aspect-ratio={aspectRatio}
                        data-fit={fit}
                      >
                        {image}
                      </span>
                    </button>
                  ) : item.href ? (
                    <a
                      aria-label={item.linkLabel ?? (item.alt || `View image ${index + 1}`)}
                      className={styles.imageLink}
                      href={item.href}
                      rel={item.rel}
                      target={item.target}
                    >
                      <span
                        className={styles.media}
                        data-aspect-ratio={aspectRatio}
                        data-fit={fit}
                      >
                        {image}
                      </span>
                    </a>
                  ) : (
                    <span
                      className={styles.media}
                      data-aspect-ratio={aspectRatio}
                      data-fit={fit}
                    >
                      {image}
                    </span>
                  )}
                  {(item.caption != null || (lightbox && item.href)) && (
                    <figcaption className={styles.caption}>
                      {item.caption != null && (
                        <span className={styles.captionText}>{item.caption}</span>
                      )}
                      {lightbox && item.href && (
                        <a
                          className={styles.detailLink}
                          href={item.href}
                          rel={item.rel}
                          target={item.target}
                        >
                          {item.linkLabel ?? "View details"}
                        </a>
                      )}
                    </figcaption>
                  )}
                </figure>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        closeLabel={closeLabel}
        footer={
          activeIndex !== null && items.length > 1 ? (
            <div className={styles.previewControls}>
              <button
                aria-label={previousLabel}
                className={styles.controlButton}
                disabled={!loop && activeIndex === 0}
                onClick={() => movePreview(-1)}
                type="button"
              >
                <Icon className={styles.controlIcon} name="chevron-left" size="lg" />
              </button>
              <span aria-atomic="true" aria-live="polite" className={styles.previewCount}>
                {activeIndex + 1} of {items.length}
              </span>
              <button
                aria-label={nextLabel}
                className={styles.controlButton}
                disabled={!loop && activeIndex === items.length - 1}
                onClick={() => movePreview(1)}
                type="button"
              >
                <Icon className={styles.controlIcon} name="chevron-right" size="lg" />
              </button>
            </div>
          ) : undefined
        }
        heading={
          activeItem?.caption ??
          (activeIndex === null ? undefined : `Image ${activeIndex + 1} of ${items.length}`)
        }
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null);
        }}
        open={activeItem !== null}
        size="lg"
      >
        {activeItem && (
          <div className={styles.previewImage}>
            <img alt={activeItem.alt} src={activeItem.src} />
          </div>
        )}
      </Dialog>
    </section>
  );
});

Gallery.displayName = "Gallery";
