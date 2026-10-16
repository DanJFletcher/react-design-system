import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Highlight, Prism, type PrismTheme } from "prism-react-renderer";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./CodeBlock.module.css";

const syntaxTheme: PrismTheme = {
  plain: {
    color: "var(--ds-color-text-primary)",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--ds-color-text-muted)" },
    },
    {
      types: ["keyword", "atrule", "important"],
      style: { color: "var(--ds-color-action-secondary-fg)" },
    },
    {
      types: ["string", "char", "attr-value", "regex"],
      style: { color: "var(--ds-color-status-success-fg)" },
    },
    {
      types: ["number", "boolean", "constant", "symbol"],
      style: { color: "var(--ds-color-status-info-fg)" },
    },
    {
      types: ["function", "class-name", "builtin"],
      style: { color: "var(--ds-color-status-warning-fg)" },
    },
  ],
};

function resolveLanguage(language?: string) {
  const normalizedLanguage = language?.trim().toLowerCase();

  if (
    normalizedLanguage == null ||
    normalizedLanguage.length === 0 ||
    !Object.prototype.hasOwnProperty.call(Prism.languages, normalizedLanguage)
  ) {
    return "text";
  }

  return normalizedLanguage;
}

export type CodeBlockProps = Omit<
  ComponentPropsWithRef<"figure">,
  "children" | "style"
> & {
  /** Source code displayed as text. The code is never evaluated. */
  code: string;
  /** A Prism language name or alias. Unsupported values render as plain text. */
  language?: string;
  /** Optional visible caption, such as a filename. */
  label?: string;
  style?: DesignSystemStyle;
};

/**
 * A theme-aware, syntax-highlighted code surface. Code and language are
 * consumer-provided; the component only displays source text.
 */
export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    language,
    label,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...figureProps
  },
  ref,
) {
  const resolvedLanguage = resolveLanguage(language);

  return (
    <figure
      {...figureProps}
      ref={ref}
      aria-label={ariaLabel ?? (label ? `${label}, ${resolvedLanguage}` : resolvedLanguage)}
      aria-labelledby={ariaLabelledBy}
      className={[styles.figure, className].filter(Boolean).join(" ")}
      data-language={resolvedLanguage}
      style={style as CSSProperties | undefined}
    >
      <figcaption className={styles.caption}>
        <span className={styles.label}>{label || resolvedLanguage}</span>
        {label && (
          <span className={styles.language}>{resolvedLanguage}</span>
        )}
      </figcaption>
      <Highlight
        code={code}
        language={resolvedLanguage}
        prism={Prism}
        theme={syntaxTheme}
      >
        {({ className: prismClassName, style: prismStyle, tokens, getTokenProps }) => (
          <pre
            className={[styles.pre, prismClassName].filter(Boolean).join(" ")}
            style={prismStyle}
            tabIndex={0}
          >
            <code className={styles.code}>
              {tokens.map((line, lineIndex) => (
                <span className={styles.line} key={`line-${lineIndex}`}>
                  {line.map((token, tokenIndex) => (
                    <span
                      key={`line-${lineIndex}-token-${tokenIndex}`}
                      {...getTokenProps({ token })}
                    />
                  ))}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </figure>
  );
});

CodeBlock.displayName = "CodeBlock";
