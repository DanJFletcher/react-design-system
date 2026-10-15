import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../index";
import styles from "./MovingCompany.module.css";

const navItems = [
  { label: "Our approach", id: "approach" },
  { label: "How it works", id: "process" },
  { label: "Neighborhoods", id: "neighborhoods" },
  { label: "Questions", id: "questions" },
] as const;

const meta = {
  title: "Examples/Moving Company",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A one-page neighborhood moving company site with accessible, intersection-triggered section reveals and reduced-motion support.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Northstar: Story = {
  render: () => <MovingCompany />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const site = canvas.getByTestId("moving-company-site");
    const reveal = canvas.getByTestId("moving-company-process-reveal");
    await new Promise((resolve) => window.setTimeout(resolve, 50));
    await expect(site).toHaveAttribute("data-motion-ready", "true");
    reveal.scrollIntoView({ behavior: "instant", block: "center" });
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    await expect(reveal).toHaveAttribute("data-visible", "true");
    canvasElement.ownerDocument.defaultView?.scrollTo({ top: 0, behavior: "instant" });
  },
};

export const ReducedMotion: Story = {
  globals: { motion: "reduced" },
  render: () => <MovingCompany />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const site = canvas.getByTestId("moving-company-site");
    const reveal = canvas.getByTestId("moving-company-process-reveal");
    await new Promise((resolve) => window.setTimeout(resolve, 50));
    await expect(document.documentElement).toHaveAttribute("data-ds-motion-preference", "reduced");
    await expect(site).not.toHaveAttribute("data-motion-ready", "true");
    await expect(getComputedStyle(reveal).opacity).toBe("1");
  },
};

