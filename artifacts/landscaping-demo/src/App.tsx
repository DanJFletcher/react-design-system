import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import {
  ArticleBody,
  ArticleCard,
  Button,
  Card,
  ContactSection,
  Footer,
  Header,
  Hero,
  Select,
  Textarea,
  TextField,
  ThemeScope,
} from "@workspace/design-system";
import heroGarden from "./assets/garden-hero.jpg";
import patioGarden from "./assets/garden-patio.jpg";
import waterWiseGarden from "./assets/garden-waterwise.jpg";
import outdoorLivingGarden from "./assets/garden-outdoor-living.jpg";

const base = import.meta.env.BASE_URL;
const basePath = (path: string) => `${base.replace(/\/$/, "")}${path === "/" ? "/" : path}`;
const articlesPath = "/blog";

type PageMetaProps = { title: string; description: string; image?: string };

function PageMeta({ title, description, image = heroGarden }: PageMetaProps) {
  useEffect(() => {
    document.title = `${title} | Meadow & Mill Landscaping`;
    const setMeta = (name: string, content: string, property = false) => {
      const attribute = property ? "property" : "name";
      let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    setMeta("description", description);
    setMeta("og:title", `${title} | Meadow & Mill Landscaping`, true);
    setMeta("og:description", description, true);
    setMeta("og:type", title.startsWith("A Field Note") ? "article" : "website", true);
    setMeta("og:image", new URL(image, window.location.href).href, true);
    setMeta("twitter:card", "summary_large_image");
  }, [title, description, image]);
  return null;
}

function Brand() {
  return (
    <span className="brand-lockup">
      <span className="brand-seal" aria-hidden="true">M</span>
      <span className="brand-name">Meadow &amp; Mill<small>Landscaping · Est. 2014</small></span>
    </span>
  );
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Our approach", href: "/about" },
  { label: "Field notes", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

function SiteHeader() {
  const [location] = useLocation();
  return (
    <div className="site-header">
      <Header
        logo={<Brand />}
        logoHref={basePath("/")}
        logoLabel="Meadow & Mill home"
        navItems={navLinks.map((item) => ({
          ...item,
          href: basePath(item.href),
          current: location === item.href || (item.href === "/blog" && location.startsWith("/blog/")),
          "data-testid": `nav-${item.href === "/" ? "home" : item.href.slice(1).replaceAll("/", "-")}`,
        }))}
        cta={<a className="header-cta" data-testid="link-header-contact" href={basePath("/contact")}>Plan a garden <span aria-hidden="true">↗</span></a>}
        size="lg"
        borderBottom={false}
      />
    </div>
  );
}

function SiteFooter() {
  return (
    <div className="site-footer" data-testid="site-footer">
      <Footer
        brand={<span className="footer-brand">Meadow &amp; Mill<small>Landscaping · Est. 2014</small></span>}
        logoHref={basePath("/")}
        logoLabel="Meadow & Mill home"
        description="Considered gardens for everyday life. Serving Alder Creek and the towns just beyond."
        linkGroups={[
          {
            id: "explore",
            title: "Explore",
            links: [
              { id: "home", label: "Home", href: basePath("/") },
              { id: "services", label: "Services", href: basePath("/services") },
              { id: "about", label: "Our approach", href: basePath("/about") },
              { id: "journal", label: "Field notes", href: basePath("/blog") },
            ],
          },
          {
            id: "say-hello",
            title: "Say hello",
            links: [
              { id: "contact", label: "Start a conversation", href: basePath("/contact") },
              { id: "email", label: "hello@meadowandmill.example", href: "mailto:hello@meadowandmill.example" },
              { id: "phone", label: "(503) 555-0146", href: "tel:+15035550146" },
            ],
          },
        ]}
        copyright="© 2025 Meadow & Mill Landscaping · Alder Creek, Oregon"
        variant="plain"
        size="md"
      />
    </div>
  );
}

function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <ThemeScope theme="acme" className="canopy-app">
      <a className="skip-link" data-testid="link-skip-content" href="#main-content">Skip to content</a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </ThemeScope>
  );
}

function Home() {
  return (
    <>
      <PageMeta
        title="Gardens for the way you live"
        description="Meadow & Mill is a small residential landscape studio in Alder Creek, Oregon, creating useful, beautiful gardens rooted in place."
      />
      <main id="main-content" data-testid="page-home">
        <div className="hero-wrap">
          <div className="hero-photo" style={{ backgroundImage: `url(${heroGarden})` }} aria-hidden="true" />
          <div className="home-hero">
            <Hero
              className="fade-in"
              eyebrow="Residential gardens · Alder Creek, Oregon"
              title={<>A little more<br />outside.</>}
              description="We make thoughtful gardens for real life: a place to gather, to grow, and to take the long way back to the door."
              layout="split"
              size="lg"
              background="transparent"
              primaryAction={
                <div className="hero-actions">
                  <a data-testid="link-home-contact" href={basePath("/contact")}>Tell us what you’re imagining <span aria-hidden="true">↗</span></a>
                  <a data-testid="link-home-services" href={basePath("/services")}>See what we do</a>
                </div>
              }
              media={<img src={heroGarden} alt="A winding path through a layered cottage garden in soft afternoon light" />}
              data-testid="hero-home"
            />
            <div className="hero-caption">A garden made to be lived in · Alder Creek</div>
          </div>
        </div>

        <section className="section">
          <div className="section-inner intro-grid">
            <div className="intro-copy fade-in">
              <div className="kicker">Good gardens feel like home</div>
              <h2 className="display-title">More than a pretty view.</h2>
              <p>Maybe it’s a quiet cup of tea before the day starts. Maybe it’s a table that finally fits the whole family. We listen first, then shape the space around the life already happening there.</p>
              <p>Meadow &amp; Mill is a small, hands-on garden studio. We bring a deep love of plants, a practical eye, and a neighbor’s understanding of this place.</p>
              <a className="text-link" data-testid="link-home-about" href={basePath("/about")}>Meet the people behind the plants <span aria-hidden="true">→</span></a>
            </div>
            <div className="photo-frame fade-in delay">
              <img src={patioGarden} alt="A simple timber table tucked into a planted garden patio" loading="lazy" />
              <div className="photo-note">Room to linger, right at home.</div>
            </div>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <div className="section-heading">
              <div className="kicker">A garden, in good company</div>
              <h2 className="display-title">Start with what matters.</h2>
              <p className="section-lede">One corner or the whole yard, we make a plan that feels clear, personal, and possible.</p>
            </div>
            <div className="services-grid">
              {[
                ["01", "Garden design", "A thoughtful plan for the whole space, from first sketch to the last stepping stone."],
                ["02", "Planting & renewal", "Season-long color, layered texture, and plants that make sense for your patch of ground."],
                ["03", "Outdoor living", "Paths, patios, and places to gather—made to feel as natural as the garden around them."],
              ].map(([number, title, description]) => (
                <article className="service-tile" key={number} data-testid={`home-service-${number}`}>
                  <span className="service-number">{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <a data-testid={`link-home-service-${number}`} href={basePath("/services")}>Explore services <span aria-hidden="true">→</span></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="quote-section">
          <blockquote>“They made a garden that feels like it was always meant to be here—and now we use every bit of it.”</blockquote>
          <cite>— Ellen &amp; Mark, Alder Creek homeowners</cite>
        </section>

        <section className="section">
          <div className="section-inner">
            <div className="journal-intro">
              <div className="section-heading">
                <div className="kicker">Notes from the garden</div>
                <h2 className="display-title">A little know-how, freely shared.</h2>
              </div>
              <a className="text-link" data-testid="link-home-blog" href={basePath("/blog")}>All field notes <span aria-hidden="true">→</span></a>
            </div>
            <ArticleGrid count={2} />
          </div>
        </section>
        <CallToAction />
      </main>
    </>
  );
}

const services = [
  {
    n: "01", title: "Garden design", deck: "A clear, considered plan that fits your home and the way you want to live outside.",
    details: ["On-site listening visit", "Scaled concept and planting plan", "Materials, lighting, and phasing guidance"],
  },
  {
    n: "02", title: "Planting & renewal", deck: "Borders with something to notice in every season, and plants suited to your soil and light.",
    details: ["Seasonal border refresh", "Pollinator-friendly planting", "Small-space and front-garden makeovers"],
  },
  {
    n: "03", title: "Paths & patios", deck: "Useful, welcoming outdoor rooms that settle into the garden instead of sitting on top of it.",
    details: ["Stone and gravel paths", "Small patios and gathering areas", "Edging, steps, and simple timber details"],
  },
  {
    n: "04", title: "Water-wise gardens", deck: "A resilient landscape that makes room for summer dry spells and winter rain alike.",
    details: ["Rain-garden planning", "Low-water planting palettes", "Mulch, grading, and irrigation advice"],
  },
];

function ServicesPage() {
  return (
    <>
      <PageMeta title="Garden design & landscaping services" description="Explore garden design, planting, patios, paths, and water-wise residential landscaping from Meadow & Mill in Alder Creek, Oregon." />
      <main id="main-content" data-testid="page-services">
        <PageHero eyebrow="Thoughtful work, from the ground up" title="A good garden starts with a good conversation." description="Every project is different. Our work begins by understanding what you need from your outdoor space—and what this particular piece of land can do." />
        <section className="section">
          <div className="section-inner">
            <div className="service-detail-list">
              {services.map((service) => (
                <Card key={service.n} data-testid={`service-card-${service.n}`} className="detail-card" eyebrow={`Studio service · ${service.n}`} title={service.title} description={service.deck} headingLevel={2}>
                  <ul>{service.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                  <a className="text-link" data-testid={`link-service-contact-${service.n}`} href={basePath("/contact")}>Ask about this service <span aria-hidden="true">→</span></a>
                </Card>
              ))}
            </div>
            <div className="service-side-note">Not sure which service fits? That’s a perfectly good place to begin. We’ll help you find the right next step.</div>
          </div>
        </section>
        <CallToAction />
      </main>
    </>
  );
}

function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
      <section className="page-hero" data-testid="section-page-hero">
      <div className="section-inner">
        <div><div className="kicker">{eyebrow}</div><h1>{title}</h1></div>
        <p>{description}</p>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <>
      <PageMeta title="A small studio with local roots" description="Meet Meadow & Mill, a small, hands-on residential garden studio rooted in Alder Creek and the Pacific Northwest." image={patioGarden} />
      <main id="main-content" data-testid="page-about">
        <section className="about-hero">
          <div className="about-hero-copy">
            <div className="kicker" style={{ color: "#d8bf82" }}>A small studio, close to home</div>
            <h1>We believe a garden should feel like yours.</h1>
            <p>We’re a neighbor-sized team of designers and gardeners. We bring practical hands, plant curiosity, and a lot of care to the places people call home.</p>
            <a className="text-link" data-testid="link-about-contact" href={basePath("/contact")} style={{ color: "#f7f4eb", borderColor: "#8c9a87" }}>Come say hello <span aria-hidden="true">→</span></a>
          </div>
          <img src={patioGarden} alt="A calm garden gathering place framed by foliage and ornamental grasses" />
        </section>
        <section className="section">
          <div className="section-inner intro-grid">
            <div className="intro-copy">
              <div className="kicker">Alder Creek, since 2014</div>
              <h2 className="display-title">Rooted here. Curious everywhere.</h2>
              <p>Meadow &amp; Mill began with a simple idea: good landscaping should make daily life feel a little better. Not just on the day the project is finished, but in the years of breakfasts outside, barefoot walks, and familiar blooms that follow.</p>
              <p>We work in Alder Creek and nearby towns, choosing plants that belong in our climate and details that age with grace. We keep our crew small so the people you meet at the first visit are the people caring for your garden.</p>
            </div>
            <div className="photo-frame"><img src={waterWiseGarden} alt="A layered native planting with flowers and soft grasses" loading="lazy" /><div className="photo-note">Made for this place.</div></div>
          </div>
        </section>
        <section className="section soft-band">
          <div className="section-inner">
            <div className="section-heading"><div className="kicker">What guides us</div><h2 className="display-title">Small decisions make a place.</h2></div>
            <div className="principles">
              <article className="principle"><span className="service-number">01</span><h3>Listen closely</h3><p>We start with how you move through the yard, what you love, and what gets in the way.</p></article>
              <article className="principle"><span className="service-number">02</span><h3>Plant for the long run</h3><p>Healthy soil, right-sized plants, and a little patience make a garden more generous every year.</p></article>
              <article className="principle"><span className="service-number">03</span><h3>Leave room for life</h3><p>Gardens aren’t showrooms. They should welcome muddy boots, good neighbors, and changing plans.</p></article>
            </div>
          </div>
        </section>
        <CallToAction />
      </main>
    </>
  );
}

type ArticleRecord = {
  slug: string; title: string; excerpt: string; date: string; dateLabel: string; minutes: number; category: string; image: string; alt: string; content: ReactNode;
};

const articleRecords: ArticleRecord[] = [
  {
    slug: "planting-for-the-long-season",
    title: "Planting for the long season",
    excerpt: "A garden can feel generous from the first warm days of spring to the last bright afternoon of autumn. The trick is to plan in layers.",
    date: "2025-04-16", dateLabel: "April 16, 2025", minutes: 6, category: "Planting notes", image: patioGarden, alt: "A richly layered home garden with a path and flowers",
    content: <>
      <p>When a garden looks wonderful for only a few weeks, it can feel like the season has slipped by while you weren’t looking. A longer season isn’t about having something in bloom every single day. It’s about giving the garden a changing rhythm—one that keeps offering small reasons to step outside.</p>
      <h2 id="start-with-a-calendar">Start with a garden calendar</h2>
      <p>Before buying plants, make a simple month-by-month note of what is already happening. Include bulbs, blossoms, seed heads, leaf color, and the first fresh growth. You may discover that your garden is already lively in May and simply needs more to carry it through August.</p>
      <h3>Think in overlapping chapters</h3>
      <p>Choose plants in groups that overlap by a few weeks. Early bulbs can meet the new foliage of perennials; summer flowers can rise through grasses that will hold their shape into winter. The overlap is more natural—and more forgiving—than a succession of isolated bursts.</p>
      <blockquote>A garden earns its depth in the in-between weeks.</blockquote>
      <h2 id="give-each-season-a-role">Give each season a role</h2>
      <p>Spring can be about fresh greens and small surprises. Summer might carry the big color, while autumn belongs to seed heads, amber grasses, and late flowers for pollinators. In winter, evergreen structure, stems, and berries can keep the view from going quiet.</p>
      <h3>Build a dependable backbone</h3>
      <p>Start with shrubs and long-lived perennials suited to your light and soil. Then add a modest number of seasonal accents. Repeating a few reliable plants through a border helps the whole scheme feel connected, even as individual flowers come and go.</p>
      <h2 id="leave-space-to-change">Leave space to change</h2>
      <p>Plants grow, tastes shift, and the best garden plans have room for revision. Leave breathing space between new perennials, avoid filling every bare patch on day one, and take notes as the garden unfolds. A seasonal garden is a conversation, not a finished arrangement.</p>
      <p>For a broader planting plan, see our <a href={basePath("/services")}>planting and renewal services</a>. You might also enjoy <a href={basePath(`${articlesPath}/water-wise-gardens`)}>our notes on water-wise gardens</a>.</p>
    </>,
  },
  {
    slug: "water-wise-gardens",
    title: "A water-wise garden that still feels lush",
    excerpt: "Less summer watering doesn’t have to mean a spare, gravel-only yard. A few good choices make a garden both resilient and full.",
    date: "2025-06-03", dateLabel: "June 3, 2025", minutes: 5, category: "Practical gardens", image: waterWiseGarden, alt: "Flowers and grasses growing in a water-wise garden with gravel mulch",
    content: <>
      <p>Water-wise gardening is often described as a list of things to remove. We prefer to think about what can take their place: resilient plants, living shade, and soil that holds onto the water it receives. In our dry summers, those choices can make a garden feel calmer, not barer.</p>
      <h2 id="know-your-site">Know your site before choosing plants</h2>
      <p>Notice where the afternoon sun lands, where water gathers after a storm, and which areas dry out first. A small sketch with sunny, part-shade, and damp zones will guide more successful decisions than a plant list alone.</p>
      <h3>Match plants to the conditions</h3>
      <p>Look for plants that are adapted to your region and the actual conditions of your yard. Deep-rooted grasses and flowering perennials can thrive in sunny, well-drained beds; woodland species are happier where shade and moisture linger. The right plant in the right place needs less intervention.</p>
      <h2 id="care-for-the-soil">Make the soil part of the plan</h2>
      <p>Healthy soil is a quiet reservoir. Keep it covered with a light layer of organic mulch, add compost where it is needed, and avoid working beds when they are saturated. Mulch helps moderate temperature and slow evaporation while the plants establish.</p>
      <h3>Water slowly while roots settle</h3>
      <p>New gardens need regular, deep watering for their first seasons. A long soak encourages roots to travel down instead of staying near the surface. Once plants are established, adjust the schedule to rainfall and soil rather than sticking to a fixed calendar.</p>
      <h2 id="welcome-rain">Give rain a place to go</h2>
      <p>Small grading changes, rain gardens, and permeable paths can help keep water on site. Every yard is different, so drainage work should start with careful observation and, when needed, a qualified professional.</p>
      <p>See how we approach <a href={basePath("/services")}>water-wise garden planning</a>, or read <a href={basePath(`${articlesPath}/planting-for-the-long-season`)}>how to build a planting season that lasts</a>.</p>
    </>,
  },
  {
    slug: "outdoor-living-through-the-seasons",
    title: "Outdoor living through the seasons",
    excerpt: "An outdoor room doesn’t need a roof or a grand view. It needs a reason to be used, and a few thoughtful comforts.",
    date: "2025-08-21", dateLabel: "August 21, 2025", minutes: 7, category: "Living outside", image: outdoorLivingGarden, alt: "A quiet garden seating nook beside a curved path and autumn foliage",
    content: <>
      <p>The outdoor spaces we return to are rarely the biggest ones. They are the spots with a little shelter from the wind, a chair that is easy to move, and something pleasant to look at while the kettle boils. Designing for year-round use means beginning with those ordinary moments.</p>
      <h2 id="follow-the-routines">Follow the routines you already have</h2>
      <p>Where do you naturally pause? Which door do you use most? A patio placed close to the kitchen may be more useful than a larger terrace at the far end of the garden. Let daily habits set the scale and location.</p>
      <h3>Make arrival feel easy</h3>
      <p>A well-placed path makes a garden feel accessible in every season. Choose a stable surface, give it enough width for two people to walk together, and use a gentle curve only when it helps reveal something or ease the route.</p>
      <h2 id="comfort-in-layers">Think about comfort in layers</h2>
      <p>Shade, wind, privacy, and evening light all change the way a space feels. A small tree can soften summer sun; a hedge can make a seat more sheltered; low lighting can invite one more conversation after dusk. These details often matter more than expensive furniture.</p>
      <h3>Plant the edges, not the whole floor</h3>
      <p>Planting along the edges of a patio helps it feel part of the garden. Mix evergreen structure with flowering plants and grasses that change through the year. Keep the middle clear enough for people and the things they bring with them.</p>
      <h2 id="leave-it-flexible">Leave it flexible</h2>
      <p>A good outdoor room changes with the weather and the people in it. Movable chairs, a place for a pot of herbs, and space to pull up another seat all make it easier to use without fuss.</p>
      <p>Explore our <a href={basePath("/services")}>paths and patios service</a> or head back to the <a href={basePath("/")}>garden design studio home</a> to learn more about our work.</p>
    </>,
  },
];

function ArticleGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="journal-grid">
      {articleRecords.slice(0, count).map((article) => (
        <ArticleCard
          key={article.slug}
          data-testid={`article-card-${article.slug}`}
          title={article.title}
          href={basePath(`${articlesPath}/${article.slug}`)}
          excerpt={article.excerpt}
          category={{ label: article.category }}
          author={{ name: "Mara Ellis" }}
          publishedAt={{ dateTime: article.date, label: article.dateLabel }}
          readingTime={`${article.minutes} min read`}
          image={{ src: article.image, alt: article.alt, width: 1200, height: 800 }}
          headingLevel={3}
          variant="surface"
          size="md"
        />
      ))}
    </div>
  );
}

function BlogPage() {
  return (
    <>
      <PageMeta title="Field notes from the garden" description="Useful, down-to-earth notes on planting, water-wise gardens, and making more of the outdoor spaces we call home." />
      <main id="main-content" data-testid="page-blog">
        <PageHero eyebrow="The Meadow & Mill journal" title="Field notes for growing well." description="A few good ideas from our gardens, our notebooks, and the seasons we share. Written for curious gardeners, not just the green-thumbed." />
        <section className="section">
          <div className="section-inner">
            <div className="section-heading"><div className="kicker">Recent notes · 3 articles</div><p className="section-lede">Practical ways to make a garden more generous, more resilient, and more yours.</p></div>
            <div className="blog-list"><ArticleGrid /></div>
          </div>
        </section>
        <section className="section soft-band">
          <div className="section-inner intro-grid">
            <div className="intro-copy"><div className="kicker">Have a question?</div><h2 className="display-title">Ask the gardener.</h2><p>Tell us what you’re working on. We’re happy to point you toward a good place to start, whether it’s a new project or simply a plant behaving in a puzzling way.</p><a className="text-link" data-testid="link-blog-contact" href={basePath("/contact")}>Send us a note <span aria-hidden="true">→</span></a></div>
            <img src={waterWiseGarden} alt="Textural native garden planting with flowers and grasses" className="article-cover" loading="lazy" />
          </div>
        </section>
      </main>
    </>
  );
}

function ArticlePage({ article }: { article: ArticleRecord }) {
  const related = articleRecords.filter((entry) => entry.slug !== article.slug).slice(0, 2);
  return (
    <>
      <PageMeta title={`A Field Note: ${article.title}`} description={article.excerpt} image={article.image} />
      <main id="main-content" data-testid={`page-article-${article.slug}`}>
        <header className="article-header" data-testid={`article-header-${article.slug}`}>
          <div className="breadcrumbs" data-testid={`breadcrumb-${article.slug}`}><a data-testid="link-breadcrumb-home" href={basePath("/")}>Home</a><span aria-hidden="true">/</span><a data-testid="link-breadcrumb-blog" href={basePath("/blog")}>Field notes</a><span aria-hidden="true">/</span><span>{article.category}</span></div>
          <div className="kicker" style={{ marginTop: 34 }}>{article.category}</div>
          <h1>{article.title}</h1>
          <p className="article-dek">{article.excerpt}</p>
          <div className="byline"><span>Words by <strong>Mara Ellis</strong></span><time dateTime={article.date}>{article.dateLabel}</time><span>{article.minutes} min read</span></div>
        </header>
        <img className="article-cover" data-testid={`image-article-${article.slug}`} src={article.image} alt={article.alt} />
        <div className="article-layout">
          <ArticleBody className="article-body" data-testid={`article-body-${article.slug}`}>{article.content}</ArticleBody>
          <aside className="article-aside" aria-label="About the author">
            <strong>A note from Mara</strong>
            Mara Ellis is the founder and lead gardener at Meadow &amp; Mill. She writes from the beds she tends around Alder Creek.
            <a data-testid="link-article-about" href={basePath("/about")}>Meet the studio →</a>
          </aside>
        </div>
        <section className="article-related">
          <div className="article-related-inner">
            <div className="kicker">Keep wandering</div><h2>More from the garden notebook</h2>
            <div className="journal-grid">
          {related.map((entry) => <ArticleCard key={entry.slug} data-testid={`related-article-${entry.slug}`} title={entry.title} href={basePath(`${articlesPath}/${entry.slug}`)} excerpt={entry.excerpt} author={{ name: "Mara Ellis" }} publishedAt={{ dateTime: entry.date, label: entry.dateLabel }} readingTime={`${entry.minutes} min read`} image={{ src: entry.image, alt: entry.alt, width: 1200, height: 800 }} headingLevel={3} />)}
            </div>
            <a className="text-link" data-testid="link-related-all-articles" href={basePath("/blog")}>All field notes <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>
    </>
  );
}

function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", project: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const update = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = "Please add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!values.message.trim()) nextErrors.message = "Tell us a little about what you have in mind.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitted(false);
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setSubmitted(true);
  };
  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <h2>Tell us a little about it.</h2>
      <p>We’ll use this demo form to show the next step. No message is sent or stored.</p>
      <div className="form-grid">
        <TextField id="name" data-testid="input-contact-name" label="Your name" name="name" autoComplete="name" required value={values.name} onChange={(event) => update("name", event.target.value)} error={errors.name} invalid={Boolean(errors.name)} />
        <TextField id="email" data-testid="input-contact-email" label="Email address" name="email" type="email" autoComplete="email" required value={values.email} onChange={(event) => update("email", event.target.value)} error={errors.email} invalid={Boolean(errors.email)} />
        <div className="form-field wide">
          <Select id="project" data-testid="select-contact-project" name="project" label="What are you dreaming up?" value={values.project} onChange={(event) => update("project", event.target.value)}>
            <option value="">Choose a starting point (optional)</option>
            <option>Garden design</option><option>Planting refresh</option><option>Paths or patio</option><option>Water-wise garden</option><option>Not quite sure yet</option>
          </Select>
        </div>
        <Textarea id="message" data-testid="input-contact-message" label="A few details" name="message" rows={5} required value={values.message} onChange={(event) => update("message", event.target.value)} error={errors.message} invalid={Boolean(errors.message)} description="What’s working, what isn’t, and what you hope the garden could become." />
      </div>
      <div className="form-submit"><Button data-testid="button-contact-submit" type="submit" size="lg">Review my note <span aria-hidden="true">→</span></Button></div>
      <p className="form-note">Local demo only. Your details stay in this page and are not sent to a server.</p>
      {submitted && <div className="form-confirm" data-testid="status-contact-confirmation" role="status" aria-live="polite"><strong>That’s a lovely place to start.</strong><br />Your note passed the local demo checks. In a live site, this is where we’d take the next step together. Nothing has been sent.</div>}
    </form>
  );
}

