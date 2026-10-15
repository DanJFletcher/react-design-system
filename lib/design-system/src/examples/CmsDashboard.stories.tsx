import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import {
  Badge,
  Button,
  Dialog,
  Icon,
  Search,
  SideNavigation,
  Table,
  Tabs,
  type SideNavigationEntry,
  type TableColumn,
  type TableSort,
  type TabsItem,
} from "../index";
import styles from "./CmsDashboard.module.css";

type ArticleStatus = "Draft" | "In review" | "Scheduled" | "Published";
type Article = {
  id: number;
  title: string;
  author: string;
  initials: string;
  category: string;
  status: ArticleStatus;
  updated: string;
  readTime: string;
};
type StatusFilter = "all" | "draft" | "review" | "scheduled" | "published";

const initialArticles: Article[] = [
  { id: 1, title: "The quiet craft of keeping a garden", author: "Mara Ellison", initials: "ME", category: "Field notes", status: "In review", updated: "12 min ago", readTime: "6 min read" },
  { id: 2, title: "A table set for the in-between", author: "Theo Park", initials: "TP", category: "Culture", status: "Draft", updated: "1 hour ago", readTime: "4 min read" },
  { id: 3, title: "Where the river bends", author: "Lena Ortiz", initials: "LO", category: "Places", status: "Scheduled", updated: "Yesterday", readTime: "8 min read" },
  { id: 4, title: "Notes from a neighborhood bakery", author: "Mara Ellison", initials: "ME", category: "People", status: "Published", updated: "Mon, 14 Apr", readTime: "5 min read" },
  { id: 5, title: "An atlas of small rituals", author: "Jules Bell", initials: "JB", category: "Culture", status: "Draft", updated: "Mon, 14 Apr", readTime: "7 min read" },
];

const statusTabs: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All articles" },
  { id: "draft", label: "Drafts" },
  { id: "review", label: "In review" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
];

const articleColumns: TableColumn<Article>[] = [
  {
    id: "title",
    header: "Title",
    accessor: "title",
    sortable: true,
    sortLabel: "Sort by title",
    cell: ({ row }) => (
      <div className={styles.articleCell}>
        <button className={styles.articleTitle} type="button" onClick={() => window.dispatchEvent(new CustomEvent("juniper-article-open", { detail: row.title }))}>
          {row.title}
        </button>
        <span>{row.category} <i aria-hidden="true">·</i> {row.readTime}</span>
      </div>
    ),
  },
  {
    id: "author",
    header: "Author",
    accessor: "author",
    sortable: true,
    cell: ({ row }) => <span className={styles.author}><span className={styles.authorAvatar}>{row.initials}</span>{row.author}</span>,
  },
  {
    id: "status",
    header: "Status",
    accessor: "status",
    sortable: true,
    cell: ({ value }) => <StatusBadge status={value as ArticleStatus} />,
  },
  {
    id: "updated",
    header: "Last updated",
    accessor: "updated",
    sortable: true,
    cell: ({ value }) => <span className={styles.updatedCell}>{value as string}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    align: "end",
    cell: ({ row }) => (
      <button className={styles.rowMore} aria-label={`More actions for ${row.title}`} type="button" onClick={() => window.dispatchEvent(new CustomEvent("juniper-article-more", { detail: row.title }))}>
        <Icon name="list" size="sm" />
      </button>
    ),
  },
];

const meta = {
  title: "Examples/CMS Dashboard",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: { description: { story: "A responsive, frontend-only editorial workspace for the small publishing team at Juniper Press." } },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CmsDashboard />,
};

