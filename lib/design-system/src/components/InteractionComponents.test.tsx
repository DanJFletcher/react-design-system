import { act, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ComponentType } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Carousel } from "./Carousel/Carousel";
import { Pagination } from "./Pagination/Pagination";
import { Rating } from "./Rating/Rating";
import { Search } from "./Search/Search";
import { Tabs } from "./Tabs/Tabs";

const slides = [
  { id: "one", label: "First", content: <p>Slide one</p> },
  { id: "two", label: "Second", content: <p>Slide two</p> },
  { id: "three", content: <p>Slide three</p> },
];

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(window, "matchMedia", { configurable: true, value: originalMatchMedia });
});

describe("Pagination", () => {
  it("renders page buttons, compact ranges, labels, summary, and boundary navigation", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        boundaryCount={1}
        currentPage={4}
        nextLabel="Next"
        onPageChange={onPageChange}
        pageLabel={(page) => `Page number ${page}`}
        pageSummaryLabel={(current, total) => `${current} of ${total} total`}
        previousLabel="Previous"
        siblingCount={1}
        totalPages={10}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByText("4 of 10 total")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Page number 4" })).not.toBeInTheDocument();
    expect(screen.getByText("4").closest("[aria-current='page']")).toBeInTheDocument();
    expect(screen.getAllByText("…")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Page number 5" }));
    expect(onPageChange).toHaveBeenCalledWith(5);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
  });

  it("renders link navigation and disabled endpoint links without current-page links", () => {
    const { rerender } = render(
      <Pagination currentPage={1} getPageHref={(page) => `/pages/${page}`} totalPages={4} />,
    );
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute("href", "/pages/2");
    expect(document.querySelector('[aria-disabled="true"]')).toHaveTextContent("Previous page");
    expect(screen.getByRole("link", { name: "Page 4" })).toHaveAttribute("href", "/pages/4");
    rerender(<Pagination currentPage={4} getPageHref={(page) => `/pages/${page}`} totalPages={4} />);
    expect(document.querySelector('[aria-disabled="true"]')).toHaveTextContent("Next page");
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute("href", "/pages/3");
  });

  it("renders a single page as nothing and rejects invalid configuration", () => {
    const { container } = render(<Pagination currentPage={1} onPageChange={() => {}} totalPages={1} />);
    expect(container).toBeEmptyDOMElement();
    expect(() => render(<Pagination currentPage={0} onPageChange={() => {}} totalPages={4} />)).toThrow(RangeError);
    expect(() => render(<Pagination currentPage={5} onPageChange={() => {}} totalPages={4} />)).toThrow(/less than or equal/);
    expect(() => render(<Pagination currentPage={1} onPageChange={() => {}} siblingCount={-1} totalPages={4} />)).toThrow(/siblingCount/);
    const InvalidPagination = Pagination as unknown as ComponentType<Record<string, unknown>>;
    expect(() => render(createElement(InvalidPagination, { currentPage: 1, totalPages: 4 }))).toThrow(/exactly one/);
  });

  it("renders disabled button endpoints when page changes are handled in place", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<Pagination currentPage={1} onPageChange={onPageChange} totalPages={3} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    rerender(<Pagination currentPage={3} onPageChange={onPageChange} totalPages={3} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });
});

