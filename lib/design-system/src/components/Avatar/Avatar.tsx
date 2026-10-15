import { forwardRef, useState, type ComponentPropsWithRef, type CSSProperties } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "rounded" | "square";

export type AvatarProps = Omit<
  ComponentPropsWithRef<"span">,
  "children" | "style" | "role" | "aria-label"
> & {
  name: string;
  src?: string;
  initials?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  style?: DesignSystemStyle;
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/u).filter(Boolean);
  if (words.length === 0) return "?";

  const letters = words.length > 1
    ? words.slice(0, 2).map((word) => Array.from(word)[0])
    : Array.from(words[0]).slice(0, 2);

  return letters.join("").toUpperCase();
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    name,
    src,
    initials,
    size = "md",
    shape = "circle",
    className,
    style,
    ...spanProps
  },
  ref,
) {
  const [failedSource, setFailedSource] = useState<string>();
  const displayInitials = initials?.trim() || getInitials(name);
  const accessibleName = name.trim() || "Avatar";
  const showImage = Boolean(src) && failedSource !== src;
  const classes = [
    styles.avatar,
    styles[size],
    styles[shape],
    className,
  ].filter(Boolean).join(" ");

  return (
    <span
      {...spanProps}
      ref={ref}
      aria-label={accessibleName}
      className={classes}
      role="img"
      style={style as CSSProperties | undefined}
    >
      {showImage ? (
        <img
          alt=""
          className={styles.image}
          decoding="async"
          onError={() => setFailedSource(src)}
          src={src}
        />
      ) : (
        <span aria-hidden="true" className={styles.initials}>{displayInitials}</span>
      )}
    </span>
  );
});

Avatar.displayName = "Avatar";
