---
name: marketing-website
description: >-
  Plan, design, build, improve, or audit polished, accessible, mobile-first,
  responsive marketing websites and landing pages in Replit. Use for business
  websites, homepages, product/service pages, lead-generation pages, portfolios,
  promotional campaigns, and public-facing site redesigns. Coordinates content
  strategy, visual design, responsive implementation, WCAG accessibility,
  performance, SEO, conversion flows, testing, and launch readiness. Do not use
  for internal dashboards, authentication-heavy applications, or component-library
  maintenance alone; combine with a design-system skill when shared components
  or tokens are involved.
---

# Marketing Website Engineer

Build a credible, distinctive marketing website that tells a true story, is easy to use on a phone, and converts appropriate visitors without manipulation. **Content, design, accessibility, engineering, performance, and QA are one deliverable.** A page that merely looks attractive in a single screenshot is incomplete.

## Source-of-truth and agent behavior

1. Read `replit.md`, `AGENTS.md`, package manifests, existing routes, the current design system, site content, and tests before changing code. Respect project instructions, existing stack, available assets, and the explicit user brief. Preserve working features and avoid unrelated refactors.
2. Use this skill for marketing-site concerns. If the site consumes an existing design system, invoke its own skill as well and treat its public APIs/tokens as authoritative. Do not rewrite or bypass that library.
3. Read the relevant reference for the task: [site brief and copy](references/site-brief-and-copy.md), [accessibility and responsive design](references/accessibility-responsive.md), [implementation and QA](references/implementation-and-qa.md), [performance and SEO](references/performance-seo.md), and [research sources](references/research-sources.md).
4. Discover and use actual project commands. Never invent a passing test, Lighthouse score, production URL, published change, analytics event, or verification result.
5. Work end-to-end on the scoped request. Make reasonable, reversible design decisions when inputs are incomplete; flag content or features that require owner-supplied evidence, credentials, destination URLs, legal review, or real business data. Do not fill these with fabricated claims.

## Definition of success

- Within the first viewport, the intended visitor can understand **who this is for**, **what is offered**, **why it matters**, and **what to do next**.
- The primary task works without a mouse; the site remains usable at narrow widths, large text/zoom, reduced motion, and keyboard navigation.
- The result looks deliberately art-directed at mobile, tablet, and desktop sizes, not like a desktop layout squeezed smaller.
- Pages load efficiently and expose important content, navigation, and metadata in crawlable HTML.
- Contact and conversion flows actually work or are explicitly identified as unconnected; no fake social proof or false functionality.
- The final report identifies files changed, visual/behavioral checks performed, measured results, remaining risks, and any placeholders.

## Workflow: apply in this order

### 1. Discover and write a compact brief

Inspect the codebase and existing brand first. Capture the minimum viable brief before designing:

- Business/product, audience, primary user problem, differentiator, geographic/service coverage, and tone.
- **One primary conversion** (call, contact form, booking, purchase, sign-up, etc.), its actual destination/action, and any secondary conversion.
- Available proof (genuine reviews, real projects, quantified results with source, credentials), media, logos, policies, and required pages.
- Constraints: site stack, existing components/tokens, CMS/editability, domain/hosting, localization, accessibility needs, forms, analytics, privacy requirements.

If details are missing, proceed with truthful, clearly labeled draft copy and a minimal coherent page structure; ask only a genuinely blocking question (for example, where real inquiries should be delivered). Do not misrepresent invented text or sample data as live business facts. See [brief template](references/site-brief-and-copy.md).

### 2. Structure content before styling

Build a mobile reading order and a page outline: header → focused hero (specific H1, supporting benefit, primary CTA, purposeful visual) → problem/value → offerings or benefits → process/differentiation → **verified** evidence → FAQs or objections if justified → final CTA → useful footer. This is a starting pattern, not a requirement to add every section.