function ContactPage() {
  return (
    <>
      <PageMeta title="Start a garden conversation" description="Get in touch with Meadow & Mill Landscaping in Alder Creek, Oregon. Tell us what you hope your garden could become." />
      <main id="main-content" data-testid="page-contact">
        <PageHero eyebrow="Let’s begin with a hello" title="Tell us about the place you’re imagining." description="A few sentences is plenty. Tell us what you love, what feels unfinished, or where you’d like to spend more time." />
        <section className="section">
          <div className="section-inner contact-layout">
            <div className="contact-info">
              <h2>We’re listening.</h2>
              <p>Meadow &amp; Mill is a small studio, and every project begins with a real conversation. We serve Alder Creek and the nearby communities of Fern Hollow, Mill Crossing, and the north valley.</p>
              <ContactSection
                className="contact-details"
                heading="Find our studio"
                description="By appointment, tucked just off Alder Creek’s Old Mill Road."
                address={{ lines: ["18 Mill Lane", "Alder Creek, OR 97022"] }}
                contactMethods={[
                  { id: "phone", label: "Call", value: "(503) 555-0146", href: "tel:+15035550146" },
                  { id: "email", label: "Email", value: "hello@meadowandmill.example", href: "mailto:hello@meadowandmill.example" },
                ]}
                hours={[
                  { id: "weekdays", day: "Monday–Friday", hours: "9:00 am–4:30 pm" },
                  { id: "weekend", day: "Saturday–Sunday", hours: "By appointment" },
                ]}
                layout="stacked"
                variant="plain"
                headingLevel={3}
              />
              <div className="contact-detail"><span>Our season</span><p>Taking on garden design and planting projects for late summer and autumn.</p></div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
    </>
  );
}

