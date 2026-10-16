import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  it("renders accessible syntax-highlighted code and forwards figure props and ref", () => {
    const ref = createRef<HTMLElement>();
    render(
      <CodeBlock
        code={"const answer: number = 42;\n"}
        data-testid="example-code"
        id="example-code"
        label="answer.ts"
        language="typescript"
        ref={ref}
        title="Example code"
      />,
    );

    const figure = screen.getByRole("figure", { name: "answer.ts, typescript" });
    const keyword = screen.getByText("const");
    const pre = figure.querySelector("pre");

    expect(figure).toHaveAttribute("data-language", "typescript");
    expect(figure).toHaveAttribute("id", "example-code");
    expect(figure).toHaveAttribute("title", "Example code");
    expect(ref.current).toBe(figure);
    expect(keyword).toHaveClass("token", "keyword");
    expect(figure).toHaveTextContent("const answer: number = 42;");
    expect(pre).toHaveAttribute("tabindex", "0");
  });

  it("uses the language as its caption when a label is not provided", () => {
    render(<CodeBlock code={'{"ready": true}'} language="json" />);

    expect(screen.getByRole("figure", { name: "json" })).toBeVisible();
    expect(screen.getByText("true")).toHaveClass("token", "boolean");
  });

  it("allows a consumer-provided accessible label reference", () => {
    render(
      <>
        <h2 id="snippet-heading">Example snippet</h2>
        <CodeBlock aria-labelledby="snippet-heading" code="print('hello')" language="python" />
      </>,
    );

    expect(screen.getByRole("figure", { name: "Example snippet" })).toBeVisible();
  });

  it("allows a consumer-provided accessible label", () => {
    render(<CodeBlock aria-label="A code sample" code="const value = 1" language="javascript" />);

    expect(screen.getByRole("figure", { name: "A code sample" })).toBeVisible();
  });

  it.each(["unknown-language", " "])(
    "renders unsupported language %s as plain text",
    (language) => {
      render(<CodeBlock code="plain source text" language={language} />);

      const figure = screen.getByRole("figure", { name: "text" });
      expect(figure).toHaveAttribute("data-language", "text");
      expect(figure).toHaveTextContent("plain source text");
      expect(screen.getByText("plain source text")).not.toHaveClass("keyword");
    },
  );

  it("defaults to plain text when no language is provided and supports a consumer class", () => {
    render(
      <CodeBlock
        className="consumer-code"
        code="A harmless sample."
        data-testid="plain-code"
      />,
    );

    const figure = screen.getByTestId("plain-code");
    expect(figure).toHaveAttribute("data-language", "text");
    expect(figure).toHaveClass("consumer-code");
    expect(screen.getByRole("figure", { name: "text" })).toBeVisible();
  });
});