Every section needs a job. Prefer concrete, human language, concise headings, scannable paragraphs, honest claims, and descriptive CTAs (`Get a quote`, `See recent projects`) instead of vague or repetitive prose. Make the next step easy to find but do not repeat banners, urgency, popups, or animations that compete with reading. Real testimonials/logos/results require provenance or must be omitted.

### 3. Set a distinctive yet systematic visual direction

Define a short creative direction before implementation: visual personality, typographic hierarchy, content/container widths, spacing rhythm, imagery treatment, color roles, surface treatment, elevation, and motion restraint. Make the brand feel intentional. Avoid generic gradients, arbitrary decorative shapes, inconsistent card styles, emoji-as-icons, and copied reference sites unless specifically requested.

Prefer the existing design-system tokens/components; otherwise use a small, coherent set of CSS custom properties for typography, colors, space, radius, and focus. Use semantic roles, not scattered hex colors and magic numbers. Ensure design contrast in every visual state. Use real or appropriately licensed assets; do not invent brands, photos, before/after results, or endorsements. For imagery, document origin/usage rights if relevant.

### 4. Implement **mobile first**

Start with logical semantic HTML and a comfortable single-column small-screen layout, then enhance at content-driven breakpoints with CSS Grid/Flexbox, `minmax()`, `clamp()`, logical properties, and fluid containers. Responsive requirements:

- Readable starting sizes and line lengths; no clipped H1s, cut-off CTAs, horizontal page scrolling, fixed-height text containers, or layout trapped by absolute positioning.
- Functional navigation with one accessible content tree, visible focus, sensible collapse behavior, no hover-only actions, and no unnecessary overlay dependencies.
- Relative sizing where appropriate; accommodate text resizing, different languages, long words, device safe areas, portrait/landscape, and 200–400% zoom/reflow.
- Images/videos retain intrinsic proportion, avoid shifts, and serve appropriately sized assets; choose portrait/wide crops intentionally rather than distorting them.
- Test at widths around **320, 360–390, 768, 1024, and 1440px** plus fluid intermediate widths. These are review samples, not breakpoints to blindly hardcode.

See the [responsive QA matrix](references/accessibility-responsive.md).

### 5. Build accessible interaction by default

Target **WCAG 2.2 Level AA** as the engineering goal, without claiming conformance from an automated scan alone. Favor native `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<button>`, `<a>`, and form controls. Use one meaningful H1 and consistent headings. Provide a skip link, accessible navigation name, descriptive links, keyboard operation, focus indication, visible labels, useful validation errors, and appropriate image alt text (`alt=""` for purely decorative images). Avoid ARIA when native HTML suffices.

Meet text contrast (normally ≥4.5:1, ≥3:1 for qualifying large text), non-text contrast where required (≥3:1), minimum AA target size/spacing, focus visibility, and no keyboard traps. Prefer generous ~44–48px primary touch targets as a design choice; WCAG 2.2 AA's Target Size (Minimum) success criterion has a 24×24 CSS px threshold with exceptions. Honor reduced-motion/forced-colors preferences and avoid autoplay or distracting motion. See [accessibility rules](references/accessibility-responsive.md).

### 6. Make conversion flows real and respectful

- Buttons must navigate, submit, dial, email, or do their declared action. If backend wiring is missing, say so; do not pretend the form succeeds.
- Forms need labels, required/optional indicators, specific inline errors, keyboard access, loading/success/error states, server-side validation, spam/abuse safeguards when deployed, and accessible status feedback.
- Collect only information necessary for the request; avoid adding trackers or consent systems without a decision about local law, business purpose, and privacy requirements. No dark patterns or false scarcity.
- Contact information, pricing, hours, addresses, maps, guarantees, credentials, and ratings must be supplied or verified. No invented operational details.

### 7. Implement SEO and performance as architecture

