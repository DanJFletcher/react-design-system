import {
  forwardRef,
  useId,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import {
  Accordion,
  type AccordionHeadingLevel,
  type AccordionShape,
  type AccordionSize,
  type AccordionVariant,
} from "../Accordion/Accordion";
import styles from "./FAQSection.module.css";

export type FAQSectionHeadingLevel = 1 | 2 | 3 | 4 | 5;

export type FAQSectionItem = {
  id: string;
  question: string;
  answer: ReactNode;
  disabled?: boolean;
};

export type FAQSectionProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style"
> & {
  heading: string;
  description?: ReactNode;
  items: readonly FAQSectionItem[];
  action?: ReactNode;
  headingLevel?: FAQSectionHeadingLevel;
  multiple?: boolean;
  openItems?: readonly string[];
  defaultOpenItems?: readonly string[];
  onOpenItemsChange?: (openItems: string[]) => void;
  variant?: AccordionVariant;
  size?: AccordionSize;
  shape?: AccordionShape;
  style?: DesignSystemStyle;
};

type HeadingTag = `h${FAQSectionHeadingLevel}`;

function isHeadingLevel(value: number): value is FAQSectionHeadingLevel {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function validateItems(items: readonly FAQSectionItem[]) {
  if (!Array.isArray(items)) {
    throw new Error("FAQSection `items` must be an array.");
  }

  const seenIds = new Set<string>();
  items.forEach((item, index) => {
    if (item == null || typeof item !== "object") {
      throw new Error(`FAQSection item at index ${index} must be an object.`);
    }
    if (typeof item.id !== "string" || !item.id.trim()) {
      throw new Error(`FAQSection item at index ${index} requires a non-empty \`id\`.`);
    }
    if (seenIds.has(item.id)) {
      throw new Error(`FAQSection item \`${item.id}\` has a duplicate \`id\`.`);
    }
    seenIds.add(item.id);

    if (typeof item.question !== "string" || !item.question.trim()) {
      throw new Error(`FAQSection item \`${item.id}\` requires a non-empty \`question\`.`);
    }
    if (
      item.answer == null
      || item.answer === false
      || item.answer === true
      || (typeof item.answer === "string" && !item.answer.trim())
    ) {
      throw new Error(`FAQSection item \`${item.id}\` requires a non-empty \`answer\`.`);
    }
  });
}

export const FAQSection = forwardRef<HTMLElement, FAQSectionProps>(function FAQSection(
  {
    heading,
    description,
    items,
    action,
    headingLevel = 2,
    multiple = false,
    openItems,
    defaultOpenItems,
    onOpenItemsChange,
    variant = "divided",
    size = "md",
    shape = "rounded",
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...sectionProps
  },
  ref,
) {
  const generatedId = useId();

  if (!Array.isArray(items)) {
    throw new Error("FAQSection `items` must be an array.");
  }
  if (items.length === 0) return null;
  if (typeof heading !== "string" || !heading.trim()) {
    throw new Error("FAQSection requires a non-empty `heading`.");
  }
  if (!isHeadingLevel(headingLevel)) {
    throw new Error("FAQSection `headingLevel` must be an integer from 1 to 5.");
  }

  validateItems(items);

  const Heading = `h${headingLevel}` as HeadingTag;
  const questionHeadingLevel = (headingLevel + 1) as AccordionHeadingLevel;
  const accordionItems = items.map(({ id, question, answer, disabled }) => ({
    id,
    title: question,
    content: answer,
    disabled,
  }));
  const hasDescription = description != null && description !== false && description !== true;
  const hasAction = action != null && action !== false && action !== true;

  return (
    <section
      {...sectionProps}
      ref={ref}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? `${generatedId}-heading`}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style as CSSProperties | undefined}
    >
      <header className={styles.header}>
        <Heading className={styles.heading} id={`${generatedId}-heading`}>
          {heading}
        </Heading>
        {hasDescription && <div className={styles.description}>{description}</div>}
      </header>

      <div className={styles.content}>
        <Accordion
          className={styles.accordion}
          defaultOpenItems={defaultOpenItems}
          headingLevel={questionHeadingLevel}
          items={accordionItems}
          multiple={multiple}
          onOpenItemsChange={onOpenItemsChange}
          openItems={openItems}
          shape={shape}
          size={size}
          variant={variant}
        />
        {hasAction && <div className={styles.action}>{action}</div>}
      </div>
    </section>
  );
});

FAQSection.displayName = "FAQSection";
