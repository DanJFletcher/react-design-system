import { useState, type FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Card,
  Carousel,
  Header,
  Hero,
  PricingDetails,
  TextField,
  type CarouselSlide,
} from "../index";
import styles from "./MarketingSite.module.css";

const testimonials: CarouselSlide[] = [
  {
    id: "maya",
    label: "Maya Chen, product lead",
    content: (
      <figure className={styles.quote}>
        <div className={styles.quoteMark} aria-hidden="true">“</div>
        <blockquote>
          Our team finally has one calm place to plan, build, and see what matters next.
        </blockquote>
        <figcaption>
          <span className={styles.avatar}>MC</span>
          <span><strong>Maya Chen</strong><small>Product lead, Northstar</small></span>
        </figcaption>
      </figure>
    ),
  },
  {
    id: "jules",
    label: "Jules Rivera, studio founder",
    content: (
      <figure className={styles.quote}>
        <div className={styles.quoteMark} aria-hidden="true">“</div>
        <blockquote>
          Orbit gives our studio the structure to move quickly without making the work feel rigid.
        </blockquote>
        <figcaption>
          <span className={styles.avatar}>JR</span>
          <span><strong>Jules Rivera</strong><small>Founder, Good Form Studio</small></span>
        </figcaption>
      </figure>
    ),
  },
  {
    id: "sam",
    label: "Sam Okafor, operations director",
    content: (
      <figure className={styles.quote}>
        <div className={styles.quoteMark} aria-hidden="true">“</div>
        <blockquote>
          Fewer status meetings, more thoughtful work. That is the difference our whole team noticed.
        </blockquote>
        <figcaption>
          <span className={styles.avatar}>SO</span>
          <span><strong>Sam Okafor</strong><small>Operations director, Common Thread</small></span>
        </figcaption>
      </figure>
    ),
  },
];

const meta = {
  title: "Examples/Marketing Site",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: { description: { story: "A responsive SaaS landing page composed from the public design-system components." } },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <MarketingSite />,
};