export const Interactions: Story = {
  name: "Interactions",
  render: () => <CmsDashboard />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /Good morning, Mara/ })).toBeVisible();

    const articlesNavigation = canvas.getByRole("link", { name: /Articles/ });
    await userEvent.click(articlesNavigation);
    await expect(articlesNavigation).toHaveAttribute("aria-current", "page");

    await userEvent.click(canvas.getByRole("tab", { name: "Drafts" }));
    let activePanel = within(canvas.getByRole("tabpanel"));
    await expect(activePanel.getByRole("status")).toHaveTextContent("2 articles");
    await expect(activePanel.getByText("A table set for the in-between")).toBeVisible();
    await expect(activePanel.queryByText("The quiet craft of keeping a garden")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("tab", { name: "All articles" }));
    const search = canvas.getByRole("searchbox", { name: "Search articles" });
    await userEvent.type(search, "river");
    activePanel = within(canvas.getByRole("tabpanel"));
    await expect(activePanel.getByText("Where the river bends")).toBeVisible();
    await expect(activePanel.queryByText("An atlas of small rituals")).not.toBeInTheDocument();
    await userEvent.clear(search);

    const table = canvas.getByRole("table", { name: "Juniper Press articles" });
    await userEvent.click(within(table).getByRole("button", { name: "Sort by title" }));
    await expect(within(table).getByRole("columnheader", { name: /Title/ })).toHaveAttribute("aria-sort", "ascending");

    await userEvent.click(canvas.getByRole("button", { name: "New article" }));
    const dialog = canvas.getByRole("dialog", { name: "Start a new article" });
    await userEvent.type(within(dialog).getByRole("textbox", { name: "Article title" }), "A small press, a big idea");
    await userEvent.click(within(dialog).getByRole("button", { name: "Create draft" }));
    await expect(canvas.getByTestId("dashboard-feedback")).toHaveTextContent("Draft created");
    await expect(within(canvas.getByRole("tabpanel")).getByText("A small press, a big idea")).toBeVisible();
  },
};

