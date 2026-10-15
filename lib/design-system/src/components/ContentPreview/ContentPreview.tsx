import { useId, useState, type ComponentPropsWithoutRef, type CSSProperties } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./ContentPreview.module.css";

export type ContentPreviewViewport = {
  id: string;
  label: string;
  width: number | "full";
};

type ContentPreviewSource =
  | { src: string; srcDoc?: never }
  | { src?: never; srcDoc: string };

type ContentPreviewBaseProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "children" | "style" | "title"
> & {
  heading?: string;
  description?: string;
  frameTitle?: string;
  viewport?: string;
  defaultViewport?: string;
  onViewportChange?: (viewportId: string) => void;
  viewports?: readonly ContentPreviewViewport[];
  frameHeight?: number;
  loading?: "eager" | "lazy";
  sandbox?: string;
  className?: string;
  style?: DesignSystemStyle;
};

export type ContentPreviewProps = ContentPreviewBaseProps & ContentPreviewSource;

export const DEFAULT_CONTENT_PREVIEW_VIEWPORTS: readonly ContentPreviewViewport[] = [
  { id: "desktop", label: "Desktop", width: 1280 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "mobile", label: "Mobile", width: 390 },
];

function formatViewportWidth(width: ContentPreviewViewport["width"]): string {
  return width === "full" ? "full available width" : `${width} px wide`;
}

export function ContentPreview({
  src,
  srcDoc,
  heading = "Page preview",
  description,
  frameTitle = "Page preview",
  viewport,
  defaultViewport = "desktop",
  onViewportChange,
  viewports = DEFAULT_CONTENT_PREVIEW_VIEWPORTS,
  frameHeight = 640,
  loading = "eager",
  sandbox = "",
  className,
  style,
  ...sectionProps
}: ContentPreviewProps) {
  const id = useId();
  const [internalViewport, setInternalViewport] = useState(defaultViewport);
  const activeViewportId = viewport ?? internalViewport;

  if (viewports.length === 0) {
    throw new Error("ContentPreview requires at least one viewport option.");
  }

  const activeViewport =
    viewports.find((candidate) => candidate.id === activeViewportId) ?? viewports[0];
  const width = activeViewport.width === "full" ? "100%" : `${activeViewport.width}px`;
  const widthLabel = formatViewportWidth(activeViewport.width);
  const classes = [styles.root, className].filter(Boolean).join(" ");

  function selectViewport(viewportId: string) {
    if (viewport === undefined) setInternalViewport(viewportId);
    onViewportChange?.(viewportId);
  }

  return (
    <section
      {...sectionProps}
      aria-labelledby={`${id}-heading`}
      className={classes}
      style={style as CSSProperties | undefined}
    >
      <header className={styles.header}>
        <div className={styles.headingBlock}>
          <h2 className={styles.heading} id={`${id}-heading`}>{heading}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.toolbar}>
          <div aria-label="Preview width" className={styles.viewportControls} role="group">
            {viewports.map((option) => (
              <button
                aria-label={`${option.label} (${formatViewportWidth(option.width)})`}
                aria-pressed={activeViewport.id === option.id}
                className={styles.viewportButton}
                key={option.id}
                onClick={() => selectViewport(option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <p aria-live="polite" className={styles.viewportStatus}>
            {activeViewport.label} · {widthLabel}
          </p>
        </div>
      </header>

      <div
        aria-label={`${heading}: ${activeViewport.label} webpage preview, ${widthLabel}`}
        className={styles.stage}
        role="region"
        tabIndex={0}
      >
        <div
          className={styles.frame}
          data-full-width={activeViewport.width === "full" || undefined}
        >
          <iframe
            className={styles.iframe}
            loading={loading}
            sandbox={sandbox}
            src={src}
            srcDoc={srcDoc}
            style={{
              width,
              height: `${frameHeight}px`,
            }}
            title={`${frameTitle} — ${activeViewport.label} preview (${widthLabel})`}
          />
        </div>
      </div>
    </section>
  );
}

ContentPreview.displayName = "ContentPreview";
