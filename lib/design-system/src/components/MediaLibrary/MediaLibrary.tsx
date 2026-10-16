import { forwardRef, useId, useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { EmptyState } from "../EmptyState/EmptyState";
import { Spinner } from "../Spinner/Spinner";
import styles from "./MediaLibrary.module.css";

export type MediaAsset = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  altText?: string;
  width?: number;
  height?: number;
  size?: number;
  updatedAt?: string | Date;
};

export type MediaTypeFilter = "all" | "image" | "video" | "audio" | "document" | "other";
export type MediaLibrarySelectionMode = "none" | "single" | "multiple";

export type MediaLibraryProps = {
  assets: readonly MediaAsset[];
  label?: string;
  selectionMode?: MediaLibrarySelectionMode;
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  onSelectionChange?: (ids: readonly string[], assets: readonly MediaAsset[]) => void;
  onConfirmSelection?: (assets: readonly MediaAsset[]) => void;
  confirmLabel?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  filterLabel?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  uploadLabel?: string;
  uploadHint?: string;
  accept?: string;
  multipleUploads?: boolean;
  onFilesSelected?: (files: File[]) => void;
  uploading?: boolean;
  uploadError?: string;
  disabled?: boolean;
  className?: string;
  style?: DesignSystemStyle;
};

function getMediaType(asset: MediaAsset): Exclude<MediaTypeFilter, "all"> {
  const type = asset.mimeType.toLocaleLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (
    type.includes("pdf") ||
    type.includes("document") ||
    type.includes("word") ||
    type.includes("sheet") ||
    type.includes("presentation") ||
    type.startsWith("text/")
  ) return "document";
  return "other";
}

