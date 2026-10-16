import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityFeed, type ActivityFeedItem } from "./ActivityFeed";

const event: ActivityFeedItem = {
  id: "published-article",
  actor: "Mara Ellison",
  action: "published",
  subject: "Spring service guide",
  href: "/articles/spring-service-guide",
  dateText: "October 16, 2026 at 10:30 AM",
  dateTime: "2026-10-16T10:30:00-04:00",
  details: "The new article is now available to readers.",
};

describe("ActivityFeed", () => {
  it("renders a named section and ordered events with linked subjects and time", () => {
    render(<ActivityFeed events={[event]} />);

    expect(screen.getByRole("region", { name: "Recent activity" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Recent activity" })).toBeInTheDocument();
    expect(screen.getByRole("list").tagName).toBe("OL");
    expect(screen.getByText("Mara Ellison")).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Spring service guide" })).toHaveAttribute(
      "href",
      "/articles/spring-service-guide",
    );
    expect(screen.getByText("October 16, 2026 at 10:30 AM")).toHaveAttribute(
      "datetime",
      "2026-10-16T10:30:00-04:00",
    );
    expect(screen.getByText("The new article is now available to readers.")).toBeInTheDocument();
  });

  it("renders description, decorative avatars, and non-linked subjects", () => {
    render(
      <ActivityFeed
        description="Updates across your workspace."
        events={[
          {
            id: "edited-page",
            actor: "Theo Park",
            action: "edited",
            subject: "About page",
            avatar: <span data-testid="author-avatar">TP</span>,
            dateText: "Just now",
            dateTime: "2026-10-16T10:40:00-04:00",
          },
        ]}
        heading="Workspace updates"
        headingLevel={3}
      />,
    );

    const avatar = screen.getByTestId("author-avatar");
    expect(screen.getByRole("region", { name: "Workspace updates" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Workspace updates" })).toBeInTheDocument();
    expect(screen.getByText("Updates across your workspace.")).toBeInTheDocument();
    expect(avatar.closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.getByText("About page")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "About page" })).not.toBeInTheDocument();
  });

  it("renders its configurable empty message when no events are provided", () => {
    render(
      <ActivityFeed
        emptyMessage="Your team's publishing activity will show here."
        events={[]}
      />,
    );

    expect(screen.getByRole("region", { name: "Recent activity" })).toBeInTheDocument();
    expect(screen.getByText("Your team's publishing activity will show here.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("forwards section attributes, className, and refs and accepts an external label", () => {
    const ref = createRef<HTMLElement>();
    render(
      <>
        <span id="workspace-activity-label">Team activity panel</span>
        <ActivityFeed
          aria-labelledby="workspace-activity-label"
          className="consumer-activity-feed"
          data-testid="activity-feed"
          events={[]}
          id="workspace-activity"
          ref={ref}
        />
      </>,
    );

    const section = screen.getByTestId("activity-feed");
    expect(screen.getByRole("region", { name: "Team activity panel" })).toBe(section);
    expect(section).toHaveAttribute("id", "workspace-activity");
    expect(section).toHaveClass("consumer-activity-feed");
    expect(ref.current).toBe(section);
  });
});