function CmsDashboard() {
  const [articles, setArticles] = useState(initialArticles);
  const [activeNav, setActiveNav] = useState("overview");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<TableSort | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [notice, setNotice] = useState("");
  const newArticleTrigger = useRef<HTMLButtonElement>(null);
  const dialogWasOpen = useRef(false);

  useEffect(() => {
    if (!dialogOpen && dialogWasOpen.current) newArticleTrigger.current?.focus();
    dialogWasOpen.current = dialogOpen;
  }, [dialogOpen]);

  useEffect(() => {
    const handleArticleOpen = (event: Event) => setNotice(`Opened “${(event as CustomEvent<string>).detail}” in the local preview.`);
    const handleArticleMore = (event: Event) => setNotice(`More options for “${(event as CustomEvent<string>).detail}”`);
    const handleActivity = () => setNotice("You’re viewing the latest article activity.");
    window.addEventListener("juniper-article-open", handleArticleOpen);
    window.addEventListener("juniper-article-more", handleArticleMore);
    window.addEventListener("juniper-activity", handleActivity);
    return () => {
      window.removeEventListener("juniper-article-open", handleArticleOpen);
      window.removeEventListener("juniper-article-more", handleArticleMore);
      window.removeEventListener("juniper-activity", handleActivity);
    };
  }, []);

  const filteredArticles = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return articles.filter((article) => {
      const selectedStatus = statusTabs.find((tab) => tab.id === filter)?.label;
      const statusMatch = filter === "all" || article.status === (selectedStatus === "Drafts" ? "Draft" : selectedStatus);
      const searchMatch = !normalized || `${article.title} ${article.author} ${article.category}`.toLocaleLowerCase().includes(normalized);
      return statusMatch && searchMatch;
    });
  }, [articles, filter, query]);

  const navItems: readonly SideNavigationEntry[] = [
    { type: "link", id: "overview", label: "Overview", href: "#overview", icon: <Icon name="grid" size="sm" />, onClick: (event) => { event.preventDefault(); setActiveNav("overview"); setNotice("Overview selected"); } },
    { type: "link", id: "articles", label: "Articles", href: "#articles", icon: <Icon name="book" size="sm" />, badge: String(articles.length), onClick: (event) => { event.preventDefault(); setActiveNav("articles"); setNotice("Articles selected"); } },
    { type: "link", id: "media", label: "Media library", href: "#media", icon: <Icon name="folder" size="sm" />, onClick: (event) => { event.preventDefault(); setActiveNav("media"); setNotice("Media library selected"); } },
    { type: "link", id: "categories", label: "Categories", href: "#categories", icon: <Icon name="list" size="sm" />, onClick: (event) => { event.preventDefault(); setActiveNav("categories"); setNotice("Categories selected"); } },
    { type: "divider", id: "studio-divider" },
    { type: "action", id: "insights", label: "Insights", icon: <Icon name="sparkle" size="sm" />, onClick: () => setNotice("Insights are coming into focus.") },
    { type: "action", id: "settings", label: "Settings", icon: <Icon name="settings" size="sm" />, onClick: () => setNotice("Workspace settings selected") },
  ];

  const tabItems: TabsItem[] = statusTabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    content: (
      <>
        <div className={styles.searchRow}>
          <Search
            className={styles.searchComponent}
            label="Search articles"
            onValueChange={setQuery}
            placeholder="Search articles"
            showLabel={false}
            showSubmitButton={false}
            size="sm"
            value={query}
            variant="outlined"
            style={{
              "--ds-search-surface": "#fbf9f4",
              "--ds-search-text": "#263a32",
              "--ds-search-muted": "#566459",
              "--ds-search-border": "#d8d2c6",
              "--ds-search-radius": "4px",
              "--ds-search-padding": "var(--ds-space-2)",
            }}
          />
        </div>
        <ArticleList
          articles={filteredArticles}
          onSortChange={setSort}
          onStatusClear={() => { setFilter("all"); setQuery(""); }}
          sort={sort}
        />
      </>
    ),
  }));

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setArticles((current) => [{
      id: Date.now(),
      title,
      author: "Mara Ellison",
      initials: "ME",
      category: "Unsorted",
      status: "Draft",
      updated: "Just now",
      readTime: "New draft",
    }, ...current]);
    setFilter("all");
    setQuery("");
    setSort(null);
    setDialogOpen(false);
    setNotice(`Draft created: ${title}`);
  };

  const openNewArticle = () => {
    setNewTitle("");
    setDialogOpen(true);
    setNotice("");
  };

  return (
    <div className={styles.app} data-cms-dashboard="true">
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="#overview" onClick={(event) => { event.preventDefault(); setActiveNav("overview"); }}>
          <span className={styles.brandMark} aria-hidden="true">J</span>
          <span className={styles.brandName}>juniper<span>press</span></span>
        </a>
        <SideNavigation
          activeId={activeNav}
          className={styles.sideNavigation}
          defaultCollapsed={false}
          groupMotion="none"
          header={
            <div className={styles.workspace}>
              <span className={styles.workspaceLabel}>WORKSPACE</span>
              <button className={styles.workspaceSwitch} type="button" onClick={() => setNotice("Juniper Press is your current workspace.")}>
                <span className={styles.workspaceGlyph}>JP</span>
                <span><strong>Juniper Press</strong><small>Independent publishing</small></span>
                <Icon name="chevron-down" size="sm" />
              </button>
            </div>
          }
          items={navItems}
          navigationLabel="Juniper Press workspace"
          onActiveChange={(id) => setActiveNav(id)}
          position="static"
          size="md"
          footer={
            <>
              <div className={styles.helpCard}>
                <span className={styles.helpIcon} aria-hidden="true"><Icon name="book" size="sm" /></span>
                <strong>A little help?</strong>
                <p>Find your way around the press.</p>
                <button type="button" onClick={() => setNotice("The editor’s handbook is ready for your next visit.")}>Open the handbook <Icon name="arrow-right" size="xs" /></button>
              </div>
              <button className={styles.profile} type="button" onClick={() => setNotice("Signed in as Mara Ellison · Editor")}>
                <span className={styles.avatar}>ME</span>
                <span><strong>Mara Ellison</strong><small>Editor</small></span>
                <Icon name="list" size="sm" />
              </button>
            </>
          }
        />
      </aside>

      <main className={styles.main} id="overview">
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}><span>Juniper Press</span><Icon name="chevron-right" size="xs" /><strong>{activeNav === "overview" ? "Overview" : activeNav[0].toUpperCase() + activeNav.slice(1)}</strong></div>
          <div className={styles.topActions}>
            <span className={styles.edition}><span className={styles.editionDot} /> Spring edition · 04</span>
            <button className={styles.iconButton} type="button" aria-label="View notifications" onClick={() => setNotice("You’re all caught up on notifications.")}><Icon name="circle-info" size="sm" /><i /></button>
            <span className={styles.topAvatar} role="img" aria-label="Mara Ellison">ME</span>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.greeting} aria-labelledby="greeting-title">
            <div className={styles.greetingCopy}>
              <div className={styles.dateLine}>TUESDAY, APRIL 22, 2025 <span aria-hidden="true">/</span> ISSUE NO. 04</div>
              <h1 id="greeting-title">Good morning, Mara<span>.</span></h1>
              <p>Your next good story is already taking shape.</p>
            </div>
            <Button className={styles.createButton} onClick={openNewArticle} ref={newArticleTrigger} size="md">
              <Icon name="arrow-right" size="sm" /> New article
            </Button>
          </section>

          <section className={styles.metrics} aria-label="Publishing overview">
            <article className={`${styles.metric} ${styles.metricHighlight}`}>
              <span className={styles.metricLabel}>IN THE WORKS</span><strong>12</strong>
              <span className={styles.metricFoot}>articles in progress <span className={styles.metricTrend}>+2 this week</span></span>
              <span className={styles.metricWatermark} aria-hidden="true">12</span>
            </article>
            <article className={styles.metric}>
              <span className={styles.metricLabel}>READY TO REVIEW</span><strong>3</strong>
              <span className={styles.metricFoot}>waiting for an editor</span><span className={styles.metricRule} />
            </article>
            <article className={styles.metric}>
              <span className={styles.metricLabel}>PUBLISHED THIS MONTH</span><strong>8</strong>
              <span className={styles.metricFoot}>of 10 planned stories <span className={styles.metricMiniTrack}><i /></span></span>
            </article>
            <article className={`${styles.metric} ${styles.metricAccent}`}>
              <span className={styles.metricLabel}>MEDIA LIBRARY</span><strong>146</strong>
              <span className={styles.metricFoot}>images, notes &amp; more</span><span className={styles.metricSpark} aria-hidden="true">↗</span>
            </article>
          </section>

          <section className={styles.articleSection} aria-labelledby="articles-title">
            <div className={styles.sectionHeading}>
              <div>
                <div className={styles.sectionKicker}>THE EDITOR’S DESK</div>
                <h2 id="articles-title">Your articles <span className={styles.articleTotal}>{articles.length}</span></h2>
              </div>
              <button className={styles.viewAll} type="button" onClick={() => { setFilter("all"); setQuery(""); setNotice("Showing all articles"); }}>View all articles <Icon name="arrow-right" size="xs" /></button>
            </div>

            <div className={styles.controls}>
              <Tabs
                className={styles.dashboardTabs}
                items={tabItems}
                label="Filter articles by status"
                onValueChange={(value) => setFilter(value as StatusFilter)}
                size="sm"
                value={filter}
                variant="line"
              />
            </div>
          </section>

          <section className={styles.bottomGrid} aria-label="Editorial notes">
            <article className={styles.upNext}>
              <div className={styles.bottomHeading}><div><span className={styles.sectionKicker}>COMING UP</span><h2>On the calendar</h2></div><button className={styles.smallIconButton} type="button" aria-label="Add calendar item" onClick={() => setNotice("Calendar item added to your local planning queue.")}><Icon name="arrow-right" size="xs" /></button></div>
              <div className={styles.calendarItem}>
                <span className={styles.calendarDate}><strong>24</strong><small>APR</small></span>
                <span className={styles.calendarText}><strong>Field notes: the spring issue</strong><small>Thursday · 9:30 AM · Editorial meeting</small></span>
                <Icon className={styles.calendarArrow} name="arrow-right" size="xs" />
              </div>
              <div className={styles.calendarItem}>
                <span className={`${styles.calendarDate} ${styles.calendarDateMuted}`}><strong>28</strong><small>APR</small></span>
                <span className={styles.calendarText}><strong>River towns photo essay</strong><small>Monday · Scheduled to publish</small></span>
                <Icon className={styles.calendarArrow} name="arrow-right" size="xs" />
              </div>
            </article>
            <article className={styles.teamNote}>
              <div className={styles.bottomHeading}><div><span className={styles.sectionKicker}>FROM THE MARGIN</span><h2>A note for the team</h2></div><span className={styles.noteMark} aria-hidden="true">“</span></div>
              <p>Let’s keep a little room in this issue for the stories that surprise us.</p>
              <div className={styles.noteByline}><span className={styles.authorAvatar}>JB</span><span><strong>Jules Bell</strong><small>Publisher · Yesterday</small></span><button className={styles.noteReply} type="button" onClick={() => setNotice("Reply added to Jules’s team note.")}>Reply <Icon name="arrow-right" size="xs" /></button></div>
            </article>
          </section>
          <footer className={styles.pageFooter}><span>Made for the stories worth keeping.</span><span>Juniper Press <i>·</i> Spring edition</span></footer>
        </div>
      </main>

      <div className={styles.liveNotice} data-testid="dashboard-feedback" role="status" aria-live="polite" aria-atomic="true">{notice}</div>

      <Dialog
        className={styles.dialog}
        closeLabel="Close new article dialog"
        closeOnBackdropClick
        heading="Start a new article"
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        description="Every good story starts with a working title."
        size="sm"
        style={{
          "--ds-dialog-surface": "#fbf9f4",
          "--ds-dialog-text": "#263a32",
          "--ds-dialog-border": "#d8d2c6",
          "--ds-dialog-radius": "5px",
          "--ds-dialog-padding": "var(--ds-space-6)",
        }}
        footer={
          <>
            <Button className={styles.dialogSecondaryButton} variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className={styles.dialogPrimaryButton} form="create-article-form" type="submit" disabled={!newTitle.trim()}>Create draft <Icon name="arrow-right" size="xs" /></Button>
          </>
        }
      >
        <form className={styles.createForm} id="create-article-form" onSubmit={handleCreate}>
          <label htmlFor="new-article-title-input">Article title</label>
          <input autoFocus id="new-article-title-input" onChange={(event) => setNewTitle(event.target.value)} placeholder="Give this story a name" required value={newTitle} />
        </form>
      </Dialog>
    </div>
  );
}

