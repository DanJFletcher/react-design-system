import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Icon } from "../Icon/Icon";
import styles from "./Pagination.module.css";

export type PaginationPageLabel = (page: number) => string;
export type PaginationSummaryLabel = (
  currentPage: number,
  totalPages: number,
) => string;

type PaginationBaseProps = Omit<
  ComponentPropsWithRef<"nav">,
  "children" | "style"
> & {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
  boundaryCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: PaginationPageLabel;
  pageSummaryLabel?: PaginationSummaryLabel;
  style?: DesignSystemStyle;
};

export type PaginationProps = PaginationBaseProps &
  (
    | {
        onPageChange: (page: number) => void;
        getPageHref?: never;
      }
    | {
        getPageHref: (page: number) => string;
        onPageChange?: never;
      }
  );

type PageRangeItem =
  | { kind: "page"; value: number }
  | { kind: "ellipsis"; key: string };

function assertInteger(name: string, value: number, minimum: number) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(
      `Pagination ${name} must be a safe integer greater than or equal to ${minimum}.`,
    );
  }
}

function createPageRange(
  totalPages: number,
  currentPage: number,
  siblingCount: number,
  boundaryCount: number,
): PageRangeItem[] {
  const visiblePages = new Set<number>();
  const addRange = (start: number, end: number) => {
    for (let page = Math.max(1, start); page <= Math.min(totalPages, end); page += 1) {
      visiblePages.add(page);
    }
  };

  addRange(1, boundaryCount);
  addRange(currentPage - siblingCount, currentPage + siblingCount);
  addRange(totalPages - boundaryCount + 1, totalPages);

  const pages = [...visiblePages].sort((left, right) => left - right);
  const range: PageRangeItem[] = [];

  pages.forEach((page, index) => {
    const previousPage = pages[index - 1];
    if (previousPage !== undefined) {
      const missingCount = page - previousPage - 1;
      if (missingCount === 1) {
        range.push({ kind: "page", value: previousPage + 1 });
      } else if (missingCount > 1) {
        range.push({
          kind: "ellipsis",
          key: `${previousPage}-${page}`,
        });
      }
    }
    range.push({ kind: "page", value: page });
  });

  return range;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      currentPage,
      totalPages,
      siblingCount = 1,
      boundaryCount = 1,
      previousLabel = "Previous page",
      nextLabel = "Next page",
      pageLabel,
      pageSummaryLabel,
      onPageChange,
      getPageHref,
      className,
      style,
      "aria-label": ariaLabel = "Pagination",
      ...navProps
    },
    ref,
  ) {
    assertInteger("totalPages", totalPages, 1);
    assertInteger("currentPage", currentPage, 1);
    assertInteger("siblingCount", siblingCount, 0);
    assertInteger("boundaryCount", boundaryCount, 0);

    if (currentPage > totalPages) {
      throw new RangeError(
        "Pagination currentPage must be less than or equal to totalPages.",
      );
    }

    const hasPageHref = typeof getPageHref === "function";
    const hasPageChange = typeof onPageChange === "function";
    if (hasPageHref === hasPageChange) {
      throw new Error(
        "Pagination requires exactly one of getPageHref or onPageChange.",
      );
    }

    if (totalPages === 1) return null;

    const pageRange = createPageRange(
      totalPages,
      currentPage,
      siblingCount,
      boundaryCount,
    );
    const componentClassName = [styles.pagination, className]
      .filter(Boolean)
      .join(" ");
    const getAccessiblePageLabel =
      pageLabel ?? ((page: number) => `Page ${page}`);
    const summary =
      pageSummaryLabel?.(currentPage, totalPages) ??
      `Page ${currentPage} of ${totalPages}`;

    const renderPage = (page: number) => {
      if (page === currentPage) {
        return (
          <span aria-current="page" className={`${styles.control} ${styles.currentPage}`}>
            {page}
          </span>
        );
      }

      if (getPageHref) {
        return (
          <a
            aria-label={getAccessiblePageLabel(page)}
            className={styles.control}
            href={getPageHref(page)}
          >
            {page}
          </a>
        );
      }

      return (
        <button
          aria-label={getAccessiblePageLabel(page)}
          className={styles.control}
          onClick={() => onPageChange?.(page)}
          type="button"
        >
          {page}
        </button>
      );
    };

    const renderPrevious = () => {
      const content = (
        <>
          <Icon className={styles.previousIcon} name="arrow-left" size="sm" />
          <span>{previousLabel}</span>
        </>
      );

      if (currentPage === 1) {
        return getPageHref ? (
          <span aria-disabled="true" className={`${styles.control} ${styles.disabledControl}`}>
            {content}
          </span>
        ) : (
          <button
            aria-label={previousLabel}
            className={`${styles.control} ${styles.disabledControl}`}
            disabled
            type="button"
          >
            {content}
          </button>
        );
      }

      return getPageHref ? (
        <a
          aria-label={previousLabel}
          className={styles.control}
          href={getPageHref(currentPage - 1)}
        >
          {content}
        </a>
      ) : (
        <button
          aria-label={previousLabel}
          className={styles.control}
          onClick={() => onPageChange?.(currentPage - 1)}
          type="button"
        >
          {content}
        </button>
      );
    };

    const renderNext = () => {
      const content = (
        <>
          <span>{nextLabel}</span>
          <Icon className={styles.nextIcon} name="arrow-right" size="sm" />
        </>
      );

      if (currentPage === totalPages) {
        return getPageHref ? (
          <span aria-disabled="true" className={`${styles.control} ${styles.disabledControl}`}>
            {content}
          </span>
        ) : (
          <button
            aria-label={nextLabel}
            className={`${styles.control} ${styles.disabledControl}`}
            disabled
            type="button"
          >
            {content}
          </button>
        );
      }

      return getPageHref ? (
        <a
          aria-label={nextLabel}
          className={styles.control}
          href={getPageHref(currentPage + 1)}
        >
          {content}
        </a>
      ) : (
        <button
          aria-label={nextLabel}
          className={styles.control}
          onClick={() => onPageChange?.(currentPage + 1)}
          type="button"
        >
          {content}
        </button>
      );
    };

    return (
      <nav
        {...navProps}
        aria-label={ariaLabel}
        className={componentClassName}
        ref={ref}
        style={style as CSSProperties | undefined}
      >
        <div className={styles.controls}>
          {renderPrevious()}
          <ol className={styles.pageList}>
            {pageRange.map((item) =>
              item.kind === "page" ? (
                <li key={item.value}>{renderPage(item.value)}</li>
              ) : (
                <li aria-hidden="true" className={styles.ellipsis} key={item.key}>
                  …
                </li>
              ),
            )}
          </ol>
          <span className={styles.mobileSummary}>{summary}</span>
          {renderNext()}
        </div>
      </nav>
    );
  },
);

Pagination.displayName = "Pagination";