function CallToAction() {
  return (
    <section className="section" aria-labelledby="next-step-title">
      <div className="section-inner cta-band">
        <div><div className="kicker" style={{ color: "#dfc987" }}>The next step is a conversation</div><h2 id="next-step-title">Your garden has a little more to give.</h2><p>Tell us what you’d like to make room for. We’ll start with a walk around and a few good questions.</p></div>
        <a className="button-link" data-testid="link-cta-contact" href={basePath("/contact")}>Plan a garden <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}

function NotFound() {
  return (
    <>
      <PageMeta title="Page not found" description="We couldn't find that page. Return to Meadow & Mill Landscaping and keep exploring." />
      <main id="main-content" className="not-found" data-testid="page-not-found">
        <div className="kicker">A path that doesn’t go through</div>
        <h1>We can’t find that corner.</h1>
        <p>The page may have moved, or perhaps the path ends here.</p>
        <a className="text-link" data-testid="link-not-found-home" href={basePath("/")}>Back to the garden <span aria-hidden="true">→</span></a>
      </main>
    </>
  );
}

function AppRoutes() {
  return (
    <SiteFrame>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/planting-for-the-long-season">{() => <ArticlePage article={articleRecords[0]} />}</Route>
        <Route path="/blog/water-wise-gardens">{() => <ArticlePage article={articleRecords[1]} />}</Route>
        <Route path="/blog/outdoor-living-through-the-seasons">{() => <ArticlePage article={articleRecords[2]} />}</Route>
        <Route path="/contact" component={ContactPage} />
        <Route component={NotFound} />
      </Switch>
    </SiteFrame>
  );
}

function App() {
  return (
    <WouterRouter base={base.replace(/\/$/, "")}>
      <AppRoutes />
    </WouterRouter>
  );
}

export default App;
