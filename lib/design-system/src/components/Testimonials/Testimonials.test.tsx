import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Testimonials, type TestimonialItem } from "./Testimonials";

const testimonial: TestimonialItem = {
  id: "one",
  quote: "The garden has never looked better.",
  author: { name: "Alex Green" },
};

describe("Testimonials", () => {
  it("renders featured content with defaults, optional details, and accessible ratings", () => {
    render(
      <Testimonials
        items={[
          {
            ...testimonial,
            author: { name: "Alex Green", role: " ", company: "Neighborhood association", avatar: { src: "/alex.jpg" } },
            rating: 4,
          },
        ]}
        layout="featured"
      />,
    );
    expect(screen.getByRole("region", { name: "Testimonials" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "4 out of 5 stars" })).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute("alt", "");
    expect(screen.getByText("Neighborhood association")).toBeInTheDocument();
    expect(screen.getByText("Alex Green")).toBeInTheDocument();
  });

  it("supports custom section naming and custom rating labels", () => {
    render(
      <Testimonials
        aria-label="Stories from readers"
        getRatingLabel={(rating) => `Rated ${rating}`}
        heading="Stories"
        headingLevel={5}
        items={[{ ...testimonial, rating: 3 }]}
      />,
    );
    expect(screen.getByRole("region", { name: "Stories from readers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 5 })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Rated 3" })).toBeInTheDocument();
  });

  it("returns nothing for an empty list and validates configuration and every item", () => {
    const { container } = render(<Testimonials items={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(() => render(<Testimonials items={null as unknown as TestimonialItem[]} />)).toThrow(/items array/);
    expect(() => render(<Testimonials items={[testimonial]} layout={"list" as never} />)).toThrow(/layout/);
    expect(() => render(<Testimonials columns={1 as 2} items={[testimonial]} />)).toThrow(/columns/);
    expect(() => render(<Testimonials headingLevel={1 as 2} items={[testimonial]} />)).toThrow(/headingLevel/);
    expect(() => render(<Testimonials heading=" " items={[testimonial]} />)).toThrow(/heading cannot be empty/);
    expect(() => render(<Testimonials aria-label=" " items={[testimonial]} />)).toThrow(/aria-label cannot be empty/);
    expect(() => render(<Testimonials items={[{ ...testimonial, id: " " }]} />)).toThrow(/non-empty id/);
    expect(() => render(<Testimonials items={[testimonial, testimonial]} />)).toThrow(/duplicated/);
    expect(() => render(<Testimonials items={[{ ...testimonial, quote: " " }]} />)).toThrow(/non-empty quote/);
    expect(() => render(<Testimonials items={[{ ...testimonial, author: { name: " " } }]} />)).toThrow(/author name/);
    expect(() => render(<Testimonials items={[{ ...testimonial, author: { name: "A", avatar: { src: " " } } }]} />)).toThrow(/avatar source/);
    expect(() => render(<Testimonials items={[{ ...testimonial, rating: 0 }]} />)).toThrow(RangeError);
    expect(() => render(<Testimonials items={[{ ...testimonial, rating: 2.5 }]} />)).toThrow(RangeError);
    expect(() => render(<Testimonials getRatingLabel={() => " "} items={[{ ...testimonial, rating: 3 }]} />)).toThrow(/non-empty text/);
  });
});
