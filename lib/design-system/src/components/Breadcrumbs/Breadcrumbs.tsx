import {
  Fragment,
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  useCallback,
  useId,
  useState,
  useSyncExternalStore,
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
  /**
   * Viewport width at or below which intermediate links collapse (for example,
   * "40rem" or "640px"). Defaults to 40rem. Omit to use the default CSS breakpoint.
   */
  collapseAt?: string;
  style?: DesignSystemStyle;
};

function subscribeToBreakpoint(query: string, onChange: () => void) {
  if (!query || typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getBreakpointSnapshot(query: string) {
  return Boolean(
    query &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia(query).matches,
  );
}

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
      collapseAt,
      className,
      style,
      "aria-label": ariaLabel = "Breadcrumb",
      ...navProps
    },
    ref,
  ) {
    validateItems(items);
    const breakpointQuery = collapseAt ? `(max-width: ${collapseAt})` : "";
    const subscribe = useCallback(
      (onChange: () => void) => subscribeToBreakpoint(breakpointQuery, onChange),
      [breakpointQuery],
    );
    const getSnapshot = useCallback(
      () => getBreakpointSnapshot(breakpointQuery),
      [breakpointQuery],
    );
    const breakpointActive = useSyncExternalStore(
      subscribe,
      getSnapshot,
      () => false,
    );
    const [expanded, setExpanded] = useState(false);
    const listId = useId();
    const hiddenLevelCount = Math.max(items.length - 2, 0);
    const hasIntermediateItems = hiddenLevelCount > 0;

    return (
      <nav
        {...navProps}
        ref={ref}
        aria-label={ariaLabel}
        className={[styles.breadcrumbs, className].filter(Boolean).join(" ")}
        style={style as CSSProperties | undefined}
      >
        <ol
          className={[
            styles.list,
            collapseAt ? styles.responsiveCollapse : styles.defaultCollapse,
            expanded && styles.expanded,
          ]
            .filter(Boolean)
            .join(" ")}
          data-collapse-active={collapseAt ? breakpointActive : undefined}
          id={listId}
        >
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1;
            const isIntermediate = index > 0 && !isCurrent;

            return (
              <Fragment key={`${item.label}-${index}`}>
                {isCurrent && hasIntermediateItems && (
                  <li className={[styles.item, styles.collapseControl].join(" ")}>
                    <button
                      aria-controls={listId}
                      aria-expanded={expanded}
                      aria-label={
                        expanded
                          ? "Hide intermediate breadcrumb levels"
                          : `Show ${hiddenLevelCount} hidden breadcrumb ${
                              hiddenLevelCount === 1 ? "level" : "levels"
                            }`
                      }
                      className={styles.collapseButton}
                      onClick={() => setExpanded((isExpanded) => !isExpanded)}
                      type="button"
                    >
                      …
                    </button>
                    <span aria-hidden="true" className={styles.separator}>
                      /
                    </span>
                  </li>
                )}
                <li
                  className={styles.item}
                  data-intermediate={isIntermediate || undefined}
                >
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
              </Fragment>
            );
          })}
        </ol>
      </nav>
    );
  },
);

Breadcrumbs.displayName = "Breadcrumbs";