function MarketingSite() {
  const [signupMessage, setSignupMessage] = useState("");
  const goTo = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupMessage("Thanks — this demo form does not send or store your address.");
  };

  return (
    <div className={styles.site} id="top">
      <Header
        className={styles.header}
        sticky
        borderBottom
        size="md"
        logo={<Brand />}
        logoHref="#top"
        logoLabel="Orbit home"
        navItems={[
          { label: "Product", href: "#features" },
          { label: "Stories", href: "#stories" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ]}
        cta={
          <Button size="sm" shape="pill" onClick={() => goTo("pricing")}>
            Start free
          </Button>
        }
      />

      <main>
        <Hero
          className={styles.hero}
          eyebrow={<span className={styles.eyebrow}><SparkleIcon /> A calmer way to collaborate</span>}
          title={<>Make room for your<br /><span className={styles.heroAccent}>best work.</span></>}
          description="Orbit brings your projects, plans, and people into one clear space—so your team can spend less time coordinating and more time creating."
          layout="split"
          alignment="start"
          mediaPosition="end"
          mediaAspectRatio="auto"
          mediaFit="contain"
          size="lg"
          background="transparent"
          contentWidth="wide"
          primaryAction={
            <Button shape="pill" onClick={() => goTo("pricing")}>
              Find your plan <ArrowIcon />
            </Button>
          }
          secondaryAction={
            <Button variant="ghost" shape="pill" onClick={() => goTo("features")}>
              Explore the product
            </Button>
          }
          media={<DashboardPreview />}
        />

        <section className={styles.trust} aria-label="Teams that work in Orbit">
          <p>Built for teams doing thoughtful work</p>
          <div className={styles.logoCloud} aria-label="Customer names">
            <span>northstar</span><span>GOOD FORM</span><span>common thread</span><span>FIELDNOTES</span>
          </div>
        </section>

        <section className={styles.section} id="features" aria-labelledby="features-title">
          <div className={styles.sectionHeading}>
            <div className={styles.eyebrow}>Made for your momentum</div>
            <h2 id="features-title">Everything in its right orbit.</h2>
            <p>Flexible structure for the way good teams actually work.</p>
          </div>
          <div className={styles.featureGrid}>
            <Card
              className={styles.featureCard}
              eyebrow="01 / Focus"
              title="See the important work"
              description="Bring priorities and next steps into view without adding more noise."
              headingLevel={3}
              media={<FeatureArtwork kind="focus" />}
              mediaAspectRatio="wide"
              variant="surface"
              size="md"
            />
            <Card
              className={styles.featureCard}
              eyebrow="02 / Flow"
              title="Make progress together"
              description="Keep the right people connected to the work, decisions, and context."
              headingLevel={3}
              media={<FeatureArtwork kind="flow" />}
              mediaAspectRatio="wide"
              variant="surface"
              size="md"
            />
            <Card
              className={styles.featureCard}
              eyebrow="03 / Space"
              title="Shape a better process"
              description="Start simple, then make each workspace fit the people using it."
              headingLevel={3}
              media={<FeatureArtwork kind="space" />}
              mediaAspectRatio="wide"
              variant="surface"
              size="md"
            />
          </div>
        </section>

        <section className={styles.storySection} id="stories" aria-labelledby="stories-title">
          <div className={styles.storyIntro}>
            <div className={styles.eyebrow}>Good work, shared</div>
            <h2 id="stories-title">A little more room to do your thing.</h2>
            <p>Teams use Orbit to replace scattered updates with a clearer rhythm.</p>
          </div>
          <Carousel
            label="Customer stories"
            slides={testimonials}
            indicators="dots"
            controlsPosition="below"
            variant="surface"
            size="md"
          />
        </section>

        <section className={styles.section} id="pricing" aria-labelledby="pricing-title">
          <div className={styles.sectionHeading}>
            <div className={styles.eyebrow}>Straightforward plans</div>
            <h2 id="pricing-title">Room to grow, at your pace.</h2>
            <p>Start for free. Choose a plan when your team is ready.</p>
          </div>
          <div className={styles.pricingGrid}>
            <PricingDetails
              title="Starter"
              description="A thoughtful home for personal projects."
              price="$0"
              billingPeriod="forever"
              detailsLabel="A good place to begin"
              details={[
                { id: "projects", label: "Projects", value: "3" },
                { id: "members", label: "Members", value: "1" },
              ]}
              features={<FeatureList items={["Unlimited tasks", "Personal planning board"]} />}
              primaryAction={<Button fullWidth shape="pill" variant="secondary" onClick={() => goTo("join")}>Choose Starter</Button>}
              headingLevel={3}
              size="md"
              variant="surface"
            />
            <PricingDetails
              className={styles.featuredPlan}
              eyebrow="Most popular"
              title="Team"
              description="Shared momentum for teams building together."
              price="$12"
              billingPeriod="per member / month"
              detailsLabel="Everything in Starter, plus"
              details={[
                { id: "projects", label: "Projects", value: "Unlimited" },
                { id: "members", label: "Members", value: "Up to 25" },
              ]}
              features={<FeatureList items={["Team workspaces", "Shared goals and notes", "Project insights"]} />}
              primaryAction={<Button fullWidth shape="pill" onClick={() => goTo("join")}>Try Team free</Button>}
              footer="14-day trial · No card required"
              headingLevel={3}
              size="md"
              variant="featured"
            />
            <PricingDetails
              title="Studio"
              description="More control for growing, multi-team work."
              price="$24"
              billingPeriod="per member / month"
              detailsLabel="Everything in Team, plus"
              details={[
                { id: "spaces", label: "Workspaces", value: "Unlimited" },
                { id: "support", label: "Support", value: "Priority" },
              ]}
              features={<FeatureList items={["Advanced permissions", "Portfolio reporting", "Dedicated support"]} />}
              primaryAction={<Button fullWidth shape="pill" variant="secondary" onClick={() => goTo("join")}>Choose Studio</Button>}
              headingLevel={3}
              size="md"
              variant="surface"
            />
          </div>
          <p className={styles.pricingNote}>Prices shown in USD. All plans can be changed or cancelled at any time.</p>
        </section>

        <section className={styles.faqSection} id="faq" aria-labelledby="faq-title">
          <div className={styles.sectionHeading}>
            <div className={styles.eyebrow}>A few good questions</div>
            <h2 id="faq-title">Good to know.</h2>
          </div>
          <div className={styles.faqList}>
            <details>
              <summary>Can we start small?</summary>
              <p>Yes. Start with the free plan and move to a team plan when you need shared spaces and reporting.</p>
            </details>
            <details>
              <summary>Will Orbit replace every tool we use?</summary>
              <p>Orbit gives your projects and decisions a home. Keep the tools your team already relies on and connect them as needed.</p>
            </details>
            <details>
              <summary>Can I change plans later?</summary>
              <p>Yes. You can change or cancel your plan at any time; there is no long-term contract.</p>
            </details>
          </div>
        </section>

        <section className={styles.signup} id="join" aria-labelledby="join-title">
          <div>
            <div className={styles.eyebrow}>A brighter workday starts here</div>
            <h2 id="join-title">Find your team’s orbit.</h2>
            <p>Get product notes and practical ideas for making work feel clearer.</p>
          </div>
          <form className={styles.signupForm} onSubmit={handleSignup}>
            <TextField
              label="Work email"
              type="email"
              name="email"
              placeholder="you@company.com"
              required
            />
            <Button type="submit" shape="pill">Join the list</Button>
            <p className={styles.signupStatus} role="status">{signupMessage}</p>
          </form>
        </section>
      </main>

      <footer className={styles.footer}>
        <a className={styles.footerBrand} href="#top" aria-label="Orbit home"><Brand /></a>
        <span>© 2026 Orbit. Make room for good work.</span>
        <nav aria-label="Footer navigation">
          <a href="#features">Product</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">Questions</a>
        </nav>
      </footer>
    </div>
  );
}