function ArticleList({
  articles,
  onSortChange,
  onStatusClear,
  sort,
}: {
  articles: readonly Article[];
  onSortChange: (sort: TableSort | null) => void;
  onStatusClear: () => void;
  sort: TableSort | null;
}) {
  return (
    <>
      <Table
        aria-label="Juniper Press articles"
        className={styles.articleTableComponent}
        columns={articleColumns}
        data={articles}
        density="compact"
        emptyState={
          <div className={styles.emptyState}>
            <strong>No stories on this page.</strong>
            <span>Try another search, or choose a different status.</span>
            <button type="button" onClick={onStatusClear}>Clear filters</button>
          </div>
        }
        getRowKey={(article) => article.id}
        hoverable
        minTableWidth="680px"
        onSortChange={onSortChange}
        sort={sort}
        sortMode="client"
        style={{
          "--ds-table-surface": "#fbf9f4",
          "--ds-table-text": "#263a32",
          "--ds-table-border": "#e3ddd1",
          "--ds-table-header-surface": "#f7f4ec",
          "--ds-table-header-text": "#526055",
          "--ds-table-striped-surface": "#f7f4ec",
          "--ds-table-row-hover": "#f1eee4",
          "--ds-table-muted": "#566459",
          "--ds-table-radius": "5px",
          "--ds-table-padding": "10px 12px",
          "--ds-table-compact-padding": "9px 12px",
          "--ds-table-gap": "8px",
        }}
      />
      <div className={styles.tableFooter}>
        <span role="status" aria-live="polite">{articles.length} {articles.length === 1 ? "article" : "articles"} <span>·</span> updated across your workspace</span>
        <button className={styles.footerLink} type="button" onClick={() => window.dispatchEvent(new CustomEvent("juniper-activity"))}>Latest activity <Icon name="arrow-right" size="xs" /></button>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  const tone = status === "Published" ? "success" : status === "In review" ? "warning" : status === "Scheduled" ? "accent" : "neutral";
  return <Badge className={`${styles.statusBadge} ${styles[`status${status.replace(" ", "")}`]}`} size="sm" tone={tone}>{status}</Badge>;
}
