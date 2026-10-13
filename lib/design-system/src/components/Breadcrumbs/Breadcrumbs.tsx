import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Breadcrumbs.module.css";

export interface BreadcrumbsLinkItem {
  /** Visible label for a parent page. */
  label: string;
  /** Consumer-provided destination; the component does not own routing. */
  href: string;
}

export interface BreadcrumbsCurrentItem {
  /** Visible label for the current page. */
  label: string;
  current: true;
  href?: never;
}

export type BreadcrumbsItem = BreadcrumbsLinkItem | BreadcrumbsCurrentItem;

export type BreadcrumbsProps = Omit<
  ComponentPropsWithRef<"nav">,
  "children" | "style"
> & {
  /** Ordered parent links followed by the current page. */
  items: readonly BreadcrumbsItem[];
  style?: DesignSystemStyle;
};

function validateItems(items: readonly BreadcrumbsItem[]) {
  if (items.length === 0) {
    throw new RangeError("Breadcrumbs requires at least one item.");
  }

  items.forEach((item, index) => {
    if (!item.label.trim()) {
      throw new Error("Breadcrumbs item labels must not be empty.");
    }

    const isCurrent = "current" in item && item.current === true;
    if (index === items.length - 1) {
      if (!isCurrent) {
        throw new Error("Breadcrumbs requires the last item to mark the current page.");
      }
    } else if (
      isCurrent ||
      !("href" in item) ||
      typeof item.href !== "string" ||
      !item.href.trim()
    ) {
      throw new Error(
        "Breadcrumbs parent items must have a destination and cannot be current.",
      );
    }
  });
}

/**
 * A theme-aware breadcrumb trail made from consumer-provided native links.
 * The final item identifies the current page; the consumer owns all destinations.
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(
    {
      items,
      className,
      style,
      "aria-label": ariaLabel = "Breadcrumb",
      ...navProps
    },
    ref,
  ) {
    validateItems(items);

    return (
      <nav
        {...navProps}
        ref={ref}
        aria-label={ariaLabel}
        className={[styles.breadcrumbs, className].filter(Boolean).join(" ")}
        style={style as CSSProperties | undefined}
      >
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1;

            return (
              <li className={styles.item} key={`${item.label}-${index}`}>
                {isCurrent ? (
                  <span aria-current="page" className={styles.current}>
                    {item.label}
                  </span>
                ) : (
                  <a className={styles.link} href={item.href}>
                    {item.label}
                  </a>
                )}
                {!isCurrent && (
                  <span aria-hidden="true" className={styles.separator}>
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

Breadcrumbs.displayName = "Breadcrumbs";