function MovingCompany() {
  const siteRef = useRef<HTMLDivElement>(null);
  const [demoMessage, setDemoMessage] = useState("");

  useEffect(() => {
    const site = siteRef.current;
    if (!site) return;
    const targets = Array.from(site.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!targets.length) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const syncMotion = () => {
      const preference = document.documentElement.getAttribute("data-ds-motion-preference");
      const reduceMotion = preference === "reduced" || (preference !== "full" && motionQuery.matches);
      if (reduceMotion || !("IntersectionObserver" in window)) {
        observer?.disconnect();
        observer = undefined;
        site.removeAttribute("data-motion-ready");
        targets.forEach((target) => target.removeAttribute("data-visible"));
        return;
      }
      if (observer) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.setAttribute("data-visible", "true");
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -48px 0px" },
      );

      site.setAttribute("data-motion-ready", "true");
      targets.forEach((target) => {
        if (target.getAttribute("data-visible") !== "true") observer?.observe(target);
      });
    };

    syncMotion();
    motionQuery.addEventListener("change", syncMotion);
    const preferenceObserver = new MutationObserver(syncMotion);
    preferenceObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-ds-motion-preference"],
    });
    return () => {
      observer?.disconnect();
      motionQuery.removeEventListener("change", syncMotion);
      preferenceObserver.disconnect();
      site.removeAttribute("data-motion-ready");
    };
  }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const handleEstimate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDemoMessage("Thanks for stopping by. This demo does not send or save your details.");
  };

  return (
    <div className={styles.site} id="top" ref={siteRef} data-testid="moving-company-site">
      <div className={styles.topline}>
        <span>Independent movers, rooted in the neighborhood</span>
        <a href="tel:+14155550148" data-testid="link-call-top">Talk to a real person <span aria-hidden="true">↗</span> (415) 555-0148</a>
      </div>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" data-testid="link-home">
          <NorthstarMark />
          <span>northstar<small>moving co.</small></span>
        </a>
        <nav className={styles.nav} aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} data-testid={`link-nav-${item.id}`}>{item.label}</a>
          ))}
        </nav>
        <Button className={styles.headerCta} size="sm" shape="pill" onClick={() => goTo("estimate")}>
          Plan your move <ArrowIcon />
        </Button>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}><span className={styles.kickerDot} /> San Francisco & the East Bay</p>
            <h1 id="hero-title">A good move<br />starts with <em>care.</em></h1>
            <p className={styles.heroLead}>The people, the plan, the little things you’d rather not leave to chance. We bring all of it with us.</p>
            <div className={styles.heroActions}>
              <Button shape="pill" onClick={() => goTo("estimate")}>Get a clear estimate <ArrowIcon /></Button>
              <a className={styles.textLink} href="#approach">See how we move <span aria-hidden="true">↓</span></a>
            </div>
            <div className={styles.heroNote}>
              <div className={styles.avatarStack} aria-hidden="true"><span>JM</span><span>AL</span><span>TK</span></div>
              <p><strong>Good people. Careful hands.</strong><br />Local crews, every single move.</p>
            </div>
          </div>
          <div className={styles.heroArt} aria-label="Illustration of a Northstar moving truck arriving at a home">
            <div className={styles.artSun} />
            <span className={styles.artLabel}>A little more settled.</span>
            <MovingIllustration />
            <div className={styles.artCaption}><span>01 / 04</span><span>Home, with a little help.</span></div>
          </div>
          <a className={styles.scrollCue} href="#approach"><span /> Keep going</a>
        </section>

        <section className={styles.proof} aria-label="Northstar at a glance" data-reveal>
          <div className={styles.proofLead}>Small enough to know your name.<br /><em>Ready for the whole move.</em></div>
          <div className={styles.proofMetric}><strong>12</strong><span>years on these streets</span></div>
          <div className={styles.proofMetric}><strong>4.9<span>/5</span></strong><span>from 380+ local reviews</span></div>
          <div className={styles.proofMetric}><strong>1,842</strong><span>moves made a little easier</span></div>
        </section>

        <section className={styles.approach} id="approach" aria-labelledby="approach-title">
          <div className={styles.sectionIntro} data-reveal>
            <p className={styles.eyebrow}>The Northstar difference / 01</p>
            <h2 id="approach-title">Moving is personal.<br /><em>We act like it.</em></h2>
            <p>We’re not here to rush boxes from A to B. We’re here to help you feel at home at the other end.</p>
          </div>
          <div className={styles.careList}>
            <article className={styles.careItem} data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
              <span className={styles.itemNumber}>01</span>
              <div><h3>People you can count on</h3><p>Our movers are a steady, close-knit crew—not whoever happens to be available that day. You’ll know who’s coming, and when.</p></div>
              <span className={styles.itemMark} aria-hidden="true"><HandIcon /></span>
            </article>
            <article className={styles.careItem} data-reveal style={{ "--reveal-delay": "150ms" } as CSSProperties}>
              <span className={styles.itemNumber}>02</span>
              <div><h3>A plan without the guesswork</h3><p>Clear pricing, a real arrival window, and a point person who picks up. We talk through the details before moving day.</p></div>
              <span className={styles.itemMark} aria-hidden="true"><PlanIcon /></span>
            </article>
            <article className={styles.careItem} data-reveal style={{ "--reveal-delay": "220ms" } as CSSProperties}>
              <span className={styles.itemNumber}>03</span>
              <div><h3>Care where it counts</h3><p>Doorways covered. Favorite chair wrapped properly. The last box placed in the right room. We notice the things that make it yours.</p></div>
              <span className={styles.itemMark} aria-hidden="true"><CareIcon /></span>
            </article>
          </div>
        </section>

        <section className={styles.serviceBand} aria-labelledby="service-title" data-reveal>
          <div className={styles.serviceHeading}>
            <p className={styles.eyebrow}>Right-sized help / 02</p>
            <h2 id="service-title">Your move.<br /><em>Your kind of help.</em></h2>
          </div>
          <div className={styles.serviceGrid}>
            <article className={styles.serviceCard} data-reveal style={{ "--reveal-delay": "60ms" } as CSSProperties}>
              <span className={styles.serviceGlyph}><HomeIcon /></span>
              <p className={styles.serviceIndex}>01 — For home</p>
              <h3>Room to room, block to block.</h3>
              <p>Apartment stairs, a family home, one precious piano. We plan around your place and the life inside it.</p>
              <a href="#estimate" onClick={(event) => { event.preventDefault(); goTo("estimate"); }}>Make home the priority <ArrowIcon /></a>
            </article>
            <article className={styles.serviceCard} data-reveal style={{ "--reveal-delay": "130ms" } as CSSProperties}>
              <span className={styles.serviceGlyph}><DeskIcon /></span>
              <p className={styles.serviceIndex}>02 — For work</p>
              <h3>Back to business, sooner.</h3>
              <p>Small offices, shops, and studios moved on a schedule that respects your team and your customers.</p>
              <a href="#estimate" onClick={(event) => { event.preventDefault(); goTo("estimate"); }}>Keep work in motion <ArrowIcon /></a>
            </article>
            <div className={styles.serviceAside} data-reveal style={{ "--reveal-delay": "200ms" } as CSSProperties}>
              <span className={styles.quoteGlyph} aria-hidden="true">“</span>
              <blockquote>They treated our place like it was their own. That’s the whole review, really.</blockquote>
              <p><strong>Leah R.</strong><span>Moved from Alameda to Oakland</span></p>
              <div className={styles.stars} aria-label="Five out of five stars">★★★★★</div>
            </div>
          </div>
        </section>

        <section className={styles.process} id="process" aria-labelledby="process-title">
          <div className={styles.processHeading} data-reveal data-testid="moving-company-process-reveal">
            <p className={styles.eyebrow}>No surprises / 03</p>
            <h2 id="process-title">A simpler way<br /><em>from here to there.</em></h2>
            <a className={styles.textLink} href="#estimate">Start with a conversation <span aria-hidden="true">↗</span></a>
          </div>
          <ol className={styles.steps}>
            <li data-reveal style={{ "--reveal-delay": "50ms" } as CSSProperties}>
              <span className={styles.stepNo}>01</span><span className={styles.stepRule} />
              <div><h3>Tell us what’s ahead</h3><p>Share a few details by phone or online. We’ll ask the useful questions, not the pushy ones.</p></div>
            </li>
            <li data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
              <span className={styles.stepNo}>02</span><span className={styles.stepRule} />
              <div><h3>Get a plan you can trust</h3><p>Your written estimate spells out what’s included, what it costs, and what happens next.</p></div>
            </li>
            <li data-reveal style={{ "--reveal-delay": "190ms" } as CSSProperties}>
              <span className={styles.stepNo}>03</span><span className={styles.stepRule} />
              <div><h3>Settle into what’s next</h3><p>We show up ready, take good care, and don’t call it done until you feel at home.</p></div>
            </li>
          </ol>
          <div className={styles.processStamp} aria-hidden="true"><NorthstarMark /><span>Here for<br />the handoff.</span></div>
        </section>

        <section className={styles.neighborhoods} id="neighborhoods" aria-labelledby="neighborhood-title">
          <div className={styles.neighborhoodIntro} data-reveal>
            <p className={styles.eyebrow}>Close to home / 04</p>
            <h2 id="neighborhood-title">We know the<br /><em>way around.</em></h2>
            <p>From the first hill to the last loading zone, these are the places we call home too.</p>
            <a className={styles.phoneLink} href="tel:+14155550148">Ask about your neighborhood <ArrowIcon /></a>
          </div>
          <div className={styles.mapPanel} data-reveal>
            <NeighborhoodMap />
            <div className={styles.mapTag}><span /> Our everyday radius</div>
            <div className={`${styles.mapLabel} ${styles.mapSanFran}`}>San Francisco</div>
            <div className={`${styles.mapLabel} ${styles.mapOakland}`}>Oakland</div>
            <div className={`${styles.mapLabel} ${styles.mapBerkeley}`}>Berkeley</div>
          </div>
          <p className={styles.neighborhoodFoot} data-reveal>And the little towns and winding roads in between. <a href="#estimate">Not sure if we reach you? Ask us.</a></p>
        </section>

        <section className={styles.testimonial} aria-label="A note from a Northstar customer" data-reveal>
          <div className={styles.testimonialMark}>N / <span>05</span></div>
          <div className={styles.testimonialQuote}>
            <p className={styles.eyebrow}>A note from moving day</p>
            <blockquote>“They made a stressful day feel like a day we could actually handle.”</blockquote>
            <div className={styles.testimonialByline}><span className={styles.bylineMark}>AR</span><span><strong>Andrea & Robin</strong><small>Bernal Heights to Alameda · May 2025</small></span></div>
          </div>
          <div className={styles.testimonialAside}><div className={styles.stars} aria-label="Five out of five stars">★★★★★</div><p>“Nothing was too much trouble. They even helped us figure out where the couch would fit before they carried it in.”</p><span>— Robin, verified local review</span></div>
        </section>

        <section className={styles.faq} id="questions" aria-labelledby="faq-title">
          <div className={styles.faqHeading} data-reveal>
            <p className={styles.eyebrow}>Good to know / 06</p>
            <h2 id="faq-title">The small print,<br /><em>made simple.</em></h2>
            <p>Still have a question? We’re good at those too.</p>
            <a href="tel:+14155550148" className={styles.faqCall}>Call (415) 555-0148 <ArrowIcon /></a>
          </div>
          <div className={styles.faqList}>
            <details data-reveal>
              <summary>How do you price a move?<span aria-hidden="true">+</span></summary>
              <p>We look at the size of your move, access at both places, and any special handling. You’ll get a written estimate before booking, with no mystery fees added on moving day.</p>
            </details>
            <details data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
              <summary>Do you bring boxes and packing supplies?<span aria-hidden="true">+</span></summary>
              <p>Yes. We can bring sturdy boxes and supplies, pack the whole place, or just take care of the fragile things. We’ll tailor it to what would make your week easier.</p>
            </details>
            <details data-reveal style={{ "--reveal-delay": "160ms" } as CSSProperties}>
              <summary>What if my dates aren’t settled yet?<span aria-hidden="true">+</span></summary>
              <p>That’s completely normal. Tell us what you know so far and we’ll talk through timing options without asking you to commit before you’re ready.</p>
            </details>
          </div>
        </section>

        <section className={styles.estimate} id="estimate" aria-labelledby="estimate-title">
          <div className={styles.estimateCopy} data-reveal>
            <p className={styles.eyebrow}>One good next step / 07</p>
            <h2 id="estimate-title">Let’s make<br /><em>your move easier.</em></h2>
            <p>A few details are enough to get the conversation started. We’ll take it from there—like actual people.</p>
            <div className={styles.contactAside}><span className={styles.contactIcon}><PhoneIcon /></span><span><small>Rather talk it through?</small><a href="tel:+14155550148">(415) 555-0148</a></span><span className={styles.hours}>Mon–Sat<br />8am–6pm</span></div>
          </div>
          <form className={styles.estimateForm} onSubmit={handleEstimate} data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            <p className={styles.formLabel}>A quick introduction</p>
            <div className={styles.formRow}>
              <label>Your name<input name="name" autoComplete="name" placeholder="First and last" required data-testid="input-name" /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required data-testid="input-email" /></label>
            </div>
            <div className={styles.formRow}>
              <label>Moving from<input name="origin" placeholder="Neighborhood or ZIP" required data-testid="input-origin" /></label>
              <label>Moving to<input name="destination" placeholder="Neighborhood or ZIP" required data-testid="input-destination" /></label>
            </div>
            <label>When are you thinking?<select name="timing" defaultValue="" required data-testid="select-timing"><option value="" disabled>Choose a timeframe</option><option>Within 2 weeks</option><option>2–6 weeks</option><option>More than 6 weeks</option><option>Still figuring it out</option></select></label>
            <Button type="submit" shape="pill" className={styles.submitButton}>Start a conversation <ArrowIcon /></Button>
            <p className={styles.formNote}>Frontend demo only. This form doesn’t send or store personal information.</p>
            <p className={styles.formStatus} role="status" aria-live="polite" data-testid="status-estimate">{demoMessage}</p>
          </form>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <a className={`${styles.brand} ${styles.footerBrand}`} href="#top"><NorthstarMark /><span>northstar<small>moving co.</small></span></a>
          <p>Careful moves. Clear expectations.<br />A little more settled, wherever you land.</p>
          <a className={styles.footerPhone} href="tel:+14155550148">(415) 555-0148 <ArrowIcon /></a>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 Northstar Moving Co. Made for moving onward.</span>
          <div><a href="#approach">Our approach</a><a href="#neighborhoods">Where we go</a><a href="#estimate">Get an estimate</a><a href="#top">Back to top ↑</a></div>
        </div>
      </footer>
    </div>
  );
}

