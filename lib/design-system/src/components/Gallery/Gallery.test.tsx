import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gallery, type GalleryItem } from "./Gallery";

vi.mock("../Dialog/Dialog", () => ({
  Dialog: ({
    children,
    closeLabel,
    footer,
    heading,
    onOpenChange,
    open,
  }: {
    children?: React.ReactNode;
    closeLabel: string;
    footer?: React.ReactNode;
    heading?: React.ReactNode;
    onOpenChange: (open: boolean) => void;
    open: boolean;
  }) =>
    open ? (
      <div aria-label={typeof heading === "string" ? heading : "Image preview"} role="dialog">
        <button aria-label={closeLabel} onClick={() => onOpenChange(false)} type="button">
          Close
        </button>
        {footer}
        {children}
      </div>
    ) : null,
}));

const items: GalleryItem[] = [
  {
    id: "one",
    src: "/images/one.jpg",
    alt: "First garden",
    caption: "Spring garden",
    href: "/gardens/spring",
    linkLabel: "View spring garden",
    target: "_blank",
    rel: "noreferrer",
  },
  {
    id: "two",
    src: "/images/two.jpg",
    alt: "Second garden",
  },
  {
    id: "three",
    src: "/images/three.jpg",
    alt: "",
  },
];

describe("Gallery", () => {
  it("renders the empty state and forwards section naming", () => {
    render(
      <Gallery
        aria-label="Photo archive"
        emptyMessage="No photos yet."
        items={[]}
        label="Gallery"
      />,
    );

    expect(screen.getByRole("region", { name: "Photo archive" })).toBeInTheDocument();
    expect(screen.getByText("No photos yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders images, captions, and native detail links with layout options", () => {
    render(
      <Gallery
        aspectRatio="portrait"
        columns={2}
        fit="contain"
        gap="lg"
        items={items.slice(0, 2)}
        label="Gardens"
        variant="framed"
      />,
    );

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("data-columns", "2");
    expect(list).toHaveAttribute("data-gap", "lg");
    expect(screen.getByRole("region", { name: "Gardens" })).toHaveAttribute("data-variant", "framed");
    const image = screen.getByRole("img", { name: "First garden" });
    expect(image).toHaveAttribute("src", "/images/one.jpg");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("decoding", "async");
    expect(screen.getByRole("link", { name: "View spring garden" })).toHaveAttribute(
      "href",
      "/gardens/spring",
    );
    expect(screen.getByRole("link", { name: "View spring garden" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "View spring garden" })).toHaveAttribute(
      "rel",
      "noreferrer",
    );
    expect(screen.getByText("Spring garden")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Second garden" }).parentElement).toHaveAttribute(
      "data-aspect-ratio",
      "portrait",
    );
  });

  it("derives native link labels from image alt text and falls back for decorative images", () => {
    render(
      <Gallery
        items={[
          { id: "described", src: "/images/described.jpg", alt: "Courtyard garden", href: "/courtyard" },
          { id: "decorative", src: "/images/decorative.jpg", alt: "", href: "/decorative" },
        ]}
        label="Linked gardens"
      />,
    );
    expect(screen.getByRole("link", { name: "Courtyard garden" })).toHaveAttribute("href", "/courtyard");
    expect(screen.getByRole("link", { name: "View image 2" })).toHaveAttribute("href", "/decorative");
  });

  it("uses default link labels and custom lightbox labels", () => {
    render(
      <Gallery
        getOpenImageLabel={(item, index, total) => `Preview ${index + 1}/${total}: ${item.alt}`}
        items={items}
        label="Landscapes"
        lightbox
      />,
    );

    expect(screen.getByRole("button", { name: "Preview 1/3: First garden" })).toHaveAttribute(
      "aria-haspopup",
      "dialog",
    );
    expect(screen.getByRole("button", { name: /Preview 3\/3:/ })).toBeInTheDocument();
    expect(screen.getByText("View spring garden")).toHaveAttribute("href", "/gardens/spring");
  });

  it("uses fallback detail labels and clears a preview if its item is removed", () => {
    const singleItem: GalleryItem[] = [
      { id: "detail", src: "/images/detail.jpg", alt: "Detail garden", href: "/gardens/detail" },
    ];
    const { rerender } = render(<Gallery items={singleItem} label="Detail gallery" lightbox />);
    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute("href", "/gardens/detail");
    fireEvent.click(screen.getByRole("button", { name: "Open image 1: Detail garden" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    rerender(<Gallery items={[]} label="Detail gallery" lightbox />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens, navigates, loops, and closes the image preview", () => {
    render(<Gallery items={items} label="Portfolio" lightbox loop />);

    fireEvent.click(screen.getByRole("button", { name: "Open image 1: First garden" }));
    expect(screen.getByRole("dialog", { name: "Spring garden" })).toBeInTheDocument();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous image" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Previous image" }));
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
    expect(
      screen.getAllByRole("presentation").some((image) => image.getAttribute("src") === "/images/three.jpg"),
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByText("1 of 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close image preview" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables preview navigation at non-looping boundaries and uses the fallback heading", () => {
    render(<Gallery items={items.slice(1)} label="Two uncaptioned images" lightbox />);
    fireEvent.click(screen.getByRole("button", { name: "Open image 1: Second garden" }));

    expect(screen.getByRole("dialog", { name: "Image 1 of 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous image" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next image" })).toBeDisabled();
  });

  it("renders a standalone image without a caption or link", () => {
    render(<Gallery items={[items[2]]} label="Decorative image" />);

    expect(screen.getByRole("presentation")).toHaveAttribute("src", "/images/three.jpg");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("View details")).not.toBeInTheDocument();
  });
});
