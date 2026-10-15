import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Link.module.css";

export type LinkVariant = "default" | "muted";
export type LinkUnderline = "always" | "hover" | "none";

export type LinkProps = Omit<
  ComponentPropsWithRef<"a">,
  "children" | "href" | "style"
> & {
  /** Destination for this native anchor. */
  href: string;
  children: ReactNode;
  /** `default` uses the theme's link accent; `muted` uses its muted text color. */
  variant?: LinkVariant;
  /** Underline behavior. Inline links default to always underlined. */
  underline?: LinkUnderline;
  style?: DesignSystemStyle;
};

function withNoopener(target: string | undefined, rel: string | undefined) {
  if (target?.toLowerCase() !== "_blank") return rel;

  const relTokens = (rel ?? "").split(/\s+/).filter(Boolean);
  if (!relTokens.some((token) => token.toLowerCase() === "noopener")) {
    relTokens.push("noopener");
  }
  return relTokens.join(" ");
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    children,
    target,
    rel,
    variant = "default",
    underline = "always",
    className,
    style,
    ...anchorProps
  },
  ref,
) {
  return (
    <a
      {...anchorProps}
      ref={ref}
      href={href}
      target={target}
      rel={withNoopener(target, rel)}
      className={[styles.link, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-underline={underline}
      style={style as CSSProperties | undefined}
    >
      {children}
    </a>
  );
});

Link.displayName = "Link";
