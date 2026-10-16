import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FAQSection, type FAQSectionItem } from "./FAQSection";

describe("FAQSection", () => {
  it("supports multiple initially-open answers, updates expansion, and omits empty optional regions", () => {
    const onOpenItemsChange = vi.fn();
    render(
      <FAQSection
        action={false}
        defaultOpenItems={["hours"]}
        description={false}
        heading="Questions"
        headingLevel={1}
        items={[
          { id: "hours", question: "When are you open?", answer: "Weekdays." },
          { id: "pricing", question: "What does it cost?", answer: "It depends." },
        ]}
        multiple
        onOpenItemsChange={onOpenItemsChange}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Questions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "When are you open?" })).toBeInTheDocument();
    expect(screen.getByText("Weekdays.")).toBeVisible();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "What does it cost?" }));
    expect(screen.getByText("Weekdays.")).toBeVisible();
    expect(screen.getByText("It depends.")).toBeVisible();
    expect(onOpenItemsChange).toHaveBeenLastCalledWith(["hours", "pricing"]);
  });

  it("supports controlled open items and allows callers to label the section", () => {
    const onOpenItemsChange = vi.fn();
    const { rerender } = render(
      <FAQSection
        aria-label="Help center"
        heading="Help"
        items={[{ id: "one", question: "First?", answer: <span>First answer</span> }]}
        openItems={[]}
        onOpenItemsChange={onOpenItemsChange}
      />,
    );
    expect(screen.getByRole("region", { name: "Help" })).toHaveAttribute("aria-label", "Help center");
    fireEvent.click(screen.getByRole("button", { name: "First?" }));
    expect(onOpenItemsChange).toHaveBeenCalledWith(["one"]);
    expect(screen.queryByText("First answer")).not.toBeVisible();
    rerender(
      <>
        <h2 id="faq-title">Help center FAQs</h2>
        <FAQSection
          aria-labelledby="faq-title"
          heading="Help"
          items={[{ id: "one", question: "First?", answer: "First answer" }]}
          openItems={["one"]}
        />
      </>,
    );
    expect(screen.getByRole("region", { name: "Help center FAQs" })).toHaveAttribute("aria-labelledby", "faq-title");
    expect(screen.getByText("First answer")).toBeVisible();
  });

  it("rejects invalid heading and item data before rendering", () => {
    const validItems: FAQSectionItem[] = [{ id: "one", question: "Question", answer: "Answer" }];
    expect(() => render(<FAQSection heading="Invalid" headingLevel={0 as 2} items={validItems} />)).toThrow(/headingLevel/);
    expect(() => render(<FAQSection heading=" " items={validItems} />)).toThrow(/non-empty/);
    expect(() => render(<FAQSection heading="Invalid" items={null as unknown as FAQSectionItem[]} />)).toThrow(/items.*array/);
    expect(() => render(<FAQSection heading="Invalid" items={[null as unknown as FAQSectionItem]} />)).toThrow(/must be an object/);
    expect(() => render(<FAQSection heading="Invalid" items={[{ id: " ", question: "Q", answer: "A" }]} />)).toThrow(/non-empty `id`/);
    expect(() => render(<FAQSection heading="Invalid" items={[validItems[0], validItems[0]]} />)).toThrow(/duplicate `id`/);
    expect(() => render(<FAQSection heading="Invalid" items={[{ id: "one", question: " ", answer: "A" }]} />)).toThrow(/non-empty `question`/);
    expect(() => render(<FAQSection heading="Invalid" items={[{ id: "one", question: "Q", answer: " " }]} />)).toThrow(/non-empty `answer`/);
    expect(() => render(<FAQSection heading="Invalid" items={[{ id: "one", question: "Q", answer: true }]} />)).toThrow(/non-empty `answer`/);
  });
});