function Brand() {
  return (
    <span className={styles.brand}>
      <span className={styles.brandMark} aria-hidden="true"><SparkleIcon /></span>
      <span>orbit</span>
    </span>
  );
}

function DashboardPreview() {
  return (
    <div className={styles.dashboard} aria-hidden="true">
      <div className={styles.dashboardTop}>
        <div className={styles.dashboardBrand}><span className={styles.dashboardMark}>✳</span> orbit</div>
        <div className={styles.dashboardTopRight}><span>Workspace</span><span className={styles.userAvatar}>MC</span></div>
      </div>
      <div className={styles.dashboardBody}>
        <aside className={styles.dashboardRail}>
          <span className={styles.railActive}>◈ <span>Overview</span></span>
          <span>▦ <span>Projects</span></span>
          <span>◷ <span>Schedule</span></span>
          <span>◇ <span>Notes</span></span>
        </aside>
        <div className={styles.dashboardContent}>
          <div className={styles.dashboardWelcome}>
            <div><small>MONDAY, 9:41 AM</small><h3>Good morning, Maya</h3></div>
            <span className={styles.statusPill}><span /> On track</span>
          </div>
          <div className={styles.progressCard}>
            <div className={styles.progressTitle}><span>Website refresh</span><span>72%</span></div>
            <div className={styles.progressTrack}><span /></div>
            <div className={styles.avatarStack}><span>MC</span><span>JR</span><span>+2</span></div>
          </div>
          <div className={styles.dashboardBottom}>
            <div className={styles.miniCard}><small>THIS WEEK</small><strong>12 tasks</strong><span>3 completed today</span></div>
            <div className={styles.miniCard}><small>TEAM FOCUS</small><strong>Design review</strong><span>Today at 2:00 PM</span></div>
          </div>
        </div>
      </div>
      <span className={styles.orbitDecoration} />
    </div>
  );
}

function FeatureArtwork({ kind }: { kind: "focus" | "flow" | "space" }) {
  const labels = {
    focus: ["Launch outline", "Review customer notes", "Share next steps"],
    flow: ["Product", "Design", "Research"],
    space: ["Plan", "Build", "Reflect"],
  };

  return (
    <div className={`${styles.featureArtwork} ${styles[`artwork_${kind}`]}`} aria-hidden="true">
      {kind === "focus" ? (
        <ul>{labels.focus.map((label, index) => <li key={label}><span>{index === 0 ? "✓" : ""}</span>{label}</li>)}</ul>
      ) : kind === "flow" ? (
        <div className={styles.flowCards}>{labels.flow.map((label, index) => <span key={label} data-index={index}>{label}<i /></span>)}</div>
      ) : (
        <div className={styles.orbitCards}>{labels.space.map((label, index) => <span key={label} data-index={index}>{label}</span>)}</div>
      )}
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className={styles.featureList}>
      {items.map((item) => <li key={item}><CheckIcon />{item}</li>)}
    </ul>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5 14.2 9.8 21.5 12l-7.3 2.2L12 21.5l-2.2-7.3L2.5 12l7.3-2.2L12 2.5Z" fill="currentColor" />
      <path d="m19 2 .8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8L19 2Z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.actionArrow}>
      <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