function NorthstarMark() {
  return <svg className={styles.northstarMark} viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 2.8 23.3 16.7 37.2 20l-13.9 3.3L20 37.2l-3.3-13.9L2.8 20l13.9-3.3L20 2.8Z" fill="currentColor"/><circle cx="20" cy="20" r="3.1" fill="var(--northstar-paper)"/></svg>;
}

function MovingIllustration() {
  return (
    <svg className={styles.truckScene} viewBox="0 0 700 510" role="img" aria-labelledby="truck-scene-title">
      <title id="truck-scene-title">A Northstar truck parked outside a warm, welcoming home</title>
      <path d="M47 408h610" stroke="#59736a" strokeWidth="3" strokeLinecap="round"/>
      <path d="M438 408V179l87-56 87 56v229" fill="#e7bd8c" stroke="#344b43" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M421 184 525 113l104 71" fill="none" stroke="#344b43" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M507 408V285h66v123" fill="#d99867" stroke="#344b43" strokeWidth="3"/>
      <circle cx="559" cy="347" r="3" fill="#344b43"/>
      <rect x="458" y="207" width="39" height="39" rx="2" fill="#f2e7d3" stroke="#344b43" strokeWidth="2"/>
      <path d="M477.5 207v39m-19-19.5h39" stroke="#344b43" strokeWidth="2"/>
      <rect x="574" y="207" width="24" height="39" rx="2" fill="#f2e7d3" stroke="#344b43" strokeWidth="2"/>
      <path d="M586 207v39" stroke="#344b43" strokeWidth="2"/>
      <path d="M457 297h28m-28 10h23" stroke="#b47951" strokeWidth="2" strokeLinecap="round"/>
      <path d="M425 408h192" stroke="#344b43" strokeWidth="5" strokeLinecap="round"/>
      <path d="M110 348h338v60H110z" fill="#d35f43" stroke="#344b43" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M448 373h81l35 35H448z" fill="#d35f43" stroke="#344b43" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M470 377h49l20 22h-69z" fill="#bfd3c7" stroke="#344b43" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M458 350h71v16h-71z" fill="#e5ad7e"/>
      <path d="M142 348h2v60h-2zm96 0h2v60h-2zm96 0h2v60h-2z" fill="#f3c59a"/>
      <path d="M225 376c14-17 27-17 40 0" stroke="#f7e7cf" strokeWidth="2" strokeLinecap="round"/>
      <path d="M235 377c6-7 12-7 19 0" stroke="#f7e7cf" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="198" cy="410" r="25" fill="#314941"/><circle cx="198" cy="410" r="11" fill="#e6ddc9"/><circle cx="495" cy="410" r="25" fill="#314941"/><circle cx="495" cy="410" r="11" fill="#e6ddc9"/>
      <path d="M73 408c4-24 15-42 35-44 20-3 33 15 34 44m-67 0h69" fill="#91a48e" stroke="#59736a" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M83 367c-8-14 0-26 12-27 3-13 19-16 28-7 15-2 23 12 17 24" fill="#91a48e" stroke="#59736a" strokeWidth="3"/>
      <path d="M624 408c0-19 7-33 19-35 12-1 20 12 20 35m-39 0h40" fill="#91a48e" stroke="#59736a" strokeWidth="3"/>
      <path d="M99 322c-16-15-17-34-7-44 12-12 31-5 37 12 16-4 27 8 24 21-3 15-26 23-54 11Z" fill="#c8a16c"/>
      <path d="M111 330c8-11 13-20 18-35" stroke="#59736a" strokeWidth="2"/>
      <path d="M170 318v30m-12-23 12 9 12-9" stroke="#344b43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M160 315h21v-14h-21z" fill="#f2e7d3" stroke="#344b43" strokeWidth="2"/>
      <path d="M179 315h9m-9-6h9m-9 12h9" stroke="#344b43" strokeWidth="2" strokeLinecap="round"/>
      <path d="M301 297c0-14 11-25 25-25 5-15 23-21 36-11 14-7 31 0 34 15 16 2 22 18 15 31h-99c-7-2-11-5-11-10Z" fill="#efe3cd"/>
      <path d="M331 270v-20m20 18v-28m21 34v-17" stroke="#d35f43" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="331" cy="247" r="4" fill="#d35f43"/><circle cx="351" cy="235" r="4" fill="#d35f43"/><circle cx="372" cy="251" r="4" fill="#d35f43"/>
      <path d="M542 105v-31" stroke="#344b43" strokeWidth="3" strokeLinecap="round"/>
      <path d="M541 75c-12-9-24 2-19 12 6 9 17 7 19-12Zm3 1c13-9 24 2 19 12-6 9-17 7-19-12Z" fill="#91a48e"/>
    </svg>
  );
}

