import {
  forwardRef,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Badge } from "../Badge/Badge";
import {
  Card,
  type CardProps,
} from "../Card/Card";
import styles from "./ArticleCard.module.css";

export type ArticleCardCategory = {
  label: string;
  href?: string;
};

export type ArticleCardAuthor = {
  name: string;
  href?: string;
  avatarSrc?: string;
  avatarAlt?: string;
};

export type ArticleCardPublicationDate = {
  dateTime: string;
  label: string;
};

export type ArticleCardImage = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "children" | "style"
> & {
  src: string;
  alt: string;
};

export type ArticleCardProps = Omit<
  CardProps,
  | "actions"
  | "children"
  | "description"
  | "eyebrow"
  | "footer"
  | "headerActions"
  | "media"
  | "metadata"
  | "title"
> & {
  title: string;
  href: string;
  excerpt?: ReactNode;
  category?: ArticleCardCategory;
  author?: ArticleCardAuthor;
  publishedAt?: ArticleCardPublicationDate;
  readingTime?: string;
  image?: ArticleCardImage;
  readMoreLabel?: string;
  showReadMore?: boolean;
  style?: DesignSystemStyle;
};

export const ArticleCard = forwardRef<HTMLElement, ArticleCardProps>(function ArticleCard(
  {
    title,
    href,
    excerpt,
    category,
    author,
    publishedAt,
    readingTime,
    image,
    readMoreLabel = "Read article",
    showReadMore = true,
    mediaAspectRatio = "wide",
    mediaFit = "cover",
    className,
    style,
    ...cardProps
  },
  ref,
) {
  const categoryContent = category
    ? (
      <Badge size="sm" shape="rounded" tone="neutral">
        {category.label}
      </Badge>
    )
    : undefined;
  const categorySlot = categoryContent && category
    ? category.href
      ? (
        <a className={styles.categoryLink} href={category.href}>
          {categoryContent}
        </a>
      )
      : categoryContent
    : undefined;

  const metadataItems = author != null || publishedAt != null || readingTime != null
    ? (
      <div className={styles.metadata}>
        {author && (
          <span className={styles.author}>
            {author.avatarSrc && (
              <img
                alt={author.avatarAlt ?? ""}
                className={styles.avatar}
                decoding="async"
                height={32}
                loading="lazy"
                src={author.avatarSrc}
                width={32}
              />
            )}
            {author.href
              ? <a className={styles.inlineLink} href={author.href}>{author.name}</a>
              : <span>{author.name}</span>}
          </span>
        )}
        {publishedAt && <time dateTime={publishedAt.dateTime}>{publishedAt.label}</time>}
        {readingTime && <span>{readingTime}</span>}
      </div>
    )
    : undefined;

  let media: ReactNode = undefined;
  if (image) {
    const {
      alt,
      className: imageClassName,
      decoding,
      loading,
      ...imageProps
    } = image;
    media = (
      <img
        {...imageProps}
        alt={alt}
        className={[styles.image, imageClassName].filter(Boolean).join(" ")}
        decoding={decoding ?? "async"}
        loading={loading ?? "lazy"}
      />
    );
  }

  const actions = showReadMore
    ? (
      <a
        aria-label={`${readMoreLabel}: ${title}`}
        className={styles.readMoreLink}
        href={href}
      >
        {readMoreLabel}
      </a>
    )
    : undefined;

  return (
    <Card
      {...cardProps}
      ref={ref}
      className={[styles.articleCard, className].filter(Boolean).join(" ")}
      description={excerpt}
      eyebrow={categorySlot}
      media={media}
      mediaAspectRatio={mediaAspectRatio}
      mediaFit={mediaFit}
      metadata={metadataItems}
      style={style}
      title={<a className={styles.titleLink} href={href}>{title}</a>}
      actions={actions}
    />
  );
});

ArticleCard.displayName = "ArticleCard";