Prefer meaningful page content and internal links in initial HTML using static generation or server rendering when practical. **Do not migrate a working site to a new framework without user authorization.** For a new mostly static content site, a static-first architecture (e.g. Astro) can be considered; React can still be used where needed. Avoid hydration for purely presentational content.

Each indexable page needs a descriptive title, meta description, canonical URL where known, sensible headings, crawlable `<a href>`, descriptive routes, correct HTTP status, meaningful image alt text, and appropriate social metadata. Generate a sitemap and robots rules when deployment URLs and indexing requirements are known. Use structured data only for genuine, visibly supported facts, with valid schema. Do not promise rankings.

Optimize critical image discovery, image dimensions, responsive formats, font loading, CSS, and third-party scripts. Never lazy-load the likely LCP/hero image; lazy-load appropriate offscreen images. Aim for field Core Web Vitals at p75: **LCP ≤2.5s, INP ≤200ms, CLS ≤0.1**. These are field targets, **not scores the agent may claim without measurement**. See [performance and SEO](references/performance-seo.md).

### 8. Inspect the rendered result and test real tasks

**Do not stop at code compilation.** Start the website and inspect it in a browser if browser tools are available. At a minimum assess: first viewport, long-page rhythm, real text wrapping, nav/menu, links, forms, keyboard order, visible focus, mobile overflow, responsive images, dark/light/theme contexts where relevant, content accuracy, and page/footer completeness.

Run existing typecheck/lint/tests/build commands, then add or execute appropriate Playwright accessibility (`@axe-core/playwright`) and behavior checks, visual screenshots, and Lighthouse or Lighthouse CI checks if available/approved. Accessibility automation is **partial**: also manually test keyboard and zoom/reflow. Do not silently skip a requested test. Fix major defects and rerun relevant checks. Do not update visual baselines without reviewing the diff.

### 9. Delivery note

Report concisely:

1. Business goal, primary CTA, routes delivered, and notable design choices.
2. New/reused components and any token/design-system changes.
3. Exact checks run and their **actual** pass/fail results; devices/viewport sizes manually inspected; performance numbers only if measured.
4. Items requiring owner action: real imagery/claims, form destination, domain/canonical, policy language, analytics configuration, deployment/monitoring.
5. High-priority follow-ups, not a generic long wishlist.

## Integration with `DanJFletcher/react-design-system` (when it is present)

This is optional and **only applies if the target project actually uses that repository or its built package**. Read `lib/design-system/CONTRIBUTING.md` before even planning changes to that package, then `AGENTS.md`, `docs/design-system.md`, and `README.md`. The system uses React/TypeScript, CSS Modules, public `--ds-*` semantic tokens and registered hooks, Storybook, and ACME/Luna/Orchid/Atom/Sublime theme sheets. Read public component docs and inspect the component catalog before implementing custom controls. Import public package exports and theme/style assets as documented; do not reach into private component paths.

- For local workspace apps, install/consume `@workspace/design-system` according to its README. Prefer public layout, typography, media, form, and marketing compositions where their APIs fit the content.
- Use `--ds-color-*`, spacing/typography/radius roles and documented component hooks; general content surfaces use `--ds-radius-surface` by default. Avoid duplicating public primitives or overriding private CSS module classes.
- Respect `data-ds-theme`, nested boundaries, independent state colors, and the documented Vite breakpoint-media plugin when applicable.
- A website-specific composition belongs in the consuming app unless it is demonstrably reusable and the user authorizes a shared-library change. If editing the shared library, follow its contribution contract and run its full `pnpm --filter @workspace/design-system run check` when feasible.
- **Never hand-edit** `lib/design-system/src/generated/` or assume older docs with only three themes remain current.

## Final guardrails

Never ship fabricated testimonials, logos, customer counts, awards, or case studies; never claim WCAG conformance, high performance, legal compliance, or successful lead delivery without evidence. Never replace the established stack/design system just because another tool is fashionable. Prioritize working functionality, credible content, and the real mobile experience over ornamental complexity.
