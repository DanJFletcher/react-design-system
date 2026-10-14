import { useId, useState, type CSSProperties } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./ContentMetadataPanel.module.css";

export type ContentMetadataValue = {
  slug: string;
  seoTitle: string;
  metaDescription: string;
  socialImageId?: string;
};

export type ContentMetadataImage = {
  id: string;
  url: string;
  label: string;
  altText?: string;
};

export type ContentMetadataPanelProps = {
  value?: ContentMetadataValue;
  defaultValue?: Partial<ContentMetadataValue>;
  onChange?: (nextValue: ContentMetadataValue) => void;
  images?: readonly ContentMetadataImage[];
  siteUrl?: string;
  siteName?: string;
  seoTitleMaxLength?: number;
  metaDescriptionMaxLength?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
  style?: DesignSystemStyle;
};

const EMPTY_VALUE: ContentMetadataValue = {
  slug: "",
  seoTitle: "",
  metaDescription: "",
};

function normalizedPageUrl(siteUrl: string, slug: string): string {
  const base = siteUrl.trim().replace(/\/+$/, "").replace(/([^:]\/)\/+/g, "$1");
  const path = slug.trim().replace(/^\/+|\/+$/g, "").replace(/\/{2,}/g, "/");
  if (!path) return base || "https://example.com";
  return `${base || "https://example.com"}/${path}`;
}

function getHost(siteUrl: string): string {
  try {
    return new URL(siteUrl).host;
  } catch {
    return siteUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }
}

export function ContentMetadataPanel({
  value,
  defaultValue,
  onChange,
  images = [],
  siteUrl = "https://example.com",
  siteName,
  seoTitleMaxLength = 60,
  metaDescriptionMaxLength = 160,
  disabled = false,
  label = "Search & social appearance",
  className,
  style,
}: ContentMetadataPanelProps) {
  const id = useId();
  const [internalValue, setInternalValue] = useState<ContentMetadataValue>({
    ...EMPTY_VALUE,
    ...defaultValue,
  });
  const currentValue = value ?? internalValue;
  const resolvedSiteName = siteName?.trim() || getHost(siteUrl);
  const selectedImage = images.find((image) => image.id === currentValue.socialImageId);
  const pageUrl = normalizedPageUrl(siteUrl, currentValue.slug);
  const classes = [styles.panel, className].filter(Boolean).join(" ");

  function updateValue(patch: Partial<ContentMetadataValue>) {
    const nextValue = { ...currentValue, ...patch };
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
  }

  return (
    <section
      aria-label={label}
      className={classes}
      style={style as CSSProperties | undefined}
    >
      <header className={styles.header}>
        <div>
          <h2 className={styles.heading}>{label}</h2>
          <p className={styles.intro}>
            Shape the search listing and social card visitors see when this page is shared.
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={`${id}-slug`}>Page URL slug</label>
            <input
              autoComplete="off"
              className={styles.control}
              disabled={disabled}
              id={`${id}-slug`}
              onChange={(event) => updateValue({ slug: event.currentTarget.value })}
              placeholder="your-page"
              type="text"
              value={currentValue.slug}
            />
            <p className={styles.hint}>The final part of the page address.</p>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.fieldLabel} htmlFor={`${id}-seo-title`}>SEO title</label>
              <span
                aria-live="polite"
                className={styles.counter}
                data-over-limit={currentValue.seoTitle.length > seoTitleMaxLength || undefined}
                id={`${id}-seo-title-count`}
              >
                {currentValue.seoTitle.length}/{seoTitleMaxLength}
              </span>
            </div>
            <input
              aria-describedby={`${id}-seo-title-count`}
              className={styles.control}
              disabled={disabled}
              id={`${id}-seo-title`}
              maxLength={seoTitleMaxLength}
              onChange={(event) => updateValue({ seoTitle: event.currentTarget.value })}
              placeholder="A clear title for search results"
              type="text"
              value={currentValue.seoTitle}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.fieldLabel} htmlFor={`${id}-description`}>Meta description</label>
              <span
                aria-live="polite"
                className={styles.counter}
                data-over-limit={currentValue.metaDescription.length > metaDescriptionMaxLength || undefined}
                id={`${id}-description-count`}
              >
                {currentValue.metaDescription.length}/{metaDescriptionMaxLength}
              </span>
            </div>
            <textarea
              aria-describedby={`${id}-description-count`}
              className={styles.textarea}
              disabled={disabled}
              id={`${id}-description`}
              maxLength={metaDescriptionMaxLength}
              onChange={(event) => updateValue({ metaDescription: event.currentTarget.value })}
              placeholder="Summarize what makes this page useful."
              value={currentValue.metaDescription}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={`${id}-social-image`}>Social sharing image</label>
            <select
              className={styles.imageSelect}
              disabled={disabled}
              id={`${id}-social-image`}
              onChange={(event) => updateValue({ socialImageId: event.currentTarget.value || undefined })}
              value={currentValue.socialImageId ?? ""}
            >
              <option value="">No image selected</option>
              {images.map((image) => (
                <option key={image.id} value={image.id}>{image.label}</option>
              ))}
            </select>
            <p className={styles.hint}>Choose an image from your media library.</p>
          </div>
        </div>

        <div aria-label="Page appearance previews" className={styles.previews} role="group">
          <article className={styles.previewCard} aria-label="Search result preview">
            <div className={styles.previewHeading}>
              <h3 className={styles.previewTitle}>Search result</h3>
              <span className={styles.previewType}>Google</span>
            </div>
            <div className={styles.searchPreview}>
              <span className={styles.searchHost}>{getHost(siteUrl)}</span>
              <span className={styles.searchUrl}>{pageUrl}</span>
              <p className={styles.searchTitle}>
                {currentValue.seoTitle || "Your page title"}
              </p>
              <p className={styles.searchDescription}>
                {currentValue.metaDescription || "Add a description to give people a useful preview of this page."}
              </p>
            </div>
          </article>

          <article className={styles.previewCard} aria-label="Social sharing preview">
            <div className={styles.previewHeading}>
              <h3 className={styles.previewTitle}>Social sharing</h3>
              <span className={styles.previewType}>Open Graph</span>
            </div>
            <div className={styles.socialPreview}>
              <div className={styles.socialImage}>
                {selectedImage ? (
                  <img src={selectedImage.url} alt={selectedImage.altText || selectedImage.label} />
                ) : (
                  <div className={styles.imageEmpty}>
                    <span aria-hidden="true" className={styles.imageMark}>OG</span>
                    <strong>No social image selected</strong>
                    <span>Choose an image to give shared links a visual preview.</span>
                  </div>
                )}
              </div>
              <div className={styles.socialCopy}>
                <span className={styles.socialSite}>{resolvedSiteName}</span>
                <p className={styles.socialTitle}>{currentValue.seoTitle || "Your page title"}</p>
                <p className={styles.socialDescription}>
                  {currentValue.metaDescription || "Add a description to introduce this page when it is shared."}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

ContentMetadataPanel.displayName = "ContentMetadataPanel";
