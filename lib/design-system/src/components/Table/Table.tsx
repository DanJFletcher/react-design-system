import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { EmptyState } from "../EmptyState/EmptyState";
import { Search } from "../Search/Search";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Table.module.css";

export type TableRowKey = string | number;
export type TableDensity = "compact" | "comfortable";
export type TableSortDirection = "asc" | "desc";
export type TableSelectionMode = "none" | "single" | "multiple";

export type TableSort = {
  columnId: string;
  direction: TableSortDirection;
};

export type TableCellContext<T extends object> = {
  row: T;
  rowIndex: number;
  column: TableColumn<T>;
  value: unknown;
};

export type TableColumn<T extends object> = {
  id: string;
  header: ReactNode;
  accessor?: keyof T | ((row: T) => unknown);
  cell?: (context: TableCellContext<T>) => ReactNode;
  sortable?: boolean;
  sortLabel?: string;
  sortValue?: (row: T) => unknown;
  compare?: (left: T, right: T) => number;
  align?: "start" | "center" | "end";
  width?: CSSProperties["width"];
  minWidth?: CSSProperties["minWidth"];
  maxWidth?: CSSProperties["maxWidth"];
  hidden?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  footer?: ReactNode | ((rows: readonly T[]) => ReactNode);
};

type TableNameProps =
  | {
      caption: ReactNode;
      captionHidden?: boolean;
      "aria-label"?: string;
    }
  | {
      caption?: never;
      captionHidden?: never;
      "aria-label": string;
    };

export type TableProps<T extends object> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "style" | "aria-label"
> &
  TableNameProps & {
    data: readonly T[];
    columns: readonly TableColumn<T>[];
    tableId?: string;
    getRowKey?: (row: T, rowIndex: number) => TableRowKey;
    rowClassName?: (row: T, rowIndex: number) => string | undefined;
    density?: TableDensity;
    striped?: boolean;
    bordered?: boolean;
    hoverable?: boolean;
    stickyHeader?: boolean;
    tableLayout?: "auto" | "fixed";
    minTableWidth?: CSSProperties["minWidth"];
    maxHeight?: CSSProperties["maxHeight"];
    captionSide?: "top" | "bottom";
    emptyState?: ReactNode;
    noResultsState?: ReactNode;
    loading?: boolean;
    loadingMessage?: ReactNode;
    searchable?: boolean;
    searchValue?: string;
    defaultSearchValue?: string;
    onSearchChange?: (query: string) => void;
    searchLabel?: string;
    searchPlaceholder?: string;
    showSearchLabel?: boolean;
    searchableColumns?: readonly string[];
    searchFunction?: (row: T, query: string) => boolean;
    sort?: TableSort | null;
    defaultSort?: TableSort;
    sortMode?: "client" | "manual";
    onSortChange?: (sort: TableSort | null) => void;
    selectionMode?: TableSelectionMode;
    selectedRowKeys?: readonly TableRowKey[];
    defaultSelectedRowKeys?: readonly TableRowKey[];
    onSelectionChange?: (
      selectedRowKeys: readonly TableRowKey[],
      selectedRows: readonly T[],
    ) => void;
    isRowSelectable?: (row: T, rowIndex: number) => boolean;
    selectAllLabel?: string;
    selectRowLabel?: (row: T, rowIndex: number) => string;
    style?: DesignSystemStyle;
    tableClassName?: string;
    tableStyle?: CSSProperties;
    viewportClassName?: string;
  };

type RowRecord<T extends object> = {
  row: T;
  rowIndex: number;
  key: TableRowKey;
};

function getCellValue<T extends object>(
  row: T,
  column: TableColumn<T>,
): unknown {
  if (typeof column.accessor === "function") return column.accessor(row);
  if (column.accessor !== undefined) {
    return (row as Record<PropertyKey, unknown>)[column.accessor];
  }
  return (row as Record<string, unknown>)[column.id];
}

function compareValues(left: unknown, right: unknown): number {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right);
  }
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function searchableText(value: unknown, seen = new WeakSet<object>()): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value !== "object") return String(value);
  if (seen.has(value)) return "";
  seen.add(value);
  const values = Array.isArray(value)
    ? value
    : Object.values(value as Record<string, unknown>);
  return values.map((item) => searchableText(item, seen)).join(" ");
}

function toCssLength(value: CSSProperties["maxHeight"]): CSSProperties["maxHeight"] {
  return typeof value === "number" ? `${value}px` : value;
}

