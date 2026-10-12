import {
  forwardRef,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Tabs.module.css";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";
export type TabsVariant = "line" | "pills";
export type TabsSize = "sm" | "md" | "lg";

export type TabsItem = {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
};

export type TabsProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "style"
> & {
  items: readonly TabsItem[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  variant?: TabsVariant;
  size?: TabsSize;
  fullWidth?: boolean;
  style?: DesignSystemStyle;
};

function resolveValue(candidate: string | undefined, enabledItems: readonly TabsItem[]) {
  return enabledItems.some((item) => item.id === candidate)
    ? candidate
    : enabledItems[0]?.id;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    label,
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    activationMode = "automatic",
    variant = "line",
    size = "md",
    fullWidth = false,
    className,
    style,
    ...divProps
  },
  ref,
) {
  const generatedId = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const enabledItems = items.filter((item) => !item.disabled);
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    resolveValue(defaultValue, enabledItems),
  );
  const isControlled = value !== undefined;
  const selectedValue = resolveValue(
    isControlled ? value : uncontrolledValue,
    enabledItems,
  );

  const selectValue = (nextValue: string) => {
    if (nextValue === selectedValue) return;
    if (!isControlled) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  };

  const focusEnabledItem = (currentId: string, direction: -1 | 1) => {
    const currentIndex = enabledItems.findIndex((item) => item.id === currentId);
    if (currentIndex < 0 || enabledItems.length < 2) return;

    const nextIndex =
      (currentIndex + direction + enabledItems.length) % enabledItems.length;
    const nextItem = enabledItems[nextIndex];
    tabRefs.current.get(nextItem.id)?.focus();
    if (activationMode === "automatic") selectValue(nextItem.id);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    item: TabsItem,
  ) => {
    const isRtl =
      orientation === "horizontal" &&
      window.getComputedStyle(event.currentTarget).direction === "rtl";
    const forwardKey =
      orientation === "horizontal"
        ? isRtl
          ? "ArrowLeft"
          : "ArrowRight"
        : "ArrowDown";
    const backwardKey =
      orientation === "horizontal"
        ? isRtl
          ? "ArrowRight"
          : "ArrowLeft"
        : "ArrowUp";

    if (event.key === forwardKey || event.key === backwardKey) {
      event.preventDefault();
      focusEnabledItem(item.id, event.key === forwardKey ? 1 : -1);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const destination =
        event.key === "Home"
          ? enabledItems[0]
          : enabledItems[enabledItems.length - 1];
      if (!destination) return;
      tabRefs.current.get(destination.id)?.focus();
      if (activationMode === "automatic") selectValue(destination.id);
    }
  };

  const componentClassName = [styles.tabs, className].filter(Boolean).join(" ");

  return (
    <div
      {...divProps}
      ref={ref}
      className={componentClassName}
      data-activation-mode={activationMode}
      data-full-width={fullWidth || undefined}
      data-orientation={orientation}
      data-size={size}
      data-variant={variant}
      style={style as CSSProperties | undefined}
    >
      <div
        aria-label={label}
        aria-orientation={orientation}
        className={styles.tabList}
        role="tablist"
      >
        {items.map((item, index) => {
          const tabId = `${generatedId}-tab-${index}`;
          const panelId = `${generatedId}-panel-${index}`;
          const isSelected = item.id === selectedValue;

          return (
            <button
              aria-controls={panelId}
              aria-label={item.ariaLabel}
              aria-selected={isSelected}
              className={styles.tab}
              data-testid={`tab-${item.id}`}
              disabled={item.disabled}
              id={tabId}
              key={item.id}
              onClick={() => {
                if (!item.disabled) selectValue(item.id);
              }}
              onKeyDown={(event) => handleKeyDown(event, item)}
              ref={(element) => {
                if (element) tabRefs.current.set(item.id, element);
                else tabRefs.current.delete(item.id);
              }}
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item, index) => {
        const tabId = `${generatedId}-tab-${index}`;
        const panelId = `${generatedId}-panel-${index}`;
        const isSelected = item.id === selectedValue;

        return (
          <div
            aria-labelledby={tabId}
            className={styles.panel}
            data-testid={`tabpanel-${item.id}`}
            hidden={!isSelected}
            id={panelId}
            key={item.id}
            role="tabpanel"
            tabIndex={isSelected ? 0 : -1}
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
});

Tabs.displayName = "Tabs";