function NeighborhoodMap() {
  return (
    <svg className={styles.mapSvg} viewBox="0 0 680 380" role="img" aria-labelledby="map-title">
      <title id="map-title">Stylized map showing Northstar's service area around San Francisco Bay</title>
      <path d="M0 66 680 0v380H0z" fill="#e9e4d6"/>
      <path d="M0 150c98-21 159-16 225 11 49 20 89 15 127-5 48-25 77-21 132 5 52 25 113 24 196 6v57c-76 17-135 22-198-3-57-23-82-26-124-3-52 28-112 34-168 7C125 197 71 195 0 214z" fill="#b9d0c9"/>
      <path d="M0 145c79-18 142-13 207 10m323 31c49 21 89 20 150 7" fill="none" stroke="#86a89e" strokeWidth="2" strokeDasharray="5 8"/>
      <g fill="none" stroke="#c7beac" strokeWidth="2">
        <path d="m32 28 84 350M106 21l83 357M185 15l-32 365M272 10 222 376M355 11l-27 369M454 8l-31 372M552 6l-28 374M621 16l-16 364"/>
        <path d="m8 91 650-67M9 261l664-55M2 322l675-62M0 365l680-67"/>
      </g>
      <path d="M196 188c80-48 150-39 219 1 38 22 67 29 111 26" fill="none" stroke="#d35f43" strokeWidth="4" strokeLinecap="round" strokeDasharray="7 7"/>
      <path d="M269 157c27 25 29 55 8 77" fill="none" stroke="#d35f43" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="198" cy="189" r="9" fill="#d35f43" stroke="#f5f0e6" strokeWidth="5"/>
      <circle cx="527" cy="214" r="9" fill="#d35f43" stroke="#f5f0e6" strokeWidth="5"/>
      <circle cx="269" cy="157" r="7" fill="#344b43" stroke="#f5f0e6" strokeWidth="4"/>
      <path d="M477 180c0-8 7-15 15-15s15 7 15 15c0 11-15 24-15 24s-15-13-15-24Z" fill="#91a48e"/>
      <circle cx="492" cy="179" r="4" fill="#f5f0e6"/>
    </svg>
  );
}

function ArrowIcon() {
  return <svg className={styles.arrowIcon} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function HandIcon() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M12 20v-6a2 2 0 0 1 4 0v5-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v7-4a2 2 0 0 1 4 0v8c0 6-4 10-10 10h-1c-4 0-6-2-8-5l-4-6a2 2 0 0 1 3-3l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function PlanIcon() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="9" y="8" width="22" height="26" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M15 15h10M15 21h10M15 27h6M13 5v6m14-6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

function CareIcon() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 34S7 27 7 17c0-5 3-8 8-8 3 0 5 2 5 4 0-2 2-4 5-4 5 0 8 3 8 8 0 10-13 17-13 17Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 20h5l2-4 4 9 2-5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function HomeIcon() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m4 14 12-9 12 9v13H4V14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M12 27V18h8v9m-5-19v3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
}

function DeskIcon() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 9h22v11H5zM9 20v7m14-7v7M5 24h22M10 13h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h3l2 5-2.5 1.8a15 15 0 0 0 4.7 4.7L16 12l5 2v3c0 1.1-.9 2-2 2C10.7 19 5 13.3 5 5c0-1.1.9-2 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