/** @internal */
export function compareTableSortValues(leftValue: unknown, rightValue: unknown): number {
  if (leftValue == null && rightValue == null) return 0;
  if (leftValue == null) return 1;
  if (rightValue == null) return -1;
  return compareValues(leftValue, rightValue);
}

export function Table<T extends object>({
  data,
  columns,
  tableId,
  getRowKey,
  rowClassName,
  density = "comfortable",
  striped = false,
  bordered = false,
  hoverable = false,
  stickyHeader = false,
  tableLayout = "auto",
  minTableWidth,
  maxHeight,
  caption,
  captionHidden = false,
  captionSide = "top",
  emptyState,
  noResultsState = "No matching rows found.",
  loading = false,
  loadingMessage = "Loading rows…",
  searchable = false,
  searchValue,
  defaultSearchValue = "",
  onSearchChange,
  searchLabel = "Search table",
  searchPlaceholder = "Search rows",
  showSearchLabel = false,
  searchableColumns,
  searchFunction,
  sort,
  defaultSort,
  sortMode = "client",
  onSortChange,
  selectionMode = "none",
  selectedRowKeys,
  defaultSelectedRowKeys = [],
  onSelectionChange,
  isRowSelectable,
  selectAllLabel = "Select all rows",
  selectRowLabel,
  "aria-label": ariaLabel,
  className,
  style,
  tableClassName,
  tableStyle,
  viewportClassName,
  ...viewportProps
}: TableProps<T>) {
  const generatedId = useId();
  const [uncontrolledSort, setUncontrolledSort] = useState<TableSort | null>(
    defaultSort ?? null,
  );
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] = useState<
    readonly TableRowKey[]
  >(defaultSelectedRowKeys);
  const [uncontrolledSearchValue, setUncontrolledSearchValue] =
    useState(defaultSearchValue);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const controlledSort = sort !== undefined;
  const currentSort = controlledSort ? sort : uncontrolledSort;
  const controlledSelection = selectedRowKeys !== undefined;
  const currentSelectedKeys = selectedRowKeys ?? uncontrolledSelectedKeys;
  const currentSearchValue = searchValue ?? uncontrolledSearchValue;
  const trimmedSearchQuery = currentSearchValue.trim();
  const normalizedSearchQuery = trimmedSearchQuery.toLocaleLowerCase();
  const selectedKeySet = new Set(currentSelectedKeys);
  const selectionName = `${generatedId}-selection`;
  const visibleColumns = columns.filter((column) => !column.hidden);
  const selectionEnabled = selectionMode !== "none";
  const columnIds = new Set<string>();

  for (const column of columns) {
    if (!column.id.trim()) {
      throw new Error("Table column ids must be non-empty.");
    }
    if (columnIds.has(column.id)) {
      throw new Error(`Table column ids must be unique (duplicate "${column.id}").`);
    }
    columnIds.add(column.id);
  }
  const searchableColumnIds = searchableColumns
    ? new Set(searchableColumns)
    : undefined;
  const invalidSearchColumn = searchableColumns?.find(
    (columnId) => !columnIds.has(columnId),
  );
  if (invalidSearchColumn) {
    throw new Error(
      `Table searchableColumns references an unknown column "${invalidSearchColumn}".`,
    );
  }
  if (visibleColumns.length === 0) {
    throw new Error("Table requires at least one visible column.");
  }

  const rows: RowRecord<T>[] = data.map((row, rowIndex) => ({
    row,
    rowIndex,
    key: getRowKey?.(row, rowIndex) ?? rowIndex,
  }));
  const rowKeys = new Set<TableRowKey>();
  for (const row of rows) {
    if (rowKeys.has(row.key)) {
      throw new Error(`Table row keys must be unique (duplicate "${row.key}").`);
    }
    rowKeys.add(row.key);
  }
  const searchColumns = searchableColumns
    ? columns.filter((column) => searchableColumnIds?.has(column.id))
    : visibleColumns;
  const filteredRows =
    searchable && normalizedSearchQuery
      ? rows.filter(({ row }) =>
          searchFunction
            ? searchFunction(row, trimmedSearchQuery)
            : searchColumns.some((column) =>
                searchableText(getCellValue(row, column))
                  .toLocaleLowerCase()
                  .includes(normalizedSearchQuery),
              ),
        )
      : rows;
  const activeSortColumn = visibleColumns.find(
    (column) => column.id === currentSort?.columnId && column.sortable,
  );
  const displayedRows =
    sortMode === "client" && currentSort && activeSortColumn
      ? [...filteredRows].sort((left, right) => {
          const direction = currentSort.direction === "asc" ? 1 : -1;
          let result: number;
          if (activeSortColumn.compare) {
            result = activeSortColumn.compare(left.row, right.row);
          } else {
            const leftValue = activeSortColumn.sortValue
              ? activeSortColumn.sortValue(left.row)
              : getCellValue(left.row, activeSortColumn);
            const rightValue = activeSortColumn.sortValue
              ? activeSortColumn.sortValue(right.row)
              : getCellValue(right.row, activeSortColumn);
            result = compareTableSortValues(leftValue, rightValue);
          }
          if (!Number.isFinite(result) || result === 0) {
            return left.rowIndex - right.rowIndex;
          }
          return Math.sign(result) * direction;
        })
      : filteredRows;

  const selectableRows =
    selectionMode === "multiple"
      ? displayedRows.filter(
          ({ row, rowIndex }) => isRowSelectable?.(row, rowIndex) ?? true,
        )
      : [];
  const selectedVisibleCount = selectableRows.filter(({ key }) =>
    selectedKeySet.has(key),
  ).length;
  const allSelectableRowsSelected =
    selectableRows.length > 0 && selectedVisibleCount === selectableRows.length;
  const someSelectableRowsSelected =
    selectedVisibleCount > 0 && !allSelectableRowsSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelectableRowsSelected;
    }
  }, [someSelectableRowsSelected]);

  const updateSelection = (nextKeys: readonly TableRowKey[]) => {
    if (!controlledSelection) setUncontrolledSelectedKeys(nextKeys);
    const nextKeySet = new Set(nextKeys);
    const nextRows = rows
      .filter(({ key }) => nextKeySet.has(key))
      .map(({ row }) => row);
    onSelectionChange?.(nextKeys, nextRows);
  };

  const updateSort = (column: TableColumn<T>) => {
    const nextSort: TableSort | null =
      currentSort?.columnId !== column.id
        ? { columnId: column.id, direction: "asc" }
        : currentSort.direction === "asc"
          ? { columnId: column.id, direction: "desc" }
          : null;
    if (!controlledSort) setUncontrolledSort(nextSort);
    onSortChange?.(nextSort);
  };

  const viewportStyle: CSSProperties = {
    ...(maxHeight !== undefined ? { maxBlockSize: toCssLength(maxHeight) } : {}),
  };
  const rowSpan = visibleColumns.length + Number(selectionEnabled);
  const hasFooter = visibleColumns.some((column) => column.footer !== undefined);

  return (
    <div
      className={styles.container}
      style={style as CSSProperties | undefined}
    >
      {searchable && (
        <div className={styles.searchRow}>
          <Search
            label={searchLabel}
            onSubmit={(event) => event.preventDefault()}
            onValueChange={(query) => {
              if (searchValue === undefined) setUncontrolledSearchValue(query);
              onSearchChange?.(query);
            }}
            placeholder={searchPlaceholder}
            queryName="tableSearch"
            showLabel={showSearchLabel}
            showSubmitButton={false}
            size="md"
            value={currentSearchValue}
          />
          {normalizedSearchQuery && (
            <div className={styles.searchStatus} role="status">
              {displayedRows.length}{" "}
              {displayedRows.length === 1 ? "result" : "results"} for “
              {trimmedSearchQuery}”
            </div>
          )}
        </div>
      )}
      <div
        {...viewportProps}
        className={[styles.viewport, className, viewportClassName]
          .filter(Boolean)
          .join(" ")}
        style={viewportStyle}
      >
        {loading && (
          <div className={styles.loadingMessage} role="status">
            <Spinner decorative size="sm" />
            <div>{loadingMessage}</div>
          </div>
        )}
        <table
          id={tableId}
          aria-label={ariaLabel}
          aria-busy={loading || undefined}
          className={[styles.table, tableClassName].filter(Boolean).join(" ")}
          data-bordered={bordered}
          data-density={density}
          data-hoverable={hoverable}
          data-sticky-header={stickyHeader}
          data-striped={striped}
          data-table-layout={tableLayout}
          style={{
            ...tableStyle,
            ...(minTableWidth !== undefined ? { minWidth: minTableWidth } : {}),
          }}
        >
          {caption != null && (
            <caption
              className={captionHidden ? styles.visuallyHidden : undefined}
              data-side={captionSide}
            >
              {caption}
            </caption>
          )}
          <thead>
            <tr>
              {selectionEnabled && (
                <th className={styles.selectionHeader} scope="col">
                  {selectionMode === "multiple" && (
                    <input
                      ref={selectAllRef}
                      aria-label={selectAllLabel}
                      checked={allSelectableRowsSelected}
                      className={styles.selectionControl}
                      disabled={selectableRows.length === 0}
                      onChange={(event) => {
                        const visibleKeys = selectableRows.map(({ key }) => key);
                        if (event.currentTarget.checked) {
                          updateSelection([
                            ...currentSelectedKeys,
                            ...visibleKeys.filter((key) => !selectedKeySet.has(key)),
                          ]);
                        } else {
                          updateSelection(
                            currentSelectedKeys.filter(
                              (key) => !visibleKeys.includes(key),
                            ),
                          );
                        }
                      }}
                      type="checkbox"
                    />
                  )}
                </th>
              )}
              {visibleColumns.map((column) => {
                const isSorted = currentSort?.columnId === column.id;
                const ariaSort = isSorted
                  ? currentSort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined;
                const headerStyle: CSSProperties = {
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                  textAlign:
                    column.align === "start"
                      ? "left"
                      : column.align === "end"
                        ? "right"
                        : column.align,
                };
                return (
                  <th
                    key={column.id}
                    aria-sort={ariaSort}
                    className={[styles.headerCell, column.headerClassName]
                      .filter(Boolean)
                      .join(" ")}
                    scope="col"
                    style={headerStyle}
                  >
                    {column.sortable ? (
                      <button
                        aria-label={column.sortLabel}
                        className={styles.sortButton}
                        onClick={() => updateSort(column)}
                        type="button"
                      >
                        <span>{column.header}</span>
                        <span aria-hidden="true" className={styles.sortIndicator}>
                          {isSorted
                            ? currentSort.direction === "asc"
                              ? "↑"
                              : "↓"
                            : "↕"}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayedRows.length === 0 ? (
              <tr>
                <td className={styles.emptyCell} colSpan={rowSpan}>
                  {loading
                    ? loadingMessage
                    : searchable && normalizedSearchQuery
                      ? noResultsState
                      : emptyState !== undefined
                        ? emptyState
                        : <EmptyState headingLevel={3} title="No rows to display." />}
                </td>
              </tr>
            ) : (
              displayedRows.map(({ row, rowIndex, key }) => {
                const selected = selectedKeySet.has(key);
                const selectable = isRowSelectable?.(row, rowIndex) ?? true;
                return (
                  <tr
                    key={key}
                    aria-selected={selectionEnabled ? selected : undefined}
                    className={rowClassName?.(row, rowIndex)}
                    data-selected={selected || undefined}
                  >
                    {selectionEnabled && (
                      <td className={styles.selectionCell}>
                        <input
                          aria-label={
                            selectRowLabel?.(row, rowIndex) ??
                            `Select row ${rowIndex + 1}`
                          }
                          checked={selected}
                          className={styles.selectionControl}
                          disabled={!selectable}
                          name={selectionMode === "single" ? selectionName : undefined}
                          onChange={() => {
                            if (selectionMode === "single") {
                              updateSelection([key]);
                            } else if (selected) {
                              updateSelection(
                                currentSelectedKeys.filter((selectedKey) => selectedKey !== key),
                              );
                            } else {
                              updateSelection([...currentSelectedKeys, key]);
                            }
                          }}
                          type={selectionMode === "single" ? "radio" : "checkbox"}
                        />
                      </td>
                    )}
                    {visibleColumns.map((column) => {
                      const value = getCellValue(row, column);
                      const cellStyle: CSSProperties = {
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                        textAlign:
                          column.align === "start"
                            ? "left"
                            : column.align === "end"
                              ? "right"
                              : column.align,
                      };
                      return (
                        <td
                          key={column.id}
                          className={[styles.bodyCell, column.cellClassName]
                            .filter(Boolean)
                            .join(" ")}
                          style={cellStyle}
                        >
                          {column.cell
                            ? column.cell({ row, rowIndex, column, value })
                            : value == null
                              ? null
                              : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
          {hasFooter && (
            <tfoot>
              <tr>
                {selectionEnabled && <td className={styles.selectionCell} />}
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className={[styles.bodyCell, column.cellClassName]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      textAlign:
                        column.align === "start"
                          ? "left"
                          : column.align === "end"
                            ? "right"
                            : column.align,
                    }}
                  >
                    {typeof column.footer === "function"
                      ? column.footer(displayedRows.map(({ row }) => row))
                      : column.footer}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

Table.displayName = "Table";