function formatSize(bytes?: number): string | undefined {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string | Date): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export const MediaLibrary = forwardRef<HTMLElement, MediaLibraryProps>(function MediaLibrary(
  {
    assets,
    label = "Media library",
    selectionMode = "single",
    selectedIds,
    defaultSelectedIds = [],
    onSelectionChange,
    onConfirmSelection,
    confirmLabel = "Use selection",
    searchLabel = "Search media",
    searchPlaceholder = "Search by name or file type",
    filterLabel = "Media type",
    emptyMessage = "Your library is ready for its first asset.",
    noResultsMessage = "No assets match these filters.",
    uploadLabel = "Add media",
    uploadHint = "Choose files from your device",
    accept,
    multipleUploads = true,
    onFilesSelected,
    uploading = false,
    uploadError,
    disabled = false,
    className,
    style,
  },
  ref,
) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>("all");
  const [internalSelectedIds, setInternalSelectedIds] = useState<readonly string[]>(defaultSelectedIds);
  const providedSelectedIds = selectedIds ?? internalSelectedIds;
  const currentSelectedIds =
    selectionMode === "none"
      ? []
      : selectionMode === "single"
        ? providedSelectedIds.slice(0, 1)
        : providedSelectedIds;
  const selectedSet = useMemo(() => new Set(currentSelectedIds), [currentSelectedIds]);
  const selectedAssets = assets.filter((asset) => selectedSet.has(asset.id));
  const previewAsset = selectedAssets[0];
  const filteredAssets = assets.filter((asset) => {
    const matchesType = typeFilter === "all" || getMediaType(asset) === typeFilter;
    const text = `${asset.name} ${asset.mimeType} ${asset.altText ?? ""}`.toLocaleLowerCase();
    return matchesType && text.includes(query.trim().toLocaleLowerCase());
  });
  const selectionDisabled = disabled || selectionMode === "none";
  const classes = [styles.library, className].filter(Boolean).join(" ");

  const updateSelection = (nextIds: readonly string[]) => {
    if (selectedIds === undefined) setInternalSelectedIds(nextIds);
    const nextSet = new Set(nextIds);
    onSelectionChange?.(nextIds, assets.filter((asset) => nextSet.has(asset.id)));
  };

  const toggleAsset = (asset: MediaAsset) => {
    const isSelected = selectedSet.has(asset.id);
    if (selectionMode === "single") {
      updateSelection(isSelected ? [] : [asset.id]);
      return;
    }
    updateSelection(
      isSelected
        ? currentSelectedIds.filter((selectedId) => selectedId !== asset.id)
        : [...currentSelectedIds, asset.id],
    );
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    if (files.length > 0) onFilesSelected?.(files);
    event.currentTarget.value = "";
  };

  const selectedCountText = `${selectedAssets.length} ${selectedAssets.length === 1 ? "asset" : "assets"} selected`;

  return (
    <section
      ref={ref}
      aria-label={label}
      aria-busy={uploading || undefined}
      className={classes}
      data-selection-mode={selectionMode}
      style={style as CSSProperties | undefined}
    >
      <header className={styles.header}>
        <div>
          <h2 className={styles.heading}>{label}</h2>
            <p className={styles.subheading}>Browse your shared files and choose media for your content.</p>
        </div>
        {onFilesSelected && (
          <div className={styles.uploadControl}>
            <input
              accept={accept}
              aria-label={uploadLabel}
              aria-describedby={`${id}-upload-hint${uploadError ? ` ${id}-upload-error` : ""}`}
              className={styles.fileInput}
              disabled={disabled || uploading}
              id={`${id}-upload`}
              multiple={multipleUploads}
              onChange={handleFiles}
              type="file"
            />
            <label className={styles.uploadButton} htmlFor={`${id}-upload`}>
              {uploading ? (
                <Spinner decorative size="sm" />
              ) : (
                <span aria-hidden="true" className={styles.uploadMark}>+</span>
              )}
              {uploading ? "Adding files…" : uploadLabel}
            </label>
            <span className={styles.uploadHint} id={`${id}-upload-hint`}>
              {uploading ? "Upload in progress" : uploadHint}
            </span>
          </div>
        )}
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <label className={styles.controlLabel} htmlFor={`${id}-search`}>{searchLabel}</label>
          <input
            className={styles.searchInput}
            disabled={disabled}
            id={`${id}-search`}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={query}
          />
        </div>
        <div className={styles.filterWrap}>
          <label className={styles.controlLabel} htmlFor={`${id}-filter`}>{filterLabel}</label>
          <select
            className={styles.filterSelect}
            disabled={disabled}
            id={`${id}-filter`}
            onChange={(event) => setTypeFilter(event.currentTarget.value as MediaTypeFilter)}
            value={typeFilter}
          >
            <option value="all">All media</option>
            <option value="image">Images</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
            <option value="other">Other files</option>
          </select>
        </div>
        <span aria-live="polite" className={styles.selectionStatus} role="status">{selectedCountText}</span>
      </div>

      <div className={styles.workspace}>
        <div className={styles.browsePane}>
          {assets.length === 0 ? (
            <EmptyState
              className={styles.emptyState}
              description={(
                <>
                  {emptyMessage}
                  {onFilesSelected && (
                    <span className={styles.emptyTip}>
                      Start by adding an image, document, or clip.
                    </span>
                  )}
                </>
              )}
              headingLevel={3}
              icon={<span className={styles.emptySymbol}>＋</span>}
              title="No media yet"
            />
          ) : filteredAssets.length === 0 ? (
            <EmptyState
              actions={(
                <button
                  className={styles.resetButton}
                  onClick={() => { setQuery(""); setTypeFilter("all"); }}
                  type="button"
                >
                  Clear filters
                </button>
              )}
              className={styles.emptyState}
              description={noResultsMessage}
              headingLevel={3}
              icon={<span className={styles.emptySymbol}>⌕</span>}
              role="status"
              title="Nothing found"
            />
          ) : (
            <ul aria-label="Available media" className={styles.assetGrid}>
              {filteredAssets.map((asset) => {
                const selected = selectedSet.has(asset.id);
                const mediaType = getMediaType(asset);
                const dimensions = asset.width && asset.height ? `${asset.width} × ${asset.height}` : undefined;
                return (
                  <li className={styles.assetCell} key={asset.id}>
                    <button
                      aria-pressed={selected}
                      className={styles.assetButton}
                      disabled={selectionDisabled}
                      onClick={() => toggleAsset(asset)}
                      type="button"
                    >
                      <span className={styles.assetVisual} data-kind={mediaType}>
                        {mediaType === "image" ? (
                          <img alt={asset.altText ?? asset.name} loading="lazy" src={asset.url} />
                        ) : (
                          <span aria-hidden="true" className={styles.fileType}>{mediaType === "document" ? "DOC" : mediaType.toUpperCase()}</span>
                        )}
                        <span aria-hidden="true" className={styles.selectionIndicator}>{selected ? "✓" : ""}</span>
                      </span>
                      <span className={styles.assetInfo}>
                        <span className={styles.assetName}>{asset.name}</span>
                        <span className={styles.assetMeta}>{dimensions ?? asset.mimeType}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside aria-label={`${label} selected media details`} className={styles.detailPane}>
          <div className={styles.detailEyebrow}>Selection</div>
          {previewAsset ? (
            <>
              <div className={styles.preview}>
                {getMediaType(previewAsset) === "image" ? (
                  <img alt={previewAsset.altText ?? previewAsset.name} src={previewAsset.url} />
                ) : (
                  <span aria-hidden="true" className={styles.previewFile}>{getMediaType(previewAsset).toUpperCase()}</span>
                )}
              </div>
              <h3 className={styles.detailName}>{previewAsset.name}</h3>
              <dl className={styles.metadata}>
                <div><dt>File type</dt><dd>{previewAsset.mimeType}</dd></div>
                {(previewAsset.width && previewAsset.height) && <div><dt>Dimensions</dt><dd>{previewAsset.width} × {previewAsset.height}px</dd></div>}
                {formatSize(previewAsset.size) && <div><dt>File size</dt><dd>{formatSize(previewAsset.size)}</dd></div>}
                {formatDate(previewAsset.updatedAt) && <div><dt>Updated</dt><dd>{formatDate(previewAsset.updatedAt)}</dd></div>}
              </dl>
              {previewAsset.altText && <p className={styles.altText}><span>Alt text</span>{previewAsset.altText}</p>}
              {selectedAssets.length > 1 && <p className={styles.moreSelected}>+ {selectedAssets.length - 1} more selected</p>}
            </>
          ) : (
            <div className={styles.noSelection}>
              <span aria-hidden="true" className={styles.selectionOutline}>□</span>
              <p>Choose an asset to see its details.</p>
            </div>
          )}
          {onConfirmSelection && selectionMode !== "none" && (
            <button
              className={styles.confirmButton}
              disabled={disabled || selectedAssets.length === 0}
              onClick={() => onConfirmSelection(selectedAssets)}
              type="button"
            >
              {confirmLabel}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </aside>
      </div>
      {uploadError && (
        <p className={styles.uploadError} id={`${id}-upload-error`} role="alert">{uploadError}</p>
      )}
    </section>
  );
});

MediaLibrary.displayName = "MediaLibrary";
