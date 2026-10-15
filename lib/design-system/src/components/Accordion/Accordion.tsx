import {
  forwardRef,
  useId,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Icon } from "../Icon/Icon";
import styles from "./Accordion.module.css";

export type AccordionVariant = "divided" | "outlined" | "surface";
export type AccordionSize = "sm" | "md" | "lg";
export type AccordionShape = "rounded" | "square";
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type AccordionPanelMotion = "none" | "expand";

export type AccordionItem = {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

export type AccordionProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "style" | "aria-label"
> & {
  items: readonly AccordionItem[];
  label?: string;
  multiple?: boolean;
  openItems?: readonly string[];
  defaultOpenItems?: readonly string[];
  onOpenItemsChange?: (openItems: string[]) => void;
  variant?: AccordionVariant;
  size?: AccordionSize;
  shape?: AccordionShape;
  panelMotion?: AccordionPanelMotion;
  headingLevel?: AccordionHeadingLevel;
  style?: DesignSystemStyle;
};

function normalizeOpenItems(
  candidate: readonly string[],
  itemIds: ReadonlySet<string>,
  multiple: boolean,
) {
  const unique = [...new Set(candidate)].filter((id) => itemIds.has(id));
  return multiple ? unique : unique.slice(0, 1);
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    items,
    label,
    multiple = false,
    openItems,
    defaultOpenItems = [],
    onOpenItemsChange,
    variant = "divided",
    size = "md",
    shape = "rounded",
    panelMotion = "none",
    headingLevel = 3,
    className,
    style,
    ...divProps
  },
  ref,
) {
  const generatedId = useId();
  const itemIds = new Set(items.map((item) => item.id));
  const [uncontrolledOpenItems, setUncontrolledOpenItems] = useState(() =>
    normalizeOpenItems(defaultOpenItems, itemIds, multiple),
  );
  const isControlled = openItems !== undefined;
  const currentOpenItems = normalizeOpenItems(
    isControlled ? openItems : uncontrolledOpenItems,
    itemIds,
    multiple,
  );
  const Heading = `h${headingLevel}` as
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";

  const updateOpenItems = (nextOpenItems: string[]) => {
    if (!isControlled) setUncontrolledOpenItems(nextOpenItems);
    onOpenItemsChange?.(nextOpenItems);
  };

  const toggleItem = (item: AccordionItem) => {
    if (item.disabled) return;
    const isOpen = currentOpenItems.includes(item.id);
    const nextOpenItems = isOpen
      ? currentOpenItems.filter((id) => id !== item.id)
      : multiple
        ? [...currentOpenItems, item.id]
        : [item.id];
    updateOpenItems(nextOpenItems);
  };

  return (
    <div
      {...divProps}
      ref={ref}
      className={[styles.accordion, className].filter(Boolean).join(" ")}
      data-ds-accordion
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      role={label ? "group" : undefined}
      aria-label={label}
      style={style as CSSProperties | undefined}
    >
      {items.map((item, index) => {
        const isOpen = currentOpenItems.includes(item.id);
        const triggerId = `${generatedId}-trigger-${index}`;
        const panelId = `${generatedId}-panel-${index}`;

        return (
          <div
            className={styles.item}
            data-open={isOpen || undefined}
            data-ds-accordion-item
            data-disabled={item.disabled || undefined}
            key={item.id}
          >
            <Heading className={styles.heading} data-ds-accordion-heading>
              <button
                aria-controls={panelId}
                aria-expanded={isOpen}
                className={styles.trigger}
                data-ds-accordion-trigger
                disabled={item.disabled}
                id={triggerId}
                onClick={() => toggleItem(item)}
                type="button"
              >
                <span className={styles.title} data-ds-accordion-title>{item.title}</span>
                <Icon
                  aria-hidden="true"
                  className={styles.chevron}
                  name="chevron-down"
                  size="md"
                />
              </button>
            </Heading>
            <div
              aria-hidden={panelMotion === "expand" && !isOpen ? true : undefined}
              aria-labelledby={triggerId}
              className={panelMotion === "expand" ? styles.panelMotion : styles.panel}
              data-open={panelMotion === "expand" ? isOpen : undefined}
              hidden={panelMotion === "none" ? !isOpen : undefined}
              id={panelId}
              inert={panelMotion === "expand" && !isOpen ? true : undefined}
              role="region"
            >
              {panelMotion === "expand" ? (
                <div className={styles.panel}>{item.content}</div>
              ) : item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
});

Accordion.displayName = "Accordion";