describe("Tabs", () => {
  const items = [
    { id: "overview", label: "Overview", content: <p>Overview panel</p> },
    { id: "details", label: "Details", content: <p>Details panel</p> },
    { id: "disabled", label: "Disabled", content: <p>Disabled panel</p>, disabled: true },
  ];

  it("selects tabs on click and skips disabled tabs with arrow keys", () => {
    const onValueChange = vi.fn();
    render(<Tabs activationMode="automatic" items={items} label="Project tabs" onValueChange={onValueChange} />);
    const first = screen.getByRole("tab", { name: "Overview" });
    const details = screen.getByRole("tab", { name: "Details" });
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(details).toHaveFocus();
    expect(details).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenCalledWith("details");
    fireEvent.keyDown(details, { key: "End" });
    expect(details).toHaveFocus();
    fireEvent.keyDown(details, { key: "Home" });
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    fireEvent.click(screen.getByRole("tab", { name: "Details" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Details panel");
  });

  it("supports manual activation, vertical navigation, fallback selection, and controlled state", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Tabs activationMode="manual" defaultValue="missing" items={items} label="Manual tabs" orientation="vertical" />,
    );
    const overview = screen.getByRole("tab", { name: "Overview" });
    const details = screen.getByRole("tab", { name: "Details" });
    expect(overview).toHaveAttribute("aria-selected", "true");
    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowDown" });
    expect(details).toHaveFocus();
    expect(overview).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(details, { key: "Home" });
    expect(overview).toHaveFocus();
    fireEvent.keyDown(overview, { key: "Enter" });
    expect(overview).toHaveFocus();

    rerender(
      <Tabs items={items} label="Controlled tabs" onValueChange={onValueChange} value="overview" />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Details" }));
    expect(onValueChange).toHaveBeenCalledWith("details");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });

  it("reverses horizontal navigation in RTL and keeps a single tab stationary", () => {
    const { rerender } = render(<Tabs dir="rtl" items={items} label="RTL tabs" />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    const details = screen.getByRole("tab", { name: "Details" });
    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowLeft" });
    expect(details).toHaveFocus();
    fireEvent.keyDown(details, { key: "ArrowRight" });
    expect(overview).toHaveFocus();

    rerender(<Tabs items={[items[0]]} label="Single tab" />);
    const single = screen.getByRole("tab", { name: "Overview" });
    single.focus();
    fireEvent.keyDown(single, { key: "ArrowRight" });
    expect(single).toHaveFocus();
  });
});

describe("Carousel", () => {
  it("renders the empty state and hides controls for a single slide", () => {
    const { rerender } = render(<Carousel label="Empty stories" slides={[]} emptyMessage="Nothing here" />);
    expect(screen.getByRole("region", { name: "Empty stories" })).toHaveTextContent("Nothing here");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<Carousel label="One story" slides={[slides[0]]} />);
    expect(screen.getByRole("group", { name: "First, 1 of 1" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Next slide" })).not.toBeInTheDocument();
  });

  it("moves through slides with controls, indicators, and keyboard navigation", () => {
    const onIndexChange = vi.fn();
    const { rerender } = render(
      <Carousel
        autoPlay={false}
        defaultIndex={0}
        getIndicatorLabel={(_, index) => `Choose item ${index + 1}`}
        getSlideLabel={(_, index) => `Item ${index + 1}`}
        indicators="dots"
        label="Stories"
        onIndexChange={onIndexChange}
        slides={slides}
      />,
    );
    const carousel = screen.getByRole("region", { name: "Stories" });
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("group", { name: "Item 2" })).toBeVisible();
    expect(onIndexChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole("button", { name: "Choose item 3" }));
    expect(screen.getByRole("group", { name: "Item 3" })).toBeVisible();
    carousel.focus();
    fireEvent.keyDown(carousel, { key: "Home" });
    expect(screen.getByRole("group", { name: "Item 1" })).toBeVisible();
    fireEvent.keyDown(carousel, { key: "End" });
    expect(screen.getByRole("group", { name: "Item 3" })).toBeVisible();
  });

  it("does not stop rotation when Home is used without autoplay", () => {
    render(<Carousel autoPlay={false} defaultIndex={2} label="Manual stories" slides={slides} />);
    const carousel = screen.getByRole("region", { name: "Manual stories" });
    fireEvent.keyDown(carousel, { key: "Home" });
    fireEvent.keyDown(carousel, { key: "x" });
    expect(screen.getByRole("group", { name: "First, 1 of 3" })).toBeVisible();
  });

  it("supports controlled indexes, looping, fractions, and hidden navigation controls", () => {
    const onIndexChange = vi.fn();
    const { rerender } = render(
      <Carousel index={-2} label="Looping" loop indicators="fraction" onIndexChange={onIndexChange} slides={slides} />,
    );
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("group", { name: "First, 1 of 3" })).toBeVisible();
    rerender(<Carousel key="no-controls" defaultIndex={2} indicators="none" label="No controls" showControls={false} slides={slides} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Slide 3 of 3", hidden: true })).toHaveAttribute("data-active", "true");
  });

  it("swipes horizontally but ignores short, vertical, and interactive-target gestures", () => {
    render(<Carousel label="Swipe" slides={slides} />);
    const viewport = screen.getByText("Slide one").parentElement!.parentElement!;
    fireEvent.pointerDown(viewport, { pointerId: 1, pointerType: "touch", clientX: 200, clientY: 100 });
    fireEvent.pointerUp(viewport, { pointerId: 1, pointerType: "touch", clientX: 120, clientY: 110 });
    expect(screen.getByRole("group", { name: "Second, 2 of 3" })).toBeVisible();
    fireEvent.pointerDown(viewport, { pointerId: 2, pointerType: "touch", clientX: 200, clientY: 100 });
    fireEvent.pointerUp(viewport, { pointerId: 3, pointerType: "touch", clientX: 100, clientY: 100 });
    expect(screen.getByRole("group", { name: "Second, 2 of 3" })).toBeVisible();
    fireEvent.pointerDown(viewport, { pointerId: 4, pointerType: "touch", clientX: 200, clientY: 100 });
    fireEvent.pointerUp(viewport, { pointerId: 4, pointerType: "touch", clientX: 180, clientY: 160 });
    expect(screen.getByRole("group", { name: "Second, 2 of 3" })).toBeVisible();
    fireEvent.pointerDown(viewport, { pointerId: 5, pointerType: "mouse", clientX: 200, clientY: 100 });
    fireEvent.pointerUp(viewport, { pointerId: 5, pointerType: "mouse", clientX: 100, clientY: 100 });
    const interactiveSlides = [
      { id: "one", content: <button type="button">Open link</button> },
      { id: "two", content: <p>Second slide</p> },
    ];
    const { rerender } = render(<Carousel label="Interactive swipe" slides={interactiveSlides} />);
    const interactiveViewport = screen.getByRole("region", { name: "Interactive swipe" }).querySelector('[data-slot="viewport"]')!;
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open link" }), { pointerId: 6, pointerType: "touch", clientX: 200, clientY: 100 });
    fireEvent.pointerUp(interactiveViewport, { pointerId: 6, pointerType: "touch", clientX: 100, clientY: 100 });
    expect(screen.getByRole("group", { name: "Slide 1 of 2" })).toBeVisible();
    fireEvent.pointerDown(interactiveViewport, { pointerId: 7, pointerType: "touch", clientX: 200, clientY: 100 });
    fireEvent.pointerCancel(interactiveViewport, { pointerId: 7, pointerType: "touch" });
    fireEvent.pointerUp(interactiveViewport, { pointerId: 7, pointerType: "touch", clientX: 100, clientY: 100 });
    expect(screen.getByRole("group", { name: "Slide 1 of 2" })).toBeVisible();
    rerender(<Carousel label="Interactive swipe" slides={interactiveSlides} />);
    expect(() => render(<Carousel frameAspectRatio={0} label="Invalid" slides={slides} />)).toThrow(RangeError);
  });

  it("stops autoplay when a touch gesture begins", () => {
    render(<Carousel autoPlay label="Autoplay swipe" slides={slides} />);
    const carousel = screen.getByRole("region", { name: "Autoplay swipe" });
    const viewport = carousel.querySelector('[data-slot="viewport"]')!;
    expect(screen.getByRole("button", { name: "Pause automatic slide rotation" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.pointerDown(viewport, { pointerId: 8, pointerType: "touch", clientX: 100, clientY: 100 });
    expect(screen.getByRole("button", { name: "Start automatic slide rotation" })).toHaveAttribute("aria-pressed", "false");
  });

  it("rotates automatically, stops at the final slide, and restarts from the beginning", () => {
    vi.useFakeTimers();
    render(
      <Carousel
        autoPlay
        autoPlayInterval={250}
        label="Rotating stories"
        loop={false}
        slides={slides}
      />,
    );
    const rotation = screen.getByRole("button", { name: "Pause automatic slide rotation" });
    expect(rotation).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(rotation);
    expect(screen.getByRole("button", { name: "Start automatic slide rotation" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "Start automatic slide rotation" }));
    expect(screen.getByRole("group", { name: "First, 1 of 3" })).toBeVisible();
    act(() => vi.advanceTimersByTime(999));
    expect(screen.getByRole("group", { name: "First, 1 of 3" })).toBeVisible();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("group", { name: "Second, 2 of 3" })).toBeVisible();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("group", { name: "Slide 3 of 3" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Start automatic slide rotation" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "Start automatic slide rotation" }));
    expect(screen.getByRole("group", { name: "First, 1 of 3" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Pause automatic slide rotation" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("group", { name: "Second, 2 of 3" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Start automatic slide rotation" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(screen.getByRole("group", { name: "First, 1 of 3" })).toBeVisible();
  });

  it("honors reduced motion, pauses on focus and hover, and forwards event handlers", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    });
    const onFocusCapture = vi.fn();
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    render(
      <Carousel
        autoPlay
        label="Accessible stories"
        onFocusCapture={onFocusCapture}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        reducedMotionLabel="Motion is off"
        slides={slides}
      />,
    );
    const rotation = screen.getByRole("button", { name: "Motion is off" });
    expect(rotation).toBeDisabled();
    expect(rotation).toHaveAttribute("aria-pressed", "false");
    const carousel = screen.getByRole("region", { name: "Accessible stories" });
    fireEvent.mouseEnter(carousel);
    fireEvent.focus(carousel);
    fireEvent.mouseLeave(carousel);
    expect(onMouseEnter).toHaveBeenCalledOnce();
    expect(onMouseLeave).toHaveBeenCalledOnce();
    expect(onFocusCapture).toHaveBeenCalledOnce();
  });

  it("supports carousel keyboard boundaries, autoplay controls, and overlay safe area", () => {
    const onIndexChange = vi.fn();
    const onKeyDown = vi.fn();
    const { rerender } = render(
      <Carousel
        autoPlay
        controlsPosition="overlay"
        defaultIndex={20}
        indicators="fraction"
        label="Keyboard stories"
        loop
        onIndexChange={onIndexChange}
        onKeyDown={onKeyDown}
        overlaySafeArea
        slides={slides}
      />,
    );
    const carousel = screen.getByRole("region", { name: "Keyboard stories" });
    expect(carousel).toHaveAttribute("data-index", "2");
    expect(carousel.querySelector('[data-slot="viewport"]')).toHaveAttribute("data-overlay-safe-area", "true");
    expect(screen.getByText("3 / 3")).toHaveAttribute("aria-live", "off");
    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    expect(screen.getByRole("group", { name: "First, 1 of 3" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Start automatic slide rotation" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(carousel, { key: "Home" });
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(carousel, { key: "End" });
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    rerender(
      <Carousel
        autoPlay
        controlsPosition="overlay"
        defaultIndex={2}
        indicators="dots"
        label="Keyboard stories"
        loop
        onIndexChange={onIndexChange}
        onKeyDown={onKeyDown}
        overlaySafeArea
        slides={slides}
      />,
    );
    const indicator = screen.getByRole("button", { name: "Go to slide 1" });
    fireEvent.click(indicator);
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    expect(onKeyDown).toHaveBeenCalledTimes(4);
  });

  it("does not change slides when a caller prevents keyboard handling or a child handles the key", () => {
    const onIndexChange = vi.fn();
    const onKeyDown = vi.fn((event: React.KeyboardEvent<HTMLElement>) => event.preventDefault());
    const interactive = [
      { id: "one", content: <button type="button">Interactive slide action</button> },
      { id: "two", content: <p>Second slide</p> },
    ];
    render(<Carousel label="Protected carousel" onIndexChange={onIndexChange} onKeyDown={onKeyDown} slides={interactive} />);
    const carousel = screen.getByRole("region", { name: "Protected carousel" });
    fireEvent.keyDown(carousel, { key: "End" });
    expect(onIndexChange).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("button", { name: "Interactive slide action" }), { key: "ArrowRight" });
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("handles non-finite defaults, non-looping boundaries, right swipes, and aspect ratios", () => {
    const onIndexChange = vi.fn();
    render(
      <Carousel
        defaultIndex={Number.NaN}
        frameAspectRatio={1.5}
        label="Finite carousel"
        loop={false}
        onIndexChange={onIndexChange}
        slides={slides}
      />,
    );
    const carousel = screen.getByRole("region", { name: "Finite carousel" });
    const viewport = carousel.querySelector('[data-slot="viewport"]')!;
    expect(carousel).toHaveAttribute("data-index", "0");
    expect(viewport).toHaveAttribute("data-frame-aspect-ratio", "1.5");
    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(onIndexChange).not.toHaveBeenCalled();
    fireEvent.keyDown(carousel, { key: "End" });
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenCalledOnce();
    fireEvent.pointerDown(viewport, { pointerId: 10, pointerType: "touch", clientX: 100, clientY: 100 });
    fireEvent.pointerUp(viewport, { pointerId: 10, pointerType: "touch", clientX: 200, clientY: 100 });
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it("uses the default autoplay interval for non-finite values", () => {
    vi.useFakeTimers();
    const onIndexChange = vi.fn();
    render(<Carousel autoPlay autoPlayInterval={Number.NaN} label="Default interval" onIndexChange={onIndexChange} slides={slides} />);
    act(() => vi.advanceTimersByTime(4999));
    expect(onIndexChange).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });
});

describe("Search", () => {
  it("submits the current query, clears it, and restores focus", () => {
    const onSearch = vi.fn();
    const onClear = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Search
        clearButtonLabel="Reset"
        defaultValue="initial"
        inputAriaDescribedBy="search-help"
        label="Site search"
        onClear={onClear}
        onSearch={onSearch}
        onValueChange={onValueChange}
        placeholder="Find a page"
        required
        showLabel
        submitButtonLabel="Find"
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Site search" });
    expect(input).toHaveAttribute("aria-describedby", "search-help");
    expect(input).toBeRequired();
    fireEvent.change(input, { target: { value: "annual report" } });
    expect(onValueChange).toHaveBeenCalledWith("annual report");
    fireEvent.submit(screen.getByRole("search"));
    expect(onSearch).toHaveBeenCalledWith("annual report", expect.anything());
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("supports controlled read-only inputs, hidden icons, omitted submit, and prevented submits", () => {
    const onSearch = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const { rerender } = render(
      <Search
        clearable={false}
        disabled
        label="Catalog"
        onSearch={onSearch}
        readOnly
        showLeadingIcon={false}
        showSubmitButton={false}
        value="seeds"
      />,
    );
    expect(screen.getByRole("searchbox", { name: "Catalog" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("leading-icon")).not.toBeInTheDocument();
    rerender(<Search label="Catalog" onSearch={onSearch} onSubmit={onSubmit} value="seeds" />);
    fireEvent.submit(screen.getByRole("search"));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("keeps a controlled query unchanged when the clear action is requested", () => {
    const onClear = vi.fn();
    const onValueChange = vi.fn();
    render(<Search label="Controlled search" onClear={onClear} onValueChange={onValueChange} value="seed catalog" />);
    const input = screen.getByRole("searchbox", { name: "Controlled search" });
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("seed catalog");
    expect(input).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledOnce();
  });
});

describe("Rating", () => {
  it("renders display ratings with symbols, accessible labels, and optional value text", () => {
    const { rerender } = render(
      <Rating formatValue={(value, max) => `${value} stars out of ${max}`} label="Review score" max={5} showValue value={4.5} />,
    );
    expect(screen.getByRole("img", { name: "4.5 out of 5 stars" })).toBeInTheDocument();
    expect(screen.getByText("4.5 stars out of 5")).toBeInTheDocument();
    rerender(
      <Rating
        getRatingLabel={(value) => `Avis ${value}`}
        label="Guest experience"
        showValue={false}
        symbol="heart"
        value={3}
      />,
    );
    expect(screen.getByRole("img", { name: "Avis 3" })).toBeInTheDocument();
    expect(screen.queryByText("3/5")).not.toBeInTheDocument();
    rerender(<Rating label="No review yet" showValue value={0} />);
    expect(screen.getByText("0/5")).toBeInTheDocument();
    expect(() => render(<Rating max={0} value={1} />)).toThrow(RangeError);
    expect(() => render(<Rating max={3} value={4} />)).toThrow(RangeError);
    expect(() => render(<Rating getRatingLabel={() => " "} value={2} />)).toThrow(/non-empty text/);
    expect(() => render(<Rating label="Invalid input value" mode="input" step={0.5} value={1.25} />)).toThrow(RangeError);
  });

  it("accepts whole and half-star input, previews on hover, and invokes change callbacks", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Rating description="Select a score" mode="input" onValueChange={onValueChange} label="Service" showValue defaultValue={2} />,
    );
    const group = screen.getByRole("group", { name: "Service" });
    fireEvent.mouseEnter(screen.getByRole("radio", { name: "4 out of 5 stars" }).parentElement!);
    fireEvent.click(screen.getByRole("radio", { name: "4 out of 5 stars" }));
    expect(onValueChange).toHaveBeenCalledWith(4);
    expect(screen.getByText("4/5")).toBeInTheDocument();
    fireEvent.mouseLeave(group.querySelector('[data-step="1"]')!);
    expect(screen.getByText("Select a score")).toBeInTheDocument();

    rerender(
      <Rating
        mode="input"
        label="Half score"
        max={3}
        onValueChange={onValueChange}
        step={0.5}
        symbol="thumbs"
        value={1.5}
      />,
    );
    fireEvent.mouseEnter(screen.getByRole("radio", { name: "0.5 out of 3 thumbs up" }).parentElement!);
    fireEvent.click(screen.getByRole("radio", { name: "2 out of 3 thumbs up" }));
    expect(onValueChange).toHaveBeenLastCalledWith(2);
    expect(() => render(<Rating mode="input" label="Invalid step" step={0.25 as 1} />)).toThrow(RangeError);
  });

  it("does not preview disabled whole- or half-step inputs", () => {
    const { rerender } = render(
      <Rating
        defaultValue={0}
        disabled
        label="Disabled whole rating"
        mode="input"
        showValue
      />,
    );
    const wholeStar = screen.getByRole("radio", { name: "1 out of 5 stars" });
    fireEvent.mouseEnter(wholeStar.parentElement!);
    expect(wholeStar).toBeDisabled();
    expect(screen.getByText("—")).toBeInTheDocument();

    rerender(
      <Rating disabled label="Disabled half rating" mode="input" showValue step={0.5} defaultValue={0} />,
    );
    const halfStar = screen.getByRole("radio", { name: "0.5 out of 5 stars" });
    fireEvent.mouseEnter(halfStar.parentElement!);
    expect(halfStar).toBeDisabled();
    expect(screen.getByText("—")).toBeInTheDocument();
    rerender(<Rating disabled label="Disabled half rating" mode="input" showValue step={0.5} value={1} />);
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("renders an empty controlled input rating and previews a value without committing it", () => {
    render(<Rating label="Empty controlled rating" mode="input" onValueChange={vi.fn()} showValue value={null} />);
    const group = screen.getByRole("group", { name: "Empty controlled rating" });
    expect(screen.getByText("—")).toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByRole("radio", { name: "1 out of 5 stars" }).parentElement!);
    expect(group.querySelector('[data-rating-option="1"]')).toHaveAttribute("data-filled", "true");
    fireEvent.mouseLeave(group.querySelector('[data-step="1"]')!);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(group.querySelector('[data-rating-option="1"]')).toHaveAttribute("data-filled", "false");
  });
});
