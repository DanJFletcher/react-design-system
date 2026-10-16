import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Icon } from "../Icon/Icon";
import styles from "./Chip.module.css";

export type ChipSize = "sm" | "md" | "lg";

type ChipSelectionProps =
  | {
      selected?: never;
      onSelect?: never;
    }
  | {
      selected: boolean;
      onSelect: (selected: boolean) => void;
    };

type ChipRemovalProps =
  | {
      onRemove?: never;
      removeLabel?: never;
    }
  | {
      onRemove: MouseEventHandler<HTMLButtonElement>;
      removeLabel: string;
    };

export type ChipProps = Omit<
  ComponentPropsWithRef<"span">,
  "children" | "onClick" | "onSelect" | "style"
> & {
  children: ReactNode;
  size?: ChipSize;
  disabled?: boolean;
  style?: DesignSystemStyle;
} & ChipSelectionProps & ChipRemovalProps;

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  {
    size = "md",
    selected,
    onSelect,
    onRemove,
    removeLabel,
    disabled = false,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  if (onRemove && !removeLabel?.trim()) {
    throw new Error("Chip: provide a non-empty removeLabel when onRemove is used.");
  }

  const selectable = onSelect != null;
  const isSelected = selected === true;
  const classes = [styles.chip, styles[size], className].filter(Boolean).join(" ");

  return (
    <span
      {...props}
      ref={ref}
      className={classes}
      data-selected={selectable ? String(isSelected) : undefined}
      data-disabled={disabled ? "true" : undefined}
      style={style as CSSProperties | undefined}
    >
      {selectable ? (
        <button
          type="button"
          className={styles.selectButton}
          aria-pressed={isSelected}
          disabled={disabled}
          onClick={() => onSelect(!isSelected)}
        >
          {isSelected && <Icon name="check" size="xs" />}
          <span className={styles.label}>{children}</span>
        </button>
      ) : (
        <span className={styles.label}>{children}</span>
      )}
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
        >
          <Icon name="close" size="xs" />
        </button>
      )}
    </span>
  );
});

Chip.displayName = "Chip";
