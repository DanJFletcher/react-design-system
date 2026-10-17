import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import styles from "./PortfolioSection.module.css";
import {
  PortfolioSection,
  type PortfolioItem,
} from "./PortfolioSection";

const completeProject: PortfolioItem = {
  id: "courtyard",
  title: "A calmer city courtyard",
  description: "A small garden designed for quiet mornings.",
  category: "Garden design",
  location: "Toronto, ON",
  completedAt: {
    dateTime: "2026-05",
    label: "Completed May 2026",
  },
  image: {
    src: "/courtyard.jpg",
    alt: "A planted city courtyard",
  },
  link: {
    href: "/projects/courtyard",
    label: "Explore courtyard",
  },
};

describe("PortfolioSection", () => {
  it("renders project content, metadata, actions, and a named section", () => {
    const ref = createRef<HTMLElement>();
    render(
      <PortfolioSection
        action={<button type="button">Plan a project</button>}
        className="custom-section"
        description="Selected spaces from our recent work."
        eyebrow="Our work"
        heading="Projects made for real life"
        id="project-portfolio"
        items={[completeProject]}
        ref={ref}
        style={{ "--ds-card-radius": "8px" }}
      />,
    );

    const section = screen.getByRole("region", {
      name: "Projects made for real life",
    });
    const card = within(section).getByRole("article", {
      name: "A calmer city courtyard",
    });

    expect(section).toHaveClass(styles.portfolio, "custom-section");
    expect(section).toHaveAttribute("id", "project-portfolio");
    expect(section.style.getPropertyValue("--ds-card-radius")).toBe("8px");
    expect(ref.current).toBe(section);
    expect(
      within(section).getByRole("heading", {
        name: "Projects made for real life",
        level: 2,
      }),
    ).toBeVisible();
    expect(within(card).getByText("Garden design")).toBeVisible();
    expect(within(card).getByText("Toronto, ON")).toBeVisible();
    expect(within(card).getByText("Completed May 2026")).toHaveAttribute(
      "datetime",
      "2026-05",
    );
    expect(
      within(card).getByRole("img", { name: "A planted city courtyard" }),
    ).toHaveAttribute("loading", "lazy");
    expect(
      within(card).getByRole("link", {
        name: "A calmer city courtyard",
      }),
    ).toHaveAttribute("href", "/projects/courtyard");
    expect(
      within(card).getByRole("link", {
        name: "Explore courtyard: A calmer city courtyard",
      }),
    ).toHaveAttribute("href", "/projects/courtyard");
    expect(
      within(section).getByRole("button", { name: "Plan a project" }),
    ).toBeVisible();
  });

  it("forwards custom image loading, decoding, class, and link attributes", () => {
    const project: PortfolioItem = {
      ...completeProject,
      image: {
        src: "/courtyard.jpg",
        alt: "A planted city courtyard",
        className: "consumer-image",
        decoding: "sync",
        loading: "eager",
      },
      link: {
        href: "/projects/courtyard",
        target: "_blank",
        rel: "noreferrer",
      },
    };

    render(<PortfolioSection heading="Work" items={[project]} />);

    const section = screen.getByRole("region", { name: "Work" });
    const image = within(section).getByRole("img", {
      name: "A planted city courtyard",
    });
    const links = within(section).getAllByRole("link");

    expect(image).toHaveClass(styles.image, "consumer-image");
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("decoding", "sync");
    expect(links[0]).toHaveAttribute("target", "_blank");
    expect(links[0]).toHaveAttribute("rel", "noreferrer");
  });

  it("supports custom heading levels and consumer-provided region labels", () => {
    render(
      <>
        <span id="external-label">External case studies</span>
        <PortfolioSection
          aria-label="Featured case studies"
          aria-labelledby="external-label"
          heading="What we have built"
          headingLevel={4}
          items={[{ id: "one", title: "First project" }]}
        />
      </>,
    );

    const section = screen.getByRole("region", {
      name: "External case studies",
    });
    expect(section).toHaveAttribute("aria-labelledby", "external-label");
    expect(
      within(section).getByRole("heading", {
        name: "What we have built",
        level: 4,
      }),
    ).toBeVisible();
    expect(
      within(section).getByRole("heading", {
        name: "First project",
        level: 5,
      }),
    ).toBeVisible();
  });

  it("renders an accessible empty state without an optional section header", () => {
    render(
      <PortfolioSection
        aria-label="Project archive"
        emptyMessage="No completed projects yet."
        items={[]}
        variant="accent"
      />,
    );

    const section = screen.getByRole("region", { name: "Project archive" });
    expect(section).toHaveAttribute("data-variant", "accent");
    expect(within(section).getByText("No completed projects yet.")).toBeVisible();
    expect(within(section).queryByRole("list")).not.toBeInTheDocument();
    expect(within(section).queryByRole("banner")).not.toBeInTheDocument();
  });

  it("uses a default label and empty message when content is omitted", () => {
    render(<PortfolioSection items={[]} />);

    const section = screen.getByRole("region", { name: "Project portfolio" });
    expect(within(section).getByText("No projects to show.")).toBeVisible();
    expect(within(section).queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders projects without optional media, metadata, category, and actions", () => {
    render(
      <PortfolioSection
        heading="Work"
        items={[
          {
            id: "simple",
            title: "A simple project",
            action: false,
          },
        ]}
      />,
    );

    const section = screen.getByRole("region", { name: "Work" });
    const card = within(section).getByRole("article", {
      name: "A simple project",
    });

    expect(within(card).queryByRole("img")).not.toBeInTheDocument();
    expect(within(card).queryByRole("link")).not.toBeInTheDocument();
    expect(within(card).queryByText("A simple project")).toBeVisible();
  });

  it("renders an item action without requiring a project link", () => {
    render(
      <PortfolioSection
        heading="Work"
        items={[
          {
            id: "consult",
            title: "A project with a custom action",
            action: <button type="button">Ask a question</button>,
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Ask a question" })).toBeVisible();
  });
});
