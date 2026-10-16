import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs/Breadcrumbs";
import { BottomMenu } from "./BottomMenu/BottomMenu";
import { ContactSection } from "./ContactSection/ContactSection";
import { ContentMetadataPanel } from "./ContentMetadataPanel/ContentMetadataPanel";
import { LocationHours } from "./LocationHours/LocationHours";
import { PricingDetails } from "./PricingDetails/PricingDetails";
import { RevisionHistory } from "./RevisionHistory/RevisionHistory";
import { ServicesSection } from "./ServicesSection/ServicesSection";
import { Testimonials } from "./Testimonials/Testimonials";
import { Toast } from "./Toast/Toast";

describe("breadcrumb and bottom navigation", () => {
  it("renders validated breadcrumbs and expands collapsed intermediate links", () => {
    const { rerender } = render(
      <Breadcrumbs
        collapseAt="40rem"
        items={[
          { label: "Home", href: "/" },
          { label: "Journal", href: "/journal" },
          { label: "Gardening", href: "/journal/gardening" },
          { label: "Current", current: true },
        ]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Current")).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: "Show 2 hidden breadcrumb levels" }));
    expect(screen.getByRole("button", { name: "Hide intermediate breadcrumb levels" })).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelectorAll("[data-intermediate='true']")).toHaveLength(2);
    rerender(<Breadcrumbs items={[{ label: "Current", current: true }]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(() => render(<Breadcrumbs items={[]} />)).toThrow(RangeError);
  });

  it("supports bottom-menu links, actions, active state, disabled items, and prevented selection", () => {
    const onActiveChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <BottomMenu
        action={<button>More actions</button>}
        defaultActiveId="home"
        iconOnly
        items={[
          { id: "home", label: "Home", href: "/", icon: <span>H</span> },
          { id: "saved", label: "Saved", badge: "2", onClick: (event) => event.preventDefault(), onSelect },
          { id: "disabled", label: "Disabled", href: "/disabled", disabled: true },
        ]}
        onActiveChange={onActiveChange}
      />,
    );
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "More actions" })).toBeInTheDocument();
    expect(screen.getByTestId("bottom-menu-item-disabled")).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(screen.getByTestId("bottom-menu-item-saved"));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it("honors controlled bottom-menu state and ignores disabled and cancelled actions", () => {
    const onActiveChange = vi.fn();
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault());
    const { rerender } = render(
      <BottomMenu
        activeId="first"
        items={[
          { id: "first", label: "First", onClick },
          { id: "second", label: "Second" },
          { id: "locked", label: "Locked", disabled: true },
        ]}
        onActiveChange={onActiveChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "First" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onActiveChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(onActiveChange).toHaveBeenCalledWith("second", expect.objectContaining({ id: "second" }));
    fireEvent.click(screen.getByRole("button", { name: "Locked" }));
    expect(onActiveChange).toHaveBeenCalledTimes(1);
    rerender(
      <BottomMenu
        items={[{ id: "first", label: "First", href: "/first" }, { id: "second", label: "Second", href: "/second" }]}
      />,
    );
    expect(screen.getByRole("link", { name: "Second" })).toHaveAttribute("href", "/second");
  });
});

describe("contact and service sections", () => {
  it("renders contact details, schedules, action, and form slots", () => {
    render(
      <ContactSection
        action={<a href="/book">Book a visit</a>}
        address={{ lines: ["12 Garden Lane", "Portland"], directionsHref: "/directions" }}
        contactMethods={[
          { id: "phone", label: "Phone", value: "(555) 0100", href: "tel:+15550100", icon: <span>P</span> },
          { id: "email", label: "Email", value: "hello@example.com", href: "mailto:hello@example.com", icon: false },
        ]}
        description="Talk with our local team."
        form={<form aria-label="Contact form"><input aria-label="Your name" /></form>}
        heading="Get in touch"
        headingLevel={5}
        hours={[{ id: "mon", day: "Monday", hours: "9–5" }]}
        hoursHeading="Opening hours"
        hoursStatus={<span role="status">Open today</span>}
        hoursSupplement={<p>Holiday hours may vary.</p>}
        layout="stacked"
        variant="surface"
      />,
    );
    expect(screen.getByRole("region", { name: "Get in touch" })).toHaveAttribute("data-has-form", "true");
    expect(screen.getByRole("heading", { level: 5, name: "Get in touch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Visit us" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get directions" })).toHaveAttribute("href", "/directions");
    expect(screen.getByRole("link", { name: "(555) 0100" })).toHaveAttribute("href", "tel:+15550100");
    expect(screen.getByText("Monday").nextElementSibling).toHaveTextContent("9–5");
    expect(screen.getByRole("status")).toHaveTextContent("Open today");
    expect(screen.getByText("Holiday hours may vary.")).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Contact form" })).toBeInTheDocument();
  });

  it("omits empty contact details and false optional slots", () => {
    const { container, rerender } = render(
      <ContactSection
        action={false}
        address={{ lines: [] }}
        form={false}
        heading="Contact options"
        hoursStatus={false}
        hoursSupplement={false}
      />,
    );
    expect(screen.getByRole("region", { name: "Contact options" })).not.toHaveAttribute("data-has-form");
    expect(container.querySelector('[class*="details"]')).toBeNull();
  });

  it("shows an address-only details group without contact methods or hours", () => {
    render(<ContactSection address={{ lines: ["8 Garden Lane"] }} heading="Studio address" />);
    expect(screen.getByText("8 Garden Lane")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Visit us" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Contact" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Business hours" })).not.toBeInTheDocument();
  });

  it("supports services sections with and without headings and optional card content", () => {
    const { rerender } = render(
      <ServicesSection
        description="Thoughtful work for every season."
        eyebrow="What we do"
        heading="Our services"
        items={[
          { id: "design", title: "Garden design", eyebrow: "Plan", icon: <span>D</span>, description: "A tailored plan.", link: { href: "/design", target: "_blank" } },
          { id: "care", title: "Garden care", image: <img alt="Garden" src="/garden.jpg" />, action: <button>Ask about care</button> },
          { id: "simple", title: "Soil testing" },
        ]}
      />,
    );
    expect(screen.getByRole("region", { name: "Our services" })).toHaveAttribute("data-columns", "3");
    expect(screen.getByRole("heading", { name: "Garden design" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more about Garden design" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("button", { name: "Ask about care" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Garden" })).toBeInTheDocument();
    rerender(<ServicesSection aria-label="Offerings" items={[]} />);
    expect(screen.getByRole("region", { name: "Offerings" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    rerender(<ServicesSection items={[{ id: "simple", title: "Soil testing" }]} />);
    expect(screen.getByRole("region", { name: "Services" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Learn more about Soil testing/ })).not.toBeInTheDocument();
  });
});

describe("testimonials and pricing", () => {
  it("renders testimonial ratings, author details, and accessible section naming", () => {
    render(
      <Testimonials
        description="Feedback from our clients."
        getRatingLabel={(rating) => `${rating} star review`}
        heading="Client stories"
        items={[
          {
            id: "first",
            quote: "The garden feels completely renewed.",
            author: { name: "Sam Lee", role: "Homeowner", company: "Portland", avatar: { src: "/sam.jpg" } },
            rating: 5,
          },
          { id: "second", quote: "Excellent work.", author: { name: "Jordan" } },
        ]}
      />,
    );
    expect(screen.getByRole("region", { name: "Client stories" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "5 star review" })).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute("src", "/sam.jpg");
    expect(screen.getByText("Homeowner").parentElement).toHaveTextContent("Homeowner");
    expect(screen.getByText("Portland")).toBeInTheDocument();
    expect(screen.getByText("The garden feels completely renewed.")).toBeInTheDocument();
    expect(() => render(<Testimonials items={[{ id: "featured", quote: "Good.", author: { name: "A" } }, { id: "more", quote: "Fine.", author: { name: "B" } }]} layout="featured" />)).toThrow(/exactly one/);
  });

  it("renders complete and minimal pricing details with provided actions", () => {
    const { rerender } = render(
      <PricingDetails
        actions={<button>Choose plan</button>}
        badge="Popular"
        billingPeriod="per month"
        compareAtPrice="$160"
        details={[{ id: "visits", label: "Visits", value: "4", description: "Per month", emphasis: true }]}
        detailsLabel="Included"
        description="For established gardens."
        eyebrow="Maintenance"
        features={<ul><li>Seasonal pruning</li></ul>}
        footer="Cancel anytime"
        headingLevel={3}
        price="$120"
        priceLabel="Monthly price"
        pricePrefix="from"
        priceSuffix="USD"
        title="Garden care"
      />,
    );
    expect(screen.getByRole("article", { name: "Garden care" })).toHaveAttribute("data-variant", "surface");
    expect(screen.getByRole("heading", { level: 3, name: "Garden care" })).toBeInTheDocument();
    expect(screen.getByText("$120").parentElement?.parentElement).toHaveAttribute("aria-label", "Monthly price");
    expect(screen.getByText("$160").closest("del")).toBeInTheDocument();
    expect(screen.getByText("Per month")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose plan" })).toBeInTheDocument();
    expect(screen.getByText("Cancel anytime")).toBeInTheDocument();
    rerender(<PricingDetails primaryAction={<button>Start</button>} secondaryAction={<a href="/learn">Learn</a>} title="Basic" />);
    expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/learn");
  });

  it("omits empty pricing slots and honors an explicit accessible label", () => {
    const { container, rerender } = render(
      <>
        <h2 id="pricing-heading">Plans and pricing</h2>
        <PricingDetails
          aria-labelledby="pricing-heading"
          details={[{ id: "included", label: "Included", value: "Seasonal care" }]}
          title="Basic plan"
        />
      </>,
    );
    const article = container.querySelector("article");
    expect(article).toHaveAttribute("aria-labelledby", "pricing-heading");
    expect(article).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("article", { name: "Plans and pricing" })).toBeInTheDocument();
    expect(screen.getByText("Included").parentElement).not.toHaveAttribute("data-emphasis");
    expect(container.querySelector('[data-slot="actions"]')).toBeNull();
    rerender(<PricingDetails aria-label="Explicit plan label" title="Basic plan" />);
    expect(container.querySelector("article")).toHaveAttribute("aria-label", "Explicit plan label");
    expect(container.querySelector("article")).not.toHaveAttribute("aria-labelledby");
  });
});

describe("metadata and history", () => {
  it("updates metadata fields and previews selected social images", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ContentMetadataPanel
        defaultValue={{ slug: "garden//care/", seoTitle: "Garden care", metaDescription: "A useful guide." }}
        images={[
          { id: "image-1", url: "/social.jpg", label: "Garden image", altText: "Green garden" },
          { id: "image-2", url: "/social-fallback.jpg", label: "Image label fallback", altText: "" },
        ]}
        onChange={onChange}
        siteName="Meadow & Mill"
        siteUrl="https://example.com/"
      />,
    );
    expect(screen.getByText("https://example.com/garden/care")).toBeInTheDocument();
    expect(screen.getByText("Meadow & Mill")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Page URL slug"), { target: { value: "/new//care/" } });
    expect(screen.getByText("https://example.com/new/care")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("SEO title"), { target: { value: "Updated title" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ seoTitle: "Updated title" }));
    fireEvent.change(screen.getByLabelText("Meta description"), { target: { value: "Updated description" } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ metaDescription: "Updated description" }));
    fireEvent.change(screen.getByLabelText("Social sharing image"), { target: { value: "image-1" } });
    expect(screen.getByRole("img", { name: "Green garden" })).toHaveAttribute("src", "/social.jpg");
    fireEvent.change(screen.getByLabelText("Social sharing image"), { target: { value: "image-2" } });
    expect(screen.getByRole("img", { name: "Image label fallback" })).toHaveAttribute("src", "/social-fallback.jpg");
    fireEvent.change(screen.getByLabelText("Social sharing image"), { target: { value: "" } });
    expect(screen.getByText("No social image selected")).toBeInTheDocument();
    expect(screen.getAllByText("Updated title")).toHaveLength(2);
    rerender(
      <ContentMetadataPanel
        onChange={onChange}
        siteUrl="https://example.com"
        value={{ slug: "controlled", seoTitle: "Controlled title", metaDescription: "Controlled description" }}
      />,
    );
    fireEvent.change(screen.getByLabelText("Page URL slug"), { target: { value: "next-page" } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ slug: "next-page" }));
    expect(screen.getByLabelText("Page URL slug")).toHaveValue("controlled");
  });

  it("renders fallback metadata previews and disables editing when requested", () => {
    render(<ContentMetadataPanel disabled siteUrl="invalid-site" />);
    expect(screen.getByLabelText("Page URL slug")).toBeDisabled();
    expect(screen.getByLabelText("SEO title")).toBeDisabled();
    expect(screen.getAllByText("invalid-site").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Your page title")).toHaveLength(2);
    expect(screen.getByText("No social image selected")).toBeInTheDocument();
  });

  it("uses the example host when both the site URL and page slug are empty", () => {
    render(<ContentMetadataPanel defaultValue={{ slug: "" }} siteUrl="" />);
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Page URL slug"), { target: { value: "garden" } });
    expect(screen.getByText("https://example.com/garden")).toBeInTheDocument();
  });

  it("renders empty, loading, current, and actionable revision history states", () => {
    const onCompare = vi.fn();
    const onRestore = vi.fn();
    const revisions = [
      { id: "current", version: "v3", author: "A. Editor", dateText: "Today", summary: "Current content" },
      { id: "old", version: "v2", author: "B. Editor", dateText: "Yesterday", dateTime: "2026-10-15", summary: "Earlier content" },
    ];
    const { rerender } = render(<RevisionHistory currentRevisionId="current" onCompare={onCompare} onRestore={onRestore} revisions={revisions} />);
    expect(screen.getByRole("list", { name: "Content versions" })).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Compare v2" }));
    fireEvent.click(screen.getByRole("button", { name: "Restore v2" }));
    expect(onCompare).toHaveBeenCalledWith(revisions[1]);
    expect(onRestore).toHaveBeenCalledWith(revisions[1]);
    rerender(<RevisionHistory loading revisions={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading revision history");
    rerender(<RevisionHistory emptyMessage="No history" revisions={[]} />);
    expect(screen.getByText("No history")).toBeInTheDocument();
  });

  it("shows the active compare or restore action as busy and uses singular version text", () => {
    const revisions = [
      { id: "current", version: "v2", author: "Editor", dateText: "Today", summary: "Current" },
      { id: "old", version: "v1", author: "Editor", dateText: "Yesterday", summary: "Earlier" },
    ];
    const { rerender } = render(
      <RevisionHistory busyAction="compare" busyRevisionId="old" onCompare={vi.fn()} onRestore={vi.fn()} revisions={revisions} />,
    );
    const section = screen.getByRole("region", { name: "Revision history" });
    expect(section).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Compare v1" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Restore v1" })).toBeDisabled();
    rerender(<RevisionHistory busyAction="restore" busyRevisionId="old" onCompare={vi.fn()} onRestore={vi.fn()} revisions={revisions} />);
    expect(screen.getByRole("button", { name: "Restore v1" })).toHaveAttribute("aria-busy", "true");
    rerender(<RevisionHistory revisions={[revisions[0]]} />);
    expect(screen.getByText("1 version")).toBeInTheDocument();
  });
});

describe("location hours and toast", () => {
  it("composes location, phone, map, and special-hours content", () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <LocationHours
        address={{ lines: ["1 Main Street"], directionsHref: "/map" }}
        heading="Visit Meadow & Mill"
        hours={[{ id: "mon", day: "Monday", hours: "9 am–5 pm" }]}
        map={<iframe title="Map" src="/map" />}
        phone={{ value: "555-0100", href: "tel:5550100" }}
        specialHours={[
          { id: "holiday", date: "2099-12-25", label: "Christmas", hours: "Closed", intervals: [] },
          { id: "new-year", date: "2099-12-31", hours: "10 am–2 pm", intervals: [] },
        ]}
        timeZone="UTC"
      />,
    );
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole("region", { name: "Visit Meadow & Mill" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "555-0100" })).toHaveAttribute("href", "tel:5550100");
    expect(screen.getByRole("complementary", { name: "Map showing the location" })).toBeInTheDocument();
    expect(screen.getByText("Christmas")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(document.querySelector('time[datetime="2099-12-31"]')).toBeInTheDocument();
    unmount();
    vi.useRealTimers();
  });

  it("omits time-sensitive status and optional map and contact content", () => {
    render(<LocationHours address={{ lines: [] }} heading="No hours today" hours={[]} />);
    expect(screen.getByRole("region", { name: "No hours today" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /phone/i })).not.toBeInTheDocument();
  });

  it("shows live open or closed status for a complete weekly schedule", () => {
    const week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
      (day, dayOfWeek) => ({
        id: day.toLowerCase(),
        day,
        dayOfWeek: dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        hours: "Closed",
        intervals: [],
      }),
    );
    render(
      <LocationHours
        address={{ lines: ["1 Main Street"] }}
        heading="Live hours"
        hours={week}
        openStatus={{ timeZone: "UTC" }}
      />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders toast actions and immediately dismisses in no-motion mode", () => {
    const onDismiss = vi.fn();
    const onAction = vi.fn();
    render(
      <Toast
        action={{ label: "Undo", onClick: onAction }}
        description="The changes were saved."
        duration={0}
        motion="none"
        onDismiss={onDismiss}
        title="Saved"
        variant="success"
      />,
    );
    expect(screen.getByRole("status")).toHaveAttribute("data-motion-state", "open");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("uses alert semantics for errors and dismisses directly when reduced motion is set by no-motion", () => {
    const onDismiss = vi.fn();
    render(<Toast closeLabel="Close alert" duration={0} motion="none" onDismiss={onDismiss} title="Failed" variant="error" />);
    fireEvent.click(screen.getByRole("button", { name: "Close alert" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
